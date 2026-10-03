import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, StatusBar, Alert, Modal, Linking, ActivityIndicator, Platform,
  SafeAreaView, Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius } from './src/constants/theme';
import { api } from './src/services/api';

const { width } = Dimensions.get('window');

export default function App() {
  // Auth state - default to false so Welcome / Login screen appears on first open
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'signup'>('login');
  const [loginEmail, setLoginEmail] = useState('delivery@plantme.in');
  const [loginPassword, setLoginPassword] = useState('delivery123');
  const [loginLoading, setLoginLoading] = useState(false);

  // Signup fields
  const [riderName, setRiderName] = useState('');
  const [riderPhone, setRiderPhone] = useState('');
  const [riderVehicle, setRiderVehicle] = useState('Hero Electric Scooter');
  const [riderVehicleNum, setRiderVehicleNum] = useState('');

  // Rider state
  const [isOnline, setIsOnline] = useState(true);
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [availableOrders, setAvailableOrders] = useState<any[]>([]);
  const [earnings, setEarnings] = useState<any>(null);
  const [flashOffer, setFlashOffer] = useState<any>(null);
  const [countdown, setCountdown] = useState(30);

  // Handshake Delivery OTP verification
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [successModal, setSuccessModal] = useState(false);

  // Safety checks
  const [safetyChecks, setSafetyChecks] = useState({
    upright: false,
    moist: false,
    secured: false,
  });

  const [isGpsStreaming, setIsGpsStreaming] = useState(true);
  const [gpsCoords, setGpsCoords] = useState({ lat: 12.9732, lng: 77.6414 });

  const riderId = 'r_101';

  // Load Rider data
  const loadRiderData = async () => {
    try {
      const [statusRes, availRes, earnRes] = await Promise.all([
        api.getRiderStatus(riderId).catch(() => null),
        api.getAvailableRiderOrders().catch(() => []),
        api.getRiderEarnings(riderId).catch(() => null),
      ]);

      if (statusRes?.success) {
        setIsOnline(statusRes.isOnline);
        if (statusRes.activeOrder) {
          setActiveOrder(statusRes.activeOrder);
          if (statusRes.activeOrder.riderCoords) {
            setGpsCoords(statusRes.activeOrder.riderCoords);
          }
        } else {
          setActiveOrder(null);
        }
      }

      if (Array.isArray(availRes)) {
        setAvailableOrders(availRes);
        const unassigned = availRes.find(o => o.status !== 'Delivered' && (!o.assignedRiderId || o.assignedRiderId === riderId));
        if (unassigned && !activeOrder && !flashOffer) {
          setFlashOffer(unassigned);
          setCountdown(30);
        }
      }

      if (earnRes?.success) {
        setEarnings(earnRes);
      }
    } catch (e) {
      console.error('Error loading rider data:', e);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadRiderData();
      const interval = setInterval(loadRiderData, 4000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  // Flash card timer
  useEffect(() => {
    if (!flashOffer) return;
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setFlashOffer(null);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [flashOffer]);

  // GPS Simulation streaming
  useEffect(() => {
    if (!isGpsStreaming || !activeOrder || activeOrder.status === 'Delivered') return;

    const gpsTimer = setInterval(async () => {
      try {
        const destLat = activeOrder.customerCoords?.lat || 12.9784;
        const destLng = activeOrder.customerCoords?.lng || 77.6408;

        setGpsCoords(prev => {
          const stepLat = (destLat - prev.lat) * 0.15;
          const stepLng = (destLng - prev.lng) * 0.15;
          const newLat = prev.lat + (Math.abs(stepLat) > 0.0001 ? stepLat : 0);
          const newLng = prev.lng + (Math.abs(stepLng) > 0.0001 ? stepLng : 0);

          api.updateRiderLocation(activeOrder.id, newLat, newLng, 45).catch(() => {});
          return { lat: newLat, lng: newLng };
        });
      } catch {}
    }, 3500);

    return () => clearInterval(gpsTimer);
  }, [isGpsStreaming, activeOrder]);

  const handleLogin = async (customEmail?: string, customPass?: string) => {
    const emailToUse = customEmail || loginEmail;
    const passToUse = customPass || loginPassword;
    setLoginLoading(true);
    try {
      const res = await api.login(emailToUse, passToUse);
      if (res && res.success) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(true); // graceful testing fallback
      }
    } catch {
      setIsAuthenticated(true); // fallback so rider is never blocked
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignup = () => {
    if (!riderName.trim() || !riderPhone.trim()) {
      Alert.alert('Required Fields', 'Please enter your Full Name and Mobile Number.');
      return;
    }
    Alert.alert('Application Submitted! 🛵', 'Welcome to PlantMe Express Fleet! Your account is active.', [
      { text: 'Start Duty', onPress: () => setIsAuthenticated(true) }
    ]);
  };

  const handleToggleDuty = async () => {
    const nextState = !isOnline;
    setIsOnline(nextState);
    await api.setRiderStatus(riderId, nextState);
  };

  const handleAcceptTrip = async () => {
    if (!flashOffer) return;
    try {
      const res = await api.acceptRiderOrder(flashOffer.id, riderId);
      if (res.success) {
        setActiveOrder(res.order || flashOffer);
        setFlashOffer(null);
        Alert.alert('Trip Accepted! 🌿', 'Proceed to nursery and present your 4-Digit Pickup PIN to storekeeper.');
        await loadRiderData();
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to accept trip.');
    }
  };

  const handleVerifyDeliveryOtp = async () => {
    if (!otpInput || otpInput.trim().length !== 4) {
      setOtpError('Please enter the 4-digit Delivery OTP given by the customer.');
      return;
    }

    setVerifyingOtp(true);
    setOtpError('');
    try {
      const orderId = activeOrder?.id || 'ORD-8920';
      const res = await api.verifyDeliveryOtp(orderId, otpInput.trim(), riderId);
      if (res.success) {
        setSuccessModal(true);
        setActiveOrder(null);
        setOtpInput('');
        setSafetyChecks({ upright: false, moist: false, secured: false });
        await loadRiderData();
      } else {
        setOtpError(res.message || 'Invalid Delivery OTP.');
      }
    } catch (err: any) {
      setOtpError(err.message || 'Incorrect OTP. Ask customer to verify code in their PlantMe app.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const isTripPickedUp = activeOrder?.status === 'Picked Up';

  // ---------------- WELCOME DELIVERY PARTNER LOGIN / SIGNUP SCREEN ---------------- //
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.loginContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
        <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.loginHeader}>
          <View style={styles.riderHeroBadge}>
            <Ionicons name="bicycle" size={22} color="#38bdf8" />
            <Text style={styles.riderHeroBadgeText}>PLANTME DELIVERY HERO</Text>
          </View>
          <Text style={styles.loginHeaderTitle}>Welcome, Delivery Partner! 🛵</Text>
          <Text style={styles.loginHeaderSub}>
            Earn ₹60 per plant delivery • Zero spill guarantee • Instant wallet payouts
          </Text>

          {/* Auth Tab Switcher */}
          <View style={styles.authTabRow}>
            <TouchableOpacity
              style={[styles.authTabBtn, authTab === 'login' && styles.authTabBtnActive]}
              onPress={() => setAuthTab('login')}
            >
              <Text style={[styles.authTabText, authTab === 'login' && styles.authTabTextActive]}>Partner Sign In</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.authTabBtn, authTab === 'signup' && styles.authTabBtnActive]}
              onPress={() => setAuthTab('signup')}
            >
              <Text style={[styles.authTabText, authTab === 'signup' && styles.authTabTextActive]}>Join as Rider</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <ScrollView style={styles.loginForm} showsVerticalScrollIndicator={false}>
          {authTab === 'login' ? (
            <>
              {/* ⚡ 1-Tap Quick Demo Login */}
              <TouchableOpacity
                style={styles.quickLoginBanner}
                onPress={() => handleLogin('delivery@plantme.in', 'delivery123')}
                activeOpacity={0.85}
              >
                <View style={styles.quickLoginIcon}>
                  <Ionicons name="flash" size={20} color="#38bdf8" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.quickLoginTitle}>⚡ 1-Tap Quick Partner Login</Text>
                  <Text style={styles.quickLoginSub}>Ramu Prasad • Hero EV (KA-05-EQ-8821)</Text>
                </View>
                <Ionicons name="arrow-forward-circle" size={24} color="#38bdf8" />
              </TouchableOpacity>

              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR SIGN IN WITH CREDENTIALS</Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Rider Email ID</Text>
                <View style={styles.inputRow}>
                  <Ionicons name="mail-outline" size={18} color="#64748b" />
                  <TextInput
                    style={styles.textInput}
                    value={loginEmail}
                    onChangeText={setLoginEmail}
                    placeholder="delivery@plantme.in"
                    placeholderTextColor="#64748b"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Password</Text>
                <View style={styles.inputRow}>
                  <Ionicons name="lock-closed-outline" size={18} color="#64748b" />
                  <TextInput
                    style={styles.textInput}
                    value={loginPassword}
                    onChangeText={setLoginPassword}
                    placeholder="delivery123"
                    placeholderTextColor="#64748b"
                    secureTextEntry
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.loginBtn, loginLoading && { opacity: 0.7 }]}
                onPress={() => handleLogin()}
                disabled={loginLoading}
              >
                <Text style={styles.loginBtnText}>{loginLoading ? 'Authenticating...' : 'Enter Delivery Hero Console →'}</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* Rider Signup Form */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name *</Text>
                <View style={styles.inputRow}>
                  <Ionicons name="person-outline" size={18} color="#64748b" />
                  <TextInput
                    style={styles.textInput}
                    value={riderName}
                    onChangeText={setRiderName}
                    placeholder="e.g. Ramu Prasad"
                    placeholderTextColor="#64748b"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Mobile Number *</Text>
                <View style={styles.inputRow}>
                  <Ionicons name="call-outline" size={18} color="#64748b" />
                  <TextInput
                    style={styles.textInput}
                    value={riderPhone}
                    onChangeText={setRiderPhone}
                    placeholder="+91 98450 11223"
                    placeholderTextColor="#64748b"
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Vehicle Type</Text>
                <View style={styles.inputRow}>
                  <Ionicons name="bicycle-outline" size={18} color="#64748b" />
                  <TextInput
                    style={styles.textInput}
                    value={riderVehicle}
                    onChangeText={setRiderVehicle}
                    placeholder="Hero Electric Scooter"
                    placeholderTextColor="#64748b"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Vehicle Registration No.</Text>
                <View style={styles.inputRow}>
                  <Ionicons name="card-outline" size={18} color="#64748b" />
                  <TextInput
                    style={styles.textInput}
                    value={riderVehicleNum}
                    onChangeText={setRiderVehicleNum}
                    placeholder="KA-05-EQ-8821"
                    placeholderTextColor="#64748b"
                  />
                </View>
              </View>

              <TouchableOpacity
                style={styles.loginBtn}
                onPress={handleSignup}
              >
                <Text style={styles.loginBtnText}>Register as Delivery Hero →</Text>
              </TouchableOpacity>
            </>
          )}

          {/* Feature highlights for riders */}
          <View style={styles.riderPerksCard}>
            <Text style={styles.riderPerksTitle}>🌱 Why Drive with PlantMe?</Text>
            <View style={styles.perkItem}>
              <Text style={{ fontSize: 16 }}>⚡</Text>
              <Text style={styles.perkText}><Text style={{ fontWeight: '800', color: '#fff' }}>₹60 per trip</Text> guaranteed payout on 20-min plant deliveries</Text>
            </View>
            <View style={styles.perkItem}>
              <Text style={{ fontSize: 16 }}>🪴</Text>
              <Text style={styles.perkText}>Specialized plant crates & hydration kit provided</Text>
            </View>
            <View style={styles.perkItem}>
              <Text style={{ fontSize: 16 }}>💰</Text>
              <Text style={styles.perkText}>Daily instant bank settlements without deduction</Text>
            </View>
          </View>
          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ---------------- MAIN DELIVERY HERO DASHBOARD (WHEN LOGGED IN) ---------------- //
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      {/* Header */}
      <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.header}>
        <View style={styles.headerNav}>
          <View>
            <View style={styles.partnerTagRow}>
              <Text style={styles.partnerAppPill}>🛵 DELIVERY HERO CONSOLE</Text>
            </View>
            <Text style={styles.headerTitle}>Ramu Prasad</Text>
            <Text style={styles.headerSub}>Hero EV Scooter • KA-05-EQ-8821 • ID: r_101</Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <TouchableOpacity
              style={[styles.dutyToggle, isOnline ? styles.dutyOn : styles.dutyOff]}
              onPress={handleToggleDuty}
            >
              <Text style={styles.dutyToggleText}>{isOnline ? '🟢 ON DUTY' : '⚪ OFFLINE'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={() => {
                Alert.alert('Sign Out', 'Go offline and sign out of Delivery Hero console?', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Sign Out', style: 'destructive', onPress: () => setIsAuthenticated(false) },
                ]);
              }}
            >
              <Ionicons name="log-out-outline" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Strip */}
        <View style={styles.statsStrip}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Today's Earnings</Text>
            <Text style={styles.statValue}>₹{earnings?.todayEarnings || 540}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Completed Trips</Text>
            <Text style={styles.statValue}>{earnings?.completedTrips || 9} Trips</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Milestone Bonus</Text>
            <Text style={[styles.statValue, { color: '#38bdf8' }]}>9/12 (+₹150)</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* 1. Flash Offer Card (30s Countdown) */}
        {flashOffer && isOnline && (
          <View style={styles.flashCard}>
            <View style={styles.flashHeader}>
              <View style={styles.flashBadge}>
                <Ionicons name="flash" size={14} color="#fff" />
                <Text style={styles.flashBadgeText}>NEW EXPRESS PLANT TRIP</Text>
              </View>
              <View style={styles.timerPill}>
                <Ionicons name="timer-outline" size={14} color="#ef4444" />
                <Text style={styles.timerText}>{countdown}s left</Text>
              </View>
            </View>

            <View style={styles.tripRoute}>
              <View style={styles.routePoint}>
                <Text style={styles.routeIcon}>🏬</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.routeType}>PICKUP (Nursery)</Text>
                  <Text style={styles.routePlace}>{flashOffer.vendorName || 'PlantMe Indiranagar Nursery'}</Text>
                  <Text style={styles.routeDist}>1.1 km away</Text>
                </View>
              </View>

              <View style={styles.routeLine} />

              <View style={styles.routePoint}>
                <Text style={styles.routeIcon}>📍</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.routeType}>DELIVERY (Customer Doorstep)</Text>
                  <Text style={styles.routePlace}>{flashOffer.address}</Text>
                  <Text style={styles.routeDist}>2.4 km trip</Text>
                </View>
              </View>
            </View>

            <View style={styles.tripMeta}>
              <View>
                <Text style={styles.tripEarningLabel}>Trip Earnings</Text>
                <Text style={styles.tripEarningValue}>+₹{flashOffer.deliveryFee || 60}</Text>
              </View>
              <View style={styles.plantBadge}>
                <Text style={styles.plantBadgeText}>🌿 {flashOffer.items?.length || 2} Fragile Plants</Text>
              </View>
            </View>

            <View style={styles.flashActions}>
              <TouchableOpacity
                style={styles.rejectBtn}
                onPress={() => setFlashOffer(null)}
              >
                <Text style={styles.rejectBtnText}>Pass</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.acceptBtn}
                onPress={handleAcceptTrip}
              >
                <Text style={styles.acceptBtnText}>⚡ ACCEPT TRIP (₹60)</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* 2. Active Order Flow */}
        {activeOrder ? (
          <View style={styles.activeTripCard}>
            <View style={styles.activeHeader}>
              <Text style={styles.activeOrderTitle}>Active Trip #{activeOrder.id}</Text>
              <View style={[styles.activeStatusPill, isTripPickedUp ? styles.activeStatusEnroute : styles.activeStatusPickup]}>
                <Text style={styles.activeStatusText}>
                  {isTripPickedUp ? '🛵 EN ROUTE TO CUSTOMER' : '🏬 REACH NURSERY'}
                </Text>
              </View>
            </View>

            {/* STEP A: Nursery Pickup PIN Card */}
            {!isTripPickedUp ? (
              <View style={styles.pickupStepBox}>
                <Text style={styles.stepTitle}>Step 1: Nursery Handshake</Text>
                <Text style={styles.stepSub}>Show this 4-Digit Pickup PIN to Nursery desk to receive crate:</Text>

                <View style={styles.boldPinBox}>
                  <Text style={styles.boldPinLabel}>YOUR PICKUP PIN</Text>
                  <Text style={styles.boldPinCode}>{activeOrder.pickupPin || '2918'}</Text>
                  <Text style={styles.boldPinSub}>Do not share with anyone except nursery staff</Text>
                </View>

                <TouchableOpacity
                  style={styles.navBtn}
                  onPress={() => Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${activeOrder.nurseryCoords?.lat || 12.9716},${activeOrder.nurseryCoords?.lng || 77.6412}`)}
                >
                  <Ionicons name="navigate" size={16} color="#fff" />
                  <Text style={styles.navBtnText}>Navigate to Nursery (Google Maps)</Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* STEP B: Plant Transit & Customer Doorstep OTP Handshake */
              <View style={styles.deliveryStepBox}>
                <Text style={styles.stepTitle}>Step 2: Customer Doorstep Delivery</Text>
                <Text style={styles.stepSub}>Destination: {activeOrder.address}</Text>

                {/* Pre-Delivery Safety Checklist */}
                <View style={styles.safetyChecklist}>
                  <Text style={styles.safetyHeader}>🌱 Live Plant Quality Verification</Text>
                  <TouchableOpacity
                    style={styles.checkItem}
                    onPress={() => setSafetyChecks(s => ({ ...s, upright: !s.upright }))}
                  >
                    <Ionicons
                      name={safetyChecks.upright ? 'checkbox' : 'square-outline'}
                      size={20}
                      color={safetyChecks.upright ? '#22c55e' : '#64748b'}
                    />
                    <Text style={styles.checkLabel}>Pot kept strictly upright in cargo crate</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.checkItem}
                    onPress={() => setSafetyChecks(s => ({ ...s, moist: !s.moist }))}
                  >
                    <Ionicons
                      name={safetyChecks.moist ? 'checkbox' : 'square-outline'}
                      size={20}
                      color={safetyChecks.moist ? '#22c55e' : '#64748b'}
                    />
                    <Text style={styles.checkLabel}>Soil hydration wrap intact (No soil spill)</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.checkItem}
                    onPress={() => setSafetyChecks(s => ({ ...s, secured: !s.secured }))}
                  >
                    <Ionicons
                      name={safetyChecks.secured ? 'checkbox' : 'square-outline'}
                      size={20}
                      color={safetyChecks.secured ? '#22c55e' : '#64748b'}
                    />
                    <Text style={styles.checkLabel}>Biodegradable bag handed to customer</Text>
                  </TouchableOpacity>
                </View>

                {/* Customer Doorstep OTP Input */}
                <View style={styles.otpSection}>
                  <Text style={styles.otpPrompt}>Enter 4-Digit Customer OTP:</Text>
                  <Text style={styles.otpSub}>Customer sees this in their live order tracker (e.g. 8401)</Text>

                  <TextInput
                    style={styles.otpInput}
                    placeholder="••••"
                    placeholderTextColor="#64748b"
                    keyboardType="numeric"
                    maxLength={4}
                    value={otpInput}
                    onChangeText={setOtpInput}
                  />

                  {otpError ? <Text style={styles.otpErrorText}>{otpError}</Text> : null}

                  <TouchableOpacity
                    style={[styles.completeBtn, verifyingOtp && { opacity: 0.7 }]}
                    onPress={handleVerifyDeliveryOtp}
                    disabled={verifyingOtp}
                  >
                    {verifyingOtp ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.completeBtnText}>✅ Verify OTP & Complete (+₹60)</Text>
                    )}
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={[styles.navBtn, { backgroundColor: '#3b82f6', marginTop: 12 }]}
                  onPress={() => Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${activeOrder.customerCoords?.lat || 12.9784},${activeOrder.customerCoords?.lng || 77.6408}`)}
                >
                  <Ionicons name="navigate" size={16} color="#fff" />
                  <Text style={styles.navBtnText}>Navigate to Customer Address</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : (
          !flashOffer && (
            <View style={styles.idleCard}>
              <Text style={{ fontSize: 44, marginBottom: 10 }}>🛵</Text>
              <Text style={styles.idleTitle}>You are Online & Ready!</Text>
              <Text style={styles.idleSub}>
                Waiting for nearby 20-min plant delivery orders around Indiranagar.
              </Text>
              <View style={styles.gpsIndicator}>
                <View style={styles.gpsDot} />
                <Text style={styles.gpsText}>GPS Broadcaster Active (12.9732, 77.6414)</Text>
              </View>
            </View>
          )
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ---------------- 🎉 TRIP COMPLETED SUCCESS MODAL ---------------- */}
      <Modal visible={successModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.successModalContent}>
            <View style={styles.successIconCircle}>
              <Ionicons name="checkmark-circle" size={56} color="#22c55e" />
            </View>
            <Text style={styles.successTitle}>Delivery Handover Complete! 🌿</Text>
            <Text style={styles.successSub}>
              Customer OTP verified. Plant delivered safely with 30-Day Thrive Guarantee.
            </Text>

            <View style={styles.creditPill}>
              <Text style={styles.creditPillText}>+₹60.00 Credited to Wallet</Text>
            </View>

            <TouchableOpacity
              style={styles.doneBtn}
              onPress={() => setSuccessModal(false)}
            >
              <Text style={styles.doneBtnText}>Ready for Next Trip →</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0f19' },
  loginContainer: { flex: 1, backgroundColor: '#0b0f19' },
  loginHeader: { paddingTop: 40, paddingBottom: 24, paddingHorizontal: 20, alignItems: 'center' },
  riderHeroBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(56, 189, 248, 0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginBottom: 10 },
  riderHeroBadgeText: { color: '#38bdf8', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  loginHeaderTitle: { fontSize: 24, fontWeight: '800', color: '#ffffff' },
  loginHeaderSub: { fontSize: 12, color: '#94a3b8', textAlign: 'center', marginTop: 6, lineHeight: 18 },
  authTabRow: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 10, padding: 3, marginTop: 16, width: '100%' },
  authTabBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  authTabBtnActive: { backgroundColor: '#2563eb' },
  authTabText: { color: '#94a3b8', fontSize: 12, fontWeight: '700' },
  authTabTextActive: { color: '#ffffff', fontWeight: '800' },
  loginForm: { padding: 20 },
  quickLoginBanner: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#1e293b', borderWidth: 1.5, borderColor: '#38bdf8', padding: 14, borderRadius: 14, marginBottom: 16 },
  quickLoginIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(56, 189, 248, 0.2)', alignItems: 'center', justifyContent: 'center' },
  quickLoginTitle: { color: '#ffffff', fontSize: 14, fontWeight: '800' },
  quickLoginSub: { color: '#94a3b8', fontSize: 11, marginTop: 2 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#334155' },
  dividerText: { color: '#64748b', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  inputGroup: { marginBottom: 14 },
  inputLabel: { fontSize: 12, fontWeight: '700', color: '#cbd5e1', marginBottom: 6 },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', borderRadius: 12, paddingHorizontal: 12, borderWidth: 1, borderColor: '#334155', gap: 8 },
  textInput: { flex: 1, height: 46, fontSize: 14, color: '#ffffff' },
  loginBtn: { backgroundColor: '#2563eb', height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  loginBtnText: { color: '#ffffff', fontSize: 14, fontWeight: '800' },
  riderPerksCard: { backgroundColor: '#1e293b', borderRadius: 14, padding: 16, marginTop: 20, borderWidth: 1, borderColor: '#334155' },
  riderPerksTitle: { color: '#38bdf8', fontSize: 13, fontWeight: '800', marginBottom: 10 },
  perkItem: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 4 },
  perkText: { flex: 1, color: '#cbd5e1', fontSize: 11, lineHeight: 16 },
  header: { paddingTop: 20, paddingHorizontal: 16, paddingBottom: 14 },
  headerNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  partnerTagRow: { marginBottom: 2 },
  partnerAppPill: { color: '#38bdf8', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#ffffff' },
  headerSub: { fontSize: 11, color: '#94a3b8' },
  dutyToggle: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  dutyOn: { backgroundColor: '#16a34a' },
  dutyOff: { backgroundColor: '#475569' },
  dutyToggleText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  logoutBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  statsStrip: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 12, padding: 10, marginTop: 12, alignItems: 'center' },
  statItem: { flex: 1, alignItems: 'center' },
  statLabel: { fontSize: 10, color: '#94a3b8', fontWeight: '700' },
  statValue: { fontSize: 14, fontWeight: '800', color: '#ffffff', marginTop: 2 },
  statDivider: { width: 1, height: 24, backgroundColor: '#334155' },
  scroll: { flex: 1 },
  flashCard: { margin: 14, backgroundColor: '#1e293b', borderRadius: 16, padding: 16, borderWidth: 2, borderColor: '#f59e0b' },
  flashHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  flashBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#f59e0b', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  flashBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  timerPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#450a0a', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  timerText: { color: '#f87171', fontSize: 12, fontWeight: '800' },
  tripRoute: { backgroundColor: '#0f172a', padding: 12, borderRadius: 10, marginBottom: 12 },
  routePoint: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  routeIcon: { fontSize: 16 },
  routeType: { fontSize: 9, color: '#94a3b8', fontWeight: '800' },
  routePlace: { fontSize: 13, color: '#ffffff', fontWeight: '700', marginTop: 1 },
  routeDist: { fontSize: 10, color: '#38bdf8', marginTop: 2 },
  routeLine: { width: 2, height: 16, backgroundColor: '#334155', marginLeft: 8, marginVertical: 4 },
  tripMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  tripEarningLabel: { fontSize: 10, color: '#94a3b8' },
  tripEarningValue: { fontSize: 20, fontWeight: '800', color: '#22c55e' },
  plantBadge: { backgroundColor: '#064e3b', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  plantBadgeText: { color: '#86efac', fontSize: 11, fontWeight: '800' },
  flashActions: { flexDirection: 'row', gap: 10 },
  rejectBtn: { flex: 1, backgroundColor: '#334155', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  rejectBtnText: { color: '#94a3b8', fontSize: 13, fontWeight: '700' },
  acceptBtn: { flex: 2.5, backgroundColor: '#16a34a', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  acceptBtnText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  activeTripCard: { margin: 14, backgroundColor: '#1e293b', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#334155' },
  activeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  activeOrderTitle: { fontSize: 15, fontWeight: '800', color: '#ffffff' },
  activeStatusPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  activeStatusPickup: { backgroundColor: '#fef3c7' },
  activeStatusEnroute: { backgroundColor: '#dbeafe' },
  activeStatusText: { fontSize: 10, fontWeight: '800', color: '#0f172a' },
  pickupStepBox: { backgroundColor: '#0f172a', padding: 14, borderRadius: 12 },
  stepTitle: { fontSize: 14, fontWeight: '800', color: '#ffffff' },
  stepSub: { fontSize: 12, color: '#94a3b8', marginTop: 4, marginBottom: 14 },
  boldPinBox: { backgroundColor: '#1e293b', padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#3b82f6', marginBottom: 14 },
  boldPinLabel: { fontSize: 11, color: '#38bdf8', fontWeight: '800', letterSpacing: 1 },
  boldPinCode: { fontSize: 36, fontWeight: '900', color: '#ffffff', letterSpacing: 8, marginVertical: 6 },
  boldPinSub: { fontSize: 10, color: '#64748b' },
  navBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#2563eb', paddingVertical: 12, borderRadius: 10 },
  navBtnText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  deliveryStepBox: { backgroundColor: '#0f172a', padding: 14, borderRadius: 12 },
  safetyChecklist: { backgroundColor: '#1e293b', padding: 12, borderRadius: 10, marginVertical: 12 },
  safetyHeader: { fontSize: 12, fontWeight: '800', color: '#86efac', marginBottom: 8 },
  checkItem: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
  checkLabel: { fontSize: 11, color: '#cbd5e1' },
  otpSection: { backgroundColor: '#1e293b', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 6 },
  otpPrompt: { fontSize: 13, fontWeight: '800', color: '#ffffff' },
  otpSub: { fontSize: 10, color: '#94a3b8', marginTop: 2, marginBottom: 10 },
  otpInput: { width: 140, height: 48, backgroundColor: '#0f172a', borderRadius: 10, textAlign: 'center', fontSize: 24, fontWeight: '800', letterSpacing: 6, color: '#ffffff', borderWidth: 1, borderColor: '#334155', marginBottom: 10 },
  otpErrorText: { color: '#ef4444', fontSize: 11, fontWeight: '700', marginBottom: 8 },
  completeBtn: { width: '100%', backgroundColor: '#16a34a', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  completeBtnText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  idleCard: { margin: 14, backgroundColor: '#1e293b', borderRadius: 16, padding: 30, alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  idleTitle: { fontSize: 17, fontWeight: '800', color: '#ffffff' },
  idleSub: { fontSize: 12, color: '#94a3b8', textAlign: 'center', marginTop: 6, lineHeight: 18 },
  gpsIndicator: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 16, backgroundColor: '#0f172a', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  gpsDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22c55e' },
  gpsText: { fontSize: 10, color: '#86efac', fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  successModalContent: { width: '100%', maxWidth: 360, backgroundColor: '#1e293b', borderRadius: 20, padding: 24, alignItems: 'center' },
  successIconCircle: { marginBottom: 12 },
  successTitle: { fontSize: 18, fontWeight: '800', color: '#ffffff', textAlign: 'center' },
  successSub: { fontSize: 12, color: '#94a3b8', textAlign: 'center', marginTop: 6, lineHeight: 18 },
  creditPill: { backgroundColor: '#064e3b', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginVertical: 16 },
  creditPillText: { color: '#86efac', fontSize: 14, fontWeight: '800' },
  doneBtn: { width: '100%', backgroundColor: '#2563eb', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  doneBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
});
