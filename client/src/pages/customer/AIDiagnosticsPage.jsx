import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import ChatBubble from '../components/ChatBubble';
import ProductCard from '../components/ProductCard';

export default function AIDiagnosticsPage() {
  const { products } = useApp();
  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);
  
  const [messages, setMessages] = useState([
    {
      id: 1,
      isBot: true,
      text: "Hello! I'm your AI Plant Doctor. 🌿<br/><br/>You can ask me questions about plant care, or upload a photo of your plant so I can diagnose any issues!"
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
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
    reader.onload = (event) => {
      const userMsg = {
        id: Date.now(),
        isBot: false,
        text: "Please take a look at this photo.",
        image: event.target.result
      };
      setMessages(prev => [...prev, userMsg]);
      setIsTyping(true);

      setTimeout(() => {
        setIsTyping(false);
        const fileName = file.name.toLowerCase();
        let report = `I've analyzed the photo of your plant. It looks like a **Monstera Deliciosa**.<br/><br/>
        **Health Score:** 85%<br/>
        **Status:** Healthy growth. Minor mineral crusting on lower leaves.<br/><br/>
        **Care Tip:** Water once every 8-10 days, letting the top 2 inches dry out completely.`;

        if (fileName.includes("snake") || fileName.includes("sansevieria")) {
          report = `I've analyzed the photo. It's a **Snake Plant (Laurentii)**.<br/><br/>
          **Health Score:** 94%<br/>
          **Status:** Excellent health. Leaves are upright and robust.<br/><br/>
          **Care Tip:** Water very sparingly. Once in 15-20 days is ideal. Avoid waterlogging.`;
        } else if (fileName.includes("tomato") || fileName.includes("rot") || fileName.includes("rust")) {
          report = `I've analyzed the photo. It appears to be an **Heirloom Tomato Plant**.<br/><br/>
          **Health Score:** 45% (Critical)<br/>
          **Status:** Early Blossom End Rot detected on lower fruits due to calcium deficiency and uneven watering schedules.<br/><br/>
          **Care Tip:** Add immediate organic calcium supplements and spray Neem Oil for leaf protection.`;
        }

        setMessages(prev => [...prev, {
          id: Date.now(),
          isBot: true,
          text: report
        }]);
      }, 2500);
    };
    reader.readAsDataURL(file);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMsg = {
      id: Date.now(),
      isBot: false,
      text: inputValue
    };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: Date.now(),
        isBot: true,
        text: `Thanks for your question: "${userMsg.text}". As an AI Plant Doctor, my text capabilities are currently simulated for this demo, but try uploading a photo of a plant to see my image recognition in action!`
      }]);
    }, 1500);
  };

  return (
    <div id="view-ai" className="page-view active" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)', padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div className="section-title-row" style={{ marginBottom: '20px', flexShrink: 0 }}>
        <div>
          <h2 className="section-title">AI Plant Doctor</h2>
          <p className="section-subtitle">Chat with our AI for instant care advice and diagnosis.</p>
        </div>
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
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
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
