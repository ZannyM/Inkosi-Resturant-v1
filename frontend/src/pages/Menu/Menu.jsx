import React, { useState, useEffect, useMemo, useContext } from 'react'
import { useSearchParams } from 'react-router-dom'
import './Menu.css'
import FoodItem from '../../components/FoodItem/FoodItem'
import { StoreContext } from '../../context/StoreContext' // 1. Import StoreContext

const TABS = ["All", "Salads", "Rolls", "Pasta", "Noodles", "Sandwiches", "Desserts", "Drinks"];

const normalizeCategory = (cat) => {
  if (!cat) return "All";
  const raw = cat.toLowerCase().trim();
  
  if (raw === "deserts" || raw === "dessert" || raw === "desserts" || raw === "cake") return "Desserts";
  if (raw === "sandwich" || raw === "sandwiches") return "Sandwiches";
  if (raw === "salad" || raw === "salads") return "Salads";
  if (raw === "roll" || raw === "rolls") return "Rolls";
  if (raw === "noodle" || raw === "noodles") return "Noodles";
  if (raw === "drink" || raw === "drinks" || raw === "beverage" || raw === "beverages") return "Drinks";
  
  return cat;
};

const Menu = () => {
  const { food_list } = useContext(StoreContext);

  const [searchParams, setSearchParams] = useSearchParams();

  const rawUrlParam = searchParams.get('category') || "All";
  const [category, setCategory] = useState(normalizeCategory(rawUrlParam));

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const currentParam = searchParams.get('category');
    if (currentParam) {
      setCategory(normalizeCategory(currentParam));
    }
  }, [searchParams]);

  const handleTabChange = (selectedTab) => {
    setCategory(selectedTab);
    setSearchParams({ category: selectedTab });
  };

  const filteredDishes = useMemo(() => {
    if (!food_list) return [];
    if (category.toLowerCase() === "all") return food_list;

    return food_list.filter((item) => {
      const itemCat = normalizeCategory(item.category);
      return itemCat.toLowerCase() === category.toLowerCase();
    });
  }, [category, food_list]); 

  return (
    <div className="menu-page">
      
      {/* Editorial Header */}
      <section className="menu-header">
        <div className="menu-header-container">
          <p className="eyebrow">The Menu</p>
          <h1 className="menu-title">
            Tonight's <em className="gold-text">service</em>.
          </h1>
          <p className="menu-subtitle">
            Twelve dishes across six kitchens. The list changes as produce arrives.
          </p>
        </div>
      </section>

      {/* Sticky Tab Navigation Bar */}
      <div className="sticky-tabs-wrapper">
        <div className="sticky-tabs-container">
          <div className="sticky-tabs-scroll">
            {TABS.map((tab) => {
              const active = category.toLowerCase() === tab.toLowerCase();
              return (
                <button
                  key={tab}
                  onClick={() => handleTabChange(tab)}
                  className={`tab-button ${active ? 'active' : ''}`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Dish Display Grid */}
      <section className="menu-grid-section">
        <div className="menu-grid-container">
          {filteredDishes.length === 0 ? (
            <div className="menu-empty-state">
              <p className="empty-title">Nothing here tonight.</p>
              <p className="empty-subtitle">
                This kitchen is currently between services.
              </p>
              <button
                onClick={() => handleTabChange("All")}
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