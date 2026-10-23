import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import NurseryStoriesModal from './modals/NurseryStoriesModal';

export default function NurseryStoriesBar() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStoryIdx, setActiveStoryIdx] = useState(null);

  useEffect(() => {
    let active = true;
    const fetchStories = async () => {
      try {
        const res = await api.getStories();
        if (active && res.success && res.stories) {
          setStories(res.stories);
        }
      } catch (err) {
        console.warn('Fallback stories load', err);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchStories();
    return () => { active = false; };
  }, []);

  if (stories.length === 0 && !loading) return null;

  return (
    <>
      <style>{`
        @keyframes storyPulseRing {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.08); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }
        .story-ring-animated {
          background: linear-gradient(135deg, #22c55e 0%, #eab308 50%, #16a34a 100%);
          padding: 2.5px;
          border-radius: 50%;
          cursor: pointer;
          transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .story-ring-animated:hover {
          transform: scale(1.06);
        }
      `}</style>

      <section style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', background: '#dcfce7', color: '#166534', fontWeight: 900, padding: '3px 8px', borderRadius: '8px', textTransform: 'uppercase' }}>
              ● LIVE NURSERY STORIES
            </span>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--dark)', margin: 0 }}>
              Today's Fresh Unboxings Nearby
            </h3>
          </div>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
            Inspected batches ready for 20-min delivery
          </span>
        </div>

        {/* Horizontal Scroll Circles */}
        <div style={{
          display: 'flex',
          gap: '18px',
          overflowX: 'auto',
          paddingBottom: '8px',
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch'
        }}>
          {stories.map((story, idx) => (
            <div
              key={story.id || idx}
              onClick={() => setActiveStoryIdx(idx)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                flexShrink: 0,
                width: '78px'
              }}
            >
              <div className="story-ring-animated">
                <div style={{
                  background: '#ffffff',
                  padding: '2px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <img
                    src={story.vendorAvatar}
                    alt={story.vendorName}
                    style={{
                      width: '62px',
                      height: '62px',
                      borderRadius: '50%',
                      objectFit: 'cover'
                    }}
                  />
                </div>
              </div>

              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#1e293b',
                textAlign: 'center',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                width: '100%'
              }}>
                {story.vendorName.split(' ')[0]} {story.vendorName.split(' ')[1] || ''}
              </span>
              <span style={{
                fontSize: '10px',
                color: '#16a34a',
                fontWeight: 800,
                marginTop: '-4px'
              }}>
                {story.distance}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Story Viewer Modal */}
      {activeStoryIdx !== null && (
        <NurseryStoriesModal
          stories={stories}
          initialStoryIndex={activeStoryIdx}
          onClose={() => setActiveStoryIdx(null)}
        />
      )}
    </>
  );
}
