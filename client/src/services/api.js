export const API_BASE = typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
  ? '/api'
  : (import.meta.env?.VITE_API_URL || 'http://localhost:5002/api');

const handleResponse = async (res) => {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Something went wrong');
  }
  return res.json();
};

export const api = {
  // WhatsApp OTP Auth (OpenWA Gateway)
  sendOtp: async (phone, type = 'login', name = '') => {
    const res = await fetch(`${API_BASE}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, type, name })
    });
    return handleResponse(res);
  },
  verifyOtp: async (phone, otp, type = 'login', name = '', email = '', password = '') => {
    const res = await fetch(`${API_BASE}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp, type, name, email, password })
    });
    return handleResponse(res);
  },
  resendOtp: async (phone, type = 'login') => {
    const res = await fetch(`${API_BASE}/auth/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, type })
    });
    return handleResponse(res);
  },
  getWhatsAppStatus: async () => {
    const res = await fetch(`${API_BASE}/auth/whatsapp/status`);
    return handleResponse(res);
  },

  // Auth (Legacy Email Fallback)
  login: async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return handleResponse(res);
  },
  register: async (userData) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return handleResponse(res);
  },

  // Vendors
  getVendors: async () => {
    const res = await fetch(`${API_BASE}/vendors`);
    return handleResponse(res);
  },
  addVendor: async (vendorData) => {
    const res = await fetch(`${API_BASE}/vendors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vendorData)
    });
    return handleResponse(res);
  },
  getVendorById: async (id) => {
    const res = await fetch(`${API_BASE}/vendors/${id}`);
    return handleResponse(res);
  },
  addVendorReview: async (vendorId, reviewData) => {
    const res = await fetch(`${API_BASE}/vendors/${vendorId}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reviewData)
    });
    return handleResponse(res);
  },

  // Products
  getProducts: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.type) params.append('type', filters.type);
    
    const res = await fetch(`${API_BASE}/products?${params.toString()}`);
    return handleResponse(res);
  },
  getProductById: async (id) => {
    const res = await fetch(`${API_BASE}/products/${id}`);
    return handleResponse(res);
  },
  addProduct: async (productData) => {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });
    return handleResponse(res);
  },
  updateProduct: async (id, productData) => {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });
    return handleResponse(res);
  },
  deleteProduct: async (id) => {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'DELETE'
    });
    return handleResponse(res);
  },

  // Blogs
  getBlogs: async () => {
    const res = await fetch(`${API_BASE}/blogs`);
    return handleResponse(res);
  },
  addBlog: async (blogData) => {
    const res = await fetch(`${API_BASE}/blogs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(blogData)
    });
    return handleResponse(res);
  },

  // Guides
  getGuides: async () => {
    const res = await fetch(`${API_BASE}/guides`);
    return handleResponse(res);
  },

  // Orders
  getOrders: async () => {
    const res = await fetch(`${API_BASE}/orders`);
    return handleResponse(res);
  },
  placeOrder: async (orderData) => {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    return handleResponse(res);
  },
  updateOrderStatus: async (id, status) => {
    const res = await fetch(`${API_BASE}/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return handleResponse(res);
  },

  // Reminders
  getReminders: async () => {
    const res = await fetch(`${API_BASE}/reminders`);
    return handleResponse(res);
  },
  addReminder: async (reminderData) => {
    const res = await fetch(`${API_BASE}/reminders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reminderData)
    });
    return handleResponse(res);
  },
  updateReminder: async (id, reminderData) => {
    const res = await fetch(`${API_BASE}/reminders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reminderData)
    });
    return handleResponse(res);
  },
  deleteReminder: async (id) => {
    const res = await fetch(`${API_BASE}/reminders/${id}`, {
      method: 'DELETE'
    });
    return handleResponse(res);
  },

  // Wallet
  getWallet: async () => {
    const res = await fetch(`${API_BASE}/wallet`);
    return handleResponse(res);
  },
  updateWallet: async (amount) => {
    const res = await fetch(`${API_BASE}/wallet/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount })
    });
    return handleResponse(res);
  },

  // Categories
  getCategories: async () => {
    const res = await fetch(`${API_BASE}/categories`);
    return handleResponse(res);
  },
  addCategory: async (catData) => {
    const res = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(catData)
    });
    return handleResponse(res);
  },
  deleteCategory: async (id) => {
    const res = await fetch(`${API_BASE}/categories/${id}`, {
      method: 'DELETE'
    });
    return handleResponse(res);
  },

  // Item Types (Platform Product Classifications)
  getItemTypes: async () => {
    const res = await fetch(`${API_BASE}/item-types`);
    return handleResponse(res);
  },
  addItemType: async (itemTypeData) => {
    const res = await fetch(`${API_BASE}/item-types`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemTypeData)
    });
    return handleResponse(res);
  },
  deleteItemType: async (id) => {
    const res = await fetch(`${API_BASE}/item-types/${id}`, {
      method: 'DELETE'
    });
    return handleResponse(res);
  },

  // Customer Experience (CX) APIs
  getWeatherCareTip: async (city = 'Hyderabad') => {
    const res = await fetch(`${API_BASE}/weather/care-tip?city=${encodeURIComponent(city)}`);
    return handleResponse(res);
  },

  getPlantCertificate: async (orderId) => {
    const res = await fetch(`${API_BASE}/care/certificate/${orderId}`);
    return handleResponse(res);
  },

  sendWhatsAppCareCard: async (data) => {
    const res = await fetch(`${API_BASE}/notifications/whatsapp-care-card`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  diagnosePlantAI: async (data) => {
    const res = await fetch(`${API_BASE}/ai/diagnose`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  claimGuarantee: async (data) => {
    const res = await fetch(`${API_BASE}/guarantee/claim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  saveEcoGifting: async (data) => {
    const res = await fetch(`${API_BASE}/gifting/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  createSubscription: async (data) => {
    const res = await fetch(`${API_BASE}/subscriptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  waterGardenPlant: async (plantId) => {
    const res = await fetch(`${API_BASE}/user/garden/water`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plantId })
    });
    return handleResponse(res);
  },

  // Revenue Feature 3: At-Home Balcony Makeover & Plant Doctor Triage
  bookBalconyMakeover: async (data) => {
    const res = await fetch(`${API_BASE}/services/balcony-makeover`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },
  getBalconyBookings: async () => {
    const res = await fetch(`${API_BASE}/services/balcony-makeover`);
    return handleResponse(res);
  },

  // Revenue Feature 6: Vacation Plant Boarding & Plant Hospital ICU
  bookPlantHospital: async (data) => {
    const res = await fetch(`${API_BASE}/services/plant-hospital`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },
  getPlantHospitalRecords: async () => {
    const res = await fetch(`${API_BASE}/services/plant-hospital`);
    return handleResponse(res);
  },

  // Revenue Feature 4: "Plant of the Month" Mystery Box Club
  joinMysteryClub: async (data) => {
    const res = await fetch(`${API_BASE}/subscriptions/club`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },
  getClubSubscriptions: async () => {
    const res = await fetch(`${API_BASE}/subscriptions/club`);
    return handleResponse(res);
  },

  // Revenue Feature 5: B2B Corporate Retainers
  submitCorporateRetainerQuote: async (data) => {
    const res = await fetch(`${API_BASE}/corporate/retainer-quote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },
  getCorporateRetainerQuotes: async () => {
    const res = await fetch(`${API_BASE}/corporate/retainer-quotes`);
    return handleResponse(res);
  },

  // 🌿 3-WAY ECOSYSTEM: CUSTOMER LIVE TRACKING
  getLiveTracking: async (orderId) => {
    const res = await fetch(`${API_BASE}/orders/${orderId}/live-tracking`);
    return handleResponse(res);
  },

  // 🏪 3-WAY ECOSYSTEM: VENDOR STORE DASHBOARD
  getVendorOrders: async (vendorId) => {
    const res = await fetch(`${API_BASE}/vendor/orders?vendorId=${vendorId || ''}`);
    return handleResponse(res);
  },
  acceptVendorOrder: async (orderId) => {
    const res = await fetch(`${API_BASE}/vendor/orders/${orderId}/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return handleResponse(res);
  },
  markOrderReady: async (orderId) => {
    const res = await fetch(`${API_BASE}/vendor/orders/${orderId}/ready`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return handleResponse(res);
  },
  verifyPickupPin: async (orderId, pickupPin) => {
    const res = await fetch(`${API_BASE}/vendor/orders/${orderId}/verify-pickup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pickupPin })
    });
    return handleResponse(res);
  },
  getVendorPayouts: async () => {
    const res = await fetch(`${API_BASE}/vendor/payouts`);
    return handleResponse(res);
  },

  // 🛵 3-WAY ECOSYSTEM: DELIVERY PARTNER (RIDER)
  getRiderStatus: async (riderId) => {
    const res = await fetch(`${API_BASE}/rider/status?riderId=${riderId || ''}`);
    return handleResponse(res);
  },
  setRiderStatus: async (riderId, isOnline) => {
    const res = await fetch(`${API_BASE}/rider/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ riderId, isOnline })
    });
    return handleResponse(res);
  },
  getAvailableRiderOrders: async () => {
    const res = await fetch(`${API_BASE}/rider/orders/available`);
    return handleResponse(res);
  },
  acceptRiderOrder: async (orderId, riderId) => {
    const res = await fetch(`${API_BASE}/rider/orders/${orderId}/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ riderId })
    });
    return handleResponse(res);
  },
  updateRiderLocation: async (orderId, lat, lng, heading) => {
    const res = await fetch(`${API_BASE}/rider/orders/${orderId}/location`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat, lng, heading })
    });
    return handleResponse(res);
  },
  verifyDeliveryOtp: async (orderId, deliveryOtp, riderId) => {
    const res = await fetch(`${API_BASE}/rider/orders/${orderId}/verify-delivery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, deliveryOtp, riderId })
    });
    return handleResponse(res);
  },
  getRiderEarnings: async (riderId) => {
    const res = await fetch(`${API_BASE}/rider/earnings?riderId=${riderId || ''}`);
    return handleResponse(res);
  },

  // 💳 PAYMENT GATEWAY (Razorpay & Dynamic UPI QR)
  createPaymentOrder: async (data) => {
    const res = await fetch(`${API_BASE}/payments/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },
  verifyPayment: async (data) => {
    const res = await fetch(`${API_BASE}/payments/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  // 🔔 NOTIFICATIONS (WhatsApp & In-App)
  getNotifications: async (limit = 30) => {
    const res = await fetch(`${API_BASE}/notifications?limit=${limit}`);
    return handleResponse(res);
  },
  markNotificationRead: async (id) => {
    const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'PATCH'
    });
    return handleResponse(res);
  },

  // 🗺️ TRIP SIMULATOR & SSE
  simulateTripStatus: async (orderId, nextStatus) => {
    const res = await fetch(`${API_BASE}/orders/${orderId}/simulate-trip`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nextStatus })
    });
    return handleResponse(res);
  },

  // 🌱 AI BOTANICAL DIAGNOSTICS TO VIRTUAL GARDEN SYNC
  syncAIDiagnosisToGarden: async (data) => {
    const res = await fetch(`${API_BASE}/ai/sync-to-garden`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  // 📸 NURSERY DAILY LIVE STORIES
  getStories: async () => {
    const res = await fetch(`${API_BASE}/stories`);
    return handleResponse(res);
  },
  reactToStory: async (storyId, data) => {
    const res = await fetch(`${API_BASE}/stories/${storyId}/react`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  // 🌿 REVENUE MVP: PRODUCT BUNDLES & UPSELLS
  getBundles: async () => {
    const res = await fetch(`${API_BASE}/bundles`);
    return handleResponse(res);
  },
  getBundleById: async (id) => {
    const res = await fetch(`${API_BASE}/bundles/${id}`);
    return handleResponse(res);
  },
  getUpsellRecommendations: async (params = {}) => {
    const q = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/upsells/recommendations?${q}`);
    return handleResponse(res);
  },

  // ⭐ REVENUE MVP: PLANTME CARE MEMBERSHIP
  getMembershipPlans: async () => {
    const res = await fetch(`${API_BASE}/memberships/plans`);
    return handleResponse(res);
  },
  getMyMembership: async (email) => {
    const res = await fetch(`${API_BASE}/memberships/me?email=${encodeURIComponent(email || '')}`);
    return handleResponse(res);
  },
  subscribeMembership: async (data) => {
    const res = await fetch(`${API_BASE}/memberships/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },
  cancelMembership: async (data) => {
    const res = await fetch(`${API_BASE}/memberships/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },
  updateAdminMembershipPlan: async (id, data) => {
    const res = await fetch(`${API_BASE}/admin/membership-plans/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  // 🏡 REVENUE MVP: GARDENER & PLANT EXPERT BOOKINGS
  getExpertBookings: async (params = {}) => {
    const q = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/expert-bookings?${q}`);
    return handleResponse(res);
  },
  bookExpertService: async (data) => {
    const res = await fetch(`${API_BASE}/expert-bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },
  cancelExpertBooking: async (id, data = {}) => {
    const res = await fetch(`${API_BASE}/expert-bookings/${id}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },
  rateExpertBooking: async (id, data) => {
    const res = await fetch(`${API_BASE}/expert-bookings/${id}/rate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  // 🏪 REVENUE MVP: NURSERY VENDOR SAAS TIERS
  getVendorPlans: async () => {
    const res = await fetch(`${API_BASE}/vendors/plans`);
    return handleResponse(res);
  },
  getVendorSubscription: async (vendorId) => {
    const res = await fetch(`${API_BASE}/vendors/${vendorId}/subscription`);
    return handleResponse(res);
  },
  subscribeVendorPlan: async (vendorId, data) => {
    const res = await fetch(`${API_BASE}/vendors/${vendorId}/subscription`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },
  getVendorInsights: async (vendorId) => {
    const res = await fetch(`${API_BASE}/vendor/${vendorId}/analytics/insights`);
    return handleResponse(res);
  },

  // 🎁 REVENUE MVP: REFERRALS, REORDERS & CART ABANDONMENT
  getMyReferralCode: async (email) => {
    const res = await fetch(`${API_BASE}/referrals/my-code?email=${encodeURIComponent(email || '')}`);
    return handleResponse(res);
  },
  claimReferral: async (data) => {
    const res = await fetch(`${API_BASE}/referrals/claim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },
  reorderPastOrder: async (orderId) => {
    const res = await fetch(`${API_BASE}/orders/${orderId}/reorder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return handleResponse(res);
  },
  sendAbandonedCartReminder: async (data) => {
    const res = await fetch(`${API_BASE}/cart/abandoned-reminder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  // 📊 REVENUE MVP: ADMIN REVENUE DASHBOARD & AUDIT LOGS
  getAdminRevenueAnalytics: async () => {
    const res = await fetch(`${API_BASE}/admin/revenue-analytics`);
    return handleResponse(res);
  },
  getAdminAuditLogs: async () => {
    const res = await fetch(`${API_BASE}/admin/audit-logs`);
    return handleResponse(res);
  },
  postPaymentWebhook: async (data) => {
    const res = await fetch(`${API_BASE}/payments/webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  }
};



