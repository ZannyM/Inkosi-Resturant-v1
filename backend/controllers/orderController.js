import orderModel from "../models/orderModel.js";
import userModel from '../models/userModel.js'
import storeSettingsModel from "../models/storeSettingsModel.js";
import { OPERATING_HOURS_LABEL, isWithinOperatingHours } from "../utils/storeHours.js";
import mongoose from "mongoose";
import { createHmac, timingSafeEqual } from "node:crypto";

const isSuccessfulPaystackTransaction = (order, transaction) => {
    const expectedAmount = Math.round(Number(order.amount) * 100);
    return transaction?.status === "success" &&
        transaction.reference === order.paystackReference &&
        Number.isSafeInteger(expectedAmount) &&
        expectedAmount > 0 &&
        transaction.amount === expectedAmount &&
        String(transaction.metadata?.orderId || "") === String(order._id);
};

const markOrderPaid = async (order) => orderModel.findOneAndUpdate(
    { _id: order._id, paystackReference: order.paystackReference },
    { $set: { payment: true } },
    { new: true }
);

//Placing user order from frontend
const placeOrder = async (req, res) => {

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173"

    try {
        const storeSettings = await storeSettingsModel.findOneAndUpdate(
            { key: "primary" },
            { $setOnInsert: { isStoreLive: true } },
            { upsert: true, new: true }
        );

        if (!storeSettings.isStoreLive) {
            return res.status(503).json({
                success: false,
                reason: "KITCHEN_PAUSED",
                operatingHours: OPERATING_HOURS_LABEL,
                message: "Restaurant is currently closed. Operational hours are 10:00 AM - 10:00 PM, all week."
            });
        }

        if (!isWithinOperatingHours()) {
            return res.status(503).json({
                success: false,
                reason: "OUTSIDE_OPERATING_HOURS",
                operatingHours: OPERATING_HOURS_LABEL,
                message: "Restaurant is currently closed. Operational hours are 10:00 AM - 10:00 PM, all week."
            });
        }

        const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
        if (!paystackSecretKey) {
            return res.status(500).json({ success: false, message: "Paystack secret key is not configured." });
        }

        //saving the order in the database
        const newOrder = new orderModel({
            userId: req.body.userId,
            items: req.body.items,
            amount: req.body.amount,  //total amount in rands
            address: req.body.address
        })
        //saved order in the database
        await newOrder.save();
        //clears users cart data
        await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

        const amountInKobo = Math.round(Number(req.body.amount || 0) * 100);
        const reference = `order_${newOrder._id}_${Date.now()}`;

        await orderModel.findByIdAndUpdate(newOrder._id, { paystackReference: reference });

        const paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${paystackSecretKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: req.body.address?.email || "customer@example.com",
                amount: amountInKobo,
                reference,
                callback_url: `${frontendUrl}/verify?success=true&orderId=${newOrder._id}`,
                metadata: {
                    orderId: String(newOrder._id),
                    userId: String(req.body.userId)
                }
            })
        });

        const paystackData = await paystackResponse.json();
        if (!paystackResponse.ok || !paystackData.status) {
            throw new Error(paystackData.message || "Paystack initialization failed");
        }

        res.json({ success: true, session_url: paystackData.data.authorization_url })

    } catch (error) {
        console.error("Paystack checkout failed:", error);
        res.status(500).json({ success: false, message: error.message || "Error" });
    }

}
const verifyOrder = async (req, res) => {
    const { orderId } = req.body || {};
    if (typeof orderId !== "string" || !mongoose.isValidObjectId(orderId)) {
        return res.status(400).json({ success: false, message: "Invalid order id" });
    }

    try {
        const order = await orderModel.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }
        if (order.payment) return res.json({ success: true, message: "Paid" });
        if (!order.paystackReference) {
            return res.status(409).json({ success: false, message: "Order has no payment reference" });
        }

        const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
        if (!paystackSecretKey) {
            return res.status(503).json({ success: false, message: "Payment verification is unavailable" });
        }

        const paystackResponse = await fetch(
            `https://api.paystack.co/transaction/verify/${encodeURIComponent(order.paystackReference)}`,
            { headers: { Authorization: `Bearer ${paystackSecretKey}` } }
        );
        const verification = await paystackResponse.json();
        if (!paystackResponse.ok || verification.status !== true) {
            console.error("Paystack transaction verification failed:", verification.message || paystackResponse.status);
            return res.status(502).json({ success: false, message: "Payment verification is unavailable" });
        }
        if (!isSuccessfulPaystackTransaction(order, verification.data)) {
            return res.json({ success: false, message: "Payment could not be verified" });
        }

        const updatedOrder = await markOrderPaid(order);
        if (!updatedOrder) {
            return res.status(409).json({ success: false, message: "Order payment state changed" });
        }
        return res.json({ success: true, message: "Paid" });
    } catch (error) {
        console.error("Paystack transaction verification error:", error);
        return res.status(502).json({ success: false, message: "Payment verification is unavailable" });
    }
};

