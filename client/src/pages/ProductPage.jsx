import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import Plant3DViewer from '../components/Plant3DViewer';

export default function ProductPage() {
  const { id } = useParams();
  const { addToCart, wishlist, toggleWishlist, isLoggedIn, setShowLogin } = useApp();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
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
          
          <p style={{ fontSize: '16px', color: '#555', marginBottom: '30px' }} id="product-detail-desc">
            {product.description}
          </p>

          <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
            <button className="btn" id="product-detail-add-cart" onClick={handleCartClick} style={{ flex: 1, justifyContent: 'center', height: '50px', borderRadius: 'var(--radius-pill)' }}>
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
    </div>
  );
}
