import React, { useState, useEffect } from 'react';
import './Navbar.css';

const NAV_ITEMS = [
  { path: '/', label: 'Home' },
  { path: '/menu', label: 'Menu' },
  { path: '/orders', label: 'Orders' },
];

const Navbar = ({ count = 0, setDrawerOpen }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // if nav should be transparent (at home top) or frosted
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';
  const isHome = currentPath === '/';
  const isOverlay = isHome && !scrolled;

  return (
    <>
      <header className={`navbar-header ${isOverlay ? 'transparent-header' : 'scrolled-header'}`}>
        <div className="navbar-container">
          
          {/* Logo */}
          <a href="/" className="navbar-logo">
            Inkosi<span className="gold-dot">.</span>
          </a>

          {/* Navigation Links */}
          <nav className="navbar-links">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.path}
                href={item.path}
                className={`nav-link ${currentPath === item.path ? 'active' : ''}`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="navbar-actions">
            {/* Account Icon */}
            <a href="/auth" aria-label="Account" className="icon-button account-link">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </a>

            {/* Cart Icon with Counter Badge */}
            <button 
              onClick={() => setDrawerOpen && setDrawerOpen(true)} 
              aria-label="Open cart" 
              className="icon-button cart-button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 10a4 4 0 0 1-8 0"></path>
                <path d="M3.103 6.034h17.794"></path>
                <path d="M3.4 5.467a2 2 0 0 0-.4 1.2V20a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6.667a2 2 0 0 0-.4-1.2l-2-2.667A2 2 0 0 0 17 2H7a2 2 0 0 0-1.6.8z"></path>
              </svg>
              {count > 0 && (
                <span className="cart-badge">
                  {count}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileOpen(true)} 
              aria-label="Open menu" 
              className="icon-button mobile-menu-btn"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 5h16"></path>
                <path d="M4 12h16"></path>
                <path d="M4 19h16"></path>
              </svg>
            </button>
          </div>

        </div>
      </header>

      {/* Mobile Fullscreen Overlay Nav */}
      <div className={`mobile-overlay ${mobileOpen ? 'open' : ''}`}>
        <div className="mobile-overlay-header">
          <span className="navbar-logo">
            Maison<span className="gold-dot">.</span>
          </span>
          <button 
            onClick={() => setMobileOpen(false)} 
            aria-label="Close menu" 
            className="icon-button mobile-close-btn"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
          </button>
        </div>
        <nav className="mobile-overlay-nav">
          {NAV_ITEMS.concat({ path: '/auth', label: 'Account' }).map((item) => (
            <a key={item.path} href={item.path} className="mobile-nav-link">
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Navbar;

