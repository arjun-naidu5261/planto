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
  }, [id, products]); // reload if general products list changes

  if (loading) {
    return <div style={{ padding: '60px', textAlign: 'center' }}>Loading Stall details...</div>;
  }

  if (!vendor) {
    return (
      <div style={{ padding: '60px', textAlign: 'center' }}>
        <h3>Stall Vendor Not Found</h3>
        <Link to="/" className="btn" style={{ marginTop: '16px', display: 'inline-block' }}>Back to Home</Link>
      </div>
    );
  }

  // Get products of this vendor, filtered by active tab
  const stallProducts = products.filter(p => {
    if (p.vendorId !== id) return false;
    if (activeFilter === 'all') return true;
    return p.type === activeFilter;
  });

  const handleReserveClick = () => {
    alert("Items can now be reserved. Add specific products to your cart and select 'Reserve & Collect' under Checkout to bypass payment and collect from stall!");
    window.location.hash = "#/cart";
  };

  return (
    <div id="view-stall" className="page-view active" style={{ display: 'block' }}>
      <div className="stall-header" id="stall-profile-header">
        <div>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Verified {vendor.type}
          </span>
          <h1 className="section-title" style={{ fontSize: '36px', marginTop: '4px' }}>{vendor.name}</h1>
          <p style={{ fontSize: '15px', color: '#555', marginTop: '4px' }}>Owner: <strong>{vendor.owner}</strong> • Live inventory synced instantly</p>
          
          <div className="stall-meta">
            <span>⭐ {vendor.rating} ({vendor.reviewsCount} reviews)</span>
            <span>•</span>
            <span>📍 {vendor.distance} from your location</span>
            <span>•</span>
            <span style={{ color: vendor.isOpen ? 'var(--primary-green)' : '#c62828', fontWeight: 700 }}>
              {vendor.isOpen ? 'Open Now' : 'Closed'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <a href={`tel:${vendor.phone}`} className="btn btn-secondary" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>📞 Call Owner</a>
          <button className="btn" id="stall-reserve-collect-btn" onClick={handleReserveClick}>🛒 Reserve & Collect</button>
        </div>
      </div>
      
      <div className="stall-grid-sections">
        {/* Left Side: Interactive Live Stock Catalog */}
        <div>
          <div className="section-title-row" style={{ marginBottom: '20px' }}>
            <div>
              <h2 className="section-title" style={{ fontSize: '24px' }}>Physical Stall Live Inventory</h2>
              <p className="section-subtitle">Real-time stock level inside the physical stall. Updated by owner.</p>
            </div>
          </div>
          
          <div className="inventory-filters">
            <button className={`inventory-filter-btn ${activeFilter === 'all' ? 'active' : ''}`} onClick={() => setActiveFilter('all')}>All Items</button>
            <button className={`inventory-filter-btn ${activeFilter === 'plant' ? 'active' : ''}`} onClick={() => setActiveFilter('plant')}>Plants</button>
            <button className={`inventory-filter-btn ${activeFilter === 'pot' ? 'active' : ''}`} onClick={() => setActiveFilter('pot')}>Pots</button>
            <button className={`inventory-filter-btn ${activeFilter === 'soil' ? 'active' : ''}`} onClick={() => setActiveFilter('soil')}>Soil & Stones</button>
            <button className={`inventory-filter-btn ${activeFilter === 'seed' ? 'active' : ''}`} onClick={() => setActiveFilter('seed')}>Seeds</button>
          </div>
          
          <div className="products-grid" id="stall-inventory-grid">
            {stallProducts.length === 0 ? (
              <div style={{ padding: '40px 0', textAlign: 'center', color: '#888', gridColumn: '1 / -1' }}>
                No items matching this filter category are currently stocked at this stall.
              </div>
            ) : (
              stallProducts.map(prod => (
                <ProductCard key={prod.id} product={prod} />
              ))
            )}
          </div>
        </div>
        
        {/* Right Side: Contact, Hours, Location and Reviews */}
        <div>
          <div className="stall-hours-box" style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '16px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Stall Information</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <svg width="18" height="18" style={{ color: 'var(--primary-green)' }}><use href="#icon-time"></use></svg>
                <div>
                  <strong>Working Hours</strong>
                  <div id="stall-hours-val">{vendor.hours}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <svg width="18" height="18" style={{ color: 'var(--primary-green)' }}><use href="#icon-gps"></use></svg>
                <div>
                  <strong>Stall Location</strong>
                  <div id="stall-address-val">{vendor.address}</div>
                  <a href={vendor.googleMapsUrl} className="view-all" id="stall-maps-link" target="_blank" rel="noreferrer" style={{ marginTop: '6px', fontSize: '13px' }}>View on Google Maps</a>
                </div>
              </div>
            </div>
          </div>
          
          <div className="stall-hours-box">
            <h3 style={{ fontSize: '18px', marginBottom: '16px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Customer Reviews</h3>
            <div id="stall-reviews-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {vendor.reviews && vendor.reviews.map((rev, idx) => (
                <div key={idx} style={{ borderBottom: '1px solid #f4f4f4', paddingBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                    <span>{rev.user}</span>
                    <span style={{ color: 'var(--accent-gold)' }}>{'★'.repeat(Math.round(rev.rating))}</span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#555' }}>"{rev.comment}"</p>
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
