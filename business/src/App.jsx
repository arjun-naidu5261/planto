import React, { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:5002/api';
const DEFAULT_PLANT_IMG = 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=600&q=80';

export default function App() {
  // Authentication & Role State (Persisted in localStorage across page refreshes)
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('planto_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      name: 'Suresh Rao',
      email: 'vendor@planto.in',
      role: 'Vendor',
      nurseryName: 'Sai Baba Plant & Pot Stall',
      address: 'Opposite Metro Station Pillar 124, Indiranagar, Bengaluru',
      phone: '+91 98480 22334',
      hours: '7:00 AM - 7:30 PM'
    };
  });
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // Login Form State
  const [loginEmail, setLoginEmail] = useState('vendor@planto.in');
  const [loginPassword, setLoginPassword] = useState('planto123');
  
  // Registration Form State
  const [regRole, setRegRole] = useState('Vendor'); // 'Vendor' or 'Delivery Partner'
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regDetail, setRegDetail] = useState(''); // Nursery Stall Name
  const [regPassword, setRegPassword] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regVehicle, setRegVehicle] = useState('Hero Electric Scooter');
  const [regVehicleNum, setRegVehicleNum] = useState('');
  const [regDlNum, setRegDlNum] = useState('');
  const [regDlDoc, setRegDlDoc] = useState('');
  const [dlFileName, setDlFileName] = useState('');
  const [dlFileType, setDlFileType] = useState('');
  const [regAadhaarNum, setRegAadhaarNum] = useState('');
  const [regAadhaarDoc, setRegAadhaarDoc] = useState('');
  const [aadhaarFileName, setAadhaarFileName] = useState('');
  const [aadhaarFileType, setAadhaarFileType] = useState('');
  const [authError, setAuthError] = useState('');
  
  // Sidebar Toggle State
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Nursery Dashboard States
  const [vendorProducts, setVendorProducts] = useState([]);
  const [vendorOrders, setVendorOrders] = useState([]);
  const [storeOpen, setStoreOpen] = useState(true);
  const [vendorTab, setVendorTab] = useState(() => {
    return localStorage.getItem('planto_vendor_tab') || 'dashboard';
  });
  
  // Add Product Modal State
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdType, setNewProdType] = useState('plant');
  const [newProdCategory, setNewProdCategory] = useState('Indoor Plants');
  const [newProdPrice, setNewProdPrice] = useState(250);
  const [newProdStock, setNewProdStock] = useState(15);
  const [newProdImg, setNewProdImg] = useState(DEFAULT_PLANT_IMG);

  // Media Upload State (Multiple Images & Videos)
  const [uploadedMedia, setUploadedMedia] = useState([]);
  const [mediaUrlInput, setMediaUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  // Product Preview & Edit Modal States
  const [previewProduct, setPreviewProduct] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editProdName, setEditProdName] = useState('');
  const [editProdCategory, setEditProdCategory] = useState('');
  const [editProdType, setEditProdType] = useState('');
  const [editProdPrice, setEditProdPrice] = useState('');
  const [editProdStock, setEditProdStock] = useState('');
  const [editProdImg, setEditProdImg] = useState('');

  const handleOpenEditProduct = (prod) => {
    setEditingProduct(prod);
    setEditProdName(prod.name || '');
    setEditProdCategory(prod.category || 'Indoor Plants');
    setEditProdType(prod.type || 'Plant Sapling');
    setEditProdPrice(prod.price || 0);
    setEditProdStock(prod.quantity || 0);
    setEditProdImg(getImageSrc(prod));
  };

  const handleSaveEditProduct = (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    setVendorProducts(vendorProducts.map(p => p.id === editingProduct.id ? {
      ...p,
      name: editProdName,
      category: editProdCategory,
      type: editProdType,
      price: Number(editProdPrice),
      quantity: Number(editProdStock),
      images: [editProdImg]
    } : p));
    setEditingProduct(null);
  };

  const handleDeleteProduct = (productId) => {
    if (window.confirm("Are you sure you want to delete this plant item from your inventory?")) {
      const updated = vendorProducts.filter(p => p.id !== productId);
      setVendorProducts(updated);
      localStorage.setItem('planto_vendor_products', JSON.stringify(updated));
    }
  };

  // Edit Profile Modal State
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editProfileName, setEditProfileName] = useState('');
  const [editProfileEmail, setEditProfileEmail] = useState('');
  const [editProfilePhone, setEditProfilePhone] = useState('');
  const [editProfileAddress, setEditProfileAddress] = useState('');
  const [editProfileDetail, setEditProfileDetail] = useState(''); // Nursery Name or Vehicle Model
  const [editProfileVehicleNum, setEditProfileVehicleNum] = useState('');

  // Delivery Partner Dashboard States
  const [dutyStatus, setDutyStatus] = useState(true);
  const [deliveryOrders, setDeliveryOrders] = useState([]);
  const [riderTab, setRiderTab] = useState(() => {
    return localStorage.getItem('planto_rider_tab') || 'dashboard';
  });
  const [pastDeliveries, setPastDeliveries] = useState([]);

  const [categories, setCategories] = useState([
    { id: 'cat_seasonal_1', name: 'Spring Bloom' },
    { id: 'cat_seasonal_2', name: 'Summer Oasis' },
    { id: 'cat_seasonal_3', name: 'Monsoon Magic' },
    { id: 'cat_seasonal_4', name: 'Winter Wonders' }
  ]);

  const [itemTypes, setItemTypes] = useState([
    { id: 'it_1', name: 'Indoor Plants' },
    { id: 'it_2', name: 'Outdoor & Flowering Plants' },
    { id: 'it_3', name: 'Pots & Terracotta Planters' },
    { id: 'it_4', name: 'Seeds & Organic Soil' },
    { id: 'it_5', name: 'Fresh Flower Bouquets' },
    { id: 'it_6', name: 'Gardening Tools' },
    { id: 'it_7', name: 'Plant Sapling' },
    { id: 'it_8', name: 'Pot / Planter' },
    { id: 'it_9', name: 'Hydroponics Equipment' }
  ]);

  // Initial load
  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (currentUser) {
      try {
        const userToSave = { ...currentUser };
        delete userToSave.dlDoc;
        delete userToSave.aadhaarDoc;
        localStorage.setItem('planto_user', JSON.stringify(userToSave));
      } catch (err) {
        console.warn('LocalStorage save warning:', err);
      }
    } else {
      localStorage.removeItem('planto_user');
    }
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'Delivery Partner' || !currentUser.email) return;

    const checkRiderAccountStatus = async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/status?email=${encodeURIComponent(currentUser.email)}`);
        const data = await res.json().catch(() => null);
        if (data && data.active === false) {
          setCurrentUser(null);
          localStorage.removeItem('planto_user');
          setTimeout(() => {
            alert('🚫 You are blocked by the Admin. Please contact the Admin.');
          }, 50);
        } else if (data && data.rider) {
          setCurrentUser(prev => ({
            ...prev,
            name: data.rider.name || prev.name,
            phone: data.rider.phone || prev.phone,
            address: data.rider.address || prev.address,
            vehicle: data.rider.vehicle || prev.vehicle,
            vehicleNumber: data.rider.vehicleNumber || prev.vehicleNumber,
            drivingLicense: data.rider.drivingLicense || prev.drivingLicense,
            aadhaar: data.rider.aadhaar || prev.aadhaar,
            dlDoc: data.rider.dlDoc || prev.dlDoc,
            dlFileName: data.rider.dlFileName || prev.dlFileName,
            aadhaarDoc: data.rider.aadhaarDoc || prev.aadhaarDoc,
            aadhaarFileName: data.rider.aadhaarFileName || prev.aadhaarFileName,
            status: data.rider.status || prev.status
          }));
        }
      } catch (err) {}
    };

    checkRiderAccountStatus();
    const interval = setInterval(checkRiderAccountStatus, 3000);
    window.addEventListener('focus', checkRiderAccountStatus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', checkRiderAccountStatus);
    };
  }, [currentUser?.email]);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const impersonateData = params.get('impersonate');
      if (impersonateData) {
        const userObj = JSON.parse(decodeURIComponent(impersonateData));
        if (userObj && userObj.email) {
          setCurrentUser(userObj);
          const safeUser = { ...userObj };
          delete safeUser.dlDoc;
          delete safeUser.aadhaarDoc;
          localStorage.setItem('planto_user', JSON.stringify(safeUser));
          if (userObj.role === 'Delivery Partner') {
            setRiderTab('dashboard');
          } else {
            setVendorTab('dashboard');
          }
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    } catch (err) {
      console.error('Error handling admin impersonate login:', err);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('planto_vendor_tab', vendorTab);
  }, [vendorTab]);

  useEffect(() => {
    localStorage.setItem('planto_rider_tab', riderTab);
  }, [riderTab]);

  useEffect(() => {
    if (vendorProducts && vendorProducts.length > 0) {
      localStorage.setItem('planto_vendor_products', JSON.stringify(vendorProducts));
    }
  }, [vendorProducts]);

  const fetchInitialData = async () => {
    try {
      const pRes = await fetch(`${API_BASE}/products`);
      const pData = await pRes.json();

      const savedProds = localStorage.getItem('planto_vendor_products');
      let localProds = [];
      if (savedProds) {
        try { localProds = JSON.parse(savedProds) || []; } catch (e) {}
      }

      const mergedMap = new Map();
      if (Array.isArray(localProds)) {
        localProds.forEach(p => mergedMap.set(p.id, p));
      }
      if (Array.isArray(pData)) {
        pData.forEach(p => {
          if (!mergedMap.has(p.id)) mergedMap.set(p.id, p);
        });
      }

      const finalProductList = Array.from(mergedMap.values());
      setVendorProducts(finalProductList);
      localStorage.setItem('planto_vendor_products', JSON.stringify(finalProductList));

      const oRes = await fetch(`${API_BASE}/orders`);
      const oData = await oRes.json();
      setVendorOrders(oData);
      if (Array.isArray(oData) && currentUser) {
        const assignedRiderOrders = oData.filter(o => o.assignedRiderEmail && o.assignedRiderEmail.toLowerCase() === currentUser.email.toLowerCase());
        setDeliveryOrders(assignedRiderOrders);
      } else {
        setDeliveryOrders([]);
      }

      const cRes = await fetch(`${API_BASE}/categories`);
      const cData = await cRes.json();
      if (cData && Array.isArray(cData)) setCategories(cData);

      const itRes = await fetch(`${API_BASE}/item-types`);
      const itData = await itRes.json();
      if (itData && Array.isArray(itData)) setItemTypes(itData);
    } catch (err) {
      console.error('API load error:', err);
    }
  };

  const getImageSrc = (prod) => {
    const raw = prod?.images?.[0] || prod?.images;
    const url = typeof raw === 'object' ? raw?.url : raw;
    if (url && typeof url === 'string' && (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:'))) {
      return url;
    }
    if (prod?.image && typeof prod.image === 'string' && (prod.image.startsWith('http') || prod.image.startsWith('data:') || prod.image.startsWith('blob:'))) {
      return prod.image;
    }
    const name = (prod?.name || '').toLowerCase();
    if (name.includes('snake')) return 'https://images.unsplash.com/photo-1592150621744-aca64f48394a?auto=format&fit=crop&w=600&q=80';
    if (name.includes('jade') || name.includes('succulent')) return 'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?auto=format&fit=crop&w=600&q=80';
    if (name.includes('hibiscus') || name.includes('flower') || name.includes('rose')) return 'https://images.unsplash.com/photo-1598902108854-10e335adac99?auto=format&fit=crop&w=600&q=80';
    if (name.includes('bonsai') || name.includes('ficus')) return 'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&w=600&q=80';
    return DEFAULT_PLANT_IMG;
  };

  const handleOpenDocument = (dataUrl, fileName = 'Document.pdf') => {
    if (!dataUrl) {
      alert('No document file attached for inspection.');
      return;
    }

    if (typeof dataUrl === 'string' && dataUrl.startsWith('data:application/pdf')) {
      try {
        const parts = dataUrl.split(',');
        const base64 = parts[1];
        const binaryStr = atob(base64);
        const len = binaryStr.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryStr.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(blob);
        const newWin = window.open(blobUrl, '_blank');
        if (!newWin) {
          alert('Pop-up blocked! Please allow pop-ups for localhost to view the PDF file.');
        }
        return;
      } catch (err) {
        console.error('Error opening PDF blob:', err);
      }
    }

    if (typeof dataUrl === 'string' && (dataUrl.startsWith('http') || dataUrl.startsWith('blob:'))) {
      const newWin = window.open(dataUrl, '_blank');
      if (!newWin) {
        alert('Pop-up blocked! Please allow pop-ups for localhost to view the document.');
      }
      return;
    }

    const win = window.open('about:blank', '_blank');
    if (win) {
      win.document.write(`
        <!DOCTYPE html>
        <html>
          <head><title>${fileName}</title></head>
          <body style="margin:0; background:#0f172a; display:flex; justify-content:center; align-items:center; height:100vh;">
            <iframe src="${dataUrl}" style="width:100%; height:100%; border:none;"></iframe>
          </body>
        </html>
      `);
      win.document.close();
    } else {
      alert('Pop-up blocked! Please allow pop-ups for localhost to view the PDF file.');
    }
  };

  const handleDownloadDocument = (dataUrl, defaultFileName = 'Document.pdf') => {
    if (!dataUrl) {
      alert('No document file attached for download.');
      return;
    }

    const cleanFileName = defaultFileName.endsWith('.pdf') ? defaultFileName : `${defaultFileName}.pdf`;

    if (typeof dataUrl === 'string' && dataUrl.startsWith('data:')) {
      try {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = cleanFileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      } catch (err) {
        console.error('Download error:', err);
      }
    }

    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = cleanFileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e, docType) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10MB limit. Please upload a smaller PDF or image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      if (docType === 'dl') {
        setRegDlDoc(dataUrl);
        setDlFileName(file.name);
        setDlFileType(file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'));
      } else if (docType === 'aadhaar') {
        setRegAadhaarDoc(dataUrl);
        setAadhaarFileName(file.name);
        setAadhaarFileType(file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        const errorMsg = data.message || 'Login failed. Please check credentials.';
        setAuthError(errorMsg);
        if (errorMsg.toLowerCase().includes('blocked') || errorMsg.toLowerCase().includes('admin')) {
          alert('🚫 ' + errorMsg);
        }
        return;
      }

      if (data.user.role === 'Delivery Partner') {
        if (data.user.status === 'DISABLED' || data.user.status === 'BLOCKED' || data.user.status === 'REJECTED') {
          const msg = 'You are blocked by the Admin. Please contact the Admin.';
          setAuthError(msg);
          alert('🚫 ' + msg);
          return;
        }

        setCurrentUser({
          id: data.user.id,
          name: data.user.name || 'Delivery Partner',
          email: data.user.email,
          role: 'Delivery Partner',
          vehicle: data.user.vehicle || '',
          vehicleNumber: data.user.vehicleNumber || '',
          drivingLicense: data.user.drivingLicense || '',
          aadhaar: data.user.aadhaar || '',
          phone: data.user.phone || '',
          address: data.user.address || '',
          status: data.user.status || 'APPROVED',
          totalEarnings: data.user.totalEarnings || 0,
          completedTrips: data.user.completedTrips || 0
        });
        setRiderTab('dashboard');
      } else {
        setCurrentUser({
          id: data.user.id,
          name: data.user.name || 'Vendor Partner',
          email: data.user.email,
          role: 'Vendor',
          nurseryName: data.user.nurseryName || `${data.user.name}'s Nursery Stall`,
          address: data.user.address || '',
          phone: data.user.phone || '',
          hours: data.user.hours || '7:00 AM - 7:30 PM'
        });
        setVendorTab('dashboard');
      }
      setShowAuthModal(false);
    } catch (err) {
      console.error(err);
      setAuthError('Server error logging in.');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword || !regAddress) {
      alert('Please fill out required fields: Name, Email, Password, Address.');
      return;
    }

    if (regRole === 'Delivery Partner') {
      const riderPayload = {
        name: regName,
        email: regEmail,
        password: regPassword,
        phone: regPhone,
        address: regAddress,
        vehicle: regVehicle || 'Hero Electric Scooter',
        vehicleNumber: regVehicleNum || 'KA-05-EQ-8821',
        drivingLicense: regDlNum,
        aadhaar: regAadhaarNum,
        dlDoc: regDlDoc,
        dlFileName: dlFileName || 'Driving_License.pdf',
        dlFileType: dlFileType || 'application/pdf',
        aadhaarDoc: regAadhaarDoc,
        aadhaarFileName: aadhaarFileName || 'Aadhaar_Card.pdf',
        aadhaarFileType: aadhaarFileType || 'application/pdf',
        status: 'PENDING_APPROVAL'
      };

      try {
        const res = await fetch(`${API_BASE}/riders/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(riderPayload)
        });
        const data = await res.json().catch(() => null);
        if (data && data.message && !data.success) {
          alert(data.message);
          return;
        }
      } catch (err) {
        console.warn('Server offline/large payload, saving rider registration locally:', err);
      }

      // Persist in local storage for Super Admin
      try {
        const existingLocal = JSON.parse(localStorage.getItem('planto_registered_riders') || '[]');
        existingLocal.unshift({ ...riderPayload, id: 'r_' + Date.now() });
        localStorage.setItem('planto_registered_riders', JSON.stringify(existingLocal));
      } catch (e) {}

      alert('🎉 Delivery Rider Registration Submitted!\n\nYour application along with Driving License & Aadhaar Card has been submitted to Super Admin for verification. Once approved, you will be able to log in to your Rider Console.');
      setShowAuthModal(false);
      setRegName('');
      setRegEmail('');
      setRegPassword('');
      setRegPhone('');
      setRegAddress('');
      setRegDlDoc('');
      setRegAadhaarDoc('');
    } else {
      const vendorPayload = {
        name: regName,
        email: regEmail,
        password: regPassword,
        phone: regPhone,
        address: regAddress,
        nurseryName: regDetail || `${regName}'s Nursery Stall`,
        hours: '7:00 AM - 7:30 PM'
      };

      try {
        await fetch(`${API_BASE}/vendors/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(vendorPayload)
        });
      } catch (err) {
        console.warn('Vendor register API call error:', err);
      }

      setCurrentUser({
        name: regName,
        email: regEmail,
        role: 'Vendor',
        phone: regPhone,
        address: regAddress,
        nurseryName: regDetail || `${regName}'s Nursery Stall`,
        hours: '7:00 AM - 7:30 PM'
      });
      setVendorTab('dashboard');
      setShowAuthModal(false);
      alert(`🎉 Welcome ${regName}! Your Nursery Stall '${regDetail || regName + "'s Nursery Stall"}' is registered and active!`);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setVendorTab('dashboard');
    setRiderTab('dashboard');
  };

  const handleMediaFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    files.forEach(file => {
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        alert(`File '${file.name}' is invalid. Only image and video files are allowed.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const isVideo = file.type.startsWith('video/');
        const mediaItem = {
          url: event.target.result,
          type: isVideo ? 'video' : 'image',
          name: file.name
        };
        setUploadedMedia(prev => [...prev, mediaItem]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveMedia = (indexToRemove) => {
    setUploadedMedia(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProdName.trim()) return;

    const mediaUrls = uploadedMedia.map(m => m.url || m);
    if (mediaUrlInput.trim()) {
      mediaUrls.push(mediaUrlInput.trim());
    }
    if (newProdImg && newProdImg.trim() && newProdImg !== DEFAULT_PLANT_IMG) {
      mediaUrls.unshift(newProdImg.trim());
    }

    const finalImages = mediaUrls.length > 0 ? mediaUrls : [newProdImg || DEFAULT_PLANT_IMG];

    const newProduct = {
      id: `p_${Date.now()}`,
      name: newProdName,
      type: newProdType,
      category: newProdCategory,
      price: parseFloat(newProdPrice),
      quantity: parseInt(newProdStock),
      vendorId: 'v1',
      vendorName: currentUser?.nurseryName || 'Sai Baba Plant & Pot Stall',
      images: finalImages,
      media: uploadedMedia.length > 0 ? uploadedMedia : [{ url: finalImages[0], type: 'image' }]
    };

    try {
      await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      });
    } catch (err) {
      console.error(err);
    }

    setVendorProducts([newProduct, ...vendorProducts]);
    setShowAddProductModal(false);
    setNewProdName('');
    setNewProdImg(DEFAULT_PLANT_IMG);
    setUploadedMedia([]);
    setMediaUrlInput('');
    alert(`🎉 '${newProdName}' successfully added to your Nursery inventory catalog!`);
  };

  const handleOpenEditProfile = () => {
    if (!currentUser) return;
    setEditProfileName(currentUser.name || '');
    setEditProfileEmail(currentUser.email || '');
    setEditProfilePhone(currentUser.phone || '');
    setEditProfileAddress(currentUser.address || '');
    setEditProfileDetail(currentUser.nurseryName || currentUser.vehicle || '');
    setEditProfileVehicleNum(currentUser.vehicleNumber || '');
    setShowEditProfileModal(true);
  };

  const handleSaveEditProfile = (e) => {
    e.preventDefault();
    if (currentUser.role === 'Vendor') {
      setCurrentUser({
        ...currentUser,
        name: editProfileName,
        email: editProfileEmail,
        phone: editProfilePhone,
        address: editProfileAddress,
        nurseryName: editProfileDetail
      });
    } else {
      setCurrentUser({
        ...currentUser,
        name: editProfileName,
        email: editProfileEmail,
        phone: editProfilePhone,
        address: editProfileAddress,
        vehicle: editProfileDetail,
        vehicleNumber: editProfileVehicleNum
      });
    }
    setShowEditProfileModal(false);
    alert('🎉 Profile details successfully updated!');
  };

  const handleUpdateOrderStatus = (orderId, newStatus) => {
    setVendorOrders(vendorOrders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
  };

  const handleCompleteRiderDelivery = (order) => {
    setDeliveryOrders(deliveryOrders.filter(o => o.id !== order.id));
    setPastDeliveries([
      { id: order.id, date: 'Today', vendor: order.vendorName || 'Sai Baba Plant Stall', customer: 'Indiranagar Customer', payout: 75, rating: '⭐ 5.0' },
      ...pastDeliveries
    ]);
    alert(`🎉 Order #${order.id} Doorstep Delivery Completed!\n\n₹75 Payout added to your Rider Wallet.`);
  };

  // --- 1. LANDING & LOGIN PAGE (NURSERY & RIDER PORTAL - CLIENT ORGANIC THEME) ---
  if (!currentUser) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8faf9', color: '#1b4332', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        
        {/* FULL HEADER BAR WITH NAVIGATION LINKS & SPACING */}
        <header style={{ position: 'sticky', top: 0, zIndex: 50, background: '#1b4332', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 48px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '36px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h1 style={{ fontSize: '26px', margin: 0, fontFamily: 'var(--font-serif)', color: '#ffffff', letterSpacing: '0.5px' }}>PLANTO Business</h1>
              <span style={{ background: '#ffb703', color: '#000000', fontSize: '10.5px', fontWeight: 800, padding: '3px 9px', borderRadius: '10px' }}>
                Partner Portal
              </span>
            </div>

            {/* Header Navigation Links with Distance */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: '26px', fontSize: '14px', fontWeight: 700 }}>
              <a href="#hero" style={{ color: '#ffffff', textDecoration: 'none' }}>Home</a>
              <a href="#features" style={{ color: '#d8f3dc', textDecoration: 'none' }}>Features & Benefits</a>
              <a href="#how-it-works" style={{ color: '#d8f3dc', textDecoration: 'none' }}>How It Works</a>
              <a href="#earnings" style={{ color: '#d8f3dc', textDecoration: 'none' }}>Earnings & Perks</a>
              <a href="#faq" style={{ color: '#d8f3dc', textDecoration: 'none' }}>FAQ</a>
            </nav>
          </div>

          <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
            <button 
              onClick={() => { setAuthMode('login'); setShowAuthModal(true); setAuthError(''); }}
              style={{ background: 'rgba(255,255,255,0.15)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.3)', padding: '10px 22px', borderRadius: '12px', fontWeight: 800, fontSize: '13.5px', cursor: 'pointer' }}
            >
              Login Partner
            </button>
            <button 
              onClick={() => { setAuthMode('register'); setShowAuthModal(true); setAuthError(''); }}
              style={{ background: '#ffb703', color: '#000000', border: 'none', padding: '10px 24px', borderRadius: '12px', fontWeight: 800, fontSize: '13.5px', cursor: 'pointer', boxShadow: '0 4px 14px rgba(255,183,3,0.3)' }}
            >
              Partner Sign Up →
            </button>
          </div>
        </header>

        {/* HERO BANNER SECTION (#hero) */}
        <section id="hero" style={{ padding: '80px 20px', background: 'linear-gradient(180deg, #f4f9f5 0%, #f8faf9 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ maxWidth: '900px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center' }}>
            
            <div style={{ background: '#e8f5e9', padding: '6px 20px', borderRadius: '20px', border: '1px solid #c8e6c9', fontSize: '13px', fontWeight: 800, color: '#1b4332' }}>
              Empowering 500+ Roadside Nurseries & Local Delivery Partners
            </div>

            <h2 style={{ fontSize: '50px', fontFamily: 'var(--font-serif)', lineHeight: 1.2, margin: 0, color: '#1b4332' }}>
              Grow Your Plant Business & Deliver Fresh Greenery Hyperlocal
            </h2>

            <p style={{ fontSize: '17px', color: '#2d6a4f', maxWidth: '720px', lineHeight: 1.6, margin: 0, fontWeight: 600 }}>
              Join PLANTO as a Nursery Stall Owner or Express Delivery Partner. Manage live orders, catalog inventory, track 30-minute doorstep deliveries, and enjoy zero-commission instant payouts.
            </p>

            <div style={{ display: 'flex', gap: '20px', marginTop: '12px' }}>
              <button 
                onClick={() => { setAuthMode('register'); setRegRole('Vendor'); setShowAuthModal(true); }}
                style={{ background: '#ffb703', color: '#000000', border: 'none', padding: '16px 36px', borderRadius: '16px', fontWeight: 800, fontSize: '16px', cursor: 'pointer', boxShadow: '0 6px 20px rgba(255,183,3,0.35)' }}
              >
                Register Nursery Stall
              </button>
              <button 
                onClick={() => { setAuthMode('register'); setRegRole('Delivery Partner'); setShowAuthModal(true); }}
                style={{ background: '#1b4332', color: '#ffffff', border: 'none', padding: '16px 36px', borderRadius: '16px', fontWeight: 800, fontSize: '16px', cursor: 'pointer', boxShadow: '0 6px 20px rgba(27,67,50,0.25)' }}
              >
                Join Delivery Fleet
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 2: FEATURES & BENEFITS (#features) */}
        <section id="features" style={{ padding: '80px 48px', background: '#ffffff', borderTop: '1px solid #e2e8f0' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#2d6a4f', textTransform: 'uppercase', letterSpacing: '1px' }}>Built For Local Growth</span>
              <h3 style={{ fontSize: '32px', fontFamily: 'var(--font-serif)', margin: '8px 0 0 0', color: '#1b4332' }}>
                Why Partner With PLANTO Marketplace?
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
              <div style={{ background: '#f8faf9', border: '1px solid #e2e8f0', padding: '28px', borderRadius: '20px' }}>
                <h4 style={{ fontSize: '18px', margin: '0 0 10px 0', color: '#1b4332', fontFamily: 'var(--font-serif)' }}>30-Min Express Delivery</h4>
                <p style={{ fontSize: '13.5px', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
                  Hyperlocal delivery network connects roadside stalls directly with plant lovers within a 5km radius.
                </p>
              </div>

              <div style={{ background: '#f8faf9', border: '1px solid #e2e8f0', padding: '28px', borderRadius: '20px' }}>
                <h4 style={{ fontSize: '18px', margin: '0 0 10px 0', color: '#1b4332', fontFamily: 'var(--font-serif)' }}>8.0% Low Commission</h4>
                <p style={{ fontSize: '13.5px', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
                  Nursery sellers keep 92% of order revenue. Zero listing fees, zero setup costs, zero hidden charges.
                </p>
              </div>

              <div style={{ background: '#f8faf9', border: '1px solid #e2e8f0', padding: '28px', borderRadius: '20px' }}>
                <h4 style={{ fontSize: '18px', margin: '0 0 10px 0', color: '#1b4332', fontFamily: 'var(--font-serif)' }}>Hydration Badging</h4>
                <p style={{ fontSize: '13.5px', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
                  Moisture wrap packaging badges protect plants during transit and earn +₹10 rider bonus per trip.
                </p>
              </div>

              <div style={{ background: '#f8faf9', border: '1px solid #e2e8f0', padding: '28px', borderRadius: '20px' }}>
                <h4 style={{ fontSize: '18px', margin: '0 0 10px 0', color: '#1b4332', fontFamily: 'var(--font-serif)' }}>Instant UPI Payouts</h4>
                <p style={{ fontSize: '13.5px', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
                  Delivery riders & nursery owners can withdraw unsettled wallet balances directly to GPay / UPI 24/7.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: HOW IT WORKS (#how-it-works) */}
        <section id="how-it-works" style={{ padding: '80px 48px', background: '#f4f9f5', borderTop: '1px solid #e2e8f0' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#2d6a4f', textTransform: 'uppercase', letterSpacing: '1px' }}>Seamless Operations</span>
              <h3 style={{ fontSize: '32px', fontFamily: 'var(--font-serif)', margin: '8px 0 0 0', color: '#1b4332' }}>
                How PLANTO Hyperlocal Fulfillment Works
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '24px', borderRadius: '20px', textAlign: 'center' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#ffb703', color: '#000000', fontWeight: 900, fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>1</div>
                <h4 style={{ fontSize: '17px', margin: '0 0 8px 0', color: '#1b4332' }}>Customer Places Order</h4>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                  Customer chooses fresh plants, pots, or soil from nearest nursery stall on PLANTO app.
                </p>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '24px', borderRadius: '20px', textAlign: 'center' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#ffb703', color: '#000000', fontWeight: 900, fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>2</div>
                <h4 style={{ fontSize: '17px', margin: '0 0 8px 0', color: '#1b4332' }}>Nursery Packs & Badges</h4>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                  Nursery owner receives instant soundbox notification and prepares moisture wrap hydration box.
                </p>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '24px', borderRadius: '20px', textAlign: 'center' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#ffb703', color: '#000000', fontWeight: 900, fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>3</div>
                <h4 style={{ fontSize: '17px', margin: '0 0 8px 0', color: '#1b4332' }}>Rider Doorstep Delivery</h4>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                  Rider accepts express pickup, completes doorstep delivery in 30 mins, and gets instant trip payout.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: EARNINGS & PERKS (#earnings) */}
        <section id="earnings" style={{ padding: '80px 48px', background: '#ffffff', borderTop: '1px solid #e2e8f0' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#2d6a4f', textTransform: 'uppercase', letterSpacing: '1px' }}>Transparent Earnings</span>
              <h3 style={{ fontSize: '32px', fontFamily: 'var(--font-serif)', margin: '8px 0 0 0', color: '#1b4332' }}>
                High Growth & Flexible Partner Benefits
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px' }}>
              <div style={{ background: '#f8faf9', border: '1px solid #e2e8f0', padding: '32px', borderRadius: '24px' }}>
                <span style={{ background: '#e8f5e9', color: '#1b4332', fontSize: '11px', fontWeight: 800, padding: '4px 12px', borderRadius: '10px' }}>NURSERY OWNER PERKS</span>
                <h4 style={{ fontSize: '22px', fontFamily: 'var(--font-serif)', margin: '14px 0 10px 0', color: '#1b4332' }}>Expand Beyond Roadside Footfall</h4>
                <ul style={{ fontSize: '14px', color: '#334155', paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', lineHeight: 1.6 }}>
                  <li>List plants, pots, fertilizers, seeds & bouquets online</li>
                  <li>Automated order stream directly on phone & soundbox</li>
                  <li>Receive 92% net sales revenue deposited to bank</li>
                  <li>Free digital storefront listing with 0 setup cost</li>
                </ul>
              </div>

              <div style={{ background: '#f8faf9', border: '1px solid #e2e8f0', padding: '32px', borderRadius: '24px' }}>
                <span style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '11px', fontWeight: 800, padding: '4px 12px', borderRadius: '10px' }}>DELIVERY RIDER PERKS</span>
                <h4 style={{ fontSize: '22px', fontFamily: 'var(--font-serif)', margin: '14px 0 10px 0', color: '#1b4332' }}>Earn ₹55 + Bonus Per Trip</h4>
                <ul style={{ fontSize: '14px', color: '#334155', paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', lineHeight: 1.6 }}>
                  <li>Flexible duty status (work online/offline anytime)</li>
                  <li>Earn ₹55 base pay + ₹10 plant care hydration bonus</li>
                  <li>Hyperlocal 3-5 km short delivery radiuses</li>
                  <li>Instant 24/7 wallet withdrawal directly to UPI</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5: FAQ (#faq) */}
        <section id="faq" style={{ padding: '80px 48px', background: '#f4f9f5', borderTop: '1px solid #e2e8f0' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <h3 style={{ fontSize: '30px', fontFamily: 'var(--font-serif)', margin: 0, color: '#1b4332' }}>
                Frequently Asked Questions
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '20px 24px', borderRadius: '16px' }}>
                <strong style={{ fontSize: '15px', color: '#1b4332', display: 'block', marginBottom: '6px' }}>Q: Do I need a physical shop to register as a Nursery Partner?</strong>
                <p style={{ fontSize: '13.5px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                  No! Roadside stalls, plant nurseries, rooftop plant sellers, and home plant growers are all eligible to sell on PLANTO.
                </p>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '20px 24px', borderRadius: '16px' }}>
                <strong style={{ fontSize: '15px', color: '#1b4332', display: 'block', marginBottom: '6px' }}>Q: What documents are required for Delivery Partner registration?</strong>
                <p style={{ fontSize: '13.5px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                  You need a valid Driving License, Aadhaar Card document (PDF or Image format), and a valid vehicle registration number.
                </p>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '20px 24px', borderRadius: '16px' }}>
                <strong style={{ fontSize: '15px', color: '#1b4332', display: 'block', marginBottom: '6px' }}>Q: How quickly do I get paid for completed orders?</strong>
                <p style={{ fontSize: '13.5px', color: '#d97706', margin: 0, lineHeight: 1.5 }}>
                  Payouts are updated in real-time in your Partner Wallet and can be withdrawn instantly to your bank account or UPI ID.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{ padding: '32px 48px', background: '#1b4332', color: '#ffffff', textAlign: 'center', fontSize: '13px' }}>
          <div>© 2026 PLANTO Business Portal. All Rights Reserved. Empowering India's Greenery Ecosystem.</div>
        </footer>

        {/* AUTH POPUP MODAL */}
        {showAuthModal && (
          <div className="modal-backdrop-animated" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div className="card modal-content-animated" style={{ maxWidth: authMode === 'register' && regRole === 'Delivery Partner' ? '650px' : '480px', width: '100%', padding: '32px', borderRadius: '24px', background: '#fff', color: '#1b4332', boxShadow: '0 25px 60px rgba(0,0,0,0.3)', maxHeight: '90vh', overflowY: 'auto' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '22px', fontFamily: 'var(--font-serif)', margin: 0, color: '#1b4332' }}>
                  {authMode === 'login' ? 'Partner Account Login' : `Register as ${regRole}`}
                </h3>
                <button onClick={() => setShowAuthModal(false)} style={{ border: 'none', background: '#f1f5f9', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontSize: '16px', fontWeight: 800 }}>✕</button>
              </div>

              {authError && (
                <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: '12px', fontSize: '12.5px', marginBottom: '16px', fontWeight: 700 }}>
                  {authError}
                </div>
              )}

              {/* LOGIN FORM */}
              {authMode === 'login' ? (
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, marginBottom: '6px', display: 'block', color: '#334155' }}>Email Address</label>
                    <input type="email" placeholder="vendor@planto.in" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13.5px' }} />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, marginBottom: '6px', display: 'block', color: '#334155' }}>Password</label>
                    <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13.5px' }} />
                  </div>

                  <div style={{ display: 'flex', gap: '10px', background: '#f8faf9', padding: '10px 12px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '11px' }}>
                    <button type="button" onClick={() => { setLoginEmail('vendor@planto.in'); setLoginPassword('planto123'); }} style={{ flex: 1, background: '#e8f5e9', color: '#1b4332', border: 'none', padding: '6px', borderRadius: '6px', fontWeight: 800, cursor: 'pointer' }}>
                      Demo Nursery Owner
                    </button>
                    <button type="button" onClick={() => { setLoginEmail('delivery@planto.in'); setLoginPassword('delivery123'); }} style={{ flex: 1, background: '#e0f2fe', color: '#0369a1', border: 'none', padding: '6px', borderRadius: '6px', fontWeight: 800, cursor: 'pointer' }}>
                      Demo Delivery Rider
                    </button>
                  </div>

                  <button type="submit" style={{ justifyContent: 'center', height: '46px', fontSize: '14.5px', fontWeight: 800, background: '#1b4332', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', marginTop: '6px', boxShadow: '0 4px 14px rgba(27,67,50,0.2)' }}>
                    Login to Partner Dashboard →
                  </button>

                  <div style={{ textAlign: 'center', marginTop: '8px', fontSize: '12.5px', color: '#64748b' }}>
                    Don't have an account yet?{' '}
                    <span onClick={() => { setAuthMode('register'); setAuthError(''); }} style={{ color: '#2d6a4f', fontWeight: 800, cursor: 'pointer', textDecoration: 'underline' }}>
                      Sign Up Now
                    </span>
                  </div>
                </form>
              ) : (
                /* REGISTRATION FORM */
                <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  
                  {/* Role Selector Tabs */}
                  <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '12px', gap: '4px' }}>
                    <button 
                      type="button" 
                      onClick={() => setRegRole('Vendor')}
                      style={{ flex: 1, padding: '9px', borderRadius: '8px', border: 'none', background: regRole === 'Vendor' ? '#1b4332' : 'transparent', color: regRole === 'Vendor' ? '#fff' : '#64748b', fontWeight: 800, fontSize: '12.5px', cursor: 'pointer' }}
                    >
                      Nursery Stall Owner
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setRegRole('Delivery Partner')}
                      style={{ flex: 1, padding: '9px', borderRadius: '8px', border: 'none', background: regRole === 'Delivery Partner' ? '#1b4332' : 'transparent', color: regRole === 'Delivery Partner' ? '#fff' : '#64748b', fontWeight: 800, fontSize: '12.5px', cursor: 'pointer' }}
                    >
                      Delivery Fleet Partner
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Full Name</label>
                      <input type="text" placeholder="e.g. Suresh Rao" value={regName} onChange={(e) => setRegName(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '13px' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Email Address</label>
                      <input type="email" placeholder="owner@nursery.com" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '13px' }} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Create Password</label>
                      <input type="password" placeholder="Min 6 characters" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '13px' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Phone Number</label>
                      <input type="tel" placeholder="+91 98480 22334" value={regPhone} onChange={(e) => setRegPhone(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '13px' }} />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Location Address (Street, Area, City)</label>
                    <input type="text" placeholder="e.g. #124, 100ft Road, Indiranagar, Bengaluru" value={regAddress} onChange={(e) => setRegAddress(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '13px' }} />
                  </div>

                  {regRole === 'Vendor' ? (
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Nursery Stall Name</label>
                      <input type="text" placeholder="e.g. Sai Baba Plant & Pot Stall" value={regDetail} onChange={(e) => setRegDetail(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '13px' }} />
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', background: '#f8faf9', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#1b4332', letterSpacing: '0.2px' }}>
                        Delivery Fleet Verification Documents
                      </span>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div>
                          <label style={{ fontSize: '11.5px', fontWeight: 700, marginBottom: '4px', display: 'block', color: '#334155' }}>Vehicle Model / Type</label>
                          <input type="text" placeholder="e.g. Hero Electric" value={regVehicle} onChange={(e) => setRegVehicle(e.target.value)} required style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '11.5px', fontWeight: 700, marginBottom: '4px', display: 'block', color: '#334155' }}>Vehicle Reg Number</label>
                          <input type="text" placeholder="e.g. KA-05-EQ-8821" value={regVehicleNum} onChange={(e) => setRegVehicleNum(e.target.value)} required style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px' }} />
                        </div>
                      </div>

                      {/* Driving License Input & File Upload */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div>
                          <label style={{ fontSize: '11.5px', fontWeight: 700, marginBottom: '4px', display: 'block', color: '#334155' }}>Driving License Number</label>
                          <input type="text" placeholder="KA-01-2024-00129" value={regDlNum} onChange={(e) => setRegDlNum(e.target.value)} required style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px' }} />
                        </div>

                        <div>
                          <label style={{ fontSize: '11px', fontWeight: 700, marginBottom: '4px', display: 'block', color: '#64748b' }}>Driving License File (PDF or Image)</label>
                          {regDlDoc ? (
                            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '10px 14px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                                {dlFileType?.includes('pdf') || dlFileName?.endsWith('.pdf') ? (
                                  <div style={{ background: '#ef4444', color: '#fff', fontSize: '11px', fontWeight: 800, padding: '6px 8px', borderRadius: '6px' }}>PDF</div>
                                ) : (
                                  <img src={regDlDoc} alt="DL Preview" style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover' }} />
                                )}
                                <div style={{ overflow: 'hidden' }}>
                                  <strong style={{ fontSize: '12px', color: '#166534', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{dlFileName || 'Driving_License_Document'}</strong>
                                  <span style={{ fontSize: '10.5px', color: '#15803d', fontWeight: 600 }}>File Uploaded Ready for Inspection</span>
                                </div>
                              </div>
                              <button type="button" onClick={() => { setRegDlDoc(''); setDlFileName(''); setDlFileType(''); }} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '5px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 800, cursor: 'pointer' }}>
                                Remove
                              </button>
                            </div>
                          ) : (
                            <label className="dropzone-box" style={{ display: 'block' }}>
                              <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileUpload(e, 'dl')} style={{ display: 'none' }} />
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                <span style={{ fontSize: '12px', fontWeight: 800, color: '#1b4332' }}>Choose File or Drag & Drop</span>
                                <span style={{ fontSize: '10.5px', color: '#64748b' }}>Supports PDF, JPG, PNG & WEBP (Max 10MB)</span>
                              </div>
                            </label>
                          )}
                        </div>
                      </div>

                      {/* Aadhaar Card Input & File Upload */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div>
                          <label style={{ fontSize: '11.5px', fontWeight: 700, marginBottom: '4px', display: 'block', color: '#334155' }}>Aadhaar Card Number</label>
                          <input type="text" placeholder="4812-9901-3412" value={regAadhaarNum} onChange={(e) => setRegAadhaarNum(e.target.value)} required style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px' }} />
                        </div>

                        <div>
                          <label style={{ fontSize: '11px', fontWeight: 700, marginBottom: '4px', display: 'block', color: '#64748b' }}>Aadhaar Card File (PDF or Image)</label>
                          {regAadhaarDoc ? (
                            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '10px 14px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                                {aadhaarFileType?.includes('pdf') || aadhaarFileName?.endsWith('.pdf') ? (
                                  <div style={{ background: '#ef4444', color: '#fff', fontSize: '11px', fontWeight: 800, padding: '6px 8px', borderRadius: '6px' }}>PDF</div>
                                ) : (
                                  <img src={regAadhaarDoc} alt="Aadhaar Preview" style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover' }} />
                                )}
                                <div style={{ overflow: 'hidden' }}>
                                  <strong style={{ fontSize: '12px', color: '#166534', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{aadhaarFileName || 'Aadhaar_Card_Document'}</strong>
                                  <span style={{ fontSize: '10.5px', color: '#15803d', fontWeight: 600 }}>File Uploaded Ready for Inspection</span>
                                </div>
                              </div>
                              <button type="button" onClick={() => { setRegAadhaarDoc(''); setAadhaarFileName(''); setAadhaarFileType(''); }} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '5px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 800, cursor: 'pointer' }}>
                                Remove
                              </button>
                            </div>
                          ) : (
                            <label className="dropzone-box" style={{ display: 'block' }}>
                              <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileUpload(e, 'aadhaar')} style={{ display: 'none' }} />
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                <span style={{ fontSize: '12px', fontWeight: 800, color: '#1b4332' }}>Choose File or Drag & Drop</span>
                                <span style={{ fontSize: '10.5px', color: '#64748b' }}>Supports PDF, JPG, PNG & WEBP (Max 10MB)</span>
                              </div>
                            </label>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <button type="submit" style={{ justifyContent: 'center', height: '46px', fontSize: '14.5px', fontWeight: 800, background: '#ffb703', color: '#000', border: 'none', borderRadius: '12px', cursor: 'pointer', marginTop: '6px', boxShadow: '0 4px 14px rgba(255,183,3,0.3)' }}>
                    Complete Registration →
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

      </div>
    );
  }

  // --- 2. NURSERY OWNER CLEAN SIDEBAR DASHBOARD ---
  if (currentUser.role === 'Vendor') {
    const totalSalesRevenue = vendorOrders.reduce((sum, o) => sum + (o.total || 0), 0) + 5030;

    const vendorSidebarItems = [
      { id: 'dashboard', label: 'Dashboard' },
      { id: 'inventory', label: 'My Plant Inventory' },
      { id: 'orders', label: 'Orders' },
      { id: 'revenue', label: 'Revenue' },
      { id: 'status', label: `Store Status (${storeOpen ? 'Open' : 'Closed'})` },
      { id: 'profile', label: 'Profile' }
    ];

    return (
      <div style={{ minHeight: '100vh', display: 'flex', background: '#f8faf9' }}>
        
        {/* LEFT SIDEBAR CONTAINER */}
        <aside style={{
          width: sidebarOpen ? '260px' : '76px',
          height: '100vh',
          position: 'sticky',
          top: 0,
          background: '#0a231b',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.25s ease',
          zIndex: 100,
          boxShadow: '4px 0 20px rgba(0,0,0,0.1)'
        }}>
          {/* Header */}
          <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            {sidebarOpen ? (
              <div>
                <h3 style={{ fontSize: '17px', margin: 0, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-serif)', letterSpacing: '0.5px' }}>PLANTO Nursery</h3>
                <span style={{ fontSize: '11px', color: '#a7f3d0', fontWeight: 700 }}>Partner Console</span>
              </div>
            ) : (
              <span style={{ fontSize: '18px', color: '#fff', fontWeight: 800, margin: '0 auto' }}>PN</span>
            )}

            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', width: '28px', height: '28px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="Toggle Sidebar"
            >
              {sidebarOpen ? '◀' : '▶'}
            </button>
          </div>

          {/* Navigation Menu */}
          <nav style={{ padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, overflowY: 'auto' }}>
            {vendorSidebarItems.map(item => {
              const active = vendorTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'status') {
                      setStoreOpen(!storeOpen);
                    } else {
                      setVendorTab(item.id);
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'space-between',
                    padding: '14px 18px',
                    borderRadius: '12px',
                    border: 'none',
                    background: active ? '#2d6a4f' : 'transparent',
                    color: '#fff',
                    fontWeight: active ? 800 : 600,
                    fontSize: '14px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s ease',
                    boxShadow: active ? '0 4px 12px rgba(0,0,0,0.2)' : 'none'
                  }}
                  onMouseOver={(e) => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                  onMouseOut={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                >
                  {sidebarOpen && (
                    <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.label}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* SIDEBAR FOOTER */}
          <div style={{ padding: '18px 14px', borderTop: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', marginTop: 'auto', flexShrink: 0 }}>
            {sidebarOpen ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#2d6a4f', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '16px', flexShrink: 0 }}>
                    {currentUser.name.charAt(0)}
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#fff', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {currentUser.nurseryName || currentUser.name}
                    </div>
                    <div style={{ fontSize: '11px', color: '#a7f3d0' }}>
                      {currentUser.name} (Owner)
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleLogout}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '9px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  Logout Account
                </button>
              </div>
            ) : (
              <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '12px', fontWeight: 800, cursor: 'pointer', display: 'block', margin: '0 auto' }}>
                Exit
              </button>
            )}
          </div>
        </aside>

        {/* NURSERY MAIN CONTENT */}
        <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
            <div>
              <h1 style={{ fontSize: '24px', fontFamily: 'var(--font-serif)', margin: 0, color: 'var(--primary-dark)' }}>
                {vendorSidebarItems.find(i => i.id === vendorTab)?.label}
              </h1>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px', margin: 0 }}>
                {currentUser.nurseryName || 'Sai Baba Plant & Pot Stall'} • Live Operations Console
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {(vendorTab === 'inventory' || vendorTab === 'dashboard') && (
                <button 
                  onClick={() => setShowAddProductModal(true)}
                  style={{ background: '#1b4332', color: '#ffffff', border: 'none', padding: '12px 22px', borderRadius: '12px', fontSize: '13.5px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(27,67,50,0.25)' }}
                >
                  + Add New Plant / Pot Item
                </button>
              )}
            </div>
          </div>

          {/* TAB 0: OVERALL DASHBOARD */}
          {vendorTab === 'dashboard' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                <div className="card" style={{ borderLeft: '5px solid #2d6a4f' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 800 }}>TOTAL REVENUE</span>
                  <h3 style={{ fontSize: '28px', color: '#2d6a4f', marginTop: '4px', margin: 0, fontFamily: 'var(--font-serif)' }}>₹{totalSalesRevenue.toLocaleString()}</h3>
                  <span style={{ fontSize: '11px', color: '#2e7d32', marginTop: '6px', display: 'block', fontWeight: 700 }}>↑ 18% vs last week</span>
                </div>
                <div className="card" style={{ borderLeft: '5px solid #0284c7' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 800 }}>LIVE CUSTOMER ORDERS</span>
                  <h3 style={{ fontSize: '28px', color: '#0284c7', marginTop: '4px', margin: 0, fontFamily: 'var(--font-serif)' }}>{vendorOrders.length} Pending</h3>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px', display: 'block' }}>Ready for hydration packing</span>
                </div>
                <div className="card" style={{ borderLeft: '5px solid #2563eb' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 800 }}>PLANTS & POTS LISTED</span>
                  <h3 style={{ fontSize: '28px', color: '#2563eb', marginTop: '4px', margin: 0, fontFamily: 'var(--font-serif)' }}>{vendorProducts.length} Items</h3>
                  <span style={{ fontSize: '11px', color: '#2563eb', marginTop: '6px', display: 'block', fontWeight: 700 }}>Live in customer store</span>
                </div>
                <div className="card" style={{ borderLeft: '5px solid #ffb703' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 800 }}>NURSERY RATING</span>
                  <h3 style={{ fontSize: '28px', color: '#d97706', marginTop: '4px', margin: 0, fontFamily: 'var(--font-serif)' }}>⭐ 4.8 / 5.0</h3>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px', display: 'block' }}>Based on 42 customer reviews</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '16px', fontFamily: 'var(--font-serif)', margin: 0 }}>Weekly Revenue & Sales Trend</h3>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>August 2026</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', height: '140px', paddingTop: '20px', borderBottom: '1px solid var(--border-color)' }}>
                    {[
                      { day: 'Mon', val: 650, h: '40%' },
                      { day: 'Tue', val: 890, h: '55%' },
                      { day: 'Wed', val: 1200, h: '75%' },
                      { day: 'Thu', val: 950, h: '60%' },
                      { day: 'Fri', val: 1450, h: '90%' },
                      { day: 'Sat', val: 1800, h: '100%' },
                      { day: 'Sun', val: 1100, h: '70%' }
                    ].map((bar, i) => (
                      <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>₹{bar.val}</span>
                        <div style={{ width: '100%', height: bar.h, background: i === 5 ? 'var(--primary)' : '#c8e6c9', borderRadius: '6px 6px 0 0' }}></div>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{bar.day}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontFamily: 'var(--font-serif)', margin: '0 0 14px 0' }}>Quick Operations</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <button 
                        onClick={() => setShowAddProductModal(true)}
                        style={{ background: '#ffb703', color: '#000', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 800, fontSize: '13px', cursor: 'pointer', textAlign: 'center' }}
                      >
                        + Add Plant or Pot Item
                      </button>
                      <button className="btn btn-secondary" style={{ justifyContent: 'center' }} onClick={() => setVendorTab('orders')}>
                        Check Live Customer Orders ({vendorOrders.length})
                      </button>
                      <button className="btn btn-secondary" style={{ justifyContent: 'center' }} onClick={() => setVendorTab('revenue')}>
                        Withdraw Bank Payout
                      </button>
                    </div>
                  </div>

                  <div style={{ background: '#e8f5e9', padding: '12px', borderRadius: '12px', fontSize: '11px', color: '#2e7d32', marginTop: '16px' }}>
                    <strong>Pro Tip for Nursery Owners:</strong>
                    <p style={{ margin: '4px 0 0 0' }}>Items with hydration packaging badges get 40% higher customer repeat orders!</p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '16px', fontFamily: 'var(--font-serif)', margin: 0 }}>Recent Orders Stream</h3>
                  <span onClick={() => setVendorTab('orders')} style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 800, cursor: 'pointer' }}>View All Orders →</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {vendorOrders.map((ord) => (
                    <div key={ord.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <div>
                        <strong style={{ fontSize: '14px' }}>Order #{ord.id}</strong>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{ord.date} • Total ₹{ord.total}</div>
                      </div>

                      <span style={{ background: '#e8f5e9', color: '#2e7d32', padding: '4px 10px', borderRadius: '12px', fontWeight: 800, fontSize: '12px' }}>
                        {ord.status}
                      </span>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          )}

          {/* TAB 1: INVENTORY TABLE */}
          {vendorTab === 'inventory' && (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead style={{ background: '#f8faf9', borderBottom: '1px solid var(--border-color)', fontWeight: 800 }}>
                  <tr>
                    <th style={{ padding: '14px 20px' }}>Item Photo & Name</th>
                    <th style={{ padding: '14px 20px' }}>Category</th>
                    <th style={{ padding: '14px 20px' }}>Price</th>
                    <th style={{ padding: '14px 20px' }}>Stock</th>
                    <th style={{ padding: '14px 20px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vendorProducts.map((prod) => (
                    <tr key={prod.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <img 
                          src={getImageSrc(prod)} 
                          alt={prod.name} 
                          style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover', background: '#f0f0f0' }} 
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = DEFAULT_PLANT_IMG;
                          }}
                        />
                        <span style={{ fontWeight: 800, color: 'var(--text-dark)' }}>{prod.name}</span>
                      </td>
                      <td style={{ padding: '12px 20px', color: 'var(--text-muted)' }}>{prod.category}</td>
                      <td style={{ padding: '12px 20px', fontWeight: 800, color: 'var(--primary)' }}>₹{prod.price}</td>
                      <td style={{ padding: '12px 20px' }}>
                        <span style={{ background: prod.quantity > 0 ? '#e8f5e9' : '#ffebee', color: prod.quantity > 0 ? '#2e7d32' : '#c62828', padding: '4px 10px', borderRadius: '12px', fontWeight: 800, fontSize: '12px' }}>
                          {prod.quantity > 0 ? `${prod.quantity} Available` : 'Out of Stock'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {/* Preview Button */}
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setPreviewProduct(prod);
                            }}
                            title="Preview Submitted Product Details"
                            style={{ width: '34px', height: '34px', borderRadius: '10px', background: '#e8f5e9', border: '1px solid #c8e6c9', color: '#1b4332', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease' }}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                              <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                          </button>

                          {/* Edit Button */}
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleOpenEditProduct(prod);
                            }}
                            title="Edit Product Details & Stock"
                            style={{ width: '34px', height: '34px', borderRadius: '10px', background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease' }}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                          </button>

                          {/* Delete Symbol Button */}
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDeleteProduct(prod.id);
                            }}
                            title="Delete Product Item"
                            style={{ width: '34px', height: '34px', borderRadius: '10px', background: '#fee2e2', border: '1px solid #fca5a5', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease' }}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              <line x1="10" y1="11" x2="10" y2="17"></line>
                              <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 2: LIVE ORDERS */}
          {vendorTab === 'orders' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {vendorOrders.map((ord) => (
                <div key={ord.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontWeight: 800, fontSize: '16px' }}>Order #{ord.id}</span>
                      <span style={{ background: '#ffb703', color: '#000', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 800 }}>⚡ 30-MIN EXPRESS</span>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Customer Order • Date: {ord.date} • Total: <strong style={{ color: 'var(--primary)' }}>₹{ord.total}</strong>
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontWeight: 800, fontSize: '13px', color: '#2e7d32' }}>Status: {ord.status}</span>
                    <button 
                      className="btn" 
                      style={{ fontSize: '12px', padding: '8px 14px' }}
                      onClick={() => handleUpdateOrderStatus(ord.id, 'Hydration Pack Prepared 🪴')}
                    >
                      Pack Plant with Moisture Wrap
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: REVENUE & PAYOUTS */}
          {vendorTab === 'revenue' && (
            <div>
              <div className="card" style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '20px', fontFamily: 'var(--font-serif)', marginBottom: '12px' }}>Wallet Balance & Payout Settings</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8faf9', padding: '20px', borderRadius: '16px' }}>
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700 }}>AVAILABLE FOR PAYOUT</span>
                    <h2 style={{ fontSize: '32px', color: '#2e7d32', margin: '4px 0 0 0' }}>₹{totalSalesRevenue.toLocaleString()}</h2>
                  </div>
                  <button className="btn btn-accent" style={{ color: '#000', padding: '12px 24px', fontWeight: 800 }} onClick={() => alert("🎉 Payout request of ₹" + totalSalesRevenue + " submitted to your bank account!")}>
                    Withdraw Payout to Bank →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: NURSERY STORE PROFILE */}
          {vendorTab === 'profile' && (
            <div className="card" style={{ maxWidth: '750px', padding: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '22px', fontFamily: 'var(--font-serif)', margin: 0, color: '#1b4332' }}>
                    Nursery Store Profile & Settings
                  </h3>
                  <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', margin: 0 }}>
                    Registered owner details, location address, and operating info
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button 
                    onClick={handleOpenEditProfile}
                    style={{ background: '#1b4332', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '10px', fontSize: '12.5px', fontWeight: 800, cursor: 'pointer' }}
                  >
                    Edit Profile Details
                  </button>
                  <span style={{ background: '#e8f5e9', color: '#1b4332', border: '1px solid #c8e6c9', padding: '6px 14px', borderRadius: '12px', fontSize: '12px', fontWeight: 800 }}>
                    ACTIVE SELLER
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', fontSize: '13.5px' }}>
                <div style={{ background: '#f8faf9', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Nursery Stall Name</span>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#1b4332', marginTop: '4px' }}>
                    {currentUser.nurseryName || 'Sai Baba Plant & Pot Stall'}
                  </div>
                </div>

                <div style={{ background: '#f8faf9', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Owner Name</span>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#1b4332', marginTop: '4px' }}>
                    {currentUser.name}
                  </div>
                </div>

                <div style={{ background: '#f8faf9', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Email Address (Login ID)</span>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#334155', marginTop: '4px' }}>
                    {currentUser.email}
                  </div>
                </div>

                <div style={{ background: '#f8faf9', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Phone Contact</span>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#334155', marginTop: '4px' }}>
                    {currentUser.phone || '+91 98480 22334'}
                  </div>
                </div>

                <div style={{ gridColumn: 'span 2', background: '#f8faf9', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Stall Location Address</span>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#334155', marginTop: '4px' }}>
                    {currentUser.address || 'Opposite Metro Station Pillar 124, Indiranagar, Bengaluru'}
                  </div>
                </div>

                <div style={{ background: '#f8faf9', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Operating Hours</span>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#334155', marginTop: '4px' }}>
                    {currentUser.hours || '7:00 AM - 7:30 PM'}
                  </div>
                </div>

                <div style={{ background: '#f8faf9', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Marketplace SLA</span>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#2e7d32', marginTop: '4px' }}>
                    8.0% Low Commission (92% Payout)
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>

        {/* EDIT PROFILE MODAL */}
        {showEditProfileModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(27,67,50,0.7)', backdropFilter: 'blur(4px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '24px', maxWidth: '520px', width: '92vw', maxHeight: '90vh', overflowY: 'auto', padding: '28px', color: '#1b4332', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px' }}>
                <h3 style={{ fontSize: '18px', fontFamily: 'var(--font-serif)', margin: 0, color: '#1b4332' }}>
                  Edit Account Profile Details
                </h3>
                <button onClick={() => setShowEditProfileModal(false)} style={{ background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontSize: '16px', fontWeight: 800 }}>✕</button>
              </div>

              <form onSubmit={handleSaveEditProfile} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Full Name</label>
                    <input type="text" value={editProfileName} onChange={(e) => setEditProfileName(e.target.value)} required style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Email Address</label>
                    <input type="email" value={editProfileEmail} onChange={(e) => setEditProfileEmail(e.target.value)} required style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Phone Contact</label>
                    <input type="text" value={editProfilePhone} onChange={(e) => setEditProfilePhone(e.target.value)} required style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, marginBottom: '4px', display: 'block' }}>
                      {currentUser.role === 'Vendor' ? 'Nursery Stall Name' : 'Vehicle Model'}
                    </label>
                    <input type="text" value={editProfileDetail} onChange={(e) => setEditProfileDetail(e.target.value)} required style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Location Address</label>
                  <input type="text" value={editProfileAddress} onChange={(e) => setEditProfileAddress(e.target.value)} required style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                  <button type="button" onClick={() => setShowEditProfileModal(false)} style={{ background: '#f1f5f9', color: '#64748b', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: 800, fontSize: '12px', cursor: 'pointer' }}>
                    Cancel
                  </button>
                  <button type="submit" style={{ background: '#1b4332', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: 800, fontSize: '12px', cursor: 'pointer' }}>
                    Save Profile Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ADD PRODUCT TO NURSERY CATALOG MODAL */}
        {showAddProductModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(27,67,50,0.7)', backdropFilter: 'blur(4px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '24px', maxWidth: '520px', width: '92vw', maxHeight: '90vh', overflowY: 'auto', padding: '28px', color: '#1b4332', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px' }}>
                <div>
                  <h3 style={{ fontSize: '20px', fontFamily: 'var(--font-serif)', margin: 0, color: '#1b4332' }}>
                    Add Plant or Pot Item
                  </h3>
                  <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px', margin: 0 }}>
                    Publish items to your live Nursery catalog for customer orders
                  </p>
                </div>
                <button onClick={() => setShowAddProductModal(false)} style={{ background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontSize: '16px', fontWeight: 800 }}>✕</button>
              </div>

              <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Product Title</label>
                  <input 
                    type="text" 
                    value={newProdName} 
                    onChange={(e) => setNewProdName(e.target.value)} 
                    placeholder="e.g. Premium Monstera Deliciosa"
                    required 
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Category</label>
                    <select 
                      value={newProdCategory} 
                      onChange={(e) => setNewProdCategory(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    >
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Selling Price (₹)</label>
                    <input 
                      type="number" 
                      value={newProdPrice} 
                      onChange={(e) => setNewProdPrice(e.target.value)} 
                      required 
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Item Type</label>
                    <select 
                      value={newProdType} 
                      onChange={(e) => setNewProdType(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    >
                      {itemTypes.map(it => (
                        <option key={it.id} value={it.name}>{it.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Stock Quantity</label>
                    <input 
                      type="number" 
                      value={newProdStock} 
                      onChange={(e) => setNewProdStock(e.target.value)} 
                      required 
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '12.5px', color: '#1b4332', fontWeight: 800 }}>
                      Product Media (Upload Multiple Images & Videos)
                    </label>
                    <button 
                      type="button" 
                      onClick={() => setShowUrlInput(!showUrlInput)} 
                      style={{ background: 'none', border: 'none', color: '#2d6a4f', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      {showUrlInput ? 'Hide URL Input' : '+ Paste Image / Video URL'}
                    </button>
                  </div>

                  {/* Hidden File Input accepting images and videos */}
                  <input 
                    type="file" 
                    id="business-media-upload" 
                    accept="image/*,video/*" 
                    multiple 
                    onChange={handleMediaFileUpload} 
                    style={{ display: 'none' }} 
                  />

                  {/* Drag-and-drop / Browse Box */}
                  <label 
                    htmlFor="business-media-upload"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justify: 'center',
                      padding: '20px 16px',
                      border: '2px dashed #94a3b8',
                      borderRadius: '16px',
                      background: '#f8faf9',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.2s ease',
                      gap: '6px'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.borderColor = '#2d6a4f'; e.currentTarget.style.background = '#e8f5e9'; }}
                    onMouseOut={(e) => { e.currentTarget.style.borderColor = '#94a3b8'; e.currentTarget.style.background = '#f8faf9'; }}
                  >
                    <div style={{ width: '46px', height: '46px', borderRadius: '50%', background: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2px' }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1b4332" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#1b4332' }}>
                      Click to Browse or Drag Images & Videos
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                      Select multiple files • Only JPG, PNG, WEBP, MP4, WEBM allowed
                    </div>
                  </label>

                  {/* Optional Paste Direct Link */}
                  {showUrlInput && (
                    <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
                      <input 
                        type="url" 
                        value={mediaUrlInput} 
                        onChange={(e) => setMediaUrlInput(e.target.value)} 
                        placeholder="Paste image or video URL (https://...)" 
                        style={{ flex: 1, padding: '9px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
                      />
                      <button 
                        type="button" 
                        onClick={() => {
                          if (mediaUrlInput.trim()) {
                            const isVid = mediaUrlInput.includes('.mp4') || mediaUrlInput.includes('.webm') || mediaUrlInput.includes('video');
                            setUploadedMedia(prev => [...prev, { url: mediaUrlInput.trim(), type: isVid ? 'video' : 'image', name: 'Web Link' }]);
                            setMediaUrlInput('');
                          }
                        }}
                        style={{ background: '#1b4332', color: '#fff', border: 'none', padding: '0 16px', borderRadius: '10px', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}
                      >
                        Add
                      </button>
                    </div>
                  )}

                  {/* Uploaded Media Thumbnails / Chips */}
                  {uploadedMedia.length > 0 && (
                    <div style={{ marginTop: '14px' }}>
                      <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>
                        Selected Files ({uploadedMedia.length})
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(85px, 1fr))', gap: '10px' }}>
                        {uploadedMedia.map((m, idx) => (
                          <div key={idx} style={{ position: 'relative', width: '100%', height: '80px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #cbd5e1', background: '#000' }}>
                            {m.type === 'video' ? (
                              <video src={m.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <img src={m.url} alt={`Upload ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            )}
                            
                            <span style={{ position: 'absolute', bottom: '4px', left: '4px', background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: '9px', fontWeight: 800, padding: '2px 5px', borderRadius: '4px' }}>
                              {m.type === 'video' ? '🎥 VIDEO' : '📷 IMAGE'}
                            </span>

                            <button 
                              type="button" 
                              onClick={() => handleRemoveMedia(idx)} 
                              style={{ position: 'absolute', top: '4px', right: '4px', background: '#dc2626', color: '#fff', border: 'none', width: '20px', height: '20px', borderRadius: '50%', cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
                              title="Remove Media"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                  <button type="button" onClick={() => setShowAddProductModal(false)} style={{ background: '#f1f5f9', color: '#64748b', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: 800, fontSize: '12px', cursor: 'pointer' }}>
                    Cancel
                  </button>
                  <button type="submit" style={{ background: '#1b4332', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: 800, fontSize: '12px', cursor: 'pointer' }}>
                    Publish to Live Inventory
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    );
  }

  // --- 3. DELIVERY PARTNER CLEAN SIDEBAR DASHBOARD (ORGANIC GREEN CLIENT THEME) ---
  const riderSidebarItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'active', label: 'Active Orders' },
    { id: 'history', label: 'Past Deliveries' },
    { id: 'earnings', label: 'Wallet & Payouts' },
    { id: 'status', label: `Duty Status (${dutyStatus ? 'On Duty' : 'Off Duty'})` },
    { id: 'profile', label: 'Profile' }
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#f8faf9', color: '#1b4332' }}>
      
      {/* RIDER LEFT SIDEBAR (ORGANIC GREEN CLIENT THEME) */}
      <aside style={{
        width: sidebarOpen ? '260px' : '76px',
        height: '100vh',
        position: 'sticky',
        top: 0,
        background: '#0a231b',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.25s ease',
        zIndex: 100,
        boxShadow: '4px 0 20px rgba(0,0,0,0.1)'
      }}>
        {/* Header */}
        <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          {sidebarOpen ? (
            <div>
              <h3 style={{ fontSize: '17px', margin: 0, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-serif)', letterSpacing: '0.5px' }}>PLANTO Rider</h3>
              <span style={{ fontSize: '11px', color: '#ffb703', fontWeight: 700 }}>Express Partner Console</span>
            </div>
          ) : (
            <span style={{ fontSize: '18px', color: '#fff', fontWeight: 800, margin: '0 auto' }}>PR</span>
          )}

          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', width: '28px', height: '28px', borderRadius: '6px', cursor: 'pointer' }}
            title="Toggle Sidebar"
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        {/* Menu Nav */}
        <nav style={{ padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, overflowY: 'auto' }}>
          {riderSidebarItems.map(item => {
            const active = riderTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'status') {
                    setDutyStatus(!dutyStatus);
                  } else {
                    setRiderTab(item.id);
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'space-between',
                  padding: '14px 18px',
                  borderRadius: '12px',
                  border: 'none',
                  background: active ? '#2d6a4f' : 'transparent',
                  color: '#fff',
                  fontWeight: active ? 800 : 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  boxShadow: active ? '0 4px 12px rgba(0,0,0,0.2)' : 'none'
                }}
                onMouseOver={(e) => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                onMouseOut={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
              >
                {sidebarOpen && (
                  <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* RIDER SIDEBAR FOOTER */}
        <div style={{ padding: '18px 14px', borderTop: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', marginTop: 'auto', flexShrink: 0 }}>
          {sidebarOpen ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#2d6a4f', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '16px', flexShrink: 0 }}>
                  {currentUser.name.charAt(0)}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#fff', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {currentUser.name}
                  </div>
                  <div style={{ fontSize: '11px', color: '#ffb703', fontWeight: 700 }}>
                    {currentUser.vehicle || 'Delivery Partner'}
                  </div>
                </div>
              </div>

              <button 
                onClick={handleLogout}
                style={{ width: '100%', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '9px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                Logout Account
              </button>
            </div>
          ) : (
            <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '12px', fontWeight: 800, cursor: 'pointer', display: 'block', margin: '0 auto' }}>
              Exit
            </button>
          )}
        </div>
      </aside>

      {/* RIDER MAIN CONTENT AREA (ORGANIC GREEN CLIENT THEME) */}
      <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', background: '#ffffff', padding: '20px 28px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontFamily: 'var(--font-serif)', margin: 0, color: '#1b4332' }}>
              {riderSidebarItems.find(i => i.id === riderTab)?.label}
            </h1>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', margin: 0 }}>
              PLANTO Hyperlocal Express Delivery Partner Console
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ background: dutyStatus ? '#e8f5e9' : '#fef2f2', color: dutyStatus ? '#1b4332' : '#dc2626', border: dutyStatus ? '1px solid #c8e6c9' : '1px solid #fee2e2', padding: '6px 14px', borderRadius: '12px', fontSize: '12px', fontWeight: 800 }}>
              Duty Status: {dutyStatus ? 'Online & Receiving Orders' : 'Offline'}
            </span>
          </div>
        </div>

        {/* TAB 0: DASHBOARD */}
        {riderTab === 'dashboard' && (() => {
          const riderEarnings = currentUser?.totalEarnings ?? 0;
          const riderTrips = currentUser?.completedTrips ?? 0;
          const riderRating = riderTrips > 0 ? (currentUser?.rating || '4.95') : 'New Partner';
          const weeklyGain = riderEarnings > 0 ? `+₹${Math.min(riderEarnings, 650)} this week` : '₹0 earned this week';

          const weeklyBars = riderTrips > 0 ? [
            { day: 'Mon', val: 420, h: '50%' },
            { day: 'Tue', val: 560, h: '70%' },
            { day: 'Wed', val: 680, h: '85%' },
            { day: 'Thu', val: 510, h: '65%' },
            { day: 'Fri', val: 720, h: '95%' },
            { day: 'Sat', val: 840, h: '100%' },
            { day: 'Sun', val: 640, h: '80%' }
          ] : [
            { day: 'Mon', val: 0, h: '6%' },
            { day: 'Tue', val: 0, h: '6%' },
            { day: 'Wed', val: 0, h: '6%' },
            { day: 'Thu', val: 0, h: '6%' },
            { day: 'Fri', val: 0, h: '6%' },
            { day: 'Sat', val: 0, h: '6%' },
            { day: 'Sun', val: 0, h: '6%' }
          ];

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                <div className="card" style={{ borderLeft: '5px solid #1b4332' }}>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 800 }}>TOTAL EARNINGS</span>
                  <h3 style={{ fontSize: '28px', color: '#1b4332', marginTop: '4px', margin: 0, fontFamily: 'var(--font-serif)' }}>₹{riderEarnings}</h3>
                  <span style={{ fontSize: '11px', color: '#2e7d32', marginTop: '6px', display: 'block', fontWeight: 700 }}>{weeklyGain}</span>
                </div>
                <div className="card" style={{ borderLeft: '5px solid #2d6a4f' }}>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 800 }}>COMPLETED TRIPS</span>
                  <h3 style={{ fontSize: '28px', color: '#2d6a4f', marginTop: '4px', margin: 0, fontFamily: 'var(--font-serif)' }}>{riderTrips} Orders</h3>
                  <span style={{ fontSize: '11px', color: '#64748b', marginTop: '6px', display: 'block', fontWeight: 700 }}>100% On-time SLA</span>
                </div>
                <div className="card" style={{ borderLeft: '5px solid #ffb703' }}>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 800 }}>RIDER RATING</span>
                  <h3 style={{ fontSize: '28px', color: '#d97706', marginTop: '4px', margin: 0, fontFamily: 'var(--font-serif)' }}>
                    {typeof riderRating === 'number' || !isNaN(riderRating) ? `⭐ ${riderRating} / 5` : riderRating}
                  </h3>
                  <span style={{ fontSize: '11px', color: '#64748b', marginTop: '6px', display: 'block', fontWeight: 700 }}>Plant Care Excellence Badge</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
                <div className="card">
                  <h3 style={{ fontSize: '16px', fontFamily: 'var(--font-serif)', margin: '0 0 16px 0', color: '#1b4332' }}>Weekly Rider Payout Breakdown</h3>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', height: '140px', paddingTop: '20px', borderBottom: '1px solid #e2e8f0' }}>
                    {weeklyBars.map((bar, i) => (
                      <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '10px', color: '#64748b' }}>₹{bar.val}</span>
                        <div style={{ width: '100%', height: bar.h, background: i === 6 ? '#2d6a4f' : '#b7e4c7', borderRadius: '6px 6px 0 0' }}></div>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>{bar.day}</span>
                      </div>
                    ))}
                  </div>
                </div>

              <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontFamily: 'var(--font-serif)', margin: '0 0 14px 0', color: '#1b4332' }}>Rider Controls</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button 
                      onClick={() => setRiderTab('active')}
                      style={{ background: '#ffb703', color: '#000', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 800, fontSize: '13px', cursor: 'pointer' }}
                    >
                      Go to Active Pick-ups ({deliveryOrders.length})
                    </button>
                    <button className="btn btn-secondary" style={{ justifyContent: 'center' }} onClick={() => setRiderTab('earnings')}>
                      Instant UPI Payout
                    </button>
                  </div>
                </div>

                <div style={{ background: '#e8f5e9', padding: '12px', borderRadius: '12px', fontSize: '11px', color: '#2e7d32', marginTop: '16px' }}>
                  <strong>Plant Safety Reminder:</strong>
                  <p style={{ margin: '4px 0 0 0' }}>Keep plant boxes upright during scooter transport to earn +₹10 hydration bonus!</p>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 style={{ fontSize: '16px', fontFamily: 'var(--font-serif)', marginBottom: '16px', color: '#1b4332' }}>Live Pickup Queue Nearby</h3>
              {deliveryOrders && deliveryOrders.length > 0 ? (
                deliveryOrders.map((ord) => (
                  <div key={ord.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <div>
                      <strong style={{ fontSize: '15px', color: '#1b4332' }}>Order #{ord.id} • {ord.vendorName || 'Nursery Stall'}</strong>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Pick-up: Indiranagar ➔ Drop: 100ft Road (1.4 km)</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, color: '#2e7d32', fontSize: '16px' }}>+₹{ord.payout || 65} Payout</div>
                      <button 
                        onClick={() => handleCompleteRiderDelivery(ord)}
                        style={{ background: '#1b4332', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 800, marginTop: '4px', cursor: 'pointer' }}
                      >
                        Complete Delivery ✓
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '24px 16px', textAlign: 'center', background: '#f8faf9', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                  <div style={{ fontSize: '24px', marginBottom: '6px' }}>📦</div>
                  <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#1b4332' }}>No Active Nearby Pickups</div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>New customer orders in your delivery zone will appear here automatically.</div>
                </div>
              )}
            </div>

            </div>
          );
        })()}

        {/* TAB 1: ACTIVE PICKUPS */}
        {riderTab === 'active' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {deliveryOrders && deliveryOrders.length > 0 ? (
              deliveryOrders.map((ord) => (
                <div key={ord.id} className="card" style={{ borderRadius: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <span style={{ background: '#ffb703', color: '#000', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 800 }}>⚡ 30-MIN PLANT DELIVERY</span>
                      <h4 style={{ fontSize: '18px', marginTop: '6px', color: '#1b4332', margin: '6px 0 0 0' }}>Order #{ord.id} • {ord.vendorName || 'Nursery Stall'}</h4>
                      <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                        Pick-up: Indiranagar Metro Pillar 124 ➔ Drop: 100ft Road, Indiranagar (1.4 km)
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: '#2e7d32' }}>+₹{ord.payout || 65} Payout</div>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>Incl. Plant Care Bonus</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '12px', marginTop: '12px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#2e7d32' }}>Status: {ord.status || 'Out for Delivery'}</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => handleCompleteRiderDelivery(ord)}
                        style={{ background: '#1b4332', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '10px', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}
                      >
                        Complete Delivery ✓
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="card" style={{ padding: '40px 20px', textAlign: 'center', background: '#ffffff' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>🛵</div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1b4332', margin: 0 }}>No Active Assigned Orders</h3>
                <p style={{ fontSize: '13px', color: '#64748b', marginTop: '6px', maxWidth: '400px', margin: '6px auto 0 auto' }}>
                  You currently have no active delivery orders in progress. Stay online to receive live plant delivery dispatches nearby!
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: TRIP HISTORY */}
        {riderTab === 'history' && (
          <div className="card" style={{ padding: pastDeliveries && pastDeliveries.length > 0 ? 0 : '40px 20px', overflow: 'hidden', textAlign: pastDeliveries && pastDeliveries.length > 0 ? 'left' : 'center' }}>
            {pastDeliveries && pastDeliveries.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead style={{ background: '#f8faf9', borderBottom: '2px solid #e2e8f0', fontWeight: 800 }}>
                  <tr>
                    <th style={{ padding: '16px 20px', color: '#1b4332' }}>Order ID</th>
                    <th style={{ padding: '16px 20px', color: '#1b4332' }}>Nursery</th>
                    <th style={{ padding: '16px 20px', color: '#1b4332' }}>Customer</th>
                    <th style={{ padding: '16px 20px', color: '#1b4332' }}>Payout</th>
                    <th style={{ padding: '16px 20px', color: '#1b4332' }}>Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {pastDeliveries.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 20px', fontWeight: 800, color: '#1b4332' }}>{item.id}</td>
                      <td style={{ padding: '14px 20px' }}>{item.vendor}</td>
                      <td style={{ padding: '14px 20px', color: '#64748b' }}>{item.customer}</td>
                      <td style={{ padding: '14px 20px', fontWeight: 800, color: '#2e7d32' }}>+₹{item.payout}</td>
                      <td style={{ padding: '14px 20px', color: '#d97706', fontWeight: 800 }}>{item.rating}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>📋</div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1b4332', margin: 0 }}>No Completed Deliveries Yet</h3>
                <p style={{ fontSize: '13px', color: '#64748b', marginTop: '6px', margin: '6px 0 0 0' }}>
                  Your completed trips and earnings history will appear here after you finish your first delivery order.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: EARNINGS & PAYOUTS */}
        {riderTab === 'earnings' && (
          <div className="card">
            <h3 style={{ fontSize: '20px', fontFamily: 'var(--font-serif)', marginBottom: '16px', color: '#1b4332' }}>Rider Wallet & Weekly Earnings</h3>
            <div style={{ background: '#f8faf9', border: '1px solid #e2e8f0', padding: '24px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 700 }}>UNSETTLED BALANCE</span>
                <h2 style={{ fontSize: '32px', color: '#2e7d32', margin: '4px 0 0 0' }}>₹{currentUser?.totalEarnings || 0}</h2>
              </div>
              <button 
                onClick={() => {
                  const bal = currentUser?.totalEarnings || 0;
                  if (bal <= 0) {
                    alert("⚠️ You have ₹0 unsettled balance. Complete deliveries to earn payouts!");
                    return;
                  }
                  alert(`🎉 ₹${bal} transferred to your UPI account!`);
                  setCurrentUser(prev => ({ ...prev, totalEarnings: 0 }));
                }}
                style={{ background: '#ffb703', color: '#000', border: 'none', padding: '14px 24px', borderRadius: '12px', fontWeight: 800, fontSize: '13.5px', cursor: 'pointer' }}
              >
                Instant Payout to UPI →
              </button>
            </div>
          </div>
        )}

        {/* TAB 5: RIDER PROFILE */}
        {riderTab === 'profile' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', alignItems: 'start' }}>
            
            {/* LEFT SIDE PANEL: Rider Profile Details */}
            <div className="card" style={{ padding: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '22px', fontFamily: 'var(--font-serif)', margin: 0, color: '#1b4332' }}>
                    Rider Profile & Vehicle Settings
                  </h3>
                  <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', margin: 0 }}>
                    Registered contact info, vehicle details, and license verification
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button 
                    onClick={handleOpenEditProfile}
                    style={{ background: '#1b4332', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '10px', fontSize: '12.5px', fontWeight: 800, cursor: 'pointer' }}
                  >
                    Edit Profile Details
                  </button>
                  <span style={{ background: '#e8f5e9', color: '#1b4332', border: '1px solid #c8e6c9', padding: '6px 14px', borderRadius: '12px', fontSize: '12px', fontWeight: 800 }}>
                    VERIFIED RIDER
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', fontSize: '13.5px' }}>
                <div style={{ background: '#f8faf9', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Full Name</span>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#1b4332', marginTop: '4px' }}>
                    {currentUser.name}
                  </div>
                </div>

                <div style={{ background: '#f8faf9', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Email Address (Login ID)</span>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#334155', marginTop: '4px' }}>
                    {currentUser.email}
                  </div>
                </div>

                <div style={{ background: '#f8faf9', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Phone Contact</span>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#334155', marginTop: '4px' }}>
                    {currentUser.phone || 'N/A'}
                  </div>
                </div>

                <div style={{ background: '#f8faf9', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Vehicle Model</span>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#2d6a4f', marginTop: '4px' }}>
                    {currentUser.vehicle || 'N/A'}
                  </div>
                </div>

                <div style={{ background: '#fff8e1', padding: '18px', borderRadius: '14px', border: '1px solid #ffe082' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#b45309', textTransform: 'uppercase' }}>Vehicle Reg Number</span>
                  <div style={{ fontSize: '17px', fontWeight: 900, color: '#b45309', marginTop: '4px', letterSpacing: '0.5px' }}>
                    {currentUser.vehicleNumber || 'N/A'}
                  </div>
                </div>

                <div style={{ background: '#f8faf9', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Driving License</span>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#334155', marginTop: '4px' }}>
                    {currentUser.drivingLicense || 'N/A'}
                  </div>
                </div>

                <div style={{ gridColumn: 'span 2', background: '#f8faf9', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Operating Location Address</span>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#334155', marginTop: '4px' }}>
                    {currentUser.address || 'N/A'}
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE PANEL: Uploaded Verification Documents */}
            <div className="card" style={{ padding: '28px' }}>
              <h3 style={{ fontSize: '20px', fontFamily: 'var(--font-serif)', margin: '0 0 4px 0', color: '#1b4332' }}>
                Uploaded Documents
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 20px 0' }}>
                PDF verification files submitted during account registration
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Driving License Document Box */}
                <div style={{ background: '#f8faf9', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Driving License Document</span>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#1b4332', marginTop: '4px', marginBottom: '12px' }}>
                    DL No: {currentUser.drivingLicense || 'N/A'}
                  </div>

                  {currentUser.dlDoc ? (
                    currentUser.dlDoc.startsWith('data:application/pdf') || currentUser.dlFileName?.endsWith('.pdf') ? (
                      <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', padding: '14px', borderRadius: '12px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                        <span style={{ background: '#dc2626', color: '#fff', fontSize: '11px', fontWeight: 800, padding: '4px 10px', borderRadius: '4px' }}>PDF FILE</span>
                        <span style={{ fontSize: '12px', color: '#991b1b', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%', whiteSpace: 'nowrap', width: '100%' }}>
                          {currentUser.dlFileName || 'Driving_License.pdf'}
                        </span>
                        <div style={{ display: 'flex', gap: '10px', width: '100%', marginTop: '4px' }}>
                          <button 
                            type="button" 
                            onClick={() => handleOpenDocument(currentUser.dlDoc, currentUser.dlFileName)} 
                            style={{ flex: 1, background: '#dc2626', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}
                          >
                            📄 View PDF
                          </button>
                          <button 
                            type="button" 
                            onClick={() => handleDownloadDocument(currentUser.dlDoc, currentUser.dlFileName || `${currentUser.name}_DL.pdf`)} 
                            style={{ flex: 1, background: '#1b4332', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}
                          >
                            ⬇️ Download
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ height: '140px', borderRadius: '12px', overflow: 'hidden', background: '#e2e8f0', cursor: 'pointer' }} onClick={() => handleOpenDocument(currentUser.dlDoc, 'Driving_License')}>
                        <img src={currentUser.dlDoc} alt="Driving License" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    )
                  ) : (
                    <div style={{ fontSize: '12.5px', color: '#94a3b8', fontStyle: 'italic', padding: '12px 0' }}>No Driving License document attached</div>
                  )}
                </div>

                {/* Aadhaar Card Document Box */}
                <div style={{ background: '#f8faf9', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Aadhaar Card Document</span>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#1b4332', marginTop: '4px', marginBottom: '12px', fontFamily: 'monospace' }}>
                    Aadhaar No: {currentUser.aadhaar || 'N/A'}
                  </div>

                  {currentUser.aadhaarDoc ? (
                    currentUser.aadhaarDoc.startsWith('data:application/pdf') || currentUser.aadhaarFileName?.endsWith('.pdf') ? (
                      <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', padding: '14px', borderRadius: '12px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                        <span style={{ background: '#dc2626', color: '#fff', fontSize: '11px', fontWeight: 800, padding: '4px 10px', borderRadius: '4px' }}>PDF FILE</span>
                        <span style={{ fontSize: '12px', color: '#991b1b', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%', whiteSpace: 'nowrap', width: '100%' }}>
                          {currentUser.aadhaarFileName || 'Aadhaar_Card.pdf'}
                        </span>
                        <div style={{ display: 'flex', gap: '10px', width: '100%', marginTop: '4px' }}>
                          <button 
                            type="button" 
                            onClick={() => handleOpenDocument(currentUser.aadhaarDoc, currentUser.aadhaarFileName)} 
                            style={{ flex: 1, background: '#dc2626', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}
                          >
                            📄 View PDF
                          </button>
                          <button 
                            type="button" 
                            onClick={() => handleDownloadDocument(currentUser.aadhaarDoc, currentUser.aadhaarFileName || `${currentUser.name}_Aadhaar.pdf`)} 
                            style={{ flex: 1, background: '#1b4332', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}
                          >
                            ⬇️ Download
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ height: '140px', borderRadius: '12px', overflow: 'hidden', background: '#e2e8f0', cursor: 'pointer' }} onClick={() => handleOpenDocument(currentUser.aadhaarDoc, 'Aadhaar_Card')}>
                        <img src={currentUser.aadhaarDoc} alt="Aadhaar Card" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    )
                  ) : (
                    <div style={{ fontSize: '12.5px', color: '#94a3b8', fontStyle: 'italic', padding: '12px 0' }}>No Aadhaar Card document attached</div>
                  )}
                </div>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* EDIT PROFILE MODAL */}
      {showEditProfileModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(27,67,50,0.7)', backdropFilter: 'blur(4px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '24px', maxWidth: '520px', width: '100%', padding: '28px', color: '#1b4332', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px' }}>
              <h3 style={{ fontSize: '18px', fontFamily: 'var(--font-serif)', margin: 0, color: '#1b4332' }}>
                Edit Account Profile Details
              </h3>
              <button onClick={() => setShowEditProfileModal(false)} style={{ background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontSize: '16px', fontWeight: 800 }}>✕</button>
            </div>

            <form onSubmit={handleSaveEditProfile} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Full Name</label>
                  <input type="text" value={editProfileName} onChange={(e) => setEditProfileName(e.target.value)} required style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Email Address</label>
                  <input type="email" value={editProfileEmail} onChange={(e) => setEditProfileEmail(e.target.value)} required style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Phone Contact</label>
                  <input type="text" value={editProfilePhone} onChange={(e) => setEditProfilePhone(e.target.value)} required style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, marginBottom: '4px', display: 'block' }}>
                    {currentUser.role === 'Vendor' ? 'Nursery Stall Name' : 'Vehicle Model'}
                  </label>
                  <input type="text" value={editProfileDetail} onChange={(e) => setEditProfileDetail(e.target.value)} required style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
                </div>
              </div>

              {currentUser.role === 'Delivery Partner' && (
                <div>
                  <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Vehicle Reg Number</label>
                  <input type="text" value={editProfileVehicleNum} onChange={(e) => setEditProfileVehicleNum(e.target.value)} required style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
                </div>
              )}

              <div>
                <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Location Address</label>
                <input type="text" value={editProfileAddress} onChange={(e) => setEditProfileAddress(e.target.value)} required style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowEditProfileModal(false)} style={{ background: '#f1f5f9', color: '#64748b', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: 800, fontSize: '12px', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" style={{ background: '#1b4332', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: 800, fontSize: '12px', cursor: 'pointer' }}>
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD PRODUCT TO NURSERY CATALOG MODAL */}
      {showAddProductModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(27,67,50,0.7)', backdropFilter: 'blur(4px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '24px', maxWidth: '520px', width: '100%', padding: '28px', color: '#1b4332', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '20px', fontFamily: 'var(--font-serif)', margin: 0, color: '#1b4332' }}>
                  + Add Plant or Pot Item
                </h3>
                <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px', margin: 0 }}>
                  Publish items to your live Nursery catalog for customer orders
                </p>
              </div>
              <button onClick={() => setShowAddProductModal(false)} style={{ background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontSize: '16px', fontWeight: 800 }}>✕</button>
            </div>

            <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Product Title</label>
                <input 
                  type="text" 
                  value={newProdName} 
                  onChange={(e) => setNewProdName(e.target.value)} 
                  placeholder="e.g. Premium Monstera Deliciosa"
                  required 
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Category</label>
                  <select 
                    value={newProdCategory} 
                    onChange={(e) => setNewProdCategory(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Selling Price (₹)</label>
                  <input 
                    type="number" 
                    value={newProdPrice} 
                    onChange={(e) => setNewProdPrice(e.target.value)} 
                    required 
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Item Type</label>
                  <select 
                    value={newProdType} 
                    onChange={(e) => setNewProdType(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  >
                    <option value="plant">Plant Sapling</option>
                    <option value="pot">Pot / Planter</option>
                    <option value="soil">Soil & Fertilizer</option>
                    <option value="tools">Gardening Tools</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Stock Quantity</label>
                  <input 
                    type="number" 
                    value={newProdStock} 
                    onChange={(e) => setNewProdStock(e.target.value)} 
                    required 
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Photo URL (Optional)</label>
                <input 
                  type="url" 
                  value={newProdImg} 
                  onChange={(e) => setNewProdImg(e.target.value)} 
                  placeholder="https://images.unsplash.com/..."
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowAddProductModal(false)} style={{ background: '#f1f5f9', color: '#64748b', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: 800, fontSize: '12px', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" style={{ background: '#1b4332', color: '#fff', border: 'none', padding: '10px 22px', borderRadius: '10px', fontWeight: 800, fontSize: '13px', cursor: 'pointer' }}>
                  Save & Publish Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PREVIEW SUBMITTED PRODUCT MODAL */}
      {previewProduct && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(27,67,50,0.7)', backdropFilter: 'blur(4px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '24px', maxWidth: '500px', width: '100%', padding: '24px', color: '#1b4332', boxShadow: '0 25px 60px rgba(0,0,0,0.3)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontFamily: 'var(--font-serif)', margin: 0, color: '#1b4332' }}>
                  Submitted Item Preview
                </h3>
                <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 600 }}>Live Product Listing Details</span>
              </div>
              <button type="button" onClick={() => setPreviewProduct(null)} style={{ background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontSize: '16px', fontWeight: 800 }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <img 
                src={getImageSrc(previewProduct)} 
                alt={previewProduct?.name || 'Plant'} 
                style={{ width: '100%', height: '220px', borderRadius: '16px', objectFit: 'cover', background: '#f8faf9', border: '1px solid #e2e8f0' }} 
              />

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: '#1b4332' }}>{previewProduct?.name}</h2>
                  <span style={{ fontSize: '20px', fontWeight: 900, color: '#2d6a4f', whiteSpace: 'nowrap' }}>₹{previewProduct?.price}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                  <span style={{ background: '#e8f5e9', color: '#1b4332', padding: '4px 10px', borderRadius: '10px', fontSize: '11px', fontWeight: 800 }}>{previewProduct?.category}</span>
                  <span style={{ background: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '10px', fontSize: '11px', fontWeight: 700 }}>{previewProduct?.type || 'Plant Sapling'}</span>
                  <span style={{ background: (previewProduct?.quantity || 0) > 0 ? '#dcfce7' : '#fee2e2', color: (previewProduct?.quantity || 0) > 0 ? '#15803d' : '#b91c1c', padding: '4px 10px', borderRadius: '10px', fontSize: '11px', fontWeight: 800 }}>
                    {(previewProduct?.quantity || 0) > 0 ? `${previewProduct.quantity} Available in Stock` : 'Out of Stock'}
                  </span>
                </div>
              </div>

              <div style={{ background: '#f8faf9', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0', fontSize: '12.5px', color: '#334155' }}>
                <strong style={{ display: 'block', marginBottom: '4px', color: '#1b4332' }}>Care & Description:</strong>
                {previewProduct?.description || `${previewProduct?.name} - Premium live nursery stock. Grown with organic compost and pesticide-free care.`}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  type="button"
                  onClick={() => { const prodToEdit = previewProduct; setPreviewProduct(null); handleOpenEditProduct(prodToEdit); }}
                  style={{ flex: 1, background: '#1b4332', color: '#fff', border: 'none', padding: '10px', borderRadius: '12px', fontSize: '12.5px', fontWeight: 800, cursor: 'pointer' }}
                >
                  Edit Item Details
                </button>
                <button 
                  type="button"
                  onClick={() => setPreviewProduct(null)}
                  style={{ background: '#f1f5f9', color: '#64748b', border: 'none', padding: '10px 18px', borderRadius: '12px', fontSize: '12.5px', fontWeight: 800, cursor: 'pointer' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PRODUCT MODAL */}
      {editingProduct && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(27,67,50,0.7)', backdropFilter: 'blur(4px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '24px', maxWidth: '520px', width: '100%', padding: '28px', color: '#1b4332', boxShadow: '0 25px 60px rgba(0,0,0,0.3)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '20px', fontFamily: 'var(--font-serif)', margin: 0, color: '#1b4332' }}>
                  Edit Product Details
                </h3>
                <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px', margin: 0 }}>
                  Update item name, price, category, and available stock
                </p>
              </div>
              <button type="button" onClick={() => setEditingProduct(null)} style={{ background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontSize: '16px', fontWeight: 800 }}>✕</button>
            </div>

            <form onSubmit={handleSaveEditProduct} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Product Title</label>
                <input 
                  type="text" 
                  value={editProdName} 
                  onChange={(e) => setEditProdName(e.target.value)} 
                  required 
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Category</label>
                  <select 
                    value={editProdCategory} 
                    onChange={(e) => setEditProdCategory(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  >
                    {(categories || []).map(cat => (
                      <option key={cat.id || cat.name} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Selling Price (₹)</label>
                  <input 
                    type="number" 
                    value={editProdPrice} 
                    onChange={(e) => setEditProdPrice(e.target.value)} 
                    required 
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Item Type</label>
                  <select 
                    value={editProdType} 
                    onChange={(e) => setEditProdType(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  >
                    {(itemTypes || []).map(it => (
                      <option key={it.id || it.name} value={it.name}>{it.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Stock Quantity</label>
                  <input 
                    type="number" 
                    value={editProdStock} 
                    onChange={(e) => setEditProdStock(e.target.value)} 
                    required 
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Photo URL</label>
                <input 
                  type="url" 
                  value={editProdImg} 
                  onChange={(e) => setEditProdImg(e.target.value)} 
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setEditingProduct(null)} style={{ background: '#f1f5f9', color: '#64748b', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: 800, fontSize: '12px', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" style={{ background: '#1b4332', color: '#fff', border: 'none', padding: '10px 22px', borderRadius: '10px', fontWeight: 800, fontSize: '13px', cursor: 'pointer' }}>
                  Save Changes →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
