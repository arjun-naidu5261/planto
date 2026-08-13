import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import ProductCard from '../components/ProductCard';

export default function StallPage() {
  const { id } = useParams();
  const { products } = useApp();
  
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [inStallSearch, setInStallSearch] = useState('');

  useEffect(() => {
    let active = true;
    const fetchVendor = async () => {
      try {
        setLoading(true);
        const data = await api.getVendorById(id);
        if (active) {
          setVendor(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchVendor();

    return () => {
      active = false;
    };
  }, [id, products]);

  if (loading) {
    return <div style={{ padding: '80px', textAlign: 'center', fontSize: '16px', fontWeight: 600 }}>Loading Nursery Store details...</div>;
  }

  if (!vendor) {
    return (
      <div style={{ padding: '80px', textAlign: 'center' }}>
        <h3>Nursery Store Not Found</h3>
        <Link to="/" className="btn" style={{ marginTop: '16px', display: 'inline-block' }}>Back to Home</Link>
      </div>
    );
  }

  // Filter products by vendor ID, active tab & search query
  const stallProducts = products.filter(p => {
    if (p.vendorId !== id) return false;
    if (activeFilter !== 'all' && p.type !== activeFilter) return false;
    if (inStallSearch && !p.name.toLowerCase().includes(inStallSearch.toLowerCase())) return false;
    return true;
  });

  const handleReserveClick = () => {
    alert("Items added to reservation list! Proceed to Checkout and choose 'Reserve & Pickup' to collect directly from stall.");
    window.location.hash = "#/cart";
  };

  return (
    <div id="view-stall" className="page-view active" style={{ display: 'block', paddingBottom: '50px' }}>
      
      {/* Nursery Store Cover & Header (Swiggy/Zomato style) */}
      <div style={{ 
        position: 'relative', 
        borderRadius: '20px', 
        overflow: 'hidden', 
        background: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.85)), url(${vendor.photos ? vendor.photos[0] : 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1200&q=80'}) center/cover no-repeat`,
        color: '#fff',
        padding: '40px 32px',
        marginBottom: '32px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{ background: '#ffb703', color: '#000', fontSize: '11px', fontWeight: 800, padding: '4px 10px', borderRadius: '12px', textTransform: 'uppercase' }}>
                Verified {vendor.type || 'Nursery Stall'}
              </span>
              <span style={{ background: vendor.isOpen ? '#2e7d32' : '#c62828', color: '#fff', fontSize: '11px', fontWeight: 800, padding: '4px 10px', borderRadius: '12px' }}>
                {vendor.isOpen ? '🟢 Open Now' : '🔴 Closed'}
              </span>
            </div>

            <h1 style={{ fontSize: '38px', fontFamily: 'var(--font-serif)', margin: '4px 0 8px 0', color: '#ffffff' }}>{vendor.name}</h1>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.9)', margin: 0 }}>
              Owner: <strong>{vendor.owner}</strong> • {vendor.address}
            </p>
            
            <div style={{ display: 'flex', gap: '16px', marginTop: '14px', fontSize: '13px', fontWeight: 700, color: '#d8f3dc' }}>
              <span>⭐ {vendor.rating} ({vendor.reviewsCount} customer reviews)</span>
              <span>📍 {vendor.distance} away</span>
              <span>⚡ 25-35 min Express Delivery</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <a href={`tel:${vendor.phone}`} className="btn" style={{ background: '#ffffff', color: '#1b4332', border: 'none', fontWeight: 800 }}>📞 Call Nursery</a>
            <a href={vendor.googleMapsUrl} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.4)' }}>📍 Map Directions</a>
            <button className="btn" style={{ background: '#ffb703', color: '#000', border: 'none', fontWeight: 800 }} onClick={handleReserveClick}>🛒 Reserve & Collect</button>
          </div>
        </div>
      </div>
      
      <div className="stall-grid-sections">
        {/* Left Side: Interactive Live Stock Catalog & Search */}
        <div>
          <div className="section-title-row" style={{ marginBottom: '16px', alignItems: 'center' }}>
            <div>
              <h2 className="section-title" style={{ fontSize: '24px' }}>Nursery Live Inventory</h2>
              <p className="section-subtitle">Plants, Pots, Soil & Tools available for instant delivery</p>
            </div>
            
            {/* In-Store Item Search */}
            <div style={{ position: 'relative', width: '240px' }}>
              <input 
                type="text"
                placeholder="Search in store..."
                value={inStallSearch}
                onChange={(e) => setInStallSearch(e.target.value)}
                style={{ width: '100%', padding: '8px 12px 8px 34px', borderRadius: '10px', border: '1px solid #ccc', fontSize: '13px' }}
              />
              <svg width="16" height="16" style={{ position: 'absolute', left: '10px', top: '10px', color: '#888' }}><use href="#icon-search"></use></svg>
            </div>
          </div>
          
          <div className="inventory-filters" style={{ marginBottom: '20px' }}>
            <button className={`inventory-filter-btn ${activeFilter === 'all' ? 'active' : ''}`} onClick={() => setActiveFilter('all')}>All Items</button>
            <button className={`inventory-filter-btn ${activeFilter === 'plant' ? 'active' : ''}`} onClick={() => setActiveFilter('plant')}>🪴 Plants</button>
            <button className={`inventory-filter-btn ${activeFilter === 'pot' ? 'active' : ''}`} onClick={() => setActiveFilter('pot')}>🏺 Pots & Planters</button>
            <button className={`inventory-filter-btn ${activeFilter === 'soil' ? 'active' : ''}`} onClick={() => setActiveFilter('soil')}>🌿 Soil & Manure</button>
            <button className={`inventory-filter-btn ${activeFilter === 'seed' ? 'active' : ''}`} onClick={() => setActiveFilter('seed')}>🌱 Seeds</button>
          </div>
          
          <div className="products-grid" id="stall-inventory-grid">
            {stallProducts.length === 0 ? (
              <div style={{ padding: '60px 20px', textAlign: 'center', color: '#888', gridColumn: '1 / -1', background: '#f9f9f9', borderRadius: '16px' }}>
                No items matching this filter or search query are currently listed for this nursery.
              </div>
            ) : (
              stallProducts.map(prod => (
                <ProductCard key={prod.id} product={prod} />
              ))
            )}
          </div>
        </div>
        
        {/* Right Side: Store Hours, Delivery Info & Reviews */}
        <div>
          <div className="stall-hours-box" style={{ marginBottom: '24px', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.06)' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '16px', borderBottom: '1px solid #eee', paddingBottom: '10px', fontWeight: 800 }}>Store Info & Hours</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '14px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <svg width="18" height="18" style={{ color: 'var(--primary-green)', flexShrink: 0 }}><use href="#icon-time"></use></svg>
                <div>
                  <strong>Working Hours</strong>
                  <div id="stall-hours-val" style={{ color: '#555' }}>{vendor.hours}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <svg width="18" height="18" style={{ color: 'var(--primary-green)', flexShrink: 0 }}><use href="#icon-gps"></use></svg>
                <div>
                  <strong>Stall Location</strong>
                  <div id="stall-address-val" style={{ color: '#555' }}>{vendor.address}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <span style={{ fontSize: '18px' }}>🛵</span>
                <div>
                  <strong>Delivery SLA</strong>
                  <div style={{ color: '#555' }}>30-45 min express delivery or reserve for direct counter pickup</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="stall-hours-box" style={{ borderRadius: '16px', border: '1px solid rgba(0,0,0,0.06)' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '16px', borderBottom: '1px solid #eee', paddingBottom: '10px', fontWeight: 800 }}>Customer Reviews</h3>
            <div id="stall-reviews-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {vendor.reviews && vendor.reviews.map((rev, idx) => (
                <div key={idx} style={{ borderBottom: '1px solid #f4f4f4', paddingBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>
                    <span>{rev.user}</span>
                    <span style={{ color: 'var(--accent-gold)' }}>{'★'.repeat(Math.round(rev.rating))}</span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#555', margin: 0 }}>"{rev.comment}"</p>
                  <span style={{ fontSize: '11px', color: '#888', display: 'block', marginTop: '4px' }}>{rev.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

