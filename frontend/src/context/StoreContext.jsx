import axios from "axios";
import React, { createContext, useState, useEffect } from "react";

export const StoreContext = createContext(null);
//find out what this does and why we use it
const StoreContextProvider = (props) => {

    const [cartItems, setCartItems] = useState(() => {
        const savedCart = localStorage.getItem("cartItems");
        return savedCart ? JSON.parse(savedCart) : {};
    });

    const [drawerOpen, setDrawerOpen] = useState(false)

    const url = "http://localhost:4000"
    const [token, setToken] = useState("");
    const [user, setUser] = useState(null);
    const [food_list, setFoodList] = useState([]);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        localStorage.setItem("cartItems", JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = async (itemId) => {
        if (!cartItems[itemId]) {
            setCartItems(prev => ({ ...prev, [itemId]: 1 }));
        }
        else {
            setCartItems(prev => ({ ...prev, [itemId]: prev[itemId] + 1 }));
        }
        if (token) {
            await axios.post(url + "/api/cart/add", { itemId }, { headers: { token } });
        }
    }

    const removeFromCart = async (itemId) => {
        setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }));
        if (token) {
            await axios.post(url + "/api/cart/remove", { itemId }, { headers: { token } });
        }
    }

    const getTotalCartAmount = () => {
        let totalAmount = 0;
        for (const item in cartItems) {
            if (cartItems[item] > 0) {
                const itemInfo = food_list.find((product) => product._id === item);
                if (itemInfo) {
                    totalAmount += itemInfo.price * cartItems[item];
                }
            }
        }
        return totalAmount;
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
            setCartItems(response?.data?.cartData || {});
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
        for (const item in cartItems){
            if (cartItems[item] > 0){
                totalCount += cartItems[item];
            }
        }
        return totalCount;
    }

    const contextValue = {
        food_list,
        cartItems,
        setCartItems,
        addToCart,
        removeFromCart,
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