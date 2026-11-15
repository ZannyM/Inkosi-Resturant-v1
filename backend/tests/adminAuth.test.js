import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import authRouter from "../routes/authRoute.js";
import userRouter from "../routes/userRoute.js";
import foodRouter from "../routes/foodRoute.js";
import orderRouter from "../routes/orderRoute.js";
import storeRouter from "../routes/storeRoute.js";
import verifyAdmin from "../middleware/verifyAdmin.js";
import userModel from "../models/userModel.js";
import orderModel from "../models/orderModel.js";

test("admin login, authorization and protected routes", async (context) => {
    const originalFindOne = userModel.findOne;
    const originalFindById = userModel.findById;
    const originalSave = userModel.prototype.save;
    const originalFindOrders = orderModel.find;
    const originalSecret = process.env.JWT_SECRET;
    process.env.JWT_SECRET = "test-admin-auth-secret";
    const id = "507f1f77bcf86cd799439011";
    const password = "correct horse battery staple";
    const passwordHash = await bcrypt.hash(password, 4);
    let user = { _id: id, email: "admin@example.com", password: passwordHash, role: "admin" };

    userModel.findOne = async ({ email }) => email === user?.email ? user : null;
    userModel.findById = () => ({ select: async () => user });
    orderModel.find = async () => [];
    let registeredUser;
    userModel.prototype.save = async function () {
        registeredUser = this;
        return this;
    };

    const app = express();
    app.use(express.json());
    app.use("/api/auth", authRouter);
    app.use("/api/user", userRouter);
    app.use("/api/food", foodRouter);
    app.use("/api/order", orderRouter);
    app.use("/api/store", storeRouter);
    app.get("/check", verifyAdmin, (req, res) => res.json(req.admin));
    const server = await new Promise(resolve => {
        const listener = app.listen(0, "127.0.0.1", () => resolve(listener));
    });
    context.after(() => {
        server.close();
        userModel.findOne = originalFindOne;
        userModel.findById = originalFindById;
        userModel.prototype.save = originalSave;
        orderModel.find = originalFindOrders;
        if (originalSecret === undefined) delete process.env.JWT_SECRET;
        else process.env.JWT_SECRET = originalSecret;
    });

    const base = `http://127.0.0.1:${server.address().port}`;
    const request = (path, options = {}) => fetch(base + path, options);
    const login = (email, value) => request("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password: value })
    });
    const authorized = token => ({ headers: { Authorization: `Bearer ${token}` } });

    const registration = await request("/api/user/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: "Customer", email: "new@example.com", password, role: "admin" })
    });
    assert.equal((await registration.json()).success, true);
    assert.equal(registeredUser.role, "customer");
    assert.notEqual(registeredUser.password, password);
    assert.equal(await bcrypt.compare(password, registeredUser.password), true);

    const wrongPassword = await login("admin@example.com", "wrong");
    const unknownEmail = await login("unknown@example.com", password);
    assert.equal(wrongPassword.status, 401);
    assert.equal(unknownEmail.status, 401);
    assert.deepEqual(await unknownEmail.json(), {
        success: false, message: "Email or password is incorrect."
    });
    assert.deepEqual(await wrongPassword.json(), {
        success: false, message: "Email or password is incorrect."
    });
    assert.equal((await login({ $ne: null }, password)).status, 400);
    const response = await login("admin@example.com", password);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("cache-control"), "no-store");
    const { token, role, expiresIn } = await response.json();
    assert.equal(role, "admin");
    assert.equal(expiresIn, 900);
    assert.deepEqual(await (await request("/check", authorized(token))).json(), { id, role: "admin" });
    assert.deepEqual(await (await request("/api/order/list", authorized(token))).json(), { success: true, data: [] });
    const legacyLogin = await request("/api/user/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: user.email, password })
    });
    assert.equal((await legacyLogin.json()).success, true);

    assert.equal((await request("/check")).status, 401);
    assert.equal((await request("/check", authorized(`${token}x`))).status, 401);
    const legacy = jwt.sign({ id }, process.env.JWT_SECRET);
    assert.equal((await request("/check", authorized(legacy))).status, 401);
    const expired = jwt.sign({}, process.env.JWT_SECRET, {
        subject: id, issuer: "inkosi-api", audience: "inkosi-admin", expiresIn: -1
    });
    assert.equal((await request("/check", authorized(expired))).status, 401);
    const noExpiry = jwt.sign({}, process.env.JWT_SECRET, {
        subject: id, issuer: "inkosi-api", audience: "inkosi-admin"
    });
    assert.equal((await request("/check", authorized(noExpiry))).status, 401);

    user.role = "customer";
    assert.equal((await request("/check", authorized(token))).status, 403);
    const customerResponse = await login("admin@example.com", password);
    const customerToken = (await customerResponse.json()).token;
    assert.equal((await request("/check", authorized(customerToken))).status, 403);

    for (const [method, path] of [
        ["POST", "/api/food/add"], ["POST", "/api/food/feature"],
        ["POST", "/api/food/update"], ["POST", "/api/food/remove"],
        ["GET", "/api/order/list"], ["POST", "/api/order/status"],
        ["POST", "/api/store/status"]
    ]) {
        assert.equal((await request(path, { method })).status, 401, path);
        assert.equal((await request(path, { method, ...authorized(customerToken) })).status, 403, path);
    }

    user = null;
    assert.equal((await request("/check", authorized(token))).status, 401);

    // Both login endpoints share the same limiter.
    for (let i = 0; i < 4; i++) await login("unknown@example.com", password);
    const limited = await request("/api/user/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: "admin@example.com", password })
    });
    assert.equal(limited.status, 429);
});
