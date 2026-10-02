import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import VendorCard from '../components/VendorCard';
import ProductCard from '../components/ProductCard';
import SocietyGroupDrop from '../components/SocietyGroupDrop';

export default function HomePage() {
  const navigate = useNavigate();
  const { 
    currentUser,
    vendors, 
    products, 
    categories: apiCategories, 
    itemTypes, 
    setSelectedCategoryName, 
    setShowCategoryModal, 
    setLoginPresetEmail, 
    setShowLogin, 
    setShowFreeGiftModal, 
    setShowBotanistModal,
    setShowBalconyModal,
    setShowClubModal,
    setShowHospitalModal
  } = useApp();
  const [searchVal, setSearchVal] = useState('');
  const [gpsStatus, setGpsStatus] = useState('Detecting Live Location...');
  const [showAllVendors, setShowAllVendors] = useState(false);
  const [vendorFilter, setVendorFilter] = useState('all');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [weatherData, setWeatherData] = useState(null);

  const fetchWeather = (cityName = 'Hyderabad') => {
    api.getWeatherCareTip(cityName)
      .then(data => setWeatherData(data))
      .catch(() => {});
  };

  const requestLiveLocation = () => {
    if (!navigator.geolocation) {
      setGpsStatus('Kothaguda, Hyderabad (Delivery in 20-30 Mins)');
      fetchWeather('Hyderabad');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
          const data = await res.json();
          const road = data.address?.road || data.address?.pedestrian || data.address?.street || '';
          const locality = data.address?.suburb || data.address?.neighbourhood || data.address?.residential || '';
          const city = data.address?.city || data.address?.town || data.address?.district || data.address?.state_district || 'Hyderabad';
          const exactAddress = (road && locality) ? `${road}, ${locality}` : (locality && city) ? `${locality}, ${city}` : locality || city || 'Hyderabad';
          setGpsStatus(`${exactAddress} (Delivery in 20-30 Mins)`);
          fetchWeather(city);
        } catch (err) {
          setGpsStatus(`Kothaguda, Hyderabad (Delivery in 20-30 Mins)`);
          fetchWeather('Hyderabad');
        }
      },
      (error) => {
        setGpsStatus('Kothaguda, Hyderabad (Delivery in 20-30 Mins)');
        fetchWeather('Hyderabad');
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    // Check if user has a saved address with city
    const savedAddresses = currentUser?.addresses || JSON.parse(localStorage.getItem('plantme_delivery_addresses') || '[]');
    let initialCity = 'Hyderabad';
    if (savedAddresses && savedAddresses.length > 0) {
      const active = savedAddresses[0];
      if (typeof active === 'object' && active.city) {
        initialCity = active.city;
      }
    }
    fetchWeather(initialCity);
    requestLiveLocation();
  }, [currentUser]);

  const categoryPresetMap = {
    "indoor plants": { icon: "🪴", badge: "Air Purifiers", color: "#e8f5e9" },
    "outdoor & flowering plants": { icon: "🌸", badge: "Sun Lovers", color: "#fff3e0" },
    "outdoor plants": { icon: "🌸", badge: "Sun Lovers", color: "#fff3e0" },
    "pots & terracotta planters": { icon: "🏺", badge: "Ceramic & Terracotta", color: "#efebe9" },
    "pots & planters": { icon: "🏺", badge: "Ceramic & Terracotta", color: "#efebe9" },
    "seeds & organic soil": { icon: "🌱", badge: "High Yield & Soil", color: "#f3e5f5" },
    "fresh flower bouquets": { icon: "💐", badge: "Fresh Floral Gifts", color: "#fce4ec" },
    "bouquets & flowers": { icon: "💐", badge: "Fresh Floral Gifts", color: "#fce4ec" },
    "gardening tools": { icon: "✂️", badge: "Pruners & Sprays", color: "#e0f2f1" },
    "plant sapling": { icon: "🌿", badge: "Live Potted Saplings", color: "#e8f5e9" },
    "pot / planter": { icon: "🏺", badge: "Ceramic & Terracotta", color: "#efebe9" },
    "hydroponics equipment": { icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" /></svg>, badge: "Soil-less Kits", color: "#e0f2f1" }
  };

  const defaultItemTypes = [
    { name: "Indoor Plants", icon: "🪴", badge: "Air Purifiers", color: "#e8f5e9" },
    { name: "Outdoor & Flowering Plants", icon: "🌸", badge: "Sun Lovers", color: "#fff3e0" },
    { name: "Pots & Terracotta Planters", icon: "🏺", badge: "Ceramic & Terracotta", color: "#efebe9" },
    { name: "Seeds & Organic Soil", icon: "🌱", badge: "High Yield & Soil", color: "#f3e5f5" },
    { name: "Fresh Flower Bouquets", icon: "💐", badge: "Fresh Floral Gifts", color: "#fce4ec" },
    { name: "Gardening Tools", icon: "✂️", badge: "Pruners & Sprays", color: "#e0f2f1" },
    { name: "Plant Sapling", icon: "🌿", badge: "Live Potted Saplings", color: "#e8f5e9" },
    { name: "Pot / Planter", icon: "🏺", badge: "Ceramic & Terracotta", color: "#efebe9" },
    { name: "Hydroponics Equipment", icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" /></svg>, badge: "Soil-less Kits", color: "#e0f2f1" }
  ];

  const displayItemTypes = (itemTypes && itemTypes.length > 0) ? itemTypes : defaultItemTypes;

  const categories = displayItemTypes.map(it => {
    const key = it.name.toLowerCase();
    const matched = categoryPresetMap[key] || { icon: "🌿", badge: it.description || "Live Classification", color: "#e8f5e9" };
    return {
      name: it.name,
      icon: matched.icon || it.icon || "🌿",
      badge: matched.badge || it.badge || "Classification",
      color: matched.color || it.color || "#e8f5e9"
    };
  });

  const seasonalPresetImages = {
    "spring bloom": "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=500&q=80",
    "summer oasis": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=500&q=80",
    "monsoon magic": "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?auto=format&fit=crop&w=500&q=80",
    "winter wonders": "https://images.unsplash.com/photo-1482862549707-f63cb32c5fd9?auto=format&fit=crop&w=500&q=80"
  };

  const seasonalPresetEmojis = {
    "spring bloom": "🌸",
    "summer oasis": "☀️",
    "monsoon magic": "🌧️",
    "winter wonders": "❄️"
  };

  const seasonalCategoriesFromApi = apiCategories.filter(c => 
    c.seasonMonths || c.name.toLowerCase().includes('bloom') || c.name.toLowerCase().includes('oasis') || c.name.toLowerCase().includes('magic') || c.name.toLowerCase().includes('wonder') || c.name.toLowerCase().includes('spring') || c.name.toLowerCase().includes('summer') || c.name.toLowerCase().includes('monsoon') || c.name.toLowerCase().includes('winter') || c.name.toLowerCase().includes('autumn') || c.name.toLowerCase().includes('fall')
  );

  const seasonalItems = (seasonalCategoriesFromApi && seasonalCategoriesFromApi.length > 0) ? seasonalCategoriesFromApi.map(c => {
    const key = c.name.toLowerCase();
    return {
      name: c.name,
      emoji: seasonalPresetEmojis[key] || "🌿",
      desc: c.description || "Fresh botanical seasonal collection",
      img: seasonalPresetImages[key] || "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=500&q=80"
    };
  }) : [
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

  const visibleVendors = showAllVendors ? filteredVendors : filteredVendors.slice(0, 5);

  // Filter products based on active tab
  const filteredProducts = products.filter(p => {
    if (productCategoryFilter === 'all') return true;
    if (productCategoryFilter === 'pet') return p.petFriendly === true;
    if (productCategoryFilter === 'air') return (p.airPurificationScore || 0) >= 8;
    if (productCategoryFilter === 'lowlight') {
      const sun = (p.careInstructions?.sunlight || '').toLowerCase();
      return sun.includes('indirect') || sun.includes('low') || sun.includes('shade') || sun.includes('corners');
    }
    if (productCategoryFilter === 'easy') {
      const water = (p.careInstructions?.waterLevel || '').toLowerCase();
      return water.includes('low') || water.includes('dry') || water.includes('wrinkle') || water.includes('2-3 weeks');
    }
    if (productCategoryFilter === 'plants') return p.type === 'plant' || p.category.toLowerCase().includes('plant');
    if (productCategoryFilter === 'pots') return p.type === 'pot' || p.category.toLowerCase().includes('pot');
    if (productCategoryFilter === 'bouquets') return p.type === 'bouquet' || p.category.toLowerCase().includes('bouquet') || p.category.toLowerCase().includes('flower');
    if (productCategoryFilter === 'soil') return p.type === 'soil' || p.category.toLowerCase().includes('soil') || p.category.toLowerCase().includes('seed');
    return true;
  });

  const handleCategoryClick = (catName) => {
    setSelectedCategoryName(catName);
    setShowCategoryModal(true);
  };

  const handleGpsConnect = () => {
    requestLiveLocation();
  };

  const handleSearchSubmit = () => {
    if (!searchVal) return;
    const match = products.find(p => p.name.toLowerCase().includes(searchVal.toLowerCase()) || p.category.toLowerCase().includes(searchVal.toLowerCase()));
    
    if (match) {
      navigate(`/?filter=${match.type}`);
    } else {
      alert(`Showing nurseries stocking "${searchVal}".`);
      navigate(`/`);
    }
  };

  const handleSeasonalClick = (seasonName) => {
    let key = 'spring';
    if (seasonName.toLowerCase().includes("summer")) key = 'summer';
    else if (seasonName.toLowerCase().includes("monsoon")) key = 'monsoon';
    else if (seasonName.toLowerCase().includes("winter")) key = 'winter';
    
    navigate(`/seasonal/${key}`);
  };

  return (
    <div id="view-home" className="page-view active" style={{ paddingBottom: '10px' }}>
      
      {/* Hyperlocal Top Delivery Bar */}
      <div className="top-delivery-banner">
        <div className="top-delivery-banner-left">
          <span className="sameday-badge-animated">
            SAME-DAY DELIVERY
          </span>
          <span className="top-delivery-location" onClick={handleGpsConnect} title="Click to refresh location">
            {gpsStatus}
          </span>
        </div>
        <div className="top-delivery-banner-right">
          <span className="top-delivery-pill">Delivery in 20 to 30 mins</span>
          <span className="top-delivery-pill">Hydration Plant Packaging</span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
              <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
            </svg>
            India's #1 Hyperlocal Live Plant Delivery
          </div>
          <h1 className="hero-title">
            Order Plants, Pots & Soil <br className="desktop-only" />Delivered by <span>PlantMe Express</span>
          </h1>
          <p className="hero-desc">
            Buy live indoor plants, ceramic pots, and organic compost with moisture-preserving root hydration wraps. Delivered fresh to your doorstep in 20 to 30 minutes with our 30-day zero-hassle thrive guarantee.
          </p>
          
          {/* Search Bar */}
          <div className="search-container">
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
            <button className="search-btn" onClick={handleSearchSubmit}>
              Find Nearby
            </button>
          </div>

          {/* Quick CX Action Shortcuts */}
          <div className="quick-action-shortcuts" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <Link to="/ai" className="cx-shortcut-btn">
              AI Plant Doctor
            </Link>
            <button 
              onClick={() => setShowBalconyModal(true)} 
              className="cx-shortcut-btn"
              style={{ border: 'none', cursor: 'pointer' }}
            >
              Balcony Makeover (₹499)
            </button>
            <button 
              onClick={() => setShowClubModal(true)} 
              className="cx-shortcut-btn"
              style={{ border: 'none', cursor: 'pointer' }}
            >
              Mystery Box Club (₹349/mo)
            </button>
            <button 
              onClick={() => setShowHospitalModal(true)} 
              className="cx-shortcut-btn"
              style={{ border: 'none', cursor: 'pointer' }}
            >
              Vacation Boarding & ICU
            </button>
            <Link to="/corporate" className="cx-shortcut-btn">
              Office Retainers
            </Link>
          </div>

          {/* Botanical Weather & Care Advisory Widget */}
          {weatherData && (
            <div className="weather-care-widget">
              <div className="weather-widget-left">
                <div className="weather-widget-header">
                  <span>{weatherData.city} Botanical Weather: {weatherData.temperature} • {weatherData.condition}</span>
                  <span className="weather-humidity-pill">Humidity: {weatherData.humidity}</span>
                </div>
                <div className="weather-advisory-text">
                  <strong>{weatherData.advisory.title}:</strong> {weatherData.advisory.actionText}
                </div>
              </div>
              <Link to="/garden" className="weather-widget-btn">
                Check Water Schedule →
              </Link>
            </div>
          )}
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

      {/* Apartment Society & Tech Park Group Drop */}
      <SocietyGroupDrop />

      {/* REVENUE GENERATING BOTANICAL SERVICES & CLUBS */}
      <section style={{ marginBottom: '44px' }}>
        <div className="section-title-row" style={{ alignItems: 'flex-end', marginBottom: '18px' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--primary-green)', letterSpacing: '1px', textTransform: 'uppercase' }}>PLANTME SIGNATURE BOTANICAL SERVICES</div>
            <h2 className="section-title" style={{ fontSize: '26px', margin: 0 }}>At-Home Care, Subscriptions & Boarding</h2>
            <p className="section-subtitle">Comprehensive plant parent solutions from certified horticulturists</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          
          {/* Card 1: At-Home Balcony Makeover & Plant Doctor */}
          <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', border: '1.5px solid #86efac', borderRadius: '18px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 14px rgba(22,101,52,0.06)' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ background: '#166534', color: '#ffffff', fontSize: '10.5px', fontWeight: 800, padding: '3px 8px', borderRadius: '10px', textTransform: 'uppercase' }}>
                  AT-HOME CARE
                </span>
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#166534' }}>From ₹499</span>
              </div>
              <h4 style={{ fontSize: '17px', fontWeight: 800, color: '#14532d', margin: '4px 0 6px 0' }}>
                Balcony Makeover & Plant Doctor
              </h4>
              <p style={{ fontSize: '12.5px', color: '#334155', lineHeight: 1.4, margin: '0 0 16px 0' }}>
                Senior landscape botanist dispatched to your home. Complete health triage, organic pest spray, potting mix soil replenishment & sunlight layout styling.
              </p>
            </div>
            <button
              onClick={() => setShowBalconyModal(true)}
              style={{
                background: 'var(--primary-green)',
                color: '#ffffff',
                border: 'none',
                padding: '11px 16px',
                borderRadius: '11px',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                textAlign: 'center'
              }}
            >
              Book At-Home Visit (From ₹499) →
            </button>
          </div>

          {/* Card 2: "Plant of the Month" Mystery Box Club */}
          <div style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', border: '1.5px solid #fcd34d', borderRadius: '18px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 14px rgba(180,83,9,0.06)' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ background: '#92400e', color: '#ffffff', fontSize: '10.5px', fontWeight: 800, padding: '3px 8px', borderRadius: '10px', textTransform: 'uppercase' }}>
                  VIP SUBSCRIPTION
                </span>
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#78350f' }}>From ₹349/mo</span>
              </div>
              <h4 style={{ fontSize: '17px', fontWeight: 800, color: '#78350f', margin: '4px 0 6px 0' }}>
                "Plant of the Month" Mystery Club
              </h4>
              <p style={{ fontSize: '12.5px', color: '#334155', lineHeight: 1.4, margin: '0 0 16px 0' }}>
                Curated exotic live plant in a handcrafted ceramic planter delivered to your door every month. Includes collector passport & free organic plant nutrition.
              </p>
            </div>
            <button
              onClick={() => setShowClubModal(true)}
              style={{
                background: '#b45309',
                color: '#ffffff',
                border: 'none',
                padding: '11px 16px',
                borderRadius: '11px',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                textAlign: 'center'
              }}
            >
              Join Mystery Box Club (₹349/mo) →
            </button>
          </div>

          {/* Card 3: Vacation Plant Boarding & ICU Hospital */}
          <div style={{ background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)', border: '1.5px solid #7dd3fc', borderRadius: '18px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 14px rgba(3,105,161,0.06)' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ background: '#0369a1', color: '#ffffff', fontSize: '10.5px', fontWeight: 800, padding: '3px 8px', borderRadius: '10px', textTransform: 'uppercase' }}>
                  CLIMATE NURSERY
                </span>
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#0369a1' }}>From ₹199/wk</span>
              </div>
              <h4 style={{ fontSize: '17px', fontWeight: 800, color: '#0c4a6e', margin: '4px 0 6px 0' }}>
                Vacation Boarding & Plant Hospital
              </h4>
              <p style={{ fontSize: '12.5px', color: '#334155', lineHeight: 1.4, margin: '0 0 16px 0' }}>
                Going traveling? Board plants in our sensor-monitored greenhouse with daily WhatsApp photo logs. Dying plant? 14-day ICU root recovery ward.
              </p>
            </div>
            <button
              onClick={() => setShowHospitalModal(true)}
              style={{
                background: '#0284c7',
                color: '#ffffff',
                border: 'none',
                padding: '11px 16px',
                borderRadius: '11px',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                textAlign: 'center'
              }}
            >
              Schedule Boarding or ICU Recovery →
            </button>
          </div>

          {/* Card 4: B2B Office Care Retainers */}
          <div style={{ background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)', border: '1.5px solid #cbd5e1', borderRadius: '18px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 14px rgba(0,0,0,0.04)' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ background: '#334155', color: '#ffffff', fontSize: '10.5px', fontWeight: 800, padding: '3px 8px', borderRadius: '10px', textTransform: 'uppercase' }}>
                  B2B CORPORATE
                </span>
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#334155' }}>From ₹2,499/mo</span>
              </div>
              <h4 style={{ fontSize: '17px', fontWeight: 800, color: '#1e293b', margin: '4px 0 6px 0' }}>
                Workplace Plant Care Retainers
              </h4>
              <p style={{ fontSize: '12.5px', color: '#475569', lineHeight: 1.4, margin: '0 0 16px 0' }}>
                Zero-effort biophilic offices. Uniformed certified botanists maintain, water, and replace desk plants & reception statement trees with 100% thrive guarantee.
              </p>
            </div>
            <Link
              to="/corporate"
              style={{
                background: '#1e293b',
                color: '#ffffff',
                textDecoration: 'none',
                padding: '11px 16px',
                borderRadius: '11px',
                fontSize: '13px',
                fontWeight: 800,
                textAlign: 'center',
                display: 'block'
              }}
            >
              View Corporate Retainers & Audit →
            </Link>
          </div>

        </div>
      </section>

      {/* The PlantMe Experience & Quality Standard */}
      <section style={{ marginBottom: '48px' }}>
        <div className="section-title-row" style={{ alignItems: 'flex-end', marginBottom: '20px' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--primary-green)', letterSpacing: '1px', textTransform: 'uppercase' }}>THE PLANTME PROMISE</div>
            <h2 className="section-title" style={{ fontSize: '28px', margin: 0 }}>Built for 100% Plant Survival</h2>
            <p className="section-subtitle">Why thousands of urban plant parents trust PlantMe over traditional nursery visits</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '22px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px', color: '#166534' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
            </div>
            <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#1b4332', marginBottom: '6px' }}>Root Hydration Wrap</h4>
            <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
              Packed in biodegradable damp-moss hydration shields that keep roots hydrated & stress-free during transit.
            </p>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '22px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px', color: '#b45309' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
            </div>
            <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#1b4332', marginBottom: '6px' }}>Live Batch Snapshots</h4>
            <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
              No generic CGI stock photos. Real daily photographs of the active plant batch inspected at our fulfillment centers.
            </p>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '22px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px', color: '#0369a1' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            </div>
            <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#1b4332', marginBottom: '6px' }}>20-30 Min EV Express</h4>
            <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
              Shipped upright in custom shock-absorbing cargo boxes via eco-friendly electric vehicles across Hyderabad & Bengaluru.
            </p>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '22px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px', color: '#15803d' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#1b4332', marginBottom: '6px' }}>30-Day Thrive Promise</h4>
            <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
              If your plant wilts within 30 days despite care tips, get a free replacement or virtual consultation with our botanist.
            </p>
          </div>
        </div>
      </section>

      {/* Plant Marketplace Catalog */}
      <section style={{ marginBottom: '48px' }}>
        <div style={{ marginBottom: '14px' }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary-green)', letterSpacing: '1px', textTransform: 'uppercase' }}>PLANT & POT MARKETPLACE</div>
          <h2 style={{ fontSize: '24px', fontFamily: 'var(--font-serif)', margin: '4px 0 4px 0', color: 'var(--dark)' }}>Fresh Plant & Pot Catalog</h2>
          <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>Inspected & dispatched fresh from PlantMe Certified Partner Nurseries</p>
        </div>

        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '20px', width: '100%', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
          <button 
            className={`inventory-filter-btn ${productCategoryFilter === 'all' ? 'active' : ''}`}
            onClick={() => setProductCategoryFilter('all')}
          >
            All Items ({products.length})
          </button>
          <button 
            className={`inventory-filter-btn ${productCategoryFilter === 'pet' ? 'active' : ''}`}
            onClick={() => setProductCategoryFilter('pet')}
          >
            Pet-Safe
          </button>
          <button 
            className={`inventory-filter-btn ${productCategoryFilter === 'air' ? 'active' : ''}`}
            onClick={() => setProductCategoryFilter('air')}
          >
            Air Purifiers (8+)
          </button>
          <button 
            className={`inventory-filter-btn ${productCategoryFilter === 'lowlight' ? 'active' : ''}`}
            onClick={() => setProductCategoryFilter('lowlight')}
          >
            Low-Light / AC
          </button>
          <button 
            className={`inventory-filter-btn ${productCategoryFilter === 'easy' ? 'active' : ''}`}
            onClick={() => setProductCategoryFilter('easy')}
          >
            Easy Care
          </button>
          <button 
            className={`inventory-filter-btn ${productCategoryFilter === 'pots' ? 'active' : ''}`}
            onClick={() => setProductCategoryFilter('pots')}
          >
            Pots & Planters
          </button>
          <button 
            className={`inventory-filter-btn ${productCategoryFilter === 'soil' ? 'active' : ''}`}
            onClick={() => setProductCategoryFilter('soil')}
          >
            Organic Soil & Care
          </button>
          <button 
            className={`inventory-filter-btn ${productCategoryFilter === 'bouquets' ? 'active' : ''}`}
            onClick={() => setProductCategoryFilter('bouquets')}
          >
            💐 Flower Bouquets
          </button>
        </div>

        {/* Express Fresh Flower Delivery Feature Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #fbcfe8 100%)',
          border: '1px solid #f472b6',
          borderRadius: '16px',
          padding: '16px 20px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ fontSize: '34px', filter: 'drop-shadow(0 2px 6px rgba(244,114,182,0.4))' }}>💐</span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ background: '#db2777', color: '#fff', fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '10px', textTransform: 'uppercase' }}>
                  NEW SERVICE
                </span>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#9d174d' }}>20-30 Mins Express Delivery</span>
              </div>
              <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#831843', margin: '3px 0 2px 0' }}>
                Handcrafted Fresh Flower Bouquets
              </h4>
              <p style={{ fontSize: '12px', color: '#9d174d', margin: 0 }}>
                Dutch red roses, oriental lilies, carnations & orchids delivered with stem-hydration wraps & flower food.
              </p>
            </div>
          </div>
          <button
            onClick={() => setProductCategoryFilter('bouquets')}
            style={{
              background: '#db2777',
              color: '#ffffff',
              border: 'none',
              padding: '9px 18px',
              borderRadius: '10px',
              fontSize: '12.5px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 3px 10px rgba(219,39,119,0.3)',
              whiteSpace: 'nowrap'
            }}
          >
            Browse Bouquets →
          </button>
        </div>

        <div className="products-grid" id="home-deals-grid">
          {filteredProducts.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </section>

      {/* Seasonal Curation Grid Sector */}
      <section style={{ 
        clear: 'both', 
        marginTop: '28px', 
        paddingTop: '20px', 
        borderTop: '1px solid rgba(0,0,0,0.06)',
        position: 'relative', 
        zIndex: 1 
      }}>
        <div className="section-title-row" style={{ marginBottom: '20px', alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary-green)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>
              HYPERLOCAL BOTANICAL CALENDAR
            </div>
            <h2 className="section-title" style={{ fontSize: '28px', margin: 0 }}>Seasonal Plant Collections</h2>
            <p className="section-subtitle" style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
              Handpicked flowering saplings & organic soil recipes tailored for India's weather cycles
            </p>
          </div>
        </div>
        
        <div className="season-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
          {seasonalItems.map((item, idx) => (
            <div 
              key={idx} 
              className="season-card" 
              style={{ 
                cursor: 'pointer',
                minHeight: '260px',
                borderRadius: '20px',
                backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0.85)), url(${item.img})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }} 
              onClick={() => handleSeasonalClick(item.name)}
            >
              {/* Top Season Badge */}
              <div style={{ position: 'absolute', top: '14px', left: '14px', background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(8px)', color: '#fff', fontSize: '10px', fontWeight: 800, padding: '4px 10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.3)' }}>
                {idx === 0 ? 'March - May' : idx === 1 ? 'June - August' : idx === 2 ? 'Sept - Nov' : 'Dec - Feb'}
              </div>

              <div className="season-icon" style={{ fontSize: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {item.emoji}
              </div>

              <div className="season-content-overlay" style={{ zIndex: 2, position: 'relative' }}>
                <h3 style={{ color: '#ffffff', textShadow: '0 2px 6px rgba(0,0,0,0.8)', fontSize: '20px', margin: '0 0 6px 0', fontFamily: 'var(--font-serif)' }}>{item.name}</h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.95)', textShadow: '0 1px 4px rgba(0,0,0,0.8)', fontSize: '13px', margin: 0, lineHeight: 1.4 }}>{item.desc}</p>
                
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#ffb703', fontWeight: 800, marginTop: '10px' }}>
                  Explore Collection →
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}

