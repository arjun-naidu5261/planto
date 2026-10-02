// PlantMe API service — connects to the same backend at port 3001
const BASE_URL = 'http://localhost:3001/api';

async function fetchJSON(path: string, options?: RequestInit) {
  const token = globalThis.__plantme_token;
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export const api = {
  login: (email: string, password: string) =>
    fetchJSON('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  getProducts: () => fetchJSON('/products'),
  getVendors: () => fetchJSON('/vendors'),
  getOrders: () => fetchJSON('/orders'),
  getWallet: () => fetchJSON('/wallet'),
  getReminders: () => fetchJSON('/reminders'),
  getBlogs: () => fetchJSON('/blogs'),
  getGuides: () => fetchJSON('/guides'),

  checkout: (deliveryType: string, total: number, vendor: string) =>
    fetchJSON('/checkout', { method: 'POST', body: JSON.stringify({ deliveryType, total, vendor }) }),

  diagnosePlant: (symptoms: string) =>
    fetchJSON('/ai/diagnose', { method: 'POST', body: JSON.stringify({ symptoms }) }),
};
