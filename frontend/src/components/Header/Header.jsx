import React from 'react'
import './Header.css'
import { assets } from '../../assets/assets'
import { Link } from 'react-router-dom'

const Header = () => {
    return (
        <section className="header">
            <img
                src={assets.hero_jpg}
                alt="hero"
                className="header-bg-img"
            />
            <div className="header-overlay" />

            <div className="header-contents">
                <p className="header-eyebrow fade-up">Est. 2026 · Johannesburg</p>
                <h1 className="header-title fade-up" style={{ animationDelay: '120ms' }}>
                    Inkosi<span className="header-title-dot">.</span>
                </h1>
                <p className="header-desc fade-up" style={{ animationDelay: '220ms' }}>
                    Experience the best dining experience with us. We offer a wide
                    variety of dishes to satisfy your cravings. Join us for a
                    memorable meal!
                </p>
                <div className="header-cta fade-up" style={{ animationDelay: '320ms' }}>
                    <Link to="/menu" className="header-btn">
                        View Menu
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                    </Link>
                </div>
            </div>

            <div className="header-scroll-hint">Scroll</div>
        </section>
    )
}

export default Header


