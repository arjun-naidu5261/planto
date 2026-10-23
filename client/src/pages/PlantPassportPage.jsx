import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

export default function PlantPassportPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, reminders, toggleReminderActive, products, currentUser } = useApp();

  const plantTagId = id || 'PLT-8920';
  const matchedProduct = products.find(p => 
    String(p.id) === String(id) || 
    String(p._id) === String(id) || 
    (id && p.name.toLowerCase().includes(String(id).toLowerCase()))
  ) || products[0];

  const [activeTab, setActiveTab] = useState('journal'); // 'journal' | 'specs' | 'refills'
  const [wateredToday, setWateredToday] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  
  // Growth Milestones State with localStorage persistence
  const storageKey = `plant_passport_milestones_${plantTagId}`;
  const [milestones, setMilestones] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        day: 'Day 1',
        date: 'Oct 02, 2026',
        title: 'Adoption & Doorstep Arrival',
        note: 'Delivered in shock-absorbing EV box with damp-moss root hydration shield. Foliage lush and vibrant.',
        photo: matchedProduct?.images?.[0] || 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=600&auto=format&fit=crop&q=80',
        health: '100% Prime'
      },
      {
        day: 'Day 7',
        date: 'Oct 09, 2026',
        title: 'Acclimatization & First Watering',
        note: 'Adapted beautifully to east-facing window. Given 200ml of room-temperature water with bio-enzymes.',
        photo: 'https://images.unsplash.com/photo-1545241047-6083a3684587?w=600&auto=format&fit=crop&q=80',
        health: '98% Vibrant'
      }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(milestones));
    } catch (e) {}
  }, [milestones, storageKey]);

  const plantData = {
    tagId: plantTagId,
    name: matchedProduct?.name || 'Monstera Deliciosa (Swiss Cheese Plant)',
    botanicalName: matchedProduct?.name ? `${matchedProduct.name} var. botanical` : 'Monstera deliciosa Liebm.',
    parentName: currentUser?.name || 'Suhas K.',
    nurseryOrigin: 'Indiranagar Botanical Nursery • Fulfillment Bay 04',
    adoptedDate: 'Oct 02, 2026',
    soilMix: matchedProduct?.careInstructions?.potType || 'Aerated Aroid Blend (Cocopeat, Pine Bark & Perlite)',
    oxygenScore: `+${matchedProduct?.airPurificationScore || 8}/10 Air Purification Score`,
    lightPref: matchedProduct?.careInstructions?.sunlight || 'Bright, Indirect Morning Sun (Avoid harsh 2 PM rays)',
    waterPref: matchedProduct?.careInstructions?.waterLevel || 'Every 6-7 Days (Let top 2 inches dry out)',
    guaranteeExpiry: 'Nov 01, 2026 (19 Days Left)'
  };

  const handleLogWater = () => {
    setWateredToday(true);
    setTimeout(() => setWateredToday(false), 5000);
  };

  const handleAddMilestone = (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    const newEntry = {
      day: `Day ${milestones.length * 7 + 7}`,
      date: new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
      title: 'Growth Check-In & Journal Log',
      note: newNote,
      photo: selectedPhoto || 'https://images.unsplash.com/photo-1512428813834-c702c7702b78?w=600&auto=format&fit=crop&q=80',
      health: '99% Thriving'
    };

    setMilestones([newEntry, ...milestones]);
    setNewNote('');
    setSelectedPhoto(null);
  };

  const handleOrderRefill = () => {
    addToCart({
      id: 'refill-aroid-nutrition',
      name: 'Organic Aroid Slow-Release Nutrient Spikes (Pack of 10)',
      price: 120,
      originalPrice: 199,
      category: 'Care',
      images: ['https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=400&q=80'],
      rating: 4.9,
      reviewsCount: 182,
      quantity: 50
    }, 1);
    navigate('/cart');
  };

  const handleShareWhatsApp = () => {
    const text = `🌿 Meet my ${plantData.name}!\nAdoption Tag: #${plantData.tagId}\nIt is currently 100% thriving under PlantMe's 30-day care guarantee.\n\nCheck out its live growth timeline & adoption passport here:\nhttps://plantme.in/passport/${plantTagId}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', padding: '24px 16px 60px' }}>
      
      {/* Adopted Green Family Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '16px' }}>
        <span style={{ fontSize: '12px', fontWeight: 800, color: '#166534', whiteSpace: 'nowrap' }}>Adopted Green Family:</span>
        {products.slice(0, 6).map(p => {
          const isSelected = String(p.id) === String(matchedProduct?.id);
          return (
            <button
              key={p.id}
              onClick={() => navigate(`/passport/${p.id}`)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '20px',
                border: isSelected ? '2px solid #16a34a' : '1px solid #cbd5e1',
                background: isSelected ? '#dcfce7' : '#ffffff',
                color: isSelected ? '#166534' : '#475569',
                fontSize: '12px',
                fontWeight: isSelected ? 800 : 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
                boxShadow: isSelected ? '0 2px 8px rgba(22,163,74,0.15)' : 'none'
              }}
            >
              <span>🪴</span>
              <span>{p.name.split('(')[0].trim()}</span>
            </button>
          );
        })}
      </div>

      {/* Top Banner & Adoption Badge */}
      <div style={{
        background: 'linear-gradient(135deg, #1b4332 0%, #081c15 100%)',
        color: '#ffffff',
        borderRadius: '24px',
        padding: '32px 28px',
        marginBottom: '28px',
        boxShadow: '0 12px 32px rgba(0,0,0,0.14)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ background: '#ffb703', color: '#000', fontSize: '11px', fontWeight: 800, padding: '3px 10px', borderRadius: '12px', textTransform: 'uppercase' }}>
                🏷️ VERIFIED PLANT PASSPORT
              </span>
              <span style={{ background: '#2d6a4f', color: '#d8f3dc', fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '12px' }}>
                Tag: #{plantData.tagId}
              </span>
            </div>
            <h1 style={{ fontSize: '32px', fontFamily: 'var(--font-serif)', margin: '4px 0 6px 0', color: '#ffffff' }}>
              {plantData.name}
            </h1>
            <p style={{ fontSize: '14px', color: '#b7e4c7', margin: 0, fontStyle: 'italic' }}>
              {plantData.botanicalName} • Plant Parent: <strong>{plantData.parentName}</strong>
            </p>
            <div style={{ fontSize: '12px', color: '#95d5b2', marginTop: '10px' }}>
              Nursery Origin: {plantData.nurseryOrigin}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={handleShareWhatsApp}
              style={{
                background: '#25D366',
                color: '#ffffff',
                border: 'none',
                padding: '10px 16px',
                borderRadius: '12px',
                fontSize: '12.5px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>💬</span> Share Growth Card
            </button>
            <Link
              to="/ai"
              style={{
                background: 'rgba(255,255,255,0.15)',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.3)',
                padding: '10px 16px',
                borderRadius: '12px',
                fontSize: '12.5px',
                fontWeight: 800,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>🩺</span> Scan Leaf with AI
            </Link>
          </div>
        </div>

        {/* Quick Health & Guarantee Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
          <div>
            <div style={{ fontSize: '10.5px', color: '#95d5b2', textTransform: 'uppercase', fontWeight: 700 }}>OXYGEN SCORE</div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}>{plantData.oxygenScore}</div>
          </div>
          <div>
            <div style={{ fontSize: '10.5px', color: '#95d5b2', textTransform: 'uppercase', fontWeight: 700 }}>WATERING CYCLE</div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}>Every 6–7 Days</div>
          </div>
          <div>
            <div style={{ fontSize: '10.5px', color: '#95d5b2', textTransform: 'uppercase', fontWeight: 700 }}>30-DAY THRIVE GUARANTEE</div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#4ade80', marginTop: '2px' }}>🟢 Active ({plantData.guaranteeExpiry})</div>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid #e2e8f0', marginBottom: '24px' }}>
        <button
          onClick={() => setActiveTab('journal')}
          style={{
            padding: '12px 18px',
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'journal' ? '3px solid #16a34a' : 'none',
            fontWeight: activeTab === 'journal' ? 800 : 600,
            color: activeTab === 'journal' ? '#16a34a' : '#64748b',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          📸 Growth Timeline & Journal
        </button>

        <button
          onClick={() => setActiveTab('specs')}
          style={{
            padding: '12px 18px',
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'specs' ? '3px solid #16a34a' : 'none',
            fontWeight: activeTab === 'specs' ? 800 : 600,
            color: activeTab === 'specs' ? '#16a34a' : '#64748b',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          🌿 Soil, Light & Botanical Specs
        </button>

        <button
          onClick={() => setActiveTab('refills')}
          style={{
            padding: '12px 18px',
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'refills' ? '3px solid #16a34a' : 'none',
            fontWeight: activeTab === 'refills' ? 800 : 600,
            color: activeTab === 'refills' ? '#16a34a' : '#64748b',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          ⚡ Custom Organic Refills (20 Min)
        </button>
      </div>

      {/* TAB 1: GROWTH TIMELINE & JOURNAL */}
      {activeTab === 'journal' && (
        <div>
          {/* Quick Care Action Banner */}
          <div style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '16px',
            padding: '16px 20px',
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#166534' }}>
                Hydration Due Today: 150ml filtered room-temp water
              </div>
              <div style={{ fontSize: '12px', color: '#15803d', marginTop: '2px' }}>
                Next moisture check scheduled for Saturday morning.
              </div>
            </div>

            <button
              onClick={handleLogWater}
              disabled={wateredToday}
              style={{
                background: wateredToday ? '#15803d' : '#16a34a',
                color: '#ffffff',
                border: 'none',
                padding: '9px 18px',
                borderRadius: '10px',
                fontSize: '12.5px',
                fontWeight: 800,
                cursor: wateredToday ? 'default' : 'pointer'
              }}
            >
              {wateredToday ? '✓ Watered Today!' : '💧 Log Water Today'}
            </button>
          </div>

          {/* Add Entry Card */}
          <form onSubmit={handleAddMilestone} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '20px', marginBottom: '28px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: '0 0 10px 0' }}>
              Add a Photo Check-In or Care Note
            </h4>
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="e.g. New leaf unfurled today with 4 fenestrations! Cleaned foliage with damp cloth."
              rows={2}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                marginBottom: '12px'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <span style={{ fontSize: '11px', color: '#64748b' }}>
                📸 Photos are permanently tied to your digital adoption certificate
              </span>
              <button
                type="submit"
                style={{
                  background: '#1b4332',
                  color: '#ffffff',
                  border: 'none',
                  padding: '9px 18px',
                  borderRadius: '10px',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                + Save Growth Entry
              </button>
            </div>
          </form>

          {/* Timeline Feed */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {milestones.map((entry, idx) => (
              <div key={idx} style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '18px',
                padding: '20px',
                display: 'flex',
                gap: '20px',
                flexWrap: 'wrap',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
              }}>
                <img
                  src={entry.photo}
                  alt={entry.title}
                  style={{
                    width: '140px',
                    height: '140px',
                    borderRadius: '14px',
                    objectFit: 'cover',
                    flexShrink: 0
                  }}
                />
                <div style={{ flex: 1, minWidth: '240px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ background: '#e8f5e9', color: '#166534', fontSize: '11px', fontWeight: 800, padding: '2px 8px', borderRadius: '8px' }}>
                        {entry.day}
                      </span>
                      <strong style={{ fontSize: '15px', color: '#0f172a' }}>{entry.title}</strong>
                    </div>
                    <span style={{ fontSize: '11.5px', color: '#64748b' }}>{entry.date}</span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#334155', lineHeight: 1.5, margin: '8px 0 12px 0' }}>
                    {entry.note}
                  </p>
                  <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#16a34a' }}>
                    ● Health Vitality: {entry.health}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: SPECS */}
      {activeTab === 'specs' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px' }}>
            <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#1b4332', marginBottom: '10px' }}>☀️ Sunlight & Position</h4>
            <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5, margin: 0 }}>
              {plantData.lightPref}. Low-light will slow leaf fenestration. High-noon sun causes yellow leaf sunburn.
            </p>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px' }}>
            <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#1b4332', marginBottom: '10px' }}>🌱 Soil Composition</h4>
            <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5, margin: 0 }}>
              {plantData.soilMix}. Contains beneficial mycorrhizal fungi for root disease immunity.
            </p>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px' }}>
            <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#1b4332', marginBottom: '10px' }}>💧 Hydration Rules</h4>
            <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5, margin: 0 }}>
              Water deeply until water runs through drainage holes. Discard saucer overflow after 15 minutes to avoid root rot.
            </p>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px' }}>
            <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#1b4332', marginBottom: '10px' }}>🛡️ 30-Day Guarantee Policy</h4>
            <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5, margin: 0 }}>
              Covered under PlantMe Zero-Hassle Thrive Policy until {plantData.guaranteeExpiry}. If plant wilts, claim 1-click replacement.
            </p>
          </div>
        </div>
      )}

      {/* TAB 3: REFILLS */}
      {activeTab === 'refills' && (
        <div>
          <div style={{
            background: '#ffffff',
            border: '1.5px solid #86efac',
            borderRadius: '20px',
            padding: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px',
            boxShadow: '0 4px 18px rgba(22,101,52,0.06)'
          }}>
            <div>
              <span style={{ background: '#dcfce7', color: '#166534', fontSize: '11px', fontWeight: 800, padding: '3px 8px', borderRadius: '8px' }}>
                EXACT GENUS MATCH
              </span>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '8px 0 4px 0' }}>
                Organic Aroid Slow-Release Nutrient Spikes (Pack of 10)
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 10px 0', maxWidth: '440px' }}>
                Doctor-formulated organic N-P-K (3-1-2) with seaweed bio-stimulant. Insert 2 spikes every 60 days for giant fenestrated leaves.
              </p>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#166534' }}>
                ₹120 <span style={{ fontSize: '13px', color: '#94a3b8', textDecoration: 'line-through' }}>₹199</span>
              </div>
            </div>

            <button
              onClick={handleOrderRefill}
              style={{
                background: '#16a34a',
                color: '#ffffff',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(22,163,74,0.3)'
              }}
            >
              Order Refill in 20 Mins →
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
