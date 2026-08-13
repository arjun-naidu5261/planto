import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import ProductCard from '../components/ProductCard';

export default function SeasonalPage() {
  const { season } = useParams();
  const { products } = useApp();

  const seasonKey = (season || 'spring').toLowerCase();

  const seasonsData = {
    'spring': {
      title: "Spring Collection 🌸",
      subtitle: "Fresh blooming flowers, saplings & organic fertilizer",
      img: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1200&q=80",
      desc: "Spring is the season of renewal! Revitalize your garden with our fresh blooming selections, healthy saplings, and nitrogen-rich organic fertilizers tailored for new growth.",
      filter: (p) => p.category === 'Indoor Plants' || p.category === 'Outdoor Plants' || p.price < 250
    },
    'summer': {
      title: "Summer Collection ☀️",
      subtitle: "Heat-tolerant succulents, palms & watering essentials",
      img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
      desc: "Beat the heat! Explore our specially curated drought-resistant plants, lush palms, self-watering planters, and essential hydration accessories to keep your greens safe during peak summer.",
      filter: (p) => p.category === 'Pots & Containers' || p.name.toLowerCase().includes('succulent') || p.name.toLowerCase().includes('aloe') || p.name.toLowerCase().includes('snake') || p.price >= 400
    },
    'monsoon': {
      title: "Monsoon & Autumn 🌧️",
      subtitle: "Rainy-day planters, fast-growing herbs & leaf composts",
      img: "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?auto=format&fit=crop&w=1200&q=80",
      desc: "Embrace the rain! Monsoon brings high humidity that fast-growing herbs love. Prepare your soil with our well-draining organic composts and neem-based shields against rainy-day pests.",
      filter: (p) => p.category === 'Soil Collection' || p.name.toLowerCase().includes('herb') || p.name.toLowerCase().includes('mix') || p.name.toLowerCase().includes('soil')
    },
    'winter': {
      title: "Winter Collection ❄️",
      subtitle: "Stunning Petunias, Chrysanthemums & cold composting",
      img: "https://images.unsplash.com/photo-1482862549707-f63cb32c5fd9?auto=format&fit=crop&w=1200&q=80",
      desc: "Keep blooming through the cold! Discover winter-resistant flowering varieties like Chrysanthemums, plus slow-release organic mulches to warm up roots and protect your beds.",
      filter: (p) => p.category === 'Seeds Collection' || p.name.toLowerCase().includes('chrysanthemum') || p.name.toLowerCase().includes('compost') || p.name.toLowerCase().includes('pothos')
    }
  };

  const data = seasonsData[seasonKey] || seasonsData['spring'];
  const filteredProducts = products.filter(data.filter);

  return (
    <div id="view-seasonal" className="page-view active" style={{ display: 'block', padding: '24px 0' }}>
      <div className="section-title-row" style={{ marginBottom: '24px' }}>
        <div>
          <h2 className="section-title" style={{ fontFamily: 'var(--font-serif)', fontSize: '28px' }}>{data.title}</h2>
          <p className="section-subtitle">{data.subtitle}</p>
        </div>
        <Link to="/" className="view-all" style={{ textDecoration: 'none', fontWeight: 700, color: 'var(--primary-green)' }}>← Back to Home</Link>
      </div>

      {/* Hero Spotlight Banner */}
      <div 
        style={{ 
          backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 100%), url('${data.img}')`,
          backgroundSize: 'cover', 
          backgroundPosition: 'center', 
          borderRadius: '20px', 
          height: '280px', 
          marginBottom: '36px', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'flex-end', 
          padding: '40px', 
          color: '#fff', 
          boxShadow: 'var(--shadow-md)'
        }}
      >
        <div>
          <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--light-green)', fontWeight: 700 }}>Seasonal Curation Spotlight</span>
          <h3 style={{ fontSize: '32px', fontFamily: 'var(--font-serif)', fontWeight: 800, color: '#fff', marginTop: '6px', marginBottom: '8px' }}>{data.title.split(' ')[0]} Season</h3>
          <p style={{ maxWidth: '700px', color: '#f0f0f0', fontSize: '14.5px', lineHeight: 1.6, margin: 0 }}>{data.desc}</p>
        </div>
      </div>

      {/* Product list section */}
      <div className="section-title-row" style={{ marginBottom: '24px' }}>
        <div>
          <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--dark)' }}>Curated Collections</h3>
          <p className="section-subtitle">Specially selected plants and supplies for this season</p>
        </div>
      </div>

      <div className="products-grid">
        {filteredProducts.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#888', padding: '40px 0', background: 'var(--white)', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.03)' }}>
            No products found matching the seasonal filter.
          </div>
        ) : (
          filteredProducts.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))
        )}
      </div>
    </div>
  );
}
