import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import { categoryData } from '../components/modals/CategoryModal';

export default function CategoryPage() {
  const { name } = useParams();
  const { products } = useApp();

  const categoryName = decodeURIComponent(name || 'Indoor Plants');
  
  // Resolve display name for visual consistency
  let displayName = categoryName;
  if (categoryName === "Garden Decoration") displayName = "Garden Decor";
  if (categoryName === "Gardening Essentials") displayName = "Essentials";

  const data = categoryData[categoryName] || {
    img: "https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=600&q=80",
    desc: "Curated collection of high quality gardening items and plants directly from verified sellers."
  };

  const filteredProducts = products.filter(p => p.category === categoryName);

  return (
    <div id="view-category" className="page-view active" style={{ display: 'block' }}>
      <div className="section-title-row" style={{ marginBottom: '24px' }}>
        <div>
          <h2 className="section-title" id="category-page-title">{categoryName} Collection</h2>
          <p className="section-subtitle" id="category-page-subtitle">Curated collections for your indoor & outdoor gardening needs</p>
        </div>
        <Link to="/" className="view-all">← Back to Home</Link>
      </div>
      
      {/* Category Spotlight Banner */}
      <div 
        id="category-page-banner" 
        style={{ 
          backgroundImage: `url('${data.img}')`,
          backgroundSize: 'cover', 
          backgroundPosition: 'center', 
          borderRadius: 'var(--radius-lg)', 
          height: '260px', 
          marginBottom: '32px', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'flex-end', 
          padding: '30px', 
          color: '#fff', 
          position: 'relative', 
          overflow: 'hidden', 
          boxShadow: 'var(--shadow-md)' 
        }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)', zIndex: 1 }}></div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--light-green)', fontWeight: 700 }}>Curated Selection</span>
          <h3 id="category-page-spotlight-title" style={{ fontSize: '32px', fontFamily: 'var(--font-serif)', fontWeight: 700, color: '#fff', marginTop: '4px', marginBottom: '8px' }}>{displayName}</h3>
          <p id="category-page-desc" style={{ maxWidth: '650px', color: '#e0e0e0', fontSize: '14.5px', lineHeight: 1.5 }}>{data.desc}</p>
        </div>
      </div>

      {/* Products Grid Section */}
      <div className="section-title-row" style={{ marginBottom: '24px' }}>
        <div>
          <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--dark)' }}>Explore Products</h3>
          <p className="section-subtitle">Direct from local collaborative nurseries and stalls</p>
        </div>
      </div>
      
      <div className="products-grid" id="category-page-products-grid">
        {filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#888', padding: '40px 0', width: '100%' }}>No products found in this category.</div>
        ) : (
          filteredProducts.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))
        )}
      </div>
    </div>
  );
}
