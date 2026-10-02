import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, StatusBar, Alert, Modal, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius } from '../constants/theme';
import { useApp } from '../context/AppContext';

const { width } = Dimensions.get('window');

export default function ProfileScreen({ navigation }: any) {
  const {
    isLoggedIn, currentUser, logout, wallet, orders, hasCarePass,
    setHasCarePass, cart, wishlist, addFundsToWallet,
  } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useApp();

  // Modals state
  const [remindersModalVisible, setRemindersModalVisible] = useState(false);
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [walletModalVisible, setWalletModalVisible] = useState(false);
  const [botanistModalVisible, setBotanistModalVisible] = useState(false);

  // Watering reminders data
  const [reminders, setReminders] = useState([
    { id: '1', name: 'Monstera Deliciosa', frequency: 'Every 7 days', lastWatered: 'Yesterday', dueIn: 'Due in 6 days', done: false },
    { id: '2', name: 'Peace Lily', frequency: 'Every 4 days', lastWatered: '3 days ago', dueIn: 'Water Today 💧', done: false },
    { id: '3', name: 'Snake Plant (Laurentii)', frequency: 'Every 14 days', lastWatered: '10 days ago', dueIn: 'Due in 4 days', done: false },
  ]);

  // Saved Addresses data
  const [addresses, setAddresses] = useState([
    {
      id: 'addr-1',
      tag: 'Home',
      isDefault: true,
      name: currentUser?.name || 'Suhas K.',
      phone: '+91 88856 00899',
      address: 'Flat 402, Green Meadows Apt, 12th Main, Indiranagar',
      city: 'Bengaluru, Karnataka - 560038',
    },
    {
      id: 'addr-2',
      tag: 'Office',
      isDefault: false,
      name: currentUser?.name || 'Suhas K.',
      phone: '+91 88856 00899',
      address: 'Level 4, WeWork Galaxy, 43 Residency Road',
      city: 'Bengaluru, Karnataka - 560025',
    },
  ]);

  // New address form
  const [showAddAddr, setShowAddAddr] = useState(false);
  const [newAddrTag, setNewAddrTag] = useState('Home');
  const [newAddrStreet, setNewAddrStreet] = useState('');
  const [newAddrCity, setNewAddrCity] = useState('');
  const [newAddrPincode, setNewAddrPincode] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Required', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    const ok = await login(email, password);
    setLoading(false);
    if (!ok) {
      Alert.alert(
        'Login Failed',
        'Invalid email or password. You can try customer@plantme.in / plantme123'
      );
    }
  };

  const handleWaterPlant = (id: string) => {
    setReminders(prev =>
      prev.map(r => r.id === id ? { ...r, done: true, dueIn: 'Watered Today! 🌿' } : r)
    );
    Alert.alert('Hydrated! 💧', 'Plant logged as watered. Next reminder scheduled automatically.');
  };

  const setDefaultAddress = (id: string) => {
    setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === id })));
  };

  const handleAddAddress = () => {
    if (!newAddrStreet.trim() || !newAddrPincode.trim()) {
      Alert.alert('Error', 'Please fill street address and pincode.');
      return;
    }
    const newAddr = {
      id: `addr-${Date.now()}`,
      tag: newAddrTag,
      isDefault: false,
      name: currentUser?.name || 'Suhas K.',
      phone: '+91 88856 00899',
      address: newAddrStreet,
      city: `${newAddrCity || 'Bengaluru'}, Karnataka - ${newAddrPincode}`,
    };
    setAddresses(prev => [...prev, newAddr]);
    setShowAddAddr(false);
    setNewAddrStreet('');
    setNewAddrCity('');
    setNewAddrPincode('');
    Alert.alert('Address Saved', 'New delivery address added successfully.');
  };

  const handleRechargeWallet = (amount: number, bonus: number) => {
    addFundsToWallet(amount + bonus);
    Alert.alert(
      'Wallet Recharged! 💳',
      `₹${amount} added successfully with +₹${bonus} PlantMe Green Bonus! New balance: ₹${Math.round(wallet + amount + bonus)}`
    );
  };

  if (!isLoggedIn) {
    return (
      <View style={styles.loginContainer}>
        <StatusBar barStyle="light-content" />
        <LinearGradient colors={[Colors.primary, Colors.primaryLight]} style={styles.loginHeader}>
          <Text style={styles.loginHeaderTitle}>Welcome to PlantMe</Text>
          <Text style={styles.loginHeaderSub}>Sign in to access your green sanctuary</Text>
        </LinearGradient>
        <ScrollView style={styles.loginForm} showsVerticalScrollIndicator={false}>
          <Text style={styles.loginTitle}>Sign In</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <View style={styles.inputRow}>
              <Ionicons name="mail-outline" size={18} color={Colors.textMuted} />
              <TextInput
                style={styles.textInput}
                value={email}
                onChangeText={setEmail}
                placeholder="customer@plantme.in"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputRow}>
              <Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} />
              <TextInput
                style={styles.textInput}
                value={password}
                onChangeText={setPassword}
                placeholder="plantme123"
                secureTextEntry
              />
            </View>
          </View>
          <TouchableOpacity
            style={[styles.loginBtn, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.loginBtnText}>{loading ? 'Signing in...' : 'Sign In to PlantMe →'}</Text>
          </TouchableOpacity>

          <View style={styles.demoLoginBox}>
            <Text style={styles.demoLoginTitle}>Quick Demo Sign In</Text>
            <Text style={styles.demoLoginSub}>Tap below to fill demo customer credentials:</Text>
            <TouchableOpacity
              style={styles.fillDemoBtn}
              onPress={() => {
                setEmail('customer@plantme.in');
                setPassword('plantme123');
              }}
            >
              <Ionicons name="flash-outline" size={14} color={Colors.primary} />
              <Text style={styles.fillDemoText}>customer@plantme.in / plantme123</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={[Colors.primary, Colors.primaryLight]} style={styles.header}>
        <View style={styles.profileAvatar}>
          <Text style={styles.avatarText}>{currentUser?.name?.[0] || 'U'}</Text>
        </View>
        <Text style={styles.profileName}>{currentUser?.name || 'PlantMe Customer'}</Text>
        <Text style={styles.profileEmail}>{currentUser?.email || email}</Text>
        <View style={styles.headerStats}>
          <TouchableOpacity style={styles.statBox} onPress={() => navigation.navigate('Orders')}>
            <Text style={styles.statValue}>{orders.length}</Text>
            <Text style={styles.statLabel}>Orders</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.statBox, styles.statBoxMiddle]} onPress={() => setWalletModalVisible(true)}>
            <Text style={styles.statValue}>₹{Math.round(wallet)}</Text>
            <Text style={styles.statLabel}>Wallet</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statBox} onPress={() => navigation.navigate('Wishlist')}>
            <Text style={styles.statValue}>{wishlist.length}</Text>
            <Text style={styles.statLabel}>Wishlist</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Care Pass Card */}
        <LinearGradient
          colors={hasCarePass ? ['#064e3b', '#047857'] : ['#1e293b', '#334155']}
          style={styles.carePassCard}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        >
          <View style={{ flex: 1 }}>
            <View style={styles.carePassBadgeRow}>
              <View style={[styles.carePassBadge, { backgroundColor: hasCarePass ? '#34d399' : '#f59e0b' }]}>
                <Text style={styles.carePassBadgeText}>{hasCarePass ? 'Active VIP' : 'Membership'}</Text>
              </View>
            </View>
            <Text style={styles.carePassTitle}>PlantMe Care Pass</Text>
            <Text style={styles.carePassSub}>
              Unlimited 1-Click replacements • Free quarterly vermicompost • 2 live botanist calls/mo
            </Text>
            <TouchableOpacity
              style={styles.carePassBtn}
              onPress={() => {
                setHasCarePass(!hasCarePass);
                Alert.alert(hasCarePass ? 'Paused' : 'Activated!', hasCarePass ? 'PlantMe Care Pass paused.' : 'PlantMe Care Pass is now ACTIVE! Enjoy VIP perks.');
              }}
            >
              <Text style={styles.carePassBtnText}>
                {hasCarePass ? 'Manage Care Pass' : 'Activate for ₹99/mo →'}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={{ fontSize: 40 }}>🛡️</Text>
        </LinearGradient>

        {/* Feature Quick Actions */}
        <View style={styles.quickActions}>
          {[
            { icon: 'time', label: 'Track Order', color: '#3b82f6', onPress: () => navigation.navigate('Orders') },
            { icon: 'leaf', label: 'AI Plant Doctor', color: '#22c55e', onPress: () => navigation.navigate('AIDoctor') },
            { icon: 'videocam', label: 'Botanist Call', color: '#8b5cf6', onPress: () => setBotanistModalVisible(true) },
            { icon: 'refresh', label: '1-Click Replace', color: '#ef4444', onPress: () => navigation.navigate('Orders') },
          ].map((action, i) => (
            <TouchableOpacity key={i} style={styles.quickActionBtn} onPress={action.onPress}>
              <View style={[styles.quickActionIcon, { backgroundColor: `${action.color}18` }]}>
                <Ionicons name={action.icon as any} size={22} color={action.color} />
              </View>
              <Text style={styles.quickActionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Orders */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Orders</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Orders')}>
              <Text style={styles.seeAll}>See All →</Text>
            </TouchableOpacity>
          </View>
          {orders.length === 0 ? (
            <View style={styles.emptyOrders}>
              <Text style={styles.emptyOrdersText}>No orders yet. Start shopping!</Text>
              <TouchableOpacity onPress={() => navigation.navigate('ShopTab')}>
                <Text style={[styles.seeAll, { marginTop: 8 }]}>Explore Plants →</Text>
              </TouchableOpacity>
            </View>
          ) : (
            orders.slice(0, 2).map((ord: any, i: number) => (
              <TouchableOpacity
                key={i}
                style={styles.orderItem}
                onPress={() => navigation.navigate('Orders')}
              >
                <View style={styles.orderLeft}>
                  <Text style={styles.orderId}>Order #{ord.id}</Text>
                  <Text style={styles.orderDate}>{ord.date} • {ord.deliveryType}</Text>
                  <Text style={styles.orderItems} numberOfLines={1}>
                    {ord.items?.map((it: any) => `${it.name} (x${it.quantity})`).join(', ')}
                  </Text>
                </View>
                <View style={styles.orderRight}>
                  <View style={[styles.statusBadge, { backgroundColor: ord.status === 'Delivered' ? '#f0fdf4' : '#eff6ff' }]}>
                    <Text style={[styles.statusText, { color: ord.status === 'Delivered' ? Colors.success : '#2563eb' }]}>
                      {ord.status}
                    </Text>
                  </View>
                  <Text style={styles.orderTotal}>₹{ord.total}</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {[
            {
              icon: 'heart-outline',
              label: 'Wishlist',
              badge: `${wishlist.length}`,
              onPress: () => navigation.navigate('Wishlist'),
            },
            {
              icon: 'notifications-outline',
              label: 'Watering Reminders',
              badge: `${reminders.filter(r => !r.done).length} due`,
              onPress: () => setRemindersModalVisible(true),
            },
            {
              icon: 'location-outline',
              label: 'Delivery Addresses',
              badge: `${addresses.length}`,
              onPress: () => setAddressModalVisible(true),
            },
            {
              icon: 'card-outline',
              label: 'Wallet & Green Coins',
              badge: `₹${Math.round(wallet)}`,
              onPress: () => setWalletModalVisible(true),
            },
            {
              icon: 'chatbubbles-outline',
              label: 'Flora AI Help & Support (24/7)',
              onPress: () => navigation.navigate('HelpBot'),
            },
            {
              icon: 'log-out-outline',
              label: 'Logout',
              onPress: () => logout(),
              danger: true,
            },
          ].map((item, i) => (
            <TouchableOpacity key={i} style={styles.menuItem} onPress={item.onPress}>
              <Ionicons
                name={item.icon as any}
                size={20}
                color={(item as any).danger ? Colors.error : Colors.textSecondary}
              />
              <Text style={[styles.menuLabel, (item as any).danger && { color: Colors.error }]}>
                {item.label}
              </Text>
              {(item as any).badge ? (
                <View style={styles.menuBadge}>
                  <Text style={styles.menuBadgeText}>{(item as any).badge}</Text>
                </View>
              ) : null}
              <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.versionText}>PlantMe v1.0.0 • Made with 🌿 in India</Text>
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* --- WATERING REMINDERS MODAL --- */}
      <Modal visible={remindersModalVisible} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalContainer}>
            <View style={styles.modalBar}>
              <Text style={styles.modalTitleText}>🌿 Plant Hydration Reminders</Text>
              <TouchableOpacity onPress={() => setRemindersModalVisible(false)}>
                <Ionicons name="close-circle" size={26} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
              {reminders.map(r => (
                <View key={r.id} style={styles.reminderCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.reminderName}>{r.name}</Text>
                    <Text style={styles.reminderFreq}>Schedule: {r.frequency}</Text>
                    <Text style={[styles.reminderDue, r.done && { color: Colors.success }]}>
                      {r.dueIn}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.waterBtn, r.done && styles.waterBtnDone]}
                    onPress={() => handleWaterPlant(r.id)}
                    disabled={r.done}
                  >
                    <Ionicons name="water" size={14} color="#fff" />
                    <Text style={styles.waterBtnText}>{r.done ? 'Done' : 'Water'}</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.modalPrimaryBtn}
              onPress={() => Alert.alert('Add Plant', 'Smart hydration schedules are automatically synced with newly purchased plants!')}
            >
              <Ionicons name="add-circle" size={18} color="#fff" />
              <Text style={styles.modalPrimaryBtnText}>Add Plant Reminder</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* --- DELIVERY ADDRESSES MODAL --- */}
      <Modal visible={addressModalVisible} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalContainer}>
            <View style={styles.modalBar}>
              <Text style={styles.modalTitleText}>📍 Saved Delivery Addresses</Text>
              <TouchableOpacity onPress={() => setAddressModalVisible(false)}>
                <Ionicons name="close-circle" size={26} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
              {addresses.map(a => (
                <View key={a.id} style={[styles.addressCard, a.isDefault && styles.addressCardDefault]}>
                  <View style={styles.addressTagRow}>
                    <View style={styles.addressTagBadge}>
                      <Text style={styles.addressTagText}>{a.tag}</Text>
                    </View>
                    {a.isDefault ? (
                      <View style={styles.defaultBadge}>
                        <Ionicons name="checkmark-circle" size={12} color="#16a34a" />
                        <Text style={styles.defaultBadgeText}>Default Address</Text>
                      </View>
                    ) : (
                      <TouchableOpacity onPress={() => setDefaultAddress(a.id)}>
                        <Text style={styles.setDefaultText}>Set as Default</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  <Text style={styles.addressName}>{a.name} • {a.phone}</Text>
                  <Text style={styles.addressText}>{a.address}</Text>
                  <Text style={styles.addressCity}>{a.city}</Text>
                </View>
              ))}

              {showAddAddr ? (
                <View style={styles.addAddrBox}>
                  <Text style={styles.addAddrTitle}>New Address Details</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Street / Flat / House No."
                    value={newAddrStreet}
                    onChangeText={setNewAddrStreet}
                  />
                  <TextInput
                    style={styles.modalInput}
                    placeholder="City (e.g. Bengaluru)"
                    value={newAddrCity}
                    onChangeText={setNewAddrCity}
                  />
                  <TextInput
                    style={styles.modalInput}
                    placeholder="6-digit Pincode"
                    keyboardType="number-pad"
                    value={newAddrPincode}
                    onChangeText={setNewAddrPincode}
                  />
                  <TouchableOpacity style={styles.saveAddrBtn} onPress={handleAddAddress}>
                    <Text style={styles.saveAddrText}>Save Address</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
            </ScrollView>

            {!showAddAddr && (
              <TouchableOpacity
                style={styles.modalPrimaryBtn}
                onPress={() => setShowAddAddr(true)}
              >
                <Ionicons name="add-circle" size={18} color="#fff" />
                <Text style={styles.modalPrimaryBtnText}>Add New Address</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

      {/* --- WALLET & GREEN COINS MODAL --- */}
      <Modal visible={walletModalVisible} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalContainer}>
            <View style={styles.modalBar}>
              <Text style={styles.modalTitleText}>💳 PlantMe Green Wallet</Text>
              <TouchableOpacity onPress={() => setWalletModalVisible(false)}>
                <Ionicons name="close-circle" size={26} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>

            <LinearGradient colors={[Colors.primary, Colors.primaryLight]} style={styles.walletCardHero}>
              <Text style={styles.walletHeroSub}>AVAILABLE BALANCE</Text>
              <Text style={styles.walletHeroAmt}>₹{Math.round(wallet)}</Text>
              <View style={styles.walletCoinsRow}>
                <Ionicons name="leaf" size={14} color="#facc15" />
                <Text style={styles.walletCoinsText}>350 Green Loyalty Coins (= ₹35 off)</Text>
              </View>
            </LinearGradient>

            <Text style={styles.rechargeTitle}>Instant 1-Tap Recharge with Bonus:</Text>
            <View style={styles.rechargeGrid}>
              {[
                { amount: 200, bonus: 20, label: '+₹20 Extra' },
                { amount: 500, bonus: 60, label: '+₹60 Extra', pop: true },
                { amount: 1000, bonus: 150, label: '+₹150 Extra' },
              ].map((pack, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.rechargePack, pack.pop && styles.rechargePackPop]}
                  onPress={() => handleRechargeWallet(pack.amount, pack.bonus)}
                >
                  <Text style={styles.rechargeAmt}>₹{pack.amount}</Text>
                  <Text style={styles.rechargeBonus}>{pack.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.rechargeTitle, { marginTop: 16 }]}>Recent Wallet Activity:</Text>
            <View style={styles.walletLog}>
              <View style={styles.logRow}>
                <Ionicons name="arrow-up-circle" size={18} color="#ef4444" />
                <Text style={styles.logDesc}>Express Order PM-8921</Text>
                <Text style={styles.logAmtNeg}>-₹210</Text>
              </View>
              <View style={styles.logRow}>
                <Ionicons name="gift-outline" size={18} color="#16a34a" />
                <Text style={styles.logDesc}>Welcome Green Bonus</Text>
                <Text style={styles.logAmtPos}>+₹100</Text>
              </View>
              <View style={styles.logRow}>
                <Ionicons name="refresh-circle" size={18} color="#16a34a" />
                <Text style={styles.logDesc}>Eco-wrap Return Credit</Text>
                <Text style={styles.logAmtPos}>+₹50</Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* --- BOTANIST VIDEO CALL MODAL --- */}
      <Modal visible={botanistModalVisible} animationType="fade" transparent>
        <View style={styles.modalBg}>
          <View style={[styles.modalContainer, { alignItems: 'center' }]}>
            <View style={styles.botanistAvatarLarge}>
              <Ionicons name="videocam" size={32} color="#fff" />
            </View>
            <Text style={styles.botanistModalTitle}>Live Botanist Consultation</Text>
            <Text style={styles.botanistModalDoc}>Dr. Priya Nair • Senior Horticulturist</Text>
            <Text style={styles.botanistModalSub}>
              Show your plants live on camera for 5-minute instant diagnosis on leaf yellowing, soil fungal check, and optimal repotting guidance.
            </Text>
            <View style={styles.botanistStatusStrip}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>Doctor is currently online & accepting calls</Text>
            </View>
            <TouchableOpacity
              style={styles.startCallBtn}
              onPress={() => {
                setBotanistModalVisible(false);
                Alert.alert('Connecting Video Call... 🌿', 'Connecting you to Dr. Priya Nair. Please allow camera access.');
              }}
            >
              <Ionicons name="videocam" size={18} color="#fff" />
              <Text style={styles.startCallText}>Start 5-Min Video Call</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeCallBtn}
              onPress={() => setBotanistModalVisible(false)}
            >
              <Text style={styles.closeCallText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  loginContainer: { flex: 1, backgroundColor: Colors.bg },
  loginHeader: { paddingTop: 60, paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xl, alignItems: 'center' },
  loginHeaderTitle: { fontSize: 26, fontWeight: '800', color: '#fff', textAlign: 'center' },
  loginHeaderSub: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 8, textAlign: 'center' },
  loginForm: { flex: 1, padding: Spacing.lg },
  loginTitle: { fontSize: 22, fontWeight: '800', color: Colors.text, marginBottom: 24 },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary, marginBottom: 6, textTransform: 'uppercase' },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.md, padding: 12, backgroundColor: '#fff' },
  textInput: { flex: 1, fontSize: 14, color: Colors.text },
  loginBtn: { backgroundColor: Colors.primary, borderRadius: Radius.lg, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  loginBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  demoLoginBox: { marginTop: 24, padding: 16, backgroundColor: '#f0fdf4', borderRadius: Radius.md, borderWidth: 1, borderColor: '#bbf7d0' },
  demoLoginTitle: { fontSize: 13, fontWeight: '800', color: Colors.primary, marginBottom: 4 },
  demoLoginSub: { fontSize: 11, color: Colors.textMuted, marginBottom: 10 },
  fillDemoBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fff', padding: 10, borderRadius: Radius.sm, borderWidth: 1, borderColor: Colors.primary },
  fillDemoText: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  header: { paddingTop: 50, paddingHorizontal: Spacing.md, paddingBottom: Spacing.lg, alignItems: 'center' },
  profileAvatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  avatarText: { fontSize: 26, fontWeight: '800', color: '#fff' },
  profileName: { fontSize: 20, fontWeight: '800', color: '#fff' },
  profileEmail: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2, marginBottom: 16 },
  headerStats: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: Radius.lg, overflow: 'hidden' },
  statBox: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  statBoxMiddle: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  statValue: { fontSize: 16, fontWeight: '800', color: '#fff' },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  scroll: { flex: 1 },
  carePassCard: { margin: Spacing.md, borderRadius: Radius.xl, padding: Spacing.lg, flexDirection: 'row', alignItems: 'center', gap: 12 },
  carePassBadgeRow: { flexDirection: 'row', marginBottom: 8 },
  carePassBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: Radius.full },
  carePassBadgeText: { fontSize: 10, fontWeight: '800', color: '#000' },
  carePassTitle: { fontSize: 18, fontWeight: '800', color: '#fff', marginBottom: 6 },
  carePassSub: { fontSize: 11, color: 'rgba(255,255,255,0.7)', lineHeight: 17, marginBottom: 14 },
  carePassBtn: { backgroundColor: '#22c55e', borderRadius: Radius.md, paddingVertical: 9, paddingHorizontal: 14, alignSelf: 'flex-start' },
  carePassBtnText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  quickActions: { flexDirection: 'row', paddingHorizontal: Spacing.md, gap: Spacing.sm, marginBottom: Spacing.md },
  quickActionBtn: { flex: 1, alignItems: 'center', gap: 6 },
  quickActionIcon: { width: 52, height: 52, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  quickActionLabel: { fontSize: 10, fontWeight: '700', color: Colors.text, textAlign: 'center' },
  section: { backgroundColor: '#fff', marginHorizontal: Spacing.md, marginBottom: Spacing.md, padding: Spacing.md, borderRadius: Radius.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: Colors.text },
  seeAll: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  emptyOrders: { alignItems: 'center', paddingVertical: 16 },
  emptyOrdersText: { fontSize: 13, color: Colors.textMuted },
  orderItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: 14, marginBottom: 14, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  orderLeft: { flex: 1 },
  orderId: { fontSize: 13, fontWeight: '800', color: Colors.text },
  orderDate: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  orderItems: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
  orderRight: { alignItems: 'flex-end', gap: 6 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
  statusText: { fontSize: 11, fontWeight: '700' },
  orderTotal: { fontSize: 14, fontWeight: '800', color: Colors.primary },
  menuSection: { backgroundColor: '#fff', marginHorizontal: Spacing.md, marginBottom: Spacing.md, borderRadius: Radius.lg, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  menuLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: Colors.text },
  menuBadge: { backgroundColor: '#f0fdf4', paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.full, borderWidth: 1, borderColor: '#86efac' },
  menuBadgeText: { fontSize: 11, fontWeight: '700', color: '#16a34a' },
  versionText: { textAlign: 'center', fontSize: 12, color: Colors.textMuted, marginBottom: Spacing.md },

  // Modals Styles
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: '#fff', borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl, padding: Spacing.lg, maxHeight: '85%' },
  modalBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitleText: { fontSize: 17, fontWeight: '800', color: Colors.text },
  reminderCard: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: Radius.md, backgroundColor: '#f8fafc', marginBottom: 10, borderWidth: 1, borderColor: Colors.border },
  reminderName: { fontSize: 14, fontWeight: '800', color: Colors.text },
  reminderFreq: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  reminderDue: { fontSize: 11, fontWeight: '700', color: '#ea580c', marginTop: 4 },
  waterBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#0284c7', paddingHorizontal: 12, paddingVertical: 8, borderRadius: Radius.sm },
  waterBtnDone: { backgroundColor: '#16a34a' },
  waterBtnText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  modalPrimaryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: Colors.primary, paddingVertical: 14, borderRadius: Radius.md, marginTop: 12 },
  modalPrimaryBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },

  // Address styles
  addressCard: { padding: 12, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.border, marginBottom: 10 },
  addressCardDefault: { borderColor: Colors.primary, backgroundColor: '#f0fdf4' },
  addressTagRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  addressTagBadge: { backgroundColor: '#e2e8f0', paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.sm },
  addressTagText: { fontSize: 11, fontWeight: '800', color: Colors.text },
  defaultBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  defaultBadgeText: { fontSize: 11, fontWeight: '800', color: '#16a34a' },
  setDefaultText: { fontSize: 11, fontWeight: '700', color: Colors.primary },
  addressName: { fontSize: 13, fontWeight: '700', color: Colors.text },
  addressText: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  addressCity: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  addAddrBox: { padding: 12, backgroundColor: '#f8fafc', borderRadius: Radius.md, marginTop: 10 },
  addAddrTitle: { fontSize: 13, fontWeight: '800', color: Colors.text, marginBottom: 10 },
  modalInput: { borderWidth: 1, borderColor: Colors.border, backgroundColor: '#fff', borderRadius: Radius.sm, padding: 10, fontSize: 13, marginBottom: 8 },
  saveAddrBtn: { backgroundColor: Colors.primary, paddingVertical: 10, borderRadius: Radius.sm, alignItems: 'center', marginTop: 4 },
  saveAddrText: { color: '#fff', fontWeight: '800', fontSize: 13 },

  // Wallet Modal
  walletCardHero: { borderRadius: Radius.lg, padding: Spacing.lg, alignItems: 'center', marginBottom: 16 },
  walletHeroSub: { fontSize: 11, fontWeight: '800', color: 'rgba(255,255,255,0.8)', letterSpacing: 0.8 },
  walletHeroAmt: { fontSize: 32, fontWeight: '800', color: '#fff', marginVertical: 4 },
  walletCoinsRow: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  walletCoinsText: { fontSize: 11, color: '#fff', fontWeight: '700' },
  rechargeTitle: { fontSize: 13, fontWeight: '800', color: Colors.text, marginBottom: 10 },
  rechargeGrid: { flexDirection: 'row', gap: 10 },
  rechargePack: { flex: 1, alignItems: 'center', padding: 12, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: '#fff' },
  rechargePackPop: { borderColor: '#16a34a', backgroundColor: '#f0fdf4' },
  rechargeAmt: { fontSize: 16, fontWeight: '800', color: Colors.text },
  rechargeBonus: { fontSize: 10, fontWeight: '800', color: '#16a34a', marginTop: 2 },
  walletLog: { backgroundColor: '#f8fafc', borderRadius: Radius.md, padding: 12, gap: 10 },
  logRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logDesc: { flex: 1, fontSize: 12, fontWeight: '600', color: Colors.text },
  logAmtNeg: { fontSize: 12, fontWeight: '800', color: '#ef4444' },
  logAmtPos: { fontSize: 12, fontWeight: '800', color: '#16a34a' },

  // Botanist Modal
  botanistAvatarLarge: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#8b5cf6', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  botanistModalTitle: { fontSize: 18, fontWeight: '800', color: Colors.text },
  botanistModalDoc: { fontSize: 13, fontWeight: '700', color: '#8b5cf6', marginTop: 2, marginBottom: 8 },
  botanistModalSub: { fontSize: 12, color: Colors.textMuted, textAlign: 'center', lineHeight: 18, marginBottom: 16 },
  botanistStatusStrip: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#f0fdf4', paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full, marginBottom: 16 },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22c55e' },
  onlineText: { fontSize: 11, fontWeight: '700', color: '#16a34a' },
  startCallBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#8b5cf6', width: '100%', paddingVertical: 14, borderRadius: Radius.md, justifyContent: 'center' },
  startCallText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  closeCallBtn: { marginTop: 10, paddingVertical: 8 },
  closeCallText: { fontSize: 13, color: Colors.textMuted, fontWeight: '700' },
});
