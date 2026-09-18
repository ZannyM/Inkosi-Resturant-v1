import { response } from "express";
import userModel from "../models/userModel.js";

//old cart entries were plain numbers (itemId -> qty); normalize to the object shape
const normalizeEntry = (key, entry) => {
    if (typeof entry === "number") {
        return { itemId: key, quantity: entry, addOns: [], spiceLevel: null, notes: "" };
    }
    return entry;
};

//add to user cart, supports optional customization (add-ons, spice level, notes)
const addToCart = async (req, res) => {
    try {
        const { itemId, cartKey, quantity = 1, addOns = [], spiceLevel = null, notes = "", unitPrice } = req.body;
        const key = cartKey || itemId;

        let userData = await userModel.findById(req.body.userId);
        let cartData = userData.cartData || {};

        const existing = normalizeEntry(key, cartData[key]);
        cartData[key] = {
            itemId,
            quantity: (existing?.quantity || 0) + quantity,
            addOns,
            spiceLevel,
            notes,
            unitPrice
        };

        await userModel.findByIdAndUpdate(req.body.userId, { cartData });
        res.json({ success: true, message: "Added To Cart" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
}

//remove one unit from a cart line, identified by cartKey (falls back to itemId for simple items)
const removeFromCart = async (req, res) => {
    try {
        const { cartKey, itemId } = req.body;
        const key = cartKey || itemId;

        let userData = await userModel.findById(req.body.userId);
        let cartData = userData.cartData || {};
        const existing = normalizeEntry(key, cartData[key]);

        if (existing && existing.quantity > 0) {
            existing.quantity -= 1;
            if (existing.quantity <= 0) {
                delete cartData[key];
            } else {
                cartData[key] = existing;
            }
        }

        await userModel.findByIdAndUpdate(req.body.userId, { cartData });
        res.json({ success: true, message: "Removed From Cart" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });

    }

}

//remove a cart line entirely, regardless of quantity
const clearCartItem = async (req, res) => {
    try {
        const { cartKey } = req.body;
        let userData = await userModel.findById(req.body.userId);
        let cartData = userData.cartData || {};
        delete cartData[cartKey];
        await userModel.findByIdAndUpdate(req.body.userId, { cartData });
        res.json({ success: true, message: "Removed From Cart" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
}

//fetch user cart data
const getCart = async (req, res) => {
    try {
        let userData = await userModel.findById(req.body.userId);
        let cartData = userData.cartData || {};
        res.json({ success: true, cartData })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
}

export { addToCart, removeFromCart, clearCartItem, getCart }