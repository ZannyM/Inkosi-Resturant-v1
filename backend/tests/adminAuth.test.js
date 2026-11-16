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
import staffRouter from "../routes/staffRoute.js";
import userModel from "../models/userModel.js";
import adminUserModel from "../models/adminUserModel.js";
import adminRoleModel from "../models/adminRoleModel.js";
import orderModel from "../models/orderModel.js";

test("isolated admin accounts, permissions, password changes and revocation", async (context) => {
    const originals = {
        userFindOne: userModel.findOne, userSave: userModel.prototype.save,
        adminFindOne: adminUserModel.findOne, adminFindById: adminUserModel.findById,
        adminFind: adminUserModel.find, adminCreate: adminUserModel.create,
        adminUpdate: adminUserModel.findByIdAndUpdate, adminUpdateOne: adminUserModel.updateOne, roleFind: adminRoleModel.find,
        roleFindById: adminRoleModel.findById, orders: orderModel.find,
        secret: process.env.JWT_SECRET, adminSecret: process.env.ADMIN_JWT_SECRET
    };
    process.env.JWT_SECRET = "test-customer-secret";
    process.env.ADMIN_JWT_SECRET = "test-separate-admin-secret";
    const managerId = "507f1f77bcf86cd799439011";
    const kitchenId = "507f1f77bcf86cd799439012";
    const newId = "507f1f77bcf86cd799439013";
    const managerRole = { _id: "507f1f77bcf86cd799439021", name: "Manager",
        permissions: ["orders:read", "orders:write", "catalog:write", "store:write", "staff:manage"] };
    const kitchenRole = { _id: "507f1f77bcf86cd799439022", name: "Kitchen Staff",
        permissions: ["orders:read", "orders:write"] };
    const password = "a".repeat(72);
    const hash = await bcrypt.hash(password, 4);
    const users = [
        { _id: managerId, email: "manager@example.com", username: "manager", passwordHash: hash,
            role: managerRole, isActive: true, mustChangePassword: false, tokenVersion: 0 },
        { _id: kitchenId, email: "kitchen@example.com", username: "kitchen", passwordHash: hash,
            role: kitchenRole, isActive: true, mustChangePassword: false, tokenVersion: 0 }
    ];
    const query = value => ({
        select() { return this; }, populate() { return this; }, sort() { return this; },
        then(resolve, reject) { return Promise.resolve(value).then(resolve, reject); }
    });
    let registered;
    userModel.findOne = async ({ email }) => email === "existing-customer@example.com"
        ? { _id: managerId, email, password: hash, role: "admin" } : null;
    userModel.prototype.save = async function () { registered = this; return this; };
    adminUserModel.findOne = ({ email }) => query(users.find(user => user.email === email));
    adminUserModel.findById = id => query(users.find(user => user._id === id));
    adminUserModel.find = () => query(users);
    adminUserModel.create = async data => {
        const role = [managerRole, kitchenRole].find(item => item._id === data.role);
        const user = { _id: newId, id: newId, ...data, role, isActive: true, mustChangePassword: true, tokenVersion: 0,
            async save() { return this; } };
        users.push(user);
        return user;
    };
    adminUserModel.findByIdAndUpdate = async (id, update) => {
        const user = users.find(item => item._id === id);
        if (user) {
            user.isActive = update.$set.isActive;
            user.tokenVersion += update.$inc.tokenVersion;
        }
        return user;
    };
    adminUserModel.updateOne = async (filter, update) => {
        const user = users.find(item => item._id === filter._id && item.isActive === filter.isActive &&
            item.tokenVersion === filter.tokenVersion);
        if (!user) return { modifiedCount: 0 };
        Object.assign(user, update.$set);
        user.tokenVersion += update.$inc.tokenVersion;
        return { modifiedCount: 1 };
    };
    adminRoleModel.find = () => query([managerRole, kitchenRole]);
    adminRoleModel.findById = async id => [managerRole, kitchenRole].find(role => role._id === id);
    orderModel.find = async () => [];

    const app = express();
    app.use(express.json());
    app.use("/api/auth", authRouter);
    app.use("/api/user", userRouter);
    app.use("/api/food", foodRouter);
    app.use("/api/order", orderRouter);
    app.use("/api/store", storeRouter);
    app.use("/api/staff", staffRouter);
    const server = await new Promise(resolve => {
        const listener = app.listen(0, "127.0.0.1", () => resolve(listener));
    });
    context.after(() => {
        server.close();
        userModel.findOne = originals.userFindOne;
        userModel.prototype.save = originals.userSave;
        adminUserModel.findOne = originals.adminFindOne;
        adminUserModel.findById = originals.adminFindById;
        adminUserModel.find = originals.adminFind;
        adminUserModel.create = originals.adminCreate;
        adminUserModel.findByIdAndUpdate = originals.adminUpdate;
        adminUserModel.updateOne = originals.adminUpdateOne;
        adminRoleModel.find = originals.roleFind;
        adminRoleModel.findById = originals.roleFindById;
        orderModel.find = originals.orders;
        if (originals.secret === undefined) delete process.env.JWT_SECRET;
        else process.env.JWT_SECRET = originals.secret;
        if (originals.adminSecret === undefined) delete process.env.ADMIN_JWT_SECRET;
        else process.env.ADMIN_JWT_SECRET = originals.adminSecret;
    });
    const base = `http://127.0.0.1:${server.address().port}`;
    const request = (path, method = "GET", data, token) => fetch(base + path, {
        method, headers: { "content-type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        ...(data ? { body: JSON.stringify(data) } : {})
    });
    const login = async (email, value = password) => {
        const response = await request("/api/auth/login", "POST", { email, password: value });
        return { response, body: await response.json() };
    };

    const registration = await request("/api/user/register", "POST", {
        name: "Customer", email: "customer@example.com", password, role: "admin"
    });
    assert.equal((await registration.json()).success, true);
    assert.equal(registered.role, undefined);
    assert.equal(await bcrypt.compare(password, registered.password), true);
    assert.equal((await login("customer@example.com")).response.status, 401);
    assert.equal((await login("existing-customer@example.com")).response.status, 401);
    assert.equal((await login("manager@example.com", "wrong")).response.status, 401);
    assert.equal((await login("manager@example.com", `${password}extra`)).response.status, 401);
    const manager = await login("manager@example.com");
    const kitchen = await login("kitchen@example.com");
    assert.equal(manager.response.status, 200);
    assert.equal(manager.body.role, "Manager");
    assert.equal(kitchen.body.role, "Kitchen Staff");
    const customerLogin = await request("/api/user/login", "POST", {
        email: "existing-customer@example.com", password
    });
    const customerToken = (await customerLogin.json()).token;
    assert.equal((await request("/api/order/list", "GET", null, customerToken)).status, 403);
    assert.equal((await request("/api/order/list")).status, 401);
    assert.equal((await request("/api/order/list", "GET", null, "invalid")).status, 401);
    const expired = jwt.sign({ version: 0 }, process.env.ADMIN_JWT_SECRET, {
        subject: managerId, issuer: "inkosi-api", audience: "inkosi-admin", expiresIn: -1
    });
    assert.equal((await request("/api/order/list", "GET", null, expired)).status, 401);
    assert.equal((await request("/api/order/list", "GET", null, kitchen.body.token)).status, 200);
    assert.equal((await request("/api/food/remove", "POST", {}, kitchen.body.token)).status, 403);
    assert.equal((await request("/api/staff", "GET", null, kitchen.body.token)).status, 403);
    assert.equal((await request("/api/staff", "GET", null, manager.body.token)).status, 200);
    for (const [method, path] of [
        ["POST", "/api/food/add"], ["POST", "/api/food/feature"],
        ["POST", "/api/food/update"], ["POST", "/api/food/remove"],
        ["GET", "/api/order/list"], ["POST", "/api/order/status"],
        ["POST", "/api/store/status"], ["GET", "/api/staff"]
    ]) {
        assert.equal((await request(path, method, null, customerToken)).status, 403, path);
    }
    assert.equal((await request("/api/staff", "POST", {
        username: "new", email: "new@example.com", password: "short", roleId: kitchenRole._id
    }, manager.body.token)).status, 400);
    const created = await request("/api/staff", "POST", {
        username: "new", email: "new@example.com", password, roleId: kitchenRole._id
    }, manager.body.token);
    assert.equal(created.status, 201);
    assert.notEqual(users[2].passwordHash, password);
    const temporary = await login("new@example.com");
    assert.equal(temporary.body.mustChangePassword, true);
    assert.equal((await request("/api/order/list", "GET", null, temporary.body.token)).status, 403);
    assert.equal((await request("/api/auth/password", "POST", {
        currentPassword: "wrong", newPassword: "different strong password"
    }, temporary.body.token)).status, 400);
    assert.equal((await request("/api/auth/password", "POST", {
        currentPassword: password, newPassword: "different strong password"
    }, temporary.body.token)).status, 200);
    assert.equal((await request("/api/order/list", "GET", null, temporary.body.token)).status, 401);
    const newLogin = await login("new@example.com", "different strong password");
    assert.equal(newLogin.body.mustChangePassword, false);
    assert.equal((await request("/api/order/list", "GET", null, newLogin.body.token)).status, 200);
    assert.equal((await request(`/api/staff/${kitchenId}/status`, "PATCH", { isActive: false }, manager.body.token)).status, 200);
    assert.equal((await request("/api/order/list", "GET", null, kitchen.body.token)).status, 401);
    assert.equal((await login("kitchen@example.com")).response.status, 401);
    assert.equal((await request(`/api/staff/${kitchenId}/status`, "PATCH", { isActive: true }, manager.body.token)).status, 200);
    assert.equal((await request("/api/order/list", "GET", null, kitchen.body.token)).status, 401);
    assert.equal((await request(`/api/staff/${managerId}/status`, "PATCH", { isActive: false }, manager.body.token)).status, 400);
    assert.equal((await request(`/api/staff/${managerId.toUpperCase()}/status`, "PATCH", { isActive: false }, manager.body.token)).status, 400);
});
