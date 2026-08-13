import React from 'react';
import { Link } from 'react-router-dom';

export default function VendorCard({ vendor }) {
  const photo = vendor.photos?.[0] || "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=600&q=80";

  return (
    <div style={{
      width: '230px',
      flexShrink: 0,
      background: '#ffffff',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
      border: '1px solid #eaeaea',
      display: 'flex',
      flexDirection: 'column',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease'
    }}>
      <Link to={`/stall/${vendor.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Image Container with strict height and overflow hidden */}
        <div style={{ position: 'relative', width: '100%', height: '140px', background: '#f4f4f4', overflow: 'hidden' }}>
          <img 
            src={photo} 
            alt={vendor.name} 
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=600&q=80";
            }}
          />
          
          {/* Same-Day Delivery Badge */}
          <div style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(0,0,0,0.75)', color: '#fff', fontSize: '10px', fontWeight: 800, padding: '3px 8px', borderRadius: '12px' }}>
            🚚 Same-Day (3-5 hrs)
          </div>

          {/* Open Status */}
          <div style={{ position: 'absolute', top: '8px', right: '8px', background: vendor.isOpen ? '#2e7d32' : '#c62828', color: '#fff', fontSize: '10px', fontWeight: 800, padding: '3px 8px', borderRadius: '12px' }}>
            {vendor.isOpen ? 'OPEN' : 'CLOSED'}
          </div>
        </div>

        {/* Text Details Box */}
        <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
          <div>
            <h4 style={{ 
              fontSize: '14px', 
              fontWeight: 800, 
              color: '#1b1b1b', 
              margin: '0 0 4px 0',
              lineHeight: '1.3',
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              {vendor.name}
            </h4>

            <div style={{ fontSize: '11px', color: '#666', fontWeight: 600 }}>
              {vendor.type || 'Verified Nursery'} • 📍 {vendor.distance}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #f0f0f0' }}>
            <span style={{ background: '#fff8e1', color: '#b78103', fontSize: '11px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>
              ★ {vendor.rating} ({vendor.reviewsCount})
            </span>
            <span style={{ fontSize: '11px', color: 'var(--primary-green)', fontWeight: 800 }}>
              View Store →
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
