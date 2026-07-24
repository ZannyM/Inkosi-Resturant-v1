import React, { useContext } from 'react'
import './Cart.css'
import { StoreContext } from '../../context/StoreContext'
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';
import RestaurantClosedPopup from '../../components/RestaurantClosedPopup/RestaurantClosedPopup';

const Cart = () => {

  const { cartItems, food_list, removeFromCart, getTotalCartAmount, url, token } = useContext(StoreContext);
  const [showClosedPopup, setShowClosedPopup] = useState(false);
  const [closedMessage, setClosedMessage] = useState('');
  const [operatingHours, setOperatingHours] = useState('10:00 AM - 10:00 PM (All week)');

  const navigate = useNavigate();

  const openClosedPopup = (message, hours) => {
    setClosedMessage(message || 'Restaurant is currently closed.');
    setOperatingHours(hours || '10:00 AM - 10:00 PM (All week)');
    setShowClosedPopup(true);
  }

  const isStoreClosed = (statusData) => {
    if (!statusData) return false;
    if (statusData.isAcceptingOrders === false) return true;
    if (statusData.isStoreLive === false) return true;
    if (statusData.closedReason === 'KITCHEN_PAUSED' || statusData.closedReason === 'OUTSIDE_OPERATING_HOURS') return true;
    return false;
  }

  const getClosedMessage = (closedReason) => {
    if (closedReason === 'KITCHEN_PAUSED') {
      return "Kitchen isn't operational today. Please check back later.";
    }

    return 'Restaurant is currently closed. Please place your order during operational hours.';
  }

  const handleProceedToCheckout = async () => {
    if (!token) {
      navigate('/', {
        state: {
          openLogin: true,
          promptMessage: 'Please sign in to continue to checkout.',
          redirectAfterLogin: '/checkout'
        }
      });
      return;
    }

    try {
      const response = await axios.get(`${url}/api/store/status`);
      const statusData = response?.data?.data;
      if (response?.data?.success && isStoreClosed(statusData)) {
        openClosedPopup(
          getClosedMessage(statusData.closedReason),
          statusData.operatingHours
        );
        return;
      }
    } catch (error) {
      // Backend will still enforce closure at place-order time.
    }

    navigate('/checkout');
  };

  return (
    <>
      <RestaurantClosedPopup
        open={showClosedPopup}
        onClose={() => setShowClosedPopup(false)}
        message={closedMessage}
        operatingHours={operatingHours}
      />
      <div className='cart'>
      <div className="cart-items">
        <div className="cart-items-title">
          <p>Items</p>
          <p>Title</p>
          <p>Price</p>
          <p>Quantity</p>
          <p>Total</p>
          <p>Remove</p>
        </div>
        <br />
        <hr />
        {food_list.map((item, index) => {
          if (cartItems[item._id] > 0) {
            return (
              <div>
                <div className="cart-items-title cart-items-item">
                  <img src={url+"/images/"+item.image} alt="" />
                  <p>{item.name}</p>
                  <p>R{item.price}</p>
                  <p>{cartItems[item._id]}</p>
                  <p>R{item.price * cartItems[item._id]}</p>
                  <p onClick={() => removeFromCart(item._id)} className='cross'>x</p>
                </div>
                <hr />

              </div>

            )
          }

        })}
      </div>
      <div className="cart-bottom">
        <div className="cart-total">
          <h2>Cart Totals</h2>
          <div>
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>R {getTotalCartAmount()}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Delivery Fee</p>
              <p>R {getTotalCartAmount() === 0 ? 0 : 2}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <b>Total</b>
              <b>R {getTotalCartAmount() == 0 ? 0 : getTotalCartAmount() + 2}</b>
            </div>
          </div>
          <button onClick={handleProceedToCheckout}>PROCEED TO CHECKOUT</button>
        </div>
        <div className="cart-promocode">
          <div>
            <p>If you have a promo code, Enter it here</p>
            <div className='cart-promocode-input'>
              <input type="text" placeholder='promo code' />
              <button>Submit</button>
            </div>
          </div>
        </div>
      </div>

      </div>
    </>
  )
}

export default Cart
