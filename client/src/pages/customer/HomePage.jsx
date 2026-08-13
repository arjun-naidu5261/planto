import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import VendorCard from '../components/VendorCard';
import ProductCard from '../components/ProductCard';

export default function HomePage() {
  const { vendors, products, setSelectedCategoryName, setShowCategoryModal, setLoginPresetEmail, setShowLogin } = useApp();
  const [searchVal, setSearchVal] = useState('');
  const [gpsStatus, setGpsStatus] = useState('📍 Indiranagar, Bengaluru (30-45 mins)');
  const [vendorFilter, setVendorFilter] = useState('all');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');

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

  // Filter vendors based on active tab
  const filteredVendors = vendors.filter(v => {
    if (vendorFilter === 'express') return v.distance.includes('0.') || v.distance.includes('1.');
    if (vendorFilter === 'top') return v.rating >= 4.6;
    if (vendorFilter === 'open') return v.isOpen;
    return true;
  });

  // Filter products based on active tab
  const filteredProducts = products.filter(p => {
    if (productCategoryFilter === 'all') return true;
    if (productCategoryFilter === 'plants') return p.type === 'plant' || p.category.toLowerCase().includes('plant');
    if (productCategoryFilter === 'pots') return p.type === 'pot' || p.category.toLowerCase().includes('pot');
    if (productCategoryFilter === 'soil') return p.type === 'soil' || p.category.toLowerCase().includes('soil') || p.category.toLowerCase().includes('seed');
    return true;
  });

  const handleCategoryClick = (catName) => {
    setSelectedCategoryName(catName);
    setShowCategoryModal(true);
  };

  const handleGpsConnect = () => {
    setGpsStatus('📍 Jayanagar 4th Block, Bengaluru (Live Location ✅)');
  };

  const handleSearchSubmit = () => {
    if (!searchVal) return;
    const match = products.find(p => p.name.toLowerCase().includes(searchVal.toLowerCase()) || p.category.toLowerCase().includes(searchVal.toLowerCase()));
    
    if (match) {
      window.location.hash = `#/map?filter=${match.type}`;
    } else {
      alert(`Showing nurseries stocking "${searchVal}".`);
      window.location.hash = `#/map`;
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
    <div id="view-home" className="page-view active" style={{ paddingBottom: '40px' }}>
      
      {/* Hyperlocal Top Delivery Bar (Zomato/Swiggy style) */}
      <div style={{ background: 'linear-gradient(90deg, #1b4332 0%, #2d6a4f 100%)', color: '#fff', padding: '10px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '12px', marginBottom: '24px', boxShadow: '0 4px 12px rgba(27,67,50,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: 600 }}>
          <span style={{ background: '#ffb703', color: '#000', padding: '3px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 800 }}>⚡ INSTANT DELIVERY</span>
          <span style={{ cursor: 'pointer' }} onClick={handleGpsConnect}>{gpsStatus}</span>
        </div>
        <div style={{ display: 'flex', gap: '16px', fontSize: '12px', fontWeight: 700 }}>
          <span style={{ color: '#d8f3dc' }}>🛵 30-45 Mins Express</span>
          <span style={{ color: '#d8f3dc' }}>🪴 Hydration Plant Packaging</span>
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
            Buy live plants, hand-crafted terracotta pots, and organic compost directly from local nursery stalls. Delivered fresh to your doorstep in 30-45 minutes or reserve for self-pickup.
          </p>
          
          {/* Search Bar */}
          <div className="search-container" style={{ marginTop: '24px' }}>
            <div className="search-input-wrapper">
              <svg width="20" height="20"><use href="#icon-search"></use></svg>
              <input 
                type="text" 
                value={searchVal} 
                onChange={(e) => setSearchVal(e.target.value)} 
                placeholder="Search Monstera, Snake Plant, Terracotta Pot, Vermicompost..." 
                onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
              />
            </div>
            <button className="search-btn" onClick={handleSearchSubmit} style={{ borderRadius: '10px' }}>
              Find Nearby
            </button>
          </div>
        </div>
      </section>

      {/* Quick Category Chips Carousel */}
      <section style={{ marginBottom: '40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '14px' }}>
          {categories.map((cat, idx) => (
            <div 
              key={idx} 
              onClick={() => handleCategoryClick(cat.name)}
              style={{
                background: cat.color,
                padding: '16px 12px',
                borderRadius: '16px',
                textAlign: 'center',
                cursor: 'pointer',
                border: '1px solid rgba(0,0,0,0.04)',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'none'}
            >
              <div style={{ fontSize: '32px', marginBottom: '6px' }}>{cat.icon}</div>
              <div style={{ fontWeight: 800, fontSize: '13px', color: 'var(--dark)' }}>{cat.name}</div>
              <span style={{ fontSize: '10px', color: 'var(--primary-green)', fontWeight: 700, marginTop: '4px', display: 'inline-block' }}>
                {cat.badge}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Nearby Nurseries Section (Zomato/Swiggy style discovery) */}
      <section style={{ marginBottom: '48px' }}>
        <div className="section-title-row" style={{ alignItems: 'flex-end', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--primary-green)', letterSpacing: '1px', textTransform: 'uppercase' }}>HYPERLOCAL DISCOVERY</div>
            <h2 className="section-title" style={{ fontSize: '28px', margin: 0 }}>Nearby Nursery Stalls</h2>
            <p className="section-subtitle">Browse physical nurseries selling live plants, pots, & care supplies nearby</p>
          </div>
          <Link to="/map" className="view-all">Explore Map View <svg width="16" height="16"><use href="#icon-arrow-right"></use></svg></Link>
        </div>

        {/* Nursery Filter Pills */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '4px' }}>
          <button 
            className={`inventory-filter-btn ${vendorFilter === 'all' ? 'active' : ''}`}
            onClick={() => setVendorFilter('all')}
          >
            All Nurseries ({vendors.length})
          </button>
          <button 
            className={`inventory-filter-btn ${vendorFilter === 'express' ? 'active' : ''}`}
            onClick={() => setVendorFilter('express')}
          >
            ⚡ Express &lt; 1.5 km
          </button>
          <button 
            className={`inventory-filter-btn ${vendorFilter === 'top' ? 'active' : ''}`}
            onClick={() => setVendorFilter('top')}
          >
            ⭐ Top Rated (4.6+)
          </button>
          <button 
            className={`inventory-filter-btn ${vendorFilter === 'open' ? 'active' : ''}`}
            onClick={() => setVendorFilter('open')}
          >
            🟢 Open Now
          </button>
        </div>
        
        <div className="category-slider" id="home-vendors-list" style={{ paddingBottom: '12px', overflowX: 'auto', display: 'flex', gap: '16px' }}>
          {filteredVendors.map((vendor) => (
            <VendorCard key={vendor.id} vendor={vendor} />
          ))}
        </div>
      </section>

      {/* Nursery Partner Banner (For Nursery Owners to sell plants) */}
      <section style={{ marginBottom: '48px', background: 'linear-gradient(135deg, #1b4332 0%, #081c15 100%)', borderRadius: '20px', padding: '32px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
        <div style={{ maxWidth: '580px' }}>
          <span style={{ background: '#ffb703', color: '#000', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 800, letterSpacing: '0.5px' }}>
            🏪 FOR NURSERY OWNERS & ARTISANS
          </span>
          <h3 style={{ fontSize: '26px', fontFamily: 'var(--font-serif)', color: '#fff', marginTop: '10px', marginBottom: '8px' }}>
            Own a Plant Nursery or Pottery Stall? Join Planto!
          </h3>
          <p style={{ fontSize: '14px', color: '#d8f3dc', lineHeight: 1.5 }}>
            Put your local nursery online in 2 minutes. Receive instant plant orders from nearby plant lovers, manage live stock, and get instant payouts.
          </p>
        </div>
        <div>
          <button 
            className="btn" 
            style={{ background: '#ffb703', color: '#000', border: 'none', fontWeight: 800, padding: '14px 28px', fontSize: '15px', borderRadius: '12px' }}
            onClick={() => {
              setLoginPresetEmail('vendor@planto.in');
              setShowLogin(true);
            }}
          >
            Open Nursery Vendor Portal →
          </button>
        </div>
      </section>

      {/* Plant Marketplace Catalog (Amazon style) */}
      <section style={{ marginBottom: '48px' }}>
        <div className="section-title-row" style={{ alignItems: 'flex-end', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--primary-green)', letterSpacing: '1px', textTransform: 'uppercase' }}>PLANT & POT MARKETPLACE</div>
            <h2 className="section-title" style={{ fontSize: '28px', margin: 0 }}>Fresh Plant & Pot Catalog</h2>
            <p className="section-subtitle">Stocked live across verified local nurseries & growers</p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className={`inventory-filter-btn ${productCategoryFilter === 'all' ? 'active' : ''}`}
              onClick={() => setProductCategoryFilter('all')}
            >
              All Items
            </button>
            <button 
              className={`inventory-filter-btn ${productCategoryFilter === 'plants' ? 'active' : ''}`}
              onClick={() => setProductCategoryFilter('plants')}
            >
              🪴 Plants
            </button>
            <button 
              className={`inventory-filter-btn ${productCategoryFilter === 'pots' ? 'active' : ''}`}
              onClick={() => setProductCategoryFilter('pots')}
            >
              🏺 Pots & Planters
            </button>
            <button 
              className={`inventory-filter-btn ${productCategoryFilter === 'soil' ? 'active' : ''}`}
              onClick={() => setProductCategoryFilter('soil')}
            >
              🌿 Soil & Care
            </button>
          </div>
        </div>

        <div className="products-grid" id="home-deals-grid">
          {filteredProducts.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
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

    </div>
  );
}

