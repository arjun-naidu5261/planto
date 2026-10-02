import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import VendorCard from '../components/VendorCard';
import ProductCard from '../components/ProductCard';

const LIFESTYLE_FILTERS = [
  { key: 'all', label: 'All Plants', desc: '' },
  { key: 'pet', label: 'Pet Safe', desc: '100% non-toxic for dogs & cats' },
  { key: 'lowlight', label: 'Low Light', desc: 'Thrives in AC offices & bedrooms' },
  { key: 'neglect', label: 'Hard to Kill', desc: 'For busy / forgetful waterers' },
  { key: 'airpurify', label: 'Air Purifier', desc: 'Best air purification score' },
  { key: 'beginner', label: 'Beginner', desc: 'Easy care, great first plant' },
];

export default function HomePage() {
  const { vendors, products, setSelectedCategoryName, setShowCategoryModal, setLoginPresetEmail, setShowLogin } = useApp();
  const [searchVal, setSearchVal] = useState('');
  const [gpsStatus, setGpsStatus] = useState('Indiranagar, Bengaluru (20-30 mins)');
  const [vendorFilter, setVendorFilter] = useState('all');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [lifestyleFilter, setLifestyleFilter] = useState('all');
  const [matchmakerActive, setMatchmakerActive] = useState(false);

  const categories = [
    { name: "Indoor Plants", icon: "🪴", badge: "Air Purifiers", color: "#e8f5e9" },
    { name: "Outdoor Plants", icon: "🌸", badge: "Sun Lovers", color: "#fff3e0" },
    { name: "Pots & Planters", icon: "🏺", badge: "Ceramic & Terracotta", color: "#efebe9" },
    { name: "Soil & Manure", icon: "🌿", badge: "100% Organic", color: "#e8f5e9" },
    { name: "Seeds Collection", icon: "🌱", badge: "High Yield", color: "#f3e5f5" },
    { name: "Tools & Care", icon: "✂️", badge: "Pruners & Sprays", color: "#e0f2f1" }
  ];

  const seasonalItems = [
    { name: "Spring Bloom", emoji: "🌸", desc: "Fresh flowering saplings & bio-fertilizer", img: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=500&q=80" },
    { name: "Summer Oasis", emoji: "☀️", desc: "Heat-tolerant succulents, palms & shade pots", img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=500&q=80" },
    { name: "Monsoon Magic", emoji: "🌧️", desc: "Rainy-day planters, herbs & vermicompost", img: "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?auto=format&fit=crop&w=500&q=80" },
    { name: "Winter Wonders", emoji: "❄️", desc: "Petunias, Marigolds & root food", img: "https://images.unsplash.com/photo-1482862549707-f63cb32c5fd9?auto=format&fit=crop&w=500&q=80" }
  ];

  const filteredVendors = vendors.filter(v => {
    if (vendorFilter === 'express') return v.distance.includes('0.') || v.distance.includes('1.');
    if (vendorFilter === 'top') return v.rating >= 4.6;
    if (vendorFilter === 'open') return v.isOpen;
    return true;
  });

  // Lifestyle matchmaker filter
  const applyLifestyleFilter = (p) => {
    if (lifestyleFilter === 'all') return true;
    if (lifestyleFilter === 'pet') return p.petFriendly === true;
    if (lifestyleFilter === 'lowlight') {
      const sun = (p.careInstructions?.sunlight || '').toLowerCase();
      return sun.includes('low') || sun.includes('indirect') || sun.includes('shade');
    }
    if (lifestyleFilter === 'neglect') {
      const water = (p.careInstructions?.waterLevel || '').toLowerCase();
      return water.includes('low') || water.includes('drought') || water.includes('once') || water.includes('minimal') || water.includes('neglect');
    }
    if (lifestyleFilter === 'airpurify') return (p.airPurificationScore || 0) >= 7;
    if (lifestyleFilter === 'beginner') {
      const water = (p.careInstructions?.waterLevel || '').toLowerCase();
      return water.includes('easy') || water.includes('low') || water.includes('minimal') || p.petFriendly;
    }
    return true;
  };

  const filteredProducts = products.filter(p => {
    const catMatch = (() => {
      if (productCategoryFilter === 'all') return true;
      if (productCategoryFilter === 'plants') return p.type === 'plant' || p.category.toLowerCase().includes('plant');
      if (productCategoryFilter === 'pots') return p.type === 'pot' || p.category.toLowerCase().includes('pot');
      if (productCategoryFilter === 'soil') return p.type === 'soil' || p.category.toLowerCase().includes('soil') || p.category.toLowerCase().includes('seed');
      return true;
    })();
    return catMatch && applyLifestyleFilter(p);
  });

  const handleCategoryClick = (catName) => { setSelectedCategoryName(catName); setShowCategoryModal(true); };
  const handleGpsConnect = () => setGpsStatus('Jayanagar 4th Block, Bengaluru (Live Location ✅)');
  const handleSearchSubmit = () => {
    if (!searchVal) return;
    const match = products.find(p => p.name.toLowerCase().includes(searchVal.toLowerCase()) || p.category.toLowerCase().includes(searchVal.toLowerCase()));
    if (match) window.location.hash = `#/map?filter=${match.type}`;
    else { alert(`Showing nurseries stocking "${searchVal}".`); window.location.hash = '#/map'; }
  };
  const handleSeasonalClick = (seasonName) => {
    let key = 'spring';
    if (seasonName.toLowerCase().includes('summer')) key = 'summer';
    else if (seasonName.toLowerCase().includes('monsoon')) key = 'monsoon';
    else if (seasonName.toLowerCase().includes('winter')) key = 'winter';
    window.location.hash = `#/seasonal/${key}`;
  };

  const activeLifestyle = LIFESTYLE_FILTERS.find(f => f.key === lifestyleFilter);

  return (
    <div id="view-home" className="page-view active" style={{ paddingBottom: '40px' }}>

      {/* Hyperlocal Top Delivery Bar */}
      <div style={{ background: 'linear-gradient(90deg, #1b4332 0%, #2d6a4f 100%)', color: '#fff', padding: '10px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '12px', marginBottom: '24px', boxShadow: '0 4px 12px rgba(27,67,50,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: 600 }}>
          <span style={{ background: '#ffb703', color: '#000', padding: '3px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 800 }}>⚡ INSTANT DELIVERY</span>
          <span style={{ cursor: 'pointer' }} onClick={handleGpsConnect}>{gpsStatus}</span>
        </div>
        <div style={{ display: 'flex', gap: '16px', fontSize: '12px', fontWeight: 700 }}>
          <span style={{ color: '#d8f3dc' }}>20-30 Mins Express</span>
          <span style={{ color: '#d8f3dc' }}>Hydration Packaging</span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="hero-section" style={{ borderRadius: '20px', padding: '40px 32px', marginBottom: '36px' }}>
        <div className="hero-content" style={{ maxWidth: '780px' }}>
          <div className="hero-badge" style={{ background: 'rgba(45, 106, 79, 0.1)', color: 'var(--primary-green)' }}>
            <svg width="16" height="16"><use href="#icon-leaf"></use></svg>
            India's #1 Local Nursery & Plant Delivery Marketplace
          </div>
          <h1 className="hero-title" style={{ fontSize: '42px', lineHeight: 1.15 }}>
            Order Plants, Pots & Soil<br />From <span>Nearby Nurseries</span>
          </h1>
          <p className="hero-desc" style={{ fontSize: '16px', color: '#4a5568', marginTop: '12px' }}>
            Buy live plants, hand-crafted terracotta pots, and organic compost directly from local nursery stalls. Delivered fresh in 20-30 minutes.
          </p>
          <div className="search-container" style={{ marginTop: '24px' }}>
            <div className="search-input-wrapper">
              <svg width="20" height="20"><use href="#icon-search"></use></svg>
              <input type="text" value={searchVal} onChange={e => setSearchVal(e.target.value)}
                placeholder="Search Monstera, Snake Plant, Terracotta Pot, Vermicompost..."
                onKeyDown={e => e.key === 'Enter' && handleSearchSubmit()} />
            </div>
            <button className="search-btn" onClick={handleSearchSubmit} style={{ borderRadius: '10px' }}>Find Nearby</button>
          </div>
        </div>
      </section>

      {/* ============ PLANT MATCHMAKER ============ */}
      <section style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#7c3aed', letterSpacing: '1px', textTransform: 'uppercase' }}>🔮 SMART DISCOVERY</div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, margin: '2px 0 0' }}>Plant Matchmaker</h2>
            <p style={{ fontSize: '13px', color: '#666', margin: '2px 0 0' }}>Filter by your lifestyle — not just plant type</p>
          </div>
          <button
            onClick={() => { setMatchmakerActive(!matchmakerActive); if (!matchmakerActive) setLifestyleFilter('all'); }}
            style={{ background: matchmakerActive ? 'linear-gradient(135deg,#7c3aed,#4f46e5)' : 'linear-gradient(135deg,#f5f3ff,#ede9fe)', color: matchmakerActive ? '#fff' : '#7c3aed', border: 'none', padding: '10px 20px', borderRadius: '30px', fontWeight: 800, cursor: 'pointer', fontSize: '13px', boxShadow: matchmakerActive ? '0 4px 14px rgba(124,58,237,0.3)' : 'none', transition: 'all 0.2s' }}
          >
            {matchmakerActive ? '✓ Matchmaker ON' : 'Find My Plant'}
          </button>
        </div>

        {/* Lifestyle filter pills */}
        {matchmakerActive && (
          <div style={{ background: 'linear-gradient(135deg,#faf5ff,#f5f3ff)', borderRadius: '20px', padding: '20px', border: '2px solid #e9d5ff' }}>
            <p style={{ fontSize: '13px', color: '#7c3aed', fontWeight: 700, marginBottom: '14px' }}>What kind of plant parent are you?</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {LIFESTYLE_FILTERS.map(f => (
                <button
                  key={f.key}
                  onClick={() => setLifestyleFilter(f.key)}
                  style={{
                    padding: '10px 18px', borderRadius: '30px', border: '2px solid', cursor: 'pointer', fontWeight: 700, fontSize: '13px', transition: 'all 0.2s',
                    background: lifestyleFilter === f.key ? 'linear-gradient(135deg,#7c3aed,#4f46e5)' : '#fff',
                    color: lifestyleFilter === f.key ? '#fff' : '#555',
                    borderColor: lifestyleFilter === f.key ? '#7c3aed' : '#ddd',
                    boxShadow: lifestyleFilter === f.key ? '0 4px 14px rgba(124,58,237,0.3)' : 'none',
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
            {lifestyleFilter !== 'all' && (
              <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '10px', background: '#fff', borderRadius: '12px', padding: '10px 16px' }}>
                <span style={{ fontSize: '20px' }}>🎯</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: '#1a1a1a' }}>{activeLifestyle?.label} — {filteredProducts.length} plants found</div>
                  <div style={{ fontSize: '12px', color: '#888' }}>{activeLifestyle?.desc}</div>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Quick Category Chips Carousel */}
      <section style={{ marginBottom: '40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '14px' }}>
          {categories.map((cat, idx) => (
            <div key={idx} onClick={() => handleCategoryClick(cat.name)}
              style={{ background: cat.color, padding: '16px 12px', borderRadius: '16px', textAlign: 'center', cursor: 'pointer', border: '1px solid rgba(0,0,0,0.04)', transition: 'all 0.2s' }}
              onMouseOver={e => e.currentTarget.style.transform = 'translateY(-3px)'}
              onMouseOut={e => e.currentTarget.style.transform = 'none'}>
              <div style={{ fontSize: '32px', marginBottom: '6px' }}>{cat.icon}</div>
              <div style={{ fontWeight: 800, fontSize: '13px', color: 'var(--dark)' }}>{cat.name}</div>
              <span style={{ fontSize: '10px', color: 'var(--primary-green)', fontWeight: 700, marginTop: '4px', display: 'inline-block' }}>{cat.badge}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Nearby Nurseries Section */}
      <section style={{ marginBottom: '48px' }}>
        <div className="section-title-row" style={{ alignItems: 'flex-end', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--primary-green)', letterSpacing: '1px', textTransform: 'uppercase' }}>HYPERLOCAL DISCOVERY</div>
            <h2 className="section-title" style={{ fontSize: '28px', margin: 0 }}>Nearby Nursery Stalls</h2>
            <p className="section-subtitle">Browse physical nurseries selling live plants, pots, & care supplies nearby</p>
          </div>
          <Link to="/map" className="view-all">Explore Map View <svg width="16" height="16"><use href="#icon-arrow-right"></use></svg></Link>
        </div>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '4px' }}>
          {[['all', `All Nurseries (${vendors.length})`], ['express', 'Express < 1.5 km'], ['top', 'Top Rated (4.6+)'], ['open', 'Open Now']].map(([key, label]) => (
            <button key={key} className={`inventory-filter-btn ${vendorFilter === key ? 'active' : ''}`} onClick={() => setVendorFilter(key)}>{label}</button>
          ))}
        </div>
        <div className="category-slider" id="home-vendors-list" style={{ paddingBottom: '12px', overflowX: 'auto', display: 'flex', gap: '16px' }}>
          {filteredVendors.map(vendor => <VendorCard key={vendor.id} vendor={vendor} />)}
        </div>
      </section>

      {/* Nursery Partner Banner */}
      <section style={{ marginBottom: '48px', background: 'linear-gradient(135deg, #1b4332 0%, #081c15 100%)', borderRadius: '20px', padding: '32px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
        <div style={{ maxWidth: '580px' }}>
          <span style={{ background: '#ffb703', color: '#000', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 800, letterSpacing: '0.5px' }}>🏪 FOR NURSERY OWNERS & ARTISANS</span>
          <h3 style={{ fontSize: '26px', fontFamily: 'var(--font-serif)', color: '#fff', marginTop: '10px', marginBottom: '8px' }}>Own a Plant Nursery or Pottery Stall? Join Planto!</h3>
          <p style={{ fontSize: '14px', color: '#d8f3dc', lineHeight: 1.5 }}>Put your local nursery online in 2 minutes. Receive instant plant orders from nearby plant lovers, manage live stock, and get instant payouts.</p>
        </div>
        <div>
          <button className="btn" style={{ background: '#ffb703', color: '#000', border: 'none', fontWeight: 800, padding: '14px 28px', fontSize: '15px', borderRadius: '12px' }}
            onClick={() => { setLoginPresetEmail('vendor@planto.in'); setShowLogin(true); }}>
            Open Nursery Vendor Portal →
          </button>
        </div>
      </section>

      {/* Plant Marketplace Catalog */}
      <section style={{ marginBottom: '48px' }}>
        <div className="section-title-row" style={{ alignItems: 'flex-end', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--primary-green)', letterSpacing: '1px', textTransform: 'uppercase' }}>PLANT & POT MARKETPLACE</div>
            <h2 className="section-title" style={{ fontSize: '28px', margin: 0 }}>
              {lifestyleFilter !== 'all' ? `${activeLifestyle?.label} Plants` : 'Fresh Plant & Pot Catalog'}
            </h2>
            <p className="section-subtitle">
              {lifestyleFilter !== 'all' ? `${filteredProducts.length} plants matched · ${activeLifestyle?.desc}` : 'Stocked live across verified local nurseries & growers'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[['all','All Items'],['plants','Plants'],['pots','Pots & Planters'],['soil','Soil & Manure']].map(([key, label]) => (
              <button key={key} className={`inventory-filter-btn ${productCategoryFilter === key ? 'active' : ''}`} onClick={() => setProductCategoryFilter(key)}>{label}</button>
            ))}
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px', background: '#faf5ff', borderRadius: '16px', border: '2px dashed #e9d5ff' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔍</div>
            <h3 style={{ fontWeight: 800, fontSize: '18px', color: '#7c3aed', marginBottom: '8px' }}>No plants found for this filter</h3>
            <p style={{ color: '#888', fontSize: '13px' }}>Try a different lifestyle filter or browse all plants</p>
            <button onClick={() => setLifestyleFilter('all')} style={{ marginTop: '16px', background: '#7c3aed', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '20px', fontWeight: 700, cursor: 'pointer' }}>Show All Plants</button>
          </div>
        ) : (
          <div className="products-grid" id="home-deals-grid">
            {filteredProducts.map(prod => <ProductCard key={prod.id} product={prod} />)}
          </div>
        )}
      </section>

      {/* Seasonal Curation Grid */}
      <section>
        <div className="section-title-row" style={{ marginBottom: '16px' }}>
          <div>
            <h2 className="section-title" style={{ fontSize: '24px' }}>Seasonal Plant Collections</h2>
            <p className="section-subtitle">Handpicked flowering plants & fertilizer recipes for every season</p>
          </div>
        </div>
        <div className="season-grid">
          {seasonalItems.map((item, idx) => (
            <div key={idx} className="season-card"
              style={{ cursor: 'pointer', backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.15), rgba(0,0,0,0.85)), url(${item.img})` }}
              onClick={() => handleSeasonalClick(item.name)}>
              <div className="season-icon">{item.emoji}</div>
              <div className="season-content-overlay" style={{ zIndex: 2, position: 'relative' }}>
                <h3 style={{ color: '#ffffff', textShadow: '0 2px 4px rgba(0,0,0,0.6)' }}>{item.name}</h3>
                <p style={{ color: 'rgba(255,255,255,0.95)', textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
