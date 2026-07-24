import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Navbar.css';
import { StoreContext } from '../../context/StoreContext';

const NAV_ITEMS = [
  { path: '/', label: 'Home' },
  { path: '/menu', label: 'Menu' },
  { path: '/myorders', label: 'Orders' },
];

const Navbar = ({ setShowLogin, setDrawerOpen }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const { getTotalCartCount, token, setToken, user } = useContext(StoreContext);
  const cartCount = getTotalCartCount ? getTotalCartCount() : 0;

  const currentPath = location.pathname;
  const isHome = currentPath === '/';
  const isOverlay = isHome && !scrolled;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
    navigate('/');
  };

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleAccountClick = () => {
    if (!token) {
      setShowLogin(true);
      return;
    }
    setDropdownOpen((prev) => !prev);
  };

  return (
    <>
      <header className={`navbar-header ${isOverlay ? 'transparent-header' : 'scrolled-header'}`}>
        <div className="navbar-container">
          
          {/* Logo */}
          <Link to="/" className="navbar-logo">
            Inkosi<span className="gold-dot">.</span>
          </Link>

          {/* Navigation Links */}
          <nav className="navbar-links">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${currentPath === item.path ? 'active' : ''}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="navbar-actions">
            {/* Account Action Button */}
            <button
              onClick={handleAccountClick}
              aria-label="Account"
              className={`icon-button account-link ${token && user ? 'account-link-badge' : ''}`}
              title={token ? "Open account menu" : "Sign In"}
            >
              {token && user ? (
                <span className="navbar-user-badge">Hi {user.name.split(' ')[0]}</span>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              )}
            </button>
            {dropdownOpen && token && (
              <div className="navbar-account-dropdown">
                <button type="button" className="dropdown-item" onClick={() => { setDropdownOpen(false); navigate('/myorders'); }}>
                  My Orders
                </button>
                <button type="button" className="dropdown-item" onClick={() => { setDropdownOpen(false); handleLogout(); }}>
                  Logout
                </button>
              </div>
            )}

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
              {cartCount > 0 && (
                <span className="cart-badge">{cartCount}</span>
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
            Inkosi<span className="gold-dot">.</span>
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
          {NAV_ITEMS.map((item) => (
            <Link 
              key={item.path} 
              to={item.path} 
              className="mobile-nav-link"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <button
            className="mobile-nav-link"
            style={{ background: 'none', border: 'none', textTransform: 'uppercase', cursor: 'pointer', textAlign: 'left', padding: 0 }}
            onClick={() => {
              setMobileOpen(false);
              if (!token) {
                setShowLogin(true);
              } else {
                handleLogout();
              }
            }}
          >
            {token ? 'Logout' : 'Account'}
          </button>
        </nav>
      </div>
    </>
  );
};

export default Navbar;