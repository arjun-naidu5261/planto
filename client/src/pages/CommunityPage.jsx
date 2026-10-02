import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

export default function CommunityPage() {
  const { blogs, isLoggedIn, currentUser, loadAllData, cuttingSwaps, addCuttingSwap } = useApp();
  const [activeTab, setActiveTab] = useState('blogs'); // 'blogs' | 'swaps'
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [swapPlantName, setSwapPlantName] = useState('');
  const [swapSociety, setSwapSociety] = useState('Prestige Shantiniketan');
  const [swapType, setSwapType] = useState('Stem Cutting with aerial root');

  const handleAddSwap = (e) => {
    e.preventDefault();
    if (!swapPlantName) return;
    addCuttingSwap({
      id: `SWAP-${Date.now()}`,
      plantName: swapPlantName,
      contributor: currentUser?.name || 'Verified Neighbor',
      society: swapSociety,
      type: swapType,
      status: 'Available',
      dateListed: 'Just now',
      image: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=500&q=80'
    });
    setSwapPlantName('');
    setSwapModalOpen(false);
    alert('Plant cutting listed for society swap! Neighbors can now request your cutting.');
  };

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
      <div className="section-title-row" style={{ marginBottom: '24px', alignItems: 'flex-start' }}>
        <div>
          <h2 className="section-title">PlantMe Gardening Community Hub</h2>
          <p className="section-subtitle">Share gardening diaries, swap plant cuttings with neighbors, or consult expert guidelines.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {activeTab === 'swaps' ? (
            <button 
              className="btn" 
              onClick={() => setSwapModalOpen(true)}
              style={{ borderRadius: 'var(--radius-pill)', padding: '10px 18px', fontSize: '13px' }}
            >
              Offer a Cutting +
            </button>
          ) : (
            isLoggedIn && (
              <button 
                className="btn" 
                onClick={() => setShowAddForm(!showAddForm)}
                style={{ borderRadius: 'var(--radius-pill)', padding: '10px 18px', fontSize: '13px' }}
              >
                {showAddForm ? 'Cancel Entry' : 'Share a Diary Entry'}
              </button>
            )
          )}
        </div>
      </div>

      {/* Community Section Switcher Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '28px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
        <button
          onClick={() => setActiveTab('blogs')}
          style={{
            padding: '8px 18px',
            borderRadius: '20px',
            border: 'none',
            background: activeTab === 'blogs' ? 'var(--primary-green)' : '#f1f5f9',
            color: activeTab === 'blogs' ? '#ffffff' : '#475569',
            fontWeight: 800,
            fontSize: '13px',
            cursor: 'pointer'
          }}
        >
          Diaries & Workshops
        </button>
        <button
          onClick={() => setActiveTab('swaps')}
          style={{
            padding: '8px 18px',
            borderRadius: '20px',
            border: 'none',
            background: activeTab === 'swaps' ? 'var(--primary-green)' : '#f1f5f9',
            color: activeTab === 'swaps' ? '#ffffff' : '#475569',
            fontWeight: 800,
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          Society Plant Cutting Swap
          <span style={{ background: '#dcfce7', color: '#166534', fontSize: '10px', padding: '2px 6px', borderRadius: '10px' }}>
            {cuttingSwaps.length} Active
          </span>
        </button>
      </div>

      {/* SWAPS VIEW */}
      {activeTab === 'swaps' && (
        <div style={{ marginBottom: '40px' }}>
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '16px', padding: '16px 20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#166534', margin: '0 0 4px 0' }}>
                How Society Cutting Swap Works
              </h4>
              <p style={{ fontSize: '12.5px', color: '#4b5563', margin: 0 }}>
                Propagating plants at home? List your rooted nodes or baby pups for neighbors in your society to adopt. PlantMe provides ₹29 eco-friendly damp-root hydration pouches for pickup!
              </p>
            </div>
            <button
              onClick={() => setSwapModalOpen(true)}
              style={{ background: 'var(--primary-green)', color: '#fff', border: 'none', padding: '9px 18px', borderRadius: '10px', fontWeight: 700, fontSize: '12.5px', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              List Free Cutting
            </button>
          </div>

          {/* Modal to Add Cutting */}
          {swapModalOpen && (
            <div className="modal-overlay active" onClick={() => setSwapModalOpen(false)} style={{ zIndex: 1200 }}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px', width: '92%', borderRadius: '18px', padding: '24px', background: '#fff' }}>
                <h3 style={{ fontSize: '18px', marginBottom: '14px', color: '#1e293b' }}>List Plant Cutting for Swap</h3>
                <form onSubmit={handleAddSwap} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>Plant Species & Cutting Part</label>
                    <input type="text" required placeholder="e.g. Monstera Adansonii Rooted Node" value={swapPlantName} onChange={(e) => setSwapPlantName(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>Apartment / Society Name</label>
                    <input type="text" required placeholder="e.g. Prestige Shantiniketan, Tower 5" value={swapSociety} onChange={(e) => setSwapSociety(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>Rooting Status</label>
                    <select value={swapType} onChange={(e) => setSwapType(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }}>
                      <option value="Stem Cutting with aerial root">Stem Cutting with aerial root</option>
                      <option value="Water-rooted cutting (ready to pot)">Water-rooted cutting (ready to pot)</option>
                      <option value="Rhizome / Rooted Pup">Rhizome / Rooted Pup</option>
                      <option value="Fresh Node (needs water rooting)">Fresh Node (needs water rooting)</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                    <button type="submit" style={{ flex: 1, background: 'var(--primary-green)', color: '#fff', border: 'none', padding: '11px', borderRadius: '10px', fontWeight: 800, cursor: 'pointer' }}>Publish Listing</button>
                    <button type="button" onClick={() => setSwapModalOpen(false)} style={{ padding: '11px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}>Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Cuttings Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '18px' }}>
            {cuttingSwaps.map((item) => (
              <div key={item.id} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                <img src={item.image} alt={item.plantName} style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                <div style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '10.5px', fontWeight: 800, color: '#166534', background: '#dcfce7', padding: '2px 8px', borderRadius: '10px' }}>
                      {item.status}
                    </span>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>{item.dateListed}</span>
                  </div>
                  <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}>
                    {item.plantName}
                  </h4>
                  <div style={{ fontSize: '12px', color: '#475569', marginBottom: '4px' }}>
                    By <strong>{item.contributor}</strong>
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#64748b', marginBottom: '14px' }}>
                    Location: {item.society} • {item.type}
                  </div>
                  <button
                    onClick={() => alert(`Swap request sent to ${item.contributor}! You will receive a WhatsApp notification once accepted.`)}
                    style={{
                      width: '100%',
                      background: '#f0fdf4',
                      color: '#166534',
                      border: '1px solid #bbf7d0',
                      padding: '9px',
                      borderRadius: '10px',
                      fontSize: '12.5px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      transition: 'var(--transition)'
                    }}
                  >
                    Request Free Swap (₹29 Hydration Pouch)
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BLOGS VIEW */}
      {activeTab === 'blogs' && (
        <>

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
      </>
      )}
    </div>
  );
}
