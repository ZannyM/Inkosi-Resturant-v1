import axios from "axios";
import React, { createContext, useState, useEffect } from "react";

export const StoreContext = createContext(null);

//old carts stored plain numbers (itemId -> qty); upgrade them to the customization-aware shape
const normalizeCartItems = (raw) => {
    if (!raw || typeof raw !== "object") return {};
    const normalized = {};
    for (const key in raw) {
        const entry = raw[key];
        normalized[key] = typeof entry === "number"
            ? { itemId: key, quantity: entry, addOns: [], spiceLevel: null, notes: "" }
            : entry;
    }
    return normalized;
};

//find out what this does and why we use it
const StoreContextProvider = (props) => {

    const [cartItems, setCartItems] = useState(() => {
        const savedCart = localStorage.getItem("cartItems");
        return savedCart ? normalizeCartItems(JSON.parse(savedCart)) : {};
    });

    const [drawerOpen, setDrawerOpen] = useState(false)

    const url = import.meta.env.VITE_API_URL || `${window.location.protocol}//${window.location.hostname}:4000`
    const [token, setToken] = useState("");
    const [user, setUser] = useState(null);
    const [food_list, setFoodList] = useState([]);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        localStorage.setItem("cartItems", JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = async (itemId, options = null) => {
        const food = food_list.find((f) => (f._id || f.id) === itemId);
        const basePrice = food ? food.price : 0;
        const addOns = options?.addOns || [];
        const spiceLevel = options?.spiceLevel || null;
        const notes = options?.notes || "";
        const quantityToAdd = options?.quantity || 1;
        const addOnsTotal = addOns.reduce((sum, addOn) => sum + (addOn.price || 0), 0);
        const unitPrice = basePrice + addOnsTotal;
        const hasCustomization = addOns.length > 0 || Boolean(notes.trim()) || Boolean(spiceLevel);
        // Plain items keep a simple itemId key so the quick +/- buttons keep working;
        // customized items get their own cart line so they don't merge with the plain one.
        const cartKey = hasCustomization
            ? `${itemId}__${encodeURIComponent(JSON.stringify({ addOns: addOns.map((a) => a.name).sort(), spiceLevel, notes }))}`
            : itemId;

        setCartItems((prev) => {
            const existing = prev[cartKey];
            return {
                ...prev,
                [cartKey]: {
                    itemId,
                    quantity: (existing?.quantity || 0) + quantityToAdd,
                    addOns,
                    spiceLevel,
                    notes,
                    unitPrice
                }
            };
        });

        if (token) {
            await axios.post(url + "/api/cart/add", { itemId, cartKey, quantity: quantityToAdd, addOns, spiceLevel, notes, unitPrice }, { headers: { token } });
        }
    }

    const removeFromCart = async (cartKey) => {
        setCartItems((prev) => {
            const existing = prev[cartKey];
            if (!existing) return prev;
            const nextQuantity = existing.quantity - 1;
            if (nextQuantity <= 0) {
                const { [cartKey]: _removed, ...rest } = prev;
                return rest;
            }
            return { ...prev, [cartKey]: { ...existing, quantity: nextQuantity } };
        });

        if (token) {
            await axios.post(url + "/api/cart/remove", { cartKey }, { headers: { token } });
        }
    }

    //fully remove a cart line regardless of its quantity
    const clearCartItem = async (cartKey) => {
        setCartItems((prev) => {
            const { [cartKey]: _removed, ...rest } = prev;
            return rest;
        });

        if (token) {
            await axios.post(url + "/api/cart/clear", { cartKey }, { headers: { token } });
        }
    }

    const getTotalCartAmount = () => {
        let totalAmount = 0;
        for (const cartKey in cartItems) {
            const entry = cartItems[cartKey];
            if (entry && entry.quantity > 0) {
                const itemInfo = food_list.find((product) => product._id === entry.itemId);
                const price = entry.unitPrice ?? itemInfo?.price ?? 0;
                totalAmount += price * entry.quantity;
            }
        }
        return totalAmount;
    }

    //combines cart entries with food_list details for display (name, image) and order submission
    const getCartDetails = () => {
        return Object.entries(cartItems)
            .map(([cartKey, entry]) => {
                if (!entry || entry.quantity <= 0) return null;
                const food = food_list.find((f) => (f._id || f.id) === entry.itemId);
                if (!food) return null;
                const unitPrice = entry.unitPrice ?? food.price;
                return {
                    cartKey,
                    itemId: entry.itemId,
                    _id: food._id || food.id,
                    name: food.name,
                    image: food.image,
                    basePrice: food.price,
                    price: unitPrice,
                    quantity: entry.quantity,
                    addOns: entry.addOns || [],
                    spiceLevel: entry.spiceLevel || null,
                    notes: entry.notes || "",
                    lineTotal: unitPrice * entry.quantity
                };
            })
            .filter(Boolean);
    }
    //setup to load food item options from the database
    const fetchFoodList = async () => {
        try {
            const response = await axios.get(url + "/api/food/list");
            setFoodList(response?.data?.data || []);
        } catch (error) {
            console.error("Failed to fetch food list", error);
            setFoodList([]);
        }
    }
    //ensure that when i reload the page the cart data still remains the same and doesnt reset 
    //therefore the storefront cartdata === database data
    const loadCartData = async (token) => {
        try {
            const response = await axios.get(url + "/api/cart/get", { headers: { token } });
            setCartItems(normalizeCartItems(response?.data?.cartData));
        } catch (error) {
            console.error("Failed to load cart data", error);
            setCartItems({});
        }
    }

    const loadUserProfile = async (token) => {
        try {
            const response = await axios.get(url + "/api/user/profile", { headers: { token } });
            if (response?.data?.success) {
                setUser(response.data.user);
            }
        } catch (error) {
            console.error("Failed to load user profile", error);
            setUser(null);
        }
    }
    //when reload webpage, it doesnt log out
    useEffect(() => {
        async function loadData() {
            try {
                await fetchFoodList();
                const savedToken = localStorage.getItem("token");
                if (savedToken) {
                    setToken(savedToken);
                    await loadCartData(savedToken);
                    await loadUserProfile(savedToken);
                }
            } catch (error) {
                console.error("Failed to initialize store data", error);
            } finally {
                setIsInitialized(true);
            }
        }
        loadData();
    }, []);
  

    const getTotalCartCount = () =>{
        let totalCount = 0;
        for (const cartKey in cartItems){
            totalCount += cartItems[cartKey]?.quantity || 0;
        }
        return totalCount;
    }

    const contextValue = {
        food_list,
        cartItems,
        setCartItems,
        addToCart,
        removeFromCart,
        clearCartItem,
        getCartDetails,
        getTotalCartCount,
        getTotalCartAmount,
        url,
        token,
        setToken,
        user,
        setUser,
        drawerOpen,
        setDrawerOpen,
        isInitialized

    }
    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    )

}
export default StoreContextProvider;