import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

export default function FreeSaplingGiftModal() {
  const navigate = useNavigate();
  const { showFreeGiftModal, setShowFreeGiftModal, addToCart } = useApp();
  const [activeTab, setActiveTab] = useState('gift'); // 'gift' | 'claim'
  
  // Gift State
  const [friendName, setFriendName] = useState('');
  const [friendPhone, setFriendPhone] = useState('');
  const [selectedSapling, setSelectedSapling] = useState('Mini Jade Fortune Plant');
  const [giftNote, setGiftNote] = useState('Here is a fresh green buddy for your home from PlantMe!');
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);

  // Claim State
  const [claimCode, setClaimCode] = useState('');
  const [claimAddress, setClaimAddress] = useState('');
  const [claimSuccess, setClaimSuccess] = useState(false);

  if (!showFreeGiftModal) return null;

  const saplingOptions = [
    { name: 'Mini Jade Fortune Plant', desc: 'Thrives on desk light, symbol of good luck & abundance', img: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=300&q=80' },
    { name: 'Golden Pothos Hydration Sapling', desc: 'Air detoxifier, rooted in biodegradable damp pouch', img: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=300&q=80' },
    { name: 'Sansevieria Mini Pup', desc: 'Thrives in AC rooms, releases night-time oxygen', img: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=300&q=80' }
  ];

  const handleGenerateGift = (e) => {
    e.preventDefault();
    if (!friendName) return;
    const code = `PLANTME-GIFT-${Math.floor(1000 + Math.random() * 9000)}`;
    const url = `https://plantme.in/claim?code=${code}&to=${encodeURIComponent(friendName)}`;
    setGeneratedLink(url);
  };

  const handleWhatsAppShare = () => {
    const text = `Hey ${friendName || 'there'}! I adopted a plant on PlantMe and unlocked a FREE Welcome Green Sapling (${selectedSapling}) for you with express 20-30 min delivery!\n\nTap here to claim your live plant:\n${generatedLink || 'https://plantme.in'}\n\nNote: "${giftNote}"`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleClaimSubmit = (e) => {
    e.preventDefault();
    if (!claimCode || !claimAddress) return;
    // Add free sapling to cart
    addToCart({
      id: `free-sapling-${Date.now()}`,
      name: `Free Welcome Gift: ${selectedSapling}`,
      price: 0,
      originalPrice: 299,
      category: 'Gifts',
      images: ['https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=400&q=80'],
      rating: 5.0,
      reviewsCount: 180,
      quantity: 10
    }, 1);
    setClaimSuccess(true);
  };

  return (
    <div className="modal-overlay active" onClick={() => setShowFreeGiftModal(false)} style={{ zIndex: 1200 }}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          maxWidth: '520px', 
          width: '92%', 
          borderRadius: '20px', 
          padding: '28px',
          background: '#ffffff',
          position: 'relative',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
        }}
      >
        <button 
          className="close-modal" 
          onClick={() => setShowFreeGiftModal(false)}
          style={{ position: 'absolute', top: '16px', right: '16px', width: '32px', height: '32px', borderRadius: '50%', border: 'none', background: '#f1f5f9', cursor: 'pointer', fontWeight: 800 }}
        >
          &times;
        </button>

        {/* Modal Header */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary-green)', letterSpacing: '1px', textTransform: 'uppercase' }}>
            VIRAL GIFTING REWARD
          </span>
          <h3 style={{ fontSize: '22px', fontFamily: 'var(--font-serif)', margin: '6px 0', color: 'var(--dark)' }}>
            Gift a Free Welcome Sapling
          </h3>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
            Share the joy of urban greens! Send a 100% free live plant cutting to a friend or neighbor with zero shipping fee.
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', background: '#f8fafc', padding: '4px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
          <button
            onClick={() => setActiveTab('gift')}
            style={{
              flex: 1,
              padding: '9px',
              borderRadius: '9px',
              border: 'none',
              background: activeTab === 'gift' ? 'var(--primary-green)' : 'transparent',
              color: activeTab === 'gift' ? '#fff' : '#64748b',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            Gift to a Friend
          </button>
          <button
            onClick={() => setActiveTab('claim')}
            style={{
              flex: 1,
              padding: '9px',
              borderRadius: '9px',
              border: 'none',
              background: activeTab === 'claim' ? 'var(--primary-green)' : 'transparent',
              color: activeTab === 'claim' ? '#fff' : '#64748b',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            Claim Gift Code
          </button>
        </div>

        {activeTab === 'gift' ? (
          <div>
            {!generatedLink ? (
              <form onSubmit={handleGenerateGift} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>Friend's Name</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Rahul Mehta"
                    value={friendName}
                    onChange={(e) => setFriendName(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>Select Free Welcome Sapling</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {saplingOptions.map((s, idx) => (
                      <div 
                        key={idx}
                        onClick={() => setSelectedSapling(s.name)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '10px',
                          borderRadius: '12px',
                          border: selectedSapling === s.name ? '2px solid var(--primary-green)' : '1px solid #e2e8f0',
                          background: selectedSapling === s.name ? '#f0fdf4' : '#ffffff',
                          cursor: 'pointer'
                        }}
                      >
                        <img src={s.img} alt={s.name} style={{ width: '42px', height: '42px', borderRadius: '8px', objectFit: 'cover' }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>{s.name}</div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>{s.desc}</div>
                        </div>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: '#166534', background: '#dcfce7', padding: '3px 8px', borderRadius: '10px' }}>
                          FREE (₹299 value)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>Custom Gift Note</label>
                  <textarea 
                    rows="2"
                    value={giftNote}
                    onChange={(e) => setGiftNote(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', resize: 'none' }}
                  />
                </div>

                <button 
                  type="submit" 
                  style={{
                    background: 'var(--primary-green)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    marginTop: '4px'
                  }}
                >
                  Generate Free Plant Gift Link →
                </button>
              </form>
            ) : (
              <div style={{ textAlign: 'center', padding: '10px 0' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#dcfce7', color: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', marginBottom: '6px' }}>
                  Gift Link Ready for {friendName}!
                </h4>
                <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '18px' }}>
                  {friendName} can claim their free <strong>{selectedSapling}</strong> in 20-30 mins express delivery.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button 
                    onClick={handleWhatsAppShare}
                    style={{
                      background: '#25D366',
                      color: '#ffffff',
                      border: 'none',
                      padding: '12px',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    Share via WhatsApp
                  </button>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input 
                      type="text" 
                      readOnly 
                      value={generatedLink}
                      style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '12px', background: '#f8fafc' }}
                    />
                    <button 
                      onClick={handleCopyLink}
                      style={{
                        padding: '10px 16px',
                        borderRadius: '10px',
                        border: '1px solid #cbd5e1',
                        background: copied ? '#dcfce7' : '#ffffff',
                        color: copied ? '#166534' : '#1e293b',
                        fontWeight: 700,
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      {copied ? 'Copied!' : 'Copy Link'}
                    </button>
                  </div>

                  <button 
                    onClick={() => setGeneratedLink('')}
                    style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: '12px', cursor: 'pointer', marginTop: '6px' }}
                  >
                    ← Gift to another friend
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            {!claimSuccess ? (
              <form onSubmit={handleClaimSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>Gift Claim Code</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. PLANTME-GIFT-7821"
                    value={claimCode}
                    onChange={(e) => setClaimCode(e.target.value.toUpperCase())}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', textTransform: 'uppercase' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>Delivery Address (Bengaluru / Hyderabad)</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Flat/House, Apartment Name, Area, Pincode"
                    value={claimAddress}
                    onChange={(e) => setClaimAddress(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                  />
                </div>

                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '12px' }}>
                  <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#166534', marginBottom: '2px' }}>
                    100% Free Live Plant Delivery
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#4b5563' }}>
                    Packed in moisture-preserving root hydration pouch. Dispatches in 20-30 mins.
                  </div>
                </div>

                <button 
                  type="submit" 
                  style={{
                    background: 'var(--primary-green)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  Claim My Free Plant Sapling →
                </button>
              </form>
            ) : (
              <div style={{ textAlign: 'center', padding: '14px 0' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#dcfce7', color: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', marginBottom: '6px' }}>
                  Free Sapling Added to Cart!
                </h4>
                <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '18px' }}>
                  Your gift code has been validated at ₹0. Head to cart to complete your dispatch address.
                </p>
                <button
                  onClick={() => { setShowFreeGiftModal(false); navigate("/cart"); }}
                  style={{
                    background: 'var(--primary-green)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  Go to Cart & Claim →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
