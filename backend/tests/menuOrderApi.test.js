import test from "node:test";
import assert from "node:assert/strict";
import { access, mkdir, readdir, rmdir, unlink } from "node:fs/promises";
import path from "node:path";
import express from "express";
import jwt from "jsonwebtoken";
import foodRouter from "../routes/foodRoute.js";
import orderRouter from "../routes/orderRoute.js";
import adminUserModel from "../models/adminUserModel.js";
import foodModel from "../models/foodModel.js";
import orderModel from "../models/orderModel.js";
import storeSettingsModel from "../models/storeSettingsModel.js";
import userModel from "../models/userModel.js";

test("menu CRUD, customer order placement, and admin order status changes", async (context) => {
    const uploadsDir = path.resolve(process.cwd(), "uploads");
    let uploadsDirExisted = true;
    try {
        await access(uploadsDir);
    } catch (error) {
        if (error.code !== "ENOENT") throw error;
        uploadsDirExisted = false;
    }
    await mkdir(uploadsDir, { recursive: true });

    const uploadMarker = `api-menu-${Date.now()}-`;
    const original = {
        adminFindById: adminUserModel.findById,
        foodFindById: foodModel.findById,
        foodFindByIdAndDelete: foodModel.findByIdAndDelete,
        foodSave: foodModel.prototype.save,
        orderSave: orderModel.prototype.save,
        orderFindByIdAndUpdate: orderModel.findByIdAndUpdate,
        storeFindOneAndUpdate: storeSettingsModel.findOneAndUpdate,
        userFindByIdAndUpdate: userModel.findByIdAndUpdate,
        fetch: globalThis.fetch,
        Date: globalThis.Date,
        jwtSecret: process.env.JWT_SECRET,
        adminJwtSecret: process.env.ADMIN_JWT_SECRET,
        paystackSecret: process.env.PAYSTACK_SECRET_KEY,
        frontendUrl: process.env.FRONTEND_URL
    };

    const adminId = "507f1f77bcf86cd799439011";
    const customerId = "507f1f77bcf86cd799439012";
    const admin = {
        _id: adminId,
        isActive: true,
        tokenVersion: 0,
        role: { name: "Manager", permissions: ["catalog:write", "orders:write"] }
    };
    const foods = new Map();
    const orders = new Map();
    let clearedCartUserId;
    let paystackRequest;

    process.env.JWT_SECRET = "menu-order-customer-test-secret";
    process.env.ADMIN_JWT_SECRET = "menu-order-admin-test-secret";
    process.env.PAYSTACK_SECRET_KEY = "test-paystack-secret";
    process.env.FRONTEND_URL = "https://restaurant.example";

    adminUserModel.findById = () => ({
        populate() { return this; },
        then(resolve, reject) { return Promise.resolve(admin).then(resolve, reject); }
    });
    foodModel.prototype.save = async function () {
        foods.set(String(this._id), this);
        return this;
    };
    foodModel.findById = async id => foods.get(String(id)) || null;
    foodModel.findByIdAndDelete = async id => foods.delete(String(id));
    orderModel.prototype.save = async function () {
        orders.set(String(this._id), this);
        return this;
    };
    orderModel.findByIdAndUpdate = async (id, update) => {
        const order = orders.get(String(id));
        if (order) Object.assign(order, update);
        return order || null;
    };
    storeSettingsModel.findOneAndUpdate = async () => ({ isStoreLive: true });
    userModel.findByIdAndUpdate = async userId => {
        clearedCartUserId = String(userId);
        return {};
    };
    globalThis.fetch = async (input, options) => {
        if (String(input).startsWith("https://api.paystack.co/")) {
            paystackRequest = { url: String(input), options };
            return {
                ok: true,
                json: async () => ({
                    status: true,
                    data: { authorization_url: "https://checkout.paystack.example/session" }
                })
            };
        }
        return original.fetch(input, options);
    };

    const app = express();
    app.use(express.json());
    app.use("/api/food", foodRouter);
    app.use("/api/order", orderRouter);
    const server = await new Promise(resolve => {
        const listener = app.listen(0, "127.0.0.1", () => resolve(listener));
    });
    const base = `http://127.0.0.1:${server.address().port}`;
    const managerToken = jwt.sign({ version: 0 }, process.env.ADMIN_JWT_SECRET, {
        algorithm: "HS256",
        subject: adminId,
        issuer: "inkosi-api",
        audience: "inkosi-admin",
        expiresIn: "15m"
    });
    const customerToken = jwt.sign({ id: customerId }, process.env.JWT_SECRET);
    const request = async (pathname, method, body, token) => {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        let requestBody = body;
        if (body && !(body instanceof FormData)) {
            headers["content-type"] = "application/json";
            requestBody = JSON.stringify(body);
        }
        const response = await original.fetch(`${base}${pathname}`, {
            method,
            headers,
            ...(requestBody ? { body: requestBody } : {})
        });
        return { response, body: await response.json() };
    };

    context.after(async () => {
        await new Promise(resolve => server.close(resolve));
        globalThis.fetch = original.fetch;
        globalThis.Date = original.Date;
        adminUserModel.findById = original.adminFindById;
        foodModel.findById = original.foodFindById;
        foodModel.findByIdAndDelete = original.foodFindByIdAndDelete;
        foodModel.prototype.save = original.foodSave;
        orderModel.prototype.save = original.orderSave;
        orderModel.findByIdAndUpdate = original.orderFindByIdAndUpdate;
        storeSettingsModel.findOneAndUpdate = original.storeFindOneAndUpdate;
        userModel.findByIdAndUpdate = original.userFindByIdAndUpdate;
        if (original.jwtSecret === undefined) delete process.env.JWT_SECRET;
        else process.env.JWT_SECRET = original.jwtSecret;
        if (original.adminJwtSecret === undefined) delete process.env.ADMIN_JWT_SECRET;
        else process.env.ADMIN_JWT_SECRET = original.adminJwtSecret;
        if (original.paystackSecret === undefined) delete process.env.PAYSTACK_SECRET_KEY;
        else process.env.PAYSTACK_SECRET_KEY = original.paystackSecret;
        if (original.frontendUrl === undefined) delete process.env.FRONTEND_URL;
        else process.env.FRONTEND_URL = original.frontendUrl;

        for (const filename of await readdir(uploadsDir)) {
            if (filename.includes(uploadMarker)) {
                await unlink(path.join(uploadsDir, filename));
            }
        }
        if (!uploadsDirExisted && (await readdir(uploadsDir)).length === 0) {
            await rmdir(uploadsDir);
        }
    });

    const form = new FormData();
    form.append("name", "Test Dish");
    form.append("description", "A test menu item");
    form.append("price", "45");
    form.append("category", "Mains");
    form.append("image", new Blob(["test image"]), `${uploadMarker}dish.png`);
    const created = await request("/api/food/add", "POST", form, managerToken);
    assert.equal(created.response.status, 200);
    assert.equal(created.body.success, true);
    assert.equal(foods.size, 1);
    const [foodId, food] = foods.entries().next().value;
    assert.equal(food.name, "Test Dish");
    assert.equal(food.image.includes(uploadMarker), true);

    const updated = await request("/api/food/update", "POST", {
        id: foodId, name: "Updated Test Dish", price: 55
    }, managerToken);
    assert.equal(updated.body.success, true);
    assert.equal(food.name, "Updated Test Dish");
    assert.equal(food.price, 55);

    const removed = await request("/api/food/remove", "POST", { id: foodId }, managerToken);
    assert.equal(removed.body.success, true);
    assert.equal(foods.has(foodId), false);

    const realDate = globalThis.Date;
    globalThis.Date = class extends realDate {
        constructor(...args) {
            super(...(args.length ? args : ["2025-01-15T12:00:00+02:00"]));
        }
        static now() {
            return new realDate("2025-01-15T12:00:00+02:00").getTime();
        }
    };
    let placed;
    try {
        placed = await request("/api/order/place", "POST", {
            items: [{ id: "dish", quantity: 2 }],
            amount: 125,
            address: { email: "customer@example.com" }
        }, customerToken);
    } finally {
        globalThis.Date = realDate;
    }
    assert.equal(placed.response.status, 200);
    assert.equal(placed.body.success, true);
    assert.equal(placed.body.session_url, "https://checkout.paystack.example/session");
    assert.equal(orders.size, 1);
    const [orderId, order] = orders.entries().next().value;
    assert.equal(order.userId, customerId);
    assert.deepEqual(order.items, [{ id: "dish", quantity: 2 }]);
    assert.equal(order.amount, 125);
    assert.equal(clearedCartUserId, customerId);
    assert.equal(paystackRequest.url, "https://api.paystack.co/transaction/initialize");
    const paymentPayload = JSON.parse(paystackRequest.options.body);
    assert.equal(paymentPayload.amount, 12500);
    assert.equal(paymentPayload.metadata.orderId, orderId);

    const status = await request("/api/order/status", "POST", {
        orderId, status: "Food Ready"
    }, managerToken);
    assert.equal(status.response.status, 200);
    assert.equal(status.body.success, true);
    assert.equal(order.status, "Food Ready");
});
