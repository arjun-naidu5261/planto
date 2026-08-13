import React, { createContext, useState, useEffect, useContext } from 'react';
import { api } from '../services/api';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [guides, setGuides] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [orders, setOrders] = useState([]);
  const [wallet, setWallet] = useState(1500);
  const [loading, setLoading] = useState(true);

  // Dark Mode
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Modals Visibility
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showQRDownload, setShowQRDownload] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategoryName, setSelectedCategoryName] = useState('');
  const [activeVendorId, setActiveVendorId] = useState('v1');
  const [editingProduct, setEditingProduct] = useState(null); // for edit product form
  const [loginPresetEmail, setLoginPresetEmail] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Sync auth state with localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('planto_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setIsLoggedIn(true);
      setCurrentUser(parsed);
    }
    
    // Load initial data
    loadAllData();
    
    // Check saved theme
    const savedTheme = localStorage.getItem('planto_theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Theme Toggle Effect
  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const nextTheme = !prev;
      if (nextTheme) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('planto_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('planto_theme', 'light');
      }
      return nextTheme;
    });
  };

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [vList, pList, bList, gList, oList, rList, wData] = await Promise.all([
        api.getVendors(),
        api.getProducts(),
        api.getBlogs(),
        api.getGuides(),
        api.getOrders(),
        api.getReminders(),
        api.getWallet()
      ]);
      setVendors(vList);
      setProducts(pList);
      setBlogs(bList);
      setGuides(gList);
      setOrders(oList);
      setReminders(rList);
      setWallet(wData.wallet);
    } catch (err) {
      console.error("Error loading data from API:", err);
    } finally {
      setLoading(false);
    }
  };

  // Reload lists if changes occur
  const refreshVendors = async () => {
    const vList = await api.getVendors();
    setVendors(vList);
  };

  const refreshProducts = async () => {
    const pList = await api.getProducts();
    setProducts(pList);
  };

  const refreshReminders = async () => {
    const rList = await api.getReminders();
    setReminders(rList);
  };

  const refreshOrders = async () => {
    const oList = await api.getOrders();
    setOrders(oList);
  };

  const refreshWallet = async () => {
    const wData = await api.getWallet();
    setWallet(wData.wallet);
  };

  // Login
  const loginUser = async (email, password) => {
    try {
      const res = await api.login(email, password);
      if (res.success) {
        setIsLoggedIn(true);
        setCurrentUser(res.user);
        localStorage.setItem('planto_user', JSON.stringify(res.user));
        if (res.user.wallet !== undefined) {
          setWallet(res.user.wallet);
        }
        await loadAllData();
        return { success: true };
      }
      return { success: false, message: 'Invalid response' };
    } catch (err) {
      return { success: false, message: err.message || 'Login failed' };
    }
  };

  // Logout
  const logoutUser = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    localStorage.removeItem('planto_user');
  };

  // Update User Profile details
  const updateUserProfile = (updatedFields) => {
    setCurrentUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updatedFields };
      localStorage.setItem('planto_user', JSON.stringify(updated));
      return updated;
    });
  };

  // Cart Operations
  const addToCart = (product, quantity = 1) => {
    if (!isLoggedIn) {
      alert("Please login first to add items to your cart.");
      return false;
    }
    
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
    return true;
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateCartQty = (productId, qty) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, quantity: qty } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Wishlist
  const toggleWishlist = (productId) => {
    setWishlist((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      }
      return [...prev, productId];
    });
  };

  // Checkout
  const checkout = async (deliveryType, total, vendorName) => {
    if (!isLoggedIn) return { success: false, message: 'Please login' };
    
    const items = cart.map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity
    }));

    try {
      const res = await api.placeOrder({
        items,
        deliveryType,
        total,
        vendorName
      });

      if (res.success) {
        setCart([]);
        await refreshOrders();
        await refreshWallet();
        return { success: true };
      }
      return { success: false, message: 'Order placement failed' };
    } catch (err) {
      return { success: false, message: err.message || 'Checkout failed' };
    }
  };

  // Add Wallet Funds
  const addWalletFunds = async (amount) => {
    try {
      const res = await api.updateWallet(amount);
      setWallet(res.wallet);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // Add Reminder
  const addReminder = async (reminderData) => {
    try {
      await api.addReminder(reminderData);
      await refreshReminders();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message || 'Failed to add reminder' };
    }
  };

  // Toggle Reminder
  const toggleReminderActive = async (id, active) => {
    try {
      await api.updateReminder(id, { active });
      await refreshReminders();
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Reminder
  const deleteReminder = async (id) => {
    try {
      await api.deleteReminder(id);
      await refreshReminders();
    } catch (err) {
      console.error(err);
    }
  };

  // Add Product (Vendor)
  const addProduct = async (productData) => {
    try {
      await api.addProduct(productData);
      await refreshProducts();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // Update Product (Vendor)
  const updateProduct = async (id, productData) => {
    try {
      await api.updateProduct(id, productData);
      await refreshProducts();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // Delete Product (Vendor)
  const deleteProduct = async (id) => {
    try {
      await api.deleteProduct(id);
      await refreshProducts();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // Update Order Status (Delivery Partner / Admin)
  const updateOrderStatus = async (id, status) => {
    try {
      await api.updateOrderStatus(id, status);
      await refreshOrders();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  return (
    <AppContext.Provider
      value={{
        cart,
        wishlist,
        isLoggedIn,
        currentUser,
        vendors,
        products,
        blogs,
        guides,
        reminders,
        orders,
        wallet,
        loading,
        isDarkMode,
        toggleDarkMode,
        showQRScanner, setShowQRScanner,
        showLogin, setShowLogin,
        showProfileModal, setShowProfileModal,
        loginPresetEmail, setLoginPresetEmail,
        showAddReminder, setShowAddReminder,
        showAddProduct, setShowAddProduct,
        showQRDownload, setShowQRDownload,
        showCategoryModal, setShowCategoryModal,
        selectedCategoryName, setSelectedCategoryName,
        activeVendorId, setActiveVendorId,
        editingProduct, setEditingProduct,
         loginUser,
         logoutUser,
         updateUserProfile,
         addToCart,
        removeFromCart,
        updateCartQty,
        clearCart,
        toggleWishlist,
        checkout,
        addWalletFunds,
        addReminder,
        toggleReminderActive,
        deleteReminder,
        addProduct,
        updateProduct,
        deleteProduct,
        updateOrderStatus,
        loadAllData,
        refreshVendors
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
