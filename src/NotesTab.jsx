import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { useUser } from './UserContext';
import './Eduvhibe.css';

export default function NotesTab() {
  const { session, isAdmin } = useUser();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- PAGINATION SETTINGS ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6); // 6 cards keeps the grid clean (2 rows of 3)
  
  // --- SEARCH & FILTER ---
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('All');

  // --- UPLOAD STATE ---
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', level: '100', file: null });

  // 1. FETCH NOTES
  const fetchNotes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('course_materials')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) console.error("Error fetching notes:", error);
    else setNotes(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // 2. HANDLE UPLOAD (With 100MB Fix)
  const handleFileChange = (e) => {
    setNewNote({ ...newNote, file: e.target.files[0] });
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!newNote.file) return alert("Please select a file!");

    // --- SIZE CHECK ---
    const sizeLimit = 100 * 1024 * 1024; // 100MB
    if (newNote.file.size > sizeLimit) {
      alert("File is too big! Please keep it under 100MB.");
      return;
    }

    setUploading(true);
    const fileExt = newNote.file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('course_notes')
      .upload(filePath, newNote.file);

    if (uploadError) {
      alert("Upload failed: " + uploadError.message);
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('course_notes')
      .getPublicUrl(filePath);

    // Save to Database
    const { error: dbError } = await supabase
      .from('course_materials')
      .insert([{
        title: newNote.title,
        level: newNote.level,
        file_url: publicUrl,
        file_type: fileExt,
        uploaded_by: session.user.email
      }]);

    if (dbError) {
      alert("Database error: " + dbError.message);
    } else {
      alert("Note Uploaded!");
      setShowForm(false);
      setNewNote({ title: '', level: '100', file: null });
      fetchNotes();
    }
    setUploading(false);
  };

  // 3. DELETE FUNCTION
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this note?")) return;
    const { error } = await supabase.from('course_materials').delete().eq('id', id);
    if (!error) fetchNotes();
  };

  // 4. FILTERING & PAGINATION LOGIC
  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = filterLevel === 'All' || note.level === filterLevel;
    return matchesSearch && matchesLevel;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredNotes.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredNotes.length / itemsPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Smooth scroll to top of list when page changes
    window.scrollTo({ top: 100, behavior: 'smooth' }); 
  };

  return (
    <div className="notes-container fade-in">
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ color: 'var(--color-primary-900)', fontSize: '2rem', marginBottom: '8px' }}>Course Materials</h2>
          <p style={{ color: 'var(--color-secondary-600)' }}>Download lecture slides and past questions.</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => setShowForm(!showForm)}
            style={{
              backgroundColor: showForm ? 'var(--color-secondary-500)' : 'var(--color-primary-500)',
              color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'
            }}
          >
            {showForm ? 'Close' : '+ Upload'}
          </button>
        )}
      </div>

      {/* ADMIN UPLOAD FORM */}
      {isAdmin && showForm && (
        <div className="cgpa-card" style={{ marginBottom: '30px', backgroundColor: '#f0fdfa', border: '1px dashed var(--color-primary-300)' }}>
          <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="text" placeholder="Title (e.g. MATH 101 Slides)" required 
                className="cgpa-input" style={{ flex: 2 }}
                value={newNote.title} onChange={(e) => setNewNote({...newNote, title: e.target.value})}
              />
              <select 
                className="cgpa-input" style={{ flex: 1 }}
                value={newNote.level} onChange={(e) => setNewNote({...newNote, level: e.target.value})}
              >
                <option value="100">Level 100</option>
                <option value="200">Level 200</option>
                <option value="300">Level 300</option>
                <option value="400">Level 400</option>
              </select>
            </div>
            <input type="file" required onChange={handleFileChange} className="cgpa-input" />
            <button type="submit" disabled={uploading} style={{
              backgroundColor: uploading ? 'var(--color-secondary-400)' : 'var(--color-primary-600)',
              color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: uploading ? 'not-allowed' : 'pointer', fontWeight: 'bold'
            }}>
              {uploading ? 'Uploading...' : 'Upload File'}
            </button>
          </form>
        </div>
      )}

      {/* SEARCH BAR */}
      <div className="notes-toolbar">
        <input 
          type="text" placeholder="Search notes..." className="notes-search-input"
          value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
        />
        <select 
          className="notes-filter"
          value={filterLevel} onChange={(e) => { setFilterLevel(e.target.value); setCurrentPage(1); }}
        >
          <option value="All">All Levels</option>
          <option value="100">Level 100</option>
          <option value="200">Level 200</option>
          <option value="300">Level 300</option>
          <option value="400">Level 400</option>
        </select>
      </div>

      {/* GRID LAYOUT */}
      {loading ? (
        <p style={{ textAlign: 'center', padding: '40px' }}>Loading...</p>
      ) : currentItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-secondary-500)' }}>
          No notes found.
        </div>
      ) : (
        <>
          <div className="notes-grid">
            {currentItems.map((note) => (
              <div key={note.id} className="course-card">
                <div className="course-card-top">
                  <h3>{note.title}</h3>
                  <div className="course-meta">
                    <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '4px' }}>
                      Lvl {note.level}
                    </span>
                    <span>{note.file_type?.toUpperCase() || 'FILE'}</span>
                  </div>
                </div>
                <div className="course-card-bottom">
                  <p>Uploaded: {new Date(note.created_at).toLocaleDateString()}</p>
                  <div className="course-actions">
                    <a href={note.file_url} target="_blank" rel="noopener noreferrer" className="btn-download">
                      Download
                    </a>
                    {isAdmin && (
                      <button onClick={() => handleDelete(note.id)} className="btn-preview" style={{ color: '#ef4444', borderColor: '#ef4444' }}>
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CLEAN PAGINATION */}
          {totalPages > 1 && (
            <div className="pagination-container">
              <button className="page-btn nav-btn" onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>
                Previous
              </button>
              
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => paginate(index + 1)}
                  className={`page-btn ${currentPage === index + 1 ? 'active-page' : ''}`}
                >
                  {index + 1}
                </button>
              ))}

              <button className="page-btn nav-btn" onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages}>
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}