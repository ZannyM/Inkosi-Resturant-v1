import React, { useContext, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';
import { SPICE_LEVELS } from '../../assets/foodOptions';
import './FoodDetails.css';

const FoodDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { food_list, url, addToCart } = useContext(StoreContext);

    const food = useMemo(
        () => (food_list || []).find((item) => (item._id || item.id) === id),
        [food_list, id]
    );

    const customization = food?.customization || { addOnsEnabled: false, addOns: [], spiceLevelEnabled: false, notesEnabled: true };
    const availableAddOns = customization.addOnsEnabled ? (customization.addOns || []) : [];
    const showSpiceLevel = Boolean(customization.spiceLevelEnabled);
    const showNotes = customization.notesEnabled !== false;

    const [selectedAddOns, setSelectedAddOns] = useState([]);
    const [spiceLevel, setSpiceLevel] = useState('Medium');
    const [notes, setNotes] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [justAdded, setJustAdded] = useState(false);

    if (!food) {
        return (
            <div className="food-details-page food-details-empty">
                <p>We couldn't find that dish.</p>
                <button className="btn-back-menu" onClick={() => navigate('/menu')}>
                    Back to menu
                </button>
            </div>
        );
    }

    const toggleAddOn = (addOn) => {
        setSelectedAddOns((prev) =>
            prev.some((a) => a.name === addOn.name)
                ? prev.filter((a) => a.name !== addOn.name)
                : [...prev, addOn]
        );
    };

    const addOnsTotal = selectedAddOns.reduce((sum, a) => sum + (a.price || 0), 0);
    const unitPrice = food.price + addOnsTotal;
    const totalPrice = unitPrice * quantity;

    const handleAddToCart = () => {
        addToCart(food._id || food.id, {
            addOns: selectedAddOns,
            spiceLevel: showSpiceLevel && spiceLevel !== 'Medium' ? spiceLevel : null,
            notes: showNotes ? notes.trim() : '',
            quantity
        });
        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 2000);
    };

    return (
        <div className="food-details-page">
            <button className="btn-back-menu" onClick={() => navigate(-1)}>&larr; Back</button>

            <div className="food-details-grid">
                <div className="food-details-image-wrap">
                    <img src={`${url}/images/${food.image}`} alt={food.name} className="food-details-image" />
                </div>

                <div className="food-details-info">
                    <p className="eyebrow">{food.category}</p>
                    <h1 className="food-details-title">{food.name}</h1>
                    <p className="food-details-desc">{food.description}</p>
                    <p className="food-details-base-price">R{food.price.toFixed(2)}</p>

                    <div className="customize-section">
                        <h2 className="customize-heading">Make it yours</h2>

                        {availableAddOns.length > 0 && (
                            <div className="customize-group">
                                <p className="customize-label">Add-ons</p>
                                <div className="addon-options">
                                    {availableAddOns.map((addOn) => {
                                        const checked = selectedAddOns.some((a) => a.name === addOn.name);
                                        return (
                                            <label key={addOn.name} className={`addon-option ${checked ? 'selected' : ''}`}>
                                                <input
                                                    type="checkbox"
                                                    checked={checked}
                                                    onChange={() => toggleAddOn(addOn)}
                                                />
                                                <span>{addOn.name}</span>
                                                {addOn.price > 0 && <span className="addon-price">+R{addOn.price}</span>}
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {showSpiceLevel && (
                            <div className="customize-group">
                                <p className="customize-label">Spice level</p>
                                <div className="spice-options">
                                    {SPICE_LEVELS.map((level) => (
                                        <button
                                            type="button"
                                            key={level}
                                            className={`spice-chip ${spiceLevel === level ? 'active' : ''}`}
                                            onClick={() => setSpiceLevel(level)}
                                        >
                                            {level}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {showNotes && (
                            <div className="customize-group">
                                <label className="customize-label" htmlFor="food-notes">
                                    Allergies or special requests
                                </label>
                                <textarea
                                    id="food-notes"
                                    className="notes-input"
                                    rows={3}
                                    placeholder="e.g. nut allergy, no dairy, light on salt..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    maxLength={200}
                                />
                            </div>
                        )}

                        <div className="customize-group quantity-row">
                            <p className="customize-label">Quantity</p>
                            <div className="quantity-stepper">
                                <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>-</button>
                                <span>{quantity}</span>
                                <button type="button" onClick={() => setQuantity((q) => q + 1)}>+</button>
                            </div>
                        </div>
                    </div>

                    <div className="food-details-footer">
                        <div className="food-details-total">
                            <span>Total</span>
                            <span className="total-value">R{totalPrice.toFixed(2)}</span>
                        </div>
                        <button type="button" className="btn-add-to-cart" onClick={handleAddToCart}>
                            {justAdded ? 'Added to cart ✓' : 'Add to cart'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FoodDetails;
