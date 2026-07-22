import React from 'react'
import './ExploreMenu.css'
import { menu_list } from '../../assets/assets'

const ExploreMenu = ({ category, setCategory }) => {
  return (
    <section className="explore-menu-section" id="explore-menu">
      <div className="explore-menu-container">
        <div className="explore-menu-header">
          <div className="explore-menu-heading">
            <p className="eyebrow">The Menu</p>
            <h2 className="explore-menu-title">
              Six kitchens,<br />one address.
            </h2>
          </div>
          <a href="#food-display" className="explore-menu-browse-link">
            Browse all →
          </a>
        </div>

        <div className="explore-menu-scroll">
          <div className="explore-menu-list">
            {menu_list.map((item, index) => (
              <div
                onClick={() =>
                  setCategory((prev) =>
                    prev === item.menu_name ? 'all' : item.menu_name
                  )
                }
                key={index}
                className="explore-menu-card"
              >
                <div className="explore-menu-card-img-wrap">
                  <img
                    src={item.menu_image}
                    alt={item.menu_name}
                    loading="lazy"
                    className={category === item.menu_name ? 'active' : ''}
                  />
                  <div className="explore-menu-card-overlay" />
                  <div className="explore-menu-card-label">
                    <h3>{item.menu_name}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default ExploreMenu

