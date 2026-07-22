import React, { useState, useMemo } from 'react';
import './Menu.css';
import { food_list } from '../../assets/assets'; // Uses your project's food data structure
import FoodItem from '../../components/FoodItem/FoodItem'; // Uses your existing FoodItem card component

const TABS = ["All", "Salads", "Rolls", "Pasta", "Noodles", "Sandwiches", "Desserts"];

const Menu = () => {
  const [category, setCategory] = useState("All");

  // Filter items based on active category
  const filteredDishes = useMemo(() => {
    if (!food_list) return [];
    if (category === "All") return food_list;
    return food_list.filter(
      (item) => item.category.toLowerCase() === category.toLowerCase()
    );
  }, [category]);

  return (
    <div className="menu-page">
      {/* Header Section */}
      <section className="menu-header">
        <div className="menu-header-container">
          <p className="eyebrow">The Menu</p>
          <h1 className="menu-title">
            Tonight's <em className="text-gold">service</em>.
          </h1>
          <p className="menu-subtitle">
            Twelve dishes across six kitchens. The list changes as produce arrives.
          </p>
        </div>
      </section>

      {/* Sticky Category Tabs */}
      <div className="sticky-tabs-wrapper">
        <div className="sticky-tabs-container">
          <div className="sticky-tabs-scroll">
            {TABS.map((tab) => {
              const active = category === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setCategory(tab)}
                  className={`tab-button ${active ? 'active' : ''}`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid Display Section */}
      <section className="menu-grid-section">
        <div className="menu-grid-container">
          {filteredDishes.length === 0 ? (
            <div className="menu-empty-state">
              <p className="empty-title">Nothing here tonight.</p>
              <p className="empty-subtitle">This kitchen is between services.</p>
              <button
                onClick={() => setCategory("All")}
                className="empty-action-btn"
              >
                See the full menu &rarr;
              </button>
            </div>
          ) : (
            <div className="menu-dishes-grid">
              {filteredDishes.map((item) => (
                <FoodItem
                  key={item._id || item.id}
                  id={item._id || item.id}
                  name={item.name}
                  description={item.description}
                  price={item.price}
                  image={item.image}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Menu;