// src/VideosTab.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { useUser } from './UserContext';
import SearchBar from './SearchBar'; 
import './Eduvhibe.css';

export default function VideosTab() {
  // Grab the global 'isAdmin' flag from our Context
  const { session, isAdmin } = useUser(); 
  
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- SEARCH STATE ---
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  // --- ADMIN STATE ---
  const [showAddForm, setShowAddForm] = useState(false);
  const [adding, setAdding] = useState(false);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [level, setLevel] = useState('100');

  const filterOptions = [
    { value: 'all', label: 'All Levels' },
    { value: '100', label: 'Level 100' },
    { value: '200', label: 'Level 200' },
    { value: '300', label: 'Level 300' },
    { value: '400', label: 'Level 400' }
  ];

  // Helper to get YouTube ID from various URL formats
  const getYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const fetchVideos = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('video_resources')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) console.error("Error fetching videos:", error);
    else setVideos(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleAddVideo = async (e) => {
    e.preventDefault();
    if (!isAdmin) return; // Secure check
    if (!title || !videoUrl) return alert("Title and YouTube URL are required.");

    // Validate YouTube URL
    if (!getYouTubeId(videoUrl)) return alert("Please enter a valid YouTube URL.");

    setAdding(true);
    try {
      const { error } = await supabase
        .from('video_resources')
        .insert([{ title, description, video_url: videoUrl, level }]);

      if (error) throw error;

      alert("Video added successfully!");
      setShowAddForm(false);
      setTitle(''); setDescription(''); setVideoUrl(''); setLevel('100');
      fetchVideos();

    } catch (error) {
      console.error("Error adding video:", error);
      alert("Failed to add video. Make sure you are an Admin.");
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteVideo = async (id) => {
    if (!isAdmin) return; // Secure check
    if (!window.confirm("Are you sure you want to delete this video?")) return;

    try {
      const { error } = await supabase.from('video_resources').delete().eq('id', id);
      if (error) throw error;
      setVideos(videos.filter(v => v.id !== id));
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete video. Database permission denied.");
    }
  };

  // --- FILTER ENGINE ---
  const filteredVideos = videos.filter(video => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      video.title?.toLowerCase().includes(searchLower) ||
      video.description?.toLowerCase().includes(searchLower);
    const matchesLevel = selectedFilter === 'all' || video.level === selectedFilter;

    return matchesSearch && matchesLevel;
  });

  return (
    <div className="fade-in" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ color: 'var(--color-primary-900)', fontSize: '2rem', marginBottom: '8px' }}>Video Resources</h2>
          <p style={{ color: 'var(--color-secondary-600)' }}>Curated tutorials for your studies.</p>
        </div>
        
        {isAdmin && (
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            style={{
              backgroundColor: showAddForm ? 'var(--color-secondary-500)' : 'var(--color-primary-500)',
              color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'
            }}
          >
            {showAddForm ? 'Cancel' : '+ Add Video'}
          </button>
        )}
      </div>

      <SearchBar 
        placeholder="Search videos by title..." 
        onSearch={setSearchQuery} 
        onFilter={setSelectedFilter} 
        filterOptions={filterOptions} 
      />

      {/* ADMIN ADD FORM */}
      {isAdmin && showAddForm && (
        <div className="cgpa-card" style={{ marginBottom: '40px', backgroundColor: '#f8fafc', border: '1px dashed var(--color-primary-300)' }}>
          <h3 style={{ marginBottom: '20px', color: 'var(--color-primary-800)' }}>Add New YouTube Video</h3>
          <form onSubmit={handleAddVideo} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            
            <div style={{ display: 'flex', gap: '15px' }}>
              <input type="text" placeholder="Video Title" required className="cgpa-input" style={{ flex: 2 }}
                value={title} onChange={(e) => setTitle(e.target.value)} />
              
              <select className="cgpa-input" style={{ flex: 1 }} value={level} onChange={(e) => setLevel(e.target.value)}>
                <option value="100">Level 100</option>
                <option value="200">Level 200</option>
                <option value="300">Level 300</option>
                <option value="400">Level 400</option>
              </select>
            </div>

            <input type="text" placeholder="Paste YouTube Link here..." required className="cgpa-input"
              value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />
            
            <input type="text" placeholder="Short description..." className="cgpa-input"
              value={description} onChange={(e) => setDescription(e.target.value)} />

            <button type="submit" disabled={adding} style={{
              backgroundColor: adding ? 'var(--color-secondary-400)' : 'var(--color-primary-600)',
              color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: adding ? 'not-allowed' : 'pointer', fontWeight: 'bold'
            }}>
              {adding ? 'Adding Video...' : 'Post Video'}
            </button>
          </form>
        </div>
      )}

      {/* VIDEO GRID */}
      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--color-secondary-500)' }}>Loading videos...</p>
      ) : filteredVideos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--color-secondary-200)' }}>
          <h3 style={{ color: 'var(--color-secondary-700)' }}>No videos found.</h3>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px' }}>
          {filteredVideos.map((video) => {
            const videoId = getYouTubeId(video.video_url);
            const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;

            return (
              <div key={video.id} className="cgpa-card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {/* VIDEO THUMBNAIL / EMBED TRIGGER */}
                <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', backgroundColor: '#000' }}>
                   {thumbnailUrl ? (
                     <a href={video.video_url} target="_blank" rel="noopener noreferrer">
                       <img 
                         src={thumbnailUrl} 
                         alt={video.title}
                         style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: '0.9' }}
                       />
                       <div style={{
                         position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                         width: '50px', height: '50px', backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: '50%',
                         display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white'
                       }}>
                         <span style={{ color: 'white', fontSize: '20px', marginLeft: '4px' }}>▶</span>
                       </div>
                     </a>
                   ) : (
                     <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                       Invalid Video Link
                     </div>
                   )}
                </div>

                <div style={{ padding: '20px', flexGrow: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                    <span style={{ backgroundColor: 'var(--color-primary-100)', color: 'var(--color-primary-800)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                      Lvl {video.level}
                    </span>
                    {isAdmin && (
                      <button onClick={() => handleDeleteVideo(video.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }} title="Delete Video">
                        🗑️
                      </button>
                    )}
                  </div>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '8px', lineHeight: '1.4' }}>{video.title}</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--color-secondary-600)' }}>{video.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}