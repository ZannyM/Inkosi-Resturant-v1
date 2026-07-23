import React, { useContext, useEffect } from 'react';
import { StoreContext } from '../../context/StoreContext';
import './CartDrawer.css';

export function CartDrawer({ drawerOpen = false, setDrawerOpen = () => {} }) {
  const { cartItems, food_list, addToCart, removeFromCart, url } = useContext(StoreContext);

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

  return (
    <>
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

              <a
                href="/orders"
                onClick={() => setDrawerOpen(false)}
                className="btn-checkout"
              >
                PROCEED TO CHECKOUT
              </a>
            </div>
          </>
        )}
      </aside>
    </>
  );
}

export default CartDrawer;