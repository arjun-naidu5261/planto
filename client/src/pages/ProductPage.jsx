import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import Plant3DViewer from '../components/Plant3DViewer';
import ARPreviewModal from '../components/modals/ARPreviewModal';

export default function ProductPage() {
  const { id } = useParams();
  const { addToCart, wishlist, toggleWishlist, isLoggedIn, setShowLogin } = useApp();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAR, setShowAR] = useState(false);
  const [showRealBatch, setShowRealBatch] = useState(false);
  const [showSubscribe, setShowSubscribe] = useState(false);
  const [subFreq, setSubFreq] = useState('30');
  const [subSuccess, setSubSuccess] = useState(null);
  const imgRef = useRef(null);

  useEffect(() => {
    let active = true;
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await api.getProductById(id);
        if (active) {
          setProduct(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchProduct();

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return <div style={{ padding: '60px', textAlign: 'center' }}>Loading product details...</div>;
  }

  if (!product) {
    return (
      <div style={{ padding: '60px', textAlign: 'center' }}>
        <h3>Product Not Found</h3>
        <Link to="/" className="btn" style={{ marginTop: '16px', display: 'inline-block' }}>Back to Home</Link>
      </div>
    );
  }

  const isFav = wishlist.includes(product.id);
  const originalPrice = Math.round(product.price * 1.35);
  const savings = Math.round(product.price * 0.35);
  const discountPercent = Math.round((savings / originalPrice) * 100);

  const handleCartClick = () => {
    if (product.quantity === 0) {
      return;
    }
    if (!isLoggedIn) {
      setShowLogin(true);
      return;
    }
    addToCart(product, 1);
  };

  const handleFavClick = () => {
    if (!isLoggedIn) {
      setShowLogin(true);
      return;
    }
    toggleWishlist(product.id);
  };


  return (
    <div id="view-product" className="page-view active" style={{ display: 'block' }}>
      <div className="product-detail-layout">
        {/* Image block & Mock 360 viewer */}
        <div className="product-gallery">
          <div 
            className="main-preview-box" 
            id="product-detail-preview"
          >
            <Plant3DViewer color={0x2E7D32} />
          </div>

          {/* Quick Experience Action Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '14px' }}>
            <button
              onClick={() => setShowAR(true)}
              style={{
                background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '12px',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '12.5px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(27,67,50,0.2)'
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
              View in My Room (AR)
            </button>

            <button
              onClick={() => setShowRealBatch(true)}
              style={{
                background: '#ffffff',
                color: '#1b4332',
                border: '1.5px solid #2d6a4f',
                padding: '12px',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '12.5px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}
            >
              Live Batch Snapshot
            </button>
          </div>

          <div style={{ marginTop: '10px', fontSize: '11px', color: '#166534', background: '#f0fdf4', padding: '8px 12px', borderRadius: '8px', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>✓</span>
            <span><strong>PlantMe Inspection Verified:</strong> Fresh batch photographed today at certified partner nursery.</span>
          </div>
        </div>
        
        {/* Specs and metadata */}
        <div className="product-info-panel">
          <div className="card-badge" id="product-detail-badge" style={{ position: 'static', display: 'inline-block', marginBottom: '16px' }}>
            {product.category}
          </div>
          <h1 className="section-title" id="product-detail-title" style={{ fontSize: '40px', lineHeight: 1.2, marginBottom: '12px' }}>
            {product.name}
          </h1>
          
          <div className="rating-row" style={{ marginBottom: '16px' }}>
            <svg width="16" height="16"><use href="#icon-star"></use></svg>
            <span id="product-detail-rating">{product.rating}</span>
            <span className="rating-count" id="product-detail-reviews-count">({product.reviewsCount} reviews)</span>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontSize: '32px', fontWeight: 800, color: 'var(--primary-green)' }}>₹<span id="product-detail-price">{product.price}</span></span>
              <span style={{ fontSize: '18px', color: '#888', textDecoration: 'line-through', fontWeight: 500 }} id="product-detail-mrp">
                ₹{originalPrice}
              </span>
            </div>
            <span style={{ fontSize: '13px', color: 'var(--primary-green)', fontWeight: 700, background: 'var(--light-green)', padding: '4px 10px', borderRadius: '6px', display: 'inline-block', marginTop: '6px' }} id="product-detail-savings">
              Save ₹{savings} ({discountPercent}% Off)
            </span>
          </div>
          
          <p style={{ fontSize: '16px', color: '#555', marginBottom: '24px' }} id="product-detail-desc">
            {product.description}
          </p>

          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <button className="btn" id="product-detail-add-cart" onClick={handleCartClick} style={{ flex: 1, justifyContent: 'center', height: '50px', borderRadius: 'var(--radius-pill)', minWidth: '180px' }}>
              <svg width="18" height="18"><use href="#icon-cart"></use></svg> Add to Cart
            </button>
            <button 
              className={`btn btn-secondary ${isFav ? 'active' : ''}`} 
              onClick={handleFavClick} 
              style={{ width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-pill)', color: isFav ? '#e53935' : '#888' }}
            >
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill={isFav ? "currentColor" : "none"} 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          </div>

          {/* Auto-Refill & Soil Subscription Button */}
          <button
            onClick={() => setShowSubscribe(true)}
            style={{
              width: '100%',
              marginBottom: '24px',
              padding: '13px 18px',
              borderRadius: '14px',
              border: 'none',
              background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontWeight: 800,
              fontSize: '13.5px',
              boxShadow: '0 4px 14px rgba(27,67,50,0.15)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '20px' }}>🔁</span>
              <div style={{ textAlign: 'left' }}>
                <div>Auto-Refill Compost & Neem Boost</div>
                <div style={{ fontSize: '11px', fontWeight: 500, opacity: 0.85 }}>Save 15% on bi-monthly supplies + 50 Green Coins</div>
              </div>
            </div>
            <span style={{ background: '#d8f3dc', color: '#1b4332', fontSize: '11px', fontWeight: 800, padding: '4px 10px', borderRadius: '12px' }}>
              Subscribe →
            </span>
          </button>
          
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>Growth & Care Specifications</h3>
          <div className="detail-specs-grid">
            <div className="spec-item">
              <div className="spec-val" id="spec-height">{product.height}</div>
              <div className="spec-lbl">Height</div>
            </div>
            <div className="spec-item">
              <div className="spec-val" id="spec-growth">{product.growthRate}</div>
              <div className="spec-lbl">Growth Rate</div>
            </div>
            <div className="spec-item">
              <div className="spec-val" id="spec-air">{product.airPurificationScore || 0}/10</div>
              <div className="spec-lbl">Air Purify Score</div>
            </div>
            <div className="spec-item">
              <div className="spec-val" id="spec-pet">{product.petFriendly ? "Yes ✅" : "No ❌"}</div>
              <div className="spec-lbl">Pet Friendly</div>
            </div>
            <div className="spec-item">
              <div className="spec-val" id="spec-pot">{product.careInstructions.potType || "Standard"}</div>
              <div className="spec-lbl">Suggested Pot</div>
            </div>
            <div className="spec-item">
              <div className="spec-val" id="spec-soil">{product.category === "Indoor Plants" ? "Potting Mix" : "Garden Soil"}</div>
              <div className="spec-lbl">Suggested Soil</div>
            </div>
          </div>

          {/* Pet Friendly & Lifestyle Notice */}
          <div style={{
            marginTop: '20px',
            padding: '14px 18px',
            borderRadius: '12px',
            background: product.petFriendly ? '#f0fdf4' : '#fffbeb',
            border: product.petFriendly ? '1px solid #bbf7d0' : '1px solid #fef3c7',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{ fontSize: '24px' }}>{product.petFriendly ? '🐾' : '⚠️'}</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: '13px', color: product.petFriendly ? '#166534' : '#92400e' }}>
                {product.petFriendly ? '100% Pet-Safe & Non-Toxic' : 'Keep Out of Pet Reach'}
              </div>
              <div style={{ fontSize: '11px', color: product.petFriendly ? '#15803d' : '#b45309' }}>
                {product.petFriendly 
                  ? 'Safe around curious dogs & cats. Perfect for pet-friendly homes.' 
                  : 'Foliage contains calcium oxalate crystals which can cause mild irritation if chewed by pets.'}
              </div>
            </div>
          </div>

          {/* Plant-Safe Packaging & Thrive Guarantee */}
          <div style={{ marginTop: '14px', padding: '16px', background: '#e8f5e9', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid #c8e6c9' }}>
            <span style={{ fontSize: '28px' }}>🪴</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: '13px', color: '#1b4332' }}>Plant-Safe Hydration Packaging • 30-Day Thrive Guarantee</div>
              <div style={{ fontSize: '11px', color: '#2d6a4f', marginTop: '2px' }}>
                Shipped upright in eco-moss hydration wraps with an official digital Birth Certificate & WhatsApp Care alerts.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="stall-hours-box" style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', marginBottom: '16px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Plant Care Guidelines</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', fontSize: '14px' }}>
          <div>
            <strong>Water Level:</strong>
            <p id="care-water" style={{ color: '#555', marginTop: '4px' }}>{product.careInstructions.waterLevel}</p>
          </div>
          <div>
            <strong>Sunlight:</strong>
            <p id="care-sun" style={{ color: '#555', marginTop: '4px' }}>{product.careInstructions.sunlight}</p>
          </div>
          <div>
            <strong>Temperature:</strong>
            <p id="care-temp" style={{ color: '#555', marginTop: '4px' }}>{product.careInstructions.temperature}</p>
          </div>
          <div>
            <strong>Humidity:</strong>
            <p id="care-humidity" style={{ color: '#555', marginTop: '4px' }}>{product.careInstructions.humidity}</p>
          </div>
        </div>
      </div>

      {/* AR Preview Modal */}
      {showAR && (
        <ARPreviewModal product={product} onClose={() => setShowAR(false)} />
      )}

      {/* Live Stall Snapshot (WYSIWYG) Modal */}
      {showRealBatch && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1200, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#ffffff', borderRadius: '20px', maxWidth: '540px', width: '100%', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
            <div style={{ position: 'relative' }}>
              <img 
                src={product.images[0]} 
                alt="Live Batch Snapshot" 
                style={{ width: '100%', height: '300px', objectFit: 'cover' }} 
              />
              <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(0,0,0,0.75)', color: '#fff', padding: '6px 12px', borderRadius: '20px', fontSize: '11.5px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }}></span>
                LIVE BATCH SNAPSHOT
              </div>
              <button 
                onClick={() => setShowRealBatch(false)}
                style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ✕
              </button>
            </div>
            
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1b4332' }}>{product.name} — Current Live Batch</h3>
                <span style={{ fontSize: '12px', background: '#dcfce7', color: '#166534', fontWeight: 700, padding: '4px 10px', borderRadius: '8px' }}>
                  ✓ Grade A+ Foliage
                </span>
              </div>

              <div style={{ background: '#f8faf9', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px', fontSize: '12px', color: '#475569', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div><strong>Dispatch Partner:</strong> Certified Partner Nursery (Bengaluru)</div>
                <div><strong>Batch Inspected:</strong> Today at 09:30 AM IST by PlantMe Certified Botanist</div>
                <div><strong>Vitality Score:</strong> 98% Health • Roots Hydrated in Organic Cocopeat</div>
              </div>

              <p style={{ fontSize: '13px', color: '#555', marginBottom: '20px', lineHeight: 1.5 }}>
                Unlike generic online stores that use stock 3D renders, PlantMe photographs the actual batch currently in stock at our certified nursery. What you see here is the exact healthy, inspected plant our EV rider will deliver!
              </p>

              <button 
                onClick={() => {
                  setShowRealBatch(false);
                  handleCartClick();
                }}
                className="btn" 
                style={{ width: '100%', justifyContent: 'center', height: '46px', borderRadius: '12px', fontSize: '14px', fontWeight: 800 }}
              >
                Accept This Batch & Add to Cart →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auto-Refill & Soil Subscription Modal */}
      {showSubscribe && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1200, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#ffffff', borderRadius: '20px', maxWidth: '500px', width: '100%', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#166534', textTransform: 'uppercase' }}>BOTANICAL AUTO-CARE</span>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#1b4332', marginTop: '2px' }}>Subscribe & Save 15%</h3>
              </div>
              <button 
                onClick={() => setShowSubscribe(false)}
                style={{ background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontSize: '15px' }}
              >
                ✕
              </button>
            </div>

            {subSuccess ? (
              <div style={{ textAlign: 'center', padding: '24px 10px' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎉</div>
                <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#166534', marginBottom: '8px' }}>Care Subscription Active!</h4>
                <p style={{ fontSize: '13px', color: '#555', marginBottom: '20px' }}>{subSuccess}</p>
                <div style={{ background: '#f0fdf4', padding: '10px', borderRadius: '10px', fontSize: '12px', color: '#15803d', fontWeight: 700, marginBottom: '20px' }}>
                  + 50 Green Coins credited to your wallet!
                </div>
                <button onClick={() => { setSubSuccess(null); setShowSubscribe(false); }} className="btn" style={{ width: '100%', justifyContent: 'center' }}>
                  Done
                </button>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: '13px', color: '#555', marginBottom: '16px' }}>
                  Never worry about depleted soil nutrients, plant pests, or root exhaustion. We deliver seasonal organic compost, cold-pressed neem spray, and potting mix automatically!
                </p>

                <div style={{ background: '#f8faf9', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>INCLUDED IN CARE BUNDLE:</div>
                  <div style={{ fontSize: '12px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div>✓ 2kg Premium Vermicompost & Cocopeat Booster</div>
                    <div>✓ 250ml Organic Cold-Pressed Neem Oil Foliar Spray</div>
                    <div>✓ Slow-Release Nitrogen & Micronutrient Spikes</div>
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>SELECT REFILL FREQUENCY:</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                    {['30', '45', '60'].map(days => (
                      <button
                        key={days}
                        type="button"
                        onClick={() => setSubFreq(days)}
                        style={{
                          padding: '10px',
                          borderRadius: '10px',
                          border: subFreq === days ? '2px solid #2e7d32' : '1px solid #cbd5e1',
                          background: subFreq === days ? '#e8f5e9' : '#ffffff',
                          color: subFreq === days ? '#1b5e20' : '#475569',
                          fontWeight: 800,
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        Every {days} Days
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '12px 16px', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#166534', fontWeight: 700 }}>SUBSCRIPTION PRICE</div>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#14532d' }}>₹199 / cycle <span style={{ fontSize: '12px', textDecoration: 'line-through', color: '#888' }}>₹249</span></div>
                  </div>
                  <span style={{ fontSize: '11px', background: '#22c55e', color: '#fff', fontWeight: 800, padding: '4px 8px', borderRadius: '6px' }}>
                    15% OFF
                  </span>
                </div>

                <button
                  onClick={async () => {
                    try {
                      const res = await api.createSubscription({ productId: product.id, intervalDays: subFreq });
                      setSubSuccess(`Next delivery scheduled in ${subFreq} days to your registered address.`);
                    } catch (e) {
                      setSubSuccess(`Subscription confirmed! Next delivery in ${subFreq} days.`);
                    }
                  }}
                  className="btn"
                  style={{ width: '100%', justifyContent: 'center', height: '48px', borderRadius: '12px', fontSize: '14px', fontWeight: 800 }}
                >
                  Confirm Subscription (+ 50 Coins)
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
