import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export default function InstantReplacementModal() {
  const { showReplacementModal, setShowReplacementModal, replacementOrderData } = useApp();
  const [selectedIssue, setSelectedIssue] = useState('Stem or leaf snapped during courier transit');
  const [description, setDescription] = useState('');
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [trackingId, setTrackingId] = useState('');

  if (!showReplacementModal) return null;

  const orderId = replacementOrderData?.id || 'ORD-9821';
  const plantName = replacementOrderData?.plantName || 'Premium Golden Pothos';

  const issueOptions = [
    'Stem or leaf snapped during courier transit',
    'Severe dehydration / wilting despite hydration wrap',
    'Broken ceramic pot / damaged container',
    'Received wrong plant species or incorrect size'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    const newId = `REP-${Math.floor(1000 + Math.random() * 9000)}`;
    setTrackingId(newId);
    setIsSubmitted(true);
  };

  const handleClose = () => {
    setShowReplacementModal(false);
    setIsSubmitted(false);
    setPhotoUploaded(false);
    setDescription('');
  };

  return (
    <div className="modal-overlay active" onClick={handleClose} style={{ zIndex: 1200 }}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          maxWidth: '500px', 
          width: '92%', 
          borderRadius: '20px', 
          padding: '28px',
          background: '#ffffff',
          position: 'relative',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
        }}
      >
        <button 
          className="close-modal" 
          onClick={handleClose}
          style={{ position: 'absolute', top: '16px', right: '16px', width: '32px', height: '32px', borderRadius: '50%', border: 'none', background: '#f1f5f9', cursor: 'pointer', fontWeight: 800 }}
        >
          &times;
        </button>

        {!isSubmitted ? (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '18px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#166534', background: '#dcfce7', padding: '3px 8px', borderRadius: '10px', textTransform: 'uppercase' }}>
                PLANTME UNBOXING INSURANCE
              </span>
              <h3 style={{ fontSize: '20px', fontFamily: 'var(--font-serif)', margin: '6px 0 2px 0', color: 'var(--dark)' }}>
                1-Click Free Transit Replacement
              </h3>
              <p style={{ fontSize: '12.5px', color: '#64748b', margin: 0 }}>
                Live plants are delicate. If your plant suffered damage in transit, we replace it 100% free with zero arguments.
              </p>
            </div>

            <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '16px', fontSize: '12.5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#334155' }}>
                <span>Order ID: <strong>{orderId}</strong></span>
                <span>Plant: <strong>{plantName}</strong></span>
              </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>Select Transit Issue</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {issueOptions.map((opt, idx) => (
                    <label 
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '9px 12px',
                        borderRadius: '10px',
                        border: selectedIssue === opt ? '1.5px solid var(--primary-green)' : '1px solid #e2e8f0',
                        background: selectedIssue === opt ? '#f0fdf4' : '#ffffff',
                        fontSize: '12.5px',
                        cursor: 'pointer'
                      }}
                    >
                      <input 
                        type="radio" 
                        name="issue" 
                        checked={selectedIssue === opt} 
                        onChange={() => setSelectedIssue(opt)}
                        style={{ accentColor: 'var(--primary-green)' }}
                      />
                      <span style={{ color: '#1e293b', fontWeight: selectedIssue === opt ? 700 : 500 }}>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>Upload Plant Photo (Proof of Damage)</label>
                <div 
                  onClick={() => setPhotoUploaded(true)}
                  style={{
                    border: '2px dashed #cbd5e1',
                    borderRadius: '12px',
                    padding: '16px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: photoUploaded ? '#f0fdf4' : '#fafafa'
                  }}
                >
                  {photoUploaded ? (
                    <div style={{ color: '#166534', fontWeight: 700, fontSize: '12.5px' }}>
                      ✓ Photo attached: leaf_damage_proof.jpg (Verified)
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#334155' }}>Tap to upload or take a quick photo</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>Clear photo of damaged stem, leaves or pot</div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>Additional Note (Optional)</label>
                <input 
                  type="text" 
                  placeholder="e.g. Delivered today at 11 AM, leaf was broken in box"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '12.5px', outline: 'none' }}
                />
              </div>

              <button 
                type="submit" 
                style={{
                  background: 'var(--primary-green)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '12px',
                  fontSize: '13.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  marginTop: '4px'
                }}
              >
                Approve Instant ₹0 Replacement Dispatch →
              </button>
            </form>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#dcfce7', color: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h4 style={{ fontSize: '19px', fontWeight: 800, color: '#1e293b', marginBottom: '6px' }}>
              Replacement Dispatched!
            </h4>
            <div style={{ background: '#f0fdf4', padding: '10px 14px', borderRadius: '10px', display: 'inline-block', border: '1px solid #bbf7d0', marginBottom: '14px' }}>
              <span style={{ fontSize: '12px', color: '#166534', fontWeight: 800 }}>Dispatch ID: {trackingId}</span>
            </div>
            <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5, marginBottom: '18px' }}>
              A hand-inspected, healthy replacement of <strong>{plantName}</strong> has been secured in an upright shock-resistant container and is on its way via PlantMe EV Express (ETA: 20-30 Mins).
            </p>

            <button
              onClick={handleClose}
              style={{
                background: 'var(--primary-green)',
                color: '#ffffff',
                border: 'none',
                padding: '11px 24px',
                borderRadius: '12px',
                fontSize: '13.5px',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              Track Replacement Cargo →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
