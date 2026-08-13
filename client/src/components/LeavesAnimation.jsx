import React from 'react';

export default function LeavesAnimation() {
  const leafCount = 12;
  const leaves = Array.from({ length: leafCount }).map((_, i) => {
    const left = `${Math.random() * 100}vw`;
    const delay = `${Math.random() * 8}s`;
    const duration = `${8 + Math.random() * 6}s`;
    const scale = 0.5 + Math.random() * 0.7;
    return (
      <div
        key={i}
        className="leaf"
        style={{
          left,
          animationDelay: delay,
          animationDuration: duration,
          transform: `scale(${scale})`
        }}
      />
    );
  });

  return <div className="leaves-container" id="leaves-container">{leaves}</div>;
}
