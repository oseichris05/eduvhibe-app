import React, { useState } from 'react';
import { useUser } from './UserContext'; 
import { supabase } from './supabaseClient'; 
import './Eduvhibe.css';

export default function CGPATrackerTab() {
  const { session, cgpaCourses, setCgpaCourses } = useUser();
  
  const [activeSemester, setActiveSemester] = useState(1);
  const [courseName, setCourseName] = useState('');
  const [credits, setCredits] = useState('');
  const [grade, setGrade] = useState('A');

  const gradePointsMap = {
    'A': 4.0, 'B+': 3.5, 'B': 3.0, 'C+': 2.5, 'C': 2.0, 'D+': 1.5, 'D': 1.0, 'E': 0.0, 'F': 0.0
  };

  const handleAddCourse = async () => {
    if (!courseName || !credits) return alert("Please enter both a Course Name and Credits.");
    
    const newCourse = {
      semester: activeSemester,
      courseName,
      credits: parseInt(credits),
      grade,
      gradePoints: gradePointsMap[grade]
    };

    if (session) {
      const { data, error } = await supabase
        .from('cgpa_entries')
        .insert([{
          user_id: session.user.id,
          semester: newCourse.semester,
          course_name: newCourse.courseName,
          credits: newCourse.credits,
          grade: newCourse.grade,
          grade_points: newCourse.gradePoints
        }])
        .select() 
        .single();

      if (error) {
        console.error("Cloud Save Error:", error);
        return alert("Failed to save to database.");
      }
      
      setCgpaCourses([...cgpaCourses, { ...newCourse, id: data.id }]);
    } else {
      setCgpaCourses([...cgpaCourses, { ...newCourse, id: Date.now().toString() }]);
    }
    
    setCourseName('');
    setCredits('');
    setGrade('A');
  };

  const removeCourse = async (id) => {
    setCgpaCourses(cgpaCourses.filter(course => course.id !== id));

    if (session) {
      const { error } = await supabase.from('cgpa_entries').delete().eq('id', id);
      if (error) console.error("Cloud Delete Error:", error);
    }
  };

  const resetSemester = async () => {
    if (window.confirm(`Are you sure you want to clear Semester ${activeSemester}?`)) {
      setCgpaCourses(cgpaCourses.filter(course => Number(course.semester) !== Number(activeSemester)));

      if (session) {
        await supabase.from('cgpa_entries')
          .delete()
          .eq('user_id', session.user.id)
          .eq('semester', activeSemester);
      }
    }
  };

  const resetAll = async () => {
    if (window.confirm("WARNING: This will delete ALL semesters. Are you sure?")) {
      setCgpaCourses([]);

      if (session) {
        await supabase.from('cgpa_entries')
          .delete()
          .eq('user_id', session.user.id);
      }
    }
  };

  // THE CRUCIAL FIX: Force strict number conversion so React filters perfectly!
  const activeSemCourses = cgpaCourses.filter(c => Number(c.semester) === Number(activeSemester));

  const calculateGPA = (coursesArray) => {
    if (coursesArray.length === 0) return "0.00";
    const totalCredits = coursesArray.reduce((sum, c) => sum + Number(c.credits), 0);
    const totalPoints = coursesArray.reduce((sum, c) => sum + (Number(c.credits) * Number(c.gradePoints)), 0);
    return totalCredits === 0 ? "0.00" : (totalPoints / totalCredits).toFixed(2);
  };

  const currentSemGPA = calculateGPA(activeSemCourses);
  const cumulativeGPA = calculateGPA(cgpaCourses);

  return (
    <div className="cgpa-container fade-in">
      
      {!session && (
        <div style={{
          backgroundColor: '#fffbeb', border: '1px solid #fef3c7', borderLeft: '4px solid #f59e0b',
          padding: '16px 20px', borderRadius: '8px', marginBottom: '30px', color: '#b45309',
          fontWeight: '500', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          maxWidth: '1100px', margin: '0 auto 30px'
        }}>
          <div>
            <strong style={{ display: 'block', marginBottom: '4px' }}>⚠️ Guest Mode Active</strong>
            <span style={{ fontSize: '0.9rem' }}>Your grades are temporarily saved in this browser. Log in or create a free account to back them up to the cloud!</span>
          </div>
        </div>
      )}

      <div className="cgpa-grid">
        
        <div className="cgpa-card">
          <h3 className="cgpa-card-title">📅 Semester GPA Calculator</h3>
          <p className="cgpa-subtitle">Add your courses to calculate your GPA for the current semester.</p>

          <div className="semester-tabs">
            {/* YOUR FIX: Dynamic 8-semester standard degree rendering */}
            {Array.from({ length: 8 }, (_, i) => i + 1).map(sem => (
              <button 
                key={sem}
                className={`sem-tab-btn ${activeSemester === sem ? 'active-sem' : ''}`}
                onClick={() => setActiveSemester(sem)}
              >
                Semester {sem}
              </button>
            ))}
          </div>

          <div className="course-input-row">
            <input 
              type="text" placeholder="Course Name" className="cgpa-input name-input"
              value={courseName} onChange={(e) => setCourseName(e.target.value)}
            />
            <input 
              type="number" placeholder="Cr" className="cgpa-input cr-input"
              min="1" max="6" value={credits} onChange={(e) => setCredits(e.target.value)}
            />
            <select className="cgpa-input grade-input" value={grade} onChange={(e) => setGrade(e.target.value)}>
              <option value="A">A (4.0)</option>
              <option value="B+">B+ (3.5)</option>
              <option value="B">B (3.0)</option>
              <option value="C+">C+ (2.5)</option>
              <option value="C">C (2.0)</option>
              <option value="D+">D+ (1.5)</option>
              <option value="D">D (1.0)</option>
              <option value="E">E (0.0)</option>
              <option value="F">F (0.0)</option>
            </select>
            <button className="add-course-btn" onClick={handleAddCourse}>+ Add</button>
          </div>

          <ul className="added-courses-list">
            {activeSemCourses.length === 0 ? (
              <li style={{ textAlign: 'center', color: 'var(--color-secondary-400)', padding: '20px 0', fontStyle: 'italic' }}>
                No courses added for Semester {activeSemester} yet.
              </li>
            ) : (
              activeSemCourses.map(course => (
                <li className="course-list-item" key={course.id}>
                  <span style={{ flex: 2, fontWeight: '600' }}>{course.courseName}</span>
                  <span style={{ flex: 1, textAlign: 'center' }}>{course.credits} Cr</span>
                  <span style={{ flex: 1, textAlign: 'center', color: 'var(--color-primary-600)', fontWeight: 'bold' }}>{course.grade}</span>
                  <button 
                    onClick={() => removeCourse(course.id)}
                    style={{ background: 'none', border: 'none', color: 'var(--color-accent-red)', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.2rem' }}
                    title="Remove Course"
                  >
                    ×
                  </button>
                </li>
              ))
            )}
          </ul>

          <div className="cgpa-action-row">
            <button className="calc-btn reset-btn" onClick={resetSemester}>↻ Clear Semester</button>
          </div>

          <div className="gradient-box">
            <h4>Semester {activeSemester} GPA</h4>
            <div className="huge-number">{currentSemGPA}</div>
            <p>Based on {activeSemCourses.length} courses</p>
          </div>
        </div>

        <div className="cgpa-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 className="cgpa-card-title">📈 CGPA Calculator</h3>
          <p className="cgpa-subtitle">Your Cumulative Grade Point Average across all semesters combined.</p>

          <div className="gradient-box main-cgpa-box" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h4>Cumulative GPA (CGPA)</h4>
            <div className="huge-number" style={{ fontSize: '5rem', margin: '20px 0' }}>{cumulativeGPA}</div>
            <p>Average of all {cgpaCourses.length} completed courses</p>
          </div>

          <div className="grade-legend" style={{ marginTop: '30px', marginBottom: '20px' }}>
            <div><strong>1st Class</strong><br/>3.6 - 4.0</div>
            <div><strong>2nd Class U.</strong><br/>3.0 - 3.59</div>
            <div><strong>2nd Class L.</strong><br/>2.5 - 2.99</div>
            <div><strong>3rd Class</strong><br/>2.0 - 2.49</div>
            <div><strong>Pass</strong><br/>1.0 - 1.99</div>
          </div>

          <button className="calc-btn reset-btn" style={{ width: '100%' }} onClick={resetAll}>
            🗑️ Reset Entire Tracker
          </button>
        </div>

      </div>
    </div>
  );
}