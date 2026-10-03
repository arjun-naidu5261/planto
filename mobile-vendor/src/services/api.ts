// PlantMe Mobile API service — connects to local backend or production
import { Platform } from 'react-native';

const LOCAL_HOST = Platform.OS === 'android' ? 'http://10.0.2.2:5002/api' : 'http://localhost:5002/api';
const PROD_HOST = 'https://plantme.in/api';

// Use local host when testing locally, otherwise fallback to prod
const BASE_URL = __DEV__ ? LOCAL_HOST : PROD_HOST;

async function fetchJSON(path: string, options?: RequestInit) {
  const token = (globalThis as any).__plantme_token;
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...options,
    });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.message || `HTTP ${res.status}`);
    }
    return res.json();
  } catch (err: any) {
    // If local fails in dev, try PROD_HOST
    if (__DEV__ && BASE_URL !== PROD_HOST) {
      try {
        const fallbackRes = await fetch(`${PROD_HOST}${path}`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          ...options,
        });
        if (fallbackRes.ok) return fallbackRes.json();
      } catch {}
    }
    throw err;
  }
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    fetchJSON('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  // General Products & Catalog
  getProducts: () => fetchJSON('/products'),
  addProduct: (productData: any) =>
    fetchJSON('/products', { method: 'POST', body: JSON.stringify(productData) }),
  deleteProduct: (id: string) =>
    fetchJSON(`/products/${id}`, { method: 'DELETE' }),

  getVendors: () => fetchJSON('/vendors'),
  getOrders: () => fetchJSON('/orders'),
  getWallet: () => fetchJSON('/wallet'),
  getReminders: () => fetchJSON('/reminders'),
  getBlogs: () => fetchJSON('/blogs'),
  getGuides: () => fetchJSON('/guides'),

  checkout: (deliveryType: string, total: number, vendor: string) =>
    fetchJSON('/orders', { method: 'POST', body: JSON.stringify({ deliveryType, total, vendor }) }),

  diagnosePlant: (symptoms: string) =>
    fetchJSON('/ai/diagnose', { method: 'POST', body: JSON.stringify({ symptoms }) }),

  updateProfile: (data: any) =>
    fetchJSON('/auth/profile', { method: 'POST', body: JSON.stringify(data) }).catch(() => ({ success: true })),

  // 🏪 VENDOR PARTNER APIS
  getVendorOrders: (vendorId?: string) =>
    fetchJSON(`/vendor/orders?vendorId=${vendorId || ''}`),
  acceptVendorOrder: (orderId: string) =>
    fetchJSON(`/vendor/orders/${orderId}/accept`, { method: 'POST' }),
  markOrderReady: (orderId: string) =>
    fetchJSON(`/vendor/orders/${orderId}/ready`, { method: 'POST' }),
  verifyPickupPin: (orderId: string, pickupPin: string) =>
    fetchJSON(`/vendor/orders/${orderId}/verify-pickup`, { method: 'POST', body: JSON.stringify({ pickupPin }) }),
  getVendorPayouts: () =>
    fetchJSON('/vendor/payouts'),

  // 🛵 DELIVERY PARTNER (RIDER) APIS
  getRiderStatus: (riderId?: string) =>
    fetchJSON(`/rider/status?riderId=${riderId || 'r_101'}`),
  setRiderStatus: (riderId: string, isOnline: boolean) =>
    fetchJSON('/rider/status', { method: 'POST', body: JSON.stringify({ riderId, isOnline }) }),
  getAvailableRiderOrders: () =>
    fetchJSON('/rider/orders/available'),
  acceptRiderOrder: (orderId: string, riderId?: string) =>
    fetchJSON(`/rider/orders/${orderId}/accept`, { method: 'POST', body: JSON.stringify({ riderId: riderId || 'r_101' }) }),
  updateRiderLocation: (orderId: string, lat: number, lng: number, heading: number = 0) =>
    fetchJSON(`/rider/orders/${orderId}/location`, { method: 'POST', body: JSON.stringify({ lat, lng, heading }) }),
  verifyDeliveryOtp: (orderId: string, deliveryOtp: string, riderId?: string) =>
    fetchJSON(`/rider/orders/${orderId}/verify-delivery`, { method: 'POST', body: JSON.stringify({ deliveryOtp, riderId: riderId || 'r_101' }) }),
  getRiderEarnings: (riderId?: string) =>
    fetchJSON(`/rider/earnings?riderId=${riderId || 'r_101'}`),
};
