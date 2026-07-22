import React, { useContext } from 'react'
import './FoodItem.css'
import { assets } from '../../assets/assets'
import { StoreContext } from '../../context/StoreContext'

const FoodItem = ({ id, name, price, description, image }) => {
    const { cartItems, addToCart, removeFromCart, url } = useContext(StoreContext)

    return (
        <article className="food-item">
            <div className="food-item-img-wrap">
                <img
                    className="food-item-image"
                    src={url + "/images/" + image}
                    alt={name}
                    loading="lazy"
                />
                <div className="food-item-overlay" />

                {!cartItems[id] ? (
                    <button
                        className="food-item-add-btn"
                        onClick={() => addToCart(id)}
                        aria-label={`Add ${name} to cart`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Add
                    </button>
                ) : (
                    <div className="food-item-counter">
                        <img
                            onClick={() => removeFromCart(id)}
                            src={assets.remove_icon_red}
                            alt="Remove one"
                        />
                        <p>{cartItems[id]}</p>
                        <img
                            onClick={() => addToCart(id)}
                            src={assets.add_icon_green}
                            alt="Add one more"
                        />
                    </div>
                )}
            </div>

            <div className="food-item-info">
                <h3 className="food-item-name">{name}</h3>
                <span className="food-item-price">R{price}</span>
            </div>
            <p className="food-item-desc">{description}</p>
        </article>
    )
}

export default FoodItem

// import React, { useState, useContext, createContext } from 'react'
// import './FoodItem.css'
// import { assets } from '../../assets/assets'
// import { StoreContext } from '../../context/StoreContext'

// const FoodItem = ({ id, name, price, description, image }) => {
//     //revisit this aswell
//     // const [itemCount, setItemCount] = useState(0);
//     const {cartItems, addToCart, removeFromCart,url} = useContext(StoreContext);

//     return (
//         <div className='food-item'>
//             <div className="food-item-img-container">
//                 <img className='food-item-image' src={url+"/images/"+image} alt="" />
//                 {!cartItems[id]
//                     ? <img className='add' onClick={() => addToCart(id)} src={assets.add_icon_white} alt="" />
//                     : <div className="food-item-counter">
//                         <img onClick={() => removeFromCart(id)} src={assets.remove_icon_red} alt="" />
//                         <p>{cartItems[id]}</p>
//                         <img onClick={() => addToCart(id)} src={assets.add_icon_green} alt=""/>

//                     </div>
//                 }
//             </div>
//             <div className="food-item-info">
//                 <div className="food-item-name-rating">
//                     <p>{name}</p>
//                     <img src={assets.rating_starts} alt="" />
//                 </div>
//                 <p className="food-item-desc">{description}</p>
//                 <p className="food-item-price">R{price}</p>
//             </div>

//         </div>
//     )
// }
// //currently appends all items to the food display, we need to filter them based on the category selected in the explore menu.
// export default FoodItem
