import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';

export default function NurseryStoriesModal({ stories = [], initialStoryIndex = 0, onClose }) {
  const { addToCart, products = [] } = useApp();
  const [currentStoryIdx, setCurrentStoryIdx] = useState(initialStoryIndex || 0);
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [reactionSent, setReactionSent] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [addedPlantBanner, setAddedPlantBanner] = useState(false);

  // Prevent background scrolling while modal is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const SLIDE_DURATION = 5000; // 5 seconds per slide
  const currentStory = stories[currentStoryIdx] || stories[0] || {};
  const rawSlides = currentStory?.slides || [];
  const slides = rawSlides.length > 0 ? rawSlides : [{
    id: 's_default',
    media: currentStory?.vendorAvatar || '/images/golden_pothos.png',
    mediaType: 'image',
    caption: '🌿 Fresh botanical batch arrival inspected by PlantMe experts. 20-min express delivery!',
    timestamp: 'Today',
    plantName: currentStory?.batchTitle || currentStory?.vendorName || 'Botanical Special',
    price: 199,
    stock: 5
  }];
  const currentSlide = slides[currentSlideIdx] || slides[0] || {};

  // Safely match plant in catalog
  const catalogPlant = Array.isArray(products) ? products.find(p => p && (
    (currentSlide?.plantId && p.id === currentSlide.plantId) || 
    (p.name && currentSlide?.plantName && typeof p.name === 'string' && typeof currentSlide.plantName === 'string' && p.name.toLowerCase().includes(currentSlide.plantName.toLowerCase()))
  )) : null;

  // Timer & Progress Bar Loop
  useEffect(() => {
    if (!currentSlide || isPaused) return;

    setProgress(0);
    const intervalTime = 50;
    const step = (intervalTime / SLIDE_DURATION) * 100;

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          handleNextSlide();
          return 0;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [currentStoryIdx, currentSlideIdx, isPaused]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') handleNextSlide();
      else if (e.key === 'ArrowLeft') handlePrevSlide();
      else if (e.key === 'Escape') onClose();
      else if (e.key === ' ') setIsPaused(p => !p);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStoryIdx, currentSlideIdx]);

  const handleNextSlide = () => {
    if (currentSlideIdx < slides.length - 1) {
      setCurrentSlideIdx(prev => prev + 1);
      setProgress(0);
    } else if (currentStoryIdx < stories.length - 1) {
      setCurrentStoryIdx(prev => prev + 1);
      setCurrentSlideIdx(0);
      setProgress(0);
    } else {
      onClose(); // Completed all stories
    }
  };

  const handlePrevSlide = () => {
    if (currentSlideIdx > 0) {
      setCurrentSlideIdx(prev => prev - 1);
      setProgress(0);
    } else if (currentStoryIdx > 0) {
      const prevStory = stories[currentStoryIdx - 1];
      setCurrentStoryIdx(prev => prev - 1);
      setCurrentSlideIdx((prevStory?.slides?.length || 1) - 1);
      setProgress(0);
    }
  };

  const handleSendReaction = async (emoji) => {
    setReactionSent(emoji);
    try {
      if (currentStory?.id) {
        await api.reactToStory(currentStory.id, { emoji, plantId: currentSlide.plantId });
      }
    } catch (e) {}
    setTimeout(() => setReactionSent(''), 2500);
  };

  const handleSendQuestion = async (e) => {
    e.preventDefault();
    if (!questionText.trim()) return;
    try {
      if (currentStory?.id) {
        await api.reactToStory(currentStory.id, { comment: questionText, plantId: currentSlide.plantId });
      }
    } catch (e) {}
    setReactionSent('Message sent to botanical concierge!');
    setQuestionText('');
    setTimeout(() => setReactionSent(''), 3000);
  };

  const handleOrderSlidePlant = () => {
    const itemToAdd = catalogPlant || {
      id: currentSlide.plantId || `story_p_${Date.now()}`,
      name: currentSlide.plantName || currentStory.batchTitle || 'Botanical Special',
      price: currentSlide.price || 199,
      images: [currentSlide.media || '/images/golden_pothos.png'],
      rating: 4.8,
      reviewsCount: 24,
      quantity: currentSlide.stock || 5
    };

    addToCart(itemToAdd, 1);
    setAddedPlantBanner(true);
    setTimeout(() => setAddedPlantBanner(false), 3000);
  };

  const modalNode = (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 999999,
        background: 'rgba(0, 0, 0, 0.88)',
        backdropFilter: 'blur(14px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        boxSizing: 'border-box'
      }}
    >
      
      {/* Story Container Frame */}
      <div 
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '420px',
          height: '92vh',
          maxHeight: '760px',
          borderRadius: '24px',
          overflow: 'hidden',
          background: '#090d0b',
          boxShadow: '0 24px 60px rgba(0,0,0,0.7)',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid rgba(255,255,255,0.15)',
          boxSizing: 'border-box'
        }}
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >

        {/* Media Background */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
          <img
            src={currentSlide.media || '/images/golden_pothos.png'}
            alt={currentSlide.plantName || 'Plant'}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/images/golden_pothos.png';
            }}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'brightness(0.92)'
            }}
          />
          {/* Top & Bottom Vignette Overlays */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '160px',
            background: 'linear-gradient(180deg, rgba(0,0,0,0.85) 0%, transparent 100%)',
            pointerEvents: 'none'
          }} />
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '260px',
            background: 'linear-gradient(0deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.65) 60%, transparent 100%)',
            pointerEvents: 'none'
          }} />
        </div>

        {/* Tap Interaction Zones (Left = Prev, Right = Next) */}
        <div 
          onClick={handlePrevSlide}
          style={{ position: 'absolute', top: '90px', bottom: '200px', left: 0, width: '40%', zIndex: 5, cursor: 'pointer' }}
          title="Previous slide"
        />
        <div 
          onClick={handleNextSlide}
          style={{ position: 'absolute', top: '90px', bottom: '200px', right: 0, width: '40%', zIndex: 5, cursor: 'pointer' }}
          title="Next slide"
        />

        {/* HEADER CONTROLS (Z-Index 10) */}
        <div style={{ position: 'relative', zIndex: 10, padding: '16px 16px 8px' }}>
          
          {/* Segmented Progress Bars */}
          <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
            {slides.map((s, idx) => {
              let fillPercent = 0;
              if (idx < currentSlideIdx) fillPercent = 100;
              else if (idx === currentSlideIdx) fillPercent = progress;

              return (
                <div 
                  key={s.id || idx}
                  style={{
                    flex: 1,
                    height: '3.5px',
                    borderRadius: '2px',
                    background: 'rgba(255, 255, 255, 0.35)',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{
                    width: `${fillPercent}%`,
                    height: '100%',
                    background: '#22c55e',
                    transition: idx === currentSlideIdx ? 'width 0.05s linear' : 'none'
                  }} />
                </div>
              );
            })}
          </div>

          {/* Unboxing Hub Info & Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img
                src={currentStory.vendorAvatar || currentSlide.media || '/images/golden_pothos.png'}
                alt={currentStory.batchTitle || 'PlantMe Hub'}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/images/golden_pothos.png';
                }}
                style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #22c55e' }}
              />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#ffffff' }}>
                    {currentStory.batchTitle || currentStory.vendorName || 'PlantMe Botanical Hub'}
                  </span>
                  <span style={{ background: '#22c55e', color: '#000', fontSize: '9px', fontWeight: 900, padding: '1px 5px', borderRadius: '6px' }}>
                    {currentStory.badge || '✓ VERIFIED'}
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: '#d1d5db', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                  <span>{currentStory.distance || '20m Delivery'}</span>
                  <span>•</span>
                  <span>{currentSlide.timestamp || 'Fresh Batch'}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => setIsPaused(p => !p)}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  color: '#ffffff',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title={isPaused ? "Play" : "Pause"}
              >
                {isPaused ? '▶' : '⏸'}
              </button>
              <button
                onClick={onClose}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  color: '#ffffff',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Close"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        {/* REACTION TOAST FLOAT */}
        {reactionSent && (
          <div style={{
            position: 'absolute',
            top: '40%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 30,
            background: 'rgba(0,0,0,0.85)',
            border: '1.5px solid #22c55e',
            color: '#ffffff',
            padding: '12px 24px',
            borderRadius: '24px',
            fontSize: '14px',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            animation: 'fadeIn 0.2s ease'
          }}>
            <span>✓</span> {reactionSent}
          </div>
        )}

        {/* BOTTOM CONTENT: CAPTION, PRODUCT TAG, AND QUICK ORDER (Z-Index 10) */}
        <div style={{ position: 'relative', zIndex: 10, marginTop: 'auto', padding: '16px' }}>
          
          {/* Caption */}
          <p style={{
            fontSize: '13.5px',
            color: '#ffffff',
            lineHeight: 1.45,
            margin: '0 0 14px 0',
            textShadow: '0 2px 4px rgba(0,0,0,0.8)',
            fontWeight: 500
          }}>
            {currentSlide.caption || '🌿 Fresh inspected live plant batch. Zero leaf defects, guaranteed thrive!'}
          </p>

          {/* Product Card Shelf Tag */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.88)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.18)',
            borderRadius: '18px',
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            marginBottom: '12px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.35)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img
                src={currentSlide.media || '/images/golden_pothos.png'}
                alt={currentSlide.plantName}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/images/golden_pothos.png';
                }}
                style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.2)' }}
              />
              <div>
                <span style={{ fontSize: '10px', background: '#dcfce7', color: '#166534', fontWeight: 800, padding: '2px 6px', borderRadius: '6px' }}>
                  ● {currentSlide.stock ? `Only ${currentSlide.stock} left in stock` : 'Batch Inspected'}
                </span>
                <h4 style={{ fontSize: '13.5px', fontWeight: 800, color: '#ffffff', margin: '3px 0 1px 0' }}>
                  {currentSlide.plantName || currentStory.batchTitle || 'Fresh Plant Arrival'}
                </h4>
                <div style={{ fontSize: '13px', fontWeight: 900, color: '#4ade80' }}>
                  ₹{currentSlide.price || 199}
                </div>
              </div>
            </div>

            <button
              onClick={handleOrderSlidePlant}
              style={{
                background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '9px 14px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 900,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 12px rgba(22, 163, 74, 0.35)'
              }}
            >
              <span>⚡</span> Order (20 Min)
            </button>
          </div>

          {addedPlantBanner && (
            <div style={{ background: '#22c55e', color: '#000', fontSize: '11.5px', fontWeight: 800, padding: '6px 12px', borderRadius: '10px', marginBottom: '8px', textAlign: 'center' }}>
              ✓ Added to cart! Ready for 20-min express delivery.
            </div>
          )}

          {/* Quick Emoji Reaction Buttons & Question Bar */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '4px' }}>
              {['🌿', '😍', '❤️', '🔥'].map(emoji => (
                <button
                  key={emoji}
                  onClick={() => handleSendReaction(emoji)}
                  style={{
                    background: 'rgba(255,255,255,0.18)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '36px',
                    height: '36px',
                    fontSize: '18px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'transform 0.15s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.15)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  {emoji}
                </button>
              ))}
            </div>

            <form onSubmit={handleSendQuestion} style={{ flex: 1, display: 'flex', gap: '6px' }}>
              <input
                type="text"
                placeholder="Ask PlantMe botanist..."
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.18)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '20px',
                  padding: '8px 14px',
                  color: '#ffffff',
                  fontSize: '12px',
                  outline: 'none'
                }}
              />
              <button
                type="submit"
                style={{
                  background: '#22c55e',
                  border: 'none',
                  borderRadius: '50%',
                  width: '34px',
                  height: '34px',
                  color: '#000',
                  fontSize: '13px',
                  fontWeight: 900,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ➤
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalNode, document.body);
}
