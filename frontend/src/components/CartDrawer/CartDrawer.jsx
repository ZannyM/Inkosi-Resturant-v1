
import React, { useEffect } from 'react';
import './CartDrawer.css';

export function CartDrawer({
  items = [],
  drawerOpen = false,
  setDrawerOpen = () => {},
  setQty = () => {},
  subtotal = 0,
  deliveryFee = 0,
  total = 0,
}) {
  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  return (
    <>
      {/* Dim Backdrop */}
      <div
        onClick={() => setDrawerOpen(false)}
        className={`cart-backdrop ${drawerOpen ? 'open' : ''}`}
      />

      {/* Slide-Over Drawer */}
      <aside
        className={`cart-drawer ${drawerOpen ? 'open' : ''}`}
        aria-hidden={!drawerOpen}
      >
        {/* Header */}
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
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="12" transform="rotate(45 12 12)"></line>
            </svg>
          </button>
        </div>

        {/* Empty State */}
        {items.length === 0 ? (
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
                {items.map(({ dish, quantity }) => (
                  <li key={dish.id} className="cart-item">
                    <img
                      src={dish.image}
                      alt={dish.name}
                      className="item-image"
                    />
                    <div className="item-details">
                      <div className="item-header">
                        <h3 className="item-name">{dish.name}</h3>
                        <button
                          onClick={() => setQty(dish.id, 0)}
                          className="remove-btn"
                          aria-label="Remove"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      </div>
                      <p className="item-price">
                        ${dish.price.toFixed(2)} each
                      </p>
                      <div className="item-footer">
                        <QtyStepper
                          qty={quantity}
                          onChange={(n) => setQty(dish.id, n)}
                        />
                        <span className="item-total-price">
                          ${(dish.price * quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Subtotal & Checkout Footer */}
            <div className="cart-footer">
              <Row label="Subtotal" value={`$${subtotal.toFixed(2)}`} />
              <Row label="Delivery" value={`$${deliveryFee.toFixed(2)}`} />
              
              <div className="total-row">
                <span className="eyebrow">Total</span>
                <span className="total-amount">${total.toFixed(2)}</span>
              </div>

              <a
                href="/checkout"
                onClick={() => setDrawerOpen(false)}
                className="btn-checkout"
              >
                Proceed to checkout
              </a>
            </div>
          </>
        )}
      </aside>
    </>
  );
}

export default CartDrawer;