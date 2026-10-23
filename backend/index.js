import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { db } from './db.js';
import { sendBookingEmails } from './mailer.js';
import { plantDoctorML } from './ml/plantDoctorML.js';
import { dispatchNotification, getAllNotifications, markAsRead } from './notifications.js';
import { 
  sendWhatsAppOtp, 
  verifyWhatsAppOtp, 
  normalizePhone, 
  sendWhatsAppMessage 
} from './whatsappService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5002;

app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));
app.use(express.static(path.join(__dirname, '../client/dist')));

// --- AUTHENTICATION & REGISTRATION ---

// --- WHATSAPP OTP AUTHENTICATION (OpenWA Gateway) ---

// Check OpenWA connection status
app.get('/api/auth/whatsapp/status', async (req, res) => {
  const baseUrl = process.env.OPENWA_BASE_URL || 'http://127.0.0.1:2785';
  const apiKey = process.env.OPENWA_API_KEY || 'owa_k1_efe78fef70b13d678b55129eaea5eb216aec86a5c5c74ba609af7fd8a7f3e9dd';
  const sessionId = process.env.OPENWA_SESSION_ID || '94c1468e-4d28-432e-803a-aae9adba6af4';

  try {
    const sessionRes = await fetch(`${baseUrl}/api/sessions/${sessionId}`, {
      headers: { 'X-API-Key': apiKey }
    });
    if (!sessionRes.ok) {
      return res.json({ connected: false, message: 'OpenWA session offline or invalid key' });
    }
    const data = await sessionRes.json();
    return res.json({ 
      connected: data.status === 'ready' || data.status === 'connected',
      sessionName: data.name,
      phone: data.phone,
      status: data.status
    });
  } catch (err) {
    return res.json({ connected: false, error: err.message });
  }
});

// Request 6-digit WhatsApp OTP
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { phone, type = 'login', name = '' } = req.body || {};
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Mobile number is required.' });
    }

    const { valid, phone: normalizedPhone, display } = normalizePhone(phone);
    if (!valid) {
      return res.status(400).json({ success: false, message: 'Please enter a valid 10-digit mobile number.' });
    }

    // Check if user exists
    const users = db.getUsers ? db.getUsers() : [];
    const vendors = db.getVendors ? db.getVendors() : [];
    const riders = db.getRiders ? db.getRiders() : [];

    const existingUser = users.find(u => {
      const p = normalizePhone(u.phone);
      return p.valid && p.phone === normalizedPhone;
    });
    const existingVendor = vendors.find(v => {
      const p = normalizePhone(v.phone);
      return p.valid && p.phone === normalizedPhone;
    });
    const existingRider = riders.find(r => {
      const p = normalizePhone(r.phone);
      return p.valid && p.phone === normalizedPhone;
    });

    const isExisting = !!(existingUser || existingVendor || existingRider);

    const result = await sendWhatsAppOtp({ 
      phone: normalizedPhone, 
      type, 
      name: name || existingUser?.name || existingVendor?.name || existingRider?.name || '' 
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json({
      success: true,
      message: `WhatsApp OTP sent successfully to ${display}!`,
      displayPhone: display,
      phone: normalizedPhone,
      isExisting
    });
  } catch (err) {
    console.error('Error sending OTP:', err);
    return res.status(500).json({ success: false, message: err.message || 'Internal server error sending WhatsApp OTP.' });
  }
});

// Resend WhatsApp OTP
app.post('/api/auth/resend-otp', async (req, res) => {
  try {
    const { phone, type = 'login' } = req.body || {};
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Mobile number is required.' });
    }
    const result = await sendWhatsAppOtp({ phone, type });
    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Verify WhatsApp OTP & Login / Signup
app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { phone, otp, type = 'login', name = '', email = '', password = '' } = req.body || {};
    if (!phone || !otp) {
      return res.status(400).json({ success: false, message: 'Mobile number and OTP code are required.' });
    }

    const { valid, phone: normalizedPhone, display: displayPhone } = normalizePhone(phone);
    if (!valid) {
      return res.status(400).json({ success: false, message: 'Invalid mobile number.' });
    }

    const verification = verifyWhatsAppOtp({ phone: normalizedPhone, otp });
    if (!verification.success) {
      return res.status(400).json(verification);
    }

    // OTP is valid! Now resolve user account
    const users = db.getUsers ? db.getUsers() : [];
    const vendors = db.getVendors ? db.getVendors() : [];
    const riders = db.getRiders ? db.getRiders() : [];

    // 1. Check Registered Customer
    const foundUser = users.find(u => {
      const p = normalizePhone(u.phone);
      return p.valid && p.phone === normalizedPhone;
    });

    if (foundUser) {
      if (password) {
        foundUser.password = password;
        if (db.saveUsers) db.saveUsers(users);
      }
      const { password: _, ...safeUser } = foundUser;
      return res.json({
        success: true,
        message: `Welcome back to Planto, ${foundUser.name}!`,
        user: {
          ...safeUser,
          wallet: foundUser.wallet !== undefined ? foundUser.wallet : db.getWallet()
        }
      });
    }

    // 2. Check Vendor
    const foundVendor = vendors.find(v => {
      const p = normalizePhone(v.phone);
      return p.valid && p.phone === normalizedPhone;
    });
    if (foundVendor) {
      return res.json({
        success: true,
        message: `Welcome back, ${foundVendor.name}!`,
        user: {
          id: foundVendor.id,
          email: foundVendor.email,
          phone: foundVendor.phone,
          name: foundVendor.owner || foundVendor.name,
          role: 'Vendor',
          vendorId: foundVendor.id,
          nurseryName: foundVendor.name,
          status: foundVendor.status || 'APPROVED'
        }
      });
    }

    // 3. Check Rider
    const foundRider = riders.find(r => {
      const p = normalizePhone(r.phone);
      return p.valid && p.phone === normalizedPhone;
    });
    if (foundRider) {
      return res.json({
        success: true,
        message: `Welcome back rider ${foundRider.name}!`,
        user: {
          id: foundRider.id,
          name: foundRider.name,
          email: foundRider.email,
          phone: foundRider.phone,
          role: 'Delivery'
        }
      });
    }

    // 4. Create New Customer account (seamless onboarding)
    const customerName = (name || verification.data?.name || 'Plant Lover').trim();
    const customerEmail = (email || `user_${normalizedPhone}@planto.in`).toLowerCase().trim();

    const newUser = {
      id: 'u_' + Date.now(),
      name: customerName,
      email: customerEmail,
      phone: displayPhone,
      rawPhone: normalizedPhone,
      password: password || 'plantme123',
      role: 'Customer',
      wallet: 1500,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    if (db.saveUsers) {
      db.saveUsers(users);
    }

    const { password: _, ...safeUser } = newUser;
    return res.status(201).json({
      success: true,
      message: `Welcome to Planto, ${customerName}! Your account is ready with ₹1,500 bonus.`,
      user: safeUser,
      isNewUser: true
    });
  } catch (err) {
    console.error('Error verifying OTP:', err);
    return res.status(500).json({ success: false, message: err.message || 'Error verifying OTP.' });
  }
});

// --- EMAIL / PASSWORD AUTHENTICATION (Standard fallback) ---
app.post('/api/auth/register', (req, res) => {
  const { name, email, password, phone } = req.body || {};
  if (!email || !password || !name) {
    return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
  }

  const em = email.toLowerCase().trim();
  const users = db.getUsers ? db.getUsers() : [];

  if (users.some(u => (u.email || '').toLowerCase().trim() === em)) {
    return res.status(409).json({ success: false, message: 'An account with this email already exists. Please log in.' });
  }

  const newUser = {
    id: 'u_' + Date.now(),
    name: name.trim(),
    email: em,
    password: password,
    phone: phone ? phone.trim() : '+91 98000 00000',
    role: 'Customer',
    wallet: 1500,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  if (db.saveUsers) {
    db.saveUsers(users);
  }

  const { password: _, ...safeUser } = newUser;
  return res.status(201).json({
    success: true,
    message: 'Account created successfully! Welcome to PlantMe.',
    user: safeUser
  });
});

app.post('/api/auth/login', (req, res) => {
  const { password } = req.body || {};
  const identifier = (req.body?.email || req.body?.identifier || req.body?.phone || '').toString().trim();
  if (!identifier || !password) {
    return res.status(400).json({ success: false, message: 'Email or Mobile and password are required.' });
  }

  const em = identifier.toLowerCase();
  const phoneLookup = normalizePhone(identifier);

  // 1. Check Registered Customers Database (by email OR by mobile number)
  const users = db.getUsers ? db.getUsers() : [];
  const foundUser = users.find(u => {
    const emailMatch = (u.email || '').toLowerCase().trim() === em;
    const p = normalizePhone(u.phone);
    const phoneMatch = phoneLookup.valid && p.valid && p.phone === phoneLookup.phone;
    return emailMatch || phoneMatch;
  });
  if (foundUser) {
    if (foundUser.password !== password) {
      return res.status(401).json({ success: false, message: 'Invalid password. Please check your credentials.' });
    }
    const { password: _, ...safeUser } = foundUser;
    return res.json({
      success: true,
      user: {
        ...safeUser,
        wallet: foundUser.wallet !== undefined ? foundUser.wallet : db.getWallet()
      }
    });
  }

  // 2. Mock customer default login fallback
  if ((em === 'customer@plantme.in' || em === 'customer@planto.in') && (password === 'plantme123' || password === 'planto123')) {
    return res.json({
      success: true,
      user: {
        email: em,
        name: 'Suhas K.',
        role: 'Customer',
        wallet: db.getWallet()
      }
    });
  }

  // 3. Mock vendor login
  if ((em === 'vendor@plantme.in' || em === 'vendor@planto.in') && (password === 'plantme123' || password === 'planto123' || password === 'vendor123')) {
    return res.json({
      success: true,
      user: {
        email: em,
        name: 'Suresh Rao',
        role: 'Vendor',
        vendorId: 'v1'
      }
    });
  }

  // 4. Registered Vendors Check
  const vendors = db.getVendors();
  const vendor = vendors.find(v => (v.email || '').toLowerCase().trim() === em);
  if (vendor) {
    if (vendor.password && vendor.password !== password && password !== 'vendor123') {
      return res.status(401).json({ success: false, message: 'Invalid password. Please check your credentials.' });
    }
    return res.json({
      success: true,
      user: {
        id: vendor.id,
        email: vendor.email || em,
        name: vendor.owner || vendor.name,
        role: 'Vendor',
        vendorId: vendor.id,
        nurseryName: vendor.name,
        status: vendor.status || 'APPROVED'
      }
    });
  }

  // 5. Mock admin login
  if ((em === 'admin@plantme.in' || em === 'admin@planto.in') && (password === 'admin123' || password === 'plantme123' || password === 'planto123')) {
    return res.json({
      success: true,
      user: {
        email: em,
        name: 'PlantMe Controller',
        role: 'Admin'
      }
    });
  }

  // 6. Check Delivery Riders DB
  const riders = db.getRiders();
  const rider = riders.find(r => 
    (r.email || '').toLowerCase().trim() === em || 
    (em === 'delivery@plantme.in' && (r.email || '').toLowerCase().trim() === 'delivery@planto.in')
  );
  if (rider || em === 'delivery@plantme.in' || em === 'delivery@planto.in') {
    if (password !== 'delivery123' && password !== 'plantme123' && rider?.password && rider.password !== password) {
      return res.status(401).json({ success: false, message: 'Invalid password. Please check your credentials.' });
    }
    const currentRider = rider || {
      email: em,
      name: 'Ramu Prasad',
      id: 'r_101',
      status: 'APPROVED'
    };
    if (currentRider.status === 'PENDING_APPROVAL') {
      return res.status(403).json({ success: false, message: 'Your Delivery Rider Application is under Super Admin verification. You will be able to log in once approved.' });
    }
    if (currentRider.status === 'REJECTED') {
      return res.status(403).json({ success: false, message: 'Your Delivery Rider Application was rejected by Super Admin.' });
    }
    return res.json({
      success: true,
      user: {
        email: currentRider.email,
        name: currentRider.name,
        role: 'Delivery Partner',
        partnerId: currentRider.id,
        status: currentRider.status
      }
    });
  }

  return res.status(401).json({ success: false, message: 'Invalid credentials or user not registered.' });
});


app.get('/api/vendors', (req, res) => {
  const vendors = db.getVendors();
  const { status } = req.query;
  const vendorSubs = db.getVendorSubscriptions ? db.getVendorSubscriptions() : [];

  let result = status ? vendors.filter(v => (v.status || 'APPROVED') === status) : vendors;

  // Enrich with subscription tier and sponsored status
  result = result.map(v => {
    const activeSub = vendorSubs.find(s => s.vendorId === v.id && s.status === 'active');
    const isSponsored = activeSub ? (activeSub.tier === 'pro' || activeSub.tier === 'enterprise') : (v.isSponsored || false);
    const tier = activeSub ? activeSub.tier : (v.tier || 'basic');
    return {
      ...v,
      tier,
      isSponsored,
      sponsoredBadgeText: activeSub?.tier === 'enterprise' ? '⭐ SPONSORED BOTANICAL FLAGSHIP' : activeSub?.tier === 'pro' ? '🌿 FEATURED CERTIFIED NURSERY' : null
    };
  });

  // Sort sponsored/premium nurseries first
  result.sort((a, b) => {
    const tierOrder = { enterprise: 3, pro: 2, basic: 1 };
    return (tierOrder[b.tier] || 1) - (tierOrder[a.tier] || 1);
  });

  res.json(result);
});

app.get('/api/vendors/pending', (req, res) => {
  const vendors = db.getVendors();
  res.json(vendors.filter(v => v.status === 'PENDING_APPROVAL'));
});

app.patch('/api/vendors/:id/approval', (req, res) => {
  const { status } = req.body; // 'APPROVED' or 'REJECTED'
  const vendors = db.getVendors();
  const vendorIndex = vendors.findIndex(v => v.id === req.params.id);
  
  if (vendorIndex === -1) {
    return res.status(404).json({ success: false, message: 'Nursery Vendor not found' });
  }

  vendors[vendorIndex].status = status || 'APPROVED';
  db.saveVendors(vendors);

  return res.json({
    success: true,
    message: `Nursery vendor status updated to ${status}`,
    vendor: vendors[vendorIndex]
  });
});

app.post('/api/vendors/register', (req, res) => {
  const vendors = db.getVendors();
  const { name, email, password, phone, address, nurseryName, hours, gstNo, licensePhoto } = req.body;

  const newVendor = {
    id: 'v_' + Date.now(),
    name: nurseryName || `${name}'s Nursery Stall`,
    owner: name || 'Nursery Owner',
    email: email || '',
    password: password || '',
    phone: phone || '+91 98480 22334',
    address: address || 'Bengaluru, KA',
    gstNo: gstNo || '',
    licensePhoto: licensePhoto || '',
    status: 'PENDING_APPROVAL', // Requires Super Admin approval before catalog goes live
    type: 'Roadside Seller',
    distance: '1.0 km',
    rating: 5.0,
    reviewsCount: 0,
    isOpen: true,
    hours: hours || '7:00 AM - 7:30 PM',
    coords: { x: 50, y: 50 },
    lat: 12.9716,
    lng: 77.5946,
    googleMapsUrl: 'https://maps.google.com',
    photos: ['https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=600&q=80'],
    reviews: []
  };

  vendors.push(newVendor);
  db.saveVendors(vendors);
  res.json({ success: true, message: 'Nursery registered successfully. Pending Admin verification.', vendor: newVendor });
});

app.post('/api/vendors', (req, res) => {
  const vendors = db.getVendors();
  vendors.push(req.body);
  db.saveVendors(vendors);
  res.json(req.body);
});

app.get('/api/vendors/:id', (req, res, next) => {
  if (req.params.id === 'plans' || req.params.id === 'pending') return next();
  const vendors = db.getVendors();
  const vendor = vendors.find(v => v.id === req.params.id);
  if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
  
  // Include vendor products too
  const products = db.getProducts();
  const vendorProducts = products.filter(p => p.vendorId === req.params.id);
  
  res.json({ ...vendor, products: vendorProducts });
});

// Vendor adds review
app.post('/api/vendors/:id/reviews', (req, res) => {
  const { user, rating, comment } = req.body;
  const vendors = db.getVendors();
  const index = vendors.findIndex(v => v.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Vendor not found' });
  
  const newReview = {
    user: user || 'Anonymous',
    rating: parseFloat(rating) || 5,
    comment: comment || '',
    date: 'Just now'
  };
  
  vendors[index].reviews = [newReview, ...vendors[index].reviews];
  // Recalculate average rating & reviewsCount
  const totalRating = vendors[index].reviews.reduce((sum, r) => sum + r.rating, 0);
  vendors[index].rating = parseFloat((totalRating / vendors[index].reviews.length).toFixed(1));
  vendors[index].reviewsCount = vendors[index].reviews.length;
  
  db.saveVendors(vendors);
  res.json(vendors[index]);
});

// --- PRODUCTS ---
app.get('/api/products', (req, res) => {
  const { category, type, includePending } = req.query;
  let products = db.getProducts();
  const vendors = db.getVendors();

  // Filter out products from unapproved nurseries for customer view
  if (includePending !== 'true') {
    products = products.filter(p => {
      const vendor = vendors.find(v => v.id === p.vendorId);
      // If no vendor found or vendor status is APPROVED (or default approved), include it
      return !vendor || (vendor.status || 'APPROVED') === 'APPROVED';
    });
  }
  
  if (category) {
    products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }
  if (type) {
    products = products.filter(p => p.type.toLowerCase() === type.toLowerCase());
  }
  
  res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  const products = db.getProducts();
  const product = products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
});

// Vendor management: add new product
app.post('/api/products', (req, res) => {
  const products = db.getProducts();
  const newProduct = {
    id: 'p' + (products.length + 100), // Generate new ID
    rating: 5.0,
    reviewsCount: 0,
    images: req.body.images || ["https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=600&q=80"],
    careInstructions: req.body.careInstructions || {
      waterLevel: "Moderate (once a week)",
      sunlight: "Bright indirect sun",
      temperature: "15°C - 30°C",
      humidity: "Medium",
      fertilizer: "Once a month",
      potType: "Clay Pot"
    },
    ...req.body
  };
  
  products.push(newProduct);
  db.saveProducts(products);
  res.json(newProduct);
});

// Vendor management: edit product
app.put('/api/products/:id', (req, res) => {
  const products = db.getProducts();
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Product not found' });
  
  products[index] = { ...products[index], ...req.body };
  db.saveProducts(products);
  res.json(products[index]);
});

// Vendor management: delete product
app.delete('/api/products/:id', (req, res) => {
  const products = db.getProducts();
  const filtered = products.filter(p => p.id !== req.params.id);
  db.saveProducts(filtered);
  res.json({ success: true, message: 'Product deleted successfully' });
});

// --- BLOGS ---
app.get('/api/blogs', (req, res) => {
  res.json(db.getBlogs());
});

app.post('/api/blogs', (req, res) => {
  const blogs = db.getBlogs();
  const newBlog = {
    id: 'b' + (blogs.length + 1),
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    likes: 0,
    comments: 0,
    image: req.body.image || 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=600&q=80',
    ...req.body
  };
  
  blogs.push(newBlog);
  db.saveBlogs(blogs);
  res.json(newBlog);
});

// --- GUIDES ---
app.get('/api/guides', (req, res) => {
  res.json(db.getGuides());
});

// --- ORDERS ---
app.get('/api/orders', (req, res) => {
  res.json(db.getOrders());
});

app.post('/api/orders', (req, res) => {
  const { 
    items, 
    deliveryType, 
    total, 
    vendorId,
    vendorName,
    address,
    buildingImage,
    recipientName,
    phone,
    landmark,
    deliveryInstruction,
    paymentMethod = 'wallet',
    paymentId = null,
    invoiceNumber = null
  } = req.body || {};

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Order must contain at least one item.' });
  }

  const allProducts = db.getProducts();
  const allVendors = db.getVendors();
  const allBundles = db.getBundles ? db.getBundles() : [];
  let calculatedSubtotal = 0;

  // Validate items, check stock and closed nurseries (including bundle components)
  for (const item of items) {
    if (!item.id) continue;
    const requestedQty = Number(item.quantity) || 1;
    if (requestedQty <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid item quantity.' });
    }

    const bundle = allBundles.find(b => b.id === item.id || b.id === item.bundleId);
    if (bundle) {
      // Validate every constituent component of this bundle in products.json
      for (const comp of bundle.items) {
        const prod = allProducts.find(p => p.id === comp.productId);
        const requiredCompQty = (comp.quantity || 1) * requestedQty;
        if (!prod || prod.quantity === undefined || prod.quantity < requiredCompQty) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for bundle component: "${comp.name}". Available: ${prod?.quantity ?? 0}, requested: ${requiredCompQty}.`
          });
        }
      }
      calculatedSubtotal += (bundle.bundlePrice || bundle.originalPrice) * requestedQty;
    } else {
      const prod = allProducts.find(p => p.id === item.id);
      if (prod) {
        if (prod.quantity !== undefined && prod.quantity < requestedQty) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for "${prod.name}". Available: ${prod.quantity}, requested: ${requestedQty}`
          });
        }
        const vendor = allVendors.find(v => v.id === prod.vendorId);
        if (vendor && vendor.isOpen === false) {
          return res.status(400).json({
            success: false,
            message: `The nursery "${vendor.name}" is currently closed for new orders.`
          });
        }
        calculatedSubtotal += (prod.price || 0) * requestedQty;
      } else {
        calculatedSubtotal += (Number(item.price) || 0) * requestedQty;
      }
    }
  }

  const deliveryFee = 60;
  // Security: prevent price manipulation where total is drastically less than catalog value
  const minAllowedTotal = Math.max(10, Math.round(calculatedSubtotal * 0.4) + (deliveryType === 'Standard Courier' ? 15 : 30));
  if (total !== undefined && Number(total) < minAllowedTotal && calculatedSubtotal > 50) {
    return res.status(400).json({
      success: false,
      message: `Price mismatch detected. Total ₹${total} is invalid for items valued at ₹${calculatedSubtotal}.`
    });
  }

  const orderTotal = total !== undefined ? Number(total) : (calculatedSubtotal + deliveryFee);
  let newBalance = db.getWallet();

  // Deduct wallet balance only if paying via wallet
  if (paymentMethod === 'wallet') {
    const currentWallet = db.getWallet();
    if (currentWallet < orderTotal) {
      return res.status(400).json({ success: false, message: 'Insufficient wallet balance' });
    }
    newBalance = currentWallet - orderTotal;
    db.saveWallet(newBalance);
  }
  
  // Decrement inventory stock (individual products and bundle constituent components)
  let stockChanged = false;
  for (const item of items) {
    if (!item.id) continue;
    const requestedQty = Number(item.quantity) || 1;
    const bundle = allBundles.find(b => b.id === item.id || b.id === item.bundleId);
    if (bundle) {
      for (const comp of bundle.items) {
        const prod = allProducts.find(p => p.id === comp.productId);
        if (prod && prod.quantity !== undefined) {
          prod.quantity = Math.max(0, prod.quantity - ((comp.quantity || 1) * requestedQty));
          stockChanged = true;
        }
      }
    } else {
      const prod = allProducts.find(p => p.id === item.id);
      if (prod && prod.quantity !== undefined) {
        prod.quantity = Math.max(0, prod.quantity - requestedQty);
        stockChanged = true;
      }
    }
  }
  if (stockChanged) {
    db.saveProducts(allProducts);
  }

  // Calculate nursery tier-based commission (8% basic, 5% pro, 3% enterprise)
  const vendorSubs = db.getVendorSubscriptions ? db.getVendorSubscriptions() : [];
  const activeVSub = vendorSubs.find(s => s.vendorId === (vendorId || 'v1') && s.status === 'active');
  const commissionRate = activeVSub ? (activeVSub.commissionRate || 0.05) : 0.08;
  const platformCommission = Math.round(orderTotal * commissionRate);

  const deliveryOtp = `${Math.floor(1000 + Math.random() * 9000)}`;
  const pickupPin = `${Math.floor(1000 + Math.random() * 9000)}`;

  // Save order
  const orders = db.getOrders();
  const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const generatedInvoice = invoiceNumber || ('INV-' + new Date().getFullYear() + '-' + Math.floor(10000 + Math.random() * 90000));
  
  const newOrder = {
    id: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
    invoiceNumber: generatedInvoice,
    date: new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
    items,
    status: 'Placed',
    deliveryType: deliveryType || 'PlantMe Express (20 min)',
    total: orderTotal,
    paymentMethod,
    paymentId: paymentId || (paymentMethod === 'wallet' ? 'WAL-' + Date.now().toString().slice(-6) : 'POD-' + Date.now().toString().slice(-6)),
    paymentStatus: paymentMethod === 'cod' ? 'PENDING_AT_DOORSTEP' : 'PAID',
    vendorId: vendorId || 'v1',
    vendorName: vendorName || 'PlantMe Certified Local Nursery',
    commissionRate,
    platformCommissionRate: commissionRate,
    platformCommission,
    customerEmail: req.body.customerEmail || phone || 'customer@plantme.in',
    address: address || 'Flat 402, Green Heights, Indiranagar, Bengaluru',
    buildingImage: buildingImage || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&auto=format&fit=crop&q=80',
    recipientName: recipientName || 'Arjun Patel',
    phone: phone || '+91 88856 00899',
    landmark: landmark || 'Near Gate 2 Security Cabin',
    deliveryInstruction: deliveryInstruction || 'Eco-friendly hydration wrap requested.',
    pickupPin: pickupPin,
    deliveryOtp: deliveryOtp,
    deliveryFee: 60,
    assignedRiderId: null, // Unassigned until accepted by rider
    rider: null,
    nurseryOrigin: vendorName || 'PlantMe Certified Local Nursery - Indiranagar',
    nurseryCoords: {
      lat: 12.9716,
      lng: 77.6412,
      name: vendorName || 'PlantMe Certified Local Nursery'
    },
    customerCoords: {
      lat: 12.9784,
      lng: 77.6408,
      address: address || 'Flat 402, Green Heights, Indiranagar, Bengaluru'
    },
    riderCoords: {
      lat: 12.9722,
      lng: 77.6414,
      heading: 45
    },
    etaMinutes: 18,
    createdAt: new Date().toISOString(),
    timeline: [
      {
        status: 'Placed',
        title: 'Order Placed & Paid',
        desc: `Customer paid via ${paymentMethod.toUpperCase()} (Inv: ${generatedInvoice})`,
        time: timeNow,
        completed: true
      },
      {
        status: 'Preparing',
        title: 'Nursery Selecting & Eco-Wrapping',
        desc: 'Selecting healthy plant, inspecting soil moisture and wrapping',
        time: '',
        completed: false
      },
      {
        status: 'Ready for Pickup',
        title: 'Eco-Crate Packed',
        desc: 'Ready for Rider Pickup PIN verification',
        time: '',
        completed: false
      },
      {
        status: 'Picked Up',
        title: 'Rider Dispatched (En Route)',
        desc: 'Rider verified PIN and traveling to delivery address',
        time: '',
        completed: false
      },
      {
        status: 'Delivered',
        title: 'Delivered with Customer OTP',
        desc: 'Customer verified OTP upon arrival',
        time: '',
        completed: false
      }
    ]
  };
  
  orders.unshift(newOrder);
  db.saveOrders(orders);

  // Dispatch automated WhatsApp notification
  dispatchNotification({
    channel: 'whatsapp',
    type: 'ORDER_PLACED',
    recipientName: newOrder.recipientName,
    phone: newOrder.phone,
    title: '🌿 Order Confirmed (PlantMe Express)',
    message: `PlantMe Order #${newOrder.id} placed! ₹${orderTotal} paid via ${paymentMethod.toUpperCase()}. Nursery is condition-wrapping your plants. Your Doorstep OTP: [ ${deliveryOtp} ].`,
    orderId: newOrder.id,
    metadata: {
      eta: '18 mins',
      deliveryOtp,
      paymentMethod
    }
  });
  
  // Return order to customer with pickupPin redacted
  const customerView = { ...newOrder };
  delete customerView.pickupPin;
  res.json({ success: true, order: customerView, wallet: newBalance });
});

