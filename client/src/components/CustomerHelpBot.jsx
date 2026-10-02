import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function CustomerHelpBot() {
  const navigate = useNavigate();
  const { setShowBalconyModal, setShowClubModal, setShowHospitalModal } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [showTeaser, setShowTeaser] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const initialGreeting = {
    id: 'welcome-msg',
    sender: 'bot',
    text: `Hello! I'm **Flora**, your PlantMe 24/7 AI Botanical Concierge 🌿\n\nI can help you instantly with:\n• 📦 **Live Order Tracking & Rider details**\n• 🩺 **Plant Health Diagnosis** (yellowing leaves, watering, pests)\n• 🔄 **30-Day Thrive Guarantee** replacements\n• ⭐ **Care Pass** benefits (₹99/mo)\n• 💬 Direct escalation to **info@futureforbes.in** or **+91 88856 00899**\n\nHow can I help you today?`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    quickReplies: [
      "📦 Track My Order",
      "🌿 Why are my leaves yellow?",
      "🔄 30-Day Guarantee",
      "⭐ Care Pass Benefits",
      "💬 WhatsApp Support"
    ]
  };

  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('plantme_chat_history_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("Could not load chat history", e);
    }
    return [initialGreeting];
  });

  // Save messages to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('plantme_chat_history_v2', JSON.stringify(messages));
    } catch (e) {
      console.warn("Could not save chat history", e);
    }
  }, [messages]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [messages, isOpen, isTyping]);

  // Hide teaser after 12 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowTeaser(false), 12000);
    return () => clearTimeout(timer);
  }, []);

  const handleOpenChat = () => {
    setIsOpen(true);
    setHasUnread(false);
    setShowTeaser(false);
  };

  const handleCloseChat = () => {
    setIsOpen(false);
  };

  const handleClearChat = () => {
    if (window.confirm("Start a new conversation with Flora?")) {
      const resetMessages = [{
        ...initialGreeting,
        id: 'msg-' + Date.now(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }];
      setMessages(resetMessages);
      localStorage.removeItem('plantme_chat_history_v2');
    }
  };

  const sendMessage = async (textToSend) => {
    const text = (textToSend || inputMessage).trim();
    if (!text) return;

    setInputMessage('');
    const userMsg = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const response = await fetch('/api/chatbot/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });

      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();

      setIsTyping(false);
      const botMsg = {
        id: 'bot-' + Date.now(),
        sender: 'bot',
        text: data.reply,
        type: data.type,
        data: data.data,
        quickReplies: data.quickReplies || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error("Chatbot error:", err);
      setIsTyping(false);
      // Friendly offline fallback
      setMessages(prev => [
        ...prev,
        {
          id: 'bot-' + Date.now(),
          sender: 'bot',
          text: `🌿 You can also connect directly with our support team:\n\n• **Email:** info@futureforbes.in\n• **Call / WhatsApp:** +91 88856 00899\n\nWe're available 24/7 to help you with plant care and orders!`,
          type: 'contact_card',
          data: {
            email: "info@futureforbes.in",
            phone: "+91 88856 00899",
            whatsapp: "+91 88856 00899"
          },
          quickReplies: ["📦 Track My Order", "💬 WhatsApp Concierge", "🩺 AI Plant Doctor"],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  // Render markdown-like bold and bullet text cleanly
  const renderFormattedText = (content) => {
    if (!content) return null;
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      // Bold text parser **text**
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const formattedParts = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx} style={{ color: '#1b4332', fontWeight: 700 }}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return <code key={pIdx} style={{ background: '#e8f5e9', padding: '2px 6px', borderRadius: '4px', fontSize: '12px', color: '#1b4332', fontWeight: 600 }}>{part.slice(1, -1)}</code>;
        }
        return part;
      });

      return (
        <span key={idx} style={{ display: 'block', minHeight: line.trim() === '' ? '8px' : 'auto' }}>
          {formattedParts}
        </span>
      );
    });
  };

  return (
    <>
      {/* 1. FLOATING LAUNCHER BUTTON & TEASER (Bottom Right) */}
      <div 
        className="customer-help-bot-launcher"
        style={{
          position: 'fixed',
          bottom: '84px', // Clears mobile bottom navigation smoothly
          right: '20px',
          zIndex: 9998,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '10px'
        }}
      >
        {/* Proactive Speech Teaser Bubble */}
        {showTeaser && !isOpen && (
          <div 
            onClick={handleOpenChat}
            style={{
              background: '#ffffff',
              color: '#1b4332',
              padding: '12px 16px',
              borderRadius: '16px',
              boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
              border: '1px solid #d8f3dc',
              maxWidth: '260px',
              fontSize: '13px',
              fontWeight: 500,
              lineHeight: 1.4,
              cursor: 'pointer',
              position: 'relative',
              animation: 'fadeInUp 0.3s ease-out'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#2d6a4f', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                🌿 Flora • AI Concierge
              </span>
              <button 
                onClick={(e) => { e.stopPropagation(); setShowTeaser(false); }}
                style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', fontSize: '14px', padding: '0 2px' }}
              >
                ×
              </button>
            </div>
            Track an order or need plant advice? Tap to chat with us!
            <div 
              style={{
                position: 'absolute',
                bottom: '-8px',
                right: '24px',
                width: 0,
                height: 0,
                borderLeft: '8px solid transparent',
                borderRight: '8px solid transparent',
                borderTop: '8px solid #ffffff'
              }}
            />
          </div>
        )}

        {/* Floating Launcher Button */}
        {!isOpen && (
          <button
            id="open-customer-help-bot-btn"
            onClick={handleOpenChat}
            aria-label="Open Customer Help Chatbot"
            style={{
              background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '50px',
              padding: '14px 22px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 8px 25px rgba(27, 67, 50, 0.35)',
              cursor: 'pointer',
              transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease',
              outline: 'none'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 12px 30px rgba(27, 67, 50, 0.45)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(27, 67, 50, 0.35)';
            }}
          >
            {/* Pulsing Green Online Indicator */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '20px' }}>🌿</span>
              <span 
                style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-4px',
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: '#10b981',
                  border: '2px solid #ffffff',
                  boxShadow: '0 0 8px #10b981'
                }}
              />
            </div>
            
            <div style={{ textAlign: 'left' }} className="bot-launcher-text">
              <div style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '0.2px' }}>Flora AI</div>
              <div style={{ fontSize: '11px', opacity: 0.85, fontWeight: 500 }}>24/7 Care & Support</div>
            </div>

            {hasUnread && (
              <span style={{
                background: '#ef4444',
                color: '#fff',
                fontSize: '10px',
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: '10px',
                marginLeft: '4px'
              }}>
                1
              </span>
            )}
          </button>
        )}
      </div>

      {/* 2. CHAT WINDOW MODAL / POPUP */}
      {isOpen && (
        <div 
          style={{
            position: 'fixed',
            bottom: '84px',
            right: '20px',
            width: '92vw',
            maxWidth: '420px',
            height: '620px',
            maxHeight: '82vh',
            background: '#ffffff',
            borderRadius: '24px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.22), 0 0 0 1px rgba(0,0,0,0.06)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 9999,
            animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {/* Header */}
          <div 
            style={{
              background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)',
              color: '#ffffff',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div 
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.18)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                  position: 'relative'
                }}
              >
                🌿
                <span 
                  style={{
                    position: 'absolute',
                    bottom: '1px',
                    right: '1px',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: '#10b981',
                    border: '2px solid #1b4332'
                  }}
                />
              </div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  Flora Concierge
                  <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '10px', fontWeight: 600 }}>AI Bot</span>
                </div>
                <div style={{ fontSize: '12px', color: '#d8f3dc', opacity: 0.9 }}>
                  Online • Avg response 1 sec
                </div>
              </div>
            </div>

            {/* Header Action Icons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Call Hotline */}
              <a 
                href="tel:+918885600899"
                title="Call Plant Care Hotline"
                style={{
                  color: '#ffffff',
                  textDecoration: 'none',
                  background: 'rgba(255,255,255,0.15)',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px'
                }}
              >
                📞
              </a>

              {/* Direct WhatsApp */}
              <a 
                href="https://wa.me/918885600899?text=Hello%20PlantMe%20Concierge,%20I%20need%20help%20with%20my%20order/plant."
                target="_blank"
                rel="noreferrer"
                title="Chat on WhatsApp"
                style={{
                  color: '#ffffff',
                  textDecoration: 'none',
                  background: 'rgba(255,255,255,0.15)',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '15px'
                }}
              >
                💬
              </a>

              {/* Reset Chat */}
              <button 
                onClick={handleClearChat}
                title="Restart Chat"
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  color: '#ffffff',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                🔄
              </button>

              {/* Close Button */}
              <button 
                onClick={handleCloseChat}
                title="Close"
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  color: '#ffffff',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '18px',
                  fontWeight: 700
                }}
              >
                ×
              </button>
            </div>
          </div>

          {/* Quick Info Ribbon */}
          <div style={{ background: '#f0fdf4', padding: '8px 16px', borderBottom: '1px solid #dcfce7', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#166534' }}>
            <span>⚡ 20–30 Min EV Transit • 30-Day Thrive Guarantee</span>
            <span style={{ fontWeight: 700 }}>care desk active</span>
          </div>

          {/* Messages Stream */}
          <div 
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              background: '#f8fafc'
            }}
          >
            {messages.map((msg) => (
              <div 
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div 
                  style={{
                    maxWidth: '85%',
                    padding: '12px 16px',
                    borderRadius: msg.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    background: msg.sender === 'user' ? '#1b4332' : '#ffffff',
                    color: msg.sender === 'user' ? '#ffffff' : '#1e293b',
                    boxShadow: msg.sender === 'user' 
                      ? '0 4px 12px rgba(27,67,50,0.2)' 
                      : '0 2px 8px rgba(0,0,0,0.04)',
                    border: msg.sender === 'user' ? 'none' : '1px solid #e2e8f0',
                    fontSize: '13.5px',
                    lineHeight: '1.5',
                    wordBreak: 'break-word'
                  }}
                >
                  {renderFormattedText(msg.text)}

                  {/* SPECIAL CARDS: Order Card */}
                  {msg.type === 'order_card' && msg.data && (
                    <div 
                      style={{
                        marginTop: '12px',
                        background: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        borderRadius: '12px',
                        padding: '12px',
                        color: '#0f172a'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderBottom: '1px dashed #cbd5e1', paddingBottom: '6px' }}>
                        <span style={{ fontWeight: 700, fontSize: '13px', color: '#1b4332' }}>Order #{msg.data.id}</span>
                        <span style={{ fontSize: '11px', background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                          {msg.data.status}
                        </span>
                      </div>

                      {/* Progress Steps */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', margin: '10px 0', position: 'relative' }}>
                        {['Confirmed', 'Prepped', 'In EV Transit', 'Delivered'].map((step, sIdx) => {
                          const isDone = sIdx <= 2;
                          return (
                            <div key={sIdx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative', zIndex: 1 }}>
                              <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: isDone ? '#2d6a4f' : '#cbd5e1', color: '#fff', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                                {isDone ? '✓' : sIdx + 1}
                              </div>
                              <span style={{ fontSize: '9px', marginTop: '4px', color: isDone ? '#1b4332' : '#64748b', fontWeight: isDone ? 700 : 500, textAlign: 'center' }}>
                                {step}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      <div style={{ fontSize: '12px', color: '#475569', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div><strong>Rider:</strong> {msg.data.rider?.name || 'Ramu K.'} ({msg.data.rider?.phone || '+91 98450 12345'})</div>
                        <div><strong>Vehicle:</strong> {msg.data.rider?.vehicle || 'PlantMe Eco EV-Cargo'}</div>
                        <div><strong>Delivery OTP:</strong> <code style={{ background: '#dcfce7', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>{msg.data.deliveryOtp || '6506'}</code></div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                        <a 
                          href={`tel:${msg.data.rider?.phone || '+919845012345'}`}
                          style={{
                            flex: 1,
                            textAlign: 'center',
                            background: '#1b4332',
                            color: '#fff',
                            textDecoration: 'none',
                            padding: '6px 10px',
                            borderRadius: '8px',
                            fontSize: '11px',
                            fontWeight: 700
                          }}
                        >
                          📞 Call Rider
                        </a>
                        <button
                          onClick={() => {
                            setIsOpen(false);
                            window.location.hash = "#/profile";
                          }}
                          style={{
                            flex: 1,
                            background: '#e2e8f0',
                            border: 'none',
                            color: '#1e293b',
                            padding: '6px 10px',
                            borderRadius: '8px',
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          View In Orders
                        </button>
                      </div>
                    </div>
                  )}

                  {/* SPECIAL CARDS: Contact Card */}
                  {msg.type === 'contact_card' && (
                    <div 
                      style={{
                        marginTop: '12px',
                        background: '#ffffff',
                        border: '1px solid #d8f3dc',
                        borderRadius: '12px',
                        padding: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}
                    >
                      <a 
                        href="https://wa.me/918885600899?text=Hello%20Future%20Forbes%20%26%20PlantMe%20team,%20I%20need%20assistance."
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          background: '#25D366',
                          color: '#ffffff',
                          textDecoration: 'none',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: 700,
                          justifyContent: 'center'
                        }}
                      >
                        <span>💬</span> Chat on WhatsApp (+91 88856 00899)
                      </a>

                      <a 
                        href="tel:+918885600899"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          background: '#1b4332',
                          color: '#ffffff',
                          textDecoration: 'none',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: 700,
                          justifyContent: 'center'
                        }}
                      >
                        <span>📞</span> Call Care Hotline (+91 88856 00899)
                      </a>

                      <a 
                        href="mailto:info@futureforbes.in"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          background: '#f1f5f9',
                          color: '#334155',
                          textDecoration: 'none',
                          padding: '8px 14px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: 600,
                          justifyContent: 'center'
                        }}
                      >
                        <span>✉️</span> Email info@futureforbes.in
                      </a>
                    </div>
                  )}

                  {/* SPECIAL CARDS: Botanical Care / AI Doctor link */}
                  {msg.type === 'care_card' && (
                    <div style={{ marginTop: '10px' }}>
                      <button
                        onClick={() => {
                          setIsOpen(false);
                          window.location.hash = "#/ai";
                        }}
                        style={{
                          width: '100%',
                          background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)',
                          color: '#ffffff',
                          border: 'none',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        <span>🩺</span> Launch Camera AI Plant Diagnostician
                      </button>
                    </div>
                  )}

                  {/* SPECIAL CARDS: Product Carousel */}
                  {msg.type === 'product_carousel' && Array.isArray(msg.data) && (
                    <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {msg.data.map(p => (
                        <div 
                          key={p.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '10px',
                            padding: '8px 10px'
                          }}
                        >
                          <img 
                            src={p.images?.[0] || '/images/golden_pothos.png'} 
                            alt={p.name} 
                            style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '8px' }}
                            onError={(e) => { e.currentTarget.src = '/logo.png'; }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {p.name}
                            </div>
                            <div style={{ fontSize: '11px', color: '#166534', fontWeight: 700 }}>
                              ₹{p.price} • {p.petFriendly ? '🐶 Pet-Friendly' : '🍃 Air-Purifying'}
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setIsOpen(false);
                              window.location.hash = `#/product/${p.id}`;
                            }}
                            style={{
                              background: '#2d6a4f',
                              color: '#fff',
                              border: 'none',
                              padding: '5px 10px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            View
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Timestamp */}
                <span style={{ fontSize: '10px', color: '#94a3b8', margin: '4px 6px' }}>
                  {msg.timestamp}
                </span>

                {/* Quick Reply Pills underneath latest message */}
                {msg.sender === 'bot' && msg.quickReplies && msg.quickReplies.length > 0 && (
                  <div 
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '6px',
                      marginTop: '6px',
                      marginBottom: '4px'
                    }}
                  >
                    {msg.quickReplies.map((pill, pIndex) => (
                      <button
                        key={pIndex}
                        onClick={() => {
                          if (pill.includes("WhatsApp")) {
                            window.open("https://wa.me/918885600899?text=Hello%20PlantMe%20Support", "_blank");
                          } else if (pill.includes("Call")) {
                            window.location.href = "tel:+918885600899";
                          } else if (pill.includes("AI Plant Doctor") || pill.includes("Launch AI")) {
                            setIsOpen(false);
                            window.location.hash = "#/ai";
                          } else if (pill.includes("Activate Care Pass")) {
                            setIsOpen(false);
                            window.location.hash = "#/profile";
                          } else if (pill.includes("Balcony Makeover")) {
                            setIsOpen(false);
                            setShowBalconyModal(true);
                          } else if (pill.includes("Vacation") || pill.includes("Boarding") || pill.includes("Plant Hospital") || pill.includes("ICU")) {
                            setIsOpen(false);
                            setShowHospitalModal(true);
                          } else if (pill.includes("Mystery Club") || pill.includes("Mystery Box")) {
                            setIsOpen(false);
                            setShowClubModal(true);
                          } else if (pill.includes("Corporate") || pill.includes("Retainers")) {
                            setIsOpen(false);
                            window.location.hash = "#/corporate";
                          } else {
                            sendMessage(pill);
                          }
                        }}
                        style={{
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          color: '#1b4332',
                          borderRadius: '16px',
                          padding: '5px 12px',
                          fontSize: '11.5px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#d8f3dc';
                          e.currentTarget.style.borderColor = '#2d6a4f';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#ffffff';
                          e.currentTarget.style.borderColor = '#cbd5e1';
                        }}
                      >
                        {pill}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '12px', padding: '6px 12px' }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2d6a4f', animation: 'bounce 1s infinite 0.1s' }} />
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2d6a4f', animation: 'bounce 1s infinite 0.2s' }} />
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2d6a4f', animation: 'bounce 1s infinite 0.3s' }} />
                </div>
                <span>Flora is thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div 
            style={{
              padding: '12px 16px',
              background: '#ffffff',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <input 
              ref={inputRef}
              type="text"
              placeholder="Ask about orders, plant care, delivery..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: '24px',
                border: '1px solid #cbd5e1',
                fontSize: '13.5px',
                outline: 'none',
                background: '#f8fafc',
                color: '#0f172a'
              }}
              onFocus={(e) => e.target.style.borderColor = '#2d6a4f'}
              onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
            />

            <button
              onClick={() => sendMessage()}
              disabled={!inputMessage.trim()}
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: inputMessage.trim() ? '#1b4332' : '#cbd5e1',
                color: '#ffffff',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: inputMessage.trim() ? 'pointer' : 'default',
                transition: 'background 0.2s',
                fontSize: '16px'
              }}
            >
              ➤
            </button>
          </div>

          {/* Footer branding */}
          <div style={{ textAlign: 'center', padding: '6px', fontSize: '10.5px', color: '#94a3b8', background: '#f8fafc', borderTop: '1px solid #f1f5f9' }}>
            Powered by PlantMe AI • Support: info@futureforbes.in • +91 88856 00899
          </div>
        </div>
      )}
    </>
  );
}
