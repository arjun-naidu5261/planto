import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{ backgroundColor: 'var(--glass-bg-dark)', color: 'var(--white)', padding: '56px 24px 24px', marginTop: '56px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', marginBottom: '40px' }}>
        <div>
          <Link to="/" className="logo" style={{ color: 'var(--white)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <img src="/logo.png" alt="PlantMe" style={{ height: '40px', width: 'auto', objectFit: 'contain' }} />
          </Link>
          <p style={{ fontSize: '13px', color: '#aaa', maxWidth: '250px' }}>
            India's premier hyperlocal live plant delivery platform. Moisture-preserving root hydration wraps, verified live plant batch inspection, and 30-day thrive guarantee.
          </p>
        </div>

        <div>
          <h4 style={{ fontSize: '16px', marginBottom: '16px', fontWeight: 700 }}>Features</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', padding: 0 }}>
            <li><Link to="/ai" style={{ color: '#ccc', textDecoration: 'none' }}>AI Plant Doctor</Link></li>
            <li><Link to="/garden" style={{ color: '#ccc', textDecoration: 'none' }}>Virtual Garden & Watering Alerts</Link></li>
            <li><Link to="/community" style={{ color: '#ccc', textDecoration: 'none' }}>Botanical Community</Link></li>
            <li><Link to="/profile" style={{ color: '#ccc', textDecoration: 'none' }}>Green Coins Rewards</Link></li>
          </ul>
        </div>

        <div>
          <h4 style={{ fontSize: '16px', marginBottom: '16px', fontWeight: 700 }}>PlantMe Guarantee</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', padding: 0 }}>
            <li><span style={{ color: '#ccc' }}>30-Day Thrive or Replace</span></li>
            <li><span style={{ color: '#ccc' }}>Eco-Moss Root Hydration Wrap</span></li>
            <li><span style={{ color: '#ccc' }}>Digital Adoption Certificate</span></li>
            <li><span style={{ color: '#ccc' }}>20-30 Min Hyperlocal EV Transit</span></li>
          </ul>
        </div>

        <div>
          <h4 style={{ fontSize: '16px', marginBottom: '16px', fontWeight: 700 }}>Contact & Support</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: '#ccc', padding: 0 }}>
            <li>Email: care@plantme.in</li>
            <li>Plant Care Hotline: +91 80 4455 6677</li>
            <li>WhatsApp Concierge: +91 98856 00899</li>
          </ul>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '24px', textAlign: 'center', fontSize: '12px', color: '#888' }}>
        © 2026 PlantMe Technologies Pvt Ltd. All Rights Reserved. India's #1 Live Plant Delivery Platform.
      </div>
    </footer>
  );
}
