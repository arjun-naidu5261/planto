import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function SocietyGroupDrop() {
  const { activeSociety, setActiveSociety, addToCart } = useApp();
  const [joined, setJoined] = useState(false);
  const [copied, setCopied] = useState(false);

  const topSocieties = [
    { name: 'Prestige Shantiniketan, Whitefield', neighborsCount: 4, target: 5, area: 'Bengaluru East' },
    { name: 'Brigade Gateway, Rajajinagar', neighborsCount: 3, target: 5, area: 'Bengaluru West' },
    { name: 'Manyata Tech Park Residency, Hebbal', neighborsCount: 5, target: 5, area: 'Bengaluru North' },
    { name: 'Sobha City, Thanisandra', neighborsCount: 2, target: 5, area: 'Bengaluru North' },
    { name: 'DLF Cybercity Communities, Gachibowli', neighborsCount: 4, target: 5, area: 'Hyderabad IT Corridor' },
    { name: 'DivyaSree Technopolis, Yemlur', neighborsCount: 3, target: 5, area: 'Bengaluru East' },
    { name: 'Phoenix One Bangalore West', neighborsCount: 4, target: 5, area: 'Bengaluru Central' }
  ];

  const currentSocietyData = topSocieties.find(s => s.name === activeSociety) || topSocieties[0];
  const progressPercent = Math.min(100, Math.round((currentSocietyData.neighborsCount / currentSocietyData.target) * 100));
  const remaining = Math.max(0, currentSocietyData.target - currentSocietyData.neighborsCount);

  const handleJoinDrop = () => {
    // Add free 1kg compost and tag group drop
    addToCart({
      id: 'free-society-compost',
      name: 'Society Drop Bonus: 1kg Organic Vermicompost',
      price: 0,
      originalPrice: 149,
      category: 'Soil',
      images: ['https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=400&q=80'],
      rating: 4.9,
      reviewsCount: 340,
      quantity: 50
    }, 1);
    setJoined(true);
  };

  const handleShareWhatsApp = () => {
    const text = `🌿 Hey neighbors in ${activeSociety}!\n\nPlantMe is doing a Hyperlocal EV Group Drop in our society today.\n${currentSocietyData.neighborsCount} neighbors have already ordered — we only need ${remaining || 1} more order to unlock:\n✅ 15% Group Discount on all live plants & pots\n✅ Free 1kg Organic Vermicompost Pouch\n✅ Free 20-30 Min Group Delivery\n\nOrder your indoor plants here:\nhttps://plantme.in/#/society?name=${encodeURIComponent(activeSociety)}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://plantme.in/#/society?name=${encodeURIComponent(activeSociety)}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ background: '#ffffff', border: '1px solid #bbf7d0', borderRadius: '18px', padding: '24px', boxShadow: '0 4px 18px rgba(22,101,52,0.06)', marginBottom: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ background: '#dcfce7', color: '#166534', fontSize: '11px', fontWeight: 800, padding: '3px 8px', borderRadius: '10px', textTransform: 'uppercase' }}>
              COMMUNITY GROUP BUYING
            </span>
            <span style={{ fontSize: '12px', color: '#15803d', fontWeight: 700 }}>
              Live Daily Society Drop
            </span>
          </div>
          <h3 style={{ fontSize: '20px', fontFamily: 'var(--font-serif)', color: '#14532d', margin: '6px 0 2px 0' }}>
            Apartment Society & Tech Park Group Drop
          </h3>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
            Order together with neighbors to cut carbon footprint, unlock bulk discounts & free organic compost!
          </p>
        </div>

        {/* Society Selector Dropdown */}
        <div>
          <select 
            value={activeSociety} 
            onChange={(e) => { setActiveSociety(e.target.value); setJoined(false); }}
            style={{
              padding: '9px 14px',
              borderRadius: '12px',
              border: '1.5px solid #86efac',
              background: '#f0fdf4',
              color: '#166534',
              fontWeight: 700,
              fontSize: '12.5px',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {topSocieties.map((s, idx) => (
              <option key={idx} value={s.name}>
                {s.name} ({s.area})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Progress & Milestone Bar */}
      <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0', marginBottom: '18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '12.5px' }}>
          <span style={{ fontWeight: 800, color: '#1e293b' }}>
            {currentSocietyData.neighborsCount} of {currentSocietyData.target} Neighbors Ordered Today
          </span>
          <span style={{ fontWeight: 800, color: remaining === 0 ? '#15803d' : '#b45309' }}>
            {remaining === 0 ? 'Unlocked for your entire society!' : `Only ${remaining} more needed!`}
          </span>
        </div>

        {/* Progress Bar */}
        <div style={{ width: '100%', height: '10px', background: '#e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
          <div 
            style={{ 
              width: `${progressPercent}%`, 
              height: '100%', 
              background: 'linear-gradient(90deg, #22c55e 0%, #15803d 100%)',
              borderRadius: '10px',
              transition: 'width 0.5s ease'
            }} 
          />
        </div>

        {/* Unlocked Perks */}
        <div style={{ display: 'flex', gap: '16px', marginTop: '12px', flexWrap: 'wrap', fontSize: '12px', color: '#475569' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: '#166534', fontWeight: 800 }}>✓</span> 15% Group Discount (Auto-applied in cart)
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: '#166534', fontWeight: 800 }}>✓</span> Free 1kg Enriched Vermicompost
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: '#166534', fontWeight: 800 }}>✓</span> Single Zero-Emission EV Drop
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          onClick={handleJoinDrop}
          disabled={joined}
          style={{
            flex: '1 1 200px',
            background: joined ? '#15803d' : 'var(--primary-green)',
            color: '#ffffff',
            border: 'none',
            padding: '12px 20px',
            borderRadius: '12px',
            fontSize: '13.5px',
            fontWeight: 800,
            cursor: joined ? 'default' : 'pointer',
            transition: 'var(--transition)'
          }}
        >
          {joined ? 'Added to Cart: Society Perks Activated' : 'Join Society Group Drop (+ Claim Free Compost)'}
        </button>

        <button
          onClick={handleShareWhatsApp}
          style={{
            background: '#25D366',
            color: '#ffffff',
            border: 'none',
            padding: '12px 18px',
            borderRadius: '12px',
            fontSize: '13.5px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          Share in Society WhatsApp Group
        </button>

        <button
          onClick={handleCopyLink}
          style={{
            background: '#ffffff',
            color: '#334155',
            border: '1px solid #cbd5e1',
            padding: '12px 16px',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          {copied ? 'Link Copied' : 'Copy Society Link'}
        </button>
      </div>
    </div>
  );
}
