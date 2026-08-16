import React, { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:5002/api';
const DEFAULT_PLANT_IMG = 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=600&q=80';

// Professional SVG Icons (No Emojis)
const ViewIcon = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const EditIcon = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 2 2h14a2 2 0 0 2 2h7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

const DisableIcon = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
  </svg>
);

const EnableIcon = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const DeleteIcon = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', margin: 'auto' }}>
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);

const RejectIcon = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const UserLoginIcon = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    <polyline points="10 17 15 12 10 7" />
    <line x1="15" y1="12" x2="3" y2="12" />
  </svg>
);

export default function App() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return localStorage.getItem('planto_admin_logged') === 'true' || true;
  });
  const [adminEmail, setAdminEmail] = useState('admin@planto.in');
  const [adminPassword, setAdminPassword] = useState('admin123');
  const [adminName, setAdminName] = useState('Root System Administrator');
  const [adminPhone, setAdminPhone] = useState('+91 98000 11223');
  const [showEditAdminProfileModal, setShowEditAdminProfileModal] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [riders, setRiders] = useState([]);
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('planto_admin_tab') || 'dashboard';
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Category & Seasonal State (Strictly 4 Seasons & Seasonal Collections)
  const [categories, setCategories] = useState([
    { id: 'cat_seasonal_1', name: 'Spring Bloom', description: 'Fresh flowering saplings & bio-fertilizer (March - May)', seasonMonths: 'March - May', itemCount: 14, status: 'Active' },
    { id: 'cat_seasonal_2', name: 'Summer Oasis', description: 'Heat-tolerant succulents, palms & shade pots (June - August)', seasonMonths: 'June - August', itemCount: 18, status: 'Active' },
    { id: 'cat_seasonal_3', name: 'Monsoon Magic', description: 'Rainy-day planters, herbs & vermicompost (Sept - Nov)', seasonMonths: 'Sept - Nov', itemCount: 12, status: 'Active' },
    { id: 'cat_seasonal_4', name: 'Winter Wonders', description: 'Petunias, Marigolds & root food (Dec - Feb)', seasonMonths: 'Dec - Feb', itemCount: 15, status: 'Active' }
  ]);

  // Item Types Classification State (Product Classifications)
  const [itemTypes, setItemTypes] = useState([
    { id: 'it_1', name: 'Indoor Plants', description: 'Air-purifying foliage, shade lovers & succulents', status: 'Active' },
    { id: 'it_2', name: 'Outdoor & Flowering Plants', description: 'Sun-loving flowering garden shrubs & climbers', status: 'Active' },
    { id: 'it_3', name: 'Pots & Terracotta Planters', description: 'Handcrafted ceramic, terracotta & eco planters', status: 'Active' },
    { id: 'it_4', name: 'Seeds & Organic Soil', description: 'Hybrid flower seeds, potting mix & bio fertilizers', status: 'Active' },
    { id: 'it_5', name: 'Fresh Flower Bouquets', description: 'Hand-picked floral arrangements & gift hampers', status: 'Active' },
    { id: 'it_6', name: 'Gardening Tools', description: 'Pruners, watering cans, sprayers & shears', status: 'Active' },
    { id: 'it_7', name: 'Plant Sapling', description: 'Live indoor & outdoor potted plant saplings', status: 'Active' },
    { id: 'it_8', name: 'Pot / Planter', description: 'Ceramic, terracotta, plastic & fabric planters', status: 'Active' },
    { id: 'it_9', name: 'Hydroponics Equipment', description: 'Soil-less farming kits & nutrient solutions', status: 'Active' }
  ]);

  // Modal States
  const [selectedVendorForCatalog, setSelectedVendorForCatalog] = useState(null);
  const [selectedRiderForDocs, setSelectedRiderForDocs] = useState(null);
  const [editingVendor, setEditingVendor] = useState(null);
  const [deletingVendor, setDeletingVendor] = useState(null);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showAddItemTypeModal, setShowAddItemTypeModal] = useState(false);
  const [showAddRiderModal, setShowAddRiderModal] = useState(false);
  const [showRegisterVendorModal, setShowRegisterVendorModal] = useState(false);
  const [registerRoleTab, setRegisterRoleTab] = useState('Vendor'); // 'Vendor' | 'Delivery Partner'
  const [regVendorOwner, setRegVendorOwner] = useState('');
  const [regVendorEmail, setRegVendorEmail] = useState('');
  const [regVendorPassword, setRegVendorPassword] = useState('');
  const [regVendorPhone, setRegVendorPhone] = useState('');
  const [regVendorAddress, setRegVendorAddress] = useState('');
  const [regVendorName, setRegVendorName] = useState('');

  // Rider Registration Form State
  const [regRiderName, setRegRiderName] = useState('');
  const [regRiderEmail, setRegRiderEmail] = useState('');
  const [regRiderPassword, setRegRiderPassword] = useState('');
  const [regRiderPhone, setRegRiderPhone] = useState('');
  const [regRiderAddress, setRegRiderAddress] = useState('');
  const [regRiderVehicle, setRegRiderVehicle] = useState('Hero Electric Scooter');
  const [regRiderVehicleNum, setRegRiderVehicleNum] = useState('');
  const [regRiderDlNum, setRegRiderDlNum] = useState('');
  const [regRiderAadhaarNum, setRegRiderAadhaarNum] = useState('');
  const [regDlDoc, setRegDlDoc] = useState('');
  const [dlFileName, setDlFileName] = useState('');
  const [dlFileType, setDlFileType] = useState('');
  const [regAadhaarDoc, setRegAadhaarDoc] = useState('');
  const [aadhaarFileName, setAadhaarFileName] = useState('');
  const [aadhaarFileType, setAadhaarFileType] = useState('');
  
  // Segmented Pill Toggle Filter State
  const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState('All');
  const [inventorySeasonalFilter, setInventorySeasonalFilter] = useState('All');
  const [inventoryTypeFilter, setInventoryTypeFilter] = useState('All');

  // Edit Vendor Form State
  const [editName, setEditName] = useState('');
  const [editOwner, setEditOwner] = useState('');
  const [editType, setEditType] = useState('Roadside Seller');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editRating, setEditRating] = useState(4.8);

  // Add Product Form State
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('Spring Bloom');
  const [newProdType, setNewProdType] = useState('Plant Sapling');
  const [newProdPrice, setNewProdPrice] = useState(199);
  const [newProdStock, setNewProdStock] = useState(25);
  const [newProdImg, setNewProdImg] = useState('');

  // Admin Media Upload State (Multiple Images & Videos)
  const [uploadedAdminMedia, setUploadedAdminMedia] = useState([]);
  const [adminMediaUrlInput, setAdminMediaUrlInput] = useState('');
  const [showAdminUrlInput, setShowAdminUrlInput] = useState(false);

  // Category Form State
  const [catName, setCatName] = useState('');
  const [catDescription, setCatDescription] = useState('');

  // Item Type Form State
  const [itemTypeName, setItemTypeName] = useState('');
  const [itemTypeDescription, setItemTypeDescription] = useState('');

  // Admin Add Delivery Rider Form State
  const [adminRiderName, setAdminRiderName] = useState('');
  const [adminRiderEmail, setAdminRiderEmail] = useState('');
  const [adminRiderPassword, setAdminRiderPassword] = useState('rider123');
  const [adminRiderPhone, setAdminRiderPhone] = useState('');
  const [adminRiderAddress, setAdminRiderAddress] = useState('');
  const [adminRiderVehicle, setAdminRiderVehicle] = useState('Hero Electric Scooter');
  const [adminRiderVehicleNum, setAdminRiderVehicleNum] = useState('');
  const [adminRiderDlNum, setAdminRiderDlNum] = useState('');
  const [adminRiderDlDoc, setAdminRiderDlDoc] = useState('');
  const [adminRiderAadhaarNum, setAdminRiderAadhaarNum] = useState('');
  const [adminRiderAadhaarDoc, setAdminRiderAadhaarDoc] = useState('');
  const [adminRiderStatus, setAdminRiderStatus] = useState('APPROVED');

  // Edit Rider Form State
  const [editingRider, setEditingRider] = useState(null);
  const [editRiderName, setEditRiderName] = useState('');
  const [editRiderEmail, setEditRiderEmail] = useState('');
  const [editRiderPhone, setEditRiderPhone] = useState('');
  const [editRiderAddress, setEditRiderAddress] = useState('');
  const [editRiderVehicle, setEditRiderVehicle] = useState('');
  const [editRiderVehicleNum, setEditRiderVehicleNum] = useState('');
  const [editRiderDlNum, setEditRiderDlNum] = useState('');
  const [editRiderAadhaarNum, setEditRiderAadhaarNum] = useState('');
  const [editRiderStatus, setEditRiderStatus] = useState('APPROVED');

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

  const handleAdminImpersonateLogin = (account, role) => {
    if (!account) return;

    if (account.status === 'DISABLED' || account.status === 'BLOCKED' || account.status === 'REJECTED' || account.isOpen === false) {
      alert(`⚠️ Cannot login into disabled/blocked account: "${account.name || account.owner}". Please enable the account first.`);
      return;
    }

    const userSession = role === 'Delivery Partner' ? {
      id: account.id,
      name: account.name || 'Delivery Partner',
      email: account.email,
      role: 'Delivery Partner',
      vehicle: account.vehicle || '',
      vehicleNumber: account.vehicleNumber || '',
      drivingLicense: account.drivingLicense || '',
      aadhaar: account.aadhaar || '',
      phone: account.phone || '',
      address: account.address || '',
      status: account.status || 'APPROVED',
      totalEarnings: account.totalEarnings || 0,
      completedTrips: account.completedTrips || 0
    } : {
      id: account.id,
      name: account.owner || account.name || 'Nursery Vendor',
      email: account.email || `${(account.name || account.owner || 'vendor').toLowerCase().replace(/\s+/g, '')}@planto.in`,
      role: 'Vendor',
      nurseryName: account.name || account.nurseryName || `${account.owner}'s Nursery Stall`,
      address: account.location || account.address || 'Bengaluru, KA',
      phone: account.phone || '+91 98450 11223',
      hours: account.hours || '7:00 AM - 7:30 PM'
    };

    const targetUrl = `http://localhost:5174/?impersonate=${encodeURIComponent(JSON.stringify(userSession))}`;
    window.open(targetUrl, '_blank');
  };

  useEffect(() => {
    fetchAdminData();
    const interval = setInterval(fetchAdminData, 3000);
    window.addEventListener('focus', fetchAdminData);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', fetchAdminData);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('planto_admin_tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('planto_admin_logged', isAdminLoggedIn ? 'true' : 'false');
  }, [isAdminLoggedIn]);

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

      const cRes = await fetch(`${API_BASE}/categories`);
      const cData = await cRes.json();
      if (cData && Array.isArray(cData)) setCategories(cData);

      const itRes = await fetch(`${API_BASE}/item-types`);
      const itData = await itRes.json();
      if (itData && Array.isArray(itData)) setItemTypes(itData);

      const rRes = await fetch(`${API_BASE}/riders`);
      const rData = await rRes.json().catch(() => []);

      const localRiders = JSON.parse(localStorage.getItem('planto_registered_riders') || '[]');
      const riderMap = new Map();
      if (Array.isArray(localRiders)) localRiders.forEach(r => riderMap.set(r.email.toLowerCase(), r));
      if (Array.isArray(rData)) rData.forEach(r => { if (!riderMap.has(r.email.toLowerCase())) riderMap.set(r.email.toLowerCase(), r); });
      setRiders(Array.from(riderMap.values()));
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

  const handleOpenEditVendor = (vendor) => {
    setEditingVendor(vendor);
    setEditName(vendor.name || '');
    setEditOwner(vendor.owner || '');
    setEditType(vendor.type || 'Roadside Seller');
    setEditPhone(vendor.phone || '+91 98480 22334');
    setEditAddress(vendor.address || 'Bengaluru, KA');
    setEditRating(vendor.rating || 4.8);
  };

  const handleSaveEditVendor = (e) => {
    e.preventDefault();
    if (!editingVendor) return;
    setVendors(vendors.map(v => v.id === editingVendor.id ? {
      ...v,
      name: editName,
      owner: editOwner,
      type: editType,
      phone: editPhone,
      address: editAddress,
      rating: parseFloat(editRating)
    } : v));
    setEditingVendor(null);
  };

  const handleConfirmDeleteVendor = () => {
    if (!deletingVendor) return;
    setVendors(vendors.filter(v => v.id !== deletingVendor.id));
    setProducts(products.filter(p => p.vendorId !== deletingVendor.id));
    setDeletingVendor(null);
  };

  const handleDeleteProductFromAdmin = (productId) => {
    setProducts(products.filter(p => p.id !== productId));
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (registerRoleTab === 'Vendor') {
      if (!regVendorName.trim() || !regVendorOwner.trim()) return;

      const newV = {
        id: `v_${Date.now()}`,
        name: regVendorName.trim(),
        owner: regVendorOwner.trim(),
        email: regVendorEmail.trim() || 'owner@nursery.com',
        password: regVendorPassword.trim() || 'planto123',
        type: 'Roadside Seller',
        rating: 5.0,
        isOpen: true,
        phone: regVendorPhone.trim() || '+91 98480 22334',
        address: regVendorAddress.trim() || '#124, 100ft Road, Indiranagar, Bengaluru'
      };

      setVendors([newV, ...vendors]);
      setRegVendorOwner('');
      setRegVendorEmail('');
      setRegVendorPassword('');
      setRegVendorPhone('');
      setRegVendorAddress('');
      setRegVendorName('');
    } else {
      if (!regRiderName.trim() || !regRiderEmail.trim()) return;

      const newRider = {
        id: `r_${Date.now()}`,
        name: regRiderName.trim(),
        email: regRiderEmail.trim(),
        phone: regRiderPhone.trim() || '+91 98450 11223',
        vehicle: regRiderVehicle.trim() || 'Hero Electric Scooter',
        vehicleNumber: regRiderVehicleNum.trim() || 'KA-05-EQ-8821',
        drivingLicense: regRiderDlNum.trim() || 'KA-01-2023-0098412',
        aadhaar: regRiderAadhaarNum.trim() || '4812-9901-3412',
        address: regRiderAddress.trim() || 'Indiranagar 100ft Road, Bengaluru',
        status: 'APPROVED',
        rating: '5.0',
        joinedDate: 'Just Now',
        dlDocumentUrl: regDlDoc || DEFAULT_PLANT_IMG,
        aadhaarDocumentUrl: regAadhaarDoc || DEFAULT_PLANT_IMG
      };

      setRiders([newRider, ...riders]);
      setRegRiderName('');
      setRegRiderEmail('');
      setRegRiderPassword('');
      setRegRiderPhone('');
      setRegRiderAddress('');
      setRegRiderVehicle('Hero Electric Scooter');
      setRegRiderVehicleNum('');
      setRegRiderDlNum('');
      setRegRiderAadhaarNum('');
      setRegDlDoc('');
      setDlFileName('');
      setDlFileType('');
      setRegAadhaarDoc('');
      setAadhaarFileName('');
      setAadhaarFileType('');
    }
    setShowRegisterVendorModal(false);
  };

  const handleAdminRiderDocUpload = (e, docType) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/') && !file.type.includes('pdf')) {
      alert('Only PDF and image files are supported for document verification.');
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

  const handleAdminMediaFileUpload = (e) => {
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
        setUploadedAdminMedia(prev => [...prev, mediaItem]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveAdminMedia = (indexToRemove) => {
    setUploadedAdminMedia(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleAddProductToVendorSubmit = (e) => {
    e.preventDefault();
    if (!selectedVendorForCatalog || !newProdName.trim()) return;

    const mediaUrls = uploadedAdminMedia.map(m => m.url || m);
    if (adminMediaUrlInput.trim()) {
      mediaUrls.push(adminMediaUrlInput.trim());
    }

    const finalImages = mediaUrls.length > 0 ? mediaUrls : [DEFAULT_PLANT_IMG];

    const newProduct = {
      id: `p_${Date.now()}`,
      name: newProdName,
      category: newProdCategory,
      type: newProdType || 'Plant Sapling',
      price: Number(newProdPrice),
      quantity: Number(newProdStock),
      vendorId: selectedVendorForCatalog.id,
      vendorName: selectedVendorForCatalog.name,
      rating: 4.8,
      reviewsCount: 1,
      description: `Premium quality ${newProdName} uploaded by ${selectedVendorForCatalog.name}.`,
      images: finalImages,
      media: uploadedAdminMedia.length > 0 ? uploadedAdminMedia : [{ url: finalImages[0], type: 'image' }]
    };

    setProducts([newProduct, ...products]);
    setNewProdName('');
    setNewProdImg('');
    setUploadedAdminMedia([]);
    setAdminMediaUrlInput('');
    setShowAddProductModal(false);
  };

  const handleAddCategorySubmit = async (e) => {
    e.preventDefault();
    if (!catName.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: catName.trim(),
          description: catDescription.trim() || 'Custom plant marketplace category'
        })
      });
      const newCat = await res.json();
      setCategories(prev => [...prev, newCat]);
      setCatName('');
      setCatDescription('');
      setShowAddCategoryModal(false);
    } catch (err) {
      console.error('Error adding category:', err);
    }
  };

  const handleDeleteCategory = async (catId) => {
    try {
      await fetch(`${API_BASE}/categories/${catId}`, { method: 'DELETE' });
      setCategories(prev => prev.filter(c => c.id !== catId));
    } catch (err) {
      console.error('Error deleting category:', err);
    }
  };

  const handleAddItemTypeSubmit = async (e) => {
    e.preventDefault();
    if (!itemTypeName.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/item-types`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: itemTypeName.trim(),
          description: itemTypeDescription.trim() || 'Custom platform product classification'
        })
      });
      const newItemType = await res.json();
      setItemTypes(prev => [...prev, newItemType]);
      setItemTypeName('');
      setItemTypeDescription('');
      setShowAddItemTypeModal(false);
    } catch (err) {
      console.error('Error adding item type:', err);
    }
  };

  const handleDeleteItemType = async (itemTypeId) => {
    try {
      await fetch(`${API_BASE}/item-types/${itemTypeId}`, { method: 'DELETE' });
      setItemTypes(prev => prev.filter(it => it.id !== itemTypeId));
    } catch (err) {
      console.error('Error deleting item type:', err);
    }
  };

  const handleUpdateRiderApproval = async (riderId, newStatus) => {
    try {
      await fetch(`${API_BASE}/riders/${riderId}/approval`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (err) {
      console.error('Error updating rider approval:', err);
    }

    setRiders(prev => prev.map(r => r.id === riderId ? { ...r, status: newStatus } : r));
    if (selectedRiderForDocs?.id === riderId) {
      setSelectedRiderForDocs(prev => prev ? { ...prev, status: newStatus } : null);
    }

    if (newStatus === 'DISABLED' || newStatus === 'BLOCKED') {
      alert(`🚫 Delivery Partner Credentials Suspended / Blocked!\n\nThis account is now BLOCKED. When they attempt to log in, they will receive the message:\n"You are blocked by the Admin. Please contact the Admin."`);
    } else if (newStatus === 'APPROVED') {
      alert(`✅ Delivery Partner Credentials Approved & Activated for Login!`);
    }
  };

  const handleOpenEditRider = (rider) => {
    setEditingRider(rider);
    setEditRiderName(rider.name || '');
    setEditRiderEmail(rider.email || '');
    setEditRiderPhone(rider.phone || '');
    setEditRiderAddress(rider.address || '');
    setEditRiderVehicle(rider.vehicle || 'Hero Electric Scooter');
    setEditRiderVehicleNum(rider.vehicleNumber || '');
    setEditRiderDlNum(rider.drivingLicense || '');
    setEditRiderAadhaarNum(rider.aadhaar || '');
    setEditRiderStatus(rider.status || 'APPROVED');
  };

  const handleSaveEditRiderSubmit = async (e) => {
    e.preventDefault();
    if (!editingRider) return;

    const updatedData = {
      name: editRiderName,
      email: editRiderEmail,
      phone: editRiderPhone,
      address: editRiderAddress,
      vehicle: editRiderVehicle,
      vehicleNumber: editRiderVehicleNum,
      drivingLicense: editRiderDlNum,
      aadhaar: editRiderAadhaarNum,
      status: editRiderStatus
    };

    try {
      await fetch(`${API_BASE}/riders/${editingRider.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
    } catch (err) {
      console.error('Error saving rider edits:', err);
    }

    setRiders(prev => prev.map(r => r.id === editingRider.id ? { ...r, ...updatedData } : r));
    setEditingRider(null);
    alert(`🎉 Delivery Partner '${editRiderName}' credentials successfully updated!`);
  };

  const handleDeleteRider = async (riderId) => {
    if (window.confirm("Are you sure you want to permanently delete this Delivery Partner account?")) {
      try {
        await fetch(`${API_BASE}/riders/${riderId}`, { method: 'DELETE' });
      } catch (e) {}
      setRiders(prev => prev.filter(r => r.id !== riderId));
    }
  };

  const handleAdminRegisterRiderSubmit = async (e) => {
    e.preventDefault();
    if (!adminRiderName || !adminRiderEmail || !adminRiderPhone) {
      alert('Please fill out required rider details (Name, Email, Phone).');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/riders/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: adminRiderName,
          email: adminRiderEmail,
          password: adminRiderPassword || 'rider123',
          phone: adminRiderPhone,
          address: adminRiderAddress || 'Bengaluru, KA',
          vehicle: adminRiderVehicle || 'Electric Scooter',
          vehicleNumber: adminRiderVehicleNum || 'KA-05-EQ-8821',
          drivingLicense: adminRiderDlNum || 'KA-01-2024-EXP',
          aadhaar: adminRiderAadhaarNum || '4812-9901-3412',
          dlDoc: adminRiderDlDoc || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
          aadhaarDoc: adminRiderAadhaarDoc || 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=600&q=80',
          status: adminRiderStatus
        })
      });
      const data = await res.json();
      if (data.success && data.rider) {
        setRiders([data.rider, ...riders]);
        setShowAddRiderModal(false);
        setAdminRiderName('');
        setAdminRiderEmail('');
        setAdminRiderPhone('');
        setAdminRiderVehicleNum('');
        alert(`🎉 Delivery Partner '${adminRiderName}' registered successfully!\n\nCredentials Issued:\nEmail: ${adminRiderEmail}\nPassword: ${adminRiderPassword}`);
      } else {
        alert(data.message || 'Registration failed.');
      }
    } catch (err) {
      console.error('Error adding rider from admin:', err);
    }
  };

  const handleAdminAuthSubmit = (e) => {
    e.preventDefault();
    if (!adminEmail) return;
    setIsAdminLoggedIn(true);
  };

  if (!isAdminLoggedIn) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1b4332 0%, #081c15 100%)', padding: '20px', color: '#1b4332', fontFamily: 'var(--font-main)' }}>
        <div className="card" style={{ maxWidth: '440px', width: '100%', padding: '40px', borderRadius: '24px', background: '#ffffff', border: '2px solid #2d6a4f', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
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
              <span style={{ color: '#1b4332', fontWeight: 700 }}>Demo Root Account:</span>
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

  // Clean Sidebar Navigation strictly as requested
  const adminSidebarItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'categories', label: 'Categories' },
    { id: 'vendors', label: 'Nursery stalls' },
    { id: 'riders', label: 'Delivery Partner' },
    { id: 'orders', label: 'Orders' },
    { id: 'settings', label: 'Platform Settings' }
  ];

  // Selected vendor products
  const selectedVendorProducts = selectedVendorForCatalog ? products.filter(p => p.vendorId === selectedVendorForCatalog.id || p.vendorName === selectedVendorForCatalog.name) : [];
  const filteredCatalogProducts = selectedVendorProducts.filter(p => {
    if (inventoryCategoryFilter === 'All') return true;
    const catLow = inventoryCategoryFilter.toLowerCase();
    const prodCat = (p.category || '').toLowerCase();
    return prodCat === catLow || prodCat.includes(catLow) || catLow.includes(prodCat);
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#f4f9f5', color: '#1b4332', fontFamily: 'var(--font-main)' }}>
      
      {/* 1. CLEAN ORGANIC GREEN LEFT SIDEBAR WITH EXPANDED SPACING */}
      <aside style={{
        width: sidebarOpen ? '260px' : '76px',
        height: '100vh',
        position: 'sticky',
        top: 0,
        background: '#1b4332',
        borderRight: '1px solid #2d6a4f',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.25s ease',
        zIndex: 100,
        boxShadow: '4px 0 20px rgba(0,0,0,0.06)'
      }}>
        {/* Header Logo */}
        <div style={{ padding: '24px 20px', borderBottom: '1px solid #2d6a4f', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          {sidebarOpen ? (
            <div>
              <h3 style={{ fontSize: '18px', margin: 0, fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-serif)', letterSpacing: '0.5px' }}>PLANTO Admin</h3>
              <span style={{ fontSize: '11px', color: '#ffb703', fontWeight: 700 }}>Super Operations</span>
            </div>
          ) : (
            <span style={{ fontSize: '18px', color: '#fff', fontWeight: 800, margin: '0 auto' }}>PA</span>
          )}

          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', width: '28px', height: '28px', borderRadius: '6px', cursor: 'pointer' }}
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        {/* Navigation Menu (Expanded vertical height & clean spacing) */}
        <nav style={{ padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, overflowY: 'auto' }}>
          {adminSidebarItems.map(item => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'space-between',
                  padding: '14px 18px',
                  borderRadius: '12px',
                  border: 'none',
                  background: active ? '#2d6a4f' : 'transparent',
                  color: active ? '#ffffff' : '#d8f3dc',
                  fontWeight: active ? 800 : 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  boxShadow: active ? '0 4px 12px rgba(0,0,0,0.15)' : 'none'
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

        {/* ADMIN SIDEBAR FOOTER */}
        <div style={{ padding: '18px 14px', borderTop: '1px solid #2d6a4f', background: 'rgba(0,0,0,0.15)', marginTop: 'auto', flexShrink: 0 }}>
          {sidebarOpen ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#ffb703', color: '#1b4332', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '15px', flexShrink: 0 }}>
                  SA
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#ffffff', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    Super Admin Console
                  </div>
                  <div style={{ fontSize: '11px', color: '#ffb703', fontWeight: 700 }}>
                    Root Controller
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setIsAdminLoggedIn(false)}
                style={{ width: '100%', background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.4)', padding: '9px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                Logout System
              </button>
            </div>
          ) : (
            <button onClick={() => setIsAdminLoggedIn(false)} style={{ background: 'none', border: 'none', color: '#fca5a5', fontSize: '12px', fontWeight: 800, cursor: 'pointer', display: 'block', margin: '0 auto' }}>
              Exit
            </button>
          )}
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        
        {/* Page Top Title Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', background: '#ffffff', padding: '20px 28px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.02)' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontFamily: 'var(--font-serif)', margin: 0, color: '#1b4332' }}>
              {adminSidebarItems.find(i => i.id === activeTab)?.label}
            </h1>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', margin: 0 }}>
              PLANTO Platform Master Control Panel & Governance Operations
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ background: '#e8f5e9', color: '#1b4332', padding: '6px 14px', borderRadius: '12px', fontSize: '12px', fontWeight: 800 }}>
              System Operational
            </span>
          </div>
        </div>

        {/* TAB 0: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
              <div className="card" style={{ borderLeft: '5px solid #1b4332' }}>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 800 }}>TOTAL PLATFORM GMV</span>
                <h3 style={{ fontSize: '28px', color: '#1b4332', marginTop: '4px', margin: 0, fontFamily: 'var(--font-serif)' }}>₹{totalGMV.toLocaleString()}</h3>
                <span style={{ fontSize: '11px', color: '#2e7d32', marginTop: '6px', display: 'block', fontWeight: 700 }}>+24% growth this month</span>
              </div>
              <div className="card" style={{ borderLeft: '5px solid #0284c7' }}>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 800 }}>REGISTERED NURSERIES</span>
                <h3 style={{ fontSize: '28px', color: '#0284c7', marginTop: '4px', margin: 0, fontFamily: 'var(--font-serif)' }}>{vendors.length} Stalls</h3>
                <span style={{ fontSize: '11px', color: '#64748b', marginTop: '6px', display: 'block', fontWeight: 700 }}>Verified Sellers</span>
              </div>
              <div className="card" style={{ borderLeft: '5px solid #d97706' }}>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 800 }}>ACTIVE RIDER FLEET</span>
                <h3 style={{ fontSize: '28px', color: '#d97706', marginTop: '4px', margin: 0, fontFamily: 'var(--font-serif)' }}>{riders.length} Registered</h3>
                <span style={{ fontSize: '11px', color: '#64748b', marginTop: '6px', display: 'block', fontWeight: 700 }}>{riders.filter(r => r.status === 'PENDING_APPROVAL').length} Pending Approvals</span>
              </div>
              <div className="card" style={{ borderLeft: '5px solid #8b5cf6' }}>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 800 }}>PLATFORM REVENUE (8%)</span>
                <h3 style={{ fontSize: '28px', color: '#8b5cf6', marginTop: '4px', margin: 0, fontFamily: 'var(--font-serif)' }}>₹{platformCommission.toLocaleString()}</h3>
                <span style={{ fontSize: '11px', color: '#8b5cf6', marginTop: '6px', display: 'block', fontWeight: 700 }}>Net earnings</span>
              </div>
            </div>

            {/* ANALYTICS GRAPHS GRID (DAILY NEW ORDERS & ACTIVE RIDERS & STALL REVENUE) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '22px' }}>
              
              {/* GRAPH 1: DAILY NEW ORDERS 24-HOUR TREND */}
              <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '17px', fontFamily: 'var(--font-serif)', margin: 0, color: '#1b4332' }}>
                      Daily New Orders Trend
                    </h3>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>Live 24-Hour Order Volume Stream</span>
                  </div>
                  <span style={{ background: '#e8f5e9', color: '#1b4332', fontSize: '11.5px', fontWeight: 800, padding: '4px 10px', borderRadius: '10px' }}>
                    🔥 Peak: 38 Orders/hr
                  </span>
                </div>

                {/* Bar Graph Visual */}
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '14px', height: '160px', padding: '16px 0 6px 0', borderBottom: '1px solid #e2e8f0' }}>
                  {[
                    { time: '08:00 AM', val: 18, h: '45%', col: '#2d6a4f' },
                    { time: '10:00 AM', val: 26, h: '65%', col: '#2d6a4f' },
                    { time: '12:00 PM', val: 32, h: '80%', col: '#2d6a4f' },
                    { time: '02:00 PM', val: 22, h: '55%', col: '#2d6a4f' },
                    { time: '04:00 PM', val: 30, h: '75%', col: '#2d6a4f' },
                    { time: '06:00 PM', val: 38, h: '100%', col: '#1b4332' },
                    { time: '08:00 PM', val: 28, h: '70%', col: '#2d6a4f' },
                    { time: '10:00 PM', val: 14, h: '35%', col: '#52b788' }
                  ].map((bar, idx) => (
                    <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '10px', fontWeight: 800, color: '#1b4332' }}>{bar.val}</span>
                      <div 
                        style={{ 
                          width: '100%', 
                          height: bar.h, 
                          background: bar.col, 
                          borderRadius: '6px 6px 0 0',
                          transition: 'height 0.3s ease',
                          boxShadow: bar.h === '100%' ? '0 4px 12px rgba(27,67,50,0.3)' : 'none'
                        }}
                        title={`${bar.time}: ${bar.val} orders`}
                      ></div>
                      <span style={{ fontSize: '10px', color: '#64748b', whiteSpace: 'nowrap' }}>{bar.time}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', fontSize: '12px' }}>
                  <div style={{ display: 'flex', gap: '14px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b', fontWeight: 700 }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#1b4332' }}></span> Delivered (78%)
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b', fontWeight: 700 }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#52b788' }}></span> In Transit (14%)
                    </span>
                  </div>
                  <strong style={{ color: '#1b4332' }}>Total Today: 208 Orders</strong>
                </div>
              </div>

              {/* GRAPH 2: ACTIVE RIDER FLEET & DISPATCH ACTIVITY */}
              <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '17px', fontFamily: 'var(--font-serif)', margin: 0, color: '#1b4332' }}>
                      Active Rider Fleet Operations
                    </h3>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>Real-time Delivery Partner Status</span>
                  </div>
                  <span style={{ background: '#fff8e1', color: '#b45309', fontSize: '11.5px', fontWeight: 800, padding: '4px 10px', borderRadius: '10px' }}>
                    🛵 Avg Speed: 22 mins
                  </span>
                </div>

                {/* Rider Fleet Breakdown Visual */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '8px 0' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', fontWeight: 800, marginBottom: '6px' }}>
                      <span>Active & In-Transit (Delivering Orders)</span>
                      <span style={{ color: '#2e7d32' }}>14 Riders (70%)</span>
                    </div>
                    <div style={{ width: '100%', height: '10px', background: '#e2e8f0', borderRadius: '5px', overflow: 'hidden' }}>
                      <div style={{ width: '70%', height: '100%', background: '#2e7d32', borderRadius: '5px' }}></div>
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', fontWeight: 800, marginBottom: '6px' }}>
                      <span>On-Duty & Available (Idle)</span>
                      <span style={{ color: '#0284c7' }}>4 Riders (20%)</span>
                    </div>
                    <div style={{ width: '100%', height: '10px', background: '#e2e8f0', borderRadius: '5px', overflow: 'hidden' }}>
                      <div style={{ width: '20%', height: '100%', background: '#0284c7', borderRadius: '5px' }}></div>
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', fontWeight: 800, marginBottom: '6px' }}>
                      <span>Pending Verification & Offline</span>
                      <span style={{ color: '#d97706' }}>2 Riders (10%)</span>
                    </div>
                    <div style={{ width: '100%', height: '10px', background: '#e2e8f0', borderRadius: '5px', overflow: 'hidden' }}>
                      <div style={{ width: '10%', height: '100%', background: '#d97706', borderRadius: '5px' }}></div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #e2e8f0', fontSize: '12px' }}>
                  <span style={{ color: '#64748b', fontWeight: 700 }}>Dispatch Response: <strong>4.2 mins</strong></span>
                  <span style={{ color: '#2e7d32', fontWeight: 800 }}>⭐ 4.9 Fleet Satisfaction</span>
                </div>
              </div>

              {/* GRAPH 3: NURSERY STALLS REVENUE DISTRIBUTION */}
              <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '17px', fontFamily: 'var(--font-serif)', margin: 0, color: '#1b4332' }}>
                      Top Nursery Stalls Revenue Breakdown
                    </h3>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>Platform Sales Contribution per Stall</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { name: 'Sai Baba Plant & Pot Stall', rev: '₹6,890', pct: '38%', col: '#1b4332' },
                    { name: 'Green Flora Roadside Nursery', rev: '₹4,250', pct: '23%', col: '#2d6a4f' },
                    { name: 'Balaji Premium Gardening Hub', rev: '₹3,900', pct: '21%', col: '#40916c' },
                    { name: 'Siri Indoor Plants & Seeds', rev: '₹2,450', pct: '14%', col: '#52b788' }
                  ].map((st, i) => (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 800, marginBottom: '4px' }}>
                        <span>{st.name}</span>
                        <span style={{ color: st.col }}>{st.rev} ({st.pct})</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: st.pct, height: '100%', background: st.col, borderRadius: '4px' }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* GRAPH 4: PRODUCT CATEGORY DEMAND SPLIT */}
              <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '17px', fontFamily: 'var(--font-serif)', margin: 0, color: '#1b4332' }}>
                      Category & Item Type Sales Share
                    </h3>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>Customer Order Category Demand</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { cat: 'Indoor Plants & Saplings', pct: '42%', col: '#1b4332' },
                    { cat: 'Pots & Terracotta Planters', pct: '28%', col: '#0284c7' },
                    { cat: 'Seeds & Organic Soil', pct: '18%', col: '#d97706' },
                    { cat: 'Fresh Flower Bouquets', pct: '12%', col: '#8b5cf6' }
                  ].map((ct, i) => (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 800, marginBottom: '4px' }}>
                        <span>{ct.cat}</span>
                        <span style={{ color: ct.col }}>{ct.pct} Demand</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: ct.pct, height: '100%', background: ct.col, borderRadius: '4px' }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* SYSTEM MICROSERVICES ARCHITECTURE CARD */}
            <div className="card">
              <h3 style={{ fontSize: '18px', fontFamily: 'var(--font-serif)', marginBottom: '12px', color: '#1b4332' }}>System Architecture & Micro-services</h3>
              <p style={{ fontSize: '13.5px', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
                Unified Monorepo API running on Port 5002 • Customer Marketplace (Port 5173) • Business Portal (Port 5174) • Super Admin Console (Port 5175). All micro-services active and synchronized.
              </p>
            </div>
          </div>
        )}

        {/* TAB 1: CATEGORY & ITEM TYPES MANAGEMENT */}
        {activeTab === 'categories' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* 1. PLATFORM ITEM TYPES (PRODUCT CLASSIFICATIONS) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', padding: '18px 24px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                <div>
                  <h3 style={{ fontSize: '18px', margin: 0, fontWeight: 800, color: '#1b4332', fontFamily: 'var(--font-serif)' }}>
                    Platform Item Types ({itemTypes.length})
                  </h3>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: '3px 0 0 0' }}>
                    Manage product classification dropdown options (Plant Saplings, Pots/Planters, Soil, Gardening Tools, Hydroponics, etc.)
                  </p>
                </div>
                <button 
                  onClick={() => setShowAddItemTypeModal(true)}
                  style={{ background: '#1b4332', color: '#ffffff', border: 'none', padding: '12px 22px', borderRadius: '12px', fontSize: '13px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(27,67,50,0.2)' }}
                >
                  + Add New Item Type
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '18px' }}>
                {itemTypes.map(it => (
                  <div key={it.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <span style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '11px', fontWeight: 800, padding: '4px 10px', borderRadius: '10px' }}>
                          ITEM TYPE CLASSIFICATION
                        </span>
                      </div>

                      <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#1b4332', margin: 0 }}>
                        {it.name}
                      </h4>
                      <p style={{ fontSize: '12.5px', color: '#64748b', marginTop: '6px', lineHeight: 1.5, minHeight: '36px' }}>
                        {it.description}
                      </p>
                    </div>

                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '14px', marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>
                        {products.filter(p => (p.type || '').toLowerCase() === (it.name || '').toLowerCase()).length} Active Products
                      </span>
                      
                      <button 
                        onClick={() => handleDeleteItemType(it.id)}
                        style={{ background: '#dc2626', color: '#ffffff', border: 'none', width: '34px', height: '34px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: '0 2px 6px rgba(220,38,38,0.2)' }}
                        title="Delete Item Type"
                      >
                        <DeleteIcon size={16} color="#ffffff" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. SEASONAL & BOTANICAL CATEGORIES */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', padding: '18px 24px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                <div>
                  <h3 style={{ fontSize: '18px', margin: 0, fontWeight: 800, color: '#1b4332', fontFamily: 'var(--font-serif)' }}>
                    Seasonal & Botanical Categories ({categories.length})
                  </h3>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: '3px 0 0 0' }}>
                    Manage seasonal plant collections (Spring Bloom, Summer Oasis, Monsoon Magic, Winter Wonders) & botanical categories
                  </p>
                </div>
                <button 
                  onClick={() => setShowAddCategoryModal(true)}
                  style={{ background: '#2d6a4f', color: '#ffffff', border: 'none', padding: '12px 22px', borderRadius: '12px', fontSize: '13px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(45,106,79,0.2)' }}
                >
                  + Add New Seasonal / Category
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '18px' }}>
                {categories.map(cat => (
                  <div key={cat.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <span style={{ background: '#e8f5e9', color: '#1b4332', fontSize: '11px', fontWeight: 800, padding: '4px 10px', borderRadius: '10px' }}>
                          {cat.seasonMonths || 'CATEGORY'}
                        </span>
                      </div>

                      <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#1b4332', margin: 0 }}>
                        {cat.name}
                      </h4>
                      <p style={{ fontSize: '12.5px', color: '#64748b', marginTop: '6px', lineHeight: 1.5, minHeight: '36px' }}>
                        {cat.description}
                      </p>
                    </div>

                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '14px', marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>
                        {products.filter(p => p.category === cat.name).length || cat.itemCount || 0} Listed Items
                      </span>
                      
                      <button 
                        onClick={() => handleDeleteCategory(cat.id)}
                        style={{ background: '#dc2626', color: '#ffffff', border: 'none', width: '34px', height: '34px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: '0 2px 6px rgba(220,38,38,0.2)' }}
                        title="Delete Category"
                      >
                        <DeleteIcon size={16} color="#ffffff" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: VENDORS MANAGER */}
        {activeTab === 'vendors' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', padding: '18px 24px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
              <div>
                <h3 style={{ fontSize: '18px', margin: 0, fontWeight: 800, color: '#1b4332', fontFamily: 'var(--font-serif)' }}>Registered Nursery Stalls ({vendors.length})</h3>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '3px 0 0 0' }}>Click on any nursery stall name or eye icon to inspect uploaded plants & pots</p>
              </div>
              <button 
                onClick={() => { setRegisterRoleTab('Vendor'); setShowRegisterVendorModal(true); }}
                style={{ background: '#1b4332', color: '#ffffff', border: 'none', padding: '12px 22px', borderRadius: '12px', fontSize: '13px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(27,67,50,0.2)' }}
              >
                Register New Nursery Stall
              </button>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead style={{ background: '#f8faf9', borderBottom: '2px solid #e2e8f0' }}>
                  <tr>
                    <th style={{ padding: '16px 20px', color: '#1b4332', fontWeight: 800 }}>Nursery Stall Name</th>
                    <th style={{ padding: '16px 20px', color: '#1b4332', fontWeight: 800 }}>Owner</th>
                    <th style={{ padding: '16px 20px', color: '#1b4332', fontWeight: 800 }}>Type</th>
                    <th style={{ padding: '16px 20px', color: '#1b4332', fontWeight: 800 }}>Rating</th>
                    <th style={{ padding: '16px 20px', color: '#1b4332', fontWeight: 800 }}>Status</th>
                    <th style={{ padding: '16px 20px', color: '#1b4332', fontWeight: 800, width: '200px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vendors.map((v) => {
                    const vendorItemCount = products.filter(p => p.vendorId === v.id || p.vendorName === v.name).length;
                    return (
                      <tr key={v.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}>
                        <td style={{ padding: '16px 20px' }}>
                          <div 
                            onClick={() => setSelectedVendorForCatalog(v)}
                            style={{ cursor: 'pointer' }}
                            title="Click to view uploaded plants, pots & items"
                          >
                            <strong style={{ fontSize: '14.5px', color: '#1b4332', textDecoration: 'underline', display: 'block' }}>
                              {v.name}
                            </strong>
                            <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '3px', fontWeight: 600 }}>
                              {vendorItemCount} Uploaded Items • Tap to Inspect
                            </span>
                          </div>
                        </td>

                        <td style={{ padding: '16px 20px', color: '#334155', fontWeight: 700 }}>{v.owner}</td>
                        <td style={{ padding: '16px 20px', color: '#64748b', fontSize: '13px' }}>{v.type}</td>
                        <td style={{ padding: '16px 20px', color: '#d97706', fontWeight: 800 }}>⭐ {v.rating}</td>
                        
                        <td style={{ padding: '16px 20px' }}>
                          <span style={{ 
                            background: v.isOpen ? '#e8f5e9' : '#fef2f2', 
                            color: v.isOpen ? '#1b4332' : '#dc2626', 
                            border: v.isOpen ? '1px solid #c8e6c9' : '1px solid #fee2e2', 
                            padding: '6px 14px', 
                            borderRadius: '12px', 
                            fontSize: '11.5px', 
                            fontWeight: 800,
                            whiteSpace: 'nowrap',
                            display: 'inline-block'
                          }}>
                            {v.isOpen ? 'ACTIVE SELLER' : 'DISABLED'}
                          </span>
                        </td>

                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            
                            {/* Direct Admin Login as Nursery Vendor Button */}
                            <button 
                              type="button"
                              onClick={() => handleAdminImpersonateLogin(v, 'Vendor')}
                              style={{ background: '#2563eb', color: '#ffffff', border: 'none', width: '36px', height: '36px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease', boxShadow: '0 2px 6px rgba(37,99,235,0.3)' }}
                              title={`Direct Admin Login as Nursery Vendor: ${v.name}`}
                            >
                              <UserLoginIcon size={17} color="#ffffff" />
                            </button>

                            <button 
                              onClick={() => setSelectedVendorForCatalog(v)}
                              style={{ background: '#1b4332', color: '#ffffff', border: 'none', width: '36px', height: '36px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease', boxShadow: '0 2px 6px rgba(27,67,50,0.2)' }}
                              title="View Catalog & Uploaded Items"
                            >
                              <ViewIcon size={17} color="#ffffff" />
                            </button>

                            <button 
                              onClick={() => handleOpenEditVendor(v)}
                              style={{ background: '#2d6a4f', color: '#ffffff', border: 'none', width: '36px', height: '36px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease', boxShadow: '0 2px 6px rgba(45,106,79,0.2)' }}
                              title="Edit Nursery Stall Details"
                            >
                              <EditIcon size={17} color="#ffffff" />
                            </button>

                            <button 
                              onClick={() => handleToggleVendorApproval(v.id)}
                              style={{ background: v.isOpen ? '#d97706' : '#16a34a', color: '#ffffff', border: 'none', width: '36px', height: '36px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}
                              title={v.isOpen ? "Disable Nursery Stall" : "Enable Nursery Stall"}
                            >
                              {v.isOpen ? <DisableIcon size={17} color="#ffffff" /> : <EnableIcon size={17} color="#ffffff" />}
                            </button>

                            <button 
                              onClick={() => setDeletingVendor(v)}
                              style={{ background: '#dc2626', color: '#ffffff', border: 'none', width: '36px', height: '36px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease', boxShadow: '0 2px 6px rgba(220,38,38,0.2)' }}
                              title="Delete Nursery Stall"
                            >
                              <DeleteIcon size={17} color="#ffffff" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: DELIVERY FLEET PARTNERS (VERIFICATION & ADMIN ADD RIDER) */}
        {activeTab === 'riders' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', padding: '18px 24px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
              <div>
                <h3 style={{ fontSize: '20px', fontFamily: 'var(--font-serif)', margin: 0, color: '#1b4332' }}>
                  Delivery Fleet Verification Console ({riders.length})
                </h3>
                <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', margin: 0 }}>
                  Verify Driving License, Aadhaar details, vehicle registration numbers, and issue rider credentials
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span style={{ 
                  background: riders.filter(r => r.status === 'PENDING_APPROVAL').length > 0 ? '#fff8e1' : '#f1f5f9', 
                  color: riders.filter(r => r.status === 'PENDING_APPROVAL').length > 0 ? '#b45309' : '#64748b', 
                  padding: '6px 14px', 
                  borderRadius: '12px', 
                  fontSize: '12px', 
                  fontWeight: 800 
                }}>
                  {riders.filter(r => r.status === 'PENDING_APPROVAL').length} Pending Approvals
                </span>

                <button 
                  onClick={() => setShowRegisterRiderModal(true)}
                  style={{ background: '#1b4332', color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: '12px', fontSize: '13px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 12px rgba(27,67,50,0.2)' }}
                >
                  Register Delivery Partner
                </button>
              </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead style={{ background: '#f8faf9', borderBottom: '2px solid #e2e8f0' }}>
                  <tr>
                    <th style={{ padding: '16px 20px', color: '#1b4332', fontWeight: 800 }}>Delivery Rider Details</th>
                    <th style={{ padding: '16px 20px', color: '#1b4332', fontWeight: 800 }}>Vehicle & Reg No.</th>
                    <th style={{ padding: '16px 20px', color: '#1b4332', fontWeight: 800 }}>Location Address</th>
                    <th style={{ padding: '16px 20px', color: '#1b4332', fontWeight: 800 }}>DL Number</th>
                    <th style={{ padding: '16px 20px', color: '#1b4332', fontWeight: 800 }}>Aadhaar Number</th>
                    <th style={{ padding: '16px 20px', color: '#1b4332', fontWeight: 800 }}>Status</th>
                    <th style={{ padding: '16px 20px', color: '#1b4332', fontWeight: 800, width: '220px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {riders.map((r) => (
                    <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}>
                      <td style={{ padding: '16px 20px' }}>
                        <strong style={{ fontSize: '14.5px', color: '#1b4332', display: 'block' }}>{r.name}</strong>
                        <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginTop: '2px' }}>{r.email} • {r.phone || 'N/A'}</span>
                      </td>

                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontWeight: 800, color: '#1b4332', fontSize: '13px' }}>{r.vehicle || 'N/A'}</div>
                        <span style={{ fontSize: '11px', color: '#b45309', background: '#fff8e1', padding: '2px 6px', borderRadius: '4px', fontWeight: 800, display: 'inline-block', marginTop: '2px' }}>
                          Reg: {r.vehicleNumber || 'N/A'}
                        </span>
                      </td>

                      <td style={{ padding: '16px 20px', color: '#334155', fontSize: '12.5px', maxWidth: '180px' }}>
                        {r.address || 'N/A'}
                      </td>

                      <td style={{ padding: '16px 20px', fontWeight: 800, color: '#1b4332', fontSize: '12.5px' }}>
                        {r.drivingLicense || 'N/A'}
                      </td>

                      <td style={{ padding: '16px 20px', color: '#64748b', fontSize: '12px', fontFamily: 'monospace' }}>
                        {r.aadhaar || 'N/A'}
                      </td>

                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ 
                          background: r.status === 'APPROVED' ? '#e8f5e9' : (r.status === 'DISABLED' || r.status === 'BLOCKED') ? '#fee2e2' : r.status === 'PENDING_APPROVAL' ? '#fff8e1' : '#fef2f2', 
                          color: r.status === 'APPROVED' ? '#1b4332' : (r.status === 'DISABLED' || r.status === 'BLOCKED') ? '#dc2626' : r.status === 'PENDING_APPROVAL' ? '#b45309' : '#dc2626', 
                          padding: '6px 14px', 
                          borderRadius: '12px', 
                          fontSize: '11.5px', 
                          fontWeight: 800 
                        }}>
                          {r.status}
                        </span>
                      </td>

                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          
                          {/* Direct Admin Login as Delivery Partner Button */}
                          <button 
                            type="button"
                            onClick={() => handleAdminImpersonateLogin(r, 'Delivery Partner')}
                            style={{ background: '#2563eb', color: '#ffffff', border: 'none', width: '34px', height: '34px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease', boxShadow: '0 2px 6px rgba(37,99,235,0.3)' }}
                            title={`Direct Admin Login as Delivery Partner: ${r.name}`}
                          >
                            <UserLoginIcon size={16} color="#ffffff" />
                          </button>

                          {/* View Verification Documents Modal Button */}
                          <button 
                            type="button"
                            onClick={() => setSelectedRiderForDocs(r)}
                            style={{ background: '#1b4332', color: '#fff', border: 'none', width: '34px', height: '34px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            title="Inspect Driving License & Aadhaar Documents"
                          >
                            <ViewIcon size={16} color="#ffffff" />
                          </button>

                          {/* Edit Rider Credentials & Info Button */}
                          <button 
                            type="button"
                            onClick={() => handleOpenEditRider(r)}
                            style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8', width: '34px', height: '34px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            title="Edit Partner Credentials & Details"
                          >
                            <EditIcon size={16} color="#1d4ed8" />
                          </button>

                          {/* Disable / Enable Toggle Button */}
                          {r.status === 'APPROVED' ? (
                            <button 
                              type="button"
                              onClick={() => handleUpdateRiderApproval(r.id, 'DISABLED')}
                              style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', width: '34px', height: '34px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                              title="Disable Partner Credentials (Block Login)"
                            >
                              <DisableIcon size={16} color="#dc2626" />
                            </button>
                          ) : (
                            <button 
                              type="button"
                              onClick={() => handleUpdateRiderApproval(r.id, 'APPROVED')}
                              style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', width: '34px', height: '34px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                              title="Enable / Approve Partner Credentials"
                            >
                              <EnableIcon size={16} color="#166534" />
                            </button>
                          )}

                          {/* Delete Delivery Partner Button */}
                          <button 
                            type="button"
                            onClick={() => handleDeleteRider(r.id)}
                            style={{ background: '#dc2626', color: '#fff', border: 'none', width: '34px', height: '34px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            title="Delete Delivery Partner Account"
                          >
                            <DeleteIcon size={16} color="#ffffff" />
                          </button>

                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: ORDERS STREAM */}
        {activeTab === 'orders' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {orders.map((o) => (
              <div key={o.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ fontSize: '16px', color: '#1b4332' }}>Order #{o.id}</strong>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>Date: {o.date} • Nursery: {o.vendorName || 'Sai Baba Stall'}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#1b4332' }}>₹{o.total}</div>
                  <span style={{ fontSize: '11px', color: '#0284c7', background: '#e0f2fe', padding: '2px 8px', borderRadius: '6px', fontWeight: 800 }}>Status: {o.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 5: PLATFORM SETTINGS & SUPER ADMIN PROFILE */}
        {activeTab === 'settings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px' }}>
            
            {/* 1. SUPER ADMIN ACCOUNT PROFILE DETAILS */}
            <div className="card" style={{ padding: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '22px', fontFamily: 'var(--font-serif)', margin: 0, color: '#1b4332' }}>
                    Super Administrator Profile Details
                  </h3>
                  <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', margin: 0 }}>
                    Master system controller credentials, login email, and system governance profile
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button 
                    onClick={() => setShowEditAdminProfileModal(true)}
                    style={{ background: '#1b4332', color: '#ffffff', border: 'none', padding: '9px 18px', borderRadius: '10px', fontSize: '12.5px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 2px 8px rgba(27,67,50,0.2)' }}
                  >
                    Edit Admin Details
                  </button>
                  <span style={{ background: '#ffb703', color: '#1b4332', padding: '6px 14px', borderRadius: '12px', fontSize: '11.5px', fontWeight: 800 }}>
                    VERIFIED ROOT ADMIN
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', fontSize: '13.5px' }}>
                <div style={{ background: '#f8faf9', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Administrator Full Name</span>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#1b4332', marginTop: '4px' }}>
                    {adminName}
                  </div>
                </div>

                <div style={{ background: '#f8faf9', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Email Address (Super Admin Login ID)</span>
                  <div style={{ fontSize: '14.5px', fontWeight: 700, color: '#334155', marginTop: '4px' }}>
                    {adminEmail}
                  </div>
                </div>

                <div style={{ background: '#f8faf9', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>System Phone Contact</span>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#334155', marginTop: '4px' }}>
                    {adminPhone}
                  </div>
                </div>

                <div style={{ background: '#f8faf9', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Platform Access Privilege</span>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#2d6a4f', marginTop: '4px' }}>
                    Super Operations Master Controller
                  </div>
                </div>
              </div>
            </div>

            {/* 2. PLATFORM FINANCIAL PARAMETERS */}
            <div className="card" style={{ padding: '32px' }}>
              <h3 style={{ fontSize: '20px', fontFamily: 'var(--font-serif)', marginBottom: '18px', color: '#1b4332' }}>Platform Financial & Governance Parameters</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', fontSize: '13.5px' }}>
                <div style={{ background: '#f8faf9', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 800, display: 'block' }}>MARKETPLACE COMMISSION</span>
                  <strong style={{ fontSize: '18px', color: '#1b4332', display: 'block', marginTop: '4px' }}>8.0% per order</strong>
                  <span style={{ fontSize: '11px', color: '#2e7d32' }}>92% Nursery Payout</span>
                </div>

                <div style={{ background: '#f8faf9', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 800, display: 'block' }}>DELIVERY SLA TARGET</span>
                  <strong style={{ fontSize: '18px', color: '#1b4332', display: 'block', marginTop: '4px' }}>30-45 minutes</strong>
                  <span style={{ fontSize: '11px', color: '#0284c7' }}>Hyperlocal express</span>
                </div>

                <div style={{ background: '#f8faf9', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 800, display: 'block' }}>RIDER BASE PAYOUT</span>
                  <strong style={{ fontSize: '18px', color: '#1b4332', display: 'block', marginTop: '4px' }}>₹55 + ₹10 Bonus</strong>
                  <span style={{ fontSize: '11px', color: '#d97706' }}>Plant care bonus</span>
                </div>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* ADMIN ADD DELIVERY FLEET RIDER MODAL */}
      {showAddRiderModal && (
        <div className="modal-backdrop-animated" style={{ position: 'fixed', inset: 0, background: 'rgba(27,67,50,0.7)', backdropFilter: 'blur(8px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="card modal-content-animated" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '24px', maxWidth: '560px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '32px', color: '#1b4332', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '20px', fontFamily: 'var(--font-serif)', margin: 0, color: '#1b4332' }}>
                  + Register Delivery Partner
                </h3>
                <p style={{ fontSize: '12.5px', color: '#64748b', margin: '4px 0 0 0' }}>
                  Issue rider credentials directly from Super Admin Console
                </p>
              </div>

              <button onClick={() => setShowAddRiderModal(false)} style={{ background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontSize: '16px', fontWeight: 800 }}>✕</button>
            </div>

            <form onSubmit={handleAdminRegisterRiderSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px', display: 'block' }}>Rider Full Name</label>
                  <input type="text" placeholder="e.g. Ramu Prasad" value={adminRiderName} onChange={(e) => setAdminRiderName(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px', display: 'block' }}>Email Address (Login ID)</label>
                  <input type="email" placeholder="rider@planto.in" value={adminRiderEmail} onChange={(e) => setAdminRiderEmail(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px', display: 'block' }}>Login Password</label>
                  <input type="text" value={adminRiderPassword} onChange={(e) => setAdminRiderPassword(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px', display: 'block' }}>Phone Contact</label>
                  <input type="tel" placeholder="+91 98450 11223" value={adminRiderPhone} onChange={(e) => setAdminRiderPhone(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px', display: 'block' }}>Location Address</label>
                <input type="text" placeholder="e.g. Indiranagar 100ft Road, Bengaluru" value={adminRiderAddress} onChange={(e) => setAdminRiderAddress(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px', display: 'block' }}>Vehicle Model</label>
                  <input type="text" placeholder="e.g. Hero Electric Scooter" value={adminRiderVehicle} onChange={(e) => setAdminRiderVehicle(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px', display: 'block' }}>Vehicle Reg Number</label>
                  <input type="text" placeholder="e.g. KA-05-EQ-8821" value={adminRiderVehicleNum} onChange={(e) => setAdminRiderVehicleNum(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px', display: 'block' }}>Driving License No.</label>
                  <input type="text" placeholder="KA-01-2023-0098412" value={adminRiderDlNum} onChange={(e) => setAdminRiderDlNum(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px', display: 'block' }}>Aadhaar Card No.</label>
                  <input type="text" placeholder="4812-9901-3412" value={adminRiderAadhaarNum} onChange={(e) => setAdminRiderAadhaarNum(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px', display: 'block' }}>Initial Account Approval Status</label>
                <select 
                  value={adminRiderStatus} 
                  onChange={(e) => setAdminRiderStatus(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 800 }}
                >
                  <option value="APPROVED">APPROVED (Enable Login Immediately)</option>
                  <option value="PENDING_APPROVAL">PENDING APPROVAL (Verification Required)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowAddRiderModal(false)} style={{ background: '#f1f5f9', color: '#64748b', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: 800, fontSize: '12px', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" style={{ background: '#1b4332', color: '#fff', border: 'none', padding: '10px 22px', borderRadius: '10px', fontWeight: 800, fontSize: '13px', cursor: 'pointer' }}>
                  Issue Credentials & Save Rider
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RIDER DOCUMENT VERIFICATION MODAL (Supports Both PDF & Images) */}
      {selectedRiderForDocs && (
        <div className="modal-backdrop-animated" style={{ position: 'fixed', inset: 0, background: 'rgba(27,67,50,0.7)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="card modal-content-animated" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '24px', maxWidth: '740px', width: '100%', padding: '28px', color: '#1b4332', boxShadow: '0 25px 60px rgba(0,0,0,0.3)', maxHeight: '90vh', overflowY: 'auto' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '20px', fontFamily: 'var(--font-serif)', margin: 0, color: '#1b4332' }}>
                  {selectedRiderForDocs.name} - Document Audit
                </h3>
                <p style={{ fontSize: '12.5px', color: '#64748b', margin: '4px 0 0 0' }}>
                  Registered: {selectedRiderForDocs.registeredAt} • Email: {selectedRiderForDocs.email} • Phone: {selectedRiderForDocs.phone}
                </p>
              </div>

              <button onClick={() => setSelectedRiderForDocs(null)} style={{ background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontSize: '16px', fontWeight: 800 }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '13px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ background: '#f8faf9', padding: '14px 16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Vehicle Model & Registration</span>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#1b4332', marginTop: '2px' }}>
                    {selectedRiderForDocs.vehicle || 'Hero Electric Scooter'}
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#d97706', marginTop: '2px' }}>
                    Reg: {selectedRiderForDocs.vehicleNumber || 'KA-05-EQ-8821'}
                  </div>
                </div>

                <div style={{ background: '#f8faf9', padding: '14px 16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Location Address</span>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#334155', marginTop: '2px' }}>
                    {selectedRiderForDocs.address}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', width: '100%' }}>
                
                {/* DL Document (PDF or Image) */}
                <div style={{ background: '#f8faf9', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', minWidth: 0, boxSizing: 'border-box' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Driving License</span>
                  <div style={{ fontSize: '14.5px', fontWeight: 800, color: '#1b4332', marginTop: '2px', marginBottom: '10px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {selectedRiderForDocs.drivingLicense}
                  </div>
                  
                  {selectedRiderForDocs.dlFileType?.includes('pdf') || selectedRiderForDocs.dlFileName?.endsWith('.pdf') || selectedRiderForDocs.dlDoc?.startsWith('data:application/pdf') ? (
                    <div style={{ minHeight: '150px', borderRadius: '12px', background: '#fef2f2', border: '1px solid #fca5a5', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', textAlign: 'center', width: '100%', boxSizing: 'border-box' }}>
                      <span style={{ background: '#dc2626', color: '#fff', fontSize: '11px', fontWeight: 800, padding: '4px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>PDF DOCUMENT</span>
                      <span style={{ fontSize: '11.5px', color: '#991b1b', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%', whiteSpace: 'nowrap', width: '100%' }}>
                        {selectedRiderForDocs.dlFileName || 'Driving_License.pdf'}
                      </span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
                        <button 
                          type="button"
                          onClick={() => handleOpenDocument(selectedRiderForDocs.dlDoc, selectedRiderForDocs.dlFileName)}
                          style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '7px 12px', borderRadius: '8px', fontSize: '11.5px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 2px 6px rgba(220,38,38,0.3)', width: '100%' }}
                        >
                          📄 Open PDF File
                        </button>
                        <button 
                          type="button"
                          onClick={() => handleDownloadDocument(selectedRiderForDocs.dlDoc, selectedRiderForDocs.dlFileName || `${selectedRiderForDocs.name}_DL.pdf`)}
                          style={{ background: '#1b4332', color: '#fff', border: 'none', padding: '7px 12px', borderRadius: '8px', fontSize: '11.5px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 2px 6px rgba(27,67,50,0.3)', width: '100%' }}
                        >
                          ⬇️ Download PDF File
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ height: '150px', borderRadius: '12px', overflow: 'hidden', background: '#e2e8f0', cursor: 'pointer' }} onClick={() => handleOpenDocument(selectedRiderForDocs.dlDoc, 'Driving_License')}>
                      <img src={selectedRiderForDocs.dlDoc} alt="Driving License" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                </div>

                {/* Aadhaar Document (PDF or Image) */}
                <div style={{ background: '#f8faf9', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', minWidth: 0, boxSizing: 'border-box' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Aadhaar Card</span>
                  <div style={{ fontSize: '14.5px', fontWeight: 800, color: '#1b4332', marginTop: '2px', marginBottom: '10px', fontFamily: 'monospace', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {selectedRiderForDocs.aadhaar}
                  </div>

                  {selectedRiderForDocs.aadhaarFileType?.includes('pdf') || selectedRiderForDocs.aadhaarFileName?.endsWith('.pdf') || selectedRiderForDocs.aadhaarDoc?.startsWith('data:application/pdf') ? (
                    <div style={{ minHeight: '150px', borderRadius: '12px', background: '#fef2f2', border: '1px solid #fca5a5', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', textAlign: 'center', width: '100%', boxSizing: 'border-box' }}>
                      <span style={{ background: '#dc2626', color: '#fff', fontSize: '11px', fontWeight: 800, padding: '4px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>PDF DOCUMENT</span>
                      <span style={{ fontSize: '11.5px', color: '#991b1b', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%', whiteSpace: 'nowrap', width: '100%' }}>
                        {selectedRiderForDocs.aadhaarFileName || 'Aadhaar_Card.pdf'}
                      </span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
                        <button 
                          type="button"
                          onClick={() => handleOpenDocument(selectedRiderForDocs.aadhaarDoc, selectedRiderForDocs.aadhaarFileName)}
                          style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '7px 12px', borderRadius: '8px', fontSize: '11.5px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 2px 6px rgba(220,38,38,0.3)', width: '100%' }}
                        >
                          📄 Open PDF File
                        </button>
                        <button 
                          type="button"
                          onClick={() => handleDownloadDocument(selectedRiderForDocs.aadhaarDoc, selectedRiderForDocs.aadhaarFileName || `${selectedRiderForDocs.name}_Aadhaar.pdf`)}
                          style={{ background: '#1b4332', color: '#fff', border: 'none', padding: '7px 12px', borderRadius: '8px', fontSize: '11.5px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 2px 6px rgba(27,67,50,0.3)', width: '100%' }}
                        >
                          ⬇️ Download PDF File
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ height: '150px', borderRadius: '12px', overflow: 'hidden', background: '#e2e8f0', cursor: 'pointer' }} onClick={() => handleOpenDocument(selectedRiderForDocs.aadhaarDoc, 'Aadhaar_Card')}>
                      <img src={selectedRiderForDocs.aadhaarDoc} alt="Aadhaar Card" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                </div>

              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                <div>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>Current Status: </span>
                  <span style={{ 
                    background: selectedRiderForDocs.status === 'APPROVED' ? '#e8f5e9' : (selectedRiderForDocs.status === 'DISABLED' || selectedRiderForDocs.status === 'BLOCKED') ? '#fee2e2' : selectedRiderForDocs.status === 'PENDING_APPROVAL' ? '#fff8e1' : '#fef2f2', 
                    color: selectedRiderForDocs.status === 'APPROVED' ? '#1b4332' : (selectedRiderForDocs.status === 'DISABLED' || selectedRiderForDocs.status === 'BLOCKED') ? '#dc2626' : selectedRiderForDocs.status === 'PENDING_APPROVAL' ? '#b45309' : '#dc2626', 
                    padding: '4px 10px', 
                    borderRadius: '8px', 
                    fontSize: '11.5px', 
                    fontWeight: 800 
                  }}>
                    {selectedRiderForDocs.status}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  {selectedRiderForDocs.status !== 'APPROVED' ? (
                    <button 
                      type="button"
                      onClick={() => handleUpdateRiderApproval(selectedRiderForDocs.id, 'APPROVED')}
                      style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '12px', fontWeight: 800, fontSize: '13px', cursor: 'pointer' }}
                    >
                      Approve Delivery Partner
                    </button>
                  ) : (
                    <button 
                      type="button"
                      onClick={() => handleUpdateRiderApproval(selectedRiderForDocs.id, 'DISABLED')}
                      style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '12px', fontWeight: 800, fontSize: '13px', cursor: 'pointer' }}
                    >
                      Disable Credentials (Block Login)
                    </button>
                  )}
                  {selectedRiderForDocs.status !== 'REJECTED' && selectedRiderForDocs.status !== 'DISABLED' && (
                    <button 
                      type="button"
                      onClick={() => handleUpdateRiderApproval(selectedRiderForDocs.id, 'REJECTED')}
                      style={{ background: '#64748b', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '12px', fontWeight: 800, fontSize: '13px', cursor: 'pointer' }}
                    >
                      Reject Application
                    </button>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* EDIT DELIVERY PARTNER CREDENTIALS MODAL */}
      {editingRider && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(27,67,50,0.7)', backdropFilter: 'blur(4px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '24px', maxWidth: '540px', width: '100%', padding: '28px', color: '#1b4332', boxShadow: '0 25px 60px rgba(0,0,0,0.3)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '20px', fontFamily: 'var(--font-serif)', margin: 0, color: '#1b4332' }}>
                  Edit Delivery Partner Credentials
                </h3>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
                  Update partner name, email, vehicle, license & block status
                </p>
              </div>
              <button type="button" onClick={() => setEditingRider(null)} style={{ background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontSize: '16px', fontWeight: 800 }}>✕</button>
            </div>

            <form onSubmit={handleSaveEditRiderSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#1b4332', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Full Name</label>
                  <input type="text" value={editRiderName} onChange={(e) => setEditRiderName(e.target.value)} required style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#1b4332', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Email Address (Login ID)</label>
                  <input type="email" value={editRiderEmail} onChange={(e) => setEditRiderEmail(e.target.value)} required style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#1b4332', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Phone Contact</label>
                  <input type="text" value={editRiderPhone} onChange={(e) => setEditRiderPhone(e.target.value)} required style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#1b4332', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Account Status</label>
                  <select value={editRiderStatus} onChange={(e) => setEditRiderStatus(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 800, color: editRiderStatus === 'APPROVED' ? '#166534' : editRiderStatus === 'DISABLED' ? '#dc2626' : '#b45309' }}>
                    <option value="APPROVED">APPROVED (Active Login)</option>
                    <option value="DISABLED">DISABLED (Blocked by Admin)</option>
                    <option value="PENDING_APPROVAL">PENDING APPROVAL</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#1b4332', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Vehicle Model</label>
                  <input type="text" value={editRiderVehicle} onChange={(e) => setEditRiderVehicle(e.target.value)} required style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#1b4332', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Vehicle Reg Number</label>
                  <input type="text" value={editRiderVehicleNum} onChange={(e) => setEditRiderVehicleNum(e.target.value)} required style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#1b4332', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Driving License No.</label>
                  <input type="text" value={editRiderDlNum} onChange={(e) => setEditRiderDlNum(e.target.value)} required style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#1b4332', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Aadhaar Card No.</label>
                  <input type="text" value={editRiderAadhaarNum} onChange={(e) => setEditRiderAadhaarNum(e.target.value)} required style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#1b4332', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Location Address</label>
                <input type="text" value={editRiderAddress} onChange={(e) => setEditRiderAddress(e.target.value)} required style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setEditingRider(null)} style={{ background: '#f1f5f9', color: '#64748b', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: 800, fontSize: '12px', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" style={{ background: '#1b4332', color: '#fff', border: 'none', padding: '10px 22px', borderRadius: '10px', fontWeight: 800, fontSize: '13px', cursor: 'pointer' }}>
                  Save Credentials →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VENDOR INVENTORY INSPECTOR MODAL */}
      {selectedVendorForCatalog && (() => {
        const selectedVendorProducts = products.filter(p => p.vendorId === selectedVendorForCatalog.id || p.vendorName === selectedVendorForCatalog.name);
        const filteredCatalogProducts = selectedVendorProducts.filter(p => {
          const matchSeasonal = inventorySeasonalFilter === 'All' || p.category === inventorySeasonalFilter || p.season === inventorySeasonalFilter;
          const matchType = inventoryTypeFilter === 'All' || (p.type && p.type.toLowerCase() === inventoryTypeFilter.toLowerCase()) || p.category === inventoryTypeFilter || (p.itemType && p.itemType.toLowerCase() === inventoryTypeFilter.toLowerCase());
          return matchSeasonal && matchType;
        });

        return (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(27,67,50,0.6)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '24px', maxWidth: '960px', width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.2)', color: '#1b4332' }}>
              <div style={{ padding: '24px 28px', borderBottom: '1px solid #e2e8f0', background: '#f8faf9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontFamily: 'var(--font-serif)', margin: 0, color: '#1b4332' }}>
                    {selectedVendorForCatalog.name}
                  </h2>
                  <p style={{ fontSize: '12.5px', color: '#64748b', margin: '3px 0 0 0' }}>
                    Owner: <strong>{selectedVendorForCatalog.owner}</strong> • Rating: ⭐ {selectedVendorForCatalog.rating} • Phone: {selectedVendorForCatalog.phone || '+91 98480 22334'}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button 
                    onClick={() => setShowAddProductModal(true)}
                    style={{ background: '#1b4332', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '12px', fontWeight: 800, fontSize: '12.5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    + Add Product for this Nursery
                  </button>
                  <button 
                    onClick={() => setSelectedVendorForCatalog(null)}
                    style={{ background: '#f1f5f9', color: '#64748b', border: 'none', width: '34px', height: '34px', borderRadius: '50%', cursor: 'pointer', fontSize: '16px', fontWeight: 800 }}
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* TWO SEPARATE FILTERS: SEASONAL & ITEM CATEGORY */}
              <div style={{ padding: '16px 28px', borderBottom: '1px solid #e2e8f0', background: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#1b4332' }}>
                  Showing {filteredCatalogProducts.length} items uploaded by {selectedVendorForCatalog.name}
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                  {/* FILTER 1: SEASONAL COLLECTIONS */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 800, color: '#1b4332' }}>Seasonal:</label>
                    <select
                      value={inventorySeasonalFilter}
                      onChange={(e) => setInventorySeasonalFilter(e.target.value)}
                      style={{
                        padding: '7px 12px',
                        borderRadius: '10px',
                        border: '2px solid #1b4332',
                        background: '#ffffff',
                        color: '#1b4332',
                        fontWeight: 800,
                        fontSize: '12.5px',
                        outline: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(27,67,50,0.1)'
                      }}
                    >
                      <option value="All">All Seasons</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* FILTER 2: ITEM CATEGORY / TYPE */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 800, color: '#1b4332' }}>Item Category:</label>
                    <select
                      value={inventoryTypeFilter}
                      onChange={(e) => setInventoryTypeFilter(e.target.value)}
                      style={{
                        padding: '7px 12px',
                        borderRadius: '10px',
                        border: '2px solid #2d6a4f',
                        background: '#ffffff',
                        color: '#1b4332',
                        fontWeight: 800,
                        fontSize: '12.5px',
                        outline: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(45,106,79,0.1)'
                      }}
                    >
                      <option value="All">All Categories / Types</option>
                      {itemTypes.map(it => (
                        <option key={it.id} value={it.name}>
                          {it.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1, background: '#f4f9f5' }}>
                {filteredCatalogProducts.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '50px 20px', color: '#64748b', background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                    <h4 style={{ fontSize: '18px', color: '#1b4332', margin: 0, fontFamily: 'var(--font-serif)' }}>No items found for selected filters</h4>
                    <p style={{ fontSize: '13px', marginTop: '6px' }}>Try switching filters or click '+ Add Product for this Nursery'!</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                    {filteredCatalogProducts.map(item => (
                      <div key={item.id} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                        <div style={{ position: 'relative', borderRadius: '14px', overflow: 'hidden', height: '140px', background: '#f8faf9', marginBottom: '12px' }}>
                          <img src={getImageSrc(item)} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <span style={{ position: 'absolute', top: '8px', left: '8px', background: '#1b4332', color: '#fff', fontSize: '10px', fontWeight: 800, padding: '3px 8px', borderRadius: '6px' }}>
                            {item.category}
                          </span>
                        </div>

                        <div>
                          <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#1b4332', margin: 0, height: '38px', overflow: 'hidden', lineHeight: '1.3' }}>
                            {item.name}
                          </h4>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                            <strong style={{ fontSize: '17px', color: '#1b4332' }}>₹{item.price}</strong>
                            <span style={{ fontSize: '11px', color: '#2d6a4f', background: '#e8f5e9', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
                              Stock: <strong>{item.quantity}</strong>
                            </span>
                          </div>
                        </div>

                        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px', marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '11px', color: '#d97706', fontWeight: 700 }}>⭐ {item.rating || 4.8}</span>
                          <button 
                            onClick={() => handleDeleteProductFromAdmin(item.id)}
                            style={{ 
                              background: '#dc2626', 
                              color: '#ffffff', 
                              border: 'none', 
                              width: '34px', 
                              height: '34px', 
                              borderRadius: '10px', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justify: 'center', 
                              cursor: 'pointer', 
                              transition: 'all 0.2s ease', 
                              boxShadow: '0 2px 6px rgba(220,38,38,0.3)' 
                            }}
                            title="Delete Item"
                          >
                            <DeleteIcon size={16} color="#ffffff" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ padding: '16px 28px', borderTop: '1px solid #e2e8f0', background: '#ffffff', textAlign: 'right' }}>
                <button 
                  onClick={() => setSelectedVendorForCatalog(null)}
                  style={{ background: '#1b4332', color: '#fff', border: 'none', padding: '10px 22px', borderRadius: '12px', fontWeight: 800, fontSize: '13px', cursor: 'pointer' }}
                >
                  Close Inspector
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* EDIT VENDOR MODAL */}
      {editingVendor && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(27,67,50,0.6)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '24px', maxWidth: '500px', width: '100%', padding: '28px', color: '#1b4332', boxShadow: '0 25px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontFamily: 'var(--font-serif)', margin: 0, color: '#1b4332', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <EditIcon size={20} color="#1b4332" /> Edit Nursery Stall Info
              </h3>
              <button onClick={() => setEditingVendor(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '18px' }}>✕</button>
            </div>

            <form onSubmit={handleSaveEditVendor} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Nursery Stall Name</label>
                <input 
                  type="text" 
                  value={editName} 
                  onChange={(e) => setEditName(e.target.value)} 
                  required 
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Owner / Manager Name</label>
                <input 
                  type="text" 
                  value={editOwner} 
                  onChange={(e) => setEditOwner(e.target.value)} 
                  required 
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Seller Category</label>
                  <select 
                    value={editType} 
                    onChange={(e) => setEditType(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                  >
                    <option value="Roadside Seller">Roadside Seller</option>
                    <option value="Verified Vendor">Verified Vendor</option>
                    <option value="Pottery Specialist">Pottery Specialist</option>
                    <option value="Flower Florist">Flower Florist</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Rating (⭐)</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    min="1" 
                    max="5"
                    value={editRating} 
                    onChange={(e) => setEditRating(e.target.value)} 
                    required 
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Phone Contact</label>
                <input 
                  type="text" 
                  value={editPhone} 
                  onChange={(e) => setEditPhone(e.target.value)} 
                  required 
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Stall Location Address</label>
                <input 
                  type="text" 
                  value={editAddress} 
                  onChange={(e) => setEditAddress(e.target.value)} 
                  required 
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setEditingVendor(null)} style={{ background: '#f1f5f9', color: '#64748b', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: 800, fontSize: '12px', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" style={{ background: '#1b4332', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: 800, fontSize: '12px', cursor: 'pointer' }}>
                  Save Nursery Info
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REGISTER NEW VENDOR / DELIVERY PARTNER MODAL (DEDICATED ROLE CONTEXT & NEAT FILE UPLOAD BOXES) */}
      {showRegisterVendorModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(27,67,50,0.6)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '24px', maxWidth: '520px', width: '100%', padding: '28px', color: '#1b4332', boxShadow: '0 25px 60px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0' }}>
              <div>
                <h3 style={{ fontSize: '20px', fontFamily: 'var(--font-serif)', margin: 0, color: '#1b4332' }}>
                  {registerRoleTab === 'Vendor' ? 'Register Nursery Stall' : 'Register Delivery Partner'}
                </h3>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                  {registerRoleTab === 'Vendor' ? 'Create new verified nursery stall account' : 'Register and verify new express delivery partner'}
                </span>
              </div>
              <button onClick={() => setShowRegisterVendorModal(false)} style={{ background: '#f1f5f9', border: 'none', color: '#64748b', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontSize: '16px', fontWeight: 800 }}>✕</button>
            </div>

            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {registerRoleTab === 'Vendor' ? (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '12px', color: '#1b4332', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Full Name</label>
                      <input 
                        type="text" 
                        value={regVendorOwner} 
                        onChange={(e) => setRegVendorOwner(e.target.value)} 
                        placeholder="e.g. Suresh Rao"
                        required 
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '12px', color: '#1b4332', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Email Address</label>
                      <input 
                        type="email" 
                        value={regVendorEmail} 
                        onChange={(e) => setRegVendorEmail(e.target.value)} 
                        placeholder="owner@nursery.com"
                        required 
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '12px', color: '#1b4332', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Create Password</label>
                      <input 
                        type="password" 
                        value={regVendorPassword} 
                        onChange={(e) => setRegVendorPassword(e.target.value)} 
                        placeholder="Min 6 characters"
                        required 
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '12px', color: '#1b4332', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Phone Number</label>
                      <input 
                        type="text" 
                        value={regVendorPhone} 
                        onChange={(e) => setRegVendorPhone(e.target.value)} 
                        placeholder="+91 98480 22334"
                        required 
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', color: '#1b4332', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Location Address (Street, Area, City)</label>
                    <input 
                      type="text" 
                      value={regVendorAddress} 
                      onChange={(e) => setRegVendorAddress(e.target.value)} 
                      placeholder="e.g. #124, 100ft Road, Indiranagar, Bengaluru"
                      required 
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', color: '#1b4332', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Nursery Stall Name</label>
                    <input 
                      type="text" 
                      value={regVendorName} 
                      onChange={(e) => setRegVendorName(e.target.value)} 
                      placeholder="e.g. Sai Baba Plant & Pot Stall"
                      required 
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '12px', color: '#1b4332', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Rider Full Name</label>
                      <input 
                        type="text" 
                        value={regRiderName} 
                        onChange={(e) => setRegRiderName(e.target.value)} 
                        placeholder="e.g. Ramu Prasad"
                        required 
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '12px', color: '#1b4332', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Email Address (Login ID)</label>
                      <input 
                        type="email" 
                        value={regRiderEmail} 
                        onChange={(e) => setRegRiderEmail(e.target.value)} 
                        placeholder="rider@planto.in"
                        required 
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '12px', color: '#1b4332', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Login Password</label>
                      <input 
                        type="password" 
                        value={regRiderPassword} 
                        onChange={(e) => setRegRiderPassword(e.target.value)} 
                        placeholder="rider123"
                        required 
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '12px', color: '#1b4332', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Phone Contact</label>
                      <input 
                        type="text" 
                        value={regRiderPhone} 
                        onChange={(e) => setRegRiderPhone(e.target.value)} 
                        placeholder="+91 98450 11223"
                        required 
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', color: '#1b4332', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Location Address</label>
                    <input 
                      type="text" 
                      value={regRiderAddress} 
                      onChange={(e) => setRegRiderAddress(e.target.value)} 
                      placeholder="e.g. Indiranagar 100ft Road, Bengaluru"
                      required 
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '12px', color: '#1b4332', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Vehicle Model</label>
                      <input 
                        type="text" 
                        value={regRiderVehicle} 
                        onChange={(e) => setRegRiderVehicle(e.target.value)} 
                        placeholder="Hero Electric Scooter"
                        required 
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '12px', color: '#1b4332', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Vehicle Reg Number</label>
                      <input 
                        type="text" 
                        value={regRiderVehicleNum} 
                        onChange={(e) => setRegRiderVehicleNum(e.target.value)} 
                        placeholder="e.g. KA-05-EQ-8821"
                        required 
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '12px', color: '#1b4332', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Driving License No.</label>
                      <input 
                        type="text" 
                        value={regRiderDlNum} 
                        onChange={(e) => setRegRiderDlNum(e.target.value)} 
                        placeholder="KA 01 2023 0098412"
                        required 
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '12px', color: '#1b4332', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Aadhaar Card No.</label>
                      <input 
                        type="text" 
                        value={regRiderAadhaarNum} 
                        onChange={(e) => setRegRiderAadhaarNum(e.target.value)} 
                        placeholder="4812-9901-3412"
                        required 
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                      />
                    </div>
                  </div>

                  {/* Driving License Document File Upload Zone */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#1b4332', display: 'block' }}>Driving License Document File (PDF or Image)</label>
                    {regDlDoc ? (
                      <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px 16px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                          {dlFileType?.includes('pdf') || dlFileName?.endsWith('.pdf') ? (
                            <div style={{ background: '#ef4444', color: '#fff', fontSize: '11px', fontWeight: 800, padding: '6px 10px', borderRadius: '6px' }}>PDF</div>
                          ) : (
                            <img src={regDlDoc} alt="DL Preview" style={{ width: '38px', height: '38px', borderRadius: '8px', objectFit: 'cover' }} />
                          )}
                          <div style={{ overflow: 'hidden' }}>
                            <strong style={{ fontSize: '12.5px', color: '#166534', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{dlFileName || 'Driving_License_Document'}</strong>
                            <span style={{ fontSize: '11px', color: '#15803d', fontWeight: 600 }}>File Uploaded & Verified</span>
                          </div>
                        </div>
                        <button type="button" onClick={() => { setRegDlDoc(''); setDlFileName(''); setDlFileType(''); }} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 800, cursor: 'pointer' }}>
                          Remove
                        </button>
                      </div>
                    ) : (
                      <label style={{ 
                        border: '2px dashed #a7f3d0', 
                        borderRadius: '16px', 
                        padding: '16px 20px', 
                        background: '#f4fbf7', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: '8px', 
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                      }}>
                        <input type="file" accept="image/*,application/pdf" onChange={(e) => handleAdminRiderDocUpload(e, 'dl')} style={{ display: 'none' }} />
                        <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1b4332" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                          </svg>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#1b4332', display: 'block' }}>Upload Driving License Document</span>
                          <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 600 }}>Supports PDF, JPG, PNG & WEBP (Max 10MB)</span>
                        </div>
                      </label>
                    )}
                  </div>

                  {/* Aadhaar Card Document File Upload Zone */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#1b4332', display: 'block' }}>Aadhaar Card Document File (PDF or Image)</label>
                    {regAadhaarDoc ? (
                      <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px 16px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                          {aadhaarFileType?.includes('pdf') || aadhaarFileName?.endsWith('.pdf') ? (
                            <div style={{ background: '#ef4444', color: '#fff', fontSize: '11px', fontWeight: 800, padding: '6px 10px', borderRadius: '6px' }}>PDF</div>
                          ) : (
                            <img src={regAadhaarDoc} alt="Aadhaar Preview" style={{ width: '38px', height: '38px', borderRadius: '8px', objectFit: 'cover' }} />
                          )}
                          <div style={{ overflow: 'hidden' }}>
                            <strong style={{ fontSize: '12.5px', color: '#166534', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{aadhaarFileName || 'Aadhaar_Card_Document'}</strong>
                            <span style={{ fontSize: '11px', color: '#15803d', fontWeight: 600 }}>File Uploaded & Verified</span>
                          </div>
                        </div>
                        <button type="button" onClick={() => { setRegAadhaarDoc(''); setAadhaarFileName(''); setAadhaarFileType(''); }} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 800, cursor: 'pointer' }}>
                          Remove
                        </button>
                      </div>
                    ) : (
                      <label style={{ 
                        border: '2px dashed #a7f3d0', 
                        borderRadius: '16px', 
                        padding: '16px 20px', 
                        background: '#f4fbf7', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: '8px', 
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                      }}>
                        <input type="file" accept="image/*,application/pdf" onChange={(e) => handleAdminRiderDocUpload(e, 'aadhaar')} style={{ display: 'none' }} />
                        <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1b4332" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                          </svg>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#1b4332', display: 'block' }}>Upload Aadhaar Document</span>
                          <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 600 }}>Supports PDF, JPG, PNG & WEBP (Max 10MB)</span>
                        </div>
                      </label>
                    )}
                  </div>
                </>
              )}

              <div style={{ marginTop: '10px' }}>
                <button 
                  type="submit" 
                  style={{ 
                    width: '100%', 
                    background: '#ffb703', 
                    color: '#000000', 
                    border: 'none', 
                    padding: '14px', 
                    borderRadius: '12px', 
                    fontWeight: 800, 
                    fontSize: '14px', 
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(255,183,3,0.3)',
                    transition: 'transform 0.2s ease'
                  }}
                >
                  Complete Registration →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE VENDOR MODAL */}
      {deletingVendor && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(27,67,50,0.6)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#ffffff', border: '1px solid #fee2e2', borderRadius: '24px', maxWidth: '440px', width: '100%', padding: '28px', color: '#1b4332', textAlign: 'center', boxShadow: '0 25px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
              <DeleteIcon size={24} color="#dc2626" />
            </div>
            <h3 style={{ fontSize: '18px', fontFamily: 'var(--font-serif)', margin: '0 0 8px 0', color: '#1b4332' }}>
              Delete Nursery Stall?
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5, margin: '0 0 24px 0' }}>
              Are you sure you want to permanently delete <strong>{deletingVendor.name}</strong>? This action will also delete all associated plants, pots, and products from the platform.
            </p>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button 
                onClick={() => setDeletingVendor(null)}
                style={{ flex: 1, background: '#f1f5f9', color: '#64748b', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 800, fontSize: '13px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmDeleteVendor}
                style={{ flex: 1, background: '#dc2626', color: '#fff', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 800, fontSize: '13px', cursor: 'pointer' }}
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD PRODUCT TO VENDOR MODAL */}
      {showAddProductModal && selectedVendorForCatalog && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(27,67,50,0.7)', backdropFilter: 'blur(4px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '24px', maxWidth: '480px', width: '100%', padding: '28px', color: '#1b4332', boxShadow: '0 25px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontFamily: 'var(--font-serif)', margin: 0, color: '#1b4332' }}>
                Upload Product for {selectedVendorForCatalog.name}
              </h3>
              <button onClick={() => setShowAddProductModal(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '18px' }}>✕</button>
            </div>

            <form onSubmit={handleAddProductToVendorSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Product Title</label>
                <input 
                  type="text" 
                  value={newProdName} 
                  onChange={(e) => setNewProdName(e.target.value)} 
                  placeholder="e.g. Handmade Terracotta Planter 8-Inch"
                  required 
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Category (Seasonal)</label>
                  <select 
                    value={newProdCategory} 
                    onChange={(e) => setNewProdCategory(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Item Type</label>
                  <select 
                    value={newProdType} 
                    onChange={(e) => setNewProdType(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                  >
                    {itemTypes.map(it => (
                      <option key={it.id} value={it.name}>{it.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Price (₹)</label>
                  <input 
                    type="number" 
                    value={newProdPrice} 
                    onChange={(e) => setNewProdPrice(e.target.value)} 
                    required 
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Initial Stock Quantity</label>
                  <input 
                    type="number" 
                    value={newProdStock} 
                    onChange={(e) => setNewProdStock(e.target.value)} 
                    required 
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
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
                    onClick={() => setShowAdminUrlInput(!showAdminUrlInput)} 
                    style={{ background: 'none', border: 'none', color: '#2d6a4f', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    {showAdminUrlInput ? 'Hide URL Input' : '+ Paste Image / Video URL'}
                  </button>
                </div>

                {/* Hidden File Input strictly accepting images and videos */}
                <input 
                  type="file" 
                  id="admin-media-upload" 
                  accept="image/*,video/*" 
                  multiple 
                  onChange={handleAdminMediaFileUpload} 
                  style={{ display: 'none' }} 
                />

                {/* Drag-and-drop / Browse Box */}
                <label 
                  htmlFor="admin-media-upload"
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
                {showAdminUrlInput && (
                  <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
                    <input 
                      type="url" 
                      value={adminMediaUrlInput} 
                      onChange={(e) => setAdminMediaUrlInput(e.target.value)} 
                      placeholder="Paste image or video URL (https://...)" 
                      style={{ flex: 1, padding: '9px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
                    />
                    <button 
                      type="button" 
                      onClick={() => {
                        if (adminMediaUrlInput.trim()) {
                          const isVid = adminMediaUrlInput.includes('.mp4') || adminMediaUrlInput.includes('.webm') || adminMediaUrlInput.includes('video');
                          setUploadedAdminMedia(prev => [...prev, { url: adminMediaUrlInput.trim(), type: isVid ? 'video' : 'image', name: 'Web Link' }]);
                          setAdminMediaUrlInput('');
                        }
                      }}
                      style={{ background: '#1b4332', color: '#fff', border: 'none', padding: '0 16px', borderRadius: '10px', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}
                    >
                      Add
                    </button>
                  </div>
                )}

                {/* Uploaded Media Thumbnails / Chips */}
                {uploadedAdminMedia.length > 0 && (
                  <div style={{ marginTop: '14px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>
                      Selected Files ({uploadedAdminMedia.length})
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(85px, 1fr))', gap: '10px' }}>
                      {uploadedAdminMedia.map((m, idx) => (
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
                            onClick={() => handleRemoveAdminMedia(idx)} 
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
                  Upload to Vendor Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD CATEGORY MODAL */}
      {showAddCategoryModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(27,67,50,0.7)', backdropFilter: 'blur(4px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '24px', maxWidth: '480px', width: '100%', padding: '28px', color: '#1b4332', boxShadow: '0 25px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontFamily: 'var(--font-serif)', margin: 0, color: '#1b4332' }}>
                Add New Seasonal / Botanical Category
              </h3>
              <button onClick={() => setShowAddCategoryModal(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '18px' }}>✕</button>
            </div>

            <form onSubmit={handleAddCategorySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Category Name</label>
                <input 
                  type="text" 
                  value={catName} 
                  onChange={(e) => setCatName(e.target.value)} 
                  placeholder="e.g. Spring Bloom or Autumn Foliage"
                  required 
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Category Description</label>
                <textarea 
                  value={catDescription} 
                  onChange={(e) => setCatDescription(e.target.value)} 
                  placeholder="Describe items listed under this category..."
                  rows={3}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowAddCategoryModal(false)} style={{ background: '#f1f5f9', color: '#64748b', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: 800, fontSize: '12px', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" style={{ background: '#1b4332', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: 800, fontSize: '12px', cursor: 'pointer' }}>
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD ITEM TYPE MODAL */}
      {showAddItemTypeModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(27,67,50,0.7)', backdropFilter: 'blur(4px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '24px', maxWidth: '480px', width: '100%', padding: '28px', color: '#1b4332', boxShadow: '0 25px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontFamily: 'var(--font-serif)', margin: 0, color: '#1b4332' }}>
                Add New Item Type Classification
              </h3>
              <button onClick={() => setShowAddItemTypeModal(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '18px' }}>✕</button>
            </div>

            <form onSubmit={handleAddItemTypeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Item Type Name</label>
                <input 
                  type="text" 
                  value={itemTypeName} 
                  onChange={(e) => setItemTypeName(e.target.value)} 
                  placeholder="e.g. Hydroponic Kits or Succulents"
                  required 
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Item Type Description</label>
                <textarea 
                  value={itemTypeDescription} 
                  onChange={(e) => setItemTypeDescription(e.target.value)} 
                  placeholder="Describe this product classification..."
                  rows={3}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowAddItemTypeModal(false)} style={{ background: '#f1f5f9', color: '#64748b', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: 800, fontSize: '12px', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" style={{ background: '#1b4332', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: 800, fontSize: '12px', cursor: 'pointer' }}>
                  Create Item Type
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT SUPER ADMIN PROFILE MODAL */}
      {showEditAdminProfileModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(27,67,50,0.7)', backdropFilter: 'blur(4px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '24px', maxWidth: '500px', width: '100%', padding: '28px', color: '#1b4332', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px' }}>
              <h3 style={{ fontSize: '18px', fontFamily: 'var(--font-serif)', margin: 0, color: '#1b4332' }}>
                Edit Super Admin Details
              </h3>
              <button onClick={() => setShowEditAdminProfileModal(false)} style={{ background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontSize: '16px', fontWeight: 800 }}>✕</button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); setShowEditAdminProfileModal(false); alert('🎉 Super Admin Profile Details Updated!'); }} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Administrator Full Name</label>
                <input type="text" value={adminName} onChange={(e) => setAdminName(e.target.value)} required style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Email Address (Login ID)</label>
                <input type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} required style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, marginBottom: '4px', display: 'block' }}>System Phone Contact</label>
                <input type="text" value={adminPhone} onChange={(e) => setAdminPhone(e.target.value)} required style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Password</label>
                <input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} required style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowEditAdminProfileModal(false)} style={{ background: '#f1f5f9', color: '#64748b', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: 800, fontSize: '12px', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" style={{ background: '#1b4332', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: 800, fontSize: '12px', cursor: 'pointer' }}>
                  Save Profile Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
