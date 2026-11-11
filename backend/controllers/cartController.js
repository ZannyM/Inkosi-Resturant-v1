import userModel from "../models/userModel.js";
import { CartError } from "../utils/cartOperations.js";
import { mutateCart } from "../utils/cartMutation.js";

const store = {
    read: (userId) => userModel.findById(userId).select("cartData savedData cartRevision cartMergeIds cartMergeDigests").lean(),
    compareAndSwap: (userId, revision, state) => userModel.findOneAndUpdate(
        { _id: userId, cartRevision: revision === undefined ? { $exists: false } : revision },
        { $set: { cartData: state.cartData, savedData: state.savedData, cartMergeIds: state.mergeIds, cartMergeDigests: state.mergeDigests }, $inc: { cartRevision: 1 } },
        { returnDocument: "after" }
    ).lean()
};

const respondError = (res, error) => {
    if (error instanceof CartError) return res.status(error.status).json({ success: false, message: error.message });
    console.log(error);
    return res.status(500).json({ success: false, message: "Error" });
};

const handler = (makeOperation, message) => async (req, res) => {
    try {
        const state = await mutateCart(store, req.body.userId, makeOperation(req.body));
        res.json({ success: true, ...(message ? { message } : {}), cartData: state.cartData, savedData: state.savedData });
    } catch (error) {
        respondError(res, error);
    }
};

const addToCart = handler(({ itemId, cartKey, quantity = 1, addOns = [], spiceLevel = null, notes = "", unitPrice }) => ({
    type: "add", key: cartKey || itemId,
    entry: { itemId, quantity, addOns, spiceLevel, notes, ...(unitPrice === undefined ? {} : { unitPrice }) }
}), "Added To Cart");
const removeFromCart = handler(({ cartKey, itemId }) => ({ type: "remove", key: cartKey || itemId }), "Removed From Cart");
const clearCartItem = handler(({ cartKey }) => ({ type: "clear", key: cartKey }), "Removed From Cart");
const mergeCart = handler(({ mergeId, cartData, savedData }) => ({ type: "merge", mergeId, cartData, savedData }));
const moveCartItem = handler(({ cartKey, to }) => ({ type: "move", key: cartKey, to }));
const removeSavedItem = handler(({ cartKey }) => ({ type: "savedRemove", key: cartKey }));

const getCart = async (req, res) => {
    try {
        const user = await store.read(req.body.userId);
        if (!user) throw new CartError("User not found", 404);
        res.json({ success: true, cartData: user.cartData || {}, savedData: user.savedData || {} });
    } catch (error) {
        respondError(res, error);
    }
};

export { addToCart, removeFromCart, clearCartItem, getCart, mergeCart, moveCartItem, removeSavedItem };