import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './ExploreMenu.css'
import { menu_list } from '../../assets/assets'

const ExploreMenu = () => {
  const navigate = useNavigate();

  // Redirects to /menu with the specific category selected
  const handleCategoryClick = (categoryName) => {
    navigate(`/menu?category=${encodeURIComponent(categoryName)}`);
  };

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

          {/* Browse All Link -> Lands on /menu with "All" category */}
          <Link to="/menu?category=All" className="explore-menu-browse-link">
            BROWSE ALL &rarr;
          </Link>
        </div>

        {/* Category Cards Grid */}
        <div className="explore-menu-grid">
          {menu_list.map((item, index) => (
            <div
              key={index}
              onClick={() => handleCategoryClick(item.menu_name)}
              className="explore-menu-card"
              style={{ cursor: 'pointer' }}
            >
              <div className="explore-menu-img-wrapper">
                <img
                  src={item.menu_image}
                  alt={item.menu_name}
                  loading="lazy"
                />
                <div className="explore-menu-gradient-overlay" />
                
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
          ))}
        </div>

      </div>
    </section>
  )
}

export default ExploreMenu