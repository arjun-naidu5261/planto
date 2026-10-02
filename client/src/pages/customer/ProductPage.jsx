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
  const [showSubscribe, setShowSubscribe] = useState(false);
  const [subFreq, setSubFreq] = useState('monthly');
  const [subToast, setSubToast] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await api.getProductById(id);
        if (active) setProduct(data);
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchProduct();
    return () => { active = false; };
  }, [id]);

  if (loading) return <div style={{ padding: '60px', textAlign: 'center' }}>Loading product details...</div>;
  if (!product) return (
    <div style={{ padding: '60px', textAlign: 'center' }}>
      <h3>Product Not Found</h3>
      <Link to="/" className="btn" style={{ marginTop: '16px', display: 'inline-block' }}>Back to Home</Link>
    </div>
  );

  const isFav = wishlist.includes(product.id);
  const originalPrice = Math.round(product.price * 1.35);
  const savings = Math.round(product.price * 0.35);
  const discountPercent = Math.round((savings / originalPrice) * 100);

  const subPrices = {
    weekly: Math.round(product.price * 0.88),
    monthly: Math.round(product.price * 0.80),
    quarterly: Math.round(product.price * 0.72),
  };

  const handleCartClick = () => {
    if (product.quantity === 0) return;
    if (!isLoggedIn) { setShowLogin(true); return; }
    addToCart(product, 1);
  };

  const handleFavClick = () => {
    if (!isLoggedIn) { setShowLogin(true); return; }
    toggleWishlist(product.id);
  };

  const handleSubscribe = () => {
    if (!isLoggedIn) { setShowLogin(true); return; }
    setShowSubscribe(false);
    setSubToast(true);
    setTimeout(() => setSubToast(false), 3500);
  };

  // Lifestyle tags
  const lifestyleTags = [];
  if (product.petFriendly) lifestyleTags.push({ label: '🐾 Pet Safe', color: '#e8f5e9', text: '#2e7d32' });
  const careText = (product.careInstructions?.sunlight || '').toLowerCase();
  if (careText.includes('low') || careText.includes('indirect') || careText.includes('shade')) {
    lifestyleTags.push({ label: '💡 Low Light OK', color: '#e3f2fd', text: '#1565c0' });
  }
  const waterText = (product.careInstructions?.waterLevel || '').toLowerCase();
  if (waterText.includes('low') || waterText.includes('drought') || waterText.includes('once') || waterText.includes('neglect') || waterText.includes('minimal')) {
    lifestyleTags.push({ label: '🌵 Thrives on Neglect', color: '#fff8e1', text: '#e65100' });
  }
  if ((product.category || '').toLowerCase().includes('indoor')) {
    lifestyleTags.push({ label: '🏢 AC-Office Friendly', color: '#f3e5f5', text: '#6a1b9a' });
  }

  return (
    <div id="view-product" className="page-view active" style={{ display: 'block' }}>

      {/* AR Modal */}
      {showAR && <ARPreviewModal product={product} onClose={() => setShowAR(false)} />}

      {/* Subscribe Modal */}
      {showSubscribe && (
        <div onClick={e => e.target === e.currentTarget && setShowSubscribe(false)}
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:'16px' }}>
          <div style={{ background:'#fff', borderRadius:'20px', padding:'32px', maxWidth:'420px', width:'100%', boxShadow:'0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ textAlign:'center', marginBottom:'20px' }}>
              <div style={{ fontSize:'48px', marginBottom:'8px' }}>🔔</div>
              <h3 style={{ fontSize:'20px', fontWeight:800, margin:'0 0 6px' }}>Subscribe & Save</h3>
              <p style={{ color:'#666', fontSize:'13px' }}>Get <strong>{product.name}</strong> delivered regularly at a discounted price</p>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginBottom:'20px' }}>
              {Object.entries(subPrices).map(([freq, price]) => (
                <label key={freq} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', borderRadius:'12px', border:`2px solid ${subFreq===freq ? '#2d6a4f' : '#eee'}`, cursor:'pointer', background: subFreq===freq ? '#f0fdf4' : '#fff', transition:'all 0.2s' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                    <input type="radio" name="subfreq" value={freq} checked={subFreq===freq} onChange={()=>setSubFreq(freq)} style={{ accentColor:'#2d6a4f' }} />
                    <div>
                      <div style={{ fontWeight:700, textTransform:'capitalize', fontSize:'15px' }}>{freq}</div>
                      <div style={{ fontSize:'12px', color:'#888' }}>Save {freq==='weekly'?'12%':freq==='monthly'?'20%':'28%'}</div>
                    </div>
                  </div>
                  <div style={{ fontWeight:800, color:'#2d6a4f', fontSize:'18px' }}>₹{price}</div>
                </label>
              ))}
            </div>
            <div style={{ background:'#f0fdf4', borderRadius:'12px', padding:'12px 16px', marginBottom:'20px', fontSize:'13px', color:'#2d6a4f', fontWeight:600 }}>
              🌱 +50 Green Coins earned on first delivery · Cancel anytime
            </div>
            <div style={{ display:'flex', gap:'10px' }}>
              <button onClick={() => setShowSubscribe(false)} style={{ flex:1, padding:'12px', borderRadius:'10px', border:'1px solid #ddd', background:'#fff', cursor:'pointer', fontWeight:600 }}>Cancel</button>
              <button onClick={handleSubscribe} style={{ flex:2, padding:'12px', borderRadius:'10px', border:'none', background:'linear-gradient(135deg,#2d6a4f,#1b4332)', color:'#fff', cursor:'pointer', fontWeight:800, fontSize:'15px' }}>
                Subscribe Now 🌿
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {subToast && (
        <div style={{ position:'fixed', bottom:'90px', left:'50%', transform:'translateX(-50%)', background:'#2d6a4f', color:'#fff', padding:'14px 24px', borderRadius:'30px', fontWeight:700, zIndex:9998, boxShadow:'0 4px 20px rgba(0,0,0,0.2)', fontSize:'14px', animation:'fadeIn 0.3s ease' }}>
          ✅ Subscribed! First delivery in 3-5 days · 50 🌿 Green Coins added
        </div>
      )}

      <div className="product-detail-layout">
        {/* Image block & Mock 360 viewer */}
        <div className="product-gallery">
          <div className="main-preview-box" id="product-detail-preview">
            <Plant3DViewer color={0x2E7D32} />
          </div>

          {/* AR Preview Button */}
          <button
            onClick={() => setShowAR(true)}
            style={{ width:'100%', marginTop:'12px', padding:'13px', borderRadius:'12px', border:'2px dashed #a5d6a7', background:'linear-gradient(135deg,#f0fdf4,#e8f5e9)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px', fontWeight:700, color:'#2d6a4f', fontSize:'14px', transition:'all 0.2s' }}
            onMouseOver={e=>{e.currentTarget.style.background='linear-gradient(135deg,#e8f5e9,#c8e6c9)'; e.currentTarget.style.borderColor='#66bb6a';}}
            onMouseOut={e=>{e.currentTarget.style.background='linear-gradient(135deg,#f0fdf4,#e8f5e9)'; e.currentTarget.style.borderColor='#a5d6a7';}}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
            <span>Preview in My Room (AR)</span>
            <span style={{ background:'#2d6a4f', color:'#fff', fontSize:'10px', fontWeight:800, padding:'2px 7px', borderRadius:'10px', marginLeft:'4px' }}>BETA</span>
          </button>

          {/* Live Stall WYSIWYG badge */}
          {product.liveStallPhoto && (
            <div style={{ marginTop:'10px', borderRadius:'12px', overflow:'hidden', position:'relative' }}>
              <img src={product.liveStallPhoto} alt="Live stall" style={{ width:'100%', borderRadius:'12px', objectFit:'cover', maxHeight:'160px' }} />
              <div style={{ position:'absolute', top:'8px', left:'8px', background:'rgba(0,0,0,0.7)', color:'#fff', fontSize:'11px', fontWeight:800, padding:'4px 10px', borderRadius:'20px' }}>
                LIVE BATCH SNAPSHOT — What You See Is What You Get
              </div>
            </div>
          )}
        </div>

        {/* Specs and metadata */}
        <div className="product-info-panel">
          {/* Lifestyle Tags */}
          {lifestyleTags.length > 0 && (
            <div style={{ display:'flex', flexWrap:'wrap', gap:'6px', marginBottom:'14px' }}>
              {lifestyleTags.map((tag, i) => (
                <span key={i} style={{ background:tag.color, color:tag.text, fontSize:'12px', fontWeight:700, padding:'4px 12px', borderRadius:'20px' }}>
                  {tag.label}
                </span>
              ))}
            </div>
          )}

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
              <span style={{ fontSize: '18px', color: '#888', textDecoration: 'line-through', fontWeight: 500 }} id="product-detail-mrp">₹{originalPrice}</span>
            </div>
            <span style={{ fontSize: '13px', color: 'var(--primary-green)', fontWeight: 700, background: 'var(--light-green)', padding: '4px 10px', borderRadius: '6px', display: 'inline-block', marginTop: '6px' }} id="product-detail-savings">
              Save ₹{savings} ({discountPercent}% Off)
            </span>
          </div>

          <p style={{ fontSize: '16px', color: '#555', marginBottom: '24px' }} id="product-detail-desc">{product.description}</p>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap:'wrap' }}>
            <button className="btn" id="product-detail-add-cart" onClick={handleCartClick}
              style={{ flex: 1, justifyContent: 'center', height: '50px', borderRadius: 'var(--radius-pill)', minWidth:'160px' }}>
              <svg width="18" height="18"><use href="#icon-cart"></use></svg> Add to Cart
            </button>
            <button
              className={`btn btn-secondary ${isFav ? 'active' : ''}`}
              onClick={handleFavClick}
              style={{ width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-pill)', color: isFav ? '#e53935' : '#888' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill={isFav ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          </div>

          {/* Subscribe & Save */}
          <button
            onClick={() => setShowSubscribe(true)}
            style={{ width:'100%', marginBottom:'24px', padding:'13px', borderRadius:'12px', border:'none', background:'linear-gradient(135deg,#1b4332,#2d6a4f)', color:'#fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px', fontWeight:700, fontSize:'14px' }}
          >
            <span>🔔</span>
            <span>Subscribe & Save up to 28%</span>
            <span style={{ background:'rgba(255,255,255,0.2)', fontSize:'11px', padding:'2px 8px', borderRadius:'10px' }}>+ 50 🌿 Coins</span>
          </button>

          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>Growth & Care Specifications</h3>
          <div className="detail-specs-grid">
            <div className="spec-item"><div className="spec-val" id="spec-height">{product.height}</div><div className="spec-lbl">Height</div></div>
            <div className="spec-item"><div className="spec-val" id="spec-growth">{product.growthRate}</div><div className="spec-lbl">Growth Rate</div></div>
            <div className="spec-item"><div className="spec-val" id="spec-air">{product.airPurificationScore || 0}/10</div><div className="spec-lbl">Air Purify Score</div></div>
            <div className="spec-item"><div className="spec-val" id="spec-pet">{product.petFriendly ? "Yes ✅" : "No ❌"}</div><div className="spec-lbl">Pet Friendly</div></div>
            <div className="spec-item"><div className="spec-val" id="spec-pot">{product.careInstructions.potType || "Standard"}</div><div className="spec-lbl">Suggested Pot</div></div>
            <div className="spec-item"><div className="spec-val" id="spec-soil">{product.category === "Indoor Plants" ? "Potting Mix" : "Garden Soil"}</div><div className="spec-lbl">Suggested Soil</div></div>
          </div>
        </div>
      </div>

      <div className="stall-hours-box" style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', marginBottom: '16px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Plant Care Guidelines</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', fontSize: '14px' }}>
          <div><strong>Water Level:</strong><p id="care-water" style={{ color: '#555', marginTop: '4px' }}>{product.careInstructions.waterLevel}</p></div>
          <div><strong>Sunlight:</strong><p id="care-sun" style={{ color: '#555', marginTop: '4px' }}>{product.careInstructions.sunlight}</p></div>
          <div><strong>Temperature:</strong><p id="care-temp" style={{ color: '#555', marginTop: '4px' }}>{product.careInstructions.temperature}</p></div>
          <div><strong>Humidity:</strong><p id="care-humidity" style={{ color: '#555', marginTop: '4px' }}>{product.careInstructions.humidity}</p></div>
        </div>
      </div>
    </div>
  );
}
