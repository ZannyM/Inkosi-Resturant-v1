import React from 'react';
import './Footer.css';

const Footer = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <footer className="footer-container">
      <div className="footer-inner">
        {/* Main Grid Content */}
        <div className="footer-grid">
          
          {/* Brand Info */}
          <div className="footer-brand">
            <a href="/" className="footer-logo">
              Inkosi<span className="gold-dot">.</span>
            </a>
            <p className="footer-tagline">
              A quiet kitchen with an editorial hand. Ordered slowly, delivered warm.
            </p>
          </div>

          {/* Location */}
          <div className="footer-column">
            <div className="eyebrow footer-heading">Visit</div>
            <p className="footer-address">
              5 Helen Joseph street<br />
              Johannesburg, Gauteng<br />
              Tuesday — Sunday · 16:00 to 22:00
            </p>
          </div>

          {/* Social Links */}
          <div className="footer-column">
            <div className="eyebrow footer-heading">Follow</div>
            <div className="footer-social-list">
              <a href="#" className="footer-social-link">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="social-icon">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                </svg>
                Instagram
              </a>
              <a href="#" className="footer-social-link">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="social-icon">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
                Twitter
              </a>
            </div>
          </div>

          {/* Newsletter*/}
          <div className="footer-column">
            <div className="eyebrow footer-heading">Newsletter</div>
            <p className="newsletter-description">
              Menu changes and quiet news, monthly.
            </p>
            <form onSubmit={handleSubmit} className="newsletter-form">
              <input
                type="email"
                required
                placeholder="your@email.com"
                className="newsletter-input"
              />
              <button type="submit" className="newsletter-submit">
                Join
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Bar / Legal */}
        <div className="footer-bottom">
          <p className="copyright-text">
            © {new Date().getFullYear()} Inkosi. All rights reserved.
          </p>
          <div className="legal-links">
            <a href="#" className="legal-link">Privacy</a>
            <a href="#" className="legal-link">Terms</a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
