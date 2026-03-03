// src/SurvivalGuideTab.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { useUser } from './UserContext';
import SearchBar from './SearchBar'; 
import './Eduvhibe.css';

/* --- CUSTOM MARKDOWN RENDERER --- */
const MarkdownRenderer = ({ content }) => {
  if (!content) return null;

  return (
    <div className="markdown-content">
      {content.split('\n').map((line, index) => {
        if (line.startsWith('### ')) return <h3 key={index} className="md-h3">{line.replace('### ', '')}</h3>;
        if (line.startsWith('## ')) return <h2 key={index} className="md-h2">{line.replace('## ', '')}</h2>;
        if (line.startsWith('# ')) return <h1 key={index} className="md-h1">{line.replace('# ', '')}</h1>;
        
        if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
          return <li key={index} className="md-li">{line.replace(/^[*|-]\s/, '')}</li>;
        }

        if (line.startsWith('> ')) {
          return <blockquote key={index} className="md-quote">{line.replace('> ', '')}</blockquote>;
        }

        const parts = line.split(/(\*\*.*?\*\*)/g);
        return (
          <p key={index} className="md-p">
            {parts.map((part, i) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i}>{part.slice(2, -2)}</strong>;
              }
              return part;
            })}
          </p>
        );
      })}
    </div>
  );
};

