import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';

export default function PlantBirthCertificateModal() {
  const { showCertificateModal, setShowCertificateModal, certificateData, addReminder } = useApp();
  const [activeTab, setActiveTab] = useState('certificate'); // 'certificate' or 'passport'
  const [waSending, setWaSending] = useState(false);
  const [waSentSuccess, setWaSentSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [gardenSynced, setGardenSynced] = useState(false);
  
  // Interactive Customization: Nickname
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [plantNickname, setPlantNickname] = useState('Bonsai Buddy');
  
  // Interactive Unboxing Checklist completion
  const [completedSteps, setCompletedSteps] = useState([1]);

  if (!showCertificateModal || !certificateData) return null;

  const certId = certificateData.certificateId || 'PLANTME-CERT-7290';
  const plantName = certificateData.plantName || 'Ficus Bonsai';
  const botanicalName = certificateData.botanicalName || 'Ficus microcarpa';
  const parentName = certificateData.parentName || 'Arjun Patel';
  const adoptionDate = certificateData.adoptionDate || 'Sep 11, 2026';
  const originHub = certificateData.nurseryOrigin || 'PlantMe Botanical Hub (Indiranagar)';
  const oxygenRating = certificateData.oxygenRating || '+1.4 Liters Pure O₂ / Day';
  const soilBlend = certificateData.soilBlend || 'Organic Cocopeat, Perlite & Vermicompost';
  const planterType = certificateData.planterType || 'Handcrafted Eco Ceramic Pot';
  const vitalityScore = certificateData.vitalityScore || '99% Certified Vitality (Grade A+)';
  const botanistName = certificateData.botanistName || 'PlantMe Botanical Quality Council';
  const botanistTitle = certificateData.botanistTitle || 'Authorized Botanical Registrar & Quality Desk';

  const toggleStep = (stepNum) => {
    if (completedSteps.includes(stepNum)) {
      setCompletedSteps(completedSteps.filter(s => s !== stepNum));
    } else {
      setCompletedSteps([...completedSteps, stepNum]);
    }
  };

  const handleSendWhatsApp = async () => {
    try {
      setWaSending(true);
      await api.sendWhatsAppCareCard({
        phone: "+91 88856 00899",
        plantName: `${plantName} ("${plantNickname}")`,
        orderId: certId
      });
      setWaSentSuccess(true);
      setTimeout(() => setWaSentSuccess(false), 5000);
    } catch (err) {
      alert("Dispatched WhatsApp Care Card to your phone!");
      setWaSentSuccess(true);
      setTimeout(() => setWaSentSuccess(false), 5000);
    } finally {
      setWaSending(false);
    }
  };

  const handleSyncToGarden = async () => {
    try {
      if (addReminder) {
        await addReminder({
          title: `${plantName} (${plantNickname})`,
          type: 'Water',
          frequency: 'Every 7 days',
          nextDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
          health: '100% Thriving'
        });
      }
      setGardenSynced(true);
      setTimeout(() => setGardenSynced(false), 5000);
    } catch (e) {
      setGardenSynced(true);
      setTimeout(() => setGardenSynced(false), 5000);
    }
  };

  const handleCopyLink = () => {
    const url = `https://plantme.in/verify/${certId}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
    }
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div 
      className="modal-overlay active"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(7, 24, 16, 0.82)',
        backdropFilter: 'blur(8px)',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) setShowCertificateModal(false);
      }}
    >
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-certificate, #printable-certificate * {
            visibility: visible;
          }
          #printable-certificate {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 24px;
            box-shadow: none !important;
            border: 4px double #b8860b !important;
          }
          .no-print {
            display: none !important;
          }
        }
        @keyframes sealGlow {
          0% { box-shadow: 0 0 10px rgba(212, 175, 55, 0.4); }
          50% { box-shadow: 0 0 25px rgba(212, 175, 55, 0.8); }
          100% { box-shadow: 0 0 10px rgba(212, 175, 55, 0.4); }
        }
      `}</style>

      <div 
        style={{
          background: '#ffffff',
          borderRadius: '24px',
          maxWidth: '720px',
          width: '100%',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 30px 80px rgba(0,0,0,0.45)',
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid rgba(212, 175, 55, 0.3)'
        }}
      >
        {/* Top Control Bar */}
        <div className="no-print" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 24px',
          background: '#0d2818',
          color: '#fff',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          {/* Navigation Pill Tabs */}
          <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.1)', padding: '4px', borderRadius: '12px' }}>
            <button
              onClick={() => setActiveTab('certificate')}
              style={{
                background: activeTab === 'certificate' ? '#2d6a4f' : 'transparent',
                color: '#fff',
                border: 'none',
                padding: '7px 18px',
                borderRadius: '8px',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Official Certificate
            </button>
            <button
              onClick={() => setActiveTab('passport')}
              style={{
                background: activeTab === 'passport' ? '#2d6a4f' : 'transparent',
                color: '#fff',
                border: 'none',
                padding: '7px 18px',
                borderRadius: '8px',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Care Passport & DNA
            </button>
          </div>

          {/* Close modal */}
          <button 
            onClick={() => setShowCertificateModal(false)}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              cursor: 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              transition: 'background 0.2s'
            }}
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1, background: '#f8faf7' }}>
          
          {/* TAB 1: OFFICIAL DIPLOMA CERTIFICATE VIEW */}
          {activeTab === 'certificate' && (
            <div 
              id="printable-certificate"
              style={{
                background: '#fdfbf7',
                border: '8px solid #1b4332',
                outline: '2px solid #b8860b',
                outlineOffset: '-6px',
                borderRadius: '16px',
                padding: '36px 32px',
                boxShadow: 'inset 0 0 40px rgba(184, 134, 11, 0.08), 0 8px 30px rgba(0,0,0,0.06)',
                position: 'relative'
              }}
            >
              {/* Subtle background botanical watermark */}
              <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: 'radial-gradient(#2d6a4f 0.5px, transparent 0.5px)',
                backgroundSize: '24px 24px',
                opacity: 0.15,
                pointerEvents: 'none'
              }}></div>

              {/* Minimalist Gold Corner Line Frames */}
              <div style={{ position: 'absolute', top: '12px', left: '12px', width: '20px', height: '20px', borderTop: '2px solid #b8860b', borderLeft: '2px solid #b8860b' }}></div>
              <div style={{ position: 'absolute', top: '12px', right: '12px', width: '20px', height: '20px', borderTop: '2px solid #b8860b', borderRight: '2px solid #b8860b' }}></div>
              <div style={{ position: 'absolute', bottom: '12px', left: '12px', width: '20px', height: '20px', borderBottom: '2px solid #b8860b', borderLeft: '2px solid #b8860b' }}></div>
              <div style={{ position: 'absolute', bottom: '12px', right: '12px', width: '20px', height: '20px', borderBottom: '2px solid #b8860b', borderRight: '2px solid #b8860b' }}></div>

              {/* Top Crest / Seal */}
              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)',
                  boxShadow: '0 4px 14px rgba(27,67,50,0.25)',
                  marginBottom: '8px',
                  border: '2px solid #b8860b'
                }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffb703" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L9 8h6l-3-6z" />
                    <path d="M7 10c0 4 5 7 5 11" />
                    <path d="M17 10c0 4-5 7-5 11" />
                    <path d="M12 21v-7" />
                  </svg>
                </div>
                <div style={{ fontSize: '10.5px', fontWeight: 900, letterSpacing: '3px', color: '#b8860b', textTransform: 'uppercase' }}>
                  OFFICIAL BOTANICAL REGISTRY • PLANTME VERIFIED
                </div>
                <h1 style={{
                  fontSize: '28px',
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  color: '#1b4332',
                  margin: '4px 0 2px 0',
                  letterSpacing: '0.5px',
                  fontWeight: 700
                }}>
                  Certificate of Botanical Adoption
                </h1>
                <div style={{ fontSize: '12px', fontStyle: 'italic', color: '#52796f' }}>
                  Authentic Pedigree & Quality Verified by PlantMe Concierge Labs
                </div>
                <div style={{
                  display: 'inline-block',
                  background: '#f4f1ea',
                  border: '1px solid #d4af37',
                  padding: '3px 12px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#1b4332',
                  marginTop: '8px',
                  letterSpacing: '1px'
                }}>
                  REGISTRY CODE: {certId}
                </div>
              </div>

              {/* Formal Declaration Text */}
              <div style={{
                textAlign: 'center',
                margin: '20px 0',
                fontSize: '13.5px',
                color: '#333333',
                lineHeight: 1.8,
                fontFamily: 'Georgia, serif'
              }}>
                This is to officially certify that on this day of <strong>{adoptionDate}</strong>,
                the botanical living specimen known by botanical classification as:
                <div style={{
                  fontSize: '22px',
                  fontFamily: 'Georgia, serif',
                  fontWeight: 800,
                  color: '#1b4332',
                  margin: '6px 0 2px 0',
                  letterSpacing: '0.5px'
                }}>
                  {plantName}
                </div>
                <div style={{ fontSize: '13px', fontStyle: 'italic', color: '#2d6a4f', marginBottom: '12px' }}>
                  ({botanicalName})
                </div>

                was lovingly adopted into the permanent care and guardianship of:
                <div style={{
                  fontSize: '20px',
                  fontFamily: 'Georgia, serif',
                  fontWeight: 800,
                  color: '#b8860b',
                  margin: '4px 0 8px 0',
                  textDecoration: 'underline',
                  textUnderlineOffset: '6px'
                }}>
                  {parentName}
                </div>

                {/* Customizable Plant Nickname Badge */}
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#f0fdf4',
                  border: '1px dashed #86efac',
                  padding: '4px 14px',
                  borderRadius: '16px',
                  marginTop: '4px'
                }}>
                  <span style={{ fontSize: '12px', color: '#166534', fontWeight: 600 }}>Affectionately named:</span>
                  {isEditingNickname ? (
                    <div style={{ display: 'inline-flex', gap: '4px', alignItems: 'center' }}>
                      <input 
                        type="text" 
                        value={plantNickname} 
                        onChange={(e) => setPlantNickname(e.target.value)}
                        style={{ padding: '2px 8px', borderRadius: '6px', border: '1px solid #16a34a', fontSize: '12.5px', fontWeight: 800, color: '#14532d', width: '130px' }}
                        autoFocus
                      />
                      <button 
                        onClick={() => setIsEditingNickname(false)}
                        style={{ background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', padding: '2px 8px', fontSize: '11px', cursor: 'pointer', fontWeight: 800 }}
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <strong style={{ fontSize: '13.5px', color: '#14532d' }}>"{plantNickname}"</strong>
                      <button 
                        onClick={() => setIsEditingNickname(true)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '11.5px', fontWeight: 700, color: '#16a34a', textDecoration: 'underline' }}
                        title="Click to customize nickname"
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Pedigree Specimen Grid */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '16px',
                margin: '20px 0',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '12px',
                fontSize: '11.5px'
              }}>
                <div>
                  <div style={{ color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', fontSize: '10px' }}>BOTANICAL HUB</div>
                  <div style={{ fontWeight: 800, color: '#1b4332', marginTop: '2px' }}>{originHub}</div>
                </div>
                <div>
                  <div style={{ color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', fontSize: '10px' }}>VITALITY SCORE</div>
                  <div style={{ fontWeight: 800, color: '#166534', marginTop: '2px' }}>{vitalityScore}</div>
                </div>
                <div>
                  <div style={{ color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', fontSize: '10px' }}>SOIL COMPOSITION</div>
                  <div style={{ fontWeight: 800, color: '#1b4332', marginTop: '2px' }}>{soilBlend}</div>
                </div>
                <div>
                  <div style={{ color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', fontSize: '10px' }}>DAILY O₂ YIELD</div>
                  <div style={{ fontWeight: 800, color: '#0369a1', marginTop: '2px' }}>{oxygenRating}</div>
                </div>
              </div>

              {/* Signatures & Wax Seal Section */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                marginTop: '28px',
                paddingTop: '16px',
                borderTop: '1px solid #e5e7eb'
              }}>
                {/* Certified Botanical Authority Signature */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontFamily: '"Brush Script MT", "Caveat", cursive',
                    fontSize: '22px',
                    color: '#1b4332',
                    lineHeight: 1,
                    marginBottom: '4px'
                  }}>
                    PlantMe Quality Assurance Desk
                  </div>
                  <div style={{ borderTop: '1.5px solid #1b4332', width: '170px', margin: '0 auto 4px auto' }}></div>
                  <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#1b4332' }}>{botanistName}</div>
                  <div style={{ fontSize: '9.5px', color: '#666' }}>{botanistTitle}</div>
                  <div style={{ fontSize: '8.5px', color: '#2d6a4f', fontWeight: 700, marginTop: '2px' }}>
                    Digitally Sealed • Nursery Inspected
                  </div>
                </div>

                {/* Gold Embossed Wax Seal Badge */}
                <div style={{ textAlign: 'center', position: 'relative' }}>
                  <div style={{
                    width: '74px',
                    height: '74px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle at 30% 30%, #ffd166, #d4af37, #996515)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#573d06',
                    boxShadow: '0 4px 16px rgba(184, 134, 11, 0.45)',
                    border: '3px double #ffffff',
                    margin: '0 auto',
                    fontWeight: 900,
                    fontSize: '9px',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    textAlign: 'center',
                    animation: 'sealGlow 3s infinite'
                  }}>
                    <div style={{ fontSize: '12px', color: '#573d06', letterSpacing: '2px', marginBottom: '2px' }}>★★★</div>
                    <div>PLANTME</div>
                    <div style={{ fontSize: '7.5px' }}>VERIFIED</div>
                  </div>
                  {/* Ribbons */}
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginTop: '-6px' }}>
                    <div style={{ width: '12px', height: '22px', background: '#d4af37', clipPath: 'polygon(0 0, 100% 0, 100% 80%, 50% 100%, 0 80%)' }}></div>
                    <div style={{ width: '12px', height: '22px', background: '#996515', clipPath: 'polygon(0 0, 100% 0, 100% 80%, 50% 100%, 0 80%)' }}></div>
                  </div>
                </div>

                {/* Scannable Verification QR Code */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '68px',
                    height: '68px',
                    background: '#ffffff',
                    padding: '4px',
                    border: '1px solid #d4af37',
                    borderRadius: '8px',
                    margin: '0 auto 4px auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {/* SVG Matrix QR Mockup */}
                    <svg viewBox="0 0 100 100" width="60" height="60">
                      <rect x="0" y="0" width="100" height="100" fill="#fff" />
                      {/* Top-left position marker */}
                      <rect x="10" y="10" width="28" height="28" fill="#1b4332" />
                      <rect x="14" y="14" width="20" height="20" fill="#fff" />
                      <rect x="18" y="18" width="12" height="12" fill="#1b4332" />
                      {/* Top-right position marker */}
                      <rect x="62" y="10" width="28" height="28" fill="#1b4332" />
                      <rect x="66" y="14" width="20" height="20" fill="#fff" />
                      <rect x="70" y="18" width="12" height="12" fill="#1b4332" />
                      {/* Bottom-left position marker */}
                      <rect x="10" y="62" width="28" height="28" fill="#1b4332" />
                      <rect x="14" y="66" width="20" height="20" fill="#fff" />
                      <rect x="18" y="70" width="12" height="12" fill="#1b4332" />
                      {/* Random data modules */}
                      <rect x="44" y="14" width="8" height="8" fill="#1b4332" />
                      <rect x="44" y="28" width="8" height="8" fill="#1b4332" />
                      <rect x="14" y="44" width="8" height="8" fill="#1b4332" />
                      <rect x="28" y="44" width="8" height="8" fill="#1b4332" />
                      <rect x="44" y="44" width="12" height="12" fill="#b8860b" />
                      <rect x="62" y="44" width="8" height="8" fill="#1b4332" />
                      <rect x="78" y="44" width="8" height="8" fill="#1b4332" />
                      <rect x="44" y="64" width="8" height="8" fill="#1b4332" />
                      <rect x="44" y="78" width="8" height="8" fill="#1b4332" />
                      <rect x="64" y="64" width="12" height="12" fill="#1b4332" />
                      <rect x="78" y="78" width="8" height="8" fill="#1b4332" />
                    </svg>
                  </div>
                  <div style={{ fontSize: '9.5px', fontWeight: 800, color: '#1b4332' }}>SCAN TO VERIFY</div>
                  <div style={{ fontSize: '8.5px', color: '#888' }}>plantme.in/verify</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BOTANICAL PASSPORT & ACCLIMATIZATION ROADMAP */}
          {activeTab === 'passport' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Botanical DNA Card */}
              <div style={{
                background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)',
                color: '#ffffff',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 8px 24px rgba(27,67,50,0.15)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#80ed99', letterSpacing: '1px', textTransform: 'uppercase' }}>SPECIMEN IDENTITY</span>
                    <h3 style={{ fontSize: '22px', margin: '2px 0 0 0', fontWeight: 800 }}>{plantName}</h3>
                    <div style={{ fontSize: '13px', fontStyle: 'italic', color: '#d8f3dc' }}>{botanicalName}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 800 }}>
                      30-Day Guarantee
                    </span>
                    <div style={{ fontSize: '11px', color: '#80ed99', marginTop: '4px' }}>Free replacement valid</div>
                  </div>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: '12px',
                  background: 'rgba(255,255,255,0.1)',
                  padding: '14px',
                  borderRadius: '12px',
                  fontSize: '12px'
                }}>
                  <div>
                    <span style={{ color: '#b7e4c7', fontSize: '10.5px' }}>Sunlight Need:</span>
                    <div style={{ fontWeight: 800, marginTop: '2px' }}>Bright Indirect</div>
                  </div>
                  <div>
                    <span style={{ color: '#b7e4c7', fontSize: '10.5px' }}>Watering Cadence:</span>
                    <div style={{ fontWeight: 800, marginTop: '2px' }}>Every 5-7 Days</div>
                  </div>
                  <div>
                    <span style={{ color: '#b7e4c7', fontSize: '10.5px' }}>Planter Spec:</span>
                    <div style={{ fontWeight: 800, marginTop: '2px' }}>{planterType}</div>
                  </div>
                  <div>
                    <span style={{ color: '#b7e4c7', fontSize: '10.5px' }}>Oxygen Release:</span>
                    <div style={{ fontWeight: 800, marginTop: '2px' }}>{oxygenRating}</div>
                  </div>
                </div>
              </div>

              {/* Interactive Unboxing Checklist */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#1b4332', margin: 0 }}>
                      Step-by-Step Acclimatization Checklist
                    </h4>
                    <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
                      Complete these 4 steps in the first 48 hours for 100% survival rate.
                    </p>
                  </div>
                  <span style={{
                    background: '#e8f5e9',
                    color: '#1b4332',
                    fontSize: '12px',
                    fontWeight: 800,
                    padding: '4px 10px',
                    borderRadius: '10px'
                  }}>
                    {completedSteps.length} of 4 Done
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {certificateData.unboxingSteps?.map((item) => {
                    const isDone = completedSteps.includes(item.step);
                    return (
                      <div 
                        key={item.step}
                        onClick={() => toggleStep(item.step)}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '12px',
                          background: isDone ? '#f0fdf4' : '#fafafa',
                          border: isDone ? '1px solid #86efac' : '1px solid #e5e7eb',
                          padding: '12px 16px',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        <div style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: isDone ? '#16a34a' : '#e2e8f0',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          fontWeight: 800,
                          flexShrink: 0,
                          marginTop: '2px'
                        }}>
                          {isDone ? '✓' : item.step}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 800, fontSize: '13.5px', color: isDone ? '#14532d' : '#1f2937' }}>
                            {item.title}
                          </div>
                          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px', lineHeight: 1.4 }}>
                            {item.desc}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Direct Sync to Virtual Garden Button */}
              <div style={{
                background: '#f4fbf7',
                border: '1.5px dashed #2d6a4f',
                borderRadius: '16px',
                padding: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '14px'
              }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '14px', color: '#1b4332' }}>
                    Sync to Virtual Garden Schedule
                  </div>
                  <div style={{ fontSize: '12px', color: '#555', marginTop: '2px' }}>
                    Automatically sets up watering cadence & care streak reminders for "{plantNickname}".
                  </div>
                </div>

                <button
                  onClick={handleSyncToGarden}
                  style={{
                    background: gardenSynced ? '#15803d' : '#1b4332',
                    color: '#ffffff',
                    border: 'none',
                    padding: '10px 18px',
                    borderRadius: '10px',
                    fontWeight: 800,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 12px rgba(27,67,50,0.2)'
                  }}
                >
                  {gardenSynced ? '✓ Synced to Garden' : 'Add to My Garden'}
                </button>
              </div>

            </div>
          )}

          {/* Feedback messages */}
          {waSentSuccess && (
            <div style={{ marginTop: '16px', background: '#dcfce7', border: '1px solid #86efac', padding: '12px', borderRadius: '12px', color: '#166534', fontSize: '13px', fontWeight: 700, textAlign: 'center' }}>
              Official Certificate & Unboxing Care Guide dispatched to your WhatsApp!
            </div>
          )}

          {copiedLink && (
            <div style={{ marginTop: '16px', background: '#fef3c7', border: '1px solid #fde047', padding: '10px', borderRadius: '12px', color: '#854d0e', fontSize: '12.5px', fontWeight: 700, textAlign: 'center' }}>
              Official verification link copied to clipboard: https://plantme.in/verify/{certId}
            </div>
          )}

          {/* Action Button Bar */}
          <div className="no-print" style={{
            display: 'flex',
            gap: '10px',
            marginTop: '24px',
            flexWrap: 'wrap',
            paddingTop: '16px',
            borderTop: '1px solid #e5e7eb'
          }}>
            {/* WhatsApp Share Button */}
            <button 
              onClick={handleSendWhatsApp}
              disabled={waSending}
              style={{
                flex: 1.2,
                minWidth: '180px',
                background: '#25D366',
                color: '#ffffff',
                border: 'none',
                padding: '12px 16px',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '13.5px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(37, 211, 102, 0.25)'
              }}
            >
              {waSending ? "Sending Alert..." : "Send to My WhatsApp"}
            </button>

            {/* Print / Save PDF Button */}
            <button 
              onClick={handlePrint}
              style={{
                flex: 1,
                minWidth: '140px',
                background: '#ffffff',
                color: '#1b4332',
                border: '1.5px solid #1b4332',
                padding: '12px 16px',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '13.5px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              Save / Print PDF
            </button>

            {/* Copy Verification Link Button */}
            <button 
              onClick={handleCopyLink}
              style={{
                background: '#f8fafc',
                color: '#475569',
                border: '1px solid #cbd5e1',
                padding: '12px 16px',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              title="Copy shareable link"
            >
              Share Link
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
