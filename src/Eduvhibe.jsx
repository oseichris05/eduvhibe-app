// src/Eduvhibe.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { useUser } from './UserContext';
import AuthModal from './AuthModal';
import Footer from './Footer';

// Tab Imports
import AboutTab from './AboutTab';
import NotesTab from './NotesTab';
import VideosTab from './VideosTab';
import SurvivalGuideTab from './SurvivalGuideTab'; 
import CGPATrackerTab from './CGPATrackerTab';

import './Eduvhibe.css';

export default function Eduvhibe() {
  const { session, activeTab, setActiveTab } = useUser();
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    if (session) setShowAuth(false);
  }, [session]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleNavigation = (tabName) => {
    setActiveTab(tabName);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="eduvhibe-container"> {/* Matches your CSS .eduvhibe-container */}
      
      {/* --- RESPONSIVE HEADER START --- */}
      {/* I CHANGED THIS TO 'edu-header' TO MATCH YOUR CSS */}
      <header className="edu-header">
        
        {/* LEFT LANE: Back to Sharether */}
        <div className="header-left">
          <a href="https://sharether.com" className="back-link-btn">
            <span className="arrow-icon">←</span> 
            <span className="back-text">Sharether</span>
          </a>
        </div>

        {/* CENTER LANE: Title & Tagline */}
        <div className="header-center">
          {/* I CHANGED THESE TO 'edu-title' and 'edu-tagline' */}
          <h1 className="edu-title">Eduvhibe</h1>
          <p className="edu-tagline">Empowering Education, Connecting Minds.</p>
        </div>

        {/* RIGHT LANE: User Profile / Log In */}
        <div className="header-right">
          {session ? (
            <div className="user-profile-badge">
              <div className="user-info-text">
                <span className="greeting">Hi,</span>
                <span className="username">{session.user.user_metadata.full_name?.split(' ')[0] || 'Scholar'}</span>
              </div>
              <button className="logout-btn-small" onClick={handleLogout}>Log Out</button>
            </div>
          ) : (
            <button className="login-btn-main" onClick={() => setShowAuth(true)}>
              Log In
            </button>
          )}
        </div>

      </header>
      {/* --- RESPONSIVE HEADER END --- */}

      {/* MOBILE SWIPE HINT */}
      <div className="mobile-swipe-hint">
        Swipe for more tabs <span>→</span>
      </div>

      {/* NAVIGATION TABS (Matches your .edu-tabs class) */}
      <div className="edu-tabs">
        <button className={`edu-tab ${activeTab === 'notes' ? 'active' : ''}`} onClick={() => handleNavigation('notes')}>
          Notes
        </button>
        <button className={`edu-tab ${activeTab === 'videos' ? 'active' : ''}`} onClick={() => handleNavigation('videos')}>
          Video Resources
        </button>
        <button className={`edu-tab ${activeTab === 'guides' ? 'active' : ''}`} onClick={() => handleNavigation('guides')}>
          Survival Guides
        </button>
        <button className={`edu-tab ${activeTab === 'cgpa' ? 'active' : ''}`} onClick={() => handleNavigation('cgpa')}>
          CGPA Tracker
        </button>
        <button className={`edu-tab ${activeTab === 'about' ? 'active' : ''}`} onClick={() => handleNavigation('about')}>
          About
        </button>
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="edu-content-area">
        {activeTab === 'notes' && <NotesTab />}
        {activeTab === 'videos' && <VideosTab />}
        {activeTab === 'cgpa' && <CGPATrackerTab />}
        {activeTab === 'guides' && <SurvivalGuideTab />}        
        {activeTab === 'about' && <AboutTab />}
      </main>

      {/* FOOTER */}
      <Footer onNavigate={handleNavigation} />

      {/* AUTH MODAL */}
      {showAuth && (
        <AuthModal 
          isOpen={showAuth} 
          onClose={() => setShowAuth(false)} 
        />
      )}

    </div>
  );
}