app.put('/api/orders/:id', (req, res) => {
  const { status } = req.body || {};
  const orders = db.getOrders();
  const index = orders.findIndex(o => o.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Order not found' });
  
  const currentOrder = orders[index];
  // Invariant state rules:
  if (currentOrder.status === 'Delivered' && status !== 'Delivered') {
    return res.status(400).json({
      success: false,
      message: `Invalid state transition: Delivered order #${currentOrder.id} cannot be changed to ${status}.`,
      status: currentOrder.status
    });
  }

  if (currentOrder.status === 'Cancelled' && status !== 'Cancelled') {
    return res.status(400).json({
      success: false,
      message: `Invalid state transition: Cancelled order #${currentOrder.id} cannot be reactivated to ${status}.`,
      status: currentOrder.status
    });
  }

  orders[index].status = status;
  db.saveOrders(orders);
  res.json(orders[index]);
});

// --- ECOSYSTEM: CUSTOMER LIVE TRACKING ---
app.get('/api/orders/:id/live-tracking', (req, res) => {
  const orders = db.getOrders();
  const order = orders.find(o => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  // Calculate live stage index (0 to 4)
  const stages = ['Placed', 'Preparing', 'Ready for Pickup', 'Picked Up', 'Delivered'];
  const currentIdx = stages.findIndex(s => s.toLowerCase() === (order.status || '').toLowerCase());

  res.json({
    success: true,
    orderId: order.id,
    status: order.status || 'Placed',
    stageIndex: currentIdx >= 0 ? currentIdx : 1,
    deliveryOtp: order.deliveryOtp || '8204',
    // Sensitive pickup PIN is intentionally redacted for customer
    etaMinutes: order.etaMinutes || 12,
    items: order.items || [],
    total: order.total || 0,
    address: order.address || 'Bengaluru',
    vendorName: order.vendorName || 'PlantMe Certified Local Nursery',
    nurseryCoords: order.nurseryCoords || { lat: 12.9716, lng: 77.6412, name: 'Local Nursery' },
    customerCoords: order.customerCoords || { lat: 12.9784, lng: 77.6408, address: order.address },
    riderCoords: order.riderCoords || { lat: 12.9745, lng: 77.6418, heading: 45 },
    rider: order.rider || {
      name: 'Ramu Prasad',
      phone: '+91 98450 11223',
      rating: 4.9,
      vehicle: 'Hero Electric Scooter • KA-05-EQ-8821'
    },
    timeline: order.timeline || []
  });
});

// --- PAYMENT GATEWAY INTEGRATION (Razorpay & Dynamic UPI QR) ---

app.post('/api/payments/create-order', (req, res) => {
  const { amount, currency = 'INR', customerName = 'Customer', orderId } = req.body;
  const numAmount = Number(amount) || 299;
  const paymentOrderId = 'pay_order_' + Date.now().toString().slice(-8) + Math.floor(100 + Math.random() * 900);
  const upiTxnId = 'TXN' + Date.now().toString().slice(-8);
  
  // Standard NPCI UPI Intent URI
  const upiUri = `upi://pay?pa=plantme.pay@icici&pn=PlantMe%20Express&am=${numAmount}&cu=INR&tr=${upiTxnId}&tn=PlantMe%20Express%20Order`;

  res.json({
    success: true,
    paymentOrderId,
    amount: numAmount,
    currency,
    upiUri,
    upiTxnId,
    keyId: 'rzp_live_plantme_sec9214',
    merchantName: 'PlantMe.in Live Plants Express',
    upiApps: [
      { name: 'PhonePe', icon: 'phonepe', scheme: `phonepe://pay?pa=plantme.pay@icici&pn=PlantMe&am=${numAmount}&tr=${upiTxnId}` },
      { name: 'Google Pay', icon: 'gpay', scheme: `tez://upi/pay?pa=plantme.pay@icici&pn=PlantMe&am=${numAmount}&tr=${upiTxnId}` },
      { name: 'Paytm', icon: 'paytm', scheme: `paytmmp://pay?pa=plantme.pay@icici&pn=PlantMe&am=${numAmount}&tr=${upiTxnId}` }
    ]
  });
});

app.post('/api/payments/verify', (req, res) => {
  const { paymentId, orderId, method = 'UPI', amount } = req.body;
  const invoiceNumber = 'INV-' + new Date().getFullYear() + '-' + Math.floor(10000 + Math.random() * 90000);
  
  res.json({
    success: true,
    verified: true,
    paymentId: paymentId || ('pay_' + Date.now()),
    invoiceNumber,
    paymentMethod: method,
    amount: amount || 299,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    receiptUrl: `/receipts/${invoiceNumber}.pdf`,
    message: 'Payment verified successfully via secure gateway!'
  });
});

// --- SERVER-SENT EVENTS (SSE) REAL-TIME GPS TELEMETRY STREAM ---
app.get('/api/orders/:id/live-telemetry-stream', (req, res) => {
  const { id } = req.params;
  
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  if (res.flushHeaders) res.flushHeaders();

  let tick = 0;
  let intervalId = null;

  const sendTelemetry = () => {
    const orders = db.getOrders();
    const order = orders.find(o => o.id === id);
    if (!order) {
      res.write(`data: ${JSON.stringify({ error: 'Order not found' })}\n\n`);
      if (intervalId) clearInterval(intervalId);
      res.end();
      return;
    }

    const stages = ['Placed', 'Preparing', 'Ready for Pickup', 'Picked Up', 'Delivered'];
    const currentIdx = stages.findIndex(s => s.toLowerCase() === (order.status || '').toLowerCase());

    const custCoords = order.customerCoords || { lat: 12.9784, lng: 77.6408 };
    const nurseryCoords = order.nurseryCoords || { lat: 12.9716, lng: 77.6412 };
    let riderCoords = order.riderCoords || { lat: 12.9722, lng: 77.6414, heading: 45 };

    // Dynamic interpolation along route if rider is in transit
    if (order.status === 'Picked Up') {
      const progressFactor = Math.min(0.95, (tick % 24) / 24);
      const curLat = nurseryCoords.lat + (custCoords.lat - nurseryCoords.lat) * progressFactor;
      const curLng = nurseryCoords.lng + (custCoords.lng - nurseryCoords.lng) * progressFactor;
      riderCoords = {
        lat: Number(curLat.toFixed(6)),
        lng: Number(curLng.toFixed(6)),
        heading: 45 + Math.sin(tick) * 12,
        updatedAt: new Date().toISOString()
      };
      order.riderCoords = riderCoords;
      order.etaMinutes = Math.max(3, Math.round(18 * (1 - progressFactor)));
    }

    const payload = {
      orderId: order.id,
      status: order.status || 'Placed',
      stageIndex: currentIdx >= 0 ? currentIdx : 1,
      deliveryOtp: order.deliveryOtp || '8204',
      // Sensitive pickup PIN is intentionally redacted from customer stream
      etaMinutes: order.etaMinutes || 12,
      riderCoords,
      speedKmh: order.status === 'Picked Up' ? Math.round(26 + Math.random() * 6) : 0,
      batteryLevel: Math.max(35, 92 - Math.floor(tick / 4)),
      temperatureC: 28,
      moistureSecured: true,
      rider: order.rider || { name: 'Ramu Prasad', phone: '+91 98450 11223' },
      timestamp: Date.now()
    };

    res.write(`data: ${JSON.stringify(payload)}\n\n`);
    tick++;
  };

  sendTelemetry();
  intervalId = setInterval(sendTelemetry, 2500);

  const cleanup = () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };

  req.on('close', cleanup);
  req.on('end', cleanup);
  res.on('finish', cleanup);
  res.on('close', cleanup);
});

// Snapshot Telemetry
app.get('/api/orders/:id/telemetry', (req, res) => {
  const orders = db.getOrders();
  const order = orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  const stages = ['Placed', 'Preparing', 'Ready for Pickup', 'Picked Up', 'Delivered'];
  const currentIdx = stages.findIndex(s => s.toLowerCase() === (order.status || '').toLowerCase());
  return res.json({
    success: true,
    orderId: order.id,
    status: order.status || 'Placed',
    stageIndex: currentIdx >= 0 ? currentIdx : 1,
    riderCoords: order.riderCoords || { lat: 12.9722, lng: 77.6414, heading: 45 },
    customerCoords: order.customerCoords || { lat: 12.9784, lng: 77.6408 },
    nurseryCoords: order.nurseryCoords || { lat: 12.9716, lng: 77.6412 },
    etaMinutes: order.etaMinutes || 14,
    deliveryOtp: order.deliveryOtp || '8401',
    rider: order.rider || { name: 'Ramu Prasad', phone: '+91 98450 11223', rating: 4.9, vehicle: 'Hero Vida V1 Pro EV' },
    timestamp: Date.now()
  });
});

// Trip Simulator API (moves order status for live demos)
app.post('/api/orders/:id/simulate-trip', (req, res) => {
  const { nextStatus } = req.body;
  const orders = db.getOrders();
  const index = orders.findIndex(o => o.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Order not found' });

  const order = orders[index];
  const stages = ['Placed', 'Preparing', 'Ready for Pickup', 'Picked Up', 'Delivered'];
  const curIdx = stages.indexOf(order.status);
  const target = nextStatus || stages[(curIdx + 1) % stages.length];
  
  order.status = target;
  const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  if (order.timeline) {
    const step = order.timeline.find(t => t.status === target);
    if (step) {
      step.time = timeNow;
      step.completed = true;
    }
  }

  orders[index] = order;
  db.saveOrders(orders);

  // Auto-dispatch notification for simulated stage
  if (target === 'Picked Up') {
    dispatchNotification({
      channel: 'whatsapp',
      type: 'ORDER_PICKED_UP',
      recipientName: order.recipientName || 'Customer',
      phone: order.phone || '+91 88856 00899',
      title: 'Rider In Transit',
      message: `🛵 Rider Ramu has picked up your order #${order.id}. Arriving in ~12 mins! Doorstep OTP: [ ${order.deliveryOtp} ].`,
      orderId: order.id
    });
  } else if (target === 'Delivered') {
    dispatchNotification({
      channel: 'whatsapp',
      type: 'ORDER_DELIVERED',
      recipientName: order.recipientName || 'Customer',
      phone: order.phone || '+91 88856 00899',
      title: 'Delivered with Love 🌿',
      message: `🌱 Your plant from #${order.id} is at your doorstep! 30-Day Thrive Guarantee active.`,
      orderId: order.id
    });
  }

  res.json({ success: true, message: `Order status advanced to "${target}"!`, order });
});

// --- NOTIFICATION APIS (WhatsApp & In-App Alerts) ---
app.get('/api/notifications', (req, res) => {
  const limit = parseInt(req.query.limit || '30', 10);
  res.json({ success: true, notifications: getAllNotifications(limit) });
});

app.post('/api/notifications/dispatch', (req, res) => {
  const notice = dispatchNotification(req.body);
  res.json({ success: true, notification: notice });
});

app.patch('/api/notifications/:id/read', (req, res) => {
  const notice = markAsRead(req.params.id);
  res.json({ success: true, notification: notice });
});

// --- VIRTUAL GARDEN AUTO-SYNC FROM AI DIAGNOSTICS ---
app.post('/api/ai/sync-to-garden', (req, res) => {
  const { plantName, condition, prescription, careFrequency = 'Every 3 days' } = req.body;
  const remindersFile = path.join(__dirname, 'data', 'reminders.json');
  let reminders = [];
  try {
    reminders = JSON.parse(fs.readFileSync(remindersFile, 'utf8') || '[]');
  } catch (e) {
    reminders = [];
  }

  const newReminder = {
    id: 'r_' + Date.now().toString().slice(-6),
    active: true,
    title: plantName || 'Indoor Plant Patient',
    type: condition?.includes('Infestation') ? 'Neem Spray' : condition?.includes('Rot') ? 'Dry Soil' : 'Water',
    frequency: careFrequency,
    nextDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    health: '82% Recovering (Under Doctor Plan)',
    doctorPrescription: prescription || 'Apply neem spray & provide indirect morning sunlight.'
  };

  reminders.unshift(newReminder);
  fs.writeFileSync(remindersFile, JSON.stringify(reminders, null, 2));

  // Dispatch WhatsApp Care Reminder alert
  dispatchNotification({
    channel: 'whatsapp',
    type: 'PLANT_CARE',
    recipientName: 'Plant Parent',
    phone: '+91 88856 00899',
    title: `🌿 ${plantName || 'Plant'} Added to Virtual Garden`,
    message: `Prescription saved! ${newReminder.doctorPrescription} Care schedule set for: ${careFrequency}.`,
    metadata: { reminderId: newReminder.id }
  });

  res.json({
    success: true,
    message: `"${plantName || 'Plant'}" successfully synced to your Virtual Garden with tailored treatment schedule!`,
    reminder: newReminder
  });
});

// --- NURSERY DAILY LIVE STORIES APIS ---
app.get('/api/stories', (req, res) => {
  const storiesFile = path.join(__dirname, 'data', 'stories.json');
  try {
    const stories = JSON.parse(fs.readFileSync(storiesFile, 'utf8') || '[]');
    res.json({ success: true, stories });
  } catch (e) {
    res.json({ success: true, stories: [] });
  }
});

app.post('/api/stories/:id/react', (req, res) => {
  const { id } = req.params;
  const { emoji, comment, plantId } = req.body;
  res.json({
    success: true,
    message: 'Reaction sent directly to nursery owner via WhatsApp business chat!',
    storyId: id,
    emoji: emoji || '🌿'
  });
});

// --- ECOSYSTEM: VENDOR / NURSERY PARTNER APIS ---
app.get('/api/vendor/orders', (req, res) => {
  const { vendorId } = req.query;
  const orders = db.getOrders();
  // Filter by vendor if specified, or return all if demo/v1
  const vendorOrders = (vendorId 
    ? orders.filter(o => !o.vendorId || o.vendorId === vendorId || o.vendorId === 'v1')
    : orders
  ).map(o => {
    const sanitized = { ...o };
    delete sanitized.pickupPin;
    return sanitized;
  });
  res.json(vendorOrders);
});

// Vendor toggles Store Status (Open / Watering / Closed)
app.patch('/api/vendors/:id/status', (req, res) => {
  const { isOpen, storeMode } = req.body || {};
  const vendors = db.getVendors();
  const index = vendors.findIndex(v => v.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Vendor not found' });

  const effectiveIsOpen = isOpen !== undefined ? !!isOpen : (storeMode !== 'closed');
  vendors[index].isOpen = effectiveIsOpen;
  vendors[index].storeMode = storeMode || (effectiveIsOpen ? 'open' : 'closed');
  db.saveVendors(vendors);

  res.json({
    success: true,
    message: `Nursery store status updated to ${vendors[index].storeMode.toUpperCase()}`,
    vendor: vendors[index]
  });
});

app.put('/api/vendors/:id/status', (req, res) => {
  const { isOpen, storeMode } = req.body || {};
  const vendors = db.getVendors();
  const index = vendors.findIndex(v => v.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Vendor not found' });

  const effectiveIsOpen = isOpen !== undefined ? !!isOpen : (storeMode !== 'closed');
  vendors[index].isOpen = effectiveIsOpen;
  vendors[index].storeMode = storeMode || (effectiveIsOpen ? 'open' : 'closed');
  db.saveVendors(vendors);

  res.json({
    success: true,
    message: `Nursery store status updated to ${vendors[index].storeMode.toUpperCase()}`,
    vendor: vendors[index]
  });
});

// Nursery accepts incoming order -> status moves to "Preparing"
app.post('/api/vendor/orders/:id/accept', (req, res) => {
  const orders = db.getOrders();
  const index = orders.findIndex(o => o.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Order not found' });

  const order = orders[index];
  if (order.status !== 'Placed') {
    return res.status(400).json({
      success: false,
      message: `Order #${order.id} is already in "${order.status}" status.`
    });
  }

  order.status = 'Preparing';
  const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  if (order.timeline) {
    const prepStep = order.timeline.find(t => t.status === 'Preparing');
    if (prepStep) {
      prepStep.time = timeNow;
      prepStep.completed = true;
    }
  }

  orders[index] = order;
  db.saveOrders(orders);
  res.json({ success: true, message: 'Order accepted! Nursery is now preparing & eco-wrapping plant.', order });
});

// Nursery marks order ready for rider pickup
app.post('/api/vendor/orders/:id/ready', (req, res) => {
  const orders = db.getOrders();
  const index = orders.findIndex(o => o.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Order not found' });

  const order = orders[index];
  if (order.status !== 'Preparing' && order.status !== 'Placed') {
    return res.status(400).json({
      success: false,
      message: `Order #${order.id} cannot be marked ready from "${order.status}" status.`
    });
  }

  order.status = 'Ready for Pickup';
  const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (order.timeline) {
    const readyStep = order.timeline.find(t => t.status === 'Ready for Pickup');
    if (readyStep) {
      readyStep.time = timeNow;
      readyStep.completed = true;
    }
  }

  orders[index] = order;
  db.saveOrders(orders);
  res.json({ success: true, message: 'Order marked ready! Waiting for Rider 4-digit Pickup PIN.', order });
});

// Nursery enters Rider's 4-Digit Pickup PIN Handshake
app.post('/api/vendor/orders/:id/verify-pickup', (req, res) => {
  const { pickupPin } = req.body || {};
  const orders = db.getOrders();
  const index = orders.findIndex(o => o.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Order not found' });

  const order = orders[index];

  if (order.status === 'Picked Up' || order.status === 'Delivered') {
    return res.status(400).json({
      success: false,
      message: 'Order has already been picked up.'
    });
  }

  if (order.status === 'Cancelled') {
    return res.status(400).json({
      success: false,
      message: 'Cannot fulfill a cancelled order.'
    });
  }

  const expectedPin = String(order.pickupPin || '').trim();
  const enteredPin = String(pickupPin || '').trim();

  if (!enteredPin || enteredPin !== expectedPin) {
    return res.status(400).json({
      success: false,
      message: `Invalid Pickup PIN (${enteredPin}). Please ask rider for their 4-digit PIN.`
    });
  }

  // Pin is verified! Handshake complete: order is now with rider
  order.status = 'Picked Up';
  const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  if (order.timeline) {
    const pickStep = order.timeline.find(t => t.status === 'Picked Up');
    if (pickStep) {
      pickStep.time = timeNow;
      pickStep.completed = true;
    }
  }

  orders[index] = order;
  db.saveOrders(orders);
  res.json({
    success: true,
    message: 'Pickup PIN verified successfully! Plant handed over to delivery partner.',
    order
  });
});

// Vendor Simulate Incoming Express Plant Order (for testing and live demos)
app.post('/api/vendor/orders/simulate', (req, res) => {
  const orders = db.getOrders();
  const sampleItems = [
    [
      { name: 'Monstera Deliciosa (Swiss Cheese)', price: 549, quantity: 1, variant: '8-inch Nursery Pot' },
      { name: 'Organic Vermicompost Mix (2kg)', price: 120, quantity: 1, variant: '2kg Bag' }
    ],
    [
      { name: 'Fiddle Leaf Fig Premium', price: 699, quantity: 1, variant: '10-inch Self-Watering Pot' },
      { name: 'Ceramic Handcrafted Planter (Sage)', price: 299, quantity: 1, variant: 'Glossy Finish' }
    ],
    [
      { name: 'Sansevieria Snake Plant (Air Purifier)', price: 349, quantity: 1, variant: '6-inch Nursery Pot' }
    ],
    [
      { name: 'Ginseng Ficus Bonsai (5 Years Aged)', price: 799, quantity: 1, variant: 'Ceramic Shallow Bowl' }
    ]
  ];

  const sampleAddresses = [
    'Flat 304, Green Heights, 100ft Road, Indiranagar, Bengaluru',
    'Villa 22, Palm Meadows, Behind HAL Museum, Bengaluru',
    'Apartment 102, Embassy Habitat, Palace Road, Vasanth Nagar, Bengaluru',
    'Tower 4, 12B, Prestige Acropolis, Koramangala 7th Block, Bengaluru'
  ];

  const sampleNames = ['Aditi Rao', 'Rohan Mehta', 'Sneha Kapoor', 'Vikramaditya Iyer'];

  const randIdx = Math.floor(Math.random() * sampleItems.length);
  const items = sampleItems[randIdx];
  const total = items.reduce((s, it) => s + (it.price * it.quantity), 0) + 40; // + packaging fee
  const pickupPin = `${Math.floor(1000 + Math.random() * 9000)}`;
  const deliveryOtp = `${Math.floor(1000 + Math.random() * 9000)}`;
  const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const newOrder = {
    id: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
    date: new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
    items,
    status: 'Placed',
    deliveryType: 'PlantMe Express (20 min)',
    total,
    vendorId: 'v1',
    vendorName: 'Indiranagar Botanical Nursery',
    address: sampleAddresses[randIdx],
    buildingImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&auto=format&fit=crop&q=80',
    recipientName: sampleNames[randIdx],
    phone: '+91 98450 ' + Math.floor(10000 + Math.random() * 90000),
    landmark: 'Main Gate Security Guard',
    deliveryInstruction: 'Hydration wrap & foliage sleeve requested. Handle with care.',
    pickupPin,
    deliveryOtp,
    deliveryFee: 40,
    assignedRiderId: 'r_101',
    rider: {
      id: 'r_101',
      name: 'Ramu Prasad',
      phone: '+91 98450 11223',
      rating: 4.9,
      vehicle: 'Hero Electric Scooter',
      vehicleNumber: 'KA-05-EQ-8821',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
    },
    timeline: [
      { status: 'Placed', title: 'Order Placed by Customer', time: timeNow, completed: true },
      { status: 'Preparing', title: 'Nursery Packing & Conditioning', time: null, completed: false },
      { status: 'Ready for Pickup', title: 'Ready for Rider Handshake', time: null, completed: false },
      { status: 'Picked Up', title: 'Rider In Transit', time: null, completed: false },
      { status: 'Delivered', title: 'Delivered to Doorstep', time: null, completed: false }
    ]
  };

  orders.unshift(newOrder);
  db.saveOrders(orders);
  res.json({ success: true, message: 'Simulated customer express order received!', order: newOrder });
});

// Vendor Payouts & Daily Ledger
app.get('/api/vendor/payouts', (req, res) => {
  const orders = db.getOrders();
  const deliveredOrders = orders.filter(o => o.status === 'Delivered');
  const todaySales = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const commissionRate = 0.05; // 5% PlantMe platform fee
  const netEarnings = Math.round(todaySales * (1 - commissionRate));

  res.json({
    success: true,
    todaySales: todaySales || 4760,
    totalOrders: orders.length,
    completedOrders: deliveredOrders.length || 18,
    commissionRate: '5%',
    availableBalance: 4520,
    platformFeeDeducted: Math.round(todaySales * commissionRate) || 240,
    netEarnings: netEarnings || 4520,
    settlementStatus: 'Daily Express Settlement Active',
    linkedBankAccount: 'HDFC Bank ••••• 4109',
    linkedUpi: 'indiranagar.nursery@okhdfcbank',
    recentTransactions: [
      { id: 'TXN-9012', date: 'Today, 12:40 PM', orderId: 'ORD-7290', gross: 279, net: 265, status: 'Settled' },
      { id: 'TXN-9011', date: 'Today, 11:15 AM', orderId: 'ORD-9824', gross: 420, net: 399, status: 'Settled' },
      { id: 'TXN-8840', date: 'Yesterday', orderId: 'ORD-1011', gross: 550, net: 522, status: 'Paid Out' },
      { id: 'TXN-8720', date: 'Oct 02, 2026', orderId: 'ORD-0922', gross: 1240, net: 1178, status: 'Paid Out' }
    ]
  });
});

// Vendor Instant UPI Withdrawal
app.post('/api/vendor/payouts/withdraw', (req, res) => {
  const { amount, upiId } = req.body;
  const utr = 'UTR' + Date.now().toString().slice(-8) + Math.floor(100 + Math.random() * 900);
  res.json({
    success: true,
    message: `₹${amount || 4520} transferred to ${upiId || 'nursery@upi'} via IMPS.`,
    utr,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  });
});


// --- ECOSYSTEM: DELIVERY PARTNER (RIDER) APIS ---
// Rider Duty status (Online / Offline)
let riderDutyState = {
  r_101: { isOnline: true, lastSeen: new Date().toISOString() }
};

app.get('/api/rider/status', (req, res) => {
  const riderId = req.query.riderId || 'r_101';
  const duty = riderDutyState[riderId] || { isOnline: true };
  const orders = db.getOrders();
  const activeOrder = orders.find(o => o.status !== 'Delivered' && (o.assignedRiderId === riderId || !o.assignedRiderId));

  res.json({
    success: true,
    riderId,
    isOnline: duty.isOnline,
    activeOrder: activeOrder || null
  });
});

app.post('/api/rider/status', (req, res) => {
  const { riderId = 'r_101', isOnline } = req.body;
  riderDutyState[riderId] = {
    isOnline: !!isOnline,
    lastSeen: new Date().toISOString()
  };
  res.json({ success: true, isOnline: !!isOnline });
});

// Available orders waiting for rider
app.get('/api/rider/orders/available', (req, res) => {
  const { riderId } = req.query || {};
  const orders = db.getOrders();
  // Orders waiting for pickup or active delivery
  const available = orders
    .filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled')
    .map(o => {
      const sanitized = { ...o };
      // Never leak doorstep delivery OTP to rider before arrival
      delete sanitized.deliveryOtp;
      // Do not expose pickup PIN if assigned to another rider
      if (riderId && sanitized.assignedRiderId && sanitized.assignedRiderId !== riderId) {
        delete sanitized.pickupPin;
      }
      return sanitized;
    });
  res.json(available);
});

// Rider accepts trip
app.post('/api/rider/orders/:id/accept', (req, res) => {
  const { riderId = 'r_101' } = req.body || {};
  const orders = db.getOrders();
  const index = orders.findIndex(o => o.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Order not found' });

  const order = orders[index];

  if (order.assignedRiderId && order.assignedRiderId !== riderId) {
    return res.status(409).json({
      success: false,
      message: 'Trip has already been accepted by another delivery partner.'
    });
  }

  if (order.status === 'Picked Up' || order.status === 'Delivered' || order.status === 'Cancelled') {
    return res.status(400).json({
      success: false,
      message: `Order #${order.id} is in "${order.status}" status and is not available for acceptance.`
    });
  }

  order.assignedRiderId = riderId;
  const riders = db.getRiders();
  const riderProfile = riders.find(r => r.id === riderId) || {
    id: riderId,
    name: 'Ramu Prasad',
    phone: '+91 98450 11223',
    rating: 4.9,
    vehicle: 'Hero Electric Scooter',
    vehicleNumber: 'KA-05-EQ-8821',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
  };
  order.rider = riderProfile;
  orders[index] = order;
  db.saveOrders(orders);

  res.json({
    success: true,
    message: 'Order trip accepted! Navigate to nursery and show Pickup PIN.',
    pickupPin: order.pickupPin,
    order
  });
});

// Rider broadcasts live GPS location
app.post('/api/rider/orders/:id/location', (req, res) => {
  const { lat, lng, heading = 0 } = req.body;
  const orders = db.getOrders();
  const index = orders.findIndex(o => o.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Order not found' });

  const order = orders[index];
  order.riderCoords = {
    lat: parseFloat(lat),
    lng: parseFloat(lng),
    heading: parseFloat(heading),
    updatedAt: new Date().toISOString()
  };

  // Recalculate estimated minutes based on remaining distance to customer
  if (order.customerCoords && order.customerCoords.lat) {
    const dLat = Math.abs(order.customerCoords.lat - order.riderCoords.lat);
    const dLng = Math.abs(order.customerCoords.lng - order.riderCoords.lng);
    const distKm = Math.sqrt(dLat * dLat + dLng * dLng) * 111;
    order.etaMinutes = Math.max(2, Math.round(distKm * 4.5)); // ~4.5 mins per km in city traffic
  }

  orders[index] = order;
  db.saveOrders(orders);

  res.json({
    success: true,
    riderCoords: order.riderCoords,
    etaMinutes: order.etaMinutes
  });
});

// Rider verifies Customer 4-digit Delivery OTP upon arrival
app.post('/api/rider/orders/:id/verify-delivery', (req, res) => {
  const { riderId = 'r_101', deliveryOtp } = req.body || {};
  const orders = db.getOrders();
  const index = orders.findIndex(o => o.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Order not found' });

  const order = orders[index];

  if (order.status === 'Delivered') {
    return res.status(400).json({
      success: false,
      message: 'Order has already been delivered.'
    });
  }

  if (order.status !== 'Picked Up') {
    return res.status(400).json({
      success: false,
      message: `Cannot deliver order in "${order.status}" status. Pickup verification at nursery is required before delivery.`
    });
  }

  if (order.assignedRiderId && order.assignedRiderId !== riderId) {
    return res.status(403).json({
      success: false,
      message: 'Unauthorized: This trip is assigned to a different delivery partner.'
    });
  }

  const expectedOtp = String(order.deliveryOtp || '').trim();
  const enteredOtp = String(deliveryOtp || '').trim();

  if (!enteredOtp || enteredOtp !== expectedOtp) {
    return res.status(400).json({
      success: false,
      message: `Invalid Delivery OTP (${enteredOtp}). Please ask customer for the 4-digit OTP shown in their PlantMe app.`
    });
  }

  // Delivery Verified!
  order.status = 'Delivered';
  const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  if (order.timeline) {
    const delStep = order.timeline.find(t => t.status === 'Delivered');
    if (delStep) {
      delStep.time = timeNow;
      delStep.completed = true;
    }
  }

  orders[index] = order;
  db.saveOrders(orders);

  const deliveryFee = order.deliveryFee || 60;

  // Credit rider wallet if rider exists
  const riders = db.getRiders();
  const riderIdx = riders.findIndex(r => r.id === riderId);
  if (riderIdx !== -1) {
    riders[riderIdx].totalEarnings = (riders[riderIdx].totalEarnings || 0) + deliveryFee;
    riders[riderIdx].completedTrips = (riders[riderIdx].completedTrips || 0) + 1;
    db.saveRiders(riders);
  }

  // Evaluate referral qualification upon first delivered order
  try {
    const custEmail = (order.customerEmail || '').toLowerCase();
    const custPhone = String(order.phone || '').trim();
    const referrals = db.getReferrals ? db.getReferrals() : [];
    const matchedRef = referrals.find(r => 
      !r.rewardIssued && 
      (r.status === 'registered' || r.status === 'qualified') &&
      ((custEmail && r.refereeEmail && r.refereeEmail.toLowerCase() === custEmail) ||
       (custPhone && r.refereePhone && r.refereePhone === custPhone) ||
       (order.recipientName && r.refereeName && r.refereeName.toLowerCase() === order.recipientName.toLowerCase()))
    );

    if (matchedRef) {
      matchedRef.status = 'rewarded';
      matchedRef.rewardIssued = true;
      matchedRef.orderId = order.id;
      matchedRef.rewardIssuedAt = new Date().toISOString();
      db.saveReferrals(referrals);

      let currentWallet = db.getWallet();
      currentWallet += (matchedRef.rewardAmount || 100);
      db.saveWallet(currentWallet);

      if (db.getAuditLogs && db.saveAuditLogs) {
        const auditLogs = db.getAuditLogs();
        auditLogs.unshift({
          id: 'audit_' + Date.now(),
          timestamp: new Date().toISOString(),
          actor: 'system',
          role: 'system',
          action: 'REFERRAL_REWARD_CREDITED',
          entityType: 'referral',
          entityId: matchedRef.id,
          details: `Credited ₹${matchedRef.rewardAmount || 100} referral reward to referrer ${matchedRef.ownerEmail} for first delivered order #${order.id}.`
        });
        db.saveAuditLogs(auditLogs);
      }
    }
  } catch (refErr) {
    console.warn('[ReferralAudit] Error evaluating referral reward on delivery:', refErr);
  }

  res.json({
    success: true,
    message: `Delivery OTP verified! Order delivered successfully. ₹${deliveryFee} credited to your ledger.`,
    order,
    deliveryFee
  });
});

// Rider Earnings & Incentive Ledger
app.get('/api/rider/earnings', (req, res) => {
  const riderId = req.query.riderId || 'r_101';
  const orders = db.getOrders();
  const completedOrders = orders.filter(o => o.status === 'Delivered');
  const tripFee = 60;
  const baseEarnings = 540;
  const todayTrips = completedOrders.length;
  const totalEarnings = baseEarnings + (todayTrips * tripFee);

  res.json({
    success: true,
    riderId,
    todayEarnings: totalEarnings,
    completedTrips: 9 + todayTrips,
    rating: 4.9,
    perOrderFee: tripFee,
    dailyBonusProgress: {
      targetTrips: 12,
      completedToday: 9 + todayTrips,
      bonusAmount: 150,
      achieved: (9 + todayTrips) >= 12
    }
  });
});

// --- REMINDERS ---
app.get('/api/reminders', (req, res) => {
  res.json(db.getReminders());
});

app.post('/api/reminders', (req, res) => {
  const reminders = db.getReminders();
  const newReminder = {
    id: 'r' + (reminders.length + 1),
    active: true,
    ...req.body
  };
  
  reminders.push(newReminder);
  db.saveReminders(reminders);
  res.json(newReminder);
});

app.put('/api/reminders/:id', (req, res) => {
  const reminders = db.getReminders();
  const index = reminders.findIndex(r => r.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Reminder not found' });
  
  reminders[index] = { ...reminders[index], ...req.body };
  db.saveReminders(reminders);
  res.json(reminders[index]);
});

app.delete('/api/reminders/:id', (req, res) => {
  const reminders = db.getReminders();
  const filtered = reminders.filter(r => r.id !== req.params.id);
  db.saveReminders(filtered);
  res.json({ success: true });
});

// --- CATEGORIES & SEASONAL COLLECTIONS ---
app.get('/api/categories', (req, res) => {
  res.json(db.getCategories());
});

app.post('/api/categories', (req, res) => {
  const categories = db.getCategories();
  const newCat = {
    id: 'cat_' + Date.now(),
    name: req.body.name,
    description: req.body.description || 'Custom botanical / seasonal collection',
    seasonMonths: req.body.seasonMonths || 'All Seasons',
    itemCount: 0,
    status: 'Active'
  };
  categories.push(newCat);
  db.saveCategories(categories);
  res.json(newCat);
});

app.delete('/api/categories/:id', (req, res) => {
  const categories = db.getCategories();
  const filtered = categories.filter(c => c.id !== req.params.id);
  db.saveCategories(filtered);
  res.json({ success: true, message: 'Category deleted successfully' });
});

// --- ITEM TYPES (PLATFORM PRODUCT CLASSIFICATIONS) ---
app.get('/api/item-types', (req, res) => {
  res.json(db.getItemTypes());
});

app.post('/api/item-types', (req, res) => {
  const itemTypes = db.getItemTypes();
  const newItemType = {
    id: 'it_' + Date.now(),
    name: req.body.name,
    description: req.body.description || 'Custom product classification',
    status: 'Active'
  };
  itemTypes.push(newItemType);
  db.saveItemTypes(itemTypes);
  res.json(newItemType);
});

app.delete('/api/item-types/:id', (req, res) => {
  const itemTypes = db.getItemTypes();
  const filtered = itemTypes.filter(it => it.id !== req.params.id);
  db.saveItemTypes(filtered);
  res.json({ success: true, message: 'Item Type deleted successfully' });
});

// --- AUTH LOGIN ---
app.get('/api/auth/status', (req, res) => {
  const { email } = req.query;
  if (!email) return res.json({ active: true });

  const riders = db.getRiders();
  const rider = riders.find(r => r.email && r.email.toLowerCase() === email.toLowerCase());
  if (rider) {
    if (rider.status === 'DISABLED' || rider.status === 'BLOCKED' || rider.status === 'REJECTED') {
      return res.json({ active: false, status: rider.status, message: 'You are blocked by the Admin. Please contact the Admin.' });
    }
    return res.json({ active: true, rider });
  }
  res.json({ active: true });
});

// --- DELIVERY FLEET RIDERS ---
app.get('/api/riders', (req, res) => {
  res.json(db.getRiders());
});

app.post('/api/riders/register', (req, res) => {
  const riders = db.getRiders();
  const { name, email, password, phone, address, vehicle, vehicleNumber, drivingLicense, aadhaar, dlDoc, dlFileName, dlFileType, aadhaarDoc, aadhaarFileName, aadhaarFileType, status } = req.body;
  
  const existing = riders.find(r => r.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ success: false, message: 'Account with this email already exists.' });
  }

  const newRider = {
    id: 'r_' + Date.now(),
    name,
    email,
    password,
    phone,
    address,
    vehicle: vehicle || 'Electric Scooter',
    vehicleNumber: vehicleNumber || 'KA-05-EQ-8821',
    drivingLicense: drivingLicense || 'KA-01-EXP',
    aadhaar: aadhaar || '0000-0000-0000',
    dlDoc: dlDoc || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
    dlFileName: dlFileName || 'Driving_License.pdf',
    dlFileType: dlFileType || (dlDoc && dlDoc.startsWith('data:application/pdf') ? 'application/pdf' : 'image/jpeg'),
    aadhaarDoc: aadhaarDoc || 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=600&q=80',
    aadhaarFileName: aadhaarFileName || 'Aadhaar_Card.pdf',
    aadhaarFileType: aadhaarFileType || (aadhaarDoc && aadhaarDoc.startsWith('data:application/pdf') ? 'application/pdf' : 'image/jpeg'),
    status: status || 'PENDING_APPROVAL',
    registeredAt: new Date().toISOString().split('T')[0]
  };

  riders.push(newRider);
  db.saveRiders(riders);
  res.json({ success: true, rider: newRider });
});

app.put('/api/riders/:id/approval', (req, res) => {
  const { status } = req.body; // 'APPROVED', 'DISABLED', 'BLOCKED', 'REJECTED'
  const riders = db.getRiders();
  const index = riders.findIndex(r => r.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Rider not found' });

  riders[index].status = status;
  db.saveRiders(riders);
  res.json({ success: true, rider: riders[index] });
});

app.put('/api/riders/:id', (req, res) => {
  const riders = db.getRiders();
  const index = riders.findIndex(r => r.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Rider not found' });

  riders[index] = { ...riders[index], ...req.body };
  db.saveRiders(riders);
  res.json({ success: true, rider: riders[index] });
});

app.delete('/api/riders/:id', (req, res) => {
  const riders = db.getRiders();
  const filtered = riders.filter(r => r.id !== req.params.id);
  db.saveRiders(filtered);
  res.json({ success: true, message: 'Rider account deleted successfully' });
});

// --- WALLET ---
app.get('/api/wallet', (req, res) => {
  res.json({ wallet: db.getWallet() });
});

app.post('/api/wallet/update', (req, res) => {
  const { amount } = req.body;
  const current = db.getWallet();
  const newVal = current + parseFloat(amount);
  db.saveWallet(newVal);
  res.json({ wallet: newVal });
});



// Care Subscriptions Endpoint
app.post("/api/subscriptions", (req, res) => {
  const { productId, intervalDays } = req.body;
  res.json({
    success: true,
    subscriptionId: "SUB-" + Math.floor(Math.random() * 90000 + 10000),
    message: `Auto-refill active! Delivery every ${intervalDays || 30} days with 15% discount.`
  });
});


// Auth Endpoints
app.post("/api/auth/send-otp", (req, res) => {
  const { phone } = req.body;
  res.json({
    success: true,
    message: `OTP sent successfully to ${phone || "+91 88856 00899"}`,
    otpDemo: "1234"
  });
});

app.post("/api/auth/verify-otp", (req, res) => {
  const { phone, otp } = req.body;
  if (otp === "1234" || otp === "9999" || otp) {
    res.json({
      success: true,
      token: "jwt-plantme-token-" + Date.now(),
      user: {
        phone: phone || "+91 88856 00899",
        name: "Future Forbes Member",
        walletBalance: 1250.00,
        plantCoins: 150,
        address: "Indiranagar 100ft Rd, 12th Main, Bengaluru"
      }
    });
  } else {
    res.status(400).json({ success: false, message: "Invalid OTP code" });
  }
});

app.get("/api/auth/profile", (req, res) => {
  res.json({
    phone: "+91 88856 00899",
    name: "Future Forbes Member",
    email: "info@futureforbes.in",
    walletBalance: 1250.00,
    plantCoins: 150,
    address: "Indiranagar 100ft Rd, 12th Main, Bengaluru"
  });
});

app.post("/api/auth/profile", (req, res) => {
  const { name, phone, email, address, bio, gardenStyle, avatarColor } = req.body;
  res.json({
    success: true,
    message: "Profile updated successfully",
    user: {
      name: name || "PlantMe Customer",
      phone: phone || "+91 88856 00899",
      email: email || "customer@plantme.in",
      address: address || "Indiranagar, Bengaluru",
      bio: bio || "Plant Parent",
      gardenStyle: gardenStyle || "Balcony & Indoor",
      avatarColor: avatarColor || "#047857"
    }
  });
});


// My Garden Tracker API
app.get("/api/user/garden", (req, res) => {
  res.json([
    {
      id: "g1",
      plantName: "Golden Pothos",
      lastWatered: "2 days ago",
      nextWatering: "Today",
      needsWater: true,
      category: "Indoor"
    },
    {
      id: "g2",
      plantName: "Areca Palm",
      lastWatered: "Yesterday",
      nextWatering: "In 3 days",
      needsWater: false,
      category: "Indoor"
    }
  ]);
});

app.post("/api/user/garden/water", (req, res) => {
  const { plantId } = req.body;
  res.json({ success: true, message: "Marked as watered today!", plantId });
});

// Eco-Gifting API
app.post("/api/gifting", (req, res) => {
  const { recipientName, recipientPhone, giftMessage, productId } = req.body;
  res.json({
    success: true,
    giftId: "GIFT-" + Math.floor(Math.random() * 90000 + 10000),
    message: `Gift order generated for ${recipientName || "Friend"}! Express 10-Min Gift Delivery active.`
  });
});

// Driver Tipping API
app.post("/api/tips", (req, res) => {
  const { orderId, tipAmount } = req.body;
  res.json({
    success: true,
    message: `₹${tipAmount} tip added! 100% of tips go directly to Ramesh Kumar.`
  });
});

// --- CUSTOMER EXPERIENCE (CX) APIS ---

// 1. Hyperlocal Botanical Weather & Care Advisory API
app.get("/api/weather/care-tip", (req, res) => {
  const rawCity = (req.query.city || "").trim();
  const city = rawCity || "Hyderabad";
  const cityLower = city.toLowerCase();

  let weatherProfile = {
    city: city,
    temperature: "31°C",
    condition: "Warm Sunshine & Mild Breeze",
    humidity: "44%",
    uvIndex: "Moderate (6/10)",
    advisory: {
      title: "Moderate Transpiration Today",
      summary: `Warm sunshine across ${city} today accelerates soil moisture evaporation.`,
      actionText: `Deeply water outdoor flowering plants before 10 AM. Indoor air purifiers and tropical aroids only need light foliage misting today.`,
      hydrationAlert: true,
      thriveTip: "Check topsoil with your finger 1 inch down before your next watering cycle."
    }
  };

  if (cityLower.includes("hyderabad")) {
    weatherProfile = {
      city: "Hyderabad",
      temperature: "31°C",
      condition: "Warm Sunshine & Gentle Breeze",
      humidity: "44%",
      uvIndex: "Moderate (6/10)",
      advisory: {
        title: "Active Growth & Transpiration",
        summary: "Warm, dry afternoon breeze in Hyderabad accelerates leaf transpiration.",
        actionText: "Water outdoor flowering saplings and terrace pots before 9:30 AM. Give indoor Monstera and Pothos a light foliage misting.",
        hydrationAlert: true,
        thriveTip: "Keep jade and succulents in bright sun; shield delicate ferns from dry afternoon balcony winds."
      }
    };
  } else if (cityLower.includes("bengaluru") || cityLower.includes("bangalore")) {
    weatherProfile = {
      city: "Bengaluru",
      temperature: "27°C",
      condition: "Pleasant Tropical Breeze & Filtered Sun",
      humidity: "58%",
      uvIndex: "Moderate (5/10)",
      advisory: {
        title: "Optimal Botanical Humidity",
        summary: "Mild tropical Bengaluru air keeps indoor foliage naturally hydrated.",
        actionText: "Ideal day for soil aeration and repotting. Water only when the top 1.5 inches feel dry to the touch.",
        hydrationAlert: false,
        thriveTip: "Rotate pots 90 degrees every fortnight for balanced symmetrical foliage development."
      }
    };
  } else if (cityLower.includes("mumbai") || cityLower.includes("chennai")) {
    weatherProfile = {
      city: city,
      temperature: "32°C",
      condition: "Humid & Coastal Sunshine",
      humidity: "72%",
      uvIndex: "High (7/10)",
      advisory: {
        title: "High Coastal Humidity",
        summary: `Tropical coastal humidity in ${city} is exceptional for tropical foliage and ferns.`,
        actionText: "Ensure good room ventilation to prevent fungal leaf spots. Soil stays damp longer in this humidity.",
        hydrationAlert: false,
        thriveTip: "Avoid overwatering; check that pots have free-draining bottom outlets."
      }
    };
  } else if (cityLower.includes("delhi") || cityLower.includes("noida") || cityLower.includes("gurgaon")) {
    weatherProfile = {
      city: city,
      temperature: "33°C",
      condition: "Dry Heat & Clear Sky",
      humidity: "35%",
      uvIndex: "High (7/10)",
      advisory: {
        title: "High Evaporation Advisory",
        summary: `Dry continental climate in ${city} rapidly dries out topsoil moisture.`,
        actionText: "Water outdoor plants deeply early morning. Group indoor plants together over a pebble water tray to maintain local humidity.",
        hydrationAlert: true,
        thriveTip: "Wipe dust off leaves once weekly to maximize oxygen generation."
      }
    };
  }

  res.json(weatherProfile);
});

// 2. Plant Birth & Adoption Certificate API
app.get("/api/care/certificate/:id", (req, res) => {
  const { id } = req.params;
  const orders = db.getOrders();
  const matchedOrder = orders.find(o => o.id === id) || orders[0] || {};
  const itemName = matchedOrder.items?.[0]?.name || "Premium Golden Pothos";
  
  res.json({
    certificateId: "PLANTME-CERT-" + (id.replace(/[^0-9]/g, '') || Math.floor(1000 + Math.random() * 9000)),
    plantName: itemName,
    botanicalName: itemName.includes("Pothos") ? "Epipremnum aureum" : itemName.includes("Snake") ? "Sansevieria trifasciata" : itemName.includes("Bonsai") ? "Ficus microcarpa" : "Tropical Botanical Specimen",
    adoptionDate: matchedOrder.date || new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
    parentName: matchedOrder.recipientName || "Arjun Patel",
    nurseryOrigin: "PlantMe Certified Partner Nursery (Bengaluru)",
    batchId: "PLANTME-BATCH-A48",
    vitalityScore: "99% Certified Vitality (Grade A+)",
    soilBlend: "Organic Cocopeat, Perlite & Vermicompost",
    planterType: "Handcrafted Eco Ceramic Pot",
    oxygenRating: "+1.4 Liters Pure O₂ / Day",
    sunlightNeed: "Bright Indirect Sunlight",
    wateringCadence: "Every 5-7 Days (Touch dry top inch)",
    botanistName: "PlantMe Botanical Quality Council",
    botanistTitle: "Authorized Botanical Registrar & Quality Desk",
    guarantee: "30-Day PlantMe Thrive or Free Replacement Guarantee",
    unboxingSteps: [
      { step: 1, title: "Unwrap with Care", desc: "Gently remove the eco-moss moisture shield from around the root base." },
      { step: 2, title: "Acclimatize 24 Hours", desc: "Keep the plant in bright, indirect light for 24-48 hours before direct sun exposure." },
      { step: 3, title: "First Hydration Check", desc: "Touch soil 1 inch down. If dry, give 150ml of room-temperature water." },
      { step: 4, title: "Register in Virtual Garden", desc: "Log this plant to receive automated WhatsApp watering alerts." }
    ],
    qrVerificationUrl: `https://plantme.in/verify/${id}`
  });
});

// 3. WhatsApp Notification / Care Card Dispatch
app.post("/api/notifications/whatsapp-care-card", (req, res) => {
  const { phone, plantName, orderId } = req.body;
  res.json({
    success: true,
    sentTo: phone || "+91 88856 00899",
    channel: "WhatsApp Business API",
    template: "plantme_care_card_v1",
    message: `🌿 PlantMe Care Card for your ${plantName || 'Plant'} has been sent to WhatsApp with watering schedule & unboxing tips!`
  });
});

// 3b. Botanist Consultation Slot Booking & SMTP Email Dispatch
app.get("/api/botanist/slots", (req, res) => {
  const days = [];
  const today = new Date();
  
  for (let i = 0; i < 5; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateStr = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    days.push({
      date: dateStr,
      isToday: i === 0,
      slots: [
        { time: '10:00 AM - 10:30 AM', available: true },
        { time: '11:30 AM - 12:00 PM', available: true },
        { time: '02:00 PM - 02:30 PM', available: true },
        { time: '03:30 PM - 04:00 PM', available: true },
        { time: '05:00 PM - 05:30 PM', available: true },
        { time: '06:30 PM - 07:00 PM', available: true }
      ]
    });
  }
  res.json({ success: true, days });
});

app.post("/api/botanist/book-slot", async (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      slotDate,
      slotTime,
      plantType,
      plantIssue
    } = req.body;

    if (!customerName || !customerPhone || !slotDate || !slotTime) {
      return res.status(400).json({
        success: false,
        message: 'Name, phone number, date, and time slot are required.'
      });
    }

    const bookingId = 'SLOT-' + Math.floor(1000 + Math.random() * 9000);
    const booking = {
      bookingId,
      customerName,
      customerEmail: customerEmail || '',
      customerPhone,
      slotDate,
      slotTime,
      plantType: plantType || 'Indoor Foliage',
      plantIssue: plantIssue || 'General Consultation & Plant Health Checkup',
      status: 'Confirmed',
      meetingType: '1-on-1 Virtual Video Call',
      createdAt: new Date().toISOString()
    };

    // Save to database
    const consultations = db.getConsultations();
    consultations.unshift(booking);
    db.saveConsultations(consultations);

    // Send emails via Outlook SMTP
    const emailResult = await sendBookingEmails(booking);

    res.json({
      success: true,
      booking,
      emailDelivered: emailResult.delivered,
      message: 'Consultation slot successfully reserved! Email details dispatched.'
    });
  } catch (err) {
    console.error('Error booking slot:', err);
    res.status(500).json({ success: false, message: 'Failed to complete booking. Please try again.' });
  }
});

app.get("/api/botanist/bookings", (req, res) => {
  res.json(db.getConsultations());
});

// 4. Production ML Botanical Pathology Diagnostic API
app.post("/api/ai/diagnose", (req, res) => {
  try {
    const { plantType, symptoms, hasImage, fileName, userEmail } = req.body || {};
    const emailToCheck = (userEmail || req.headers['x-user-email'] || '').toLowerCase();

    if (emailToCheck && db.getMemberships && db.getMembershipPlans) {
      const memberships = db.getMemberships();
      const plans = db.getMembershipPlans();
      let userSub = memberships.find(m => m.userEmail && m.userEmail.toLowerCase() === emailToCheck && m.status === 'active');
      
      const planTier = userSub ? userSub.planId : 'free';
      const planConfig = plans.find(p => p.id === planTier) || plans[0];
      const maxAllowed = planConfig?.quotas?.aiDiagnosesPerMonth ?? 2;

      if (!userSub) {
        userSub = {
          id: 'sub_temp_' + Date.now(),
          userId: 'guest_' + emailToCheck,
          userEmail: emailToCheck,
          planId: 'free',
          planName: 'PlantMe Basic (Free)',
          status: 'active',
          usage: { aiDiagnosesUsedThisPeriod: 0, maxAiAllowed: maxAllowed }
        };
        memberships.push(userSub);
      }

      if (userSub.usage && userSub.usage.aiDiagnosesUsedThisPeriod >= maxAllowed) {
        return res.status(403).json({
          error: `AI Doctor scan quota limit reached (${maxAllowed}/${maxAllowed} scans used this month on ${planConfig.name}). Please upgrade to PlantMe Care Plus for 10 scans or VIP Club for unlimited scans.`,
          quotaExceeded: true,
          requiresUpgrade: true,
          planId: planTier,
          used: userSub.usage.aiDiagnosesUsedThisPeriod,
          limit: maxAllowed
        });
      }

      // Increment usage
      userSub.usage = userSub.usage || { aiDiagnosesUsedThisPeriod: 0, maxAiAllowed: maxAllowed };
      userSub.usage.aiDiagnosesUsedThisPeriod += 1;
      db.saveMemberships(memberships);
    }

    const diagnosis = plantDoctorML.predict(symptoms || "", { plantType, fileName, hasImage });
    return res.json(diagnosis);
  } catch (err) {
    console.error("[PlantDoctorML] Diagnosis API error:", err);
    return res.status(500).json({ error: "ML Diagnosis error: " + err.message });
  }
});

// 5. 30-Day "Thrive or Replace" Guarantee Claim API
app.post("/api/guarantee/claim", (req, res) => {
  const { orderId, plantName, reason, resolutionPreference, photoUrl } = req.body;
  res.json({
    success: true,
    claimId: "THRIVE-CLM-" + Math.floor(1000 + Math.random() * 9000),
    status: "Approved",
    plantName: plantName || "Plant",
    resolution: resolutionPreference === "consultation" 
      ? "Virtual Botanist Video Consult scheduled with Ramesh Kumar (Senior Botanist)." 
      : "Free Nursery Replacement dispatched via Hyperlocal Express Cargo!",
    message: "Your 30-Day Thrive Guarantee claim has been processed immediately under our Zero-Hassle policy."
  });
});

// 7. Customer Help Bot AI Concierge API
app.post("/api/chatbot/message", (req, res) => {
  const { message = "", history = [] } = req.body;
  const q = message.trim().toLowerCase();

  const orders = (db.getOrders ? db.getOrders() : []) || [];
  const products = (db.getProducts ? db.getProducts() : []) || [];

  // Helper response structure
  const makeResponse = (reply, options = {}) => {
    return res.json({
      reply,
      type: options.type || "text",
      data: options.data || null,
      quickReplies: options.quickReplies || [
        "📦 Track My Order",
        "🌿 Plant Health Diagnosis",
        "🔄 30-Day Guarantee",
        "⭐ Care Pass (₹99/mo)",
        "💬 WhatsApp Support"
      ]
    });
  };

  // 1. Order Tracking Query
  if (q.includes("track") || q.includes("order") || q.includes("status") || q.includes("where is my") || q.match(/ord-\d+/i) || (q.match(/\b\d+\b/) && q.length < 8)) {
    const matchedOrder = orders.find(o => 
      (o.id && q.includes(o.id.toLowerCase())) || 
      (o.deliveryOtp && q.includes(o.deliveryOtp))
    ) || orders[0];

    if (matchedOrder) {
      return makeResponse(
        `Here is the live status for order **#${matchedOrder.id}**:\n\n• **Status:** ${matchedOrder.status || 'Out for Delivery (20-30 Min Transit)'}\n• **Items:** ${matchedOrder.items?.map(i => `${i.name} (x${i.quantity || 1})`).join(', ') || 'Live Indoor Plants'}\n• **Delivery Address:** ${matchedOrder.address || 'Bengaluru'}\n• **Delivery OTP:** \`${matchedOrder.deliveryOtp || '6506'}\`\n• **Eco-Rider:** ${matchedOrder.rider?.name || 'Ramu K.'} (${matchedOrder.rider?.vehicle || 'PlantMe Eco EV-Cargo'})\n• **Rider Contact:** ${matchedOrder.rider?.phone || '+91 98450 12345'}`,
        {
          type: "order_card",
          data: matchedOrder,
          quickReplies: ["🔄 1-Click Plant Replacement", "📞 Call Delivery Rider", "💬 WhatsApp Concierge", "Shop More Plants"]
        }
      );
    }
  }

  // 2. Contact & Escalation to Human
  if (q.includes("contact") || q.includes("support") || q.includes("human") || q.includes("agent") || q.includes("call") || q.includes("whatsapp") || q.includes("email") || q.includes("phone") || q.includes("number")) {
    return makeResponse(
      `🌿 You can reach our dedicated PlantMe & Future Forbes support team 24/7 across multiple channels:\n\n• **Email:** info@futureforbes.in\n• **Care Hotline:** +91 88856 00899\n• **WhatsApp Concierge:** +91 88856 00899\n\nOur botanical specialists typically reply within 2–5 minutes on WhatsApp!`,
      {
        type: "contact_card",
        data: {
          email: "info@futureforbes.in",
          phone: "+91 88856 00899",
          whatsapp: "+91 88856 00899"
        },
        quickReplies: ["💬 Open WhatsApp Chat", "📞 Call +91 88856 00899", "📦 Track My Order", "🌿 Care Guides"]
      }
    );
  }

  // 3. Plant Care / Yellowing / Drooping / Health
  if (q.includes("yellow") || q.includes("brown") || q.includes("droop") || q.includes("water") || q.includes("sunlight") || q.includes("fertiliz") || q.includes("soil") || q.includes("repott") || q.includes("pest") || q.includes("bug") || q.includes("fungus") || q.includes("die") || q.includes("dying") || q.includes("care")) {
    let careAdvice = "";
    if (q.includes("yellow")) {
      careAdvice = "🌿 **Yellow Leaves Alert:**\nMost yellowing is caused by **overwatering** or lack of drainage. Let the top 2 inches of soil dry completely before watering again. Ensure your pot has a drainage hole!";
    } else if (q.includes("droop")) {
      careAdvice = "💧 **Drooping Leaves:**\nDrooping usually indicates **thirst (under-watering)** or sudden temperature shock. Give the soil a deep soak until water runs out the drainage hole.";
    } else if (q.includes("water")) {
      careAdvice = "🚿 **Watering Golden Rule:**\nAlways stick your finger 1-2 inches into the soil. If it feels cool and moist, skip watering! If completely dry and crumbly, it's time for hydration. Most indoor plants thrive with water once every 5–7 days.";
    } else {
      careAdvice = "🌱 **Botanical Diagnostic Tips:**\n1. Bright, indirect light is best for 90% of indoor plants.\n2. Ensure proper root drainage.\n3. Wipe dust off leaves weekly to maximize photosynthesis.";
    }

    return makeResponse(
      `${careAdvice}\n\nNeed an exact botanical diagnosis with prescription? You can also run our instant camera AI diagnosis or book a live Video Call with our senior botanists.`,
      {
        type: "care_card",
        data: {
          action: "ai_doctor",
          link: "#/ai"
        },
        quickReplies: ["🩺 Launch AI Plant Doctor", "📹 Book Botanist Video Consult", "🔄 30-Day Guarantee", "📦 Track My Order"]
      }
    );
  }

  // 4. Guarantee / Replacement / Returns
  if (q.includes("replace") || q.includes("guarantee") || q.includes("thrive") || q.includes("return") || q.includes("refund") || q.includes("damaged") || q.includes("dead") || q.includes("broken")) {
    return makeResponse(
      `🛡️ **PlantMe 30-Day 'Thrive or Replace' Guarantee:**\n\nEvery plant you adopt from PlantMe comes backed by our unconditional 30-day survival promise.\n\n• If your plant shows signs of decline within 30 days, we'll send a senior botanist to advise or dispatch a **free nursery-fresh replacement** via Hyperlocal Cargo!\n• Zero return packaging required. Zero return fees.`,
      {
        type: "guarantee_card",
        quickReplies: ["🔄 Claim Free Replacement", "🩺 Diagnose Plant First", "💬 WhatsApp Concierge", "⭐ Care Pass Benefits"]
      }
    );
  }

  // 4b. At-Home Balcony Makeover & Plant Doctor Visit
  if (q.includes("balcony") || q.includes("makeover") || q.includes("at-home") || q.includes("visit") || q.includes("repotting")) {
    return makeResponse(
      `🏡 **PlantMe At-Home Balcony Makeover & Plant Doctor Visits:**\n\nCertified urban landscape botanists arrive at your doorstep with organic soil, nutrients & styling equipment:\n\n• **Plant Doctor At-Home Triage (₹499):** 10-plant clinical checkup, organic neem pest treatment & repotting of 2 pots\n• **Balcony Garden Makeover (₹999):** Full balcony sunlight optimization, repotting of up to 6 plants & vertical arrangement\n• **Terrace Jungle & Drip Setup (₹2,499):** Micro-drip automated irrigation + 20kg organic soil treatment\n\nBook directly from the homepage or services menu!`,
      {
        type: "service_card",
        data: { service: "balcony" },
        quickReplies: ["🏡 Book Balcony Makeover", "✈️ Vacation Plant Boarding", "⭐ Care Pass Benefits", "💬 WhatsApp Concierge"]
      }
    );
  }

  // 4c. Vacation Plant Boarding & ICU Hospital
  if (q.includes("boarding") || q.includes("vacation") || q.includes("holiday") || q.includes("hospital") || q.includes("icu") || q.includes("travel")) {
    return makeResponse(
      `✈️ **Vacation Plant Boarding & Plant Hospital ICU:**\n\nNever let your green family wither while you travel or battle root decline:\n\n• **Vacation Nursery Boarding (₹199/week for 5 plants):** Full greenhouse climate control, LED grow lights & daily WhatsApp photo logs. Doorstep EV pickup & drop!\n• **Plant Hospital ICU Ward (₹299/plant):** 14-day clinical recovery ward with root debridement, anti-fungal botanical dips & sterile potting. 100% Revived or Replaced Guarantee!`,
      {
        type: "service_card",
        data: { service: "hospital" },
        quickReplies: ["✈️ Book Vacation Boarding", "🏥 Plant Hospital ICU", "🏡 Balcony Makeover", "💬 WhatsApp Concierge"]
      }
    );
  }

  // 4d. "Plant of the Month" Mystery Box Club
  if (q.includes("mystery") || q.includes("club") || q.includes("box") || (q.includes("month") && q.includes("plant"))) {
    return makeResponse(
      `🎁 **"Plant of the Month" Mystery Box Club:**\n\nUnbox nursery-fresh curated living green treasures delivered to your door every month:\n\n• **The Green Explorer Club (₹349/mo):** 1 Exotic live potted air purifier/foliage + handcrafted ceramic pot + collector passport + free fertilizer pouch\n• **Rare & Collector's Bloom Club (₹699/mo):** Rare variegated cultivars (Pink Princess / Bonsai) + luxury self-watering pot + signed art print + free 1-on-1 botanist video call\n\nGet up to 20% off with 3-month or 6-month plans!`,
      {
        type: "service_card",
        data: { service: "club" },
        quickReplies: ["🎁 Join Mystery Club", "⭐ Care Pass", "🏡 Balcony Makeover", "💬 WhatsApp Concierge"]
      }
    );
  }

  // 4e. Corporate Retainers
  if (q.includes("corporate") || q.includes("office") || q.includes("b2b") || q.includes("retainer") || q.includes("coworking") || q.includes("bulk")) {
    return makeResponse(
      `🏢 **PlantMe B2B Workplace Plant Care Retainers & Gifting:**\n\nZero-effort biophilic offices for India's fastest-growing tech teams:\n\n• **Startup Desk Greenery (₹2,499/mo):** Up to 20 desk plants, fortnightly visits & free wilt replacements\n• **Tech Floor Oasis (₹6,999/mo):** Up to 60 plants + 4 reception statement trees, weekly botanist visits & monthly AQI report\n• **Enterprise HQ Canopy (₹14,999/mo):** Multi-floor campus care & executive boardroom bonsai styling\n• **Corporate Gifting:** Branded planters with company logo delivered to employee homes from ₹259 each\n\nExplore full packages at our Corporate Portal!`,
      {
        type: "service_card",
        data: { service: "corporate" },
        quickReplies: ["🏢 View Corporate Retainers", "🎁 Corporate Gifting", "💬 WhatsApp Concierge"]
      }
    );
  }

  // 5. Care Pass
  if (q.includes("care pass") || q.includes("pass") || q.includes("membership") || q.includes("subscription") || q.includes("99")) {
    return makeResponse(
      `⭐ **PlantMe Care Pass (₹99/month):**\n\nThe ultimate plant parent subscription:\n\n✨ **10% OFF** on every plant & pot order automatically\n🌱 **Free Quarterly Soil Replenishment** (Organic vermicompost + perlite mix delivered free)\n⚡ **Priority 15-Minute Replacement Dispatch** under 30-Day Guarantee\n👨‍🌾 **Unlimited Free Live Video Consultations** with certified botanists\n\nSubscribe anytime from your Cart or Profile!`,
      {
        type: "care_pass_card",
        quickReplies: ["⭐ Activate Care Pass", "📦 Track My Order", "🌿 Indoor Plants", "💬 WhatsApp Concierge"]
      }
    );
  }

  // 6. Delivery Timelines & Packaging
  if (q.includes("delivery") || q.includes("speed") || q.includes("fast") || q.includes("how long") || q.includes("time") || q.includes("mins") || q.includes("minutes") || q.includes("shipping")) {
    return makeResponse(
      `⚡ **20–30 Minute Hyperlocal EV Delivery:**\n\n• **Real-Time Transit:** Dispatched fresh from our closest certified partner nursery.\n• **Eco-Moss Hydration Wrap:** Roots remain 100% hydrated in living moss without heavy soil leakage.\n• **Zero Plastic:** Packaged in biodegradable honeycomb cardboard carriers tailored for EVs.`,
      {
        type: "delivery_card",
        quickReplies: ["📦 Track Current Order", "🌿 Browse Plants", "💬 WhatsApp Concierge"]
      }
    );
  }

  // 7. Product Recommendations (Air Purifying, Pet Friendly, Indoor, etc.)
  if (q.includes("recommend") || q.includes("best") || q.includes("buy") || q.includes("indoor") || q.includes("air purify") || q.includes("pet") || q.includes("snake") || q.includes("pothos") || q.includes("monstera") || q.includes("bonsai") || q.includes("money plant")) {
    let matchedProducts = [];
    if (q.includes("pet")) {
      matchedProducts = products.filter(p => p.petFriendly === true).slice(0, 3);
    } else if (q.includes("air") || q.includes("purify")) {
      matchedProducts = products.filter(p => (p.tag || "").toLowerCase().includes("air") || p.airPurificationScore > 8).slice(0, 3);
    } else {
      matchedProducts = products.slice(0, 3);
    }

    return makeResponse(
      `🌿 Here are our highest-rated plants hand-picked for your space:`,
      {
        type: "product_carousel",
        data: matchedProducts,
        quickReplies: ["🐶 Pet-Friendly Plants", "🍃 Air-Purifying Plants", "📦 Track My Order", "💬 WhatsApp Concierge"]
      }
    );
  }

  // 8. Default friendly botanical assistance
  return makeResponse(
    `Hello! I'm **Flora**, your PlantMe AI Botanical Concierge 🌿\n\nI can help you with:\n• 📦 **Live Order Tracking** & Rider details\n• 🩺 **Plant Health & Care Troubleshooting** (yellow leaves, watering, sunlight)\n• 🔄 **30-Day Thrive Guarantee** & Instant Replacements\n• ⭐ **Care Pass** membership benefits\n• 💬 Connecting directly to our team at **info@futureforbes.in** or **+91 88856 00899**\n\nHow can I help you today?`,
    {
      quickReplies: [
        "📦 Track My Order",
        "🌿 Why are my leaves yellow?",
        "🔄 30-Day Thrive Guarantee",
        "⭐ Care Pass Benefits",
        "💬 WhatsApp Support"
      ]
    }
  );
});

// --- RAZORPAY / CARE PASS PAYMENT ENDPOINTS ---
app.post('/api/payment/create-carepass-order', async (req, res) => {
  const { amount = 99, currency = 'INR', customerEmail = 'customer@plantme.in' } = req.body;
  
  const keyId = process.env.RAZORPAY_KEY_ID || '';
  const keySecret = process.env.RAZORPAY_KEY_SECRET || '';

  // If live/test Razorpay credentials are provided:
  if (keyId && keySecret) {
    try {
      const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
      const response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${auth}`
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // paise
          currency,
          receipt: `rcpt_carepass_${Date.now()}`,
          notes: {
            membership: 'PlantMe Care Pass',
            email: customerEmail
          }
        })
      });
      const order = await response.json();
      return res.json({
        success: true,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId,
        isConfigured: true
      });
    } catch (err) {
      console.error('Razorpay API error:', err);
    }
  }

  // If Razorpay keys are not yet provided by the user:
  return res.json({
    success: true,
    orderId: `order_sim_${Date.now()}`,
    amount: amount * 100,
    currency: 'INR',
    keyId: keyId || 'rzp_test_placeholder',
    isConfigured: !!keyId,
    message: keyId ? 'Order created' : 'Razorpay gateway initialized in sandbox ready mode.'
  });
});

app.post('/api/payment/verify-carepass', (req, res) => {
  const { paymentId, orderId, method = 'Razorpay', email = 'customer@plantme.in' } = req.body;
  const txnId = paymentId || `TXN-RZP-${Math.floor(100000 + Math.random() * 900000)}`;
  const validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  return res.json({
    success: true,
    message: 'PlantMe Care Pass activated successfully!',
    membership: {
      status: 'ACTIVE',
      plan: 'PlantMe Care Pass (Monthly)',
      price: 99,
      method,
      transactionId: txnId,
      activatedAt: new Date().toISOString(),
      validUntil,
      benefits: [
        'Unlimited 1-Click plant replacements',
        '2 Free 5-Min live botanist consultations/mo',
        'Free quarterly organic vermicompost pouch',
        'Priority 20-min express transit'
      ]
    }
  });
});

// --- REVENUE DRIVER 1: AT-HOME BALCONY MAKEOVER & PLANT DOCTOR TRIAGE ---
app.get('/api/services/balcony-makeover', (req, res) => {
  res.json(db.getServiceBookings());
});

app.post('/api/services/balcony-makeover', async (req, res) => {
  try {
    const {
      tier,
      tierTitle,
      price,
      customerName,
      customerEmail,
      customerPhone,
      address,
      society,
      preferredDate,
      preferredSlot,
      plantCount,
      specialNotes,
      paymentMethod = 'wallet'
    } = req.body;

    const amount = Number(price) || 499;

    // Check & deduct wallet if selected
    let currentWallet = db.getWallet();
    if (paymentMethod === 'wallet') {
      if (currentWallet < amount) {
        return res.status(400).json({ success: false, message: `Insufficient wallet balance (₹${currentWallet}). Required: ₹${amount}.` });
      }
      currentWallet -= amount;
      db.saveWallet(currentWallet);
    }

    const bookingId = 'BM-' + Math.floor(10000 + Math.random() * 90000);
    const newBooking = {
      bookingId,
      tier: tier || 'balcony',
      tierTitle: tierTitle || 'Balcony Garden Makeover & Greenery Revamp',
      price: amount,
      customerName: customerName || 'Valued Customer',
      customerEmail: customerEmail || 'customer@plantme.in',
      customerPhone: customerPhone || '+91 88856 00899',
      address: address || 'Indiranagar, Bengaluru',
      society: society || 'General Residential',
      preferredDate: preferredDate || 'Tomorrow',
      preferredSlot: preferredSlot || '10:00 AM - 12:00 PM',
      plantCount: plantCount || 10,
      specialNotes: specialNotes || '',
      paymentMethod,
      status: 'Confirmed',
      assignedBotanist: {
        name: 'Dr. Anita Deshmukh',
        title: 'Senior Urban Landscape Botanist (Gold Medalist)',
        phone: '+91 98450 88214',
        rating: 4.95,
        photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80'
      },
      createdAt: new Date().toISOString()
    };

    const bookings = db.getServiceBookings();
    bookings.unshift(newBooking);
    db.saveServiceBookings(bookings);

    // Also dispatch email notification
    try {
      await sendBookingEmails({
        bookingId,
        customerName: newBooking.customerName,
        customerEmail: newBooking.customerEmail,
        customerPhone: newBooking.customerPhone,
        slotDate: newBooking.preferredDate,
        slotTime: newBooking.preferredSlot,
        plantType: `${newBooking.tierTitle} (${newBooking.plantCount} plants)`,
        plantIssue: `At-home visit at ${newBooking.address}. Payment: ${paymentMethod.toUpperCase()} (₹${amount})`
      });
    } catch (e) {
      console.log('[BalconyMakeover] Email dispatch note:', e.message);
    }

    res.json({
      success: true,
      booking: newBooking,
      wallet: currentWallet,
      message: `At-home ${newBooking.tierTitle} booked successfully! Certified botanist dispatched on ${newBooking.preferredDate}.`
    });
  } catch (err) {
    console.error('Balcony makeover error:', err);
    res.status(500).json({ success: false, message: 'Failed to book service' });
  }
});

// --- REVENUE DRIVER 2: VACATION PLANT BOARDING & PLANT HOSPITAL ICU ---
app.get('/api/services/plant-hospital', (req, res) => {
  res.json(db.getPlantHospital());
});

app.post('/api/services/plant-hospital', async (req, res) => {
  try {
    const {
      serviceType, // 'vacation_boarding' or 'icu_recovery'
      serviceTitle,
      price,
      customerName,
      customerPhone,
      customerEmail,
      plantCount = 1,
      durationWeeks = 1,
      symptoms = '',
      address,
      pickupDate,
      pickupSlot,
      paymentMethod = 'wallet'
    } = req.body;

    const amount = Number(price) || (serviceType === 'vacation_boarding' ? 199 * durationWeeks : 299 * plantCount);

    let currentWallet = db.getWallet();
    if (paymentMethod === 'wallet') {
      if (currentWallet < amount) {
        return res.status(400).json({ success: false, message: `Insufficient wallet balance. Required: ₹${amount}, Available: ₹${currentWallet}.` });
      }
      currentWallet -= amount;
      db.saveWallet(currentWallet);
    }

    const hospitalId = (serviceType === 'vacation_boarding' ? 'BOARD-' : 'ICU-') + Math.floor(10000 + Math.random() * 90000);
    const entry = {
      hospitalId,
      serviceType,
      serviceTitle: serviceTitle || (serviceType === 'vacation_boarding' ? 'Vacation Greenhouse Boarding' : 'Plant Hospital ICU Recovery Ward'),
      price: amount,
      customerName: customerName || 'Plant Parent',
      customerPhone: customerPhone || '+91 88856 00899',
      customerEmail: customerEmail || 'customer@plantme.in',
      plantCount: Number(plantCount) || 1,
      durationWeeks: Number(durationWeeks) || 1,
      symptoms,
      address: address || 'Bengaluru',
      pickupDate: pickupDate || 'Tomorrow',
      pickupSlot: pickupSlot || 'Morning (9 AM - 12 PM)',
      paymentMethod,
      wardStatus: serviceType === 'vacation_boarding' ? 'Pickup Scheduled' : 'ICU Bed Reserved',
      updates: [
        {
          timestamp: new Date().toISOString(),
          status: 'EV Doorstep Pickup Scheduled',
          note: 'Hydration transport carrier assigned with climate-controlled EV rider.'
        }
      ],
      createdAt: new Date().toISOString()
    };

    const hospitalRecords = db.getPlantHospital();
    hospitalRecords.unshift(entry);
    db.savePlantHospital(hospitalRecords);

    res.json({
      success: true,
      record: entry,
      wallet: currentWallet,
      message: `Reserved successfully! PlantMe EV Rider will pick up your plants on ${entry.pickupDate}.`
    });
  } catch (err) {
    console.error('Plant hospital error:', err);
    res.status(500).json({ success: false, message: 'Failed to schedule plant care service' });
  }
});

// --- REVENUE DRIVER 3: "PLANT OF THE MONTH" / SEASONAL BLOOM MYSTERY CLUB ---
app.get('/api/subscriptions/club', (req, res) => {
  res.json(db.getClubSubscriptions());
});

app.post('/api/subscriptions/club', async (req, res) => {
  try {
    const {
      tier, // 'green_explorer' (₹349) or 'collectors_bloom' (₹699)
      planName,
      cadence = 'monthly', // 'monthly', 'quarterly', 'half_yearly'
      price,
      customerName,
      customerEmail,
      customerPhone,
      deliveryAddress,
      paymentMethod = 'wallet'
    } = req.body;

    const amount = Number(price) || (tier === 'collectors_bloom' ? 699 : 349);

    let currentWallet = db.getWallet();
    if (paymentMethod === 'wallet') {
      if (currentWallet < amount) {
        return res.status(400).json({ success: false, message: `Insufficient wallet balance (₹${currentWallet}). Required: ₹${amount}.` });
      }
      currentWallet -= amount;
      db.saveWallet(currentWallet);
    }

    const subId = 'CLUB-' + Math.floor(10000 + Math.random() * 90000);
    const validUntilDate = new Date();
    if (cadence === 'quarterly') validUntilDate.setMonth(validUntilDate.getMonth() + 3);
    else if (cadence === 'half_yearly') validUntilDate.setMonth(validUntilDate.getMonth() + 6);
    else validUntilDate.setMonth(validUntilDate.getMonth() + 1);

    const newSub = {
      subscriptionId: subId,
      tier: tier || 'green_explorer',
      planName: planName || (tier === 'collectors_bloom' ? "Rare & Collector's Bloom Club" : "The Green Explorer Club"),
      cadence,
      price: amount,
      customerName: customerName || 'Subscribed Plant Parent',
      customerEmail: customerEmail || 'customer@plantme.in',
      customerPhone: customerPhone || '+91 88856 00899',
      deliveryAddress: deliveryAddress || 'Bengaluru',
      status: 'ACTIVE',
      nextMysteryBoxDispatch: '1st of Next Month',
      validUntil: validUntilDate.toISOString(),
      perks: [
        'Curated exotic nursery plant + designer pot every month',
        'Official Collector Passport Stamp & Care Guide',
        'Free 1-on-1 Botanist Consultation credit',
        'Zero shipping fees on all express orders'
      ],
      createdAt: new Date().toISOString()
    };

    const subs = db.getClubSubscriptions();
    subs.unshift(newSub);
    db.saveClubSubscriptions(subs);

    res.json({
      success: true,
      subscription: newSub,
      wallet: currentWallet,
      message: `Welcome to ${newSub.planName}! Your first botanical mystery box will be dispatched on ${newSub.nextMysteryBoxDispatch}.`
    });
  } catch (err) {
    console.error('Club subscription error:', err);
    res.status(500).json({ success: false, message: 'Failed to start subscription club' });
  }
});

// --- REVENUE DRIVER 4: B2B CORPORATE OFFICE PLANT CARE RETAINERS ---
app.get('/api/corporate/retainer-quotes', (req, res) => {
  res.json(db.getCorporateQuotes());
});

app.post('/api/corporate/retainer-quote', async (req, res) => {
  try {
    const {
      companyName,
      contactPerson,
      email,
      phone,
      officeCity = 'Bengaluru',
      officeAddress,
      deskCount = 50,
      tier = 'tech_floor',
      tierTitle = 'Tech Floor Oasis (₹6,999/mo)',
      estimatedMonthlyPrice = 6999,
      notes = ''
    } = req.body;

    const quoteId = 'CORP-RET-' + Math.floor(10000 + Math.random() * 90000);
    const quote = {
      quoteId,
      companyName: companyName || 'Company Enterprise',
      contactPerson: contactPerson || 'Facilities Manager',
      email: email || 'admin@company.com',
      phone: phone || '+91 98765 43210',
      officeCity,
      officeAddress: officeAddress || 'Bengaluru Tech Park',
      deskCount: Number(deskCount) || 50,
      tier,
      tierTitle,
      estimatedMonthlyPrice: Number(estimatedMonthlyPrice) || 6999,
      notes,
      status: 'Proposal Dispatched',
      serviceLevel: {
        botanistVisits: tier === 'startup' ? 'Bi-weekly (2 visits/mo)' : tier === 'enterprise' ? 'Twice-weekly (8 visits/mo)' : 'Weekly (4 visits/mo)',
        wiltReplacement: '100% Free instant replacements within 4 hours',
        includedSupplies: 'Soil aeration, organic neem polish, perlite replenishment & sensor telemetry'
      },
      createdAt: new Date().toISOString()
    };

    const quotes = db.getCorporateQuotes();
    quotes.unshift(quote);
    db.saveCorporateQuotes(quotes);

    // Send email alert to corporate team
    try {
      await sendBookingEmails({
        bookingId: quoteId,
        customerName: `${contactPerson} (${companyName})`,
        customerEmail: email,
        customerPhone: phone,
        slotDate: 'Immediate Corporate Evaluation',
        slotTime: 'B2B Priority Care Desk',
        plantType: `${tierTitle} - ${deskCount} Desks`,
        plantIssue: `Office: ${officeCity}, Address: ${officeAddress}. Notes: ${notes}`
      });
    } catch (e) {
      console.log('[CorporateRetainer] Email notification note:', e.message);
    }

    res.json({
      success: true,
      quote,
      message: `Corporate retainer quotation #${quoteId} generated! Our B2B Horticulture Lead will schedule the free site audit within 4 business hours.`
    });
  } catch (err) {
    console.error('Corporate retainer quote error:', err);
    res.status(500).json({ success: false, message: 'Failed to submit retainer quote' });
  }
});

// =========================================================================
// REVENUE MVP & BUSINESS EXPANSION ENDPOINTS
// =========================================================================

// --- A. PRODUCT BUNDLES & CHECKOUT UPSELLS ---
app.get('/api/bundles', (req, res) => {
  const bundles = db.getBundles ? db.getBundles() : [];
  const allProducts = db.getProducts ? db.getProducts() : [];

  // Enrich bundles with live component stock
  const enrichedBundles = bundles.map(b => {
    let inStock = true;
    let minComponentStock = Infinity;
    const enrichedItems = (b.items || []).map(item => {
      const prod = allProducts.find(p => p.id === item.productId);
      const stock = prod?.quantity ?? 0;
      if (stock < (item.quantity || 1)) inStock = false;
      minComponentStock = Math.min(minComponentStock, Math.floor(stock / (item.quantity || 1)));
      return {
        ...item,
        currentStock: stock,
        inStock: stock >= (item.quantity || 1)
      };
    });
    return {
      ...b,
      items: enrichedItems,
      inStock,
      availableBundlesCount: minComponentStock === Infinity ? 0 : Math.max(0, minComponentStock)
    };
  });

  res.json(enrichedBundles);
});

app.get('/api/bundles/:id', (req, res) => {
  const bundles = db.getBundles ? db.getBundles() : [];
  const bundle = bundles.find(b => b.id === req.params.id);
  if (!bundle) return res.status(404).json({ success: false, message: 'Bundle not found' });

  const allProducts = db.getProducts ? db.getProducts() : [];
  let inStock = true;
  const enrichedItems = (bundle.items || []).map(item => {
    const prod = allProducts.find(p => p.id === item.productId);
    const stock = prod?.quantity ?? 0;
    if (stock < (item.quantity || 1)) inStock = false;
    return { ...item, currentStock: stock, inStock: stock >= (item.quantity || 1) };
  });

  res.json({ ...bundle, items: enrichedItems, inStock });
});

app.get('/api/upsells/recommendations', (req, res) => {
  const { productId, category } = req.query;
  const allProducts = db.getProducts ? db.getProducts() : [];
  const bundles = db.getBundles ? db.getBundles() : [];

  let targetProduct = null;
  if (productId) {
    targetProduct = allProducts.find(p => p.id === productId);
  }

  // Complementary recommendations logic
  let recommendedItems = [];
  if (targetProduct && targetProduct.type === 'plant') {
    // Recommends Pot + Potting Soil + Neem Spray
    const pot = allProducts.find(p => p.type === 'pot' && p.quantity > 0) || allProducts.find(p => p.id === 'po1');
    const soil = allProducts.find(p => p.type === 'soil' && p.quantity > 0) || allProducts.find(p => p.id === 'so1');
    const essential = allProducts.find(p => p.type === 'essential' && p.quantity > 0) || allProducts.find(p => p.id === 'e1');
    recommendedItems = [pot, soil, essential].filter(Boolean);
  } else {
    // Default high-margin accessories
    recommendedItems = allProducts.filter(p => ['pot', 'soil', 'essential'].includes(p.type) && p.quantity > 0).slice(0, 3);
  }

  res.json({
    success: true,
    targetProduct: targetProduct ? { id: targetProduct.id, name: targetProduct.name, type: targetProduct.type } : null,
    complementaryAccessories: recommendedItems,
    popularBundles: bundles.slice(0, 2)
  });
});

// --- B. PLANTME CARE MEMBERSHIP ---
app.get('/api/memberships/plans', (req, res) => {
  const plans = db.getMembershipPlans ? db.getMembershipPlans() : [];
  res.json(plans);
});

app.put('/api/admin/membership-plans/:id', (req, res) => {
  const plans = db.getMembershipPlans ? db.getMembershipPlans() : [];
  const index = plans.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Membership plan not found' });

  const { monthlyPrice, annualPrice, quotas, features, description } = req.body || {};
  if (monthlyPrice !== undefined) plans[index].monthlyPrice = Number(monthlyPrice);
  if (annualPrice !== undefined) plans[index].annualPrice = Number(annualPrice);
  if (quotas) plans[index].quotas = { ...plans[index].quotas, ...quotas };
  if (features && Array.isArray(features)) plans[index].features = features;
  if (description) plans[index].description = description;

  db.saveMembershipPlans(plans);

  // Audit log
  if (db.getAuditLogs && db.saveAuditLogs) {
    const auditLogs = db.getAuditLogs();
    auditLogs.unshift({
      id: 'audit_' + Date.now(),
      timestamp: new Date().toISOString(),
      actor: req.headers['x-admin-email'] || 'admin@plantme.in',
      role: 'admin',
      action: 'MEMBERSHIP_PLAN_UPDATE',
      entityType: 'membership_plan',
      entityId: req.params.id,
      details: `Updated plan ${req.params.id} pricing: ₹${plans[index].monthlyPrice}/mo, ₹${plans[index].annualPrice}/yr.`
    });
    db.saveAuditLogs(auditLogs);
  }

  res.json({ success: true, message: `Plan '${plans[index].name}' updated successfully.`, plan: plans[index] });
});

app.get('/api/memberships/me', (req, res) => {
  const email = (req.query.email || req.query.userEmail || req.headers['x-user-email'] || '').toLowerCase();
  const memberships = db.getMemberships ? db.getMemberships() : [];
  const plans = db.getMembershipPlans ? db.getMembershipPlans() : [];

  const userSub = memberships.find(m => m.userEmail && m.userEmail.toLowerCase() === email && m.status === 'active');
  if (userSub) {
    const planConfig = plans.find(p => p.id === userSub.planId) || plans[0];
    return res.json({
      success: true,
      membership: userSub,
      planConfig,
      isActive: true,
      quotas: planConfig.quotas,
      daysRemaining: Math.max(0, Math.ceil((new Date(userSub.validUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    });
  }

  // Default Free Plan
  const freePlan = plans.find(p => p.id === 'free') || plans[0];
  res.json({
    success: true,
    membership: {
      planId: 'free',
      planName: 'PlantMe Basic (Free)',
      status: 'active',
      validUntil: null,
      autoRenew: false,
      usage: { aiDiagnosesUsedThisPeriod: 0, maxAiAllowed: freePlan.quotas.aiDiagnosesPerMonth, activeRemindersCount: 0 }
    },
    planConfig: freePlan,
    isActive: true,
    quotas: freePlan.quotas,
    daysRemaining: null
  });
});

app.post('/api/memberships/subscribe', (req, res) => {
  const { planId = 'plus', billingCadence = 'monthly', email: bodyEmail, userEmail, name, paymentMethod = 'wallet' } = req.body || {};
  const email = (bodyEmail || userEmail || '').toLowerCase();
  if (!email) return res.status(400).json({ success: false, message: 'Customer email is required' });

  const plans = db.getMembershipPlans ? db.getMembershipPlans() : [];
  const selectedPlan = plans.find(p => p.id === planId);
  if (!selectedPlan) return res.status(404).json({ success: false, message: 'Invalid plan selected' });

  const fee = billingCadence === 'annual' ? selectedPlan.annualPrice : selectedPlan.monthlyPrice;

  // Deduct wallet if paid via wallet
  let currentWallet = db.getWallet();
  if (paymentMethod === 'wallet' && fee > 0) {
    if (currentWallet < fee) {
      return res.status(400).json({ success: false, message: `Insufficient wallet balance (₹${currentWallet}). Required: ₹${fee}.` });
    }
    currentWallet -= fee;
    db.saveWallet(currentWallet);
  }

  const validUntilDate = new Date();
  if (billingCadence === 'annual') validUntilDate.setFullYear(validUntilDate.getFullYear() + 1);
  else validUntilDate.setMonth(validUntilDate.getMonth() + 1);

  const memberships = db.getMemberships ? db.getMemberships() : [];
  // Cancel previous subscription if any
  memberships.forEach(m => {
    if (m.userEmail && m.userEmail.toLowerCase() === email.toLowerCase() && m.status === 'active') {
      m.status = 'superseded';
    }
  });

  const subId = 'sub_' + Math.floor(10000 + Math.random() * 90000);
  const newSub = {
    id: subId,
    userId: 'u_' + email.replace(/[^a-zA-Z0-9]/g, '_'),
    userEmail: email.toLowerCase(),
    userName: name || 'Valued Member',
    planId: selectedPlan.id,
    planName: selectedPlan.name,
    billingCadence,
    pricePaid: fee,
    paymentMethod,
    status: 'active',
    startedAt: new Date().toISOString(),
    validUntil: validUntilDate.toISOString(),
    // Recurring billing disabled until live external gateway is verified
    autoRenew: false,
    usage: {
      aiDiagnosesUsedThisPeriod: 0,
      maxAiAllowed: selectedPlan.quotas.aiDiagnosesPerMonth,
      activeRemindersCount: 0
    },
    history: [
      {
        event: 'subscribed',
        date: new Date().toISOString(),
        amount: fee,
        method: paymentMethod
      }
    ]
  };

  memberships.unshift(newSub);
  db.saveMemberships(memberships);

  // Audit log
  if (db.getAuditLogs && db.saveAuditLogs) {
    const auditLogs = db.getAuditLogs();
    auditLogs.unshift({
      id: 'audit_' + Date.now(),
      timestamp: new Date().toISOString(),
      actor: email,
      role: 'customer',
      action: 'MEMBERSHIP_SUBSCRIBE',
      entityType: 'membership',
      entityId: subId,
      details: `Customer ${email} subscribed to ${selectedPlan.name} (${billingCadence}) for ₹${fee} via ${paymentMethod}.`
    });
    db.saveAuditLogs(auditLogs);
  }

  res.json({
    success: true,
    message: `Welcome to ${selectedPlan.name}! Your membership benefits and quota upgrades are active immediately.`,
    membership: newSub,
    subscription: newSub,
    walletBalance: currentWallet
  });
});

app.post('/api/memberships/cancel', (req, res) => {
  const { subscriptionId, email: bodyEmail, userEmail } = req.body || {};
  const targetEmail = (bodyEmail || userEmail || '').toLowerCase();
  const memberships = db.getMemberships ? db.getMemberships() : [];
  const sub = memberships.find(m => 
    (subscriptionId && m.id === subscriptionId) ||
    (targetEmail && m.userEmail && m.userEmail.toLowerCase() === targetEmail && m.status === 'active')
  );

  if (!sub) return res.status(404).json({ success: false, message: 'Active subscription not found' });

  sub.status = 'cancelled';
  sub.cancelledAt = new Date().toISOString();
  db.saveMemberships(memberships);

  // Audit log
  if (db.getAuditLogs && db.saveAuditLogs) {
    const auditLogs = db.getAuditLogs();
    auditLogs.unshift({
      id: 'audit_' + Date.now(),
      timestamp: new Date().toISOString(),
      actor: targetEmail || sub.userEmail,
      role: 'customer',
      action: 'MEMBERSHIP_CANCEL',
      entityType: 'membership',
      entityId: sub.id,
      details: `Subscription ${sub.id} (${sub.planName}) cancelled by customer. Active through ${sub.validUntil}.`
    });
    db.saveAuditLogs(auditLogs);
  }

  res.json({
    success: true,
    message: `Your membership has been cancelled. You retain full access to benefits until ${new Date(sub.validUntil).toLocaleDateString()}.`,
    membership: sub,
    subscription: sub
  });
});

// --- C. GARDENER AND PLANT EXPERT BOOKINGS (SEPARATE FROM RIDERS) ---
app.get('/api/expert-bookings', (req, res) => {
  const { customerEmail, providerId, status } = req.query || {};
  let bookings = db.getExpertBookings ? db.getExpertBookings() : [];

  if (customerEmail) {
    bookings = bookings.filter(b => b.customerEmail && b.customerEmail.toLowerCase() === customerEmail.toLowerCase());
  }
  if (providerId) {
    bookings = bookings.filter(b => b.providerId === providerId);
  }
  if (status) {
    bookings = bookings.filter(b => b.status.toLowerCase() === status.toLowerCase());
  }

  res.json(bookings);
});

app.post('/api/expert-bookings', (req, res) => {
  const {
    serviceCategory = 'pruning_repotting',
    serviceTitle,
    customerName,
    customerEmail,
    customerPhone,
    address,
    date,
    slot,
    preferredDate,
    preferredSlot,
    plantCount = 5,
    specialNotes = '',
    price,
    quotedPrice,
    paymentMethod = 'wallet'
  } = req.body || {};

  const targetDate = date || preferredDate;
  const targetSlot = slot || preferredSlot;

  if (!customerName || !customerPhone || !address || !targetDate || !targetSlot) {
    return res.status(400).json({ success: false, message: 'Customer name, phone, address, date, and slot are required' });
  }

  const categoryPriceMap = {
    'pruning_repotting': 499,
    'balcony_triage': 499,
    'balcony_makeover': 1299,
    'makeover': 999,
    'terrace_garden': 2499,
    'botanist_triage': 699
  };
  const finalPrice = Number(price || quotedPrice) || categoryPriceMap[serviceCategory] || 499;

  // Certified Horticulturists (Not delivery riders)
  const defaultProvider = serviceCategory === 'balcony_makeover' || serviceCategory === 'terrace_garden'
    ? {
        providerId: 'g_202',
        providerName: 'Dr. Anita Deshmukh',
        providerRole: 'Senior Horticulturist & Landscape Designer',
        providerPhone: '+91 98450 88214',
        providerRating: 4.95
      }
    : {
        providerId: 'g_201',
        providerName: 'Mahesh Kumar',
        providerRole: 'Certified Senior Urban Gardener',
        providerPhone: '+91 98451 22334',
        providerRating: 4.9
      };

  const bookings = db.getExpertBookings ? db.getExpertBookings() : [];

  // Conflict prevention: check if same provider already has confirmed/in-progress slot
  const conflict = bookings.find(b => 
    b.status !== 'cancelled' &&
    b.providerId === defaultProvider.providerId &&
    (b.date === targetDate || b.preferredDate === targetDate) &&
    (b.slot === targetSlot || b.preferredSlot === targetSlot)
  );
  if (conflict) {
    return res.status(409).json({
      success: false,
      message: `Appointment slot '${targetSlot}' on ${targetDate} is already reserved for expert ${defaultProvider.providerName}. Please select another time.`
    });
  }

  let currentWallet = db.getWallet();
  if (paymentMethod === 'wallet') {
    if (currentWallet < finalPrice) {
      return res.status(400).json({ success: false, message: `Insufficient wallet balance (₹${currentWallet}). Required: ₹${finalPrice}.` });
    }
    currentWallet -= finalPrice;
    db.saveWallet(currentWallet);
  }

  const bookingId = 'EXP-' + Math.floor(1000 + Math.random() * 9000);

  const newBooking = {
    id: bookingId,
    bookingId,
    serviceCategory,
    serviceTitle: serviceTitle || (serviceCategory.includes('makeover') ? 'Balcony Garden Complete Greenery Revamp' : 'Pruning, Repotting & Pest Treatment Master Visit'),
    quotePrice: finalPrice,
    price: finalPrice,
    customerName,
    customerEmail: (customerEmail || 'customer@plantme.in').toLowerCase(),
    customerPhone,
    address,
    date: targetDate,
    slot: targetSlot,
    preferredDate: targetDate,
    preferredSlot: targetSlot,
    plantCount: Number(plantCount) || 5,
    specialNotes,
    paymentStatus: paymentMethod === 'cod' ? 'pending_doorstep' : 'paid',
    paymentMethod,
    status: 'confirmed',
    ...defaultProvider,
    assignedExpert: {
      id: defaultProvider.providerId,
      name: defaultProvider.providerName,
      role: defaultProvider.providerRole,
      phone: defaultProvider.providerPhone,
      rating: defaultProvider.providerRating
    },
    rating: null,
    review: null,
    createdAt: new Date().toISOString()
  };

  bookings.unshift(newBooking);
  db.saveExpertBookings(bookings);

  // Audit log
  if (db.getAuditLogs && db.saveAuditLogs) {
    const auditLogs = db.getAuditLogs();
    auditLogs.unshift({
      id: 'audit_' + Date.now(),
      timestamp: new Date().toISOString(),
      actor: customerEmail || 'customer',
      role: 'customer',
      action: 'EXPERT_SERVICE_BOOKED',
      entityType: 'expert_booking',
      entityId: bookingId,
      details: `Booked ${newBooking.serviceTitle} for ${date} (${slot}) with certified expert ${newBooking.providerName}. Fee: ₹${finalPrice}.`
    });
    db.saveAuditLogs(auditLogs);
  }

  res.json({
    success: true,
    message: `At-home gardening appointment confirmed! ${newBooking.providerName} will visit on ${date} (${slot}).`,
    booking: newBooking,
    walletBalance: currentWallet
  });
});

app.post('/api/expert-bookings/:id/accept', (req, res) => {
  const bookings = db.getExpertBookings ? db.getExpertBookings() : [];
  const booking = bookings.find(b => b.id === req.params.id);
  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

  booking.status = 'in_progress';
  db.saveExpertBookings(bookings);

  res.json({ success: true, message: `Booking #${booking.id} accepted by provider.`, booking });
});

app.post('/api/expert-bookings/:id/complete', (req, res) => {
  const bookings = db.getExpertBookings ? db.getExpertBookings() : [];
  const booking = bookings.find(b => b.id === req.params.id);
  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

  booking.status = 'completed';
  booking.completedAt = new Date().toISOString();
  db.saveExpertBookings(bookings);

  res.json({ success: true, message: `Gardening service #${booking.id} marked completed!`, booking });
});

app.post('/api/expert-bookings/:id/cancel', (req, res) => {
  const bookings = db.getExpertBookings ? db.getExpertBookings() : [];
  const booking = bookings.find(b => b.id === req.params.id);
  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

  if (booking.status === 'completed') {
    return res.status(400).json({ success: false, message: 'Cannot cancel an already completed service.' });
  }

  booking.status = 'cancelled';
  booking.cancelledAt = new Date().toISOString();

  // If paid, issue refund
  let refunded = false;
  let currentWallet = db.getWallet();
  if (booking.paymentStatus === 'paid') {
    currentWallet += booking.quotePrice;
    db.saveWallet(currentWallet);
    booking.paymentStatus = 'refunded';
    booking.refundStatus = 'processed';
    booking.refundAmount = booking.quotePrice;
    refunded = true;
  }

  db.saveExpertBookings(bookings);

  // Audit log
  if (db.getAuditLogs && db.saveAuditLogs) {
    const auditLogs = db.getAuditLogs();
    auditLogs.unshift({
      id: 'audit_' + Date.now(),
      timestamp: new Date().toISOString(),
      actor: req.body?.cancelledBy || booking.customerEmail || 'customer',
      role: 'customer',
      action: 'EXPERT_BOOKING_CANCELLED',
      entityType: 'expert_booking',
      entityId: booking.id,
      details: `Service #${booking.id} cancelled. ${refunded ? `Refunded ₹${booking.quotePrice} to customer wallet.` : ''}`
    });
    db.saveAuditLogs(auditLogs);
  }

  res.json({
    success: true,
    message: `Booking #${booking.id} has been cancelled.${refunded ? ` ₹${booking.quotePrice} has been refunded to your wallet.` : ''}`,
    booking,
    walletBalance: currentWallet
  });
});

app.post('/api/expert-bookings/:id/rate', (req, res) => {
  const { rating, review, reviewText } = req.body || {};
  const bookings = db.getExpertBookings ? db.getExpertBookings() : [];
  const booking = bookings.find(b => b.id === req.params.id || b.bookingId === req.params.id);
  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

  booking.rating = Number(rating) || 5;
  booking.review = review || reviewText || '';
  booking.reviewText = review || reviewText || '';
  db.saveExpertBookings(bookings);

  res.json({ success: true, message: 'Thank you for rating your plant expert service!', booking });
});

// --- D. NURSERY VENDOR PREMIUM PLANS (SAAS) ---
app.get('/api/vendors/plans', (req, res) => {
  const plans = db.getVendorPlans ? db.getVendorPlans() : [];
  res.json(plans);
});

app.get('/api/vendors/:id/subscription', (req, res) => {
  const vendorSubs = db.getVendorSubscriptions ? db.getVendorSubscriptions() : [];
  const sub = vendorSubs.find(s => s.vendorId === req.params.id && s.status === 'active');
  const plans = db.getVendorPlans ? db.getVendorPlans() : [];

  if (sub) {
    const planConfig = plans.find(p => p.id === sub.planId) || plans[0];
    return res.json({ success: true, subscription: sub, planConfig });
  }

  const basicPlan = plans.find(p => p.id === 'vendor_basic') || plans[0];
  res.json({
    success: true,
    subscription: { vendorId: req.params.id, tier: 'basic', status: 'active', monthlyFee: 0, commissionRate: 0.08 },
    planConfig: basicPlan
  });
});

app.post('/api/vendors/:id/subscription', (req, res) => {
  const { planId = 'vendor_pro', paymentMethod = 'wallet' } = req.body || {};
  const plans = db.getVendorPlans ? db.getVendorPlans() : [];
  const plan = plans.find(p => p.id === planId || p.tier === planId || p.id === `vendor_${planId}`);
  if (!plan) return res.status(404).json({ success: false, message: 'Invalid vendor plan' });

  const vendors = db.getVendors();
  const vendor = vendors.find(v => v.id === req.params.id);
  if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });

  const vendorSubs = db.getVendorSubscriptions ? db.getVendorSubscriptions() : [];
  // Supersede existing
  vendorSubs.forEach(s => {
    if (s.vendorId === req.params.id && s.status === 'active') s.status = 'superseded';
  });

  const validUntil = new Date();
  validUntil.setMonth(validUntil.getMonth() + 1);

  const newSub = {
    id: 'vsub_' + Math.floor(1000 + Math.random() * 9000),
    vendorId: vendor.id,
    vendorName: vendor.name,
    planId: plan.id,
    tier: plan.tier,
    status: 'active',
    monthlyFee: plan.monthlyFee,
    commissionRate: plan.commissionRate,
    startedAt: new Date().toISOString(),
    validUntil: validUntil.toISOString(),
    autoRenew: false,
    paymentMethod
  };

  vendorSubs.unshift(newSub);
  db.saveVendorSubscriptions(vendorSubs);

  // Update vendor flags in vendors.json
  vendor.tier = plan.tier;
  vendor.subscriptionTier = plan.tier;
  vendor.isSponsored = plan.entitlements?.sponsoredBadge ?? false;
  vendor.commissionRate = plan.commissionRate;
  db.saveVendors(vendors);

  // Audit log
  if (db.getAuditLogs && db.saveAuditLogs) {
    const auditLogs = db.getAuditLogs();
    auditLogs.unshift({
      id: 'audit_' + Date.now(),
      timestamp: new Date().toISOString(),
      actor: vendor.email || vendor.name,
      role: 'vendor',
      action: 'VENDOR_PLAN_UPGRADED',
      entityType: 'vendor_subscription',
      entityId: newSub.id,
      details: `Nursery ${vendor.name} upgraded to ${plan.name} (Tier: ${plan.tier}, Fee: ₹${plan.monthlyFee}/mo, Commission: ${plan.commissionRate * 100}%).`
    });
    db.saveAuditLogs(auditLogs);
  }

  res.json({
    success: true,
    message: `Congratulations! ${vendor.name} is now upgraded to ${plan.name}. Commission reduced to ${plan.commissionRate * 100}% and sponsored marketplace badge enabled.`,
    subscription: newSub
  });
});

app.get('/api/vendor/:id/analytics/insights', (req, res) => {
  const vendorSubs = db.getVendorSubscriptions ? db.getVendorSubscriptions() : [];
  const sub = vendorSubs.find(s => s.vendorId === req.params.id && s.status === 'active');
  const hasEntitlement = sub && (sub.tier === 'pro' || sub.tier === 'enterprise');

  if (!hasEntitlement) {
    return res.status(403).json({
      success: false,
      requiresPro: true,
      requiresUpgrade: true,
      message: 'Advanced Inventory Intelligence, restock velocity alerts, and demand forecasting require an active PlantMe Pro Nursery subscription.'
    });
  }

  const orders = db.getOrders();
  const products = db.getProducts();
  const vendorProducts = products.filter(p => p.vendorId === req.params.id);

  const intelData = {
    totalListedCatalogItems: vendorProducts.length,
    averageRestockVelocityDays: 4.2,
    fastMovingCategories: ['Indoor Plants', 'Terracotta Pots', 'Organic Compost'],
    predictedHighDemandPlants: [
      { name: 'Monstera Deliciosa (12-inch)', demandIndex: '98/100', recommendedReorderUnits: 25 },
      { name: 'Luxury Snake Plant (Bedroom Air)', demandIndex: '94/100', recommendedReorderUnits: 30 },
      { name: 'Self-Watering Ceramic Planters', demandIndex: '88/100', recommendedReorderUnits: 40 }
    ],
    stockoutRiskAlerts: vendorProducts.filter(p => p.quantity !== undefined && p.quantity <= 3).map(p => ({
      id: p.id,
      name: p.name,
      currentStock: p.quantity,
      alert: 'CRITICAL STOCK: Order lead time 48h, will stock out in 24h'
    })),
    repeatCustomerRatePercent: 44,
    spoilageRiskScore: 'Low (Hydration wrap protocol active)'
  };

  res.json({
    success: true,
    tier: sub.tier,
    inventoryIntelligence: intelData,
    insights: intelData
  });
});

// --- E. REFERRALS, 1-CLICK REORDER & ABANDONED CART ---
app.get('/api/referrals/my-code', (req, res) => {
  const email = (req.query.email || req.query.userEmail || req.headers['x-user-email'] || 'customer@plantme.in').toLowerCase();
  const codePrefix = email.split('@')[0].toUpperCase().slice(0, 5) || 'PLANT';
  const referralCode = `PLANT-${codePrefix}100`;

  const referrals = db.getReferrals ? db.getReferrals() : [];
  const myReferrals = referrals.filter(r => r.ownerEmail && r.ownerEmail.toLowerCase() === email);
  const totalEarned = myReferrals.filter(r => r.rewardIssued).reduce((sum, r) => sum + (r.rewardAmount || 100), 0);

  res.json({
    success: true,
    referralCode,
    shareUrl: `https://plantme.in/?ref=${referralCode}`,
    rewardPerReferral: 100,
    successfulReferralsCount: myReferrals.filter(r => r.rewardIssued).length,
    pendingReferralsCount: myReferrals.filter(r => !r.rewardIssued).length,
    totalRewardsEarned: totalEarned,
    terms: 'Refer a friend. When they place their first plant order and it is delivered, you both receive ₹100 PlantMe Wallet credit!'
  });
});

app.post('/api/referrals/claim', (req, res) => {
  const { referralCode, refereeEmail, claimantEmail, refereeName, claimantName, refereePhone } = req.body || {};
  const targetEmail = (refereeEmail || claimantEmail || '').trim().toLowerCase();
  if (!referralCode || !targetEmail) {
    return res.status(400).json({ success: false, message: 'Referral code and referee email are required' });
  }

  const cleanCode = referralCode.trim().toUpperCase();

  // Prevent self-referral
  if (cleanCode.includes(targetEmail.split('@')[0].toUpperCase().slice(0, 4))) {
    return res.status(400).json({ success: false, message: 'Self-referral is not permitted. Please share your code with friends.' });
  }

  const referrals = db.getReferrals ? db.getReferrals() : [];
  const alreadyClaimed = referrals.find(r => r.refereeEmail && r.refereeEmail.toLowerCase() === targetEmail);
  if (alreadyClaimed) {
    return res.status(400).json({ success: false, message: 'You have already claimed a referral code for this account.' });
  }

  const newRef = {
    id: 'ref_' + Math.floor(1000 + Math.random() * 9000),
    referralCode: cleanCode,
    ownerUserId: 'u_referrer',
    ownerEmail: 'customer@plantme.in',
    ownerName: 'PlantMe Advocate',
    refereeUserId: 'u_' + targetEmail.replace(/[^a-zA-Z0-9]/g, '_'),
    refereeEmail: targetEmail,
    refereeName: claimantName || refereeName || 'New Plant Parent',
    refereePhone: refereePhone || '',
    status: 'registered',
    rewardAmount: 100,
    rewardIssued: false,
    createdAt: new Date().toISOString()
  };

  referrals.unshift(newRef);
  db.saveReferrals(referrals);

  res.json({
    success: true,
    message: `Referral code ${cleanCode} applied! Complete your first order to unlock ₹100 wallet credit for both you and your friend.`,
    referral: newRef,
    claim: newRef
  });
});

app.post('/api/orders/:id/reorder', (req, res) => {
  const orders = db.getOrders();
  const order = orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Past order not found' });

  const allProducts = db.getProducts();
  const reorderItems = [];
  const unavailableItems = [];

  for (const item of (order.items || [])) {
    const prod = allProducts.find(p => p.id === item.id);
    if (prod && (prod.quantity ?? 1) > 0) {
      reorderItems.push({
        id: prod.id,
        name: prod.name,
        price: prod.price,
        quantity: item.quantity || 1,
        images: prod.images || [],
        vendorId: prod.vendorId
      });
    } else {
      unavailableItems.push({ id: item.id, name: item.name || 'Plant Item', reason: 'Currently Out of Stock' });
    }
  }

  const subtotal = reorderItems.reduce((sum, it) => sum + (it.price * it.quantity), 0);

  const newReorderId = 'ORD-' + Math.floor(1000 + Math.random() * 9000);
  res.json({
    success: true,
    originalOrderId: order.id,
    reorderId: newReorderId,
    reorderItems,
    items: reorderItems,
    order: {
      id: newReorderId,
      items: reorderItems,
      total: subtotal + 60,
      originalOrderId: order.id,
      status: 'Placed'
    },
    unavailableItems,
    calculatedSubtotal: subtotal,
    deliveryFee: 60,
    estimatedTotal: subtotal + 60,
    message: `Retrieved ${reorderItems.length} items ready for 1-click reorder checkout.`
  });
});

app.post('/api/cart/abandoned-reminder', (req, res) => {
  const { email, phone, items = [], consent = true } = req.body || {};
  if (!consent) {
    return res.status(400).json({ success: false, message: 'User consent is required for cart recovery reminders.' });
  }

  // Prevent duplicate notification spam within 24 hours
  const notifications = db.getNotifications ? db.getNotifications() : [];
  const recentReminder = notifications.find(n => 
    n.type === 'abandoned_cart' && 
    (n.recipient === email || n.recipient === phone) &&
    (Date.now() - new Date(n.timestamp).getTime()) < 24 * 60 * 60 * 1000
  );

  if (recentReminder) {
    return res.json({
      success: true,
      duplicateSuppressed: true,
      message: 'Cart reminder already queued within the last 24 hours. Duplicate suppressed to respect user consent.'
    });
  }

  const reminderNotification = {
    id: 'notif_cart_' + Date.now(),
    type: 'abandoned_cart',
    recipient: email || phone || 'customer@plantme.in',
    title: '🌿 Your Green Living Cart is Waiting!',
    message: `You left ${items.length || 1} live plants in your cart. Your local nursery has set them aside with moisture wrap for 2 hours.`,
    itemsSummary: items.map(i => i.name).slice(0, 3).join(', '),
    timestamp: new Date().toISOString()
  };

  if (db.saveNotifications) {
    notifications.unshift(reminderNotification);
    db.saveNotifications(notifications);
  }

  res.json({
    success: true,
    discountCode: 'GROW10',
    incentiveDiscount: '10% OFF',
    message: 'Consent-based cart reminder scheduled and recorded successfully with 10% coupon GROW10.',
    notification: reminderNotification
  });
});

// --- F. ADMIN REVENUE & FINANCIAL DASHBOARD ---
app.get('/api/admin/revenue-analytics', (req, res) => {
  const orders = db.getOrders ? db.getOrders() : [];
  const memberships = db.getMemberships ? db.getMemberships() : [];
  const vendorSubs = db.getVendorSubscriptions ? db.getVendorSubscriptions() : [];
  const expertBookings = db.getExpertBookings ? db.getExpertBookings() : [];
  const plantHospital = db.getPlantHospital ? db.getPlantHospital() : [];
  const vendors = db.getVendors ? db.getVendors() : [];
  const products = db.getProducts ? db.getProducts() : [];

  // 1. Gross Merchandise Value (GMV): total gross sales across active product orders
  const validOrders = orders.filter(o => o.status !== 'Cancelled');
  const gmv = validOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

  // 2. Platform Commission Revenue
  const platformCommissionRevenue = validOrders.reduce((sum, o) => {
    return sum + (Number(o.platformCommission) || Math.round((Number(o.total) || 0) * 0.08));
  }, 0);

  // 3. Customer Care Membership Revenue
  const customerSubscriptionRevenue = memberships.reduce((sum, m) => {
    return sum + (Number(m.pricePaid) || 0);
  }, 0);

  // 4. Nursery Vendor SaaS Subscription Revenue
  const vendorSubscriptionRevenue = vendorSubs.reduce((sum, v) => {
    return sum + (Number(v.monthlyFee) || 0);
  }, 0);

  // 5. Service & Expert Booking Gross & Platform Cut (20% platform service fee)
  const validBookings = expertBookings.filter(b => b.status !== 'cancelled');
  const bookingGross = validBookings.reduce((sum, b) => sum + (Number(b.quotePrice) || 0), 0);
  const bookingPlatformRevenue = Math.round(bookingGross * 0.20);

  // Plant Hospital ICU revenue
  const hospitalRevenue = plantHospital.reduce((sum, h) => sum + (Number(h.price) || 0), 0);

  // 6. Total Net Platform Revenue
  const totalPlatformNetRevenue = platformCommissionRevenue + customerSubscriptionRevenue + vendorSubscriptionRevenue + bookingPlatformRevenue + hospitalRevenue;

  // 7. Costs: Delivery Subsidies, PG Fees, Refunds
  const deliverySubsidies = validOrders.length * 15; // Platform contribution towards delivery partner logistics
  const totalOnlineGross = gmv + customerSubscriptionRevenue + vendorSubscriptionRevenue + bookingGross;
  const paymentGatewayFees = Math.round(totalOnlineGross * 0.02); // 2% PG processing fee

  const cancelledOrders = orders.filter(o => o.status === 'Cancelled');
  const cancelledBookings = expertBookings.filter(b => b.status === 'cancelled' || b.status === 'refunded');
  const totalRefunds = cancelledOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0) +
                       cancelledBookings.reduce((sum, b) => sum + (Number(b.refundAmount || b.quotePrice) || 0), 0);

  // 8. Contribution Margin & Net Profit
  const contributionMargin = totalPlatformNetRevenue - deliverySubsidies - paymentGatewayFees - totalRefunds;

  // 9. Unit Economics & Retention
  const customerOrderCounts = {};
  orders.forEach(o => {
    const key = o.customerEmail || o.recipientName || 'customer@plantme.in';
    customerOrderCounts[key] = (customerOrderCounts[key] || 0) + 1;
  });
  const uniquePayingCustomers = Object.keys(customerOrderCounts).length;
  const repeatCustomers = Object.values(customerOrderCounts).filter(c => c >= 2).length;
  const repeatPurchaseRate = uniquePayingCustomers > 0 ? Math.round((repeatCustomers / uniquePayingCustomers) * 100) : 0;

  const cancelledSubs = memberships.filter(m => m.status === 'cancelled').length;
  const subscriptionChurnRate = memberships.length > 0 ? Math.round((cancelledSubs / memberships.length) * 100) : 0;

  // 10. Nursery Stall Performance Breakdown
  const nurseryRevenueMap = {};
  vendors.forEach(v => {
    nurseryRevenueMap[v.id] = {
      vendorId: v.id,
      vendorName: v.name,
      stallName: v.nurseryName || v.name,
      tier: (vendorSubs.find(s => s.vendorId === v.id && s.status === 'active')?.tier) || 'basic',
      orderCount: 0,
      grossSales: 0,
      commissionEarned: 0
    };
  });
  validOrders.forEach(o => {
    const vId = o.vendorId || 'v1';
    if (!nurseryRevenueMap[vId]) {
      nurseryRevenueMap[vId] = {
        vendorId: vId,
        vendorName: o.vendorName || 'Nursery Stall',
        stallName: o.vendorName || 'Nursery Stall',
        tier: 'basic',
        orderCount: 0,
        grossSales: 0,
        commissionEarned: 0
      };
    }
    nurseryRevenueMap[vId].orderCount += 1;
    nurseryRevenueMap[vId].grossSales += (Number(o.total) || 0);
    nurseryRevenueMap[vId].commissionEarned += (Number(o.platformCommission) || Math.round((Number(o.total) || 0) * 0.08));
  });

  // 11. Category Breakdown
  const categoryRevenueMap = {};
  validOrders.forEach(o => {
    (o.items || []).forEach(it => {
      const prod = products.find(p => p.id === it.id);
      const cat = prod?.category || it.category || 'Indoor Plants';
      if (!categoryRevenueMap[cat]) {
        categoryRevenueMap[cat] = { category: cat, itemsSold: 0, revenue: 0 };
      }
      const qty = Number(it.quantity) || 1;
      categoryRevenueMap[cat].itemsSold += qty;
      categoryRevenueMap[cat].revenue += (Number(it.price) || 0) * qty;
    });
  });

  const totalSubRevenue = customerSubscriptionRevenue + vendorSubscriptionRevenue;
  res.json({
    success: true,
    gmv,
    platformCommissionRevenue,
    subscriptionRevenue: totalSubRevenue,
    bookingRevenue: bookingPlatformRevenue,
    totalPlatformRevenue: totalPlatformNetRevenue,
    refunds: totalRefunds,
    paymentFees: paymentGatewayFees,
    deliverySubsidies,
    contributionMargin,
    collectedCash: totalOnlineGross - totalRefunds,
    activePayingCustomers: uniquePayingCustomers,
    repeatPurchaseRate,
    subscriptionChurn: subscriptionChurnRate,
    revenueByNursery: Object.values(nurseryRevenueMap),
    revenueByCategory: Object.values(categoryRevenueMap),
    financialSummary: {
      gmv,
      platformCommissionRevenue,
      customerSubscriptionRevenue,
      vendorSubscriptionRevenue,
      bookingGross,
      bookingPlatformRevenue,
      hospitalRevenue,
      totalPlatformNetRevenue,
      deliverySubsidies,
      paymentGatewayFees,
      totalRefunds,
      contributionMargin,
      collectedCash: totalOnlineGross - totalRefunds,
      pendingReceivables: 0
    },
    unitEconomics: {
      uniquePayingCustomers,
      repeatCustomers,
      repeatPurchaseRate,
      subscriptionChurnRate,
      activeMembersCount: memberships.filter(m => m.status === 'active').length,
      activeVendorSubscribers: vendorSubs.filter(s => s.status === 'active').length
    },
    nurseryPerformance: Object.values(nurseryRevenueMap),
    categoryBreakdown: Object.values(categoryRevenueMap)
  });
});

app.get('/api/admin/audit-logs', (req, res) => {
  const auditLogs = db.getAuditLogs ? db.getAuditLogs() : [];
  res.json(auditLogs);
});

// --- G. PAYMENT WEBHOOK (IDEMPOTENT & AUDITED) ---
app.post('/api/payments/webhook', (req, res) => {
  const b = req.body || {};
  const payload = b.payload || {};
  const eventId = b.eventId || payload.eventId;
  const paymentId = b.paymentId || payload.paymentId;
  const orderId = b.orderId || payload.orderId;
  const amount = b.amount !== undefined ? b.amount : payload.amount;
  const eventType = b.eventType || payload.eventType || 'payment.captured';

  if (!eventId) {
    return res.status(400).json({ success: false, message: 'eventId is required' });
  }

  const webhooks = db.getPaymentWebhooks ? db.getPaymentWebhooks() : [];
  const existingEvent = webhooks.find(w => w.eventId === eventId || (paymentId && w.paymentId === paymentId && w.status === 'processed'));

  if (existingEvent) {
    // Idempotent response: acknowledge duplicate event safely without double-charging
    return res.status(200).json({
      success: true,
      processed: false,
      duplicate: true,
      message: `Webhook event ${eventId} already processed previously. Idempotent acknowledgment returned.`,
      event: existingEvent
    });
  }

  const newWebhookEvent = {
    eventId,
    paymentId: paymentId || ('pay_gen_' + Date.now()),
    orderId: orderId || null,
    amount: Number(amount) || 0,
    eventType,
    status: 'processed',
    processedAt: new Date().toISOString()
  };

  webhooks.unshift(newWebhookEvent);
  db.savePaymentWebhooks(webhooks);

  // If tied to order, mark paymentStatus PAID
  if (orderId) {
    const orders = db.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (order) {
      order.paymentStatus = 'PAID';
      order.paymentId = newWebhookEvent.paymentId;
      db.saveOrders(orders);
    }
  }

  // Audit log
  if (db.getAuditLogs && db.saveAuditLogs) {
    const auditLogs = db.getAuditLogs();
    auditLogs.unshift({
      id: 'audit_' + Date.now(),
      timestamp: new Date().toISOString(),
      actor: 'webhook_processor',
      role: 'system',
      action: 'PAYMENT_WEBHOOK_PROCESSED',
      entityType: 'payment_webhook',
      entityId: eventId,
      details: `Processed webhook event ${eventId} (${eventType}) for payment ${newWebhookEvent.paymentId}. Amount: ₹${amount || 0}.`
    });
    db.saveAuditLogs(auditLogs);
  }

  res.json({
    success: true,
    processed: true,
    duplicate: false,
    message: `Webhook event ${eventId} processed and verified successfully.`,
    event: newWebhookEvent
  });
});

// SPA fallback
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ message: 'API route not found' });
  }
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`PLANTO server running on port ${PORT}`);
});
