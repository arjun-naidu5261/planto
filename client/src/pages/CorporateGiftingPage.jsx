import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function CorporateGiftingPage() {
  const { addToCart } = useApp();
  const [companyName, setCompanyName] = useState('Google Bengaluru');
  const [selectedPlant, setSelectedPlant] = useState('ZZ Fortune Plant in Matte White Ceramic');
  const [quantity, setQuantity] = useState(25);
  const [customTagMessage, setCustomTagMessage] = useState('Welcome to the Green Team! 🌿');
  const [includeGiftBox, setIncludeGiftBox] = useState(true);
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);
  const [contactEmail, setContactEmail] = useState('hr@company.com');
  const [contactPhone, setContactPhone] = useState('+91 98765 43210');

  const basePricePerPlant = 399;
  
  // Calculate discount tier
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

  const handleQuoteSubmit = (e) => {
    e.preventDefault();
    setQuoteSubmitted(true);
  };

  return (
    <div className="page-view active" style={{ display: 'block', maxWidth: '1100px', margin: '0 auto', padding: '20px 16px 60px' }}>
      
      {/* Hero Header */}
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary-green)', background: '#dcfce7', padding: '4px 12px', borderRadius: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>
          PLANTME FOR BUSINESS & TEAMS
        </span>
        <h1 style={{ fontSize: '34px', fontFamily: 'var(--font-serif)', color: '#14532d', margin: '8px 0 6px 0' }}>
          Corporate Desk Plants & Eco-Gifting Portal
        </h1>
        <p style={{ fontSize: '15px', color: '#475569', maxWidth: '650px', margin: '0 auto' }}>
          Replace plastic swag with living air-purifying desk companions. Branded with your company logo, delivered in 20-30 mins or bulk-dispatched across employee homes.
        </p>
      </div>

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
    </div>
  );
}
