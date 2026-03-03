// // src/Eduvhibe.jsx
// import React, { useState, useEffect } from 'react';
// import { supabase } from './supabaseClient';
// import { useUser } from './UserContext';
// import AuthModal from './AuthModal';
// import Footer from './Footer';

// // Tab Imports
// import AboutTab from './AboutTab';
// import NotesTab from './NotesTab';
// import VideosTab from './VideosTab';
// import SurvivalGuideTab from './SurvivalGuideTab'; 
// import CGPATrackerTab from './CGPATrackerTab';

// import './Eduvhibe.css';

// export default function Eduvhibe() {
//   const { session, activeTab, setActiveTab } = useUser();
//   const [showAuth, setShowAuth] = useState(false);

//   useEffect(() => {
//     if (session) setShowAuth(false);
//   }, [session]);

//   const handleLogout = async () => {
//     await supabase.auth.signOut();
//   };

//   const handleNavigation = (tabName) => {
//     setActiveTab(tabName);
//     window.scrollTo({ top: 0, behavior: 'smooth' });
//   };

//   return (
//     <div className="eduvhibe-container"> {/* Matches your CSS .eduvhibe-container */}
      
//       {/* --- RESPONSIVE HEADER START --- */}
//       {/* I CHANGED THIS TO 'edu-header' TO MATCH YOUR CSS */}
//       <header className="edu-header">
        
//         {/* LEFT LANE: Back to Sharether */}
//         <div className="header-left">
//           <a href="https://sharether.com" className="back-link-btn">
//             <span className="arrow-icon">←</span> 
//             <span className="back-text">Sharether</span>
//           </a>
//         </div>

//         {/* CENTER LANE: Title & Tagline */}
//         <div className="header-center">
//           {/* I CHANGED THESE TO 'edu-title' and 'edu-tagline' */}
//           <h1 className="edu-title">Eduvhibe</h1>
//           <p className="edu-tagline">Empowering Education, Connecting Minds.</p>
//         </div>

//         {/* RIGHT LANE: User Profile / Log In */}
//         <div className="header-right">
//           {session ? (
//             <div className="user-profile-badge">
//               <div className="user-info-text">
//                 <span className="greeting">Hi,</span>
//                 <span className="username">{session.user.user_metadata.full_name?.split(' ')[0] || 'Scholar'}</span>
//               </div>
//               <button className="logout-btn-small" onClick={handleLogout}>Log Out</button>
//             </div>
//           ) : (
//             <button className="login-btn-main" onClick={() => setShowAuth(true)}>
//               Log In
//             </button>
//           )}
//         </div>

//       </header>
//       {/* --- RESPONSIVE HEADER END --- */}

//       {/* MOBILE SWIPE HINT */}
//       <div className="mobile-swipe-hint">
//         Swipe for more tabs <span>→</span>
//       </div>

//       {/* NAVIGATION TABS (Matches your .edu-tabs class) */}
//       <div className="edu-tabs">
//         <button className={`edu-tab ${activeTab === 'notes' ? 'active' : ''}`} onClick={() => handleNavigation('notes')}>
//           Notes
//         </button>
//         <button className={`edu-tab ${activeTab === 'videos' ? 'active' : ''}`} onClick={() => handleNavigation('videos')}>
//           Video Resources
//         </button>
//         <button className={`edu-tab ${activeTab === 'guides' ? 'active' : ''}`} onClick={() => handleNavigation('guides')}>
//           Survival Guides
//         </button>
//         <button className={`edu-tab ${activeTab === 'cgpa' ? 'active' : ''}`} onClick={() => handleNavigation('cgpa')}>
//           CGPA Tracker
//         </button>
//         <button className={`edu-tab ${activeTab === 'about' ? 'active' : ''}`} onClick={() => handleNavigation('about')}>
//           About
//         </button>
//       </div>

//       {/* MAIN CONTENT AREA */}
//       <main className="edu-content-area">
//         {activeTab === 'notes' && <NotesTab />}
//         {activeTab === 'videos' && <VideosTab />}
//         {activeTab === 'cgpa' && <CGPATrackerTab />}
//         {activeTab === 'guides' && <SurvivalGuideTab />}        
//         {activeTab === 'about' && <AboutTab />}
//       </main>

//       {/* FOOTER */}
//       <Footer onNavigate={handleNavigation} />

//       {/* AUTH MODAL */}
//       {showAuth && (
//         <AuthModal 
//           isOpen={showAuth} 
//           onClose={() => setShowAuth(false)} 
//         />
//       )}

//     </div>
//   );
// }



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