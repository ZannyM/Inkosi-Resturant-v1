import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './PlaceOrder.css';

// Mock/Fallback order fetcher if local store isn't available yet
const fetchUserOrders = () => {
  return [
    {
      id: "ORD-9482",
      date: "2026-07-20",
      status: "Out for delivery",
      total: 42.00,
      items: [
        { dish: { name: "Hand-Rolled Pasta", image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&q=80&w=200" }, quantity: 1 },
        { dish: { name: "Dark Chocolate Tart", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=200" }, quantity: 2 }
      ]
    },
    {
      id: "ORD-8103",
      date: "2026-07-12",
      status: "Delivered",
      total: 68.50,
      items: [
        { dish: { name: "Truffle Ramen", image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=200" }, quantity: 2 }
      ]
    }
  ];
};

const StatusBadge = ({ status }) => {
  const statusKey = status.toLowerCase().replace(/\s+/g, '-');
  return (
    <span className={`status-badge status-${statusKey}`}>
      <span className="status-dot" />
      {status}
    </span>
  );
};

const PlaceOrder = () => {
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    // Replace with your actual context/API call when ready
    const data = fetchUserOrders();
    setOrders(data);
  }, []);

  return (
    <div className="orders-page">
      <section className="orders-container">
        <p className="eyebrow">History</p>
        <h1 className="orders-title">My orders.</h1>

        {/* Loading Skeleton */}
        {orders === null ? (
          <div className="skeleton-wrapper">
            {[1, 2, 3].map((n) => (
              <div key={n} className="skeleton-card" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          /* Empty State */
          <div className="orders-empty-state">
            <p className="empty-title">No orders yet</p>
            <p className="empty-subtitle">Your culinary history will appear here.</p>
            <Link to="/menu" className="start-order-btn">
              Start an order
            </Link>
          </div>
        ) : (
          /* Orders List */
          <ul className="orders-list">
            {orders.map((o) => (
              <li key={o.id} className="order-card">
                <div className="order-header">
                  <div className="order-info">
                    <p className="order-date">
                      {new Date(o.date).toLocaleDateString(undefined, {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                    <p className="order-id">{o.id}</p>
                  </div>
                  <div className="order-meta">
                    <StatusBadge status={o.status} />
                    <p className="order-total">${o.total.toFixed(2)}</p>
                  </div>
                </div>

                {/* Purchased Items List */}
                <div className="order-items-scroll">
                  {o.items.map((it, idx) => (
                    <div key={idx} className="item-chip">
                      <img src={it.dish.image} alt={it.dish.name} className="chip-img" />
                      <span className="chip-text">
                        {it.dish.name} <span className="chip-qty">· {it.quantity}</span>
                      </span>
                    </div>
                  ))}
                </div>

                {/* Track Button Action */}
                <div className="order-footer">
                  <Link to={`/orders/${o.id}`} className="track-order-btn">
                    <svg className="pin-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    Track order
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default PlaceOrder;

// import React, { useContext, useEffect, useState } from 'react'
// import './PlaceOrder.css'
// import { StoreContext } from '../../context/StoreContext'
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';

// const PlaceOrder = () => {

//   const { getTotalCartAmount, token, food_list, cartItems, url } = useContext(StoreContext);
//   //data state variable
//   const [data, setData] = useState({
//     firstName: "",
//     lastName: "",
//     email: "",
//     street: "",
//     city: "",
//     province: "",
//     zipcode: "",
//     country: "",
//     phone: ""
//   });

//   const onChangeHandler = (event) => {
//     const name = event.target.name;
//     const value = event.target.value;
//     setData(data => ({ ...data, [name]: value }))
//   };

//   //redirect to the payment gateway
//   const placeOrder = async (event) => {
//     event.preventDefault();
//     let orderItems = [];
//     food_list.map((item) => {
//       if (cartItems[item._id] > 0) {
//         let itemInfo = item;
//         itemInfo["quantity"] = cartItems[item._id];
//         orderItems.push(itemInfo)
//       }
//     });
//     // console.log(orderItems);
//     let orderData = {
//       address: data,
//       items: orderItems,
//       amount: getTotalCartAmount() + 2,
//     }
//     try {
//       const response = await axios.post(url + "/api/order/place", orderData, { headers: { token } });
//       if (response?.data?.success && response.data.session_url) {
//         window.location.replace(response.data.session_url);
//       } else {
//         alert(response?.data?.message || "Unable to start payment. Please try again.");
//       }
//     } catch (error) {
//       console.error("Checkout failed", error);
//       const message = error?.response?.data?.message || "Unable to start payment right now. Please try again.";
//       alert(message);
//     }
//   }

//   const navigate = useNavigate();
// //if cart is empty, user will not be redirected to the order page
//   useEffect(() => {
//     if (!token) {
//       navigate('/cart')

//     } else if (getTotalCartAmount() === 0) {
//       navigate('/cart')

//     }
//   }, [token])

//   return (
//     <form onSubmit={placeOrder} className='place-order'>
//       <div className="place-order-left">
//         <p className="title">Delivery Information</p>
//         <div className="multi-fields">
//           <input required name='firstName' onChange={onChangeHandler} value={data.firstName} type="text" placeholder='First Name' />
//           <input required name='lastName' onChange={onChangeHandler} value={data.lastName} type="text" placeholder='Last Name' />
//         </div>
//         <input required name='email' onChange={onChangeHandler} value={data.email} type="email" placeholder='Email address' />
//         <input required name='street' onChange={onChangeHandler} value={data.street} type="text" placeholder='street' />
//         <div className="multi-fields">
//           <input required name='city' onChange={onChangeHandler} value={data.city} type="text" placeholder='City' />
//           <input required name='province' onChange={onChangeHandler} value={data.province} type="text" placeholder='Province' />
//         </div>
//         <div className="multi-fields">
//           <input required name='zipcode' onChange={onChangeHandler} value={data.zipcode} type="text" placeholder='Zip code' />
//           <input required name='country' onChange={onChangeHandler} value={data.country} type="text" placeholder='Country' />
//         </div>
//         <input required name='phone' onChange={onChangeHandler} value={data.phone} type="text" placeholder='Phone' />
//       </div>
//       <div className="place-order-right">
//         <div className="cart-total">
//           <h2>Cart Totals</h2>
//           <div>
//             <div className="cart-total-details">
//               <p>Subtotal</p>
//               <p>R {getTotalCartAmount()}</p>
//             </div>
//             <hr />
//             <div className="cart-total-details">
//               <p>Delivery Fee</p>
//               <p>R {getTotalCartAmount() === 0 ? 0 : 2}</p>
//             </div>
//             <hr />
//             <div className="cart-total-details">
//               <b>Total</b>
//               <b>R {getTotalCartAmount() == 0 ? 0 : getTotalCartAmount() + 2}</b>
//             </div>
//           </div>
//           <button type='submit'>PROCEED TO PAYMENT</button>
//         </div>
//       </div>
//     </form>
//   )
// }


// export default PlaceOrder
