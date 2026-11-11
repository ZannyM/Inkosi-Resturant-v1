import test from "node:test";
import assert from "node:assert/strict";
import { applyCartOperation } from "../utils/cartOperations.js";

const mergeId = "123e4567-e89b-42d3-a456-426614174000";
const entry = (quantity, notes = "") => ({ itemId: "food", quantity, addOns: [{ name: "Cheese", price: 5 }], spiceLevel: "hot", notes, unitPrice: 25 });
const empty = () => ({ cartData: {}, savedData: {}, mergeIds: [] });

test("merge retains custom lines, combines matching quantities, and is idempotent", () => {
    const state = { cartData: { hot: entry(2) }, savedData: { plain: 2 }, mergeIds: [] };
    const operation = { type: "merge", mergeId, cartData: { hot: entry(3), mild: entry(1, "mild") }, savedData: { plain: 3 } };
    const merged = applyCartOperation(state, operation);
    assert.equal(merged.cartData.hot.quantity, 5);
    assert.equal(merged.cartData.mild.notes, "mild");
    assert.equal(merged.savedData.plain, 5);
    assert.deepEqual(applyCartOperation(merged, operation), { ...merged, unchanged: true });
    assert.throws(() => applyCartOperation(merged, { ...operation, savedData: { plain: 4 } }), { status: 409 });
    assert.equal(state.cartData.hot.quantity, 2);
});

test("conflicting customization on the same key is rejected without changing state", () => {
    const state = { ...empty(), cartData: { hot: entry(1) } };
    assert.throws(() => applyCartOperation(state, { type: "merge", mergeId, cartData: { hot: entry(1, "different") }, savedData: {} }), { status: 409 });
    assert.equal(state.cartData.hot.quantity, 1);
});

test("move transfers whole lines in both directions and merges quantities", () => {
    const state = { ...empty(), cartData: { hot: entry(2), plain: 4 }, savedData: { hot: entry(3), plain: 1 } };
    const saved = applyCartOperation(state, { type: "move", key: "hot", to: "saved" });
    assert.equal(saved.savedData.hot.quantity, 5);
    assert.equal(saved.cartData.hot, undefined);
    const cart = applyCartOperation(saved, { type: "move", key: "plain", to: "cart" });
    assert.equal(cart.cartData.plain, 5);
    assert.equal(cart.savedData.plain, undefined);
    assert.equal(applyCartOperation(cart, { type: "savedRemove", key: "hot" }).savedData.hot, undefined);
});

test("legacy numeric entries support add, remove and clear", () => {
    let state = { ...empty(), cartData: { food: 2 } };
    state = applyCartOperation(state, { type: "add", key: "food", entry: { itemId: "food", quantity: 1, addOns: [], spiceLevel: null, notes: "" } });
    assert.equal(state.cartData.food.quantity, 3);
    state = applyCartOperation(state, { type: "remove", key: "food" });
    assert.equal(state.cartData.food.quantity, 2);
    assert.deepEqual(applyCartOperation(state, { type: "clear", key: "food" }).cartData, {});
});

test("rejects unsafe keys, invalid entries, invalid IDs, and quantity overflow", () => {
    for (const key of ["$where", "a.b", "__proto__", "constructor", "a\0b"]) {
        assert.throws(() => applyCartOperation(empty(), { type: "clear", key }), { status: 400 });
    }
    assert.throws(() => applyCartOperation(empty(), { type: "merge", mergeId: "bad", cartData: {}, savedData: {} }), { status: 400 });
    assert.throws(() => applyCartOperation(empty(), { type: "merge", mergeId, cartData: JSON.parse('{"__proto__":1}'), savedData: {} }), { status: 400 });
    assert.throws(() => applyCartOperation(empty(), { type: "add", key: "food", entry: { itemId: "food", quantity: -1 } }), { status: 400 });
    assert.throws(() => applyCartOperation({ ...empty(), cartData: { food: 10000 } }, { type: "merge", mergeId, cartData: { food: 1 }, savedData: {} }), { status: 400 });
    assert.throws(() => applyCartOperation(empty(), { type: "add", key: "food", entry: { itemId: "food", quantity: 1, addOns: [{ name: "x", "$bad": 1 }] } }), { status: 400 });
});

test("matching add-ons merge regardless of selection order and retain stored metadata", () => {
    const first = { itemId: "food", quantity: 1, addOns: [{ name: "Cheese", price: 5, _id: "abc" }, { name: "Sauce", price: 2, _id: "def" }] };
    const second = { itemId: "food", quantity: 2, addOns: [{ name: "Sauce", price: 3, _id: "def" }, { name: "Cheese", price: 5, _id: "abc" }] };
    const state = applyCartOperation({ ...empty(), cartData: { custom: first } }, { type: "merge", mergeId, cartData: { custom: second }, savedData: {} });
    assert.equal(state.cartData.custom.quantity, 3);
    assert.deepEqual(state.cartData.custom.addOns, first.addOns);
});

test("full merge history rejects new merges without discarding guest data", () => {
    const state = { ...empty(), mergeIds: Array.from({ length: 10000 }, (_, index) => String(index)), mergeDigests: Array(10000).fill("digest") };
    assert.throws(() => applyCartOperation(state, { type: "merge", mergeId, cartData: { food: 1 }, savedData: {} }), { status: 409 });
    assert.deepEqual(state.cartData, {});
    assert.equal(state.mergeIds.length, 10000);
});