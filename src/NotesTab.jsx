// src/NotesTab.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { useUser } from './UserContext';
import './Eduvhibe.css';

export default function NotesTab() {
  const { session, isAdmin } = useUser();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- PAGINATION & SEARCH STATE ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6); // Show 6 notes per page
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('All');

  // --- UPLOAD STATE ---
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', level: '100', file: null });

  // --- FETCH NOTES ---
  const fetchNotes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('course_materials') // Ensure this matches your DB table name
      .select('*')
      .order('created_at', { ascending: false });

    if (error) console.error("Error fetching notes:", error);
    else setNotes(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // --- HANDLE UPLOAD ---
  const handleFileChange = (e) => {
    setNewNote({ ...newNote, file: e.target.files[0] });
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!newNote.file) return alert("Please select a file!");

    // 1. FILE SIZE CHECK (100MB Limit)
    const sizeLimit = 100 * 1024 * 1024; 
    if (newNote.file.size > sizeLimit) {
      alert("File is too big! Max size is 100MB.");
      return;
    }

    setUploading(true);

    // 2. Upload File to Storage Bucket
    const fileExt = newNote.file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('course_notes') // Check if your bucket is named 'course_notes'
      .upload(filePath, newNote.file);

    if (uploadError) {
      alert("Upload failed: " + uploadError.message);
      setUploading(false);
      return;
    }

    // 3. Get Public URL
    const { data: { publicUrl } } = supabase.storage
      .from('course_notes')
      .getPublicUrl(filePath);

    // 4. Save Metadata to Database
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
      alert("Note Uploaded Successfully!");
      setShowForm(false);
      setNewNote({ title: '', level: '100', file: null });
      fetchNotes(); // Refresh list
    }
    setUploading(false);
  };

  // --- HANDLE DELETE ---
  const handleDelete = async (id, fileUrl) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;

    // Try to delete from storage (optional, depends on policy)
    // const fileName = fileUrl.split('/').pop();
    // await supabase.storage.from('course_notes').remove([fileName]);

    // Delete from DB
    const { error } = await supabase.from('course_materials').delete().eq('id', id);
    
    if (error) alert("Error deleting: " + error.message);
    else fetchNotes();
  };

  // --- FILTERING LOGIC ---
  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = filterLevel === 'All' || note.level === filterLevel;
    return matchesSearch && matchesLevel;
  });

  // --- PAGINATION LOGIC ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredNotes.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredNotes.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="notes-container fade-in">
      
      {/* HEADER SECTION */}
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
            {showForm ? 'Close Upload' : '+ Upload Note'}
          </button>
        )}
      </div>

      {/* UPLOAD FORM (Admin Only) */}
      {isAdmin && showForm && (
        <div className="cgpa-card" style={{ marginBottom: '30px', backgroundColor: '#f0fdfa', border: '1px dashed var(--color-primary-300)' }}>
          <h3 style={{ marginBottom: '15px', color: 'var(--color-primary-800)' }}>Upload New Material</h3>
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
              {uploading ? 'Uploading (Please wait)...' : 'Upload File'}
            </button>
          </form>
        </div>
      )}

      {/* SEARCH & FILTER BAR */}
      <div className="notes-toolbar">
        <input 
          type="text" 
          placeholder="Search notes..." 
          className="notes-search-input"
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} // Reset to page 1 on search
        />
        <select 
          className="notes-filter"
          value={filterLevel}
          onChange={(e) => { setFilterLevel(e.target.value); setCurrentPage(1); }}
        >
          <option value="All">All Levels</option>
          <option value="100">Level 100</option>
          <option value="200">Level 200</option>
          <option value="300">Level 300</option>
          <option value="400">Level 400</option>
        </select>
      </div>

      {/* NOTES GRID */}
      {loading ? (
        <p style={{ textAlign: 'center' }}>Loading library...</p>
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
                    <span>{note.file_type?.toUpperCase() || 'PDF'}</span>
                  </div>
                </div>
                <div className="course-card-bottom">
                  <p>Uploaded on {new Date(note.created_at).toLocaleDateString()}</p>
                  <div className="course-actions">
                    <a href={note.file_url} target="_blank" rel="noopener noreferrer" className="btn-download">
                      Download
                    </a>
                    {isAdmin && (
                      <button 
                        onClick={() => handleDelete(note.id, note.file_url)}
                        className="btn-preview"
                        style={{ color: '#ef4444', borderColor: '#ef4444' }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* PAGINATION CONTROLS */}
          {totalPages > 1 && (
            <div className="pagination-container">
              <button 
                className="page-btn nav-btn" 
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              
              {/* Generate Page Numbers */}
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => paginate(index + 1)}
                  className={`page-btn ${currentPage === index + 1 ? 'active-page' : ''}`}
                >
                  {index + 1}
                </button>
              ))}

              <button 
                className="page-btn nav-btn" 
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}