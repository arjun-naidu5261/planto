import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export default function ProfileModal() {
  const { 
    showProfileModal, 
    setShowProfileModal,
    wallet, 
    addWalletFunds,
    logoutUser,
    isLoggedIn,
    currentUser,
    updateUserProfile
  } = useApp();

  const [addFundsSuccess, setAddFundsSuccess] = useState('');
  const [isAddingFunds, setIsAddingFunds] = useState(false);

  // Profile editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(currentUser?.name || 'Suhas K.');
  const [editPhone, setEditPhone] = useState(currentUser?.phone || '+91 99001 12345');
  
  // Address manager state
  const [newAddress, setNewAddress] = useState('');
  const [editingAddressIdx, setEditingAddressIdx] = useState(null);
  const [editingAddressText, setEditingAddressText] = useState('');
  const [showAddAddress, setShowAddAddress] = useState(false);

  if (!showProfileModal || !isLoggedIn || currentUser?.role !== 'Customer') return null;

  // Address list
  const userAddresses = currentUser?.addresses || [
    'Indiranagar Sector 3, Bengaluru, KA - 560038'
  ];
  const activeAddressIdx = currentUser?.activeAddressIdx || 0;

  const handleClose = () => {
    setShowProfileModal(false);
    setIsEditing(false);
  };

  const handleLogout = () => {
    logoutUser();
    handleClose();
    window.location.hash = "#/";
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateUserProfile({
      name: editName,
      phone: editPhone
    });
    setIsEditing(false);
  };

  const handleAddAddress = (e) => {
    e.preventDefault();
    if (!newAddress.trim()) return;
    const updatedAddresses = [...userAddresses, newAddress.trim()];
    updateUserProfile({
      addresses: updatedAddresses,
      activeAddressIdx: updatedAddresses.length - 1 // Default to new address
    });
    setNewAddress('');
  };

  const handleSaveEditedAddress = (index) => {
    if (!editingAddressText.trim()) return;
    const updatedAddresses = [...userAddresses];
    updatedAddresses[index] = editingAddressText.trim();
    updateUserProfile({
      addresses: updatedAddresses
    });
    setEditingAddressIdx(null);
    setEditingAddressText('');
  };

  const handleDeleteAddress = (index) => {
    if (userAddresses.length <= 1) {
      alert("You must have at least one delivery address!");
      return;
    }
    const updatedAddresses = userAddresses.filter((_, i) => i !== index);
    let newActiveIdx = activeAddressIdx;
    if (activeAddressIdx >= updatedAddresses.length) {
      newActiveIdx = updatedAddresses.length - 1;
    }
    updateUserProfile({
      addresses: updatedAddresses,
      activeAddressIdx: newActiveIdx
    });
  };

  const handleSelectActiveAddress = (index) => {
    updateUserProfile({
      activeAddressIdx: index
    });
  };

  const handleAddFundsSimulate = async (amount) => {
    setIsAddingFunds(true);
    setAddFundsSuccess('');
    const res = await addWalletFunds(amount);
    setIsAddingFunds(false);
    if (res.success) {
      setAddFundsSuccess(`Successfully added ₹${amount} to your wallet!`);
      setTimeout(() => setAddFundsSuccess(''), 3000);
    } else {
      alert("Failed to add funds. Please try again.");
    }
  };

  return (
    <div className="modal-overlay active" id="modal-profile" onClick={handleClose}>
      <div 
        className="modal-content" 
        style={{ 
          maxWidth: '480px', 
          width: '100%', 
          padding: '30px', 
          borderRadius: '20px', 
          maxHeight: '90vh', 
          overflowY: 'auto' 
        }} 
        onClick={(e) => e.stopPropagation()}
      >
        <button className="close-modal" onClick={handleClose}>&times;</button>

        {/* Header / Avatar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #f0f0f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              background: 'var(--primary-green)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              fontWeight: 800
            }}>
              {currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800 }}>{currentUser.name}</h3>
              <span style={{ fontSize: '11px', background: 'var(--light-green)', color: 'var(--primary-green)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                🌟 PREMIUM CUSTOMER
              </span>
            </div>
          </div>
          
          {!isEditing && (
            <button 
              onClick={() => {
                setEditName(currentUser.name);
                setEditPhone(currentUser.phone || '+91 99001 12345');
                setIsEditing(true);
              }} 
              style={{ background: 'none', border: 'none', color: 'var(--primary-green)', cursor: 'pointer', fontSize: '13px', fontWeight: 700 }}
            >
              ✏️ Edit Profile
            </button>
          )}
        </div>

        {/* Profile edit form or details */}
        {isEditing ? (
          <form onSubmit={handleSaveProfile} style={{ marginBottom: '24px' }}>
            <div className="form-group">
              <label style={{ fontSize: '11px', color: '#888' }}>FULL NAME</label>
              <input 
                type="text" 
                required 
                value={editName} 
                onChange={(e) => setEditName(e.target.value)} 
                style={{ padding: '8px 12px', fontSize: '13px' }}
              />
            </div>
            <div className="form-group">
              <label style={{ fontSize: '11px', color: '#888' }}>PHONE NUMBER</label>
              <input 
                type="text" 
                required 
                value={editPhone} 
                onChange={(e) => setEditPhone(e.target.value)} 
                style={{ padding: '8px 12px', fontSize: '13px' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
              <button type="submit" className="btn" style={{ padding: '6px 12px', fontSize: '12px', flex: 1, justifyContent: 'center' }}>Save Changes</button>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setIsEditing(false)}
                style={{ padding: '6px 12px', fontSize: '12px', flex: 1, justifyContent: 'center' }}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', marginBottom: '24px' }}>
            <div>
              <span style={{ color: '#888', display: 'block', fontSize: '11px' }}>EMAIL ADDRESS</span>
              <strong>{currentUser.email}</strong>
            </div>
            <div>
              <span style={{ color: '#888', display: 'block', fontSize: '11px' }}>PHONE</span>
              <strong>{currentUser.phone || '+91 99001 12345'}</strong>
            </div>
            <div>
              <span style={{ color: '#888', display: 'block', fontSize: '11px' }}>ACTIVE DELIVERY ADDRESS</span>
              <strong style={{ display: 'block', lineHeight: '1.4', color: 'var(--dark)' }}>
                {userAddresses[activeAddressIdx]}
              </strong>
            </div>
          </div>
        )}

        {/* Address Manager section */}
        <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '16px', marginBottom: '24px' }}>
          <h4 style={{ fontSize: '14px', marginBottom: '12px', fontWeight: 700 }}>
            📍 Delivery Addresses
          </h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
            {userAddresses.map((addr, idx) => {
              const isActive = idx === activeAddressIdx;
              const isEditingThis = idx === editingAddressIdx;

              return (
                <div 
                  key={idx} 
                  style={{ 
                    background: isActive ? 'var(--light-green)' : '#fcfcf9',
                    border: isActive ? '1px solid var(--primary-green)' : '1px solid rgba(0,0,0,0.05)',
                    padding: '10px', 
                    borderRadius: '8px', 
                    display: 'flex', 
                    flexDirection: 'column',
                    gap: '6px'
                  }}
                >
                  {isEditingThis ? (
                    <div>
                      <textarea 
                        rows="2" 
                        value={editingAddressText} 
                        onChange={(e) => setEditingAddressText(e.target.value)} 
                        style={{ width: '100%', padding: '6px', fontSize: '12px', border: '1px solid #ccc', borderRadius: '4px', outline: 'none', fontFamily: 'var(--font-main)' }}
                      />
                      <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                        <button className="btn" style={{ padding: '4px 8px', fontSize: '10px' }} onClick={() => handleSaveEditedAddress(idx)}>Save</button>
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '4px 8px', fontSize: '10px' }} 
                          onClick={() => {
                            setEditingAddressIdx(null);
                            setEditingAddressText('');
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                        <input 
                          type="radio" 
                          name="active-modal-address" 
                          checked={isActive}
                          onChange={() => handleSelectActiveAddress(idx)}
                          style={{ marginTop: '3px', cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: '12px', lineHeight: '1.4', flex: 1, color: isActive ? 'var(--dark)' : '#555' }}>
                          {addr}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid rgba(0,0,0,0.02)', paddingTop: '4px' }}>
                        <button 
                          onClick={() => {
                            setEditingAddressIdx(idx);
                            setEditingAddressText(addr);
                          }}
                          title="Edit Address"
                          style={{ 
                            background: 'none', 
                            border: 'none', 
                            color: 'var(--primary-green)', 
                            cursor: 'pointer', 
                            padding: '4px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease',
                            borderRadius: '4px'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'scale(1.15)';
                            e.currentTarget.style.background = 'rgba(46,125,50,0.05)';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.background = 'none';
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => handleDeleteAddress(idx)}
                          title="Delete Address"
                          style={{ 
                            background: 'none', 
                            border: 'none', 
                            color: '#d32f2f', 
                            cursor: 'pointer', 
                            padding: '4px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease',
                            borderRadius: '4px'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'scale(1.15)';
                            e.currentTarget.style.background = 'rgba(211,47,47,0.05)';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.background = 'none';
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18" />
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add address collapsible panel */}
          <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '12px' }}>
            <div 
              onClick={() => setShowAddAddress(!showAddAddress)}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px', 
                cursor: 'pointer', 
                fontSize: '11px', 
                fontWeight: 700, 
                color: 'var(--dark)',
                marginBottom: showAddAddress ? '10px' : '0',
                userSelect: 'none',
                transition: 'all 0.2s ease',
                padding: '4px 0',
                width: 'fit-content'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.opacity = '0.7';
                e.currentTarget.style.transform = 'scale(1.02)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.opacity = '1';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#7E57C2' }}>
                {showAddAddress ? '−' : '＋'}
              </span>
              ADD NEW ADDRESS
            </div>

            {showAddAddress && (
              <form onSubmit={handleAddAddress} style={{ marginTop: '8px' }}>
                <textarea 
                  rows="2"
                  placeholder="Type new shipping address here..."
                  required
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  style={{ width: '100%', padding: '8px', fontSize: '12px', border: '1px solid #ccc', borderRadius: '8px', outline: 'none', fontFamily: 'var(--font-main)', marginBottom: '8px' }}
                />
                <button type="submit" className="btn btn-secondary" style={{ width: '100%', fontSize: '11px', padding: '8px', justifyContent: 'center' }}>
                  Add Address & Set Default
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Wallet recharge simulator */}
        <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '16px', marginBottom: '24px' }}>
          <h4 style={{ fontSize: '14px', color: 'var(--earth-brown)', marginBottom: '4px', fontWeight: 600 }}>
            PLANTO Green Wallet
          </h4>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--primary-green)', marginBottom: '12px' }}>
            ₹{Math.round(wallet)}
          </div>
          
          <div style={{ background: 'var(--bg)', padding: '12px', borderRadius: '10px' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--dark)', display: 'block', marginBottom: '6px' }}>
              SIMULATE RECHARGE
            </span>
            {addFundsSuccess && (
              <div style={{ fontSize: '11px', color: 'var(--primary-green)', marginBottom: '8px', fontWeight: 600 }}>
                {addFundsSuccess}
              </div>
            )}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                disabled={isAddingFunds}
                onClick={() => handleAddFundsSimulate(200)}
                className="btn btn-secondary"
                style={{ flex: 1, padding: '6px', fontSize: '11px', justifyContent: 'center', background: 'var(--white)' }}
              >
                +₹200
              </button>
              <button 
                disabled={isAddingFunds}
                onClick={() => handleAddFundsSimulate(500)}
                className="btn btn-secondary"
                style={{ flex: 1, padding: '6px', fontSize: '11px', justifyContent: 'center', background: 'var(--white)' }}
              >
                +₹500
              </button>
              <button 
                disabled={isAddingFunds}
                onClick={() => handleAddFundsSimulate(1000)}
                className="btn btn-secondary"
                style={{ flex: 1, padding: '6px', fontSize: '11px', justifyContent: 'center', background: 'var(--white)' }}
              >
                +₹1000
              </button>
            </div>
          </div>
        </div>

        {/* Simple red logout button */}
        <button 
          onClick={handleLogout}
          style={{ 
            width: '100%', 
            borderRadius: '10px', 
            padding: '10.5px', 
            fontSize: '13px', 
            fontWeight: 700,
            color: 'white',
            background: '#d32f2f',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'center',
            transition: 'background 0.2s ease',
            display: 'block'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = '#b71c1c'}
          onMouseOut={(e) => e.currentTarget.style.background = '#d32f2f'}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