const paystackWebhook = async (req, res) => {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    const signature = req.get("x-paystack-signature");
    if (!secret) {
        return res.status(503).json({ success: false, message: "Payment webhook is unavailable" });
    }
    if (!Buffer.isBuffer(req.rawBody) || typeof signature !== "string" ||
        !/^[a-f\d]{128}$/i.test(signature)) {
        return res.status(401).json({ success: false, message: "Invalid webhook signature" });
    }

    const expectedSignature = createHmac("sha512", secret).update(req.rawBody).digest();
    const receivedSignature = Buffer.from(signature, "hex");
    if (!timingSafeEqual(expectedSignature, receivedSignature)) {
        return res.status(401).json({ success: false, message: "Invalid webhook signature" });
    }

    const { event, data } = req.body || {};
    if (event !== "charge.success") {
        return res.status(200).json({ success: true, received: true });
    }
    if (typeof data?.reference !== "string" || data.status !== "success") {
        return res.status(400).json({ success: false, message: "Invalid successful charge event" });
    }

    try {
        const order = await orderModel.findOne({ paystackReference: data.reference });
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found for payment reference" });
        }
        if (!isSuccessfulPaystackTransaction(order, data)) {
            return res.status(400).json({ success: false, message: "Payment does not match the order" });
        }

        const updatedOrder = await markOrderPaid(order);
        if (!updatedOrder) {
            return res.status(409).json({ success: false, message: "Order payment state changed" });
        }
        return res.status(200).json({ success: true, received: true });
    } catch (error) {
        console.error("Paystack webhook processing failed:", error);
        return res.status(500).json({ success: false, message: "Webhook processing failed" });
    }
};
//user orders for frontend
const userOrders = async (req,res) =>{
    try {
        const orders = await orderModel.find({userId:req.body.userId});
        res.json({success:true, data:orders})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }

}
// create api to fetch AND LIST ORDERS FOR ADMIN PANEL
const listOrders = async (req,res) =>{
    try {
        const statusFilter = req.query.status;
        const query = {};

        if (statusFilter && statusFilter !== "all") {
            if (statusFilter === "Food Processing") {
                query.status = { $in: ["Food Processing", "Food Proocessing"] };
            } else {
                query.status = statusFilter;
            }
        }

        const orders = await orderModel.find(query);
        res.json({success:true,data:orders})
    } catch (error) {
        console.log(error);
        res.json({success:false, message:"Error Fetching orders"})
    }

}
//api for updating the order status
const updateStatus = async (req,res) =>{
    try {
        await orderModel.findByIdAndUpdate(req.body.orderId,{status:req.body.status});
        res.json({success:true,message:"Status Updated"})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error Updating Status"})
    }
}

export { placeOrder, verifyOrder, paystackWebhook, userOrders, listOrders, updateStatus }