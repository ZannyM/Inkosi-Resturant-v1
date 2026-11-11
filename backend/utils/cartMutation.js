import { applyCartOperation, CartError } from "./cartOperations.js";

const mutateCart = async (store, userId, operation) => {
    for (let attempt = 0; attempt < 20; attempt += 1) {
        const user = await store.read(userId);
        if (!user) throw new CartError("User not found", 404);
        const next = applyCartOperation({ cartData: user.cartData, savedData: user.savedData, mergeIds: user.cartMergeIds, mergeDigests: user.cartMergeDigests }, operation);
        if (next.unchanged) return next;
        if (Buffer.byteLength(JSON.stringify({ cartData: next.cartData, savedData: next.savedData, mergeIds: next.mergeIds, mergeDigests: next.mergeDigests })) > 1024 * 1024) {
            throw new CartError("Cart data limit reached", 409);
        }
        const updated = await store.compareAndSwap(userId, user.cartRevision, next);
        if (updated) return { cartData: updated.cartData || {}, savedData: updated.savedData || {} };
    }
    throw new CartError("Cart changed concurrently; retry request", 409);
};

export { mutateCart };