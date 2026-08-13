import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function ProductCard({ product }) {
  const { addToCart, wishlist, toggleWishlist, isLoggedIn, setShowLogin } = useApp();

  const isFav = wishlist.includes(product.id);
  const originalPrice = Math.round(product.price * 1.35);
  const savings = Math.round(product.price * 0.35);
  const discountPercent = Math.round((0.35 / 1.35) * 100);

  const handleCartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.quantity === 0) {
      return;
    }
    if (!isLoggedIn) {
      setShowLogin(true);
      return;
    }
    addToCart(product, 1);
  };

  const handleFavClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <div className="product-card">
      <span className="card-badge">{product.category}</span>
      <button 
        className={`fav-btn ${isFav ? 'active' : ''}`} 
        style={{ color: isFav ? '#e53935' : '#888' }}
        onClick={handleFavClick}
      >
        <svg 
          width="18" 
          height="18" 
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
      
      <div className="product-img-wrapper">
        <Link to={`/product/${product.id}`}>
          <img 
            src={product.images[0]} 
            alt={product.name} 
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=600&q=80";
            }}
          />
        </Link>
      </div>
      
      <div className="product-info">
        <div className="product-vendor-row">
          <span>
            {product.quantity > 0 ? (
              `Stall Stock: ${product.quantity} left`
            ) : (
              <span style={{ color: '#d32f2f', fontWeight: 700 }}>Out of Stock</span>
            )}
          </span>
          <Link to={`/stall/${product.vendorId}`} className="vendor-link">Store Profile</Link>
        </div>
        
        <Link to={`/product/${product.id}`} className="product-title">{product.name}</Link>
        
        <div className="rating-row">
          <svg width="14" height="14"><use href="#icon-star"></use></svg>
          <span>{product.rating}</span>
          <span className="rating-count">({product.reviewsCount})</span>
        </div>
        
        <div className="product-footer">
          <div className="price-box">
            <span className="price-label">DIRECT PRICE</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span className="price-value">₹{product.price}</span>
              <span style={{ textDecoration: 'line-through', color: '#888', fontSize: '13px', fontWeight: 500 }}>
                ₹{originalPrice}
              </span>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--primary-green)', fontWeight: 700, backgroundColor: 'var(--light-green)', padding: '2px 6px', borderRadius: '4px', marginTop: '4px', display: 'inline-block' }}>
              Save ₹{savings} ({discountPercent}% Off)
            </span>
          </div>
          
          <button className="add-cart-btn" onClick={handleCartClick} aria-label="Add to Cart" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--primary-green)', color: '#ffffff' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"/>
              <circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
