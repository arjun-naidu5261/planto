import React, { useState } from 'react';

export default function WeatherCareWidget() {
  const [city, setCity] = useState('Bengaluru (Indiranagar)');
  const [copiedAlert, setCopiedAlert] = useState(false);

  // Simulated Weather Metrics
  const weather = {
    temp: 27,
    condition: 'Partly Cloudy & Humid',
    humidity: 72,
    uvIndex: 6.4,
    rainChance: '65% Rain at 04:30 PM',
    icon: '🌧️',
    airQuality: 'AQI 42 (Good)'
  };

  // Dynamic Botanical Advice
  const getBotanicalAdvisories = () => {
    const list = [];
    if (weather.humidity > 70) {
      list.push({
        type: 'water',
        badge: 'WATERING DELAY',
        icon: '💧',
        title: 'High Humidity (72%) — Delay Watering by 24h',
        desc: 'Soil moisture evaporation is slow today. Allow top 2 inches of cocopeat to dry out before giving water to Monstera, Fiddle Leaf Fig, or Snake Plants.'
      });
    }
    if (weather.uvIndex >= 6) {
      list.push({
        type: 'light',
        badge: 'UV PROTECTION',
        icon: '☀️',
        title: 'High UV Rays (6.4) — Pull Calatheas 2ft Back',
        desc: 'Direct afternoon sun through glass can scorch delicate prayer plant and fern foliage. Keep behind sheer curtains.'
      });
    }
    list.push({
      type: 'rain',
      badge: 'MONSOON SHELTER',
      icon: '🌧️',
      title: 'Monsoon Showers Expected at 4:30 PM',
      desc: 'Move outdoor succulent pots under a covered balcony ledge to prevent root rot from sudden heavy downpours.'
    });
    return list;
  };

  const advisories = getBotanicalAdvisories();

  const handleShareWeatherCard = () => {
    const text = `🌧️ Today's Bengaluru Weather Care Alert for Plant Parents:\n` +
      `Temp: ${weather.temp}°C • Humidity: ${weather.humidity}% • UV: ${weather.uvIndex}\n\n` +
      `🌿 Botanical Tips:\n` +
      advisories.map(a => `• ${a.title}: ${a.desc}`).join('\n\n') +
      `\n\nTrack your garden care on: https://plantme.in/garden`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    setCopiedAlert(true);
    setTimeout(() => setCopiedAlert(false), 3500);
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 100%)',
      border: '1.5px solid #bae6fd',
      borderRadius: '24px',
      padding: '24px 22px',
      marginBottom: '36px',
      boxShadow: '0 8px 24px rgba(3, 105, 161, 0.05)'
    }}>
      
      {/* Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ background: '#0284c7', color: '#ffffff', fontSize: '10.5px', fontWeight: 900, padding: '3px 8px', borderRadius: '8px', textTransform: 'uppercase' }}>
              🌦️ WEATHER-AWARE CARE ENGINE
            </span>
            <span style={{ fontSize: '12px', color: '#0369a1', fontWeight: 700 }}>
              {city}
            </span>
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '4px 0 0 0' }}>
            Ambient Weather & Plant Health Forecast
          </h3>
        </div>

        <button
          onClick={handleShareWeatherCard}
          style={{
            background: '#25D366',
            color: '#ffffff',
            border: 'none',
            padding: '8px 14px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 2px 8px rgba(37,211,102,0.25)'
          }}
        >
          <span>💬</span> Send WhatsApp Weather Care Card
        </button>
      </div>

      {copiedAlert && (
        <div style={{ background: '#dcfce7', color: '#166534', fontSize: '12px', fontWeight: 700, padding: '6px 12px', borderRadius: '8px', marginBottom: '14px' }}>
          ✓ Weather care update opened for WhatsApp sharing!
        </div>
      )}

      {/* Weather Stats Ribbon */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '10px',
        marginBottom: '18px'
      }}>
        <div style={{ background: 'rgba(255,255,255,0.7)', padding: '10px 14px', borderRadius: '14px', border: '1px solid #e0f2fe' }}>
          <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 700 }}>TEMPERATURE</div>
          <div style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', marginTop: '2px' }}>{weather.temp}°C</div>
          <div style={{ fontSize: '11px', color: '#0284c7' }}>{weather.condition}</div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.7)', padding: '10px 14px', borderRadius: '14px', border: '1px solid #e0f2fe' }}>
          <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 700 }}>HUMIDITY</div>
          <div style={{ fontSize: '18px', fontWeight: 900, color: '#0284c7', marginTop: '2px' }}>{weather.humidity}%</div>
          <div style={{ fontSize: '11px', color: '#16a34a' }}>Slow Evaporation</div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.7)', padding: '10px 14px', borderRadius: '14px', border: '1px solid #e0f2fe' }}>
          <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 700 }}>UV INDEX</div>
          <div style={{ fontSize: '18px', fontWeight: 900, color: '#d97706', marginTop: '2px' }}>{weather.uvIndex} High</div>
          <div style={{ fontSize: '11px', color: '#b45309' }}>Filter Direct Rays</div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.7)', padding: '10px 14px', borderRadius: '14px', border: '1px solid #e0f2fe' }}>
          <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 700 }}>PRECIPITATION</div>
          <div style={{ fontSize: '18px', fontWeight: 900, color: '#2563eb', marginTop: '2px' }}>65% Rain</div>
          <div style={{ fontSize: '11px', color: '#1d4ed8' }}>Showers at 4:30 PM</div>
        </div>
      </div>

      {/* Advisory Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
        {advisories.map((adv, idx) => (
          <div
            key={idx}
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '14px 16px',
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
            }}
          >
            <span style={{ fontSize: '24px', flexShrink: 0 }}>{adv.icon}</span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                <span style={{ fontSize: '9.5px', background: '#dcfce7', color: '#166534', fontWeight: 900, padding: '1px 6px', borderRadius: '4px' }}>
                  {adv.badge}
                </span>
              </div>
              <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', margin: '2px 0 4px 0' }}>
                {adv.title}
              </h4>
              <p style={{ fontSize: '11.5px', color: '#475569', lineHeight: 1.45, margin: 0 }}>
                {adv.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
