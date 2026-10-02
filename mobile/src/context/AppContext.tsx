import React, { createContext, useContext, useState } from 'react';
import { api } from '../services/api';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface AppContextType {
  isLoggedIn: boolean;
  currentUser: any;
  cart: CartItem[];
  wishlist: string[];
  wallet: number;
  orders: any[];
  products: any[];
  hasCarePass: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  addToCart: (item: any, qty?: number) => void;
  removeFromCart: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  toggleWishlist: (id: string) => void;
  checkout: (type: string, total: number) => Promise<any>;
  setHasCarePass: (v: boolean) => void;
}

const AppContext = createContext<AppContextType>({} as AppContextType);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [wallet, setWallet] = useState(0);
  const [orders, setOrders] = useState<any[]>([]);
  const [products] = useState<any[]>([]);
  const [hasCarePass, setHasCarePass] = useState(false);

  const login = async (email: string, password: string) => {
    try {
      const res = await api.login(email, password);
      if (res.token) {
        (globalThis as any).__plantme_token = res.token;
        setIsLoggedIn(true);
        setCurrentUser(res.user);
        const walletData = await api.getWallet();
        setWallet(walletData.wallet || 0);
        const ordersData = await api.getOrders();
        setOrders(ordersData || []);
        return true;
      }
    } catch {}
    return false;
  };

  const logout = () => {
    (globalThis as any).__plantme_token = null;
    setIsLoggedIn(false);
    setCurrentUser(null);
    setCart([]);
  };

  const addToCart = (item: any, qty = 1) => {
    setCart(prev => {
      const exists = prev.find(c => c.id === item.id);
      if (exists) {
        return prev.map(c => c.id === item.id ? { ...c, quantity: c.quantity + qty } : c);
      }
      return [...prev, {
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: qty,
        image: item.images?.[0] || '',
      }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(c => c.id !== id));
  };

  const updateQty = (id: string, qty: number) => {
    if (qty <= 0) return removeFromCart(id);
    setCart(prev => prev.map(c => c.id === id ? { ...c, quantity: qty } : c));
  };

  const clearCart = () => setCart([]);

  const toggleWishlist = (id: string) => {
    setWishlist(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const checkout = async (deliveryType: string, total: number) => {
    try {
      const res = await api.checkout(deliveryType, total, 'PlantMe Express Hub');
      if (res.success) {
        clearCart();
        setOrders(prev => [res.order, ...prev]);
        setWallet(w => Math.max(0, w - total));
      }
      return res;
    } catch {
      return { success: false };
    }
  };

  return (
    <AppContext.Provider value={{
      isLoggedIn, currentUser, cart, wishlist, wallet, orders, products, hasCarePass,
      login, logout, addToCart, removeFromCart, updateQty, clearCart,
      toggleWishlist, checkout, setHasCarePass,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
