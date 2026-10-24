import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

export default function QRScanModal() {
  const { showQRScanner, setShowQRScanner } = useApp();
  const navigate = useNavigate();

  if (!showQRScanner) return null;

  const handleScan = (productId) => {
    setShowQRScanner(false);
    navigate(`/product/${productId}`);
  };

  return (
    <div className="modal-overlay active" id="modal-qr-scanner" onClick={() => setShowQRScanner(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-modal" id="qr-close-btn" onClick={() => setShowQRScanner(false)}>&times;</button>
        <h3 style={{ marginBottom: '12px', textAlign: 'center' }}>Scan Plant Tag / Pot Passport QR</h3>
        <p style={{ fontSize: '13px', color: '#666', textAlign: 'center', marginBottom: '24px' }}>
          Scan the QR tag affixed to your plant pot or delivery crate to view botanical care instructions, watering intervals, and 30-day health passport.
        </p>

        <div style={{ backgroundColor: '#fafafa', border: '2px dashed #ccc', borderRadius: 'var(--radius-sm)', padding: '30px', display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center' }}>
          <svg width="44" height="44" style={{ color: 'var(--primary-green)', animation: 'pulse-soft 2s infinite' }}><use href="#icon-qrcode"></use></svg>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#888' }}>SELECT PLANT PASSPORT TO SCAN:</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
            <button className="btn btn-secondary qr-mock-trigger-btn" onClick={() => handleScan('p1')} style={{ justifyContent: 'center' }}>🪴 Scan Monstera Deliciosa Passport QR</button>
            <button className="btn btn-secondary qr-mock-trigger-btn" onClick={() => handleScan('p2')} style={{ justifyContent: 'center' }}>🌿 Scan Fiddle Leaf Fig Passport QR</button>
            <button className="btn btn-secondary qr-mock-trigger-btn" onClick={() => handleScan('p3')} style={{ justifyContent: 'center' }}>🌱 Scan Snake Plant Passport QR</button>
          </div>
        </div>
      </div>
    </div>
  );
}
