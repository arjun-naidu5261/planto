import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

export default function CommunityPage() {
  const { blogs, isLoggedIn, currentUser, loadAllData } = useApp();
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !summary) return;

    const payload = {
      title,
      summary,
      author: currentUser?.name || 'Guest Gardener',
      role: currentUser?.role || 'Horticulture Enthusiast',
      image: "https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=600&q=80"
    };

    try {
      await api.addBlog(payload);
      alert("Blog entry shared with community!");
      setTitle('');
      setSummary('');
      setShowAddForm(false);
      await loadAllData(); // refresh list
    } catch (err) {
      console.error(err);
      alert("Failed to share blog.");
    }
  };

  return (
    <div id="view-community" className="page-view active" style={{ display: 'block' }}>
      <div className="section-title-row" style={{ marginBottom: '30px' }}>
        <div>
          <h2 className="section-title">PLANTO Gardening Community Hub</h2>
          <p className="section-subtitle">Share gardening diaries, explore workshop calendars, or read professional guidelines.</p>
        </div>
        {isLoggedIn && (
          <button 
            className="btn" 
            onClick={() => setShowAddForm(!showAddForm)}
            style={{ borderRadius: 'var(--radius-pill)', padding: '10px 20px', fontSize: '13px' }}
          >
            {showAddForm ? 'Cancel Entry' : '📝 Share a Diary Entry'}
          </button>
        )}
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="stall-hours-box" style={{ marginBottom: '30px' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '16px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>Create Community Blog Post</h3>
          <div className="form-group">
            <label htmlFor="blog-title">Title</label>
            <input type="text" id="blog-title" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. My Experience growing Tulsi Indoors" />
          </div>
          <div className="form-group">
            <label htmlFor="blog-summary">Content Summary</label>
            <textarea id="blog-summary" required value={summary} onChange={(e) => setSummary(e.target.value)} rows="4" style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', outline: 'none' }} placeholder="Write down your gardening guide or updates..."></textarea>
          </div>
          <button type="submit" className="btn" style={{ marginTop: '12px' }}>Publish Entry</button>
        </form>
      )}

      <div className="stall-grid-sections">
        {/* Blogs and logs */}
        <div>
          <div className="section-title-row" style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 700 }}>Community Blogs & Diaries</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} id="community-blogs-list">
            {blogs.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#888', padding: '30px 0' }}>No blogs shared yet. Add the first one!</div>
            ) : (
              blogs.map((blog) => (
                <div 
                  key={blog.id} 
                  style={{ background: 'var(--white)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(0,0,0,0.03)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden', display: 'flex', flexDirection: 'row', gap: '20px', flexWrap: 'wrap', transition: 'var(--transition)' }}
                >
                  <img src={blog.image} alt={blog.title} style={{ width: '200px', height: '150px', objectFit: 'cover' }} />
                  <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '12px', color: '#888' }}>Published on {blog.date} by <strong>{blog.author}</strong> ({blog.role})</div>
                      <h4 style={{ fontSize: '18px', fontWeight: 700, marginTop: '6px', color: 'var(--dark)' }}>{blog.title}</h4>
                      <p style={{ fontSize: '13px', color: '#555', marginTop: '6px' }}>{blog.summary}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', marginTop: '12px', fontSize: '12px', color: '#666' }}>
                      <span>💚 {blog.likes} Likes</span>
                      <span>💬 {blog.comments} Comments</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* FAQ/Q&A Section & Events */}
        <div>
          <div className="stall-hours-box" style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '16px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>Upcoming Workshops</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
              <div>
                <strong>🎍 Succulents Repotting Masterclass</strong>
                <div style={{ color: '#666', marginTop: '2px' }}>08 Aug, 4:00 PM | Online (Free)</div>
              </div>
              <div>
                <strong>🪱 Hydroponics & Vermicomposting Basics</strong>
                <div style={{ color: '#666', marginTop: '2px' }}>15 Aug, 10:30 AM | Lalbagh Glasshouse</div>
              </div>
            </div>
          </div>

          <div className="stall-hours-box">
            <h3 style={{ fontSize: '18px', marginBottom: '16px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>Garden Q&A</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <div>
                <strong>Q: Why are my snake plant leaves soft and folding down?</strong>
                <p style={{ color: '#555', marginTop: '4px' }}>A: This is a classic symptom of overwatering. Let the potting mix dry out completely for a month.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
