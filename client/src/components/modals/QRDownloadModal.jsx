import React from 'react';
import { useApp } from '../../context/AppContext';

export default function QRDownloadModal() {
  const { showQRDownload, setShowQRDownload, activeVendorId, vendors } = useApp();

  if (!showQRDownload) return null;

  const currentVendor = vendors.find(v => v.id === activeVendorId) || {
    name: "Sai Baba Plant & Pot Stall"
  };

  return (
    <div className="modal-overlay active" id="modal-qr-download" onClick={() => setShowQRDownload(false)}>
      <div className="modal-content" style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
        <button className="close-modal" id="qr-dl-close-btn" onClick={() => setShowQRDownload(false)}>&times;</button>
        <h3 style={{ marginBottom: '12px', textAlign: 'center' }}>Stall Physical QR Card</h3>
        <p style={{ fontSize: '13px', color: '#666', marginBottom: '24px' }}>Print and paste this card at your physical nursery stall. Customer scans this to view live inventory.</p>
        
        <div id="qr-print-card" style={{ background: 'white', border: '1px solid #ccc', padding: '24px', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)', display: 'inline-block' }}>
          <div style={{ fontFamily: 'var(--font-main)', fontWeight: 800, fontSize: '20px', color: 'var(--primary-green)', marginBottom: '6px' }}>PLANTO</div>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#666', marginBottom: '16px' }}>Scan to Shop Live Inventory</div>
          
          <div id="qr-visual-placeholder" style={{ margin: '0 auto 16px', width: '120px', height: '120px', backgroundColor: '#f0f0f0', border: '2px dashed var(--primary-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}>
            <svg width="48" height="48" style={{ color: 'var(--primary-green)' }}><use href="#icon-qrcode"></use></svg>
          </div>
          
          <div style={{ fontSize: '14px', fontWeight: 700 }} id="qr-dl-vendor-name">{currentVendor.name}</div>
          <div style={{ fontSize: '11px', color: '#777' }}>Verified Local Vendor</div>
        </div>
        
        <button className="btn" style={{ marginTop: '24px', width: '100%', justifyContent: 'center' }} onClick={() => window.print()}>
          🖨️ Print Poster
        </button>
      </div>
    </div>
  );
}
