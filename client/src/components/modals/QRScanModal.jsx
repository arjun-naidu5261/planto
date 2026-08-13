import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

export default function QRScanModal() {
  const { showQRScanner, setShowQRScanner } = useApp();
  const navigate = useNavigate();

  if (!showQRScanner) return null;

  const handleScan = (vendorId) => {
    setShowQRScanner(false);
    navigate(`/stall/${vendorId}`);
    alert("QR code scanned successfully! Opening local vendor profile.");
  };

  return (
    <div className="modal-overlay active" id="modal-qr-scanner" onClick={() => setShowQRScanner(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-modal" id="qr-close-btn" onClick={() => setShowQRScanner(false)}>&times;</button>
        <h3 style={{ marginBottom: '12px', textAlign: 'center' }}>Scan Stall QR Code</h3>
        <p style={{ fontSize: '13px', color: '#666', textAlign: 'center', marginBottom: '24px' }}>
          Simulating camera barcode lens. Select a physical roadside stall from the mock code options below to view its live stock profile instantly.
        </p>

        <div style={{ backgroundColor: '#fafafa', border: '2px dashed #ccc', borderRadius: 'var(--radius-sm)', padding: '30px', display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center' }}>
          <svg width="44" height="44" style={{ color: 'var(--primary-green)', animation: 'pulse-soft 2s infinite' }}><use href="#icon-qrcode"></use></svg>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#888' }}>SELECT QR TO SCAN:</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
            <button className="btn btn-secondary qr-mock-trigger-btn" onClick={() => handleScan('v1')} style={{ justifyContent: 'center' }}>Scan Suresh Rao's Pot Stall QR</button>
            <button className="btn btn-secondary qr-mock-trigger-btn" onClick={() => handleScan('v2')} style={{ justifyContent: 'center' }}>Scan Ramesh Kumar's Nursery QR</button>
            <button className="btn btn-secondary qr-mock-trigger-btn" onClick={() => handleScan('v4')} style={{ justifyContent: 'center' }}>Scan Siri Gowda's Indoor Stall QR</button>
          </div>
        </div>
      </div>
    </div>
  );
}
