import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{ backgroundColor: 'var(--glass-bg-dark)', color: 'var(--white)', padding: '56px 24px 24px', marginTop: '56px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', marginBottom: '40px' }}>
        <div>
          <Link to="/" className="logo" style={{ color: 'var(--white)', marginBottom: '16px' }}>
            <svg className="logo-leaf"><use href="#icon-leaf"></use></svg>
            PLANTO
          </Link>
          <p style={{ fontSize: '13px', color: '#aaa', maxWidth: '250px' }}>
            India's smart botanical marketplace. Connecting roadside stalls and green nurseries directly to eco-conscious consumers.
          </p>
        </div>

        <div>
          <h4 style={{ fontSize: '16px', marginBottom: '16px', fontWeight: 700 }}>Join Ecosystem</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', padding: 0 }}>
            <li><Link to="/vendor" style={{ color: '#ccc', textDecoration: 'none' }}>Become a Seller</Link></li>
            <li><Link to="/vendor" style={{ color: '#ccc', textDecoration: 'none' }}>Stall QR Registration</Link></li>
            <li><Link to="/admin" style={{ color: '#ccc', textDecoration: 'none' }}>Partner Nurseries</Link></li>
          </ul>
        </div>

        <div>
          <h4 style={{ fontSize: '16px', marginBottom: '16px', fontWeight: 700 }}>Policies</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', padding: 0 }}>
            <li><a href="#" style={{ color: '#ccc', textDecoration: 'none' }}>Privacy Policy</a></li>
            <li><a href="#" style={{ color: '#ccc', textDecoration: 'none' }}>Terms of Use</a></li>
            <li><a href="#" style={{ color: '#ccc', textDecoration: 'none' }}>Stall QR Policy</a></li>
          </ul>
        </div>

        <div>
          <h4 style={{ fontSize: '16px', marginBottom: '16px', fontWeight: 700 }}>Contact & Support</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: '#ccc', padding: 0 }}>
            <li>Email: hello@planto.in</li>
            <li>Support Hotline: +91 80 4455 6677</li>
            <li>WhatsApp Stall Concierge: +91 99009 90099</li>
          </ul>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '24px', textAlign: 'center', fontSize: '12px', color: '#888' }}>
        © 2026 PLANTO technologies Pvt Ltd. All Rights Reserved. Built for Local Nurseries.
      </div>
    </footer>
  );
}
