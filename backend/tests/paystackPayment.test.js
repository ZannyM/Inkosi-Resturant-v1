import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { readFile } from "node:fs/promises";
import express from "express";
import orderRouter from "../routes/orderRoute.js";
import orderModel from "../models/orderModel.js";
import capturePaystackWebhookBody from "../utils/paystackWebhookBody.js";

const orderId = "507f1f77bcf86cd799439013";
const customerId = "507f1f77bcf86cd799439012";
const reference = "order_507f1f77bcf86cd799439013_1736935200000";
const secret = "paystack-payment-test-secret";

test("payment verification and signed webhook reconcile fixture transactions", async (context) => {
    const verificationFixture = JSON.parse(await readFile(
        new URL("./fixtures/paystack-transaction-verified.json", import.meta.url), "utf8"
    ));
    const webhookFixture = await readFile(
        new URL("./fixtures/paystack-charge-success.json", import.meta.url), "utf8"
    );
    const original = {
        findById: orderModel.findById,
        findOne: orderModel.findOne,
        findOneAndUpdate: orderModel.findOneAndUpdate,
        fetch: globalThis.fetch,
        paystackSecret: process.env.PAYSTACK_SECRET_KEY
    };
    const order = {
        _id: orderId,
        userId: customerId,
        amount: 125,
        payment: false,
        paystackReference: reference
    };
    let verificationResponse = structuredClone(verificationFixture);
    let verifiedUrl;
    let verifiedAuthorization;

    process.env.PAYSTACK_SECRET_KEY = secret;
    orderModel.findById = async id => String(id) === orderId ? order : null;
    orderModel.findOne = async ({ paystackReference }) =>
        paystackReference === reference ? order : null;
    orderModel.findOneAndUpdate = async (filter, update) => {
        if (String(filter._id) !== orderId || filter.paystackReference !== reference) return null;
        Object.assign(order, update.$set);
        return order;
    };
    globalThis.fetch = async (input, options) => {
        verifiedUrl = String(input);
        verifiedAuthorization = options.headers.Authorization;
        return {
            ok: true,
            status: 200,
            json: async () => structuredClone(verificationResponse)
        };
    };

    const app = express();
    app.use(express.json({ verify: capturePaystackWebhookBody }));
    app.use("/api/order", orderRouter);
    const server = await new Promise(resolve => {
        const listener = app.listen(0, "127.0.0.1", () => resolve(listener));
    });
    const base = `http://127.0.0.1:${server.address().port}`;
    const sendJson = async (pathname, body) => original.fetch(`${base}${pathname}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body)
    });
    const sign = payload => createHmac("sha512", secret).update(payload).digest("hex");
    const sendWebhook = (payload, signature) => original.fetch(`${base}/api/order/webhook`, {
        method: "POST",
        headers: {
            "content-type": "application/json",
            "x-paystack-signature": signature
        },
        body: payload
    });

    context.after(async () => {
        await new Promise(resolve => server.close(resolve));
        orderModel.findById = original.findById;
        orderModel.findOne = original.findOne;
        orderModel.findOneAndUpdate = original.findOneAndUpdate;
        globalThis.fetch = original.fetch;
        if (original.paystackSecret === undefined) delete process.env.PAYSTACK_SECRET_KEY;
        else process.env.PAYSTACK_SECRET_KEY = original.paystackSecret;
    });

    verificationResponse.data.amount = 12499;
    const mismatchedVerification = await sendJson("/api/order/verify", {
        orderId, success: "true"
    });
    assert.equal(mismatchedVerification.status, 200);
    assert.equal((await mismatchedVerification.json()).success, false);
    assert.equal(order.payment, false);

    verificationResponse = structuredClone(verificationFixture);
    const verified = await sendJson("/api/order/verify", { orderId, success: "false" });
    assert.equal(verified.status, 200);
    assert.deepEqual(await verified.json(), { success: true, message: "Paid" });
    assert.equal(order.payment, true);
    assert.equal(verifiedUrl, `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`);
    assert.equal(verifiedAuthorization, `Bearer ${secret}`);

    order.payment = false;
    const invalidSignature = await sendWebhook(webhookFixture, "0".repeat(128));
    assert.equal(invalidSignature.status, 401);
    assert.equal(order.payment, false);

    const mismatchedWebhook = JSON.parse(webhookFixture);
    mismatchedWebhook.data.amount = 12499;
    const mismatchedPayload = JSON.stringify(mismatchedWebhook);
    const rejectedWebhook = await sendWebhook(mismatchedPayload, sign(mismatchedPayload));
    assert.equal(rejectedWebhook.status, 400);
    assert.equal(order.payment, false);

    const acceptedWebhook = await sendWebhook(webhookFixture, sign(webhookFixture));
    assert.equal(acceptedWebhook.status, 200);
    assert.deepEqual(await acceptedWebhook.json(), { success: true, received: true });
    assert.equal(order.payment, true);

    order.payment = false;
    const duplicateWebhook = await sendWebhook(webhookFixture, sign(webhookFixture));
    assert.equal(duplicateWebhook.status, 200);
    assert.equal(order.payment, true);
});
