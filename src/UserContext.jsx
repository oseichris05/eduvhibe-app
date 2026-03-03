// src/UserContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export function UserProvider({ children }) {
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false); // NEW: Global Admin Flag

  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('edu_last_tab') || 'notes';
  });

  const [cgpaCourses, setCgpaCourses] = useState([]);
  const [lastReadArticle, setLastReadArticle] = useState(() => {
    return localStorage.getItem('edu_last_article') || null;
  });

  // --- AUTO-SAVERS ---
  useEffect(() => {
    localStorage.setItem('edu_last_tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (lastReadArticle) {
      localStorage.setItem('edu_last_article', lastReadArticle);
    }
  }, [lastReadArticle]);

  // --- MAIN LOGIC ---
  useEffect(() => {
    let isMounted = true;

    // Helper: Check if the current user is in the 'app_admins' table
    const checkAdminStatus = async (userEmail) => {
      if (!userEmail) {
        if (isMounted) setIsAdmin(false);
        return;
      }
      const { data } = await supabase
        .from('app_admins')
        .select('email')
        .eq('email', userEmail)
        .maybeSingle(); // Returns data if found, null if not
      
      if (isMounted) setIsAdmin(!!data); // True if email exists in table
    };

    const loadGuestData = () => {
      const localData = localStorage.getItem('edu_cgpa_data');
      if (isMounted) setCgpaCourses(localData ? JSON.parse(localData) : []);
    };

    const fetchCloudData = async (userId) => {
      const { data, error } = await supabase.from('cgpa_entries').select('*').eq('user_id', userId);
      if (!error && data && isMounted) {
        setCgpaCourses(data.map(c => ({
          id: c.id,
          semester: c.semester,
          courseName: c.course_name,
          credits: c.credits,
          grade: c.grade,
          gradePoints: c.grade_points
        })));
      }
    };

    const syncAndFetch = async (user) => {
      const localData = localStorage.getItem('edu_cgpa_data');
      const guestCourses = localData ? JSON.parse(localData) : [];

      if (guestCourses.length > 0) {
        const coursesToInsert = guestCourses.map(course => ({
          user_id: user.id,
          semester: course.semester,
          course_name: course.courseName,
          credits: course.credits,
          grade: course.grade,
          grade_points: course.gradePoints
        }));

        await supabase.from('cgpa_entries').insert(coursesToInsert);
        localStorage.removeItem('edu_cgpa_data'); 
      }
      fetchCloudData(user.id);
    };

    // 1. Initialize on Load
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      if (isMounted) {
        setSession(currentSession);
        if (currentSession) {
          syncAndFetch(currentSession.user);
          checkAdminStatus(currentSession.user.email); // CHECK ADMIN STATUS
        } else {
          loadGuestData();
          setIsAdmin(false);
        }
      }
    });

    // 2. Listen for Login/Logout
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (isMounted) {
        setSession(newSession);
        if (newSession) {
          syncAndFetch(newSession.user);
          checkAdminStatus(newSession.user.email); // CHECK ADMIN STATUS
        } else {
          setCgpaCourses([]);
          loadGuestData();
          setIsAdmin(false);
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const safeUpdateCgpaCourses = (newCourses) => {
    setCgpaCourses(newCourses);
    if (!session) {
      localStorage.setItem('edu_cgpa_data', JSON.stringify(newCourses));
    }
  };

  const value = {
    session,
    isAdmin, // We expose this to the whole app!
    activeTab,
    setActiveTab,
    cgpaCourses,
    setCgpaCourses: safeUpdateCgpaCourses, 
    lastReadArticle,
    setLastReadArticle
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}