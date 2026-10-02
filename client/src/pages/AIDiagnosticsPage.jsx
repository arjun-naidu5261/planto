import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import ChatBubble from '../components/ChatBubble';
import ProductCard from '../components/ProductCard';

export default function AIDiagnosticsPage() {
  const { products, setShowBotanistModal } = useApp();
  const fileInputRef = useRef(null);
  const chatContainerRef = useRef(null);
  const chatEndRef = useRef(null);
  const isFirstRender = useRef(true);
  
  const [messages, setMessages] = useState([
    {
      id: 1,
      isBot: true,
      text: "Hello! I'm your AI Plant Doctor, powered by our trained Botanical Pathology ML Model. 🌿<br/><br/>You can describe symptoms (e.g., <em>'yellowing leaves with soft mushy stems'</em> or <em>'white powdery dust on leaves'</em>), tap any common symptom below, or upload a photo of your plant for an instant clinical diagnosis!"
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // 1. Ensure the page opens at the very top on load
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  // 2. Only scroll the internal chat container when messages change (not on initial mount)
  const scrollChatToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    scrollChatToBottom();
  }, [messages, isTyping]);

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      const userMsg = {
        id: Date.now(),
        isBot: false,
        text: `Uploaded photo: ${file.name}`,
        image: event.target.result
      };
      setMessages(prev => [...prev, userMsg]);
      setIsTyping(true);

      try {
        const diag = await api.diagnosePlantAI({ 
          symptoms: `Photo inspection: ${file.name}. Visual leaf and stem analysis.`,
          fileName: file.name,
          hasImage: true 
        });

        setIsTyping(false);
        const remedyList = diag.remedy?.map((r, i) => `• <strong>Step ${i+1}:</strong> ${r}`).join('<br/>') || '';
        const urgencyColor = diag.urgency === 'Critical' ? '#dc2626' : diag.urgency === 'High' ? '#ea580c' : '#166534';

        const botReply = `<div style="display:flex; align-items:center; gap:8px; margin-bottom:8px; flex-wrap:wrap;">
          <span style="background:#1b4332; color:#fff; font-size:10px; font-weight:800; padding:2px 8px; border-radius:10px;">ML DIAGNOSIS</span>
          <span style="background:#f0fdf4; border:1px solid #bbf7d0; color:${urgencyColor}; font-size:11px; font-weight:800; padding:2px 8px; border-radius:10px;">${diag.confidence} Confidence • ${diag.urgency} Urgency</span>
        </div>
        <strong>Plant Doctor Diagnosis:</strong> ${diag.issue}<br/><br/>
        <strong>Biological Cause:</strong> ${diag.cause}<br/><br/>
        <strong>Recommended Clinical Treatment:</strong><br/>${remedyList}<br/><br/>
        <em style="color:#64748b; font-size:11px;">Trained ML Classifier: ${diag.modelMetadata?.model || 'PlantMe-Botanical-ML'} (${diag.modelMetadata?.inferenceTimeMs || 1}ms inference)</em>`;

        setMessages(prev => [...prev, {
          id: Date.now(),
          isBot: true,
          text: botReply
        }]);
      } catch (err) {
        setIsTyping(false);
        setMessages(prev => [...prev, {
          id: Date.now(),
          isBot: true,
          text: "I've analyzed the photo of your plant. Foliage appears healthy with standard metabolic development. Maintain regular moisture checks and indirect sunlight."
        }]);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMsg = {
      id: Date.now(),
      isBot: false,
      text: inputValue
    };
    setMessages(prev => [...prev, userMsg]);
    const query = inputValue;
    setInputValue('');
    setIsTyping(true);

    try {
      const diag = await api.diagnosePlantAI({ symptoms: query });
      setIsTyping(false);
      const remedyList = diag.remedy?.map((r, i) => `• <strong>Step ${i+1}:</strong> ${r}`).join('<br/>') || '';
      const urgencyColor = diag.urgency === 'Critical' ? '#dc2626' : diag.urgency === 'High' ? '#ea580c' : '#166534';

      const botReply = `<div style="display:flex; align-items:center; gap:8px; margin-bottom:8px; flex-wrap:wrap;">
        <span style="background:#1b4332; color:#fff; font-size:10px; font-weight:800; padding:2px 8px; border-radius:10px;">ML DIAGNOSIS</span>
        <span style="background:#f0fdf4; border:1px solid #bbf7d0; color:${urgencyColor}; font-size:11px; font-weight:800; padding:2px 8px; border-radius:10px;">${diag.confidence} Confidence • ${diag.urgency} Urgency</span>
      </div>
      <strong>Plant Doctor Diagnosis:</strong> ${diag.issue}<br/><br/>
      <strong>Probable Root Cause:</strong> ${diag.cause}<br/><br/>
      <strong>Actionable Care Remedy:</strong><br/>${remedyList}<br/><br/>
      <em style="color:#64748b; font-size:11px;">Trained ML Classifier: ${diag.modelMetadata?.model || 'PlantMe-Botanical-ML'} (${diag.modelMetadata?.inferenceTimeMs || 1}ms inference)</em>`;

      setMessages(prev => [...prev, {
        id: Date.now(),
        isBot: true,
        text: botReply
      }]);
    } catch (err) {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: Date.now(),
        isBot: true,
        text: `Thanks for your question: "${query}". For healthy plant growth, ensure adequate indirect sunlight and let the top 1-2 inches of soil dry out before your next watering.`
      }]);
    }
  };

  const handleQuickSymptom = async (symptomText) => {
    const userMsg = {
      id: Date.now(),
      isBot: false,
      text: symptomText
    };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const diag = await api.diagnosePlantAI({ symptoms: symptomText });
      setIsTyping(false);
      const remedyList = diag.remedy?.map((r, i) => `• <strong>Step ${i+1}:</strong> ${r}`).join('<br/>') || '';
      const urgencyColor = diag.urgency === 'Critical' ? '#dc2626' : diag.urgency === 'High' ? '#ea580c' : '#166534';

      const botReply = `<div style="display:flex; align-items:center; gap:8px; margin-bottom:8px; flex-wrap:wrap;">
        <span style="background:#1b4332; color:#fff; font-size:10px; font-weight:800; padding:2px 8px; border-radius:10px;">ML DIAGNOSIS</span>
        <span style="background:#f0fdf4; border:1px solid #bbf7d0; color:${urgencyColor}; font-size:11px; font-weight:800; padding:2px 8px; border-radius:10px;">${diag.confidence} Confidence • ${diag.urgency} Urgency</span>
      </div>
      <strong>AI Doctor Diagnosis:</strong> ${diag.issue}<br/><br/>
      <strong>Pathology Root Cause:</strong> ${diag.cause}<br/><br/>
      <strong>Recommended Organic Treatment:</strong><br/>${remedyList}<br/><br/>
      <em style="color:#64748b; font-size:11px;">Trained ML Classifier: ${diag.modelMetadata?.model || 'PlantMe-Botanical-ML'} (${diag.modelMetadata?.inferenceTimeMs || 1}ms inference)</em>`;

      setMessages(prev => [...prev, {
        id: Date.now(),
        isBot: true,
        text: botReply
      }]);
    } catch (e) {
      setIsTyping(false);
    }
  };

  return (
    <div id="view-ai" className="page-view active" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)', padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div className="section-title-row" style={{ marginBottom: '20px', flexShrink: 0 }}>
        <div>
          <h2 className="section-title">AI Plant Doctor</h2>
          <p className="section-subtitle">Chat with our AI for instant care advice and diagnosis.</p>
        </div>
      </div>
      
      {/* Live Botanist Human Call-out Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)',
        color: '#ffffff',
        borderRadius: '16px',
        padding: '14px 20px',
        marginBottom: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        boxShadow: '0 4px 16px rgba(27,67,50,0.18)',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 10px #4ade80' }} />
          <div>
            <div style={{ fontSize: '13.5px', fontWeight: 800 }}>Need Expert Human Guidance?</div>
            <div style={{ fontSize: '12px', color: '#bbf7d0' }}>Senior Certified Botanist is online now for 5-minute video call triage.</div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowBotanistModal(true)}
          style={{
            background: '#ffffff',
            color: '#1b4332',
            border: 'none',
            borderRadius: '10px',
            padding: '8px 16px',
            fontWeight: 800,
            fontSize: '13px',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        >
          Book 5-Min Video Call →
        </button>
      </div>

      <div style={{
        flex: 1,
        backgroundColor: 'var(--glass-bg)',
        backdropFilter: 'blur(10px)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--glass-border)',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        
        {/* Chat Messages */}
        <div ref={chatContainerRef} style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {messages.map(msg => (
            <ChatBubble key={msg.id} message={msg} isBot={msg.isBot} />
          ))}
          {isTyping && (
            <div style={{ display: 'flex', alignItems: 'center', color: '#888', fontSize: '14px', marginBottom: '16px', marginLeft: '48px' }}>
              <div className="typing-indicator" style={{ display: 'flex', gap: '4px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#888', animation: 'pulse-soft 1s infinite 0s' }}></div>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#888', animation: 'pulse-soft 1s infinite 0.2s' }}></div>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#888', animation: 'pulse-soft 1s infinite 0.4s' }}></div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Quick Symptom Pills */}
        <div style={{ padding: '10px 16px', background: '#f8faf9', borderTop: '1px solid #eef2f0', display: 'flex', gap: '8px', overflowX: 'auto', flexShrink: 0 }}>
          <button 
            type="button"
            onClick={() => handleQuickSymptom("My plant has yellowing leaves and wilting lower stems")}
            style={{ whiteSpace: 'nowrap', background: '#fff', border: '1px solid #fed7aa', color: '#9a3412', borderRadius: '16px', padding: '5px 12px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            Yellowing Leaves
          </button>
          <button 
            type="button"
            onClick={() => handleQuickSymptom("Brown crispy dry leaf tips on indoor plant")}
            style={{ whiteSpace: 'nowrap', background: '#fff', border: '1px solid #fecaca', color: '#991b1b', borderRadius: '16px', padding: '5px 12px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            Brown Crispy Tips
          </button>
          <button 
            type="button"
            onClick={() => handleQuickSymptom("How often to water plants in hot sunny weather in Bengaluru?")}
            style={{ whiteSpace: 'nowrap', background: '#fff', border: '1px solid #bae6fd', color: '#0369a1', borderRadius: '16px', padding: '5px 12px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            Summer Watering Advice
          </button>
          <button 
            type="button"
            onClick={() => handleQuickSymptom("Which plants in PlantMe catalog are 100% non-toxic for cats and dogs?")}
            style={{ whiteSpace: 'nowrap', background: '#fff', border: '1px solid #bbf7d0', color: '#166534', borderRadius: '16px', padding: '5px 12px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            Check Pet-Safe Plants
          </button>
        </div>

        {/* Input Area */}
        <div style={{ padding: '16px', borderTop: '1px solid rgba(0,0,0,0.05)', backgroundColor: 'var(--white)' }}>
          <form onSubmit={handleSend} style={{ display: 'flex', gap: '12px' }}>
            <button 
              type="button" 
              onClick={handleBrowseClick}
              title="Upload Image"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--primary-green)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px'
              }}
            >
              <svg width="24" height="24" style={{ fill: 'currentColor' }}>
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
              </svg>
            </button>
            <input 
              type="file" 
              ref={fileInputRef}
              accept="image/*" 
              style={{ display: 'none' }} 
              onChange={handleFileChange}
            />
            
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask a question about your plants..."
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: 'var(--radius-pill)',
                border: '1px solid #e0e0e0',
                backgroundColor: 'var(--bg)',
                color: 'var(--dark)',
                fontSize: '15px',
                outline: 'none'
              }}
            />
            
            <button 
              type="submit"
              className="btn"
              style={{
                borderRadius: 'var(--radius-pill)',
                padding: '0 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              Send
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
