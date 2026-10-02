import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';

// Layout Components
import Header from './components/Header';
import Footer from './components/Footer';
import MobileBottomNav from './components/MobileBottomNav';
import LeavesAnimation from './components/LeavesAnimation';
import SvgIcons from './components/SvgIcons';

// Modal overlays
import QRScanModal from './components/modals/QRScanModal';
import AddProductModal from './components/modals/AddProductModal';
import AddReminderModal from './components/modals/AddReminderModal';
import QRDownloadModal from './components/modals/QRDownloadModal';
import CategoryModal from './components/modals/CategoryModal';
import LoginModal from './components/modals/LoginModal';
import ProfileModal from './components/modals/ProfileModal';
import PlantBirthCertificateModal from './components/modals/PlantBirthCertificateModal';
import FreeSaplingGiftModal from './components/modals/FreeSaplingGiftModal';
import InstantReplacementModal from './components/modals/InstantReplacementModal';
import BotanistConsultationModal from './components/modals/BotanistConsultationModal';
import BalconyMakeoverModal from './components/modals/BalconyMakeoverModal';
import SubscriptionClubModal from './components/modals/SubscriptionClubModal';
import PlantHospitalModal from './components/modals/PlantHospitalModal';
import CustomerHelpBot from './components/CustomerHelpBot';

// Pages
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import MapPage from './pages/MapPage';
import StallPage from './pages/StallPage';
import ProductPage from './pages/ProductPage';
import AIDiagnosticsPage from './pages/AIDiagnosticsPage';
import VendorDashboardPage from './pages/VendorDashboardPage';
import AdminPortalPage from './pages/AdminPortalPage';
import DeliveryDashboardPage from './pages/DeliveryDashboardPage';
import CommunityPage from './pages/CommunityPage';
import CartPage from './pages/CartPage';
import ProfilePage from './pages/ProfilePage';
import SeasonalPage from './pages/SeasonalPage';
import VirtualGardenPage from './pages/VirtualGardenPage';
import NurseriesPage from './pages/NurseriesPage';
import CorporateGiftingPage from './pages/CorporateGiftingPage';

export default function App() {
  return (
    <AppProvider>
      <Router>
        {/* SVG Icon Definitions Library */}
        <SvgIcons />

        {/* Sticky Header */}
        <Header />

        {/* Main View Router Container */}
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/nurseries" element={<Navigate to="/" replace />} />
            <Route path="/category/:name" element={<CategoryPage />} />
            <Route path="/map" element={<Navigate to="/" replace />} />
            <Route path="/stall/:id" element={<Navigate to="/" replace />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/ai" element={<AIDiagnosticsPage />} />
            <Route path="/vendor" element={<VendorDashboardPage />} />
            <Route path="/admin" element={<AdminPortalPage />} />
            <Route path="/delivery" element={<DeliveryDashboardPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/profile" element={<ProfilePage defaultTab="dashboard" />} />
            <Route path="/wishlist" element={<ProfilePage defaultTab="wishlist" />} />
            <Route path="/seasonal/:season" element={<SeasonalPage />} />
            <Route path="/garden" element={<VirtualGardenPage />} />
            <Route path="/corporate" element={<CorporateGiftingPage />} />
          </Routes>
        </main>

        {/* Sticky Footer */}
        <Footer />

        {/* MOBILE BOTTOM NAVIGATION BAR */}
        <MobileBottomNav />

        {/* Global Modals container */}
        <QRScanModal />
        <AddProductModal />
        <AddReminderModal />
        <QRDownloadModal />
        <CategoryModal />
        <LoginModal />
        <ProfileModal />
        <PlantBirthCertificateModal />
        <FreeSaplingGiftModal />
        <InstantReplacementModal />
        <BotanistConsultationModal />
        <BalconyMakeoverModal />
        <SubscriptionClubModal />
        <PlantHospitalModal />

        {/* 24/7 AI Botanical Concierge Chatbot */}
        <CustomerHelpBot />
      </Router>
    </AppProvider>
  );
}
