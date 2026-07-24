import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './MyOrders.css'; // Make sure this imports MyOrders.css
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';

const StatusBadge = ({ status }) => {
  const statusKey = status ? status.toLowerCase().replace(/\s+/g, '-') : 'pending';
  return (
    <span className={`status-badge status-${statusKey}`}>
      <span className="status-dot" />
      {status}
    </span>
  );
};

const MyOrders = () => {
  const { url, token } = useContext(StoreContext);
  const [data, setData] = useState(null); // null represents loading state

  const fetchOrders = async () => {
    try {
      const response = await axios.post(
        url + "/api/order/userorders",
        {},
        { headers: { token } }
      );
      setData(response.data.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setData([]);
    }
  };

  useEffect(() => {
    if (token) {
      fetchOrders();
    } else {
      setData([]);
    }
  }, [token]);

  return (
    <div className="orders-page">
      <section className="orders-container">
        <p className="eyebrow">History</p>
        <h1 className="orders-title">My orders.</h1>

        {/* Loading State Skeleton */}
        {data === null ? (
          <div className="skeleton-wrapper">
            {[1, 2, 3].map((n) => (
              <div key={n} className="skeleton-card" />
            ))}
          </div>
        ) : data.length === 0 ? (
          /* Empty State */
          <div className="orders-empty-state">
            <p className="empty-title">No orders yet</p>
            <p className="empty-subtitle">Your culinary history will appear here.</p>
            <Link to="/menu" className="start-order-btn">
              Start an order
            </Link>
          </div>
        ) : (
          /* Orders List with Real Backend Data */
          <ul className="orders-list">
            {data.map((order) => (
              <li key={order._id} className="order-card">
                <div className="order-header">
                  <div className="order-info">
                    <p className="order-date">
                      {order.date 
                        ? new Date(order.date).toLocaleDateString(undefined, {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : 'Recent Order'}
                    </p>
                    <p className="order-id">
                      {order._id ? `ORD-${order._id.slice(-6).toUpperCase()}` : 'ORD-LOCAL'}
                    </p>
                  </div>
                  <div className="order-meta">
                    <StatusBadge status={order.status} />
                    <p className="order-total">R {order.amount}.00</p>
                  </div>
                </div>

                {/* Purchased Items Horizontal Scroll */}
                <div className="order-items-scroll">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="item-chip">
                      {item.image && (
                        <img 
                          src={url + "/images/" + item.image} 
                          alt={item.name} 
                          className="chip-img" 
                        />
                      )}
                      <span className="chip-text">
                        {item.name} <span className="chip-qty">· {item.quantity}</span>
                      </span>
                    </div>
                  ))}
                </div>

                {/* Track Button Action */}
                <div className="order-footer">
                  <button onClick={fetchOrders} className="track-order-btn" style={{ border: 'none', cursor: 'pointer' }}>
                    <svg className="pin-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    Track order
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default MyOrders;