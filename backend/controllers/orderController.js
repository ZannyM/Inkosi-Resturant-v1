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
const verifyOrder = async (req, res) => {
    const { orderId, success } = req.body;
    try {
        if (success == "true") {
            await orderModel.findByIdAndUpdate(orderId, { payment: true });
            res.json({ success: true, message: "Paid" })
        }else{
            await orderModel.findByIdAndDelete(orderId);
            res.json({success:false,message:"Not Paid"})
        }
    } catch (error) {
        console.log("error");
        res.json({success:true, message:"Error processing payment verification"})
    }

}
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
        const orders = await orderModel.find({});
        res.json({success:true,data:orders})
    } catch (error) {
        console.log(error);
        res.json({success:false, message:"Error Fetching orders"})
    }

}

export { placeOrder, verifyOrder,userOrders, listOrders }