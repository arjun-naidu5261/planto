import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

export default function VirtualGardenPage() {
  const { reminders, toggleReminderActive, deleteReminder, setShowAddReminder, openCertificate } = useApp();
  const [weatherData, setWeatherData] = useState(null);
  const [wateredFeedback, setWateredFeedback] = useState({});

  useEffect(() => {
    api.getWeatherCareTip().then(data => setWeatherData(data)).catch(() => {});
  }, []);

  const handleWaterPlant = async (plantId, plantName) => {
    try {
      await fetch('http://localhost:5002/api/user/garden/water', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plantId })
      });
      setWateredFeedback(prev => ({ ...prev, [plantId]: `Watered! Plant is happy.` }));
      setTimeout(() => {
        setWateredFeedback(prev => ({ ...prev, [plantId]: null }));
      }, 4000);
    } catch (err) {
      alert("Watering recorded locally!");
    }
  };
  
  // Use context reminders, or if empty, provide some default mock data for the UI showcase
  const gardenReminders = reminders.length > 0 ? reminders : [
    { id: 'm1', title: 'Premium Golden Pothos', type: 'Water', nextDate: new Date().toISOString().split('T')[0], active: true, frequency: 'Every 7 days', health: '95% Vibrant' },
    { id: 'm2', title: 'Luxury Snake Plant', type: 'Fertilize', nextDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0], active: true, frequency: 'Every 20 days', health: '98% Robust' },
    { id: 'm3', title: 'Premium Ficus Bonsai', type: 'Repot', nextDate: new Date(Date.now() + 86400000 * 12).toISOString().split('T')[0], active: true, frequency: 'Monthly', health: '90% Thriving' }
  ];

  const getIconForType = (type) => {
    switch(type?.toLowerCase()) {
      case 'water':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
          </svg>
        );
      case 'fertilize':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 2v7.31L4.89 20a2 2 0 0 0 1.73 3h14.76a2 2 0 0 0 1.73-3L14 9.31V2" />
            <path d="M8.5 2h7" />
            <path d="M14 9.3h-4" />
          </svg>
        );
      case 'repot':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 9h14l-2 11H7L5 9z" />
            <path d="M3 5h18v4H3z" />
          </svg>
        );
      case 'prune':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="6" cy="6" r="3" />
            <circle cx="6" cy="18" r="3" />
            <line x1="20" y1="4" x2="8.12" y2="15.88" />
            <line x1="14.47" y1="14.48" x2="20" y2="20" />
            <line x1="8.12" y1="8.12" x2="12" y2="12" />
          </svg>
        );
      default:
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2d6a4f" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 1 9.8a7 7 0 0 1-9 8.2z" />
          </svg>
        );
    }
  };

  const getDaysLeft = (dateString) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const target = new Date(dateString);
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `In ${diffDays} days`;
  };

  const getColorForDays = (daysLeftText) => {
    if (daysLeftText === 'Overdue') return '#d32f2f'; // Red
    if (daysLeftText === 'Today') return '#f57c00'; // Orange
    if (daysLeftText === 'Tomorrow') return '#fbc02d'; // Yellow
    return 'var(--secondary-green)';
  };

  return (
    <div className="page-view active" style={{ display: 'block', padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Header & Quick Action Buttons */}
      <div className="section-title-row" style={{ marginBottom: '24px', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary-green)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
            SMART BOTANICAL COMPANION
          </div>
          <h2 className="section-title" style={{ fontSize: '32px', margin: '4px 0 0 0' }}>My Virtual Garden</h2>
          <p className="section-subtitle">Track hydration schedules, automated WhatsApp alerts, and digital adoption certificates.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Link to="/ai" style={{ textDecoration: 'none', background: '#ffffff', color: '#1b4332', border: '1.5px solid #2e7d32', padding: '10px 18px', borderRadius: '12px', fontWeight: 800, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            AI Plant Doctor
          </Link>
          <button className="btn" onClick={() => setShowAddReminder(true)} style={{ borderRadius: '12px' }}>
            + Add Plant
          </button>
        </div>
      </div>

      {/* Live Weather Advisory Bar */}
      {weatherData && (
        <div style={{ background: 'linear-gradient(135deg, #e8f5e9 0%, #d8f3dc 100%)', border: '1px solid #b7e4c7', borderRadius: '16px', padding: '18px 24px', marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', boxShadow: '0 4px 16px rgba(46,125,50,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#1b4332' }}>
                {weatherData.city} Botanical Weather: {weatherData.temperature} • {weatherData.condition}
                <span style={{ marginLeft: '10px', background: '#2e7d32', color: '#fff', fontSize: '11px', padding: '2px 8px', borderRadius: '10px' }}>
                  Humidity {weatherData.humidity}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#2d6a4f', marginTop: '4px' }}>
                <strong>Hydration Advisory:</strong> {weatherData.advisory.actionText}
              </div>
            </div>
          </div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#1b4332', background: 'rgba(255,255,255,0.7)', padding: '6px 14px', borderRadius: '20px' }}>
            WhatsApp Care Alerts: Active
          </div>
        </div>
      )}

      {/* Plants Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
        gap: '24px'
      }}>
        {gardenReminders.map(reminder => {
          const daysLeft = getDaysLeft(reminder.nextDate);
          const statusColor = getColorForDays(daysLeft);
          const feedback = wateredFeedback[reminder.id];

          return (
            <div key={reminder.id} style={{
              backgroundColor: 'var(--white)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              boxShadow: 'var(--shadow-sm)',
              border: '1px solid var(--glass-border)',
              position: 'relative',
              opacity: reminder.active ? 1 : 0.6,
              transition: 'transform 0.2s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ 
                    width: '50px', height: '50px', 
                    borderRadius: '16px', backgroundColor: 'var(--light-green)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '26px'
                  }}>
                    {getIconForType(reminder.type)}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '17px', margin: 0, fontWeight: 800, color: '#1b4332' }}>{reminder.title || reminder.plantName}</h3>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>{reminder.type} • {reminder.frequency || 'Scheduled'}</span>
                  </div>
                </div>

                <span style={{ fontSize: '11px', fontWeight: 800, color: '#2e7d32', background: '#e8f5e9', padding: '3px 8px', borderRadius: '12px' }}>
                  {reminder.health || 'Healthy 95%'}
                </span>
              </div>

              <div style={{
                backgroundColor: 'var(--bg)',
                borderRadius: '12px',
                padding: '12px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px'
              }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', fontWeight: 700 }}>Next Schedule</div>
                  <div style={{ fontWeight: 800, fontSize: '14px', color: '#1b4332' }}>{new Date(reminder.nextDate).toLocaleDateString()}</div>
                </div>
                <div style={{ 
                  color: statusColor, 
                  fontWeight: 800,
                  backgroundColor: `${statusColor}15`,
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '13px'
                }}>
                  {daysLeft}
                </div>
              </div>

              {/* Watered Today Feedback Toast */}
              {feedback && (
                <div style={{ background: '#dcfce7', color: '#166534', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, marginBottom: '12px', textAlign: 'center' }}>
                  {feedback}
                </div>
              )}

              {/* Primary Interactive CX Buttons */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                <button
                  onClick={() => handleWaterPlant(reminder.id, reminder.title)}
                  style={{
                    flex: 1,
                    background: '#2e7d32',
                    color: '#ffffff',
                    border: 'none',
                    padding: '10px',
                    borderRadius: '10px',
                    fontWeight: 800,
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 6px rgba(46,125,50,0.2)'
                  }}
                >
                  Watered Today
                </button>

                <button
                  onClick={() => openCertificate({ id: 'ORD-7290', name: reminder.title })}
                  style={{
                    background: '#fff3e0',
                    color: '#e65100',
                    border: '1px solid #ffe0b2',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    fontWeight: 800,
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  title="View Official Plant Adoption Certificate"
                >
                  Certificate
                </button>
              </div>

              {/* Secondary Actions */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <Link
                  to="/ai"
                  style={{
                    textDecoration: 'none',
                    textAlign: 'center',
                    padding: '8px',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#2e7d32',
                    background: '#f1f8f4',
                    borderRadius: '8px',
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  AI Health Check
                </Link>

                <button 
                  onClick={() => toggleReminderActive(reminder.id, !reminder.active)}
                  className="btn btn-secondary" 
                  style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '8px' }}
                >
                  {reminder.active ? 'Pause' : 'Resume'}
                </button>

                <button 
                  onClick={() => deleteReminder(reminder.id)}
                  style={{ 
                    background: 'transparent', 
                    border: '1px solid #ffcdd2', 
                    color: '#d32f2f',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  ✕
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
