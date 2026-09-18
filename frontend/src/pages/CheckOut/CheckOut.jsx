import React, { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Lock, ShieldCheck } from 'lucide-react';
import axios from 'axios';
import { StoreContext } from '../../context/StoreContext';
import './CheckOut.css';
import RestaurantClosedPopup from '../../components/RestaurantClosedPopup/RestaurantClosedPopup';

const CheckOut = () => {
  const { getTotalCartAmount, token, getCartDetails, url, isInitialized } = useContext(StoreContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [submitting, setSubmitting] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [showClosedPopup, setShowClosedPopup] = useState(false);
  const [closedMessage, setClosedMessage] = useState('');
  const [operatingHours, setOperatingHours] = useState('10:00 AM - 10:00 PM (All week)');

  // Form State containing all original delivery fields
  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    province: "",
    zipcode: "",
    country: "",
    phone: ""
  });

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  // Calculate cart items list dynamically
  const orderItemsList = getCartDetails();

  const subtotal = getTotalCartAmount();
  const deliveryFee = subtotal > 0 ? 35 : 0; // Standard R35 delivery fee
  const grandTotal = subtotal + deliveryFee;

  // Validation
  const isCartEmpty = orderItemsList.length === 0;
  const isFormIncomplete = Object.values(data).some((val) => !val.trim());
  const disabled = isCartEmpty || isFormIncomplete || submitting;

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

  const canPlaceOrderNow = async () => {
    try {
      const response = await axios.get(`${url}/api/store/status`);
      const statusData = response?.data?.data;
      if (response?.data?.success && isStoreClosed(statusData)) {
        openClosedPopup(
          getClosedMessage(statusData.closedReason),
          statusData.operatingHours
        );
        return false;
      }
    } catch (error) {
      // If status check fails, backend /place endpoint still enforces closure.
    }

    return true;
  }

  // Handle Redirect or Protection
  useEffect(() => {
    if (!isInitialized) return;

    if (!token) {
      // Redirect with login intent so App can open the auth modal.
      navigate('/', {
        replace: true,
        state: {
          openLogin: true,
          promptMessage: 'Please sign in to continue to checkout.',
          redirectAfterLogin: '/checkout'
        }
      });
    } else if (subtotal === 0) {
      // If cart is empty, redirect back to menu
      navigate('/menu', { replace: true });
    }
  }, [isInitialized, token, subtotal, navigate]);

  if (!isInitialized) {
    return (
      <div className="checkout-loading">
        <p>Loading checkout...</p>
      </div>
    );
  }

  // Submit Order & Trigger Paystack Gateway
  const placeOrder = async (event) => {
    event.preventDefault();
    if (disabled) return;

    const allowedToOrder = await canPlaceOrderNow();
    if (!allowedToOrder) {
      return;
    }

    setSubmitting(true);

    const formattedItems = orderItemsList.map((item) => ({
      _id: item._id,
      name: item.name,
      image: item.image,
      price: item.price,
      quantity: item.quantity,
      addOns: item.addOns,
      spiceLevel: item.spiceLevel,
      notes: item.notes
    }));

    const orderData = {
      address: data,
      items: formattedItems,
      amount: grandTotal
    };

    try {
      const response = await axios.post(`${url}/api/order/place`, orderData, {
        headers: { token }
      });

      if (response?.data?.success && response.data.session_url) {
        // Redirect user to Paystack payment link returned from server
        window.location.replace(response.data.session_url);
      } else {
        alert(response?.data?.message || "Unable to initialize payment. Please try again.");
        setSubmitting(false);
      }
    } catch (error) {
      console.error("Checkout submission failed", error);
      const responseData = error?.response?.data;
      if (responseData?.reason === 'KITCHEN_PAUSED' || responseData?.reason === 'OUTSIDE_OPERATING_HOURS') {
        openClosedPopup(getClosedMessage(responseData?.reason), responseData?.operatingHours);
      } else {
        const message = responseData?.message || "Payment initiation failed. Please try again.";
        alert(message);
      }
      setSubmitting(false);
    }
  };

  return (
    <>
      <RestaurantClosedPopup
        open={showClosedPopup}
        onClose={() => setShowClosedPopup(false)}
        message={closedMessage}
        operatingHours={operatingHours}
      />
      <div className="checkout-container">
      <p className="eyebrow">Almost there</p>
      <h1 className="checkout-title">Checkout.</h1>

      {location.state?.paymentFailed && (
        <div className="checkout-payment-alert" role="alert">
          {location.state.message || 'Payment was not completed. Please try again.'}
        </div>
      )}

      {/* Mobile Collapsible Summary Toggle */}
      <div className="mobile-summary-toggle">
        <button
          type="button"
          onClick={() => setSummaryOpen((prev) => !prev)}
          className="summary-toggle-btn"
        >
          <span className="eyebrow">Order Summary</span>
          <span className="summary-price-badge">R{grandTotal.toFixed(2)}</span>
        </button>
        {summaryOpen && (
          <div className="mobile-summary-content">
            <SummaryBody
              items={orderItemsList}
              subtotal={subtotal}
              deliveryFee={deliveryFee}
              grandTotal={grandTotal}
              url={url}
            />
          </div>
        )}
      </div>

      <div className="checkout-grid">
        {/* Delivery & Payment Form */}
        <form onSubmit={placeOrder} className="checkout-form">
          <Fieldset title="Delivery details">
            <div className="fields-grid">
              <Field
                label="First name"
                name="firstName"
                value={data.firstName}
                onChange={onChangeHandler}
              />
              <Field
                label="Last name"
                name="lastName"
                value={data.lastName}
                onChange={onChangeHandler}
              />
              <Field
                label="Email"
                type="email"
                name="email"
                value={data.email}
                onChange={onChangeHandler}
              />
              <Field
                label="Phone"
                type="tel"
                name="phone"
                value={data.phone}
                onChange={onChangeHandler}
              />
              <div className="full-width">
                <Field
                  label="Street Address"
                  name="street"
                  value={data.street}
                  onChange={onChangeHandler}
                />
              </div>
              <Field
                label="City"
                name="city"
                value={data.city}
                onChange={onChangeHandler}
              />
              <Field
                label="Province"
                name="province"
                value={data.province}
                onChange={onChangeHandler}
              />
              <Field
                label="Zip code"
                name="zipcode"
                value={data.zipcode}
                onChange={onChangeHandler}
              />
              <Field
                label="Country"
                name="country"
                value={data.country}
                onChange={onChangeHandler}
              />
            </div>
          </Fieldset>

          <Fieldset title="Payment">
            <div className="paystack-banner">
              <div className="paystack-icon-wrapper">
                <Lock className="paystack-icon" strokeWidth={1.5} />
              </div>
              <div>
                <p className="paystack-text">
                  You'll be redirected to <span className="highlight">Paystack</span> to complete payment.
                </p>
                <p className="paystack-subtext">
                  <ShieldCheck className="shield-icon" strokeWidth={1.75} /> 256-bit encrypted · Your card details are never stored.
                </p>
              </div>
            </div>
          </Fieldset>

          <button
            type="submit"
            disabled={disabled}
            className="btn-pay"
          >
            {submitting ? "Processing…" : `Pay R${grandTotal.toFixed(2)}`}
          </button>
        </form>

        {/* Desktop Sticky Order Summary */}
        <aside className="desktop-summary-aside">
          <p className="eyebrow">Order summary</p>
          <div className="summary-wrapper">
            <SummaryBody
              items={orderItemsList}
              subtotal={subtotal}
              deliveryFee={deliveryFee}
              grandTotal={grandTotal}
              url={url}
            />
          </div>
        </aside>
      </div>
      </div>
    </>
  );
};

