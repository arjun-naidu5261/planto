import React from 'react';
import { Link } from 'react-router-dom';

export default function VendorCard({ vendor }) {
  return (
    <div className="category-card" style={{ width: '180px', flexShrink: 0 }}>
      <Link to={`/stall/${vendor.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className="category-circle" style={{ width: '140px', height: '140px', borderRadius: 'var(--radius-md)' }}>
          <img src={vendor.photos[0]} alt={vendor.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <span style={{ fontWeight: 700, marginTop: '8px', fontSize: '14px', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden', display: 'block' }}>
          {vendor.name}
        </span>
        <span style={{ fontSize: '12px', color: 'var(--earth-brown)', fontWeight: 600, display: 'block', marginTop: '2px' }}>
          {vendor.distance} • {vendor.rating} ★
        </span>
      </Link>
    </div>
  );
}
