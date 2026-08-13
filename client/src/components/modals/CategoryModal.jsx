import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

const categoryData = {
  "Indoor Plants": {
    img: "/images/golden_pothos.png",
    desc: "Enhance your indoor living space with our premium selection of air-purifying plants, trailing vines, and resilient indoor varieties. Selected specifically to thrive in indoor lighting conditions, these plants help boost mood, creativity, and clean the air in your home."
  },
  "Outdoor Plants": {
    img: "/images/red_hibiscus.png",
    desc: "Transform your garden, balcony, or terrace into a lush oasis. Explore hardy outdoor shrubs, beautiful flowering annuals, premium creepers, and exotic palms designed to withstand diverse climates and add vibrant color to your exterior space."
  },
  "Seeds Collection": {
    img: "/images/tomato_seeds.png",
    desc: "Start your gardening journey from scratch with high-germination, organic seeds. Choose from high-yield kitchen garden vegetable seeds, aromatic culinary herbs, and stunning ornamental flowers to grow your own green haven."
  },
  "Soil Collection": {
    img: "/images/potting_mix.png",
    desc: "The foundation of healthy gardening. Discover nutrient-dense organic potting soils, coco peat blocks, vermicompost, perlite, and specific succulent soil mixes tailored for maximum root growth and water retention."
  },
  "Pots & Containers": {
    img: "/images/self_watering_pot.png",
    desc: "House your green companions in style. Browse our premium collection of terracotta clay pots, elegant ceramic containers, lightweight eco-friendly resin planters, and space-saving hanging baskets."
  },
  "Garden Decoration": {
    img: "https://images.unsplash.com/photo-1582281227099-7f45b3bea6e9?auto=format&fit=crop&w=600&q=80",
    desc: "Add a touch of personality and charm to your green space. Featuring polished landscaping pebbles, miniature fairy garden items, eco-friendly garden stakes, and artistic pottery to create a magical outdoor escape."
  },
  "Gardening Essentials": {
    img: "https://images.unsplash.com/photo-1617155093730-a8bf47be792d?auto=format&fit=crop&w=600&q=80",
    desc: "Empower your green thumb with the right equipment. Discover ergonomic pruning shears, premium watering cans, hand trowels, moisture meters, and organic plant protection products."
  }
};

export default function CategoryModal() {
  const { showCategoryModal, setShowCategoryModal, selectedCategoryName } = useApp();
  const navigate = useNavigate();

  if (!showCategoryModal) return null;

  const data = categoryData[selectedCategoryName] || {
    img: "https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=600&q=80",
    desc: "Curated collections for your indoor & outdoor gardening needs."
  };

  const handleShop = () => {
    setShowCategoryModal(false);
    navigate(`/category/${encodeURIComponent(selectedCategoryName)}`);
  };

  const handleMap = () => {
    setShowCategoryModal(false);
    
    // Determine mapping type
    let dbType = 'all';
    if (selectedCategoryName.includes('Indoor') || selectedCategoryName.includes('Outdoor')) {
      dbType = 'plant';
    } else if (selectedCategoryName.includes('Seeds')) {
      dbType = 'seed';
    } else if (selectedCategoryName.includes('Soil')) {
      dbType = 'soil';
    } else if (selectedCategoryName.includes('Pots')) {
      dbType = 'pot';
    } else if (selectedCategoryName.includes('Decor')) {
      dbType = 'stones';
    } else if (selectedCategoryName.includes('Essentials')) {
      dbType = 'essential';
    }

    navigate(`/map?filter=${dbType}`);
  };

  return (
    <div className="modal-overlay active" id="category-detail-modal" onClick={() => setShowCategoryModal(false)}>
      <div className="modal-content" style={{ maxWidth: '580px', padding: 0, overflow: 'hidden', borderRadius: 'var(--radius-lg)' }} onClick={(e) => e.stopPropagation()}>
        <button 
          className="close-modal" 
          id="category-modal-close" 
          style={{ top: '15px', right: '15px', zIndex: 10, background: 'rgba(0,0,0,0.5)', color: '#fff', width: '36px', height: '36px', borderRadius: '50%', fontSize: '20px', lineHeight: '36px', padding: 0 }}
          onClick={() => setShowCategoryModal(false)}
        >
          &times;
        </button>
        
        <div style={{ width: '100%', height: '260px', overflow: 'hidden', position: 'relative' }}>
          <img src={data.img} id="category-modal-img" alt={selectedCategoryName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)', padding: '24px', color: '#fff' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--light-green)', fontWeight: 700 }}>Category Spotlight</span>
            <h3 id="category-modal-title" style={{ fontSize: '26px', fontFamily: 'var(--font-serif)', fontWeight: 700, marginTop: '4px', color: '#fff' }}>{selectedCategoryName}</h3>
          </div>
        </div>
        
        <div style={{ padding: '24px' }}>
          <p id="category-modal-desc" style={{ fontSize: '14.5px', color: '#444', lineHeight: '1.6', marginBottom: '24px' }}>
            {data.desc}
          </p>
          
          <div style={{ display: 'flex', gap: '16px' }}>
            <button className="btn" id="category-modal-shop-btn" style={{ flex: 1, justifyContent: 'center', height: '46px', fontSize: '14px' }} onClick={handleShop}>
              🛍️ Shop Products
            </button>
            <button className="btn btn-outline" id="category-modal-map-btn" style={{ flex: 1, justifyContent: 'center', height: '46px', fontSize: '14px', border: '2px solid var(--primary-green)' }} onClick={handleMap}>
              📍 View Stalls on Map
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
export { categoryData };