// Internal Helper Components
function SummaryBody({ items, subtotal, deliveryFee, grandTotal, url }) {
  return (
    <>
      <ul className="summary-items-list">
        {items.map((item) => {
          const imgUrl = url ? `${url}/images/${item.image}` : item.image;

          return (
            <li key={item.cartKey} className="summary-item">
              <img src={imgUrl} alt={item.name} className="summary-item-img" />
              <div className="summary-item-info">
                <p className="summary-item-name">{item.name}</p>
                <p className="summary-item-qty">Qty {item.quantity}</p>
                {(item.addOns.length > 0 || item.spiceLevel || item.notes) && (
                  <p className="summary-item-customization">
                    {item.addOns.map((a) => a.name).join(', ')}
                    {item.spiceLevel ? `${item.addOns.length > 0 ? ' · ' : ''}${item.spiceLevel}` : ''}
                    {item.notes ? ` · Note: ${item.notes}` : ''}
                  </p>
                )}
              </div>
              <span className="summary-item-price">R{item.lineTotal.toFixed(2)}</span>
            </li>
          );
        })}
      </ul>

      <div className="summary-pricing">
        <div className="pricing-row">
          <span>Subtotal</span>
          <span>R{subtotal.toFixed(2)}</span>
        </div>
        <div className="pricing-row">
          <span>Delivery</span>
          <span>R{deliveryFee.toFixed(2)}</span>
        </div>
        <div className="pricing-total">
          <span className="eyebrow">Total</span>
          <span className="grand-total-amount">R{grandTotal.toFixed(2)}</span>
        </div>
      </div>
    </>
  );
}

function Fieldset({ title, children }) {
  return (
    <div className="checkout-fieldset">
      <h2 className="eyebrow fieldset-title">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, name, value, onChange, type = "text" }) {
  return (
    <label className="field-label">
      <span className="field-caption">{label}</span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required
        className="field-input"
      />
    </label>
  );
}

export default CheckOut;