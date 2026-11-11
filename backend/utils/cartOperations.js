import { isDeepStrictEqual } from "node:util";
import { createHash } from "node:crypto";

const MAX_LINES = 500;
const MAX_QUANTITY = 10000;
const MAX_MERGES = 10000;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

class CartError extends Error {
    constructor(message, status = 400) {
        super(message);
        this.status = status;
    }
}

const fail = (message, status) => { throw new CartError(message, status); };
const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value) && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
const validateKey = (key) => {
    if (typeof key !== "string" || key.length < 1 || key.length > 2048 || key.includes(".") || key.includes("$") || key.includes("\0") || ["__proto__", "prototype", "constructor"].includes(key)) fail("Invalid cart key");
    return key;
};
const validateText = (value, limit, field) => {
    if (typeof value !== "string" || value.length > limit || value.includes("\0")) fail(`Invalid ${field}`);
};
const validateQuantity = (quantity) => {
    if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) fail("Invalid quantity");
};
const validateEntry = (key, entry) => {
    if (typeof entry === "number") {
        validateQuantity(entry);
        return;
    }
    if (!isObject(entry)) fail("Invalid cart entry");
    const allowed = ["itemId", "quantity", "addOns", "spiceLevel", "notes", "unitPrice"];
    if (Object.keys(entry).some((field) => !allowed.includes(field))) fail("Invalid cart entry field");
    validateKey(entry.itemId);
    validateQuantity(entry.quantity);
    if (entry.addOns !== undefined) {
        if (!Array.isArray(entry.addOns) || entry.addOns.length > 50) fail("Invalid add-ons");
        for (const addOn of entry.addOns) {
            if (!isObject(addOn) || Object.keys(addOn).some((field) => !["name", "price", "_id"].includes(field))) fail("Invalid add-on");
            validateText(addOn.name, 200, "add-on name");
            if (addOn._id !== undefined) validateKey(addOn._id);
            if (addOn.price !== undefined && (typeof addOn.price !== "number" || !Number.isFinite(addOn.price) || addOn.price < 0 || addOn.price > 1000000)) fail("Invalid add-on price");
        }
    }
    if (entry.spiceLevel !== undefined && entry.spiceLevel !== null) validateText(entry.spiceLevel, 100, "spice level");
    if (entry.notes !== undefined) validateText(entry.notes, 2000, "notes");
    if (entry.unitPrice !== undefined && (typeof entry.unitPrice !== "number" || !Number.isFinite(entry.unitPrice) || entry.unitPrice < 0 || entry.unitPrice > 1000000)) fail("Invalid unit price");
};
const validateData = (data) => {
    if (!isObject(data) || Object.keys(data).length > MAX_LINES) fail("Invalid cart data");
    for (const [key, entry] of Object.entries(data)) {
        validateKey(key);
        validateEntry(key, entry);
    }
};
const normalized = (key, entry) => typeof entry === "number"
    ? { itemId: key, quantity: entry, addOns: [], spiceLevel: null, notes: "" }
    : { ...entry, addOns: entry.addOns ?? [], spiceLevel: entry.spiceLevel ?? null, notes: entry.notes ?? "" };
const combine = (key, existing, incoming) => {
    if (existing === undefined) return structuredClone(incoming);
    const left = normalized(key, existing);
    const right = normalized(key, incoming);
    const { quantity: leftQuantity, unitPrice: leftPrice } = left;
    const { quantity: rightQuantity, unitPrice: rightPrice } = right;
    const leftOptions = { itemId: left.itemId, notes: left.notes, spiceLevel: left.spiceLevel, addOns: left.addOns.map((addOn) => addOn.name).sort() };
    const rightOptions = { itemId: right.itemId, notes: right.notes, spiceLevel: right.spiceLevel, addOns: right.addOns.map((addOn) => addOn.name).sort() };
    if (!isDeepStrictEqual(leftOptions, rightOptions)) fail("Cart key has conflicting customization", 409);
    const quantity = leftQuantity + rightQuantity;
    validateQuantity(quantity);
    if (typeof existing === "number" && typeof incoming === "number") return quantity;
    const result = { ...left, quantity };
    if (leftPrice === undefined && rightPrice !== undefined) result.unitPrice = rightPrice;
    return result;
};
const mergeData = (destination, source) => {
    for (const [key, entry] of Object.entries(source)) destination[key] = combine(key, destination[key], entry);
    validateData(destination);
};
const canonical = (value) => {
    if (Array.isArray(value)) return value.map(canonical);
    if (isObject(value)) return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonical(value[key])]));
    return value;
};
const applyCartOperation = (state, operation) => {
    const cartData = structuredClone(state.cartData || {});
    const savedData = structuredClone(state.savedData || {});
    const mergeIds = [...(state.mergeIds || [])];
    const mergeDigests = [...(state.mergeDigests || [])];
    validateData(cartData);
    validateData(savedData);
    if (operation.type === "merge") {
        if (typeof operation.mergeId !== "string" || !UUID.test(operation.mergeId)) fail("Invalid mergeId");
        const mergeId = operation.mergeId.toLowerCase();
        validateData(operation.cartData);
        validateData(operation.savedData);
        const digest = createHash("sha256").update(JSON.stringify(canonical({ cartData: operation.cartData, savedData: operation.savedData }))).digest("hex");
        const mergeIndex = mergeIds.indexOf(mergeId);
        if (mergeIndex !== -1) {
            if (mergeDigests[mergeIndex] !== digest) fail("mergeId already used for different data", 409);
            return { cartData, savedData, mergeIds, mergeDigests, unchanged: true };
        }
        if (mergeIds.length >= MAX_MERGES) fail("Merge history limit reached", 409);
        mergeData(cartData, operation.cartData);
        mergeData(savedData, operation.savedData);
        mergeIds.push(mergeId);
        mergeDigests.push(digest);
    } else if (operation.type === "add") {
        const key = validateKey(operation.key);
        validateEntry(key, operation.entry);
        cartData[key] = combine(key, cartData[key], operation.entry);
        validateData(cartData);
    } else if (operation.type === "remove") {
        const key = validateKey(operation.key);
        const entry = cartData[key];
        if (entry !== undefined) {
            const quantity = typeof entry === "number" ? entry : entry.quantity;
            if (quantity === 1) delete cartData[key];
            else cartData[key] = typeof entry === "number" ? quantity - 1 : { ...entry, quantity: quantity - 1 };
        }
    } else if (operation.type === "clear" || operation.type === "savedRemove") {
        const key = validateKey(operation.key);
        delete (operation.type === "clear" ? cartData : savedData)[key];
    } else if (operation.type === "move") {
        const key = validateKey(operation.key);
        if (operation.to !== "cart" && operation.to !== "saved") fail("Invalid move destination");
        const source = operation.to === "saved" ? cartData : savedData;
        const destination = operation.to === "saved" ? savedData : cartData;
        if (source[key] !== undefined) {
            destination[key] = combine(key, destination[key], source[key]);
            delete source[key];
            validateData(destination);
        }
    } else fail("Invalid cart operation");
    return { cartData, savedData, mergeIds, mergeDigests };
};

export { applyCartOperation, CartError };