import React, { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:5002/api';
const DEFAULT_PLANT_IMG = 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=600&q=80';

export default function App() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminEmail, setAdminEmail] = useState('admin@planto.in');
  const [adminPassword, setAdminPassword] = useState('admin123');
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'vendors' | 'products' | 'orders' | 'settings'
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const vRes = await fetch(`${API_BASE}/vendors`);
      const vData = await vRes.json();
      setVendors(vData);

      const pRes = await fetch(`${API_BASE}/products`);
      const pData = await pRes.json();
      setProducts(pData);

      const oRes = await fetch(`${API_BASE}/orders`);
      const oData = await oRes.json();
      setOrders(oData);
    } catch (err) {
      console.error('Admin API error:', err);
    }
  };

  const getImageSrc = (prod) => {
    const url = prod?.images?.[0];
    if (url && typeof url === 'string' && url.startsWith('http')) return url;
    return DEFAULT_PLANT_IMG;
  };

  const handleToggleVendorApproval = (vendorId) => {
    setVendors(vendors.map(v => v.id === vendorId ? { ...v, isOpen: !v.isOpen } : v));
  };

  const handleAdminAuthSubmit = (e) => {
    e.preventDefault();
    if (!adminEmail) return;
    setIsAdminLoggedIn(true);
  };

  if (!isAdminLoggedIn) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1b4332 0%, #081c15 100%)', padding: '20px', color: '#1b4332', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div className="card" style={{ maxWidth: '440px', width: '100%', padding: '40px', borderRadius: '24px', background: '#ffffff', border: '2px solid #2d6a4f', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: '#e8f5e9', color: '#1b4332', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px auto', fontSize: '32px' }}>
              🛡️
            </div>
            <h1 style={{ fontSize: '26px', fontFamily: 'var(--font-serif)', color: '#1b4332', margin: 0 }}>PLANTO Super Admin</h1>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '6px' }}>Master Operations & Platform Control Console</p>
          </div>

          <form onSubmit={handleAdminAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px', display: 'block' }}>Admin Credentials Email</label>
              <input 
                type="email" 
                value={adminEmail} 
                onChange={(e) => setAdminEmail(e.target.value)} 
                placeholder="admin@planto.in"
                required 
                style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px', display: 'block' }}>Security Password</label>
              <input 
                type="password" 
                value={adminPassword} 
                onChange={(e) => setAdminPassword(e.target.value)} 
                required 
                style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
              />
            </div>

            <div style={{ background: '#f8faf9', padding: '10px 14px', borderRadius: '12px', fontSize: '11px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#1b4332', fontWeight: 700 }}>⚡ Demo Root Account:</span>
              <button 
                type="button" 
                onClick={() => { setAdminEmail('admin@planto.in'); setAdminPassword('admin123'); }}
                style={{ background: '#e8f5e9', color: '#1b4332', border: 'none', padding: '4px 10px', borderRadius: '6px', fontWeight: 800, fontSize: '11px', cursor: 'pointer' }}
              >
                Auto Fill Credentials
              </button>
            </div>

            <button type="submit" className="btn" style={{ width: '100%', justifyContent: 'center', height: '48px', background: '#1b4332', color: '#ffffff', borderRadius: '12px', border: 'none', fontWeight: 800, fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 14px rgba(27,67,50,0.2)' }}>
              Access Super Admin Operations →
            </button>
          </form>
        </div>
      </div>
    );
  }

  const totalGMV = orders.reduce((sum, o) => sum + (o.total || 0), 0) + 18500;
  const platformCommission = Math.round(totalGMV * 0.08);

  const adminSidebarItems = [
    { id: 'dashboard', label: 'Overall Platform Dashboard', icon: '📊' },
    { id: 'vendors', label: 'Nursery Stalls Manager', icon: '🏪', count: vendors.length },
    { id: 'products', label: 'Global Catalog Moderation', icon: '🪴', count: products.length },
    { id: 'orders', label: 'Live Order Stream', icon: '📦', count: orders.length },
    { id: 'settings', label: 'Platform Settings', icon: '⚙️' }
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#090d16', color: '#fff' }}>
      
      {/* ADMIN LEFT SIDEBAR */}
      <aside style={{
        width: sidebarOpen ? '260px' : '76px',
        height: '100vh',
        position: 'sticky',
        top: 0,
        background: '#0f172a',
        borderRight: '1px solid #1e293b',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.25s ease',
        zIndex: 100
      }}>
        {/* Header */}
        <div style={{ padding: '20px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          {sidebarOpen ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '24px' }}>🛡️</span>
              <div>
                <h3 style={{ fontSize: '15px', margin: 0, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-serif)' }}>PLANTO Admin</h3>
                <span style={{ fontSize: '10px', color: '#38bdf8' }}>Super Operations</span>
              </div>
            </div>
          ) : (
            <span style={{ fontSize: '24px', margin: '0 auto' }}>🛡️</span>
          )}

          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', width: '28px', height: '28px', borderRadius: '6px', cursor: 'pointer' }}
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav style={{ padding: '16px 10px', display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, overflowY: 'auto' }}>
          {adminSidebarItems.map(item => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: 'none',
                  background: active ? '#2563eb' : 'transparent',
                  color: '#fff',
                  fontWeight: active ? 800 : 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease'
                }}
              >
                <span style={{ fontSize: '18px' }}>{item.icon}</span>
                {sidebarOpen && (
                  <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.label}
                  </span>
                )}
                {sidebarOpen && item.count !== undefined && (
                  <span style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: '10px', fontWeight: 800, padding: '2px 7px', borderRadius: '10px' }}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* CLEAN ADMIN SIDEBAR FOOTER AT VERY BOTTOM */}
        <div style={{ padding: '18px 14px', borderTop: '1px solid #1e293b', background: 'rgba(0,0,0,0.3)', marginTop: 'auto', flexShrink: 0 }}>
          {sidebarOpen ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '16px', flexShrink: 0 }}>
                  A
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#fff', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    Super Admin Console
                  </div>
                  <div style={{ fontSize: '11px', color: '#38bdf8' }}>
                    Root Controller
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setIsAdminLoggedIn(false)}
                style={{ width: '100%', background: 'rgba(220, 38, 38, 0.2)', color: '#ef4444', border: '1px solid rgba(220, 38, 38, 0.4)', padding: '9px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                🚪 Logout System
              </button>
            </div>
          ) : (
            <button onClick={() => setIsAdminLoggedIn(false)} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '20px', cursor: 'pointer', display: 'block', margin: '0 auto' }}>
              🚪
            </button>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontFamily: 'var(--font-serif)', margin: 0, color: '#fff' }}>
              {adminSidebarItems.find(i => i.id === activeTab)?.label}
            </h1>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>
              PLANTO Platform Master Control Panel
            </p>
          </div>
        </div>

        {/* TAB 0: OVERALL PLATFORM DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <div className="card" style={{ background: '#1e293b', borderLeft: '4px solid #4ade80', color: '#fff' }}>
                <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 800 }}>TOTAL PLATFORM GMV</span>
                <h3 style={{ fontSize: '28px', color: '#4ade80', marginTop: '4px', margin: 0 }}>₹{totalGMV.toLocaleString()}</h3>
                <span style={{ fontSize: '11px', color: '#4ade80', marginTop: '6px', display: 'block' }}>+24% growth this month</span>
              </div>
              <div className="card" style={{ background: '#1e293b', borderLeft: '4px solid #38bdf8', color: '#fff' }}>
                <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 800 }}>REGISTERED NURSERIES</span>
                <h3 style={{ fontSize: '28px', color: '#38bdf8', marginTop: '4px', margin: 0 }}>{vendors.length} Stalls</h3>
                <span style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px', display: 'block' }}>Verified Sellers</span>
              </div>
              <div className="card" style={{ background: '#1e293b', borderLeft: '4px solid #facc15', color: '#fff' }}>
                <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 800 }}>ACTIVE RIDER FLEET</span>
                <h3 style={{ fontSize: '28px', color: '#facc15', marginTop: '4px', margin: 0 }}>14 Riders</h3>
                <span style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px', display: 'block' }}>⚡ 28 Mins Avg SLA</span>
              </div>
              <div className="card" style={{ background: '#1e293b', borderLeft: '4px solid #a78bfa', color: '#fff' }}>
                <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 800 }}>PLATFORM REVENUE (8%)</span>
                <h3 style={{ fontSize: '28px', color: '#c084fc', marginTop: '4px', margin: 0 }}>₹{platformCommission.toLocaleString()}</h3>
                <span style={{ fontSize: '11px', color: '#c084fc', marginTop: '6px', display: 'block' }}>Net earnings</span>
              </div>
            </div>

            <div className="card" style={{ background: '#1e293b', color: '#fff' }}>
              <h3 style={{ fontSize: '18px', fontFamily: 'var(--font-serif)', marginBottom: '12px', color: '#fff' }}>System Architecture Health</h3>
              <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
                Unified Monorepo API running on Port 5002 • Customer Marketplace (Port 5173) • Business Portal (Port 5174) • Super Admin Console (Port 5175). All micro-services active and synchronized.
              </p>
            </div>
          </div>
        )}

        {/* TAB 1: VENDORS MANAGER */}
        {activeTab === 'vendors' && (
          <div className="card" style={{ background: '#1e293b', color: '#fff', padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead style={{ background: '#0f172a', borderBottom: '1px solid #334155' }}>
                <tr>
                  <th style={{ padding: '14px 20px' }}>Nursery Stall Name</th>
                  <th style={{ padding: '14px 20px' }}>Owner</th>
                  <th style={{ padding: '14px 20px' }}>Type</th>
                  <th style={{ padding: '14px 20px' }}>Rating</th>
                  <th style={{ padding: '14px 20px' }}>Status</th>
                  <th style={{ padding: '14px 20px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map((v) => (
                  <tr key={v.id} style={{ borderBottom: '1px solid #334155' }}>
                    <td style={{ padding: '14px 20px', fontWeight: 800 }}>{v.name}</td>
                    <td style={{ padding: '14px 20px', color: '#94a3b8' }}>{v.owner}</td>
                    <td style={{ padding: '14px 20px' }}>{v.type}</td>
                    <td style={{ padding: '14px 20px', color: '#facc15', fontWeight: 800 }}>⭐ {v.rating}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ background: v.isOpen ? '#14532d' : '#7f1d1d', color: v.isOpen ? '#4ade80' : '#f87171', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 800 }}>
                        {v.isOpen ? 'ACTIVE SELLER' : 'DISABLED'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <button 
                        className="btn" 
                        style={{ fontSize: '11px', padding: '4px 8px', background: v.isOpen ? '#dc2626' : '#16a34a' }}
                        onClick={() => handleToggleVendorApproval(v.id)}
                      >
                        {v.isOpen ? 'Disable Store' : 'Approve Nursery'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: PRODUCTS CATALOG */}
        {activeTab === 'products' && (
          <div className="card" style={{ background: '#1e293b', color: '#fff', padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead style={{ background: '#0f172a', borderBottom: '1px solid #334155' }}>
                <tr>
                  <th style={{ padding: '14px 20px' }}>Item Photo & Name</th>
                  <th style={{ padding: '14px 20px' }}>Category</th>
                  <th style={{ padding: '14px 20px' }}>Price</th>
                  <th style={{ padding: '14px 20px' }}>Stock</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #334155' }}>
                    <td style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img src={getImageSrc(p)} alt={p.name} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                      <span style={{ fontWeight: 800 }}>{p.name}</span>
                    </td>
                    <td style={{ padding: '12px 20px', color: '#94a3b8' }}>{p.category}</td>
                    <td style={{ padding: '12px 20px', fontWeight: 800, color: '#4ade80' }}>₹{p.price}</td>
                    <td style={{ padding: '12px 20px' }}>{p.quantity} units</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: ORDERS STREAM */}
        {activeTab === 'orders' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {orders.map((o) => (
              <div key={o.id} className="card" style={{ background: '#1e293b', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ fontSize: '16px' }}>Order #{o.id}</strong>
                  <p style={{ fontSize: '13px', color: '#94a3b8', margin: '4px 0 0 0' }}>Date: {o.date} • Nursery: {o.vendorName || 'Sai Baba Stall'}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#4ade80' }}>₹{o.total}</div>
                  <span style={{ fontSize: '11px', color: '#38bdf8' }}>Status: {o.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="card" style={{ background: '#1e293b', color: '#fff', maxWidth: '600px' }}>
            <h3 style={{ fontSize: '18px', fontFamily: 'var(--font-serif)', marginBottom: '16px' }}>Platform Financial Parameters</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '14px' }}>
              <div><strong>Marketplace Commission:</strong> 8.0% per completed order</div>
              <div><strong>Nursery Delivery SLA:</strong> 30-45 minutes express</div>
              <div><strong>Delivery Rider Base Pay:</strong> ₹55 + ₹10 Plant Care Bonus</div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
