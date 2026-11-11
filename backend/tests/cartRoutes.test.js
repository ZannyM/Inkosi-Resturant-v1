import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import jwt from "jsonwebtoken";
import cartRouter from "../routes/cartRoute.js";
import userModel from "../models/userModel.js";

test("authenticated cart routes return cart and saved state and reject invalid requests", async (context) => {
    const originalFind = userModel.findById;
    const originalUpdate = userModel.findOneAndUpdate;
    const originalSecret = process.env.JWT_SECRET;
    process.env.JWT_SECRET = "cart-route-test-secret";
    let user = { cartData: {}, savedData: {} };
    userModel.findById = () => ({ select: () => ({ lean: async () => structuredClone(user) }) });
    userModel.findOneAndUpdate = (filter, update) => ({ lean: async () => {
        const matches = filter.cartRevision?.$exists === false ? user.cartRevision === undefined : filter.cartRevision === user.cartRevision;
        if (!matches) return null;
        user = { ...user, ...structuredClone(update.$set), cartRevision: (user.cartRevision ?? 0) + update.$inc.cartRevision };
        return structuredClone(user);
    } });
    const app = express();
    app.use(express.json());
    app.use("/api/cart", cartRouter);
    const server = await new Promise((resolve) => {
        const listener = app.listen(0, "127.0.0.1", () => resolve(listener));
    });
    context.after(() => {
        server.close();
        userModel.findById = originalFind;
        userModel.findOneAndUpdate = originalUpdate;
        if (originalSecret === undefined) delete process.env.JWT_SECRET;
        else process.env.JWT_SECRET = originalSecret;
    });
    const token = jwt.sign({ id: "507f1f77bcf86cd799439011" }, process.env.JWT_SECRET);
    const base = `http://127.0.0.1:${server.address().port}/api/cart`;
    const request = async (path, body, authenticated = true) => {
        const response = await fetch(`${base}${path}`, {
            method: "POST",
            headers: { "content-type": "application/json", ...(authenticated ? { token } : {}) },
            body: JSON.stringify(body)
        });
        return { status: response.status, body: await response.json() };
    };
    const guest = { mergeId: "123e4567-e89b-42d3-a456-426614174000", cartData: { food: 2 }, savedData: { drink: 1 } };
    assert.deepEqual(await request("/merge", guest), { status: 200, body: { success: true, cartData: { food: 2 }, savedData: { drink: 1 } } });
    assert.deepEqual(await request("/merge", guest), { status: 200, body: { success: true, cartData: { food: 2 }, savedData: { drink: 1 } } });
    assert.equal((await request("/merge", { ...guest, cartData: { food: 3 } })).status, 409);
    assert.deepEqual((await request("/move", { cartKey: "food", to: "saved" })).body.savedData, { drink: 1, food: 2 });
    assert.deepEqual((await request("/saved/remove", { cartKey: "drink" })).body.savedData, { food: 2 });
    const added = await request("/add", { itemId: "meal" });
    assert.equal(added.body.message, "Added To Cart");
    assert.equal(added.body.cartData.meal.quantity, 1);
    assert.equal((await request("/remove", { itemId: "meal" })).body.cartData.meal, undefined);
    assert.equal((await request("/clear", { cartKey: "$bad" })).status, 400);
    assert.equal((await request("/get", {})).body.savedData.food, 2);
    assert.equal((await request("/get", {}, false)).body.success, false);
});