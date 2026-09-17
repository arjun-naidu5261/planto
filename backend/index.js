import express from 'express';
import cors from 'cors';
import { db } from './db.js';

const app = express();
const PORT = process.env.PORT || 5002;

app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// --- AUTHENTICATION ---
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  // Mock customer login check
  if (email === 'customer@planto.in' && password === 'planto123') {
    return res.json({
      success: true,
      user: {
        email,
        name: 'Suhas K.',
        role: 'Customer',
        wallet: db.getWallet()
      }
    });
  }
  // Mock vendor login
  if (email === 'vendor@planto.in' && (password === 'planto123' || password === 'vendor123')) {
    return res.json({
      success: true,
      user: {
        email,
        name: 'Suresh Rao',
        role: 'Vendor',
        vendorId: 'v1'
      }
    });
  }
  // Mock admin login
  if (email === 'admin@planto.in' && (password === 'admin123' || password === 'planto123')) {
    return res.json({
      success: true,
      user: {
        email,
        name: 'PLANTO Controller',
        role: 'Admin'
      }
    });
  }

  // Check Delivery Riders DB
  const riders = db.getRiders();
  const rider = riders.find(r => r.email.toLowerCase() === email.toLowerCase());
  if (rider) {
    if (rider.password && rider.password !== password) {
      return res.status(401).json({ success: false, message: 'Invalid password. Please check your credentials.' });
    }
    if (rider.status === 'PENDING_APPROVAL') {
      return res.status(403).json({ success: false, message: 'Your Delivery Rider Application is under Super Admin verification. You will be able to log in once approved.' });
    }
    if (rider.status === 'REJECTED') {
      return res.status(403).json({ success: false, message: 'Your Delivery Rider Application was rejected by Super Admin.' });
    }
    return res.json({
      success: true,
      user: {
        email: rider.email,
        name: rider.name,
        role: 'Delivery Partner',
        partnerId: rider.id,
        status: rider.status
      }
    });
  }

  return res.status(401).json({ success: false, message: 'Invalid credentials or user not registered.' });
});

// --- VENDORS ---
app.get('/api/vendors', (req, res) => {
  res.json(db.getVendors());
});

app.post('/api/vendors/register', (req, res) => {
  const vendors = db.getVendors();
  const { name, email, password, phone, address, nurseryName, hours } = req.body;

  const newVendor = {
    id: 'v_' + Date.now(),
    name: nurseryName || `${name}'s Nursery Stall`,
    owner: name || 'Nursery Owner',
    email: email || '',
    password: password || '',
    type: 'Roadside Seller',
    distance: '1.0 km',
    rating: 5.0,
    reviewsCount: 0,
    isOpen: true,
    phone: phone || '+91 98480 22334',
    hours: hours || '7:00 AM - 7:30 PM',
    coords: { x: 50, y: 50 },
    lat: 12.9716,
    lng: 77.5946,
    address: address || 'Bengaluru, KA',
    googleMapsUrl: 'https://maps.google.com',
    photos: ['https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=600&q=80'],
    reviews: []
  };

  vendors.push(newVendor);
  db.saveVendors(vendors);
  res.json({ success: true, vendor: newVendor });
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
  const { category, type } = req.query;
  let products = db.getProducts();
  
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
  const { items, deliveryType, total, vendorName } = req.body;
  
  // Deduct wallet balance
  const currentWallet = db.getWallet();
  if (currentWallet < total) {
    return res.status(400).json({ success: false, message: 'Insufficient wallet balance' });
  }
  
  const newBalance = currentWallet - total;
  db.saveWallet(newBalance);
  
  // Save order
  const orders = db.getOrders();
  const newOrder = {
    id: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
    date: new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
    items,
    status: 'Confirmed',
    deliveryType,
    total,
    vendorName: vendorName || 'Planto Hub'
  };
  
  orders.push(newOrder);
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

app.listen(PORT, () => {
  console.log(`PLANTO server running on port ${PORT}`);
});
// Trigger reload 4



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
  res.json({ success: true, message: "Marked as watered today! 💧", plantId });
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
