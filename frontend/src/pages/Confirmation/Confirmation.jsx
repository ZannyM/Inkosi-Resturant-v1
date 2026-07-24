import React, { useContext, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import './Confirmation.css';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';

const Confirmation = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const shortOrderId = orderId ? `ORD-${orderId.slice(-6).toUpperCase()}` : null;

  const { url, token } = useContext(StoreContext);
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await axios.post(
          `${url}/api/order/userorders`,
          {},
          { headers: { token } }
        );
        if (response.data.success) {
          const foundOrder = response.data.data.find((o) => o._id === orderId);
          setOrder(foundOrder || null);
        }
      } catch (error) {
        console.error("Error fetching order details:", error);
      }
    };

    if (token && orderId) {
      fetchOrderDetails();
    }
  }, [url, token, orderId]);

  return (
    <div className="confirmation-page">
      <section className="confirmation-card">
        {/* Success Icon */}
        <div className="success-badge">
          <svg className="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <p className="confirmation-eyebrow">Order received</p>
        <h1 className="confirmation-title">Thank you.</h1>
        
        <p className="confirmation-copy">
          Your order {shortOrderId && <span className="order-id-highlight">{shortOrderId}</span>} is with the kitchen. A confirmation is on its way to your inbox.
        </p>

        {/* Order Details Summary Card */}
        {order && (
          <div className="order-summary-card">
            <div className="summary-header">
              <div>
                <p className="confirmation-eyebrow">Order</p>
                <p className="summary-id">{shortOrderId}</p>
              </div>
              <div className="text-right">
                <p className="confirmation-eyebrow">Total</p>
                <p className="summary-total">R {order.amount}.00</p>
              </div>
            </div>

            <ul className="summary-items-list">
              {order.items.map((item, idx) => (
                <li key={idx} className="summary-item">
                  {item.image && (
                    <img 
                      src={`${url}/images/${item.image}`} 
                      alt={item.name} 
                      className="item-thumbnail" 
                    />
                  )}
                  <div className="item-details">
                    <p className="item-name">{item.name}</p>
                    <p className="item-qty">Qty {item.quantity}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="confirmation-actions">
          <Link to="/myorders" className="confirmation-btn primary">
            View my orders
          </Link>
          <Link to="/menu" className="confirmation-btn secondary">
            Order again
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Confirmation;


