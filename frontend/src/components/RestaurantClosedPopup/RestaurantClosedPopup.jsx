import React from 'react';
import './RestaurantClosedPopup.css';

const RestaurantClosedPopup = ({ open, onClose, message, operatingHours }) => {
  if (!open) return null;

  return (
    <div className="closed-popup-overlay" role="dialog" aria-modal="true" aria-labelledby="closed-popup-title">
      <div className="closed-popup-card">
        <p className="closed-popup-kicker">Service update</p>
        <h3 id="closed-popup-title">Restaurant currently closed</h3>
        <p className="closed-popup-message">
          {message || 'We are not accepting orders at the moment.'}
        </p>
        <div className="closed-popup-hours">
          <span>Operational hours</span>
          <strong>{operatingHours || '10:00 AM - 10:00 PM (All week)'}</strong>
        </div>
        <button type="button" onClick={onClose} className="closed-popup-btn">
          Got it
        </button>
      </div>
    </div>
  );
};

export default RestaurantClosedPopup;
