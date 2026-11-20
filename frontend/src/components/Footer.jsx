import React from 'react';
import { ShoppingBag, GitFork, Link2, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section brand-info">
          <div className="footer-brand">
            <ShoppingBag className="brand-icon" />
            <span>AETHER<span className="brand-accent">SHOP</span></span>
          </div>
          <p className="brand-desc">
            A premium hardware and electronics store showcase designed for on-campus placements. Engineered with modern UI patterns and clean system architecture.
          </p>
          <div className="social-icons">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="social-link" title="Code Repository">
              <GitFork size={18} />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-link" title="Developer Profile">
              <Link2 size={18} />
            </a>
            <a href="mailto:support@aethershop.com" className="social-link">
              <Mail size={18} />
            </a>
          </div>
        </div>

        <div className="footer-section">
          <h4>Niches & Categories</h4>
          <ul>
            <li><a href="#laptops">Aether Laptops</a></li>
            <li><a href="#audio">Nova Sound Audio</a></li>
            <li><a href="#wearables">Chronos Wearables</a></li>
            <li><a href="#displays">Zenith Displays</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Technical Highlights</h4>
          <ul>
            <li><a href="#architecture">MVC Architecture</a></li>
            <li><a href="#db">SQLite Database</a></li>
            <li><a href="#security">JWT & Hashed Passwords</a></li>
            <li><a href="#css">Modern Vanilla CSS</a></li>
          </ul>
        </div>

        <div className="footer-section newsletter">
          <h4>Join Aether Core</h4>
          <p>Subscribe for early access and product release drops.</p>
          <form onSubmit={(e) => e.preventDefault()} className="newsletter-form">
            <input type="email" placeholder="Enter your email" required />
            <button type="submit" className="btn-subscribe">Join</button>
          </form>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} AetherShop Inc. Developed for Interview Placement Showcasing.</p>
      </div>
    </footer>
  );
};

export default Footer;
