import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import VendorCard from '../components/VendorCard';

export default function NurseriesPage() {
  const { vendors } = useApp();
  const [searchVal, setSearchVal] = useState('');
  const [vendorFilter, setVendorFilter] = useState('all');

  const filteredVendors = vendors.filter(v => {
    // Search query matching
    const matchesSearch = !searchVal || 
      v.name.toLowerCase().includes(searchVal.toLowerCase()) || 
      v.address.toLowerCase().includes(searchVal.toLowerCase()) ||
      v.owner.toLowerCase().includes(searchVal.toLowerCase());

    if (!matchesSearch) return false;

    // Filter pill matching
    if (vendorFilter === 'express') return v.distance.includes('0.') || v.distance.includes('1.');
    if (vendorFilter === 'top') return v.rating >= 4.6;
    if (vendorFilter === 'open') return v.isOpen;
    return true;
  });

  return (
    <div id="view-nurseries" className="page-view active" style={{ paddingBottom: '60px' }}>
      
      {/* Top Banner Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1b4332 0%, #081c15 100%)',
        color: '#fff',
        borderRadius: '20px',
        padding: '36px 32px',
        marginBottom: '32px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 800, color: '#ffb703', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>
          <span>🏪 HYPERLOCAL NURSERY DIRECTORY</span>
        </div>
        <h1 style={{ fontSize: '36px', fontFamily: 'var(--font-serif)', color: '#ffffff', margin: 0 }}>
          All Nearby Plant Nurseries & Stalls
        </h1>
        <p style={{ fontSize: '15px', color: '#d8f3dc', marginTop: '8px', maxWidth: '680px', lineHeight: 1.5 }}>
          Explore physical plant nurseries, roadside plant stalls, and pottery artisans near you. All items delivered fresh & hydrated within 3-5 hours today or available for direct stall pickup.
        </p>

        {/* Search Bar */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '24px', maxWidth: '600px' }}>
          <input 
            type="text" 
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="Search nursery by name, locality, or stall owner..."
            style={{
              flex: 1,
              padding: '12px 18px',
              borderRadius: '12px',
              border: 'none',
              fontSize: '14px',
              outline: 'none',
              color: '#000',
              background: '#ffffff',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
          />
          {searchVal && (
            <button 
              onClick={() => setSearchVal('')}
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: '#fff',
                border: 'none',
                padding: '0 16px',
                borderRadius: '12px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs & Counter */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
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

        <div style={{ fontSize: '13px', color: '#666', fontWeight: 600 }}>
          Showing <strong>{filteredVendors.length}</strong> nursery stalls
        </div>
      </div>

      {/* Grid of All Nursery Stalls */}
      {filteredVendors.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '16px', border: '1px solid #eee' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🏪</div>
          <h3 style={{ fontSize: '18px', margin: 0, color: '#333' }}>No Nursery Stalls Found</h3>
          <p style={{ fontSize: '14px', color: '#777', marginTop: '6px' }}>Try clearing your search query or changing filter settings.</p>
          <button 
            className="btn" 
            style={{ marginTop: '16px', display: 'inline-block' }}
            onClick={() => { setSearchVal(''); setVendorFilter('all'); }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '24px'
        }}>
          {filteredVendors.map((vendor) => (
            <div 
              key={vendor.id}
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                border: '1px solid #eaeaea',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)';
              }}
            >
              <Link to={`/stall/${vendor.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', height: '100%' }}>
                {/* Photo */}
                <div style={{ position: 'relative', width: '100%', height: '160px', background: '#f4f4f4', overflow: 'hidden' }}>
                  <img 
                    src={vendor.photos?.[0] || "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=600&q=80"} 
                    alt={vendor.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(0,0,0,0.75)', color: '#fff', fontSize: '10px', fontWeight: 800, padding: '4px 10px', borderRadius: '12px' }}>
                    🚚 Same-Day (3-5 hrs)
                  </div>
                  <div style={{ position: 'absolute', top: '10px', right: '10px', background: vendor.isOpen ? '#2e7d32' : '#c62828', color: '#fff', fontSize: '10px', fontWeight: 800, padding: '4px 10px', borderRadius: '12px' }}>
                    {vendor.isOpen ? 'OPEN' : 'CLOSED'}
                  </div>
                </div>

                {/* Details */}
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 4px 0', color: '#111' }}>{vendor.name}</h3>
                    <p style={{ fontSize: '12px', color: '#666', margin: '0 0 8px 0' }}>
                      Owner: <strong>{vendor.owner}</strong> • 📍 {vendor.distance}
                    </p>
                    <p style={{ fontSize: '12px', color: '#888', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {vendor.address}
                    </p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #f0f0f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 800, color: '#2e7d32' }}>
                      ⭐ {vendor.rating} <span style={{ color: '#888', fontWeight: 400, fontSize: '11px' }}>({vendor.reviewsCount})</span>
                    </div>

                    <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--primary-green)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      Visit Store →
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
