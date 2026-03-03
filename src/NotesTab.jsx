// src/NotesTab.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { useUser } from './UserContext';
import SearchBar from './SearchBar'; // Using your custom component!
import './Eduvhibe.css';

export default function NotesTab() {
  const { session } = useUser();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- SEARCH & FILTER STATE ---
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all'); // Default to showing everything
  
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [level, setLevel] = useState('100');
  const [selectedFile, setSelectedFile] = useState(null);

  // --- ADMIN SECURITY LOCK ---
  const ADMIN_EMAIL = 'chrisnanakwasi2005@gmail.com';
  const isAdmin = session?.user?.email === ADMIN_EMAIL;

  // Options for your SearchBar dropdown
  const filterOptions = [
    { value: 'all', label: 'All Levels' },
    { value: '100', label: 'Level 100' },
    { value: '200', label: 'Level 200' },
    { value: '300', label: 'Level 300' },
    { value: '400', label: 'Level 400' }
  ];

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

  const handleDeleteNote = async (id, fileUrl) => {
    if (!isAdmin) return; 
    if (!window.confirm("Are you sure you want to delete this note permanently?")) return;

    try {
      const fileName = fileUrl.split('/').pop();
      
      
      if (fileName) {
        const { error: storageError } = await supabase.storage.from('course-pdfs').remove([fileName]);
        if (storageError) console.error("Storage delete warning:", storageError);
      }

      
      const { error: dbError } = await supabase.from('course_materials').delete().eq('id', id);
      if (dbError) throw dbError;

      // 3. Remove from screen only if DB delete succeeded
      setNotes(notes.filter(note => note.id !== id));
      
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Database blocked the delete. Please run the SQL permissions in Supabase!");
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) return; 
    
    if (!selectedFile || !selectedFile.size) return alert("Error: Please re-select your PDF file.");
    if (!title) return alert("Please provide a title.");

    setUploading(true);
    try {
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.pdf`;

      const { error: uploadError } = await supabase.storage
        .from('course-pdfs')
        .upload(fileName, selectedFile, { contentType: 'application/pdf' });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('course-pdfs')
        .getPublicUrl(fileName);

      const fileUrl = publicUrlData.publicUrl;
      const fileSizeMb = (selectedFile.size / (1024 * 1024)).toFixed(2) + ' MB';

      const { error: dbError } = await supabase
        .from('course_materials')
        .insert([{
          title, description, level, file_url: fileUrl, file_size: fileSizeMb, pages: 'N/A' 
        }]);

      if (dbError) throw dbError;

      alert("Note uploaded successfully!");
      setShowUploadForm(false);
      setTitle(''); setDescription(''); setLevel('100'); setSelectedFile(null);
      fetchNotes(); 

    } catch (error) {
      console.error("Upload process failed:", error);
      alert("Failed to upload. Check console for details.");
    } finally {
      setUploading(false);
    }
  };

  // --- THE DUAL FILTERING ENGINE ---
  const filteredNotes = notes.filter(note => {
   
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      note.title?.toLowerCase().includes(searchLower) ||
      note.description?.toLowerCase().includes(searchLower);

    // 2. Does it match the selected level?
    const matchesLevel = selectedFilter === 'all' || note.level === selectedFilter;

    // It must match BOTH to appear on screen
    return matchesSearch && matchesLevel;
  });

  return (
    <div className="fade-in" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ color: 'var(--color-primary-900)', fontSize: '2rem', marginBottom: '8px' }}>Course Notes & PDFs</h2>
          <p style={{ color: 'var(--color-secondary-600)' }}>Download materials for your semester.</p>
        </div>
        
        {isAdmin && (
          <button 
            onClick={() => setShowUploadForm(!showUploadForm)}
            style={{
              backgroundColor: showUploadForm ? 'var(--color-secondary-500)' : 'var(--color-primary-500)',
              color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'
            }}
          >
            {showUploadForm ? 'Cancel Upload' : '+ Upload Note'}
          </button>
        )}
      </div>

      {/* CUSTOM SEARCH BAR INTEGRATION */}
      <SearchBar 
        placeholder="Search notes by title or topic..." 
        onSearch={setSearchQuery} // Passes typed text directly to state
        onFilter={setSelectedFilter} // Passes selected dropdown value directly to state
        filterOptions={filterOptions} // Passes our levels list
      />

      {/* ADMIN UPLOAD FORM */}
      {isAdmin && showUploadForm && (
        <div className="cgpa-card" style={{ marginBottom: '40px', backgroundColor: '#f8fafc', border: '1px dashed var(--color-primary-300)' }}>
          <h3 style={{ marginBottom: '20px', color: 'var(--color-primary-800)' }}>Admin: Upload a New Course Material</h3>
          <form onSubmit={handleUploadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            
            <div style={{ display: 'flex', gap: '15px' }}>
              <input type="text" placeholder="Note Title (e.g., Intro to Economics Ch 1)" required className="cgpa-input" style={{ flex: 2 }}
                value={title} onChange={(e) => setTitle(e.target.value)} />
              
              <select className="cgpa-input" style={{ flex: 1 }} value={level} onChange={(e) => setLevel(e.target.value)}>
                <option value="100">Level 100</option>
                <option value="200">Level 200</option>
                <option value="300">Level 300</option>
                <option value="400">Level 400</option>
              </select>
            </div>

            <input type="text" placeholder="Short description or lecturer name..." className="cgpa-input"
              value={description} onChange={(e) => setDescription(e.target.value)} />

            <input 
              type="file" accept=".pdf" required className="cgpa-input" 
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) setSelectedFile(file);
              }} 
            />

            <button type="submit" disabled={uploading} style={{
              backgroundColor: uploading ? 'var(--color-secondary-400)' : 'var(--color-primary-600)',
              color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: uploading ? 'not-allowed' : 'pointer', fontWeight: 'bold'
            }}>
              {uploading ? 'Uploading to Cloud...' : 'Submit to Database'}
            </button>
          </form>
        </div>
      )}

      {/* NOTES GRID */}
      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--color-secondary-500)' }}>Loading course materials...</p>
      ) : filteredNotes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--color-secondary-200)' }}>
          <h3 style={{ color: 'var(--color-secondary-700)' }}>No notes found.</h3>
          <p style={{ color: 'var(--color-secondary-500)' }}>
            {searchQuery || selectedFilter !== 'all' ? "Try adjusting your search or filters." : "Check back later for new materials!"}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {filteredNotes.map((note) => (
            <div key={note.id} className="cgpa-card" style={{ display: 'flex', flexDirection: 'column', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                <span style={{ backgroundColor: 'var(--color-primary-100)', color: 'var(--color-primary-800)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                  Lvl {note.level}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-secondary-500)' }}>{note.file_size}</span>
              </div>
              
              <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', color: 'var(--color-secondary-900)' }}>{note.title}</h3>
              <p style={{ color: 'var(--color-secondary-600)', fontSize: '0.9rem', flexGrow: 1, marginBottom: '20px' }}>
                {note.description || 'No description provided.'}
              </p>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <a 
                  href={note.file_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{
                    flex: 1, textAlign: 'center', backgroundColor: 'var(--color-primary-50)', color: 'var(--color-primary-700)',
                    padding: '10px', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', border: '1px solid var(--color-primary-200)'
                  }}
                >
                  📥 Read / Download PDF
                </a>
                
                {isAdmin && (
                  <button 
                    onClick={() => handleDeleteNote(note.id, note.file_url)}
                    style={{
                      backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', 
                      padding: '10px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'
                    }}
                    title="Delete Note"
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}