import React, { useState, useMemo, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function BalconyVisualizerPage() {
  const navigate = useNavigate();
  const { products, addToCart } = useApp();

  // Studio Spaces
  const SPACES = [
    {
      id: 'balcony',
      name: 'Apartment Balcony',
      subtitle: 'Deck tiles, railing & skyline',
      icon: '🏙️',
      bgGradient: 'linear-gradient(180deg, #cbe3fb 0%, #e8f5e9 60%, #bcaaa4 100%)',
      wallColor: '#f1f5f9',
      floorColor: '#a1887f',
      spots: [
        { id: 'spot-floor-left', label: 'Left Floor Corner', x: 14, y: 68, type: 'floor' },
        { id: 'spot-stand-center', label: 'Plant Stand / Pedestal', x: 38, y: 56, type: 'stand' },
        { id: 'spot-railing-mid', label: 'Balcony Railing Box', x: 62, y: 44, type: 'railing' },
        { id: 'spot-floor-right', label: 'Right Sunlight Ledge', x: 86, y: 68, type: 'floor' },
        { id: 'spot-hanging-left', label: 'Overhead Ceiling Hook', x: 25, y: 20, type: 'hanging' }
      ]
    },
    {
      id: 'living',
      name: 'Sunny Living Room',
      subtitle: 'Large window, cozy couch & wood floor',
      icon: '🛋️',
      bgGradient: 'linear-gradient(180deg, #fff7ed 0%, #fef3c7 40%, #e2e8f0 100%)',
      wallColor: '#f8fafc',
      floorColor: '#d7ccc8',
      spots: [
        { id: 'spot-window-corner', label: 'Window Sunlight Bay', x: 18, y: 66, type: 'floor' },
        { id: 'spot-coffee-table', label: 'Coffee Table / Console', x: 48, y: 60, type: 'table' },
        { id: 'spot-bookshelf', label: 'Floating Wooden Shelf', x: 78, y: 34, type: 'shelf' },
        { id: 'spot-floor-accent', label: 'Sofa Accent Corner', x: 84, y: 70, type: 'floor' }
      ]
    },
    {
      id: 'workdesk',
      name: 'Work Desk & Study',
      subtitle: 'Ergonomic table, monitor & focus nook',
      icon: '💻',
      bgGradient: 'linear-gradient(180deg, #f1f5f9 0%, #e2e8f0 50%, #cbd5e1 100%)',
      wallColor: '#ffffff',
      floorColor: '#e2e8f0',
      spots: [
        { id: 'spot-desk-left', label: 'Desk Monitor Left', x: 22, y: 55, type: 'table' },
        { id: 'spot-desk-right', label: 'Desk Sunlight Right', x: 74, y: 55, type: 'table' },
        { id: 'spot-top-shelf', label: 'Overhead Pin Board Shelf', x: 48, y: 26, type: 'shelf' }
      ]
    }
  ];

  // Sunlight Options
  const SUNLIGHT_LEVELS = [
    { id: 'direct', label: 'Direct Afternoon Sun', hours: '5-6+ hrs direct rays', icon: '☀️' },
    { id: 'bright_indirect', label: 'Bright Indirect Morning Sun', hours: 'East-facing window', icon: '🌤️' },
    { id: 'medium', label: 'Filtered / Dappled Light', hours: 'Sheer curtains', icon: '⛅' },
    { id: 'low', label: 'Low Light / Shady Corner', hours: 'North window or room corner', icon: '☁️' }
  ];

  // State
  const [selectedSpaceId, setSelectedSpaceId] = useState('balcony');
  const [selectedSunlight, setSelectedSunlight] = useState('bright_indirect');
  const [hasPets, setHasPets] = useState(false);
  const [activePaletteTab, setActivePaletteTab] = useState('floor'); // 'floor' | 'table' | 'hanging' | 'planters'
  const [placedItems, setPlacedItems] = useState({
    'spot-floor-left': products[0] || null,
    'spot-stand-center': products[1] || null,
    'spot-railing-mid': products[2] || null
  });
  const [activeSpotId, setActiveSpotId] = useState('spot-floor-left');
  const [addedToCartBanner, setAddedToCartBanner] = useState(false);
  const [sharedToast, setSharedToast] = useState('');

  const currentSpace = SPACES.find(s => s.id === selectedSpaceId) || SPACES[0];

  // Filter Catalog Plants by Category / Type
  const catalogPlants = useMemo(() => {
    return products.filter(p => p.type === 'plant' || !p.type);
  }, [products]);

  const paletteItems = useMemo(() => {
    if (activePaletteTab === 'floor') {
      return catalogPlants.filter(p => 
        (p.height && (p.height.includes('ft') || p.height.includes('Medium') || p.height.includes('Large') || p.height.includes('Tall'))) ||
        p.category === 'Indoor Plants' || p.category === 'Outdoor Plants'
      );
    }
    if (activePaletteTab === 'table') {
      return catalogPlants.filter(p => 
        p.category === 'Flowering Plants' || p.category === 'Air Purifying Plants' || p.category === 'Succulents' || (p.height && p.height.includes('Small'))
      );
    }
    if (activePaletteTab === 'hanging') {
      return catalogPlants.filter(p => 
        p.name.toLowerCase().includes('pothos') || 
        p.name.toLowerCase().includes('ivy') || 
        p.name.toLowerCase().includes('fern') || 
        p.name.toLowerCase().includes('hanging') ||
        p.category === 'Indoor Plants'
      );
    }
    // Planters & Stands
    return [
      {
        id: 'acc-ceramic-pot',
        name: 'Matte White Ceramic Planter (8 Inch)',
        price: 249,
        images: ['https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400&auto=format&fit=crop&q=80'],
        isAccessory: true,
        type: 'pot'
      },
      {
        id: 'acc-bamboo-stand',
        name: 'Tiered Eco-Bamboo Corner Plant Stand',
        price: 499,
        images: ['https://images.unsplash.com/photo-1545241047-6083a3684587?w=400&auto=format&fit=crop&q=80'],
        isAccessory: true,
        type: 'stand'
      },
      {
        id: 'acc-brass-planter',
        name: 'Hammered Golden Brass Hanging Planter',
        price: 349,
        images: ['https://images.unsplash.com/photo-1512428813834-c702c7702b78?w=400&auto=format&fit=crop&q=80'],
        isAccessory: true,
        type: 'hanging'
      }
    ];
  }, [catalogPlants, activePaletteTab]);

  // Place Item on Spot
  const handlePlaceItem = (item) => {
    setPlacedItems(prev => ({
      ...prev,
      [activeSpotId]: item
    }));
  };

  const handleClearSpot = (spotId, e) => {
    e.stopPropagation();
    setPlacedItems(prev => {
      const copy = { ...prev };
      delete copy[spotId];
      return copy;
    });
  };

  // Applied Plants List
  const placedList = Object.values(placedItems).filter(Boolean);

  // Calculations: Oxygen, Air Purify, Compatibility, Pricing
  const totalCost = placedList.reduce((sum, item) => sum + (item.price || 0), 0);
  const bundleDiscount = Math.round(totalCost * 0.15);
  const finalBundlePrice = totalCost - bundleDiscount;

  // Compatibility Score Engine
  const compatibilityMetrics = useMemo(() => {
    if (placedList.length === 0) return { score: 100, warnings: [], oxygen: 0, petSafe: true };

    let totalOxygen = 0;
    let warnings = [];
    let hasToxicToPets = false;

    placedList.forEach(item => {
      if (item.isAccessory) return;
      
      totalOxygen += (item.airPurificationScore || 7) * 0.4;

      if (!item.petFriendly && hasPets) {
        hasToxicToPets = true;
        warnings.push(`${item.name} is not pet-safe. Keep elevated out of dog/cat reach.`);
      }

      const lightReq = (item.careInstructions?.sunlight || '').toLowerCase();
      if (selectedSunlight === 'direct' && (lightReq.includes('low') || lightReq.includes('indirect') || lightReq.includes('shade'))) {
        warnings.push(`${item.name} prefers indirect light; afternoon sun may scorch foliage.`);
      } else if (selectedSunlight === 'low' && (lightReq.includes('direct') || lightReq.includes('full sun'))) {
        warnings.push(`${item.name} needs more sunlight than this shady spot provides.`);
      }
    });

    const score = Math.max(60, 100 - warnings.length * 12);
    return {
      score,
      warnings,
      oxygen: totalOxygen.toFixed(1),
      petSafe: !hasToxicToPets
    };
  }, [placedList, selectedSunlight, hasPets]);

  // Starter Template Presets
  const applyPreset = (presetName) => {
    if (presetName === 'bangalore') {
      setSelectedSpaceId('balcony');
      setSelectedSunlight('bright_indirect');
      setPlacedItems({
        'spot-floor-left': catalogPlants.find(p => p.name.includes('Palm')) || catalogPlants[0],
        'spot-stand-center': catalogPlants.find(p => p.name.includes('Monstera')) || catalogPlants[1],
        'spot-railing-mid': catalogPlants.find(p => p.name.includes('Pothos')) || catalogPlants[2],
        'spot-floor-right': catalogPlants.find(p => p.name.includes('Snake')) || catalogPlants[3]
      });
    } else if (presetName === 'workdesk') {
      setSelectedSpaceId('workdesk');
      setSelectedSunlight('medium');
      setPlacedItems({
        'spot-desk-left': catalogPlants.find(p => p.name.includes('ZZ')) || catalogPlants[1],
        'spot-desk-right': catalogPlants.find(p => p.name.includes('Lily')) || catalogPlants[2],
        'spot-top-shelf': catalogPlants.find(p => p.name.includes('Pothos')) || catalogPlants[0]
      });
    } else if (presetName === 'petfriendly') {
      setSelectedSpaceId('balcony');
      setSelectedSunlight('bright_indirect');
      setHasPets(true);
      const safePlants = catalogPlants.filter(p => p.petFriendly);
      setPlacedItems({
        'spot-floor-left': safePlants[0] || catalogPlants[0],
        'spot-stand-center': safePlants[1] || catalogPlants[1],
        'spot-railing-mid': safePlants[2] || catalogPlants[2]
      });
    }
  };

  // Add Entire Bundle to Cart
  const handleAddBundleToCart = () => {
    if (placedList.length === 0) {
      alert('Please place at least one plant on your canvas first.');
      return;
    }

    placedList.forEach(item => {
      addToCart({
        ...item,
        quantity: 1
      }, 1);
    });

    setAddedToCartBanner(true);
    setTimeout(() => {
      navigate('/cart');
    }, 1200);
  };

  const handleShareDesign = () => {
    const text = `🌿 Check out my custom ${currentSpace.name} layout on PlantMe.in!\n` +
      `Estimated O₂ Output: +${compatibilityMetrics.oxygen}L/day • Botanical Health Score: ${compatibilityMetrics.score}%\n` +
      `Features: ${placedList.map(p => p.name).join(', ')}\n` +
      `Plan yours in 3D: https://plantme.in/planner`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    setSharedToast('Design link copied for WhatsApp sharing!');
    setTimeout(() => setSharedToast(''), 3500);
  };

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '24px 16px 80px' }}>
      
      {/* Top Banner Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1b4332 0%, #081c15 100%)',
        color: '#ffffff',
        borderRadius: '24px',
        padding: '28px 24px',
        marginBottom: '24px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ background: '#ffb703', color: '#000', fontSize: '11px', fontWeight: 900, padding: '3px 10px', borderRadius: '12px', textTransform: 'uppercase' }}>
              🎨 INTERACTIVE GARDEN STUDIO
            </span>
            <span style={{ background: '#2d6a4f', color: '#d8f3dc', fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '12px' }}>
              Instant 20-Min Delivery
            </span>
          </div>
          <h1 style={{ fontSize: '32px', fontFamily: 'var(--font-serif)', margin: '4px 0 6px 0', color: '#ffffff' }}>
            Balcony & Room Botanical Visualizer
          </h1>
          <p style={{ fontSize: '13.5px', color: '#b7e4c7', margin: 0, maxWidth: '650px' }}>
            Design your dream green space with real-time sunlight validation, NASA oxygen metrics, and 1-click bundle checkout with 15% savings.
          </p>
        </div>

        {/* Quick Inspiration Presets */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => applyPreset('bangalore')}
            style={{
              background: 'rgba(255,255,255,0.15)',
              color: '#ffffff',
              border: '1px solid rgba(255,255,255,0.3)',
              padding: '8px 14px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            🏙️ Bengaluru Balcony
          </button>
          <button
            onClick={() => applyPreset('workdesk')}
            style={{
              background: 'rgba(255,255,255,0.15)',
              color: '#ffffff',
              border: '1px solid rgba(255,255,255,0.3)',
              padding: '8px 14px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            💻 Focus Work Desk
          </button>
          <button
            onClick={() => applyPreset('petfriendly')}
            style={{
              background: 'rgba(255,255,255,0.15)',
              color: '#ffffff',
              border: '1px solid rgba(255,255,255,0.3)',
              padding: '8px 14px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            🐾 100% Pet-Safe
          </button>
        </div>
      </div>

      {/* Control Strip: Space Selector + Sunlight + Pet Toggle */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '20px',
        padding: '16px 20px',
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
      }}>
        {/* Space Picker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto' }}>
          <span style={{ fontSize: '12px', fontWeight: 800, color: '#166534', whiteSpace: 'nowrap' }}>Space:</span>
          {SPACES.map(sp => {
            const isSelected = sp.id === selectedSpaceId;
            return (
              <button
                key={sp.id}
                onClick={() => {
                  setSelectedSpaceId(sp.id);
                  setActiveSpotId(sp.spots[0]?.id || 'spot-floor-left');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  borderRadius: '12px',
                  border: isSelected ? '2px solid #16a34a' : '1px solid #cbd5e1',
                  background: isSelected ? '#dcfce7' : '#ffffff',
                  color: isSelected ? '#166534' : '#475569',
                  fontSize: '12.5px',
                  fontWeight: isSelected ? 800 : 600,
                  cursor: 'pointer'
                }}
              >
                <span>{sp.icon}</span>
                <span>{sp.name}</span>
              </button>
            );
          })}
        </div>

        {/* Sunlight Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto' }}>
          <span style={{ fontSize: '12px', fontWeight: 800, color: '#166534', whiteSpace: 'nowrap' }}>Sunlight:</span>
          {SUNLIGHT_LEVELS.map(sun => {
            const isSelected = sun.id === selectedSunlight;
            return (
              <button
                key={sun.id}
                onClick={() => setSelectedSunlight(sun.id)}
                title={sun.hours}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '6px 12px',
                  borderRadius: '10px',
                  border: isSelected ? '1.5px solid #ca8a04' : '1px solid #cbd5e1',
                  background: isSelected ? '#fef9c3' : '#ffffff',
                  color: isSelected ? '#854d0e' : '#475569',
                  fontSize: '11.5px',
                  fontWeight: isSelected ? 800 : 600,
                  cursor: 'pointer'
                }}
              >
                <span>{sun.icon}</span>
                <span>{sun.label.split(' ')[0]} {sun.label.split(' ')[1]}</span>
              </button>
            );
          })}
        </div>

        {/* Pet Safety Toggle */}
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none', fontSize: '12.5px', fontWeight: 700, color: '#334155' }}>
          <input
            type="checkbox"
            checked={hasPets}
            onChange={(e) => setHasPets(e.target.checked)}
            style={{ width: '16px', height: '16px', accentColor: '#16a34a', cursor: 'pointer' }}
          />
          <span>🐾 Pet-Safe Filter</span>
        </label>
      </div>

      {/* Main Studio Grid: Visual Canvas (Left) + Palette & Metrics (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* LEFT COLUMN: THE VISUAL CANVAS */}
        <div>
          <div style={{
            position: 'relative',
            width: '100%',
            height: '460px',
            borderRadius: '24px',
            background: currentSpace.bgGradient,
            border: '2px solid #e2e8f0',
            boxShadow: '0 12px 36px rgba(0,0,0,0.06)',
            overflow: 'hidden'
          }}>
            {/* Visual Sky & Light Rays Overlay */}
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '40%',
              height: '100%',
              background: selectedSunlight === 'direct' 
                ? 'radial-gradient(circle at 100% 0%, rgba(254, 240, 138, 0.45) 0%, transparent 60%)' 
                : 'radial-gradient(circle at 100% 0%, rgba(255, 255, 255, 0.3) 0%, transparent 50%)',
              pointerEvents: 'none'
            }} />

            {/* Simulated Architecture Floor & Wall Divider */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '35%',
              background: currentSpace.floorColor,
              boxShadow: 'inset 0 4px 16px rgba(0,0,0,0.15)',
              borderTop: '2px solid rgba(0,0,0,0.08)'
            }}>
              {/* Floor Plank Lines */}
              <div style={{
                width: '100%',
                height: '100%',
                backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(0,0,0,0.04) 40px, rgba(0,0,0,0.04) 41px)'
              }} />
            </div>

            {/* Room Architecture Elements */}
            {selectedSpaceId === 'balcony' && (
              <div style={{
                position: 'absolute',
                bottom: '30%',
                left: 0,
                right: 0,
                height: '45px',
                borderTop: '3px solid #64748b',
                borderBottom: '3px solid #64748b',
                backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 24px, #94a3b8 24px, #94a3b8 27px)',
                opacity: 0.85
              }} />
            )}

            {/* Studio Spots & Placed Plants */}
            {currentSpace.spots.map(spot => {
              const placed = placedItems[spot.id];
              const isActive = activeSpotId === spot.id;

              return (
                <div
                  key={spot.id}
                  onClick={() => setActiveSpotId(spot.id)}
                  style={{
                    position: 'absolute',
                    left: `${spot.x}%`,
                    top: `${spot.y}%`,
                    transform: 'translate(-50%, -50%)',
                    cursor: 'pointer',
                    zIndex: spot.type === 'hanging' ? 15 : 10,
                    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                >
                  {placed ? (
                    /* Placed Plant Presentation */
                    <div style={{
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      filter: isActive ? 'drop-shadow(0 0 10px rgba(22, 163, 74, 0.6))' : 'drop-shadow(0 6px 12px rgba(0,0,0,0.18))'
                    }}>
                      <div style={{
                        width: spot.type === 'hanging' ? '80px' : spot.type === 'floor' ? '110px' : '90px',
                        height: spot.type === 'hanging' ? '80px' : spot.type === 'floor' ? '110px' : '90px',
                        borderRadius: '50%',
                        background: '#ffffff',
                        padding: '4px',
                        border: isActive ? '3px solid #16a34a' : '2px solid rgba(255,255,255,0.8)',
                        boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
                        overflow: 'hidden'
                      }}>
                        <img
                          src={placed.images?.[0] || 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=300&auto=format&fit=crop&q=80'}
                          alt={placed.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                        />
                      </div>

                      {/* Item Label Badge */}
                      <div style={{
                        marginTop: '6px',
                        background: 'rgba(15, 23, 42, 0.85)',
                        backdropFilter: 'blur(4px)',
                        color: '#ffffff',
                        fontSize: '10.5px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '10px',
                        whiteSpace: 'nowrap',
                        maxWidth: '120px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {placed.name.split('(')[0].trim()}
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={(e) => handleClearSpot(spot.id, e)}
                        title="Remove Plant"
                        style={{
                          position: 'absolute',
                          top: '-6px',
                          right: '-6px',
                          background: '#ef4444',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '50%',
                          width: '20px',
                          height: '20px',
                          fontSize: '11px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    /* Empty Spot Placeholder Target */
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <div style={{
                        width: '54px',
                        height: '54px',
                        borderRadius: '50%',
                        border: isActive ? '3px dashed #16a34a' : '2px dashed #94a3b8',
                        background: isActive ? 'rgba(220, 252, 231, 0.85)' : 'rgba(255, 255, 255, 0.75)',
                        backdropFilter: 'blur(4px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isActive ? '#16a34a' : '#64748b',
                        fontSize: '20px',
                        fontWeight: 800,
                        boxShadow: isActive ? '0 0 12px rgba(22, 163, 74, 0.4)' : 'none'
                      }}>
                        +
                      </div>
                      <span style={{
                        background: 'rgba(255,255,255,0.85)',
                        padding: '2px 6px',
                        borderRadius: '6px',
                        fontSize: '9.5px',
                        fontWeight: 700,
                        color: '#475569',
                        whiteSpace: 'nowrap'
                      }}>
                        {spot.label}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Active Selected Spot Indicator in bottom bar */}
            <div style={{
              position: 'absolute',
              bottom: '12px',
              left: '12px',
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(8px)',
              color: '#ffffff',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '11.5px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>Target Slot:</span>
              <span style={{ color: '#4ade80' }}>
                {currentSpace.spots.find(s => s.id === activeSpotId)?.label || 'Tap any + circle above'}
              </span>
            </div>

            {/* Quick Share / Screenshot Action */}
            <button
              onClick={handleShareDesign}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: '#ffffff',
                border: 'none',
                padding: '8px 14px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 800,
                color: '#166534',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
            >
              <span>💬</span> Share Layout
            </button>
          </div>

          {/* Toast Notification */}
          {sharedToast && (
            <div style={{ marginTop: '10px', background: '#dcfce7', color: '#166534', padding: '8px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: 700 }}>
              ✓ {sharedToast}
            </div>
          )}

          {/* NASA Clean Air & Environmental Stats Card */}
          <div style={{
            marginTop: '16px',
            background: '#ffffff',
            borderRadius: '20px',
            border: '1px solid #e2e8f0',
            padding: '18px 20px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '14px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
          }}>
            <div>
              <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>COMPATIBILITY</div>
              <div style={{ fontSize: '20px', fontWeight: 900, color: compatibilityMetrics.score >= 85 ? '#16a34a' : '#d97706', marginTop: '2px' }}>
                {compatibilityMetrics.score}% Match
              </div>
            </div>
            <div>
              <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>OXYGEN PRODUCTION</div>
              <div style={{ fontSize: '20px', fontWeight: 900, color: '#16a34a', marginTop: '2px' }}>
                +{compatibilityMetrics.oxygen} L / Day
              </div>
            </div>
            <div>
              <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>PET SAFETY</div>
              <div style={{ fontSize: '20px', fontWeight: 900, color: compatibilityMetrics.petSafe ? '#16a34a' : '#dc2626', marginTop: '2px' }}>
                {compatibilityMetrics.petSafe ? '100% Safe' : 'Alert ⚠️'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>DELIVERY WINDOW</div>
              <div style={{ fontSize: '20px', fontWeight: 900, color: '#2563eb', marginTop: '2px' }}>
                20 Mins EV
              </div>
            </div>
          </div>

          {/* Warnings / Advice Alert if any */}
          {compatibilityMetrics.warnings.length > 0 && (
            <div style={{ marginTop: '12px', background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '14px', padding: '12px 16px', fontSize: '12px', color: '#92400e' }}>
              <strong>Botanist Advice:</strong>
              <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                {compatibilityMetrics.warnings.map((w, idx) => (
                  <li key={idx} style={{ marginTop: '2px' }}>{w}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: BOTANICAL PALETTE & 1-CLICK BUNDLE CHECKOUT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Palette Selector Tabs */}
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            border: '1px solid #e2e8f0',
            padding: '16px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                Botanical Palette
              </h3>
              <span style={{ fontSize: '11px', color: '#64748b' }}>
                Tap plant to assign to selected slot
              </span>
            </div>

            {/* Palette Tabs */}
            <div style={{ display: 'flex', gap: '6px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px', marginBottom: '14px' }}>
              {[
                { id: 'floor', label: 'Floor Plants' },
                { id: 'table', label: 'Tabletop' },
                { id: 'hanging', label: 'Hanging' },
                { id: 'planters', label: 'Pots & Stands' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActivePaletteTab(tab.id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: activePaletteTab === tab.id ? '#166534' : '#f8fafc',
                    color: activePaletteTab === tab.id ? '#ffffff' : '#64748b',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Plants Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
              gap: '10px',
              maxHeight: '320px',
              overflowY: 'auto',
              paddingRight: '4px'
            }}>
              {paletteItems.map(item => (
                <div
                  key={item.id}
                  onClick={() => handlePlaceItem(item)}
                  style={{
                    background: '#f8fafc',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = '#16a34a';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <img
                    src={item.images?.[0] || 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=200&auto=format&fit=crop&q=80'}
                    alt={item.name}
                    style={{ width: '60px', height: '60px', borderRadius: '10px', objectFit: 'cover', marginBottom: '6px' }}
                  />
                  <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#1e293b', lineHeight: 1.2, height: '28px', overflow: 'hidden' }}>
                    {item.name.split('(')[0].trim()}
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#16a34a', marginTop: '4px' }}>
                    ₹{item.price}
                  </div>
                  <button
                    style={{
                      marginTop: '6px',
                      background: '#dcfce7',
                      color: '#166534',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '3px 8px',
                      fontSize: '10px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      width: '100%'
                    }}
                  >
                    + Place Here
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 1-CLICK BUNDLE CHECKOUT CARD */}
          <div style={{
            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
            border: '2px solid #86efac',
            borderRadius: '24px',
            padding: '24px',
            boxShadow: '0 8px 24px rgba(22, 163, 74, 0.12)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 900, color: '#166534', textTransform: 'uppercase' }}>
                  COMPLETE GARDEN BUNDLE
                </span>
                <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '2px 0 0 0' }}>
                  {placedList.length} Items Configured
                </h4>
              </div>
              <span style={{ background: '#16a34a', color: '#ffffff', fontSize: '11.5px', fontWeight: 800, padding: '4px 10px', borderRadius: '10px' }}>
                Save 15%
              </span>
            </div>

            {/* Itemized List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px', maxHeight: '140px', overflowY: 'auto' }}>
              {placedList.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', color: '#334155' }}>
                  <span>• {item.name.split('(')[0].trim()}</span>
                  <strong>₹{item.price}</strong>
                </div>
              ))}
              {placedList.length === 0 && (
                <div style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic' }}>
                  No plants placed on the canvas yet.
                </div>
              )}
            </div>

            {/* Price Calculations */}
            <div style={{ borderTop: '1px solid #bbf7d0', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                <span>Subtotal MRP:</span>
                <span>₹{totalCost}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#166534', fontWeight: 700 }}>
                <span>Bundle Savings (15%):</span>
                <span>-₹{bundleDiscount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#166534' }}>
                <span>Hydration Wrap & Bio-Nutrients:</span>
                <span>FREE</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 900, color: '#0f172a', marginTop: '6px' }}>
                <span>Total Payable:</span>
                <span style={{ color: '#16a34a' }}>₹{finalBundlePrice}</span>
              </div>
            </div>

            {/* Order Bundle Button */}
            <button
              onClick={handleAddBundleToCart}
              disabled={placedList.length === 0}
              style={{
                width: '100%',
                marginTop: '16px',
                background: placedList.length > 0 ? 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)' : '#cbd5e1',
                color: '#ffffff',
                border: 'none',
                padding: '14px',
                borderRadius: '14px',
                fontSize: '14px',
                fontWeight: 800,
                cursor: placedList.length > 0 ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: placedList.length > 0 ? '0 6px 16px rgba(22, 163, 74, 0.25)' : 'none'
              }}
            >
              <span>🛒</span>
              <span>Order Complete Balcony Garden (₹{finalBundlePrice})</span>
            </button>

            {addedToCartBanner && (
              <div style={{ marginTop: '10px', textAlign: 'center', fontSize: '12.5px', color: '#166534', fontWeight: 800 }}>
                ✓ Garden bundle added to cart! Redirecting to checkout...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
