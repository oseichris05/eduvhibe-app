// src/ArticleView.jsx
import React from 'react';
import './Eduvhibe.css';

export default function ArticleView({ article, onBack }) {
  // CRASH PROTECTION: If no article is passed, show a safe fallback
  if (!article) {
    return (
      <div className="edu-placeholder">
        <h3>Loading Article...</h3>
        <button className="back-to-guides-btn" onClick={onBack}>Go Back</button>
      </div>
    );
  }

  const sidebarArticles = [
    "Time Management for Students",
    "Building Healthy Study Groups",
    "Navigating Campus Resources",
    "Understanding Academic Integrity"
  ];

  return (
    <div className="article-view-container fade-in">
      <button className="back-to-guides-btn" onClick={onBack}>
        ← Back to Survival Guides
      </button>

      <div className="article-layout">
        <div className="article-main-content card-wrapper">
          <h1 className="article-headline">{article.title}</h1>
          
          <div className="article-meta-row">
            <span>⏱️ {article.readTime}</span>
            <span>📅 Today</span>
            <span>👤 Osei Chris</span>
          </div>

          <div className="article-body">
            {article.image && (
              <img 
                src={article.image} 
                alt={article.title} 
                className="article-hero-img"
              />
            )}
            
            <p className="article-excerpt-styled">{article.excerpt}</p>
            
            <h3 className="article-subheading">1. Introduction</h3>
            <p>Mastering these concepts plays a massive role in how you adapt to campus life and your future teaching career.</p>
          </div>
        </div>

        <div className="article-sidebar card-wrapper">
          <h3 className="sidebar-heading">RELATED ARTICLES</h3>
          <ul className="sidebar-list">
            {sidebarArticles.map((title, index) => (
              <li key={index} className="sidebar-item">
                <span className="sidebar-icon">📄</span> {title}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}