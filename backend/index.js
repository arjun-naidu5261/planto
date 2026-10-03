import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './db.js';
import { sendBookingEmails } from './mailer.js';
import { plantDoctorML } from './ml/plantDoctorML.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5002;

app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));
app.use(express.static(path.join(__dirname, '../client/dist')));

// --- AUTHENTICATION ---
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const em = (email || '').toLowerCase().trim();
  // Mock customer login check
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
  // Mock vendor login
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
  // Mock admin login
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

  // Check Delivery Riders DB
  const riders = db.getRiders();
  const rider = riders.find(r => 
    r.email.toLowerCase() === em || 
    (em === 'delivery@plantme.in' && r.email.toLowerCase() === 'delivery@planto.in')
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

// --- VENDORS ---
app.get('/api/vendors', (req, res) => {
  const vendors = db.getVendors();
  const { status } = req.query;
  if (status) {
    return res.json(vendors.filter(v => (v.status || 'APPROVED') === status));
  }
  res.json(vendors);
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

app.get('/api/vendors/:id', (req, res) => {
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
    deliveryInstruction
  } = req.body;
  
  // Deduct wallet balance
  const currentWallet = db.getWallet();
  if (currentWallet < total) {
    return res.status(400).json({ success: false, message: 'Insufficient wallet balance' });
  }
  
  const newBalance = currentWallet - total;
  db.saveWallet(newBalance);
  
  const deliveryOtp = `${Math.floor(1000 + Math.random() * 9000)}`;
  const pickupPin = `${Math.floor(1000 + Math.random() * 9000)}`;

  // Save order
  const orders = db.getOrders();
  const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  const newOrder = {
    id: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
    date: new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
    items: items || [],
    status: 'Placed',
    deliveryType: deliveryType || 'PlantMe Express (20 min)',
    total,
    vendorId: vendorId || 'v1',
    vendorName: vendorName || 'PlantMe Certified Local Nursery',
    address: address || 'Flat 402, Green Heights, Indiranagar, Bengaluru',
    buildingImage: buildingImage || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&auto=format&fit=crop&q=80',
    recipientName: recipientName || 'Arjun Patel',
    phone: phone || '+91 88856 00899',
    landmark: landmark || 'Near Gate 2 Security Cabin',
    deliveryInstruction: deliveryInstruction || 'Eco-friendly hydration wrap requested.',
    pickupPin: pickupPin,
    deliveryOtp: deliveryOtp,
    deliveryFee: 60,
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
        title: 'Order Placed',
        desc: 'Customer placed 20-min express plant delivery',
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
  
  res.json({ success: true, order: newOrder, wallet: newBalance });
});

app.put('/api/orders/:id', (req, res) => {
  const { status } = req.body;
  const orders = db.getOrders();
  const index = orders.findIndex(o => o.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Order not found' });
  
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
    pickupPin: order.pickupPin || '4819',
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

// --- ECOSYSTEM: VENDOR / NURSERY PARTNER APIS ---
app.get('/api/vendor/orders', (req, res) => {
  const { vendorId } = req.query;
  const orders = db.getOrders();
  // Filter by vendor if specified, or return all if demo/v1
  const vendorOrders = vendorId 
    ? orders.filter(o => !o.vendorId || o.vendorId === vendorId || o.vendorId === 'v1')
    : orders;
  res.json(vendorOrders);
});

// Nursery accepts incoming order -> status moves to "Preparing"
app.post('/api/vendor/orders/:id/accept', (req, res) => {
  const orders = db.getOrders();
  const index = orders.findIndex(o => o.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Order not found' });

  const order = orders[index];
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
  const { pickupPin } = req.body;
  const orders = db.getOrders();
  const index = orders.findIndex(o => o.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Order not found' });

  const order = orders[index];
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

// Vendor Payouts & Daily Ledger
app.get('/api/vendor/payouts', (req, res) => {
  const orders = db.getOrders();
  const deliveredOrders = orders.filter(o => o.status === 'Delivered');
  const todaySales = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const commissionRate = 0.10; // 10% PlantMe platform fee
  const netEarnings = Math.round(todaySales * (1 - commissionRate));

  res.json({
    success: true,
    todaySales,
    totalOrders: orders.length,
    completedOrders: deliveredOrders.length,
    commissionRate: '10%',
    platformFeeDeducted: Math.round(todaySales * commissionRate),
    netEarnings: netEarnings || 18450,
    settlementStatus: 'Settled to Bank (Every Tuesday)',
    linkedBankAccount: 'State Bank of India ••••• 9874',
    recentTransactions: [
      { id: 'TXN-9012', date: 'Today', orderId: 'ORD-7290', gross: 279, net: 251, status: 'Credited' },
      { id: 'TXN-9011', date: 'Today', orderId: 'ORD-9824', gross: 420, net: 378, status: 'Credited' },
      { id: 'TXN-8840', date: 'Yesterday', orderId: 'ORD-1011', gross: 550, net: 495, status: 'Paid Out' }
    ]
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
  const orders = db.getOrders();
  // Orders waiting for pickup or active delivery
  const available = orders.filter(o => o.status !== 'Delivered');
  res.json(available);
});

// Rider accepts trip
app.post('/api/rider/orders/:id/accept', (req, res) => {
  const { riderId = 'r_101' } = req.body;
  const orders = db.getOrders();
  const index = orders.findIndex(o => o.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Order not found' });

  const order = orders[index];
  order.assignedRiderId = riderId;
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
  const { riderId = 'r_101', deliveryOtp } = req.body;
  const orders = db.getOrders();
  const index = orders.findIndex(o => o.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Order not found' });

  const order = orders[index];
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

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email is required.' });

  // 1. Check Riders Database
  const riders = db.getRiders();
  const rider = riders.find(r => r.email.toLowerCase() === email.toLowerCase());
  if (rider) {
    if (rider.password && rider.password !== password) {
      return res.status(400).json({ success: false, message: 'Incorrect password.' });
    }
    if (rider.status === 'PENDING_APPROVAL') {
      return res.status(403).json({ success: false, message: 'Your Delivery Fleet application is currently PENDING Super Admin verification & approval.' });
    }
    if (rider.status === 'REJECTED') {
      return res.status(403).json({ success: false, message: 'Your application was not approved by Super Admin.' });
    }
    if (rider.status === 'DISABLED' || rider.status === 'BLOCKED') {
      return res.status(403).json({ success: false, message: 'You are blocked by the Admin. Please contact the Admin.' });
    }
    return res.json({
      success: true,
      user: {
        ...rider,
        role: 'Delivery Partner'
      }
    });
  }

  // 2. Demo Rider Fallback Login
  if (email.toLowerCase().includes('delivery') || email.toLowerCase().includes('rider')) {
    return res.json({
      success: true,
      user: {
        name: 'Ramu Prasad',
        email: email,
        role: 'Delivery Partner',
        phone: '+91 98450 11223',
        address: 'Indiranagar 100ft Road, Bengaluru, KA',
        vehicle: 'Hero Electric Scooter',
        vehicleNumber: 'KA-05-EQ-8821',
        drivingLicense: 'KA-01-2023-0098412',
        aadhaar: '4812-9901-3412',
        totalEarnings: 4250,
        completedTrips: 42
      }
    });
  }

  // Nursery Vendor Account Login
  return res.json({
    success: true,
    user: {
      name: 'Suresh Rao',
      email: email,
      role: 'Vendor',
      nurseryName: 'Sai Baba Plant & Pot Stall',
      address: 'Opposite Metro Station Pillar 124, Indiranagar, Bengaluru',
      phone: '+91 98480 22334',
      hours: '7:00 AM - 7:30 PM'
    }
  });
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



// Nursery Stories Endpoint
app.get("/api/stories", (req, res) => {
  res.json([
    {
      id: "story-1",
      stallName: "Green Thumb Nursery",
      title: "Fresh Monsteras Restock",
      tag: "Fresh Today",
      image: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=400",
      featuredProductId: "p1"
    },
    {
      id: "story-2",
      stallName: "Urban Botanist",
      title: "Rare Collector Succulents",
      tag: "Limited Stock",
      image: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=400",
      featuredProductId: "p3"
    },
    {
      id: "story-3",
      stallName: "Flora Sanctuary",
      title: "Organic Neem Soil Mix",
      tag: "Express 15-Min",
      image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400",
      featuredProductId: "p4"
    }
  ]);
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
    const { plantType, symptoms, hasImage, fileName } = req.body;
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
