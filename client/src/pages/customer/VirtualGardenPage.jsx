import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function VirtualGardenPage() {
  const { reminders, toggleReminderActive, deleteReminder, setShowAddReminder } = useApp();
  
  // Use context reminders, or if empty, provide some default mock data for the UI showcase
  const gardenReminders = reminders.length > 0 ? reminders : [
    { id: 'm1', title: 'Monstera Deliciosa', type: 'Water', nextDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], active: true, frequency: 'Every 7 days' },
    { id: 'm2', title: 'Snake Plant', type: 'Fertilize', nextDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0], active: true, frequency: 'Every 30 days' },
    { id: 'm3', title: 'Fiddle Leaf Fig', type: 'Repot', nextDate: new Date(Date.now() + 86400000 * 20).toISOString().split('T')[0], active: false, frequency: 'Yearly' }
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
      <div className="section-title-row" style={{ marginBottom: '40px' }}>
        <div>
          <h2 className="section-title">My Virtual Garden</h2>
          <p className="section-subtitle">Track your plant collection and upcoming care schedules.</p>
        </div>
        <button className="btn" onClick={() => setShowAddReminder(true)}>+ Add Plant</button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '24px'
      }}>
        {gardenReminders.map(reminder => {
          const daysLeft = getDaysLeft(reminder.nextDate);
          const statusColor = getColorForDays(daysLeft);

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
                    width: '48px', height: '48px', 
                    borderRadius: '50%', backgroundColor: 'var(--light-green)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '24px'
                  }}>
                    {getIconForType(reminder.type)}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '18px', margin: 0 }}>{reminder.title || reminder.plantName}</h3>
                    <span style={{ fontSize: '13px', color: '#888' }}>{reminder.type} • {reminder.frequency || 'Scheduled'}</span>
                  </div>
                </div>
              </div>

              <div style={{
                backgroundColor: 'var(--bg)',
                borderRadius: '8px',
                padding: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px'
              }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#888' }}>Next Date</div>
                  <div style={{ fontWeight: 'bold' }}>{new Date(reminder.nextDate).toLocaleDateString()}</div>
                </div>
                <div style={{ 
                  color: statusColor, 
                  fontWeight: 'bold',
                  backgroundColor: `${statusColor}15`,
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '14px'
                }}>
                  {daysLeft}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => toggleReminderActive(reminder.id, !reminder.active)}
                  className="btn btn-secondary" 
                  style={{ flex: 1, padding: '8px' }}
                >
                  {reminder.active ? 'Pause' : 'Resume'}
                </button>
                <button 
                  onClick={() => deleteReminder(reminder.id)}
                  style={{ 
                    background: 'transparent', 
                    border: '1px solid #ffcdd2', 
                    color: '#d32f2f',
                    borderRadius: 'var(--radius-pill)',
                    padding: '8px 16px',
                    cursor: 'pointer'
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
