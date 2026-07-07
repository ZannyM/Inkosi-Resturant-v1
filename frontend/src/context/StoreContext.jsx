import axios from "axios";
import React, { createContext, useState, useEffect } from "react";

export const StoreContext = createContext(null);
//find out what this does and why we use it
const StoreContextProvider = (props) => {

    const [cartItems, setCartItems] = useState({});

    const url = "http://localhost:4000"
    const [token, setToken] = useState("");
    const [food_list, setFoodList] = useState([]);

    const addToCart = (itemId) => {
        if (!cartItems[itemId]) {
            setCartItems(prev => ({ ...prev, [itemId]: 1 }));
        }
        else {
            setCartItems(prev => ({ ...prev, [itemId]: prev[itemId] + 1 }));
        }
    }

    const removeFromCart = (itemId) => {
        setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }));
    }

    const getTotalCartAmount = () => {
        let totalAmount = 0;
        for (const item in cartItems) {
            if (cartItems[item] > 0) {
                let itemInfo = food_list.find((product) => product._id === item);
                totalAmount += itemInfo.price * cartItems[item];
            }
        }
        return totalAmount;
    }
    //setup to load food item options from the database
    const fetchFoodList = async () => {
        const resposne = await axios.get(url + "/api/food/list");
        setFoodList(resposne.data.data)
    }



    //when reload webpage, it doesnt log out
    useEffect(() => {
        async function loadData() {
            await fetchFoodList();
            if (localStorage.getItem("token")) {
                setToken(localStorage.getItem("token"));
            }
        }
        loadData();
    }, []);
    // useEffect(() => {
    //     console.log(cartItems);
    // }, [cartItems]);

    const contextValue = {
        food_list,
        cartItems,
        setCartItems,
        addToCart,
        removeFromCart,
        getTotalCartAmount,
        url,
        token,
        setToken

    }
    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    )

}
export default StoreContextProvider;