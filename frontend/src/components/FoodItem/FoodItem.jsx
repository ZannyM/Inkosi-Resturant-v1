import React, { useState, useContext, createContext } from 'react'
import './FoodItem.css'
import { assets } from '../../assets/assets'
import { StoreContext } from '../../context/StoreContext'

const FoodItem = ({ id, name, price, description, image }) => {
    //revisit this aswell
    // const [itemCount, setItemCount] = useState(0);
    const {cartItems, addToCart, removeFromCart,url} = useContext(StoreContext);

    return (
        <div className='food-item'>
            <div className="food-item-img-container">
                <img className='food-item-image' src={url+"/images/"+image} alt="" />
                {!cartItems[id]
                    ? <img className='add' onClick={() => addToCart(id)} src={assets.add_icon_white} alt="" />
                    : <div className="food-item-counter">
                        <img onClick={() => removeFromCart(id)} src={assets.remove_icon_red} alt="" />
                        <p>{cartItems[id]}</p>
                        <img onClick={() => addToCart(id)} src={assets.add_icon_green} alt=""/>

                    </div>
                }
            </div>
            <div className="food-item-info">
                <div className="food-item-name-rating">
                    <p>{name}</p>
                    <img src={assets.rating_starts} alt="" />
                </div>
                <p className="food-item-desc">{description}</p>
                <p className="food-item-price">R{price}</p>
            </div>

        </div>
    )
}
//currently appends all items to the food display, we need to filter them based on the category selected in the explore menu.
export default FoodItem
