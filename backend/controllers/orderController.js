import orderModel from "../models/orderModel.js";
import userModel from '../models/userModel.js'

//Placing user order from frontend
const placeOrder = async (req, res) => {

    const frontend_url = "http://localhost:5173"

    try {
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
                callback_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
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

export { placeOrder }