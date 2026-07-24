import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';
import './CartDrawer.css';
import axios from 'axios';
import RestaurantClosedPopup from '../RestaurantClosedPopup/RestaurantClosedPopup';

export function CartDrawer({ drawerOpen = false, setDrawerOpen = () => { }, openLoginPrompt = () => {} }) {
  const { cartItems, food_list, addToCart, removeFromCart, url, token } = useContext(StoreContext);
  const [showClosedPopup, setShowClosedPopup] = useState(false);
  const [closedMessage, setClosedMessage] = useState('');
  const [operatingHours, setOperatingHours] = useState('10:00 AM - 10:00 PM (All week)');

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  const cartList = (food_list || []).filter((item) => {
    const itemId = item._id || item.id;
    return cartItems[itemId] > 0;
  });

  const subtotal = cartList.reduce((acc, item) => {
    const itemId = item._id || item.id;
    return acc + item.price * cartItems[itemId];
  }, 0);

  const deliveryFee = subtotal > 0 ? 35 : 0;
  const grandTotal = subtotal + deliveryFee;

  const removeItemCompletely = (id) => {
    const currentQty = cartItems[id] || 0;
    for (let i = 0; i < currentQty; i++) {
      removeFromCart(id);
    }
  };

  const navigate = useNavigate();

  const openClosedPopup = (message, hours) => {
    setClosedMessage(message || 'Restaurant is currently closed.');
    setOperatingHours(hours || '10:00 AM - 10:00 PM (All week)');
    setShowClosedPopup(true);
  }

  const getClosedMessage = (closedReason) => {
    if (closedReason === 'KITCHEN_PAUSED') {
      return "Kitchen isn't operational today. Please check back later.";
    }

    return 'Restaurant is currently closed. Please place your order during operational hours.';
  }

  const isStoreClosed = (statusData) => {
    if (!statusData) return false;
    if (statusData.isAcceptingOrders === false) return true;
    if (statusData.isStoreLive === false) return true;
    if (statusData.closedReason === 'KITCHEN_PAUSED' || statusData.closedReason === 'OUTSIDE_OPERATING_HOURS') return true;
    return false;
  }

  const goToCheckout = async () => {
    if (!token && cartList.length > 0) {
      setDrawerOpen(false);
      openLoginPrompt('You added items as a guest. Please log in to checkout.', '/checkout');
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

    setDrawerOpen(false);
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
      {/* Dims Backdrop */}
      <div
        onClick={() => setDrawerOpen(false)}
        className={`cart-backdrop ${drawerOpen ? 'open' : ''}`}
      />

      {/* Slide-Over Drawer */}
      <aside
        className={`cart-drawer ${drawerOpen ? 'open' : ''}`}
        aria-hidden={!drawerOpen}
      >
        <div className="cart-header">
          <div>
            <div className="eyebrow">Your table</div>
            <h2 className="cart-title">The Cart</h2>
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            aria-label="Close cart"
            className="icon-button close-btn"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Empty State */}
        {cartList.length === 0 ? (
          <div className="cart-empty">
            <div className="empty-placeholder-circle" />
            <p className="empty-title">Nothing here yet</p>
            <p className="empty-subtitle">
              Choose a dish and it will appear here quietly.
            </p>
            <a
              href="/menu"
              onClick={() => setDrawerOpen(false)}
              className="btn-browse"
            >
              Browse the menu
            </a>
          </div>
        ) : (
          /* Populated Cart Content */
          <>
            <div className="cart-items-list">
              <ul className="items-ul">
                {cartList.map((item) => {
                  const id = item._id || item.id;
                  const qty = cartItems[id];
                  const itemImageUrl = url ? `${url}/images/${item.image}` : item.image;

                  return (
                    <li key={id} className="cart-item">
                      <img
                        src={itemImageUrl}
                        alt={item.name}
                        className="item-image"
                      />
                      <div className="item-details">
                        <div className="item-header">
                          <h3 className="item-name">{item.name}</h3>
                          <button
                            onClick={() => removeItemCompletely(id)}
                            className="remove-btn"
                            aria-label="Remove item"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <line x1="18" y1="6" x2="6" y2="18"></line>
                              <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                          </button>
                        </div>

                        <p className="item-price">R{item.price.toFixed(2)} each</p>

                        <div className="item-footer">
                          {/* Stepper matching design */}
                          <div className="cart-drawer-stepper">
                            <button
                              onClick={() => removeFromCart(id)}
                              className="stepper-btn"
                              aria-label="Decrease quantity"
                            >
                              -
                            </button>
                            <span className="stepper-qty">{qty}</span>
                            <button
                              onClick={() => addToCart(id)}
                              className="stepper-btn"
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>

                          <span className="item-total-price">
                            R{(item.price * qty).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Subtotal & Checkout Footer */}
            <div className="cart-footer">
              <div className="cart-summary-row">
                <span>Subtotal</span>
                <span>R{subtotal.toFixed(2)}</span>
              </div>
              <div className="cart-summary-row">
                <span>Delivery</span>
                <span>R{deliveryFee.toFixed(2)}</span>
              </div>

              <div className="total-row">
                <span className="eyebrow">Total</span>
                <span className="total-amount">R{grandTotal.toFixed(2)}</span>
              </div>

              <button
                type="button"
                className="btn-checkout"
                onClick={goToCheckout}
              >
                PROCEED TO CHECKOUT
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}

export default CartDrawer;