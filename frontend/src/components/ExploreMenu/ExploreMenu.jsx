import React from 'react'
import './ExploreMenu.css'
import { menu_list } from '../../assets/assets'

const ExploreMenu = ({ category, setCategory }) => {
  return (
    <section className="explore-menu-section" id="explore-menu">
      <div className="explore-menu-container">
        
        {/* Header Section */}
        <div className="explore-menu-header">
          <div className="explore-menu-heading">
            <p className="eyebrow">THE MENU</p>
            <h2 className="explore-menu-title">
              Six kitchens,<br />one address.
            </h2>
          </div>
          <a href="#food-display" className="explore-menu-browse-link">
            BROWSE ALL &rarr;
          </a>
        </div>

        {/* 6-Card Category Grid */}
        <div className="explore-menu-grid">
          {menu_list.map((item, index) => {
            const isActive = category === item.menu_name;
            return (
              <div
                key={index}
                onClick={() =>
                  setCategory((prev) =>
                    prev === item.menu_name ? 'all' : item.menu_name
                  )
                }
                className={`explore-menu-card ${isActive ? 'active' : ''}`}
              >
                <div className="explore-menu-img-wrapper">
                  <img
                    src={item.menu_image}
                    alt={item.menu_name}
                    loading="lazy"
                  />
                  {/* Subtle Dark Gradient at Bottom */}
                  <div className="explore-menu-gradient-overlay" />
                  
                  {/* Content Overlay */}
                  <div className="explore-menu-card-content">
                    <h3 className="explore-menu-card-name">
                      {item.menu_name}
                    </h3>
                    {item.subtitle && (
                      <p className="explore-menu-card-subtitle">
                        {item.subtitle}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  )
}

export default ExploreMenu