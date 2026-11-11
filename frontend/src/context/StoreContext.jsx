import axios from "axios";
import { createContext, useState, useEffect, useRef } from "react";

export const StoreContext = createContext(null);

const GUEST_CART = "guestCartItems";
const GUEST_SAVED = "guestSavedItems";
const PENDING_MERGE = "pendingCartMerge";

const readStored = (key, fallback = {}) => {
    const value = localStorage.getItem(key);
    if (!value) return fallback;
    try {
        return JSON.parse(value);
    } catch {
        throw new Error(`Could not read locally stored ${key}. Your data has not been removed.`);
    }
};

const safeKey = (key) => key.replaceAll(".", "%2E").replaceAll("$", "%24").replaceAll("\0", "%00");
const newMergeId = () => {
    if (crypto.randomUUID) return crypto.randomUUID();
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 15) | 64;
    bytes[8] = (bytes[8] & 63) | 128;
    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};
const optionsOf = (entry) => JSON.stringify({
    itemId: entry.itemId,
    addOns: (entry.addOns || []).map((addOn) => addOn.name).sort(),
    spiceLevel: entry.spiceLevel || null,
    notes: entry.notes || ""
});

const normalizeCartItems = (raw, escapeKeys = false) => {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error("Invalid stored cart data.");
    const normalized = {};
    for (const [originalKey, value] of Object.entries(raw)) {
        const key = escapeKeys ? safeKey(originalKey) : originalKey;
        const entry = typeof value === "number"
            ? { itemId: originalKey, quantity: value, addOns: [], spiceLevel: null, notes: "" }
            : value;
        if (!entry || typeof entry !== "object") throw new Error("Invalid stored cart entry.");
        if (Object.hasOwn(normalized, key)) {
            if (optionsOf(normalized[key]) !== optionsOf(entry)) throw new Error("Conflicting local cart keys need attention before syncing.");
            normalized[key] = { ...normalized[key], quantity: normalized[key].quantity + entry.quantity };
        } else {
            Object.defineProperty(normalized, key, { value: entry, enumerable: true, writable: true, configurable: true });
        }
    }
    return normalized;
};

const messageFor = (error) => {
    const message = error?.response?.data?.message || error?.message || "Please try again.";
    return message === "Invalid cart key" ? `${message}. An older server cart may need migration; please contact support.` : message;
};
const checked = (response) => {
    if (!response?.data?.success) throw new Error(response?.data?.message || "The server could not update your cart.");
    return response.data;
};

