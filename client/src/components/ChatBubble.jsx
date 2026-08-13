import React from 'react';

export default function ChatBubble({ message, isBot }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: isBot ? 'flex-start' : 'flex-end',
      marginBottom: '16px'
    }}>
      {isBot && (
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          backgroundColor: 'var(--primary-green)',
          color: 'var(--white)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: '12px',
          flexShrink: 0
        }}>
          <svg width="20" height="20" style={{ fill: 'currentColor' }}><use href="#icon-ai"></use></svg>
        </div>
      )}
      
      <div style={{
        maxWidth: '75%',
        padding: '12px 16px',
        borderRadius: '16px',
        borderTopLeftRadius: isBot ? '4px' : '16px',
        borderTopRightRadius: !isBot ? '4px' : '16px',
        backgroundColor: isBot ? 'var(--white)' : 'var(--primary-green)',
        color: isBot ? 'var(--dark)' : 'var(--white)',
        boxShadow: 'var(--shadow-sm)',
        fontSize: '15px',
        lineHeight: '1.5'
      }}>
        {message.image && (
          <img 
            src={message.image} 
            alt="Uploaded by user" 
            style={{ width: '100%', borderRadius: '8px', marginBottom: '8px', maxHeight: '200px', objectFit: 'cover' }} 
          />
        )}
        <div dangerouslySetInnerHTML={{ __html: message.text }}></div>
      </div>
    </div>
  );
}
