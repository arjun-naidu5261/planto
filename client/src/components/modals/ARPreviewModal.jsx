import React, { useState, useRef, useEffect } from 'react';

export default function ARPreviewModal({ product, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const animFrameRef = useRef(null);
  const [camState, setCamState] = useState('idle');
  const [plantScale, setPlantScale] = useState(1);
  const [plantX, setPlantX] = useState(50);
  const [plantY, setPlantY] = useState(65);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [screenshot, setScreenshot] = useState(null);

  const getPlantHeight = () => {
    if (!product?.height) return 40;
    const h = product.height.toLowerCase();
    if (h.includes('small') || h.includes('15') || h.includes('20')) return 25;
    if (h.includes('large') || h.includes('60') || h.includes('90') || h.includes('100')) return 60;
    return 42;
  };
  const plantBaseHeight = getPlantHeight();

  const plantEmoji = (() => {
    if (!product) return '🪴';
    const cat = (product.category || '').toLowerCase();
    if (cat.includes('succulent') || cat.includes('cactus')) return '🌵';
    if (cat.includes('flower')) return '🌸';
    if (cat.includes('outdoor')) return '🌳';
    return '🪴';
  })();

  useEffect(() => { return () => { stopCamera(); }; }, []);

  const stopCamera = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
  };

  const startCamera = async () => {
    setCamState('loading');
    try {
      if (!navigator.mediaDevices?.getUserMedia) { setCamState('unsupported'); return; }
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setCamState('active');
          drawLoop();
        };
      }
    } catch (err) {
      if (err.name === 'NotAllowedError') setCamState('denied');
      else setCamState('unsupported');
    }
  };

  const drawLoop = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const render = () => {
      if (!canvas || !video || video.readyState < 2) { animFrameRef.current = requestAnimationFrame(render); return; }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const cw = canvas.width, ch = canvas.height;
      const px = (plantX / 100) * cw;
      const py = (plantY / 100) * ch;
      const ph = (plantBaseHeight / 100) * ch * plantScale;
      const pw = ph * 0.65;

      // Floor guide
      ctx.save(); ctx.strokeStyle = 'rgba(100,220,100,0.5)'; ctx.lineWidth = 2; ctx.setLineDash([10,8]);
      ctx.beginPath(); ctx.moveTo(cw*0.1, ch*0.8); ctx.lineTo(cw*0.9, ch*0.8); ctx.stroke();
      ctx.setLineDash([]); ctx.restore();

      // Shadow
      ctx.save(); ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.beginPath(); ctx.ellipse(px, py+ph*0.03, pw*0.5, ph*0.05, 0, 0, Math.PI*2); ctx.fill(); ctx.restore();

      // Pot
      ctx.save(); ctx.fillStyle = 'rgba(150,90,50,0.88)'; ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.moveTo(px-pw*0.22,py); ctx.lineTo(px-pw*0.3,py-ph*0.22); ctx.lineTo(px+pw*0.3,py-ph*0.22); ctx.lineTo(px+pw*0.22,py); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();

      // Foliage
      const gr = ctx.createLinearGradient(px-pw/2,py-ph,px+pw/2,py);
      gr.addColorStop(0,'rgba(60,180,80,0.85)'); gr.addColorStop(1,'rgba(20,90,35,0.88)');
      ctx.save(); ctx.fillStyle=gr; ctx.strokeStyle='rgba(255,255,255,0.25)'; ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.ellipse(px,py-ph*0.57,pw*0.46,ph*0.4,0,0,Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(px-pw*0.18,py-ph*0.42,pw*0.22,ph*0.18,-0.4,0,Math.PI*2); ctx.fillStyle='rgba(70,190,90,0.6)'; ctx.fill();
      ctx.beginPath(); ctx.ellipse(px+pw*0.18,py-ph*0.45,pw*0.22,ph*0.18,0.4,0,Math.PI*2); ctx.fillStyle='rgba(70,190,90,0.6)'; ctx.fill();
      ctx.restore();

      // Label
      ctx.save(); ctx.fillStyle='rgba(0,0,0,0.6)';
      ctx.beginPath(); ctx.roundRect(px-65,py-ph-38,130,28,7); ctx.fill();
      ctx.fillStyle='#fff'; ctx.font='bold 12px system-ui'; ctx.textAlign='center';
      ctx.fillText((product?.name||'Plant')+' · '+(product?.height||''), px, py-ph-18); ctx.restore();

      // AR corners HUD
      const sz=22,pd=16; ctx.strokeStyle='rgba(100,220,130,0.8)'; ctx.lineWidth=3;
      [[pd,pd,1,1],[cw-pd,pd,-1,1],[pd,ch-pd,1,-1],[cw-pd,ch-pd,-1,-1]].forEach(([x,y,dx,dy])=>{
        ctx.beginPath(); ctx.moveTo(x,y+dy*sz); ctx.lineTo(x,y); ctx.lineTo(x+dx*sz,y); ctx.stroke();
      });

      animFrameRef.current = requestAnimationFrame(render);
    };
    animFrameRef.current = requestAnimationFrame(render);
  };

  const takeScreenshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setScreenshot(canvas.toDataURL('image/png'));
  };

  const handleMouseDown = (e) => { setIsDragging(true); setDragStart({x:e.clientX,y:e.clientY}); };
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPlantX(p => Math.max(10,Math.min(90, p + (e.clientX-dragStart.x)/rect.width*100)));
    setPlantY(p => Math.max(20,Math.min(95, p + (e.clientY-dragStart.y)/rect.height*100)));
    setDragStart({x:e.clientX,y:e.clientY});
  };
  const handleTouchMove = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPlantX(Math.max(10,Math.min(90, ((touch.clientX-rect.left)/rect.width)*100)));
    setPlantY(Math.max(20,Math.min(95, ((touch.clientY-rect.top)/rect.height)*100)));
  };

  return (
    <div onClick={e => e.target===e.currentTarget && onClose()}
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.93)', zIndex:10000, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
      <div style={{ width:'100%', maxWidth:'700px', padding:'0 16px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'14px' }}>
          <div>
            <span style={{ background:'linear-gradient(135deg,#00c853,#1b5e20)', color:'#fff', fontSize:'11px', fontWeight:800, padding:'3px 10px', borderRadius:'20px' }}>AR PREVIEW</span>
            <h3 style={{ color:'#fff', margin:'6px 0 0', fontSize:'18px' }}>Preview in My Room — {product?.name}</h3>
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.1)', border:'none', color:'#fff', width:'36px', height:'36px', borderRadius:'50%', cursor:'pointer', fontSize:'18px' }}>✕</button>
        </div>

        <div style={{ position:'relative', borderRadius:'16px', overflow:'hidden', background:'#111', aspectRatio:'16/9' }}>
          <video ref={videoRef} style={{ display:'none' }} playsInline muted />

          {camState==='active' && !screenshot && (
            <canvas ref={canvasRef} style={{ width:'100%', height:'100%', cursor:'grab', touchAction:'none' }}
              onMouseDown={handleMouseDown} onMouseMove={handleMouseMove}
              onMouseUp={()=>setIsDragging(false)} onMouseLeave={()=>setIsDragging(false)}
              onTouchMove={handleTouchMove} />
          )}

          {screenshot && (
            <div style={{ position:'relative' }}>
              <img src={screenshot} alt="AR Screenshot" style={{ width:'100%' }} />
              <div style={{ position:'absolute', top:'12px', right:'12px', display:'flex', gap:'8px' }}>
                <a href={screenshot} download={`plantme-ar-${(product?.name||'plant').replace(/\s/g,'-')}.png`}
                  style={{ background:'rgba(0,0,0,0.7)', color:'#fff', padding:'8px 14px', borderRadius:'8px', fontSize:'12px', fontWeight:700, textDecoration:'none' }}>Save Image</a>
                <button onClick={()=>setScreenshot(null)}
                  style={{ background:'rgba(0,200,80,0.85)', color:'#fff', padding:'8px 14px', borderRadius:'8px', fontSize:'12px', fontWeight:700, border:'none', cursor:'pointer' }}>Retake</button>
              </div>
            </div>
          )}

          {camState==='idle' && (
            <div style={{ display:'flex', flexDirection: 'column', alignItems:'center', justifyContent:'center', height:'100%', minHeight:'240px', gap:'16px', padding:'32px' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 800, color: '#fff' }}>
                AR
              </div>
              <p style={{ color:'#aaa', textAlign:'center', fontSize:'14px', lineHeight:1.6 }}>
                Point your camera at a surface and we'll place a true-to-scale preview of <strong style={{ color:'#fff' }}>{product?.name}</strong> in your space.
              </p>
              <button onClick={startCamera} style={{ background:'linear-gradient(135deg,#00c853,#1b5e20)', color:'#fff', border:'none', padding:'14px 32px', borderRadius: '30px', fontWeight:800, fontSize:'15px', cursor:'pointer', boxShadow:'0 4px 16px rgba(0,200,80,0.4)' }}>
                Launch Camera AR
              </button>
            </div>
          )}

          {camState==='loading' && (
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', minHeight:'240px', color:'#aaa' }}>
              <div style={{ textAlign:'center' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.2)', borderTopColor: '#00c853', borderRadius: '50%', margin: '0 auto 12px auto', animation: 'spin 1s linear infinite' }}></div>
                <p>Activating camera...</p>
              </div>
            </div>
          )}

          {camState==='denied' && (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', minHeight:'240px', gap:'12px', padding:'32px' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
              </svg>
              <p style={{ color:'#ff6b6b', fontWeight:700 }}>Camera access was denied</p>
              <p style={{ color:'#aaa', textAlign:'center', fontSize:'13px' }}>Allow camera permission in browser settings and try again.</p>
              <button onClick={startCamera} style={{ background:'rgba(255,255,255,0.1)', color:'#fff', border:'1px solid #444', padding:'10px 24px', borderRadius:'20px', cursor:'pointer', fontWeight:700 }}>Try Again</button>
            </div>
          )}

          {camState==='unsupported' && (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', minHeight:'240px', gap:'12px', padding:'32px' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p style={{ color:'#ff6b6b', fontWeight:700 }}>AR not supported on this device</p>
              <p style={{ color:'#aaa', textAlign:'center', fontSize:'13px' }}>Try using Chrome or Safari on your phone.</p>
            </div>
          )}
        </div>

        {camState==='active' && !screenshot && (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:'14px', gap:'12px', flexWrap:'wrap' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
              <span style={{ color:'#aaa', fontSize:'12px' }}>Scale</span>
              <input type="range" min="0.3" max="2.5" step="0.1" value={plantScale}
                onChange={e=>setPlantScale(parseFloat(e.target.value))} style={{ accentColor:'#00c853', width:'120px' }} />
              <span style={{ color:'#fff', fontSize:'12px', fontWeight:700 }}>{Math.round(plantScale*100)}%</span>
            </div>
            <div style={{ display:'flex', gap:'10px' }}>
              <button onClick={takeScreenshot} style={{ background:'linear-gradient(135deg,#00c853,#1b5e20)', color:'#fff', border:'none', padding:'10px 20px', borderRadius:'20px', fontWeight:700, cursor:'pointer', fontSize:'13px' }}>Capture Photo</button>
              <button onClick={()=>{stopCamera();setCamState('idle');}} style={{ background:'rgba(255,255,255,0.08)', color:'#aaa', border:'1px solid #333', padding:'10px 16px', borderRadius:'20px', cursor:'pointer', fontSize:'13px' }}>Stop</button>
            </div>
          </div>
        )}
        {camState==='active' && !screenshot && (
          <p style={{ color:'#555', fontSize:'11px', textAlign:'center', marginTop:'8px' }}>Drag the plant to reposition · Use slider to resize</p>
        )}

        <div style={{ display:'flex', gap:'12px', marginTop:'14px', flexWrap:'wrap' }}>
          {[{ label:'Real Height', val:product?.height||'—' },{ label:'Growth Rate', val:product?.growthRate||'—' },{ label:'Pet Safe', val:product?.petFriendly?'Yes':'No' }].map((item,i)=>(
            <div key={i} style={{ background:'rgba(255,255,255,0.05)', borderRadius:'10px', padding:'10px 16px', flex:1, minWidth:'90px', textAlign:'center' }}>
              <div style={{ color:'#888', fontSize:'11px', marginBottom:'4px' }}>{item.label}</div>
              <div style={{ color:'#fff', fontWeight:700, fontSize:'14px' }}>{item.val}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
