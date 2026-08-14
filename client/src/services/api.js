const API_BASE = 'http://localhost:5002/api';

const handleResponse = async (res) => {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Something went wrong');
  }
  return res.json();
};

export const api = {
  // Auth
  login: async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
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
  }
};