export default function SurvivalGuideTab() {
  const { session, isAdmin } = useUser();
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // View State
  const [viewMode, setViewMode] = useState('list'); 
  const [activeArticle, setActiveArticle] = useState(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Admin Form State
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // UPDATED STATE: Added 'author'
  const [newGuide, setNewGuide] = useState({
    title: '', 
    author: '', // <--- NEW FIELD
    category: 'Academic', 
    image_url: '', 
    content: '', 
    read_time: '3 min read'
  });

  const filterOptions = [
    { value: 'all', label: 'All Topics' },
    { value: 'Academic', label: 'Academic' },
    { value: 'Lifestyle', label: 'Lifestyle' },
    { value: 'Campus Hacks', label: 'Campus Hacks' },
    { value: 'Career', label: 'Career' },
    { value: 'Tech', label: 'Tech' }
  ];

  const fetchGuides = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('survival_guides')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) console.error("Error fetching guides:", error);
    else setGuides(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchGuides();
  }, []);

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    
    // Default author if empty
    const guideToUpload = {
      ...newGuide,
      author: newGuide.author || 'Eduvhibe Team'
    };

    setUploading(true);
    const { error } = await supabase.from('survival_guides').insert([guideToUpload]);
    if (error) {
      alert("Failed to publish.");
    } else {
      alert("Article Published!");
      setShowForm(false);
      // Reset form including author
      setNewGuide({ title: '', author: '', category: 'Academic', image_url: '', content: '', read_time: '3 min read' });
      fetchGuides();
    }
    setUploading(false);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Delete this article?")) return;
    await supabase.from('survival_guides').delete().eq('id', id);
    setGuides(guides.filter(g => g.id !== id));
    if (activeArticle?.id === id) setViewMode('list');
  };

  const filteredGuides = guides.filter(guide => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      guide.title?.toLowerCase().includes(searchLower) ||
      guide.content?.toLowerCase().includes(searchLower);
    const matchesCategory = selectedFilter === 'all' || guide.category === selectedFilter;
    return matchesSearch && matchesCategory;
  });

  // --- RENDER: READING MODE ---
  if (viewMode === 'reading' && activeArticle) {
    const recommended = guides.filter(g => g.id !== activeArticle.id).slice(0, 4);

    return (
      <div className="article-view-container fade-in">
        <button className="back-to-guides-btn" onClick={() => setViewMode('list')}>
          ← Back to Guides
        </button>
        
        <div className="article-layout">
          {/* LEFT: MAIN CONTENT */}
          <div className="card-wrapper">
             {activeArticle.image_url && (
              <img src={activeArticle.image_url} alt="Cover" className="article-hero-img" />
            )}
            
            {/* META ROW WITH AUTHOR */}
            <div className="article-meta-row">
              <span className="guide-category-badge">{activeArticle.category}</span>
              <span style={{ fontWeight: '600', color: 'var(--color-primary-700)' }}>
                By {activeArticle.author || 'Eduvhibe Team'}
              </span>
              <span>•</span>
              <span>{new Date(activeArticle.created_at).toLocaleDateString()}</span>
              <span>•</span>
              <span>{activeArticle.read_time}</span>
            </div>
            
            <h1 className="article-headline">{activeArticle.title}</h1>
            
            <div className="article-body">
              <MarkdownRenderer content={activeArticle.content} />
            </div>
          </div>

          {/* RIGHT: SIDEBAR */}
          <div className="article-sidebar">
            <h3 className="sidebar-heading">More Guides</h3>
            <ul className="sidebar-list">
              {recommended.length > 0 ? recommended.map(rec => (
                <li key={rec.id} className="sidebar-item" onClick={() => { 
                  setActiveArticle(rec); 
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{rec.title}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-secondary-500)' }}>{rec.read_time}</span>
                  </div>
                </li>
              )) : (
                <li className="sidebar-item">No other guides yet!</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER: LIST MODE ---
  return (
    <div className="guides-container fade-in" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ color: 'var(--color-primary-900)', fontSize: '2rem', marginBottom: '8px' }}>Survival Guides</h2>
          <p style={{ color: 'var(--color-secondary-600)' }}>Tips, tricks, and hacks for campus life.</p>
        </div>
        
        {isAdmin && (
          <button 
            onClick={() => setShowForm(!showForm)}
            style={{
              backgroundColor: showForm ? 'var(--color-secondary-500)' : 'var(--color-primary-500)',
              color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'
            }}
          >
            {showForm ? 'Cancel Editor' : '+ Write Article'}
          </button>
        )}
      </div>

      <SearchBar 
        placeholder="Search guides by title or content..." 
        onSearch={setSearchQuery} 
        onFilter={setSelectedFilter} 
        filterOptions={filterOptions} 
      />

      {isAdmin && showForm && (
        <div className="cgpa-card" style={{ marginBottom: '40px', backgroundColor: '#f8fafc', border: '1px dashed var(--color-primary-300)' }}>
          <h3 style={{ marginBottom: '20px', color: 'var(--color-primary-800)' }}>Write a New Guide</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-secondary-600)', marginBottom: '15px' }}>
            <strong>Markdown Supported:</strong> Use <code># Header</code>, <code>**bold**</code>, <code>* bullet points</code>, and <code>&gt; quotes</code>.
          </p>
          <form onSubmit={handlePublish} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            
            <div style={{ display: 'flex', gap: '15px' }}>
              <input type="text" placeholder="Article Title" required className="cgpa-input" style={{ flex: 2 }}
                value={newGuide.title} onChange={(e) => setNewGuide({ ...newGuide, title: e.target.value })} />
              
              {/* NEW AUTHOR INPUT */}
              <input type="text" placeholder="Author (e.g. Don Chris)" className="cgpa-input" style={{ flex: 1 }}
                value={newGuide.author} onChange={(e) => setNewGuide({ ...newGuide, author: e.target.value })} />
            </div>

            <div style={{ display: 'flex', gap: '15px' }}>
               <select className="cgpa-input" style={{ flex: 1 }} value={newGuide.category} onChange={(e) => setNewGuide({ ...newGuide, category: e.target.value })}>
                <option value="Academic">Academic</option>
                <option value="Lifestyle">Lifestyle</option>
                <option value="Campus Hacks">Campus Hacks</option>
                <option value="Career">Career</option>
                <option value="Tech">Tech</option>
              </select>

               <input type="text" placeholder="Read Time (e.g. '5 min read')" className="cgpa-input" style={{ flex: 1 }}
                value={newGuide.read_time} onChange={(e) => setNewGuide({ ...newGuide, read_time: e.target.value })} />
            </div>

            <input type="text" placeholder="Paste an Image URL (e.g. from Unsplash)..." className="cgpa-input"
              value={newGuide.image_url} onChange={(e) => setNewGuide({ ...newGuide, image_url: e.target.value })} />

            <textarea 
              rows="15" 
              placeholder="# My Awesome Title&#10;&#10;Introduction text here...&#10;&#10;## Subheading&#10;* Point one&#10;* Point two" 
              required className="cgpa-input"
              style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}
              value={newGuide.content} 
              onChange={(e) => setNewGuide({ ...newGuide, content: e.target.value })} 
            />

            <button type="submit" disabled={uploading} style={{
              backgroundColor: uploading ? 'var(--color-secondary-400)' : 'var(--color-primary-600)',
              color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: uploading ? 'not-allowed' : 'pointer', fontWeight: 'bold'
            }}>
              {uploading ? 'Publishing...' : 'Publish Guide'}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--color-secondary-500)' }}>Loading guides...</p>
      ) : filteredGuides.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--color-secondary-200)' }}>
          <h3 style={{ color: 'var(--color-secondary-700)' }}>No guides found.</h3>
          <p style={{ color: 'var(--color-secondary-500)' }}>Try a different search term or category.</p>
        </div>
      ) : (
        <div className="guides-grid">
          {filteredGuides.map((guide) => (
            <div key={guide.id} className="guide-card" onClick={() => { setActiveArticle(guide); setViewMode('reading'); }}>
              <div className="guide-image-container">
                {guide.image_url ? (
                  <img src={guide.image_url} alt={guide.title} className="guide-image" />
                ) : (
                  <div style={{ width: '100%', height: '100%', backgroundColor: 'var(--color-primary-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary-300)' }}>
                    No Image
                  </div>
                )}
                <span className="guide-category-badge">{guide.category}</span>
              </div>
              
              <div className="guide-content">
                <h3 className="guide-title">{guide.title}</h3>
                <p className="guide-excerpt">
                  {guide.content.replace(/[#*`>]/g, '').substring(0, 100)}...
                </p>
                
                <div className="guide-footer">
                   {/* SHOW AUTHOR ON CARD */}
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-primary-700)', fontWeight: '600' }}>
                     By {guide.author || 'Team'}
                  </span>
                  <button className="guide-read-btn">Read Article →</button>
                </div>
              </div>
              
              {isAdmin && (
                <button 
                  onClick={(e) => handleDelete(e, guide.id)}
                  style={{ width: '100%', padding: '8px', background: '#fee2e2', color: '#b91c1c', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Delete Guide
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}