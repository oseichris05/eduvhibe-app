// src/AuthModal.jsx
import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import './Eduvhibe.css';

export default function AuthModal({ isOpen, onClose }) {
  // Toggle between Login and Sign Up mode
  const [isLogin, setIsLogin] = useState(true);
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // If the modal isn't supposed to be open, don't render anything!
  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        // --- SUPABASE LOGIN LOGIC ---
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        // If successful, close the modal!
        onClose(); 
      } else {
        // --- SUPABASE SIGN UP LOGIC ---
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName, // Saves their name into the auth metadata
            }
          }
        });
        if (error) throw error;
        
        alert("Registration successful! You are now logged in.");
        onClose();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-modal-overlay fade-in">
      <div className="auth-modal-card">
        
        {/* Close Button */}
        <button className="auth-close-btn" onClick={onClose}>&times;</button>
        
        <h2 className="auth-title">{isLogin ? 'Welcome Back' : 'Join Eduvhibe'}</h2>
        <p className="auth-subtitle">
          {isLogin ? 'Log in to access your saved CGPA and materials.' : 'Create an account to track your academic progress.'}
        </p>

        {/* Error Message Display */}
        {error && <div className="auth-error-box">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          
          {/* Only show Full Name input if they are Signing Up */}
          {!isLogin && (
            <div className="auth-input-group">
              <label>Full Name</label>
              <input 
                type="text" 
                required 
                placeholder="E.g., Osei Chris" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          )}

          <div className="auth-input-group">
            <label>Email Address</label>
            <input 
              type="email" 
              required 
              placeholder="student@university.edu" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="auth-input-group">
            <label>Password</label>
            <input 
              type="password" 
              required 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Processing...' : (isLogin ? 'Log In' : 'Sign Up')}
          </button>
        </form>

        <div className="auth-toggle-area">
          <p>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span 
              className="auth-toggle-link" 
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null); // Clear errors when switching modes
              }}
            >
              {isLogin ? 'Sign up here' : 'Log in here'}
            </span>
          </p>
        </div>

      </div>
    </div>
  );
}