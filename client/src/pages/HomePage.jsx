import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import VendorCard from '../components/VendorCard';
import ProductCard from '../components/ProductCard';

export default function HomePage() {
  const { vendors, products, setShowCategoryModal, setSelectedCategoryName } = useApp();
  const [searchVal, setSearchVal] = useState('');
  const [gpsStatus, setGpsStatus] = useState('Detect Location');

  const categories = [
    { name: "Indoor Plants", img: "/images/golden_pothos.png" },
    { name: "Outdoor Plants", img: "/images/red_hibiscus.png" },
    { name: "Seeds Collection", img: "/images/tomato_seeds.png" },
    { name: "Soil Collection", img: "/images/potting_mix.png" },
    { name: "Pots & Containers", img: "/images/self_watering_pot.png" },
    { name: "Garden Decoration", img: "https://images.unsplash.com/photo-1582281227099-7f45b3bea6e9?auto=format&fit=crop&w=300&q=80", label: "Garden Decor" },
    { name: "Gardening Essentials", img: "https://images.unsplash.com/photo-1617155093730-a8bf47be792d?auto=format&fit=crop&w=300&q=80", label: "Essentials" }
  ];

  const seasonalItems = [
    { name: "Spring Collection", emoji: "🌸", desc: "Fresh blooming flowers, saplings & organic fertilizer", img: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=500&q=80" },
    { name: "Summer Collection", emoji: "☀️", desc: "Heat-tolerant succulents, palms & watering essentials", img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=500&q=80" },
    { name: "Monsoon & Autumn", emoji: "🌧️", desc: "Rainy-day planters, fast-growing herbs & leaf composts", img: "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?auto=format&fit=crop&w=500&q=80" },
    { name: "Winter Collection", emoji: "❄️", desc: "Stunning Petunias, Chrysanthemums & cold composting", img: "https://images.unsplash.com/photo-1482862549707-f63cb32c5fd9?auto=format&fit=crop&w=500&q=80" }
  ];

  // Hot deals: filter where type is plant or price < 200, limit to 6
  const hotDeals = products.filter(p => p.type === 'plant' || p.price < 200).slice(0, 6);

  const handleCategoryClick = (catName) => {
    setSelectedCategoryName(catName);
    setShowCategoryModal(true);
  };

  const handleGpsConnect = () => {
    setGpsStatus('GPS Connected ✅');
    alert("Simulated GPS connection successful! Showing nurseries nearby Indiranagar & Jayanagar corridor.");
  };

  const handleSearchSubmit = () => {
    if (!searchVal) return;
    const match = products.find(p => p.name.toLowerCase().includes(searchVal.toLowerCase()) || p.category.toLowerCase().includes(searchVal.toLowerCase()));
    
    if (match) {
      alert(`Found ${searchVal} matching items. Highlighting nearest nurseries stocking ${match.type}s.`);
      window.location.hash = `#/map?filter=${match.type}`;
    } else {
      alert(`No direct matches for "${searchVal}". Try searching 'pothos', 'snake', 'seeds' or 'compost'.`);
    }
  };

  const handleSeasonalClick = (seasonName) => {
    let key = 'spring';
    if (seasonName.toLowerCase().includes("summer")) key = 'summer';
    else if (seasonName.toLowerCase().includes("monsoon")) key = 'monsoon';
    else if (seasonName.toLowerCase().includes("winter")) key = 'winter';
    
    window.location.hash = `#/seasonal/${key}`;
  };

  return (
    <div id="view-home" className="page-view active">
      {/* Cinematic Hero Banner */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <svg width="16" height="16"><use href="#icon-leaf"></use></svg>
            India's First Smart Nursery Connector
          </div>
          <h1 className="hero-title">
            Bringing Local Nurseries<br />To Your <span>Smart Home</span>
          </h1>
          <p className="hero-desc">
            Direct access to local nursery stalls, premium growers, & verified gardening vendors. Scan physical stall QRs or map nearby sellers with real-time stock indicators.
          </p>
          
          {/* Unified Home Search */}
          <div className="search-container">
            <div className="search-input-wrapper">
              <svg width="20" height="20"><use href="#icon-search"></use></svg>
              <input 
                type="text" 
                value={searchVal} 
                onChange={(e) => setSearchVal(e.target.value)} 
                placeholder="Search Plants, Seeds, Soil, Designer Pots..." 
                onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
              />
            </div>
            <div className="location-wrapper" onClick={handleGpsConnect}>
              <svg width="18" height="18"><use href="#icon-gps"></use></svg>
              <span id="gps-status-label">{gpsStatus}</span>
            </div>
            <button className="search-btn" onClick={handleSearchSubmit}>
              Explore
            </button>
          </div>
        </div>
      </section>


      {/* Seasonal Curation Grid */}
      <section style={{ marginBottom: '50px' }}>
        <div className="section-title-row">
          <div>
            <h2 className="section-title">Seasonal Curation</h2>
            <p className="section-subtitle">Curated plant collections and essentials tailored for the current season</p>
          </div>
        </div>
        
        <div className="season-grid">
          {seasonalItems.map((item, idx) => (
            <div 
              key={idx} 
              className="season-card" 
              style={{ 
                cursor: 'pointer',
                backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0.85)), url(${item.img})`
              }} 
              onClick={() => handleSeasonalClick(item.name)}
            >
              <div className="season-icon">{item.emoji}</div>
              <div className="season-content-overlay" style={{ zIndex: 2, position: 'relative' }}>
                <h3 style={{ color: '#ffffff', textShadow: '0 2px 4px rgba(0,0,0,0.6)' }}>{item.name}</h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.95)', textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Local Nursery Stalls */}
      <section style={{ marginBottom: '50px' }}>
        <div className="section-title-row">
          <div>
            <h2 className="section-title">Nearby Nursery Stalls</h2>
            <p className="section-subtitle">Local nursery stalls and verified vendors. Distance based on simulated GPS.</p>
          </div>
          <a href="#/map" className="view-all">Open Map View <svg width="16" height="16"><use href="#icon-arrow-right"></use></svg></a>
        </div>
        
        <div className="category-slider" id="home-vendors-list" style={{ paddingBottom: '12px', overflowX: 'auto', display: 'flex', gap: '16px' }}>
          {vendors.map((vendor) => (
            <VendorCard key={vendor.id} vendor={vendor} />
          ))}
        </div>
      </section>

      {/* Today's Deals Catalog */}
      <section>
        <div className="section-title-row">
          <div>
            <h2 className="section-title">Today's Hot Deals</h2>
            <p className="section-subtitle">Premium live stock at special discounted rates directly from local growers</p>
          </div>
        </div>
        <div className="products-grid" id="home-deals-grid">
          {hotDeals.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </section>
    </div>
  );
}
