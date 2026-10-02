import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

export default function CorporateGiftingPage() {
  const { addToCart } = useApp();
  
  // Active Page Tab: 'retainers' (Monthly Workplace Care) or 'gifting' (Bulk Desk Plants)
  const [activeTab, setActiveTab] = useState('retainers');

  // --- TAB 1: CORPORATE MONTHLY CARE RETAINERS STATES ---
  const [selectedRetainerTier, setSelectedRetainerTier] = useState('tech_floor');
  const [corpCompanyName, setCorpCompanyName] = useState('TechCorp Bangalore');
  const [corpContactPerson, setCorpContactPerson] = useState('Divya Sharma');
  const [corpEmail, setCorpEmail] = useState('facilities@techcorp.in');
  const [corpPhone, setCorpPhone] = useState('+91 98450 12345');
  const [corpOfficeCity, setCorpOfficeCity] = useState('Bengaluru');
  const [corpOfficeAddress, setCorpOfficeAddress] = useState('Tower 3, RMZ Ecoworld, Bellandur, Bengaluru');
  const [corpDeskCount, setCorpDeskCount] = useState(75);
  const [corpNotes, setCorpNotes] = useState('Want weekly plant maintenance and 2 reception Ficus statement trees.');
  const [retainerQuoteSent, setRetainerQuoteSent] = useState(false);
  const [retainerQuoteId, setRetainerQuoteId] = useState('');
  const [isSubmittingRetainer, setIsSubmittingRetainer] = useState(false);

  // --- TAB 2: BULK DESK PLANT GIFTING STATES ---
  const [companyName, setCompanyName] = useState('TechCorp Bangalore');
  const [selectedPlant, setSelectedPlant] = useState('ZZ Fortune Plant in Matte White Ceramic');
  const [quantity, setQuantity] = useState(25);
  const [customTagMessage, setCustomTagMessage] = useState('Welcome to the Green Team! 🌿');
  const [includeGiftBox, setIncludeGiftBox] = useState(true);
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);

  const basePricePerPlant = 399;
  const discountRate = quantity >= 200 ? 0.35 : quantity >= 50 ? 0.25 : quantity >= 10 ? 0.15 : 0;
  const discountedPricePerPlant = Math.round(basePricePerPlant * (1 - discountRate));
  const giftBoxPrice = includeGiftBox ? 49 : 0;
  const totalPerUnit = discountedPricePerPlant + giftBoxPrice;
  const grandTotal = totalPerUnit * quantity;

  const plants = [
    { name: 'ZZ Fortune Plant in Matte White Ceramic', desc: 'Virtually indestructible, thrives in AC tech offices', img: 'https://images.unsplash.com/photo-1632207691143-643e2a9a9361?auto=format&fit=crop&w=400&q=80' },
    { name: 'Sansevieria Golden Hahnii (Snake Plant)', desc: 'NASA certified #1 desk air purifier', img: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=400&q=80' },
    { name: 'Money Plant Golden Pothos in Hydro Ceramic', desc: 'Moisture preserving root wrap, low light tolerant', img: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=400&q=80' },
    { name: 'Mini Jade Crassula in Wooden Stand Pot', desc: 'Symbol of prosperity, wealth & long-term growth', img: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?auto=format&fit=crop&w=400&q=80' }
  ];

  const retainerTiers = [
    {
      id: 'startup',
      name: 'Startup Green Desk',
      price: 2499,
      subtitle: 'Up to 20 office desk & cabin plants',
      cadence: 'Fortnightly visits (2 visits/mo)',
      icon: '🪴',
      features: [
        'Routine watering, pruning & leaf shine polish',
        '100% Free wilt replacement within 24 hours',
        'Organic pest prevention treatment',
        'Quarterly fresh soil & slow-release nutrition'
      ]
    },
    {
      id: 'tech_floor',
      name: 'Tech Floor Oasis',
      price: 6999,
      popular: true,
      subtitle: 'Up to 60 plants + 4 reception trees',
      cadence: 'Weekly visits (4 visits/mo)',
      icon: '🏢',
      features: [
        'Dedicated uniformed certified botanist',
        'Immediate 4-hour plant swap guarantee',
        'Seasonal flower & foliage rotation included',
        'Monthly Indoor Air Quality (AQI) Certificate'
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise HQ Canopy',
      price: 14999,
      subtitle: 'Multi-floor campus & living green walls',
      cadence: 'Twice-weekly visits (8 visits/mo)',
      icon: '🌴',
      features: [
        'Unlimited office & executive boardroom plants',
        'Automated telemetry & sub-irrigation servicing',
        'Custom architectural planters with company logo',
        'Quarterly green team workshop for employees'
      ]
    }
  ];

  const currentRetainer = retainerTiers.find(t => t.id === selectedRetainerTier) || retainerTiers[1];

  const handleRetainerSubmit = async (e) => {
    e.preventDefault();
    if (!corpCompanyName || !corpEmail || !corpPhone) {
      alert("Please provide your company name, email, and contact phone.");
      return;
    }

    setIsSubmittingRetainer(true);
    try {
      const res = await api.submitCorporateRetainerQuote({
        companyName: corpCompanyName,
        contactPerson: corpContactPerson,
        email: corpEmail,
        phone: corpPhone,
        officeCity: corpOfficeCity,
        officeAddress: corpOfficeAddress,
        deskCount: corpDeskCount,
        tier: selectedRetainerTier,
        tierTitle: currentRetainer.name,
        estimatedMonthlyPrice: currentRetainer.price,
        notes: corpNotes
      });

      if (res.success) {
        setRetainerQuoteSent(true);
        setRetainerQuoteId(res.quote.quoteId);
      } else {
        alert(res.message || "Failed to submit retainer quotation.");
      }
    } catch (err) {
      alert(err.message || "Failed to submit retainer quotation.");
    } finally {
      setIsSubmittingRetainer(false);
    }
  };

  const handleOrderDirect = () => {
    addToCart({
      id: `corp-${Date.now()}`,
      name: `Corporate Bulk Order: ${selectedPlant} (${quantity} units)`,
      price: grandTotal,
      originalPrice: (basePricePerPlant + 49) * quantity,
      category: 'Corporate Gifting',
      images: [plants.find(p => p.name === selectedPlant)?.img || plants[0].img],
      rating: 5.0,
      reviewsCount: 42,
      quantity: 1
    }, 1);
    window.location.hash = "#/cart";
  };

  return (
    <div className="page-view active" style={{ display: 'block', maxWidth: '1140px', margin: '0 auto', padding: '20px 16px 60px' }}>
      
      {/* Hero Header */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary-green)', background: '#dcfce7', padding: '4px 14px', borderRadius: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>
          PLANTME ENTERPRISE & WORKPLACE SOLUTIONS
        </span>
        <h1 style={{ fontSize: '34px', fontFamily: 'var(--font-serif)', color: '#14532d', margin: '10px 0 8px 0' }}>
          Workplace Greenery Retainers & Corporate Gifting
        </h1>
        <p style={{ fontSize: '15px', color: '#475569', maxWidth: '720px', margin: '0 auto' }}>
          Turn dull offices into vibrant, oxygen-rich biophilic workspaces. We maintain, water, and guarantee 100% healthy plants for India's leading tech teams.
        </p>
      </div>

      {/* Main Mode Navigation Tabs */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '32px' }}>
        <button
          onClick={() => setActiveTab('retainers')}
          style={{
            padding: '12px 24px',
            borderRadius: '14px',
            border: activeTab === 'retainers' ? '2px solid var(--primary-green)' : '1px solid #cbd5e1',
            background: activeTab === 'retainers' ? '#14532d' : '#ffffff',
            color: activeTab === 'retainers' ? '#ffffff' : '#334155',
            fontWeight: 800,
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: activeTab === 'retainers' ? '0 4px 14px rgba(20,83,45,0.2)' : 'none'
          }}
        >
          <span>🏢</span> Monthly Office Plant Care Retainers
        </button>

        <button
          onClick={() => setActiveTab('gifting')}
          style={{
            padding: '12px 24px',
            borderRadius: '14px',
            border: activeTab === 'gifting' ? '2px solid var(--primary-green)' : '1px solid #cbd5e1',
            background: activeTab === 'gifting' ? '#14532d' : '#ffffff',
            color: activeTab === 'gifting' ? '#ffffff' : '#334155',
            fontWeight: 800,
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: activeTab === 'gifting' ? '0 4px 14px rgba(20,83,45,0.2)' : 'none'
          }}
        >
          <span>🎁</span> Branded Desk Plants & Welcome Swag
        </button>
      </div>

      {/* TAB 1: MONTHLY CARE RETAINERS */}
      {activeTab === 'retainers' && (
        <div>
          {/* Retainer Tiers Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '36px' }}>
            {retainerTiers.map(t => (
              <div
                key={t.id}
                onClick={() => setSelectedRetainerTier(t.id)}
                style={{
                  background: '#ffffff',
                  borderRadius: '20px',
                  border: selectedRetainerTier === t.id ? '2.5px solid var(--primary-green)' : '1px solid #e2e8f0',
                  boxShadow: selectedRetainerTier === t.id ? '0 10px 30px rgba(22,101,52,0.12)' : '0 2px 10px rgba(0,0,0,0.03)',
                  padding: '24px',
                  cursor: 'pointer',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s'
                }}
              >
                {t.popular && (
                  <span style={{ position: 'absolute', top: '-10px', right: '20px', background: 'var(--primary-green)', color: '#ffffff', fontSize: '10.5px', fontWeight: 800, padding: '3px 10px', borderRadius: '10px' }}>
                    MOST POPULAR FOR TECH OFFICES
                  </span>
                )}
                
                <div>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>{t.icon}</div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: '0 0 4px 0' }}>{t.name}</h3>
                  <div style={{ fontSize: '12.5px', color: '#64748b', marginBottom: '14px' }}>{t.subtitle}</div>
                  
                  <div style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: 700, color: '#166534', marginBottom: '16px' }}>
                    🗓️ Cadence: {t.cadence}
                  </div>

                  <ul style={{ paddingLeft: '16px', margin: '0 0 16px 0', fontSize: '12.5px', color: '#475569', lineHeight: 1.6 }}>
                    {t.features.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div>
                    <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary-green)' }}>₹{t.price.toLocaleString()}</span>
                    <span style={{ fontSize: '12px', color: '#64748b' }}> / month</span>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: selectedRetainerTier === t.id ? 'var(--primary-green)' : '#94a3b8' }}>
                    {selectedRetainerTier === t.id ? '✓ Selected' : 'Select Plan'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Form & Audit Section */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '24px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
            <div style={{ maxWidth: '780px', margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <span style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '11px', fontWeight: 800, padding: '3px 10px', borderRadius: '10px', textTransform: 'uppercase' }}>
                  FREE ONSITE BIO-AUDIT INCLUDED
                </span>
                <h3 style={{ fontSize: '24px', fontFamily: 'var(--font-serif)', color: '#14532d', margin: '8px 0 4px 0' }}>
                  Request Corporate Retainer Quotation & Free Site Audit
                </h3>
                <p style={{ fontSize: '13.5px', color: '#64748b' }}>
                  Our senior horticulture lead will inspect your floor layout, measure sunlight levels & provide a zero-obligation proposal within 4 hours.
                </p>
              </div>

              {retainerQuoteSent ? (
                <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '18px', padding: '24px', textAlign: 'center' }}>
                  <div style={{ fontSize: '40px', marginBottom: '8px' }}>📋</div>
                  <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#166534', margin: '0 0 6px 0' }}>
                    Retainer Proposal #{retainerQuoteId} Dispatched!
                  </h4>
                  <p style={{ fontSize: '13.5px', color: '#334155', maxWidth: '520px', margin: '0 auto 16px', lineHeight: 1.5 }}>
                    We have emailed the official quote for <strong>{currentRetainer.name}</strong> to <strong>{corpEmail}</strong>. Our B2B Horticulture Consultant will reach out to <strong>{corpPhone}</strong> to schedule the site audit.
                  </p>
                  <button
                    onClick={() => setRetainerQuoteSent(false)}
                    style={{ background: 'var(--primary-green)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: 800, fontSize: '13px', cursor: 'pointer' }}
                  >
                    Submit Another Inquiry →
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRetainerSubmit}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '18px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>COMPANY / ORGANIZATION NAME</label>
                      <input
                        type="text"
                        value={corpCompanyName}
                        onChange={(e) => setCorpCompanyName(e.target.value)}
                        placeholder="e.g. Swiggy Bengaluru HQ"
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>CONTACT PERSON & DESIGNATION</label>
                      <input
                        type="text"
                        value={corpContactPerson}
                        onChange={(e) => setCorpContactPerson(e.target.value)}
                        placeholder="e.g. Divya Sharma (Admin Lead)"
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>OFFICIAL EMAIL</label>
                      <input
                        type="email"
                        value={corpEmail}
                        onChange={(e) => setCorpEmail(e.target.value)}
                        placeholder="e.g. facilities@company.com"
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>CONTACT PHONE</label>
                      <input
                        type="tel"
                        value={corpPhone}
                        onChange={(e) => setCorpPhone(e.target.value)}
                        placeholder="e.g. +91 98450 12345"
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>APPROX. OFFICE DESKS</label>
                      <input
                        type="number"
                        min="5"
                        max="5000"
                        value={corpDeskCount}
                        onChange={(e) => setCorpDeskCount(Number(e.target.value))}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>OFFICE CITY</label>
                      <select
                        value={corpOfficeCity}
                        onChange={(e) => setCorpOfficeCity(e.target.value)}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                      >
                        <option value="Bengaluru">Bengaluru</option>
                        <option value="Hyderabad">Hyderabad</option>
                        <option value="Mumbai">Mumbai</option>
                        <option value="Delhi NCR">Delhi NCR</option>
                        <option value="Pune">Pune</option>
                      </select>
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>OFFICE TECH PARK / BUILDING ADDRESS</label>
                      <input
                        type="text"
                        value={corpOfficeAddress}
                        onChange={(e) => setCorpOfficeAddress(e.target.value)}
                        placeholder="e.g. 5th Floor, Tower 2, RMZ Infinity, Old Madras Road, Bengaluru"
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                      />
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>CUSTOM REQUIREMENTS OR NOTES (OPTIONAL)</label>
                      <input
                        type="text"
                        value={corpNotes}
                        onChange={(e) => setCorpNotes(e.target.value)}
                        placeholder="e.g. Boardroom bonsai, moss wall in lobby, weekly watering visits..."
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                      />
                    </div>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '16px 20px', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>SELECTED RETAINER TIER</div>
                      <div style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b' }}>{currentRetainer.name}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>MONTHLY RETAINER ESTIMATE</div>
                      <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--primary-green)' }}>₹{currentRetainer.price.toLocaleString()} <span style={{ fontSize: '12px', color: '#64748b' }}>+ GST</span></div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingRetainer}
                    style={{
                      width: '100%',
                      background: 'var(--primary-green)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '14px',
                      borderRadius: '12px',
                      fontSize: '15px',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    {isSubmittingRetainer ? 'Generating Quotation...' : `Generate Official Quotation & Schedule Free Site Audit →`}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BULK DESK PLANTS & BRANDED SWAG */}
      {activeTab === 'gifting' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
          
          {/* Left Side: Plant Selection & Customizer */}
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', marginBottom: '16px' }}>
              1. Select Live Plant & Brand Customization
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
              {plants.map((p, idx) => (
                <div 
                  key={idx}
                  onClick={() => setSelectedPlant(p.name)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '12px 14px',
                    borderRadius: '14px',
                    border: selectedPlant === p.name ? '2px solid var(--primary-green)' : '1px solid #e2e8f0',
                    background: selectedPlant === p.name ? '#f0fdf4' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <img src={p.img} alt={p.name} style={{ width: '50px', height: '50px', borderRadius: '10px', objectFit: 'cover' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#1e293b' }}>{p.name}</div>
                    <div style={{ fontSize: '11.5px', color: '#64748b' }}>{p.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', marginBottom: '14px' }}>
              2. Company Logo & Personalized Tag
            </h3>

            <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Company / Organization Name (Embossed on Planter)
                </label>
                <input 
                  type="text" 
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Wooden Plant Tag Greeting Message
                </label>
                <input 
                  type="text" 
                  value={customTagMessage}
                  onChange={(e) => setCustomTagMessage(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#334155' }}>
                <input 
                  type="checkbox" 
                  checked={includeGiftBox}
                  onChange={(e) => setIncludeGiftBox(e.target.checked)}
                  style={{ accentColor: 'var(--primary-green)' }}
                />
                Include Festive Eco-Jute Carry Bag (+₹49 per plant)
              </label>
            </div>
          </div>

          {/* Right Side: Quantity, Pricing Tier & Live Preview */}
          <div>
            {/* Live Mockup Preview Box */}
            <div style={{ background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)', borderRadius: '18px', padding: '24px', textAlign: 'center', marginBottom: '24px', position: 'relative' }}>
              <span style={{ position: 'absolute', top: '14px', left: '14px', background: '#ffffff', color: '#166534', padding: '3px 10px', borderRadius: '12px', fontSize: '10.5px', fontWeight: 800 }}>
                LIVE BRANDED PREVIEW
              </span>
              <div style={{ width: '140px', height: '140px', margin: '14px auto 10px', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 8px 20px rgba(0,0,0,0.1)' }}>
                <img 
                  src={plants.find(p => p.name === selectedPlant)?.img || plants[0].img} 
                  alt="Planter Preview" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              </div>
              
              <div style={{ display: 'inline-block', background: '#ffffff', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 800, color: '#1b4332', boxShadow: '0 2px 6px rgba(0,0,0,0.06)' }}>
                🏷️ {companyName} • "{customTagMessage}"
              </div>
            </div>

            {/* Pricing Calculator */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '22px', boxShadow: '0 4px 14px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b' }}>Order Quantity</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {[10, 25, 50, 100, 250].map((q) => (
                    <button
                      key={q}
                      onClick={() => setQuantity(q)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '8px',
                        border: quantity === q ? '2px solid var(--primary-green)' : '1px solid #cbd5e1',
                        background: quantity === q ? '#dcfce7' : '#ffffff',
                        color: quantity === q ? '#166534' : '#475569',
                        fontWeight: 800,
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tier Discount Callout */}
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '12px', marginBottom: '16px', fontSize: '12.5px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, color: '#166534' }}>
                  <span>Corporate Volume Discount</span>
                  <span>{discountRate > 0 ? `${discountRate * 100}% OFF` : 'Select 10+ for 15% OFF'}</span>
                </div>
                <div style={{ color: '#4b5563', fontSize: '11.5px', marginTop: '4px' }}>
                  10-49 units: 15% off • 50-199 units: 25% off • 200+ units: 35% off
                </div>
              </div>

              {/* Price Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '14px', fontSize: '13px', color: '#475569' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Unit Price ({quantity} plants)</span>
                  <span>₹{discountedPricePerPlant} <span style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '11px' }}>₹{basePricePerPlant}</span></span>
                </div>
                {includeGiftBox && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Eco-Jute Bags ({quantity} units)</span>
                    <span>₹{giftBoxPrice * quantity}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Bulk GST Invoice (18%)</span>
                  <span>Included</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Multi-location Express Dispatch</span>
                  <span style={{ color: '#166534', fontWeight: 700 }}>FREE</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '20px' }}>
                <span style={{ fontSize: '15px', fontWeight: 800, color: '#1e293b' }}>Total Estimated Amount</span>
                <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary-green)' }}>₹{grandTotal.toLocaleString()}</span>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  onClick={handleOrderDirect}
                  style={{
                    width: '100%',
                    background: 'var(--primary-green)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '13px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  Proceed to Bulk Checkout (₹{grandTotal.toLocaleString()}) →
                </button>

                {!quoteSubmitted ? (
                  <button
                    onClick={() => setQuoteSubmitted(true)}
                    style={{
                      width: '100%',
                      background: '#ffffff',
                      color: '#334155',
                      border: '1px solid #cbd5e1',
                      padding: '11px',
                      borderRadius: '12px',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Download Corporate PDF Quotation / Inquire
                  </button>
                ) : (
                  <div style={{ background: '#dcfce7', color: '#166534', padding: '10px', borderRadius: '10px', fontSize: '12px', textAlign: 'center', fontWeight: 700 }}>
                    ✓ Official Quote Sent to your email! Our B2B Gifting Lead will call you in 15 mins.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
