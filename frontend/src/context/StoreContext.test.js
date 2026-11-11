import { test, after } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";
import React, { act, useContext } from "react";
import { createRoot } from "react-dom/client";
import axios from "axios";
import { createServer } from "vite";

const dom = new JSDOM("<!doctype html><div id='root'></div>", { url: "http://localhost:5173" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.localStorage = dom.window.localStorage;
globalThis.alert = () => {};
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const vite = await createServer({ root: fileURLToPath(new URL("../../", import.meta.url)), server: { middlewareMode: true }, appType: "custom", logLevel: "silent" });
const { StoreContext, default: Provider } = await vite.ssrLoadModule("/src/context/StoreContext.jsx");
const originalGet = axios.get;
const originalPost = axios.post;
after(async () => {
    axios.get = originalGet;
    axios.post = originalPost;
    await vite.close();
    dom.window.close();
});

let context;
const Probe = () => {
    context = useContext(StoreContext);
    return null;
};
const mount = async () => {
    const root = createRoot(document.getElementById("root"));
    await act(async () => { root.render(React.createElement(Provider, null, React.createElement(Probe))); });
    return root;
};
const ok = (data) => ({ data: { success: true, ...data } });
const empty = () => ({ cartData: {}, savedData: {} });

test("normalizes guest keys and retries the same account-bound merge after reload", async () => {
    localStorage.clear();
    const oldKey = `dish__${encodeURIComponent(JSON.stringify({ addOns: [], spiceLevel: null, notes: "extra. sauce" }))}`;
    localStorage.setItem("guestCartItems", JSON.stringify({ [oldKey]: { itemId: "dish", quantity: 2, addOns: [], spiceLevel: null, notes: "extra. sauce" } }));
    let server = empty();
    const attempts = [];
    let fail = true;
    axios.get = async (url) => url.endsWith("/food/list") ? ok({ data: [{ _id: "dish", price: 10, name: "Dish" }] }) : url.endsWith("/user/profile") ? ok({ user: { name: "User" } }) : ok(server);
    axios.post = async (url, body) => {
        assert.ok(url.endsWith("/cart/merge"));
        attempts.push(structuredClone(body));
        if (fail) throw new Error("network unavailable");
        server = { cartData: body.cartData, savedData: body.savedData };
        return ok(server);
    };
    let root = await mount();
    const key = Object.keys(context.cartItems)[0];
    assert.ok(!key.includes("."));
    assert.equal(context.cartItems[key].notes, "extra. sauce");
    await act(async () => { await assert.rejects(context.login("token-a", "a"), /network unavailable/); });
    assert.equal(context.token, "");
    const pending = localStorage.getItem("pendingCartMerge");
    assert.ok(pending);
    await act(async () => { await assert.rejects(context.login("token-b", "b"), /another account/); });
    assert.equal(localStorage.getItem("pendingCartMerge"), pending);
    await act(async () => { root.unmount(); });
    root = await mount();
    fail = false;
    await act(async () => { await context.login("token-a", "a"); });
    assert.deepEqual(attempts[0], attempts[1]);
    assert.equal(context.cartItems[key].quantity, 2);
    assert.equal(localStorage.getItem("pendingCartMerge"), null);
    await act(async () => { root.unmount(); });
    root = await mount();
    assert.equal(context.cartItems[key].quantity, 2);
    assert.equal(attempts.length, 2);
    await act(async () => { context.logout(); });
    assert.deepEqual(context.cartItems, {});
    assert.equal(localStorage.getItem("token"), null);
    assert.equal(server.cartData[key].quantity, 2);
    await act(async () => { root.unmount(); });
});

test("serializes account mutations and ignores a response after logout", async () => {
    localStorage.clear();
    localStorage.setItem("token", "token-a");
    const requests = [];
    axios.get = async (url) => url.endsWith("/food/list") ? ok({ data: [] }) : url.endsWith("/user/profile") ? ok({ user: { name: "User" } }) : ok(empty());
    axios.post = (url, body) => new Promise((resolve) => requests.push({ url, body, resolve }));
    const root = await mount();
    let first;
    let second;
    await act(async () => {
        first = context.addToCart("dish");
        second = context.addToCart("dish");
        await Promise.resolve();
    });
    assert.equal(requests.length, 1);
    const entry = { itemId: "dish", quantity: 1, addOns: [], spiceLevel: null, notes: "", unitPrice: 0 };
    await act(async () => { requests[0].resolve(ok({ cartData: { dish: entry }, savedData: {} })); await first; });
    assert.equal(requests.length, 2);
    await act(async () => { context.logout(); requests[1].resolve(ok({ cartData: { dish: { ...entry, quantity: 2 } }, savedData: {} })); await second; });
    assert.deepEqual(context.cartItems, {});
    assert.equal(context.token, "");
    await act(async () => { root.unmount(); });
});

test("moves and restores guest saved items without losing customization", async () => {
    localStorage.clear();
    axios.get = async () => ok({ data: [{ _id: "dish", name: "Dish", price: 10 }] });
    const root = await mount();
    await act(async () => { await context.addToCart("dish", { notes: "extra. sauce", quantity: 2 }); });
    const key = Object.keys(context.cartItems)[0];
    assert.ok(!key.includes("."));
    await act(async () => { await context.saveForLater(key); });
    assert.equal(context.getSavedDetails()[0].notes, "extra. sauce");
    assert.deepEqual(context.cartItems, {});
    await act(async () => { await context.moveToCart(key); });
    assert.equal(context.getCartDetails()[0].quantity, 2);
    await act(async () => { await context.saveForLater(key); await context.removeSavedItem(key); });
    assert.deepEqual(context.savedItems, {});
    assert.deepEqual(JSON.parse(localStorage.getItem("guestSavedItems")), {});
    await act(async () => { root.unmount(); });
});

test("quarantines an unowned old cache and cancels stale sign-in", async () => {
    localStorage.clear();
    localStorage.setItem("cartItems", JSON.stringify({ dish: 3 }));
    axios.get = async () => ok({ data: [] });
    let posts = 0;
    axios.post = async () => { posts += 1; return ok(empty()); };
    const root = await mount();
    assert.deepEqual(context.cartItems, {});
    const version = context.getSessionVersion();
    await act(async () => { context.logout(); });
    await act(async () => { await assert.rejects(context.login("token-a", "a", version), /cancelled/); });
    assert.equal(posts, 0);
    assert.ok(localStorage.getItem("cartItems"));
    await act(async () => { root.unmount(); });
});