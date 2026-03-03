

// src/Eduvhibe.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { useUser } from './UserContext';
import AuthModal from './AuthModal';

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

  // Close modal automatically when user logs in
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
    <div className="app-container">
      
      {/* === THE NEW UNIFIED NAVBAR === */}
      <nav className="unified-navbar">
        
        {/* SECTION 1: LOGO (Left) */}
        <div className="nav-brand">
          <span className="brand-text">Eduvhibe</span>
        </div>

        {/* SECTION 2: TABS (Center) */}
        <div className="nav-tabs-scroll">
          <button className={`nav-pill ${activeTab === 'notes' ? 'active' : ''}`} onClick={() => handleNavigation('notes')}>
            Notes
          </button>
          <button className={`nav-pill ${activeTab === 'videos' ? 'active' : ''}`} onClick={() => handleNavigation('videos')}>
            Videos
          </button>
          <button className={`nav-pill ${activeTab === 'guides' ? 'active' : ''}`} onClick={() => handleNavigation('guides')}>
            Guides
          </button>
          <button className={`nav-pill ${activeTab === 'cgpa' ? 'active' : ''}`} onClick={() => handleNavigation('cgpa')}>
            CGPA
          </button>
          <button className={`nav-pill ${activeTab === 'about' ? 'active' : ''}`} onClick={() => handleNavigation('about')}>
            About
          </button>
        </div>

        {/* SECTION 3: LOGIN / PROFILE (Right) */}
        <div className="nav-auth-section">
          {session ? (
            <div className="mini-profile">
              <span className="mini-name">{session.user.user_metadata.full_name?.split(' ')[0] || 'User'}</span>
              <button className="mini-logout-btn" onClick={handleLogout}>Log Out</button>
            </div>
          ) : (
            <button className="mini-login-btn" onClick={() => setShowAuth(true)}>
              Log In
            </button>
          )}
        </div>

      </nav>

      {/* === MAIN CONTENT === */}
      <main className="content-area-padded">
        {activeTab === 'notes' && <NotesTab />}
        {activeTab === 'videos' && <VideosTab />}
        {activeTab === 'cgpa' && <CGPATrackerTab />}
        {activeTab === 'guides' && <SurvivalGuideTab />}
        {activeTab === 'about' && <AboutTab />}
      </main>

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