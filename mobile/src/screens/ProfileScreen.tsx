import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, StatusBar, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

export default function ProfileScreen({ navigation }: any) {
  const { isLoggedIn, currentUser, logout, wallet, orders, hasCarePass, setHasCarePass, cart } = useApp();
  const [email, setEmail] = useState('customer@plantme.in');
  const [password, setPassword] = useState('plantme123');
  const [loading, setLoading] = useState(false);
  const { login } = useApp();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    const ok = await login(email, password);
    setLoading(false);
    if (!ok) {
      Alert.alert('Login Failed', 'Invalid email or password. Try customer@plantme.in / plantme123');
    }
  };

  if (!isLoggedIn) {
    return (
      <View style={styles.loginContainer}>
        <StatusBar barStyle="light-content" />
        <LinearGradient colors={[Colors.primary, Colors.primaryLight]} style={styles.loginHeader}>
          <Text style={styles.loginHeaderTitle}>Welcome to PlantMe</Text>
          <Text style={styles.loginHeaderSub}>Sign in to access your green sanctuary</Text>
        </LinearGradient>
        <View style={styles.loginForm}>
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
          <Text style={styles.loginHint}>Demo: customer@plantme.in / plantme123</Text>
        </View>
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
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{orders.length}</Text>
            <Text style={styles.statLabel}>Orders</Text>
          </View>
          <View style={[styles.statBox, styles.statBoxMiddle]}>
            <Text style={styles.statValue}>₹{Math.round(wallet)}</Text>
            <Text style={styles.statLabel}>Wallet</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{cart.length}</Text>
            <Text style={styles.statLabel}>In Cart</Text>
          </View>
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
            { icon: 'videocam', label: 'Botanist Call', color: '#8b5cf6', onPress: () => Alert.alert('Coming soon!', 'Live Botanist Video Call feature will launch soon.') },
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
              <TouchableOpacity onPress={() => navigation.navigate('Shop')}>
                <Text style={[styles.seeAll, { marginTop: 8 }]}>Explore Plants →</Text>
              </TouchableOpacity>
            </View>
          ) : (
            orders.slice(0, 3).map((ord: any, i: number) => (
              <View key={i} style={styles.orderItem}>
                <View style={styles.orderLeft}>
                  <Text style={styles.orderId}>Order {ord.id}</Text>
                  <Text style={styles.orderDate}>{ord.date} • {ord.deliveryType}</Text>
                  <Text style={styles.orderItems} numberOfLines={1}>
                    {ord.items?.map((it: any) => `${it.name} (x${it.quantity})`).join(', ')}
                  </Text>
                </View>
                <View style={styles.orderRight}>
                  <View style={[styles.statusBadge, { backgroundColor: ord.status === 'Delivered' ? '#f0fdf4' : '#fffbeb' }]}>
                    <Text style={[styles.statusText, { color: ord.status === 'Delivered' ? Colors.success : Colors.warning }]}>
                      {ord.status}
                    </Text>
                  </View>
                  <Text style={styles.orderTotal}>₹{ord.total}</Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {[
            { icon: 'heart-outline', label: 'Wishlist', onPress: () => navigation.navigate('Wishlist') },
            { icon: 'notifications-outline', label: 'Watering Reminders', onPress: () => Alert.alert('Reminders', 'Set watering reminders for your plants.') },
            { icon: 'location-outline', label: 'Delivery Addresses', onPress: () => Alert.alert('Addresses', 'Manage your delivery addresses.') },
            { icon: 'card-outline', label: 'Wallet & Payments', onPress: () => Alert.alert('Wallet', `Current balance: ₹${Math.round(wallet)}`) },
            { icon: 'help-circle-outline', label: 'Help & Support', onPress: () => Alert.alert('Contact & Support', 'Email: info@futureforbes.in\nPlant Care Hotline: +91 88856 00899\nWhatsApp Concierge: +91 88856 00899') },
            { icon: 'log-out-outline', label: 'Logout', onPress: () => logout(), danger: true },
          ].map((item, i) => (
            <TouchableOpacity key={i} style={styles.menuItem} onPress={item.onPress}>
              <Ionicons name={item.icon as any} size={20} color={(item as any).danger ? Colors.error : Colors.textSecondary} />
              <Text style={[styles.menuLabel, (item as any).danger && { color: Colors.error }]}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.versionText}>PlantMe v1.0.0 • Made with 🌿 in India</Text>
        <View style={{ height: 100 }} />
      </ScrollView>
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
  loginHint: { fontSize: 12, color: Colors.textMuted, textAlign: 'center', marginTop: 16 },
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
  versionText: { textAlign: 'center', fontSize: 12, color: Colors.textMuted, marginBottom: Spacing.md },
});
