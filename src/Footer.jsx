// src/Footer.jsx
import React from 'react';
import './Eduvhibe.css';

// Accept the onNavigate function as a prop
export default function Footer({ onNavigate }) {
  return (
    <footer className="edu-footer">
      <div className="footer-top">
        
        <div className="footer-col">
          <h2 className="footer-logo">Eduvhibe</h2>
          <p className="footer-contact"><strong>Phone:</strong> (+233)507988612</p>
          <p className="footer-contact"><strong>Email:</strong> chrisnanakwasi2005@gmail.com</p>
          <div className="footer-socials">
            <span className="social-icon">TG</span>
            <span className="social-icon">FB</span>
            <span className="social-icon">X</span>
            <span className="social-icon">IG</span>
          </div>
        </div>

        <div className="footer-col">
          <h3 className="footer-heading">Useful Links</h3>
          <ul className="footer-links">
            {/* CHANGED TO BUTTONS THAT TRIGGER ROUTING! */}
            <li><button className="footer-link-btn" onClick={() => onNavigate('notes')}>Home</button></li>
            <li><button className="footer-link-btn" onClick={() => onNavigate('notes')}>Course Materials</button></li>
            <li><button className="footer-link-btn" onClick={() => onNavigate('videos')}>Video Resources</button></li>
            <li><button className="footer-link-btn" onClick={() => onNavigate('guides')}>Survival Guide</button></li>
            <li><button className="footer-link-btn" onClick={() => onNavigate('cgpa')}>CGPA Tracker</button></li>
            <li><button className="footer-link-btn" onClick={() => onNavigate('about')}>About</button></li>
          </ul>
        </div>

        <div className="footer-col">
          <h3 className="footer-heading">Our Newsletter</h3>
          <p className="footer-text">Subscribe to our newsletter and receive the latest news about our products and services!</p>
          <form className="newsletter-form" onSubmit={(e) => { e.preventDefault(); alert('Subscription feature coming soon!'); }}>
            <input type="email" placeholder="Email Address" required className="newsletter-input" />
            <button type="submit" className="newsletter-btn">Subscribe</button>
          </form>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© Copyright 2026 <strong>Eduvhibe</strong> | All Rights Reserved</p>
        <p>Developed by <strong>Osei Chris</strong></p>
      </div>
    </footer>
  );
}