const StoreContextProvider = (props) => {
    const [initialToken] = useState(() => localStorage.getItem("token") || "");
    const [cartItems, updateCartItems] = useState({});
    const [savedItems, updateSavedItems] = useState({});
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [token, updateToken] = useState(initialToken);
    const [user, setUser] = useState(null);
    const [food_list, setFoodList] = useState([]);
    const [isInitialized, setIsInitialized] = useState(false);
    const url = import.meta.env.VITE_API_URL || `${window.location.protocol}//${window.location.hostname}:4000`;
    const session = useRef({ token: initialToken, epoch: 0, ready: false, authenticating: false });
    const current = useRef({ cart: {}, saved: {} });
    const queue = useRef(Promise.resolve());

    const applyState = (cart, saved) => {
        current.current = { cart, saved };
        updateCartItems(cart);
        updateSavedItems(saved);
    };

    const persistGuest = (cart, saved) => {
        localStorage.setItem(GUEST_CART, JSON.stringify(cart));
        localStorage.setItem(GUEST_SAVED, JSON.stringify(saved));
        applyState(cart, saved);
    };

    const readGuest = () => ({
        cart: normalizeCartItems(readStored(GUEST_CART), true),
        saved: normalizeCartItems(readStored(GUEST_SAVED), true)
    });

    const clearGuestStorage = () => {
        localStorage.removeItem(GUEST_CART);
        localStorage.removeItem(GUEST_SAVED);
        localStorage.removeItem(PENDING_MERGE);
    };

    const setCartItems = (value) => {
        try {
            if (!session.current.ready || session.current.authenticating || localStorage.getItem(PENDING_MERGE)) throw new Error("Cart sync is pending. Sign in again to finish syncing.");
            const next = typeof value === "function" ? value(current.current.cart) : value;
            if (session.current.token) applyState(next, current.current.saved);
            else persistGuest(next, current.current.saved);
        } catch (error) {
            alert(messageFor(error));
        }
    };

    const logout = () => {
        const wasLoggedIn = Boolean(session.current.token);
        session.current.epoch += 1;
        session.current.token = "";
        session.current.ready = true;
        session.current.authenticating = false;
        localStorage.removeItem("token");
        if (wasLoggedIn) {
            clearGuestStorage();
            localStorage.removeItem("cartItems");
        }
        updateToken("");
        setUser(null);
        if (wasLoggedIn) applyState({}, {});
        setIsInitialized(true);
    };

    const getSessionVersion = () => session.current.epoch;
    const login = async (newToken, accountId, expectedVersion = session.current.epoch) => {
        const state = session.current;
        if (state.epoch !== expectedVersion) throw new Error("Sign-in was cancelled. Please try again.");
        if (state.authenticating) throw new Error("Sign-in is already in progress.");
        if (state.token) throw new Error("Please log out before signing in to another account.");
        if (!state.ready) throw new Error("The cart is still loading. Please try again.");
        if (!accountId) throw new Error("Could not identify the account for cart sync.");
        state.authenticating = true;
        const epoch = ++state.epoch;
        try {
            await queue.current;
            if (state.epoch !== epoch) throw new Error("Sign-in was cancelled. Please try again.");
            let pending = readStored(PENDING_MERGE, null);
            if (pending && pending.accountId !== accountId) throw new Error("A previous cart sync is pending for another account. Sign in to that account to finish syncing first.");
            if (!pending) {
                pending = { accountId, mergeId: newMergeId(), cartData: current.current.cart, savedData: current.current.saved };
                localStorage.setItem(PENDING_MERGE, JSON.stringify(pending));
            }
            const response = checked(await axios.post(`${url}/api/cart/merge`, {
                mergeId: pending.mergeId, cartData: pending.cartData, savedData: pending.savedData
            }, { headers: { token: newToken } }));
            if (state.epoch !== epoch) throw new Error("Sign-in was cancelled. Retry to finish syncing your cart.");
            const cart = normalizeCartItems(response.cartData);
            const saved = normalizeCartItems(response.savedData);
            localStorage.setItem("token", newToken);
            clearGuestStorage();
            state.token = newToken;
            state.ready = true;
            applyState(cart, saved);
            updateToken(newToken);
            try {
                const profile = checked(await axios.get(`${url}/api/user/profile`, { headers: { token: newToken } }));
                if (state.epoch === epoch && state.token === newToken) setUser(profile.user);
            } catch (error) {
                if (state.epoch === epoch) alert(`Signed in, but could not load your profile: ${messageFor(error)}`);
            }
            if (state.epoch !== epoch || state.token !== newToken) throw new Error("Sign-in was cancelled.");
        } catch (error) {
            throw new Error(messageFor(error), { cause: error });
        } finally {
            if (state.epoch === epoch) state.authenticating = false;
        }
    };

    const setToken = (value) => {
        if (!value) logout();
        else {
            try {
                const payload = JSON.parse(atob(value.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
                return login(value, payload.id);
            } catch {
                return Promise.reject(new Error("Could not identify the account for cart sync."));
            }
        }
    };

    const mutate = (endpoint, payload, guestMutation) => {
        const state = session.current;
        if (!state.ready || state.authenticating || localStorage.getItem(PENDING_MERGE)) {
            alert("Cart sync is pending. Please wait or sign in again to finish syncing.");
            return Promise.resolve(false);
        }
        if (!state.token) {
            try {
                const next = guestMutation(current.current);
                persistGuest(next.cart, next.saved);
                return Promise.resolve(true);
            } catch (error) {
                alert(`Could not update your cart: ${messageFor(error)}`);
                return Promise.resolve(false);
            }
        }
        const requestToken = state.token;
        const epoch = state.epoch;
        const operation = queue.current.then(async () => {
            if (state.epoch !== epoch || state.token !== requestToken) return false;
            try {
                const data = checked(await axios.post(`${url}/api/cart/${endpoint}`, payload, { headers: { token: requestToken } }));
                if (state.epoch !== epoch || state.token !== requestToken) return false;
                applyState(normalizeCartItems(data.cartData), normalizeCartItems(data.savedData));
                return true;
            } catch (error) {
                if (state.epoch === epoch && state.token === requestToken) alert(`Could not update your cart: ${messageFor(error)}`);
                return false;
            }
        });
        queue.current = operation;
        return operation;
    };

    const addToCart = (itemId, options = null) => {
        const food = food_list.find((item) => (item._id || item.id) === itemId);
        const addOns = options?.addOns || [];
        const spiceLevel = options?.spiceLevel || null;
        const notes = options?.notes || "";
        const quantity = options?.quantity || 1;
        const unitPrice = (food?.price || 0) + addOns.reduce((sum, addOn) => sum + (addOn.price || 0), 0);
        const cartKey = addOns.length || notes.trim() || spiceLevel
            ? `${itemId}__${safeKey(encodeURIComponent(JSON.stringify({ addOns: addOns.map((addOn) => addOn.name).sort(), spiceLevel, notes })))}`
            : itemId;
        const entry = { itemId, quantity, addOns, spiceLevel, notes, unitPrice };
        return mutate("add", { ...entry, cartKey }, ({ cart, saved }) => ({
            cart: { ...cart, [cartKey]: { ...entry, quantity: (cart[cartKey]?.quantity || 0) + quantity } }, saved
        }));
    };

    const removeFromCart = (cartKey) => mutate("remove", { cartKey }, ({ cart, saved }) => {
        if (!cart[cartKey]) return { cart, saved };
        const next = { ...cart };
        if (next[cartKey].quantity <= 1) delete next[cartKey];
        else next[cartKey] = { ...next[cartKey], quantity: next[cartKey].quantity - 1 };
        return { cart: next, saved };
    });

    const clearCartItem = (cartKey) => mutate("clear", { cartKey }, ({ cart, saved }) => {
        const next = { ...cart };
        delete next[cartKey];
        return { cart: next, saved };
    });

    const moveItem = (cartKey, to) => mutate("move", { cartKey, to }, ({ cart, saved }) => {
        const source = { ...(to === "saved" ? cart : saved) };
        const destination = { ...(to === "saved" ? saved : cart) };
        if (source[cartKey]) {
            const existing = destination[cartKey];
            if (existing && optionsOf(existing) !== optionsOf(source[cartKey])) throw new Error("Cart key has conflicting customization.");
            destination[cartKey] = existing ? { ...existing, quantity: existing.quantity + source[cartKey].quantity } : source[cartKey];
            delete source[cartKey];
        }
        return to === "saved" ? { cart: source, saved: destination } : { cart: destination, saved: source };
    });
    const saveForLater = (cartKey) => moveItem(cartKey, "saved");
    const moveToCart = (cartKey) => moveItem(cartKey, "cart");
    const removeSavedItem = (cartKey) => mutate("saved/remove", { cartKey }, ({ cart, saved }) => {
        const next = { ...saved };
        delete next[cartKey];
        return { cart, saved: next };
    });

    const details = (items) => Object.entries(items).map(([cartKey, entry]) => {
        if (!entry || entry.quantity <= 0) return null;
        const food = food_list.find((item) => (item._id || item.id) === entry.itemId);
        if (!food) return null;
        const unitPrice = entry.unitPrice ?? food.price;
        return { cartKey, itemId: entry.itemId, _id: food._id || food.id, name: food.name, image: food.image,
            basePrice: food.price, price: unitPrice, quantity: entry.quantity, addOns: entry.addOns || [],
            spiceLevel: entry.spiceLevel || null, notes: entry.notes || "", lineTotal: unitPrice * entry.quantity };
    }).filter(Boolean);
    const getCartDetails = () => details(cartItems);
    const getSavedDetails = () => details(savedItems);
    const getTotalCartCount = () => Object.values(cartItems).reduce((total, entry) => total + (entry?.quantity || 0), 0);
    const getTotalCartAmount = () => Object.values(cartItems).reduce((total, entry) => {
        const food = food_list.find((item) => (item._id || item.id) === entry.itemId);
        return total + (entry.unitPrice ?? food?.price ?? 0) * entry.quantity;
    }, 0);

    useEffect(() => {
        const state = session.current;
        const epoch = ++state.epoch;
        let mounted = true;
        const load = async () => {
            try {
                if (initialToken) {
                    const data = checked(await axios.get(`${url}/api/cart/get`, { headers: { token: initialToken } }));
                    if (state.epoch !== epoch) return;
                    applyState(normalizeCartItems(data.cartData), normalizeCartItems(data.savedData));
                    clearGuestStorage();
                    state.ready = true;
                    try {
                        const profile = checked(await axios.get(`${url}/api/user/profile`, { headers: { token: initialToken } }));
                        if (state.epoch === epoch) setUser(profile.user);
                    } catch (error) {
                        if (state.epoch === epoch) alert(`Could not load your profile: ${messageFor(error)}`);
                    }
                } else {
                    const guest = readGuest();
                    if (state.epoch !== epoch) return;
                    applyState(guest.cart, guest.saved);
                    state.ready = true;
                    if (localStorage.getItem("cartItems")) alert("An older local cart was left untouched because its account ownership cannot be determined. It will not be synced automatically.");
                }
            } catch (error) {
                if (state.epoch === epoch) alert(`Could not load your cart: ${messageFor(error)}`);
            } finally {
                if (state.epoch === epoch) setIsInitialized(true);
            }
        };
        load();
        axios.get(`${url}/api/food/list`).then((response) => {
            if (mounted) setFoodList(response?.data?.data || []);
        }).catch((error) => console.error("Failed to fetch food list", error));
        return () => { mounted = false; if (state.epoch === epoch) state.epoch += 1; };
    }, [initialToken, url]);

    const contextValue = {
        food_list, cartItems, setCartItems, savedItems, addToCart, removeFromCart, clearCartItem,
        saveForLater, moveToCart, removeSavedItem, getCartDetails, getSavedDetails,
        getTotalCartCount, getTotalCartAmount, url, token, setToken, login, logout, getSessionVersion,
        user, setUser, drawerOpen, setDrawerOpen, isInitialized
    };
    return <StoreContext.Provider value={contextValue}>{props.children}</StoreContext.Provider>;
};

export default StoreContextProvider;