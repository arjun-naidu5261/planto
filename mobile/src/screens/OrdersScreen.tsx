import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image,
  StyleSheet, StatusBar, Alert, Modal, Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius } from '../constants/theme';
import { useApp } from '../context/AppContext';

export default function OrdersScreen({ navigation }: any) {
  const { orders } = useApp();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [replaceModalVisible, setReplaceModalVisible] = useState(false);
  const [replacementSubmitted, setReplacementSubmitted] = useState(false);

  const handle1ClickReplace = (order: any) => {
    setSelectedOrder(order);
    setReplacementSubmitted(false);
    setReplaceModalVisible(true);
  };

  const confirmReplacement = () => {
    setReplacementSubmitted(true);
    setTimeout(() => {
      setReplaceModalVisible(false);
      Alert.alert(
        'Replacement Dispatched! 🌿',
        'Under our 30-Day Plant Guarantee, a brand new fresh potted plant has been assigned to our EV rider for 20-min express delivery to your doorstep!'
      );
    }, 1200);
  };

  const callHero = (phone: string) => {
    Linking.openURL(`tel:${phone.replace(/\s+/g, '')}`);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      {/* Header */}
      <LinearGradient colors={[Colors.primary, Colors.primaryLight]} style={styles.header}>
        <View style={styles.headerNav}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>My Orders & Tracking</Text>
            <Text style={styles.headerSub}>Real-time EV status & 30-Day Guarantee</Text>
          </View>
          <TouchableOpacity
            style={styles.helpBtn}
            onPress={() => navigation.navigate('HelpBot')}
          >
            <Ionicons name="chatbubbles-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={64} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No Orders Yet</Text>
            <Text style={styles.emptySub}>
              Order from our premium nursery collection for 20-minute rapid delivery!
            </Text>
            <TouchableOpacity
              style={styles.shopBtn}
              onPress={() => navigation.navigate('ShopTab')}
            >
              <Text style={styles.shopBtnText}>Explore Plants →</Text>
            </TouchableOpacity>
          </View>
        ) : (
          orders.map((ord: any, idx: number) => {
            const isOngoing = ord.status !== 'Delivered';
            return (
              <View key={ord.id || idx} style={styles.orderCard}>
                {/* Order Header */}
                <View style={styles.cardTop}>
                  <View>
                    <Text style={styles.orderId}>Order #{ord.id || `PM-${8900 + idx}`}</Text>
                    <Text style={styles.orderDate}>{ord.date || 'Recent'}</Text>
                  </View>
                  <View style={[styles.statusBadge, isOngoing ? styles.statusOngoing : styles.statusDone]}>
                    <Ionicons
                      name={isOngoing ? 'bicycle' : 'checkmark-circle'}
                      size={14}
                      color={isOngoing ? '#2563eb' : '#16a34a'}
                    />
                    <Text style={[styles.statusText, { color: isOngoing ? '#2563eb' : '#16a34a' }]}>
                      {ord.status || 'Delivered'}
                    </Text>
                  </View>
                </View>

                {/* Tracking Stepper if Ongoing */}
                {isOngoing && (
                  <View style={styles.stepperContainer}>
                    <Text style={styles.stepperTitle}>LIVE DELIVERY TIMELINE</Text>
                    <View style={styles.stepRow}>
                      {[
                        { title: 'Confirmed', done: true },
                        { title: 'Eco-Packed', done: true },
                        { title: 'EV Transit', done: true, active: true },
                        { title: 'Delivered', done: false },
                      ].map((step, sIdx) => (
                        <View key={sIdx} style={styles.stepCol}>
                          <View style={[
                            styles.stepDot,
                            step.done && styles.stepDotDone,
                            step.active && styles.stepDotActive,
                          ]}>
                            <Ionicons
                              name={step.done && !step.active ? 'checkmark' : step.active ? 'bicycle' : 'ellipse'}
                              size={11}
                              color="#fff"
                            />
                          </View>
                          <Text style={[styles.stepLabel, step.active && styles.stepLabelActive]}>
                            {step.title}
                          </Text>
                        </View>
                      ))}
                    </View>
                    <View style={styles.riderStrip}>
                      <View style={styles.riderAvatar}>
                        <Ionicons name="person" size={14} color="#fff" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.riderName}>{ord.heroName || 'Ramu Prasad'} • EV Delivery Partner</Text>
                        <Text style={styles.riderEta}>Arriving in ~15 mins in electric vehicle with root protection</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.callRiderBtn}
                        onPress={() => callHero(ord.heroPhone || '+91 88856 00899')}
                      >
                        <Ionicons name="call" size={14} color="#fff" />
                        <Text style={styles.callRiderText}>Call</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* Items */}
                <View style={styles.itemsList}>
                  {ord.items?.map((it: any, i: number) => (
                    <View key={i} style={styles.itemRow}>
                      <View style={styles.leafBullet}>
                        <Ionicons name="leaf" size={12} color={Colors.primary} />
                      </View>
                      <Text style={styles.itemName}>{it.name} <Text style={{ color: Colors.textMuted }}>x{it.quantity}</Text></Text>
                      <Text style={styles.itemPrice}>₹{it.price * (it.quantity || 1)}</Text>
                    </View>
                  ))}
                </View>

                {/* Total & Mode */}
                <View style={styles.cardFooter}>
                  <View>
                    <Text style={styles.modeText}>{ord.deliveryType || 'PlantMe Express (20 min)'}</Text>
                    <Text style={styles.guaranteeText}>🛡️ 30-Day Transit & Health Guarantee</Text>
                  </View>
                  <Text style={styles.grandTotal}>₹{ord.total}</Text>
                </View>

                {/* Action Buttons */}
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.replaceBtn}
                    onPress={() => handle1ClickReplace(ord)}
                  >
                    <Ionicons name="shield-checkmark" size={16} color="#059669" />
                    <Text style={styles.replaceBtnText}>1-Click Free Replacement</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.helpActionBtn}
                    onPress={() => navigation.navigate('HelpBot')}
                  >
                    <Ionicons name="chatbubble-ellipses-outline" size={16} color={Colors.primary} />
                    <Text style={styles.helpActionText}>Support</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* 1-Click Replace Modal */}
      <Modal visible={replaceModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalShieldIcon}>
                <Ionicons name="shield-checkmark" size={28} color="#059669" />
              </View>
              <Text style={styles.modalTitle}>30-Day Zero-Hassle Plant Guarantee</Text>
              <Text style={styles.modalSub}>
                Is your plant showing damaged stems or transit shock? We will replace it immediately for FREE.
              </Text>
            </View>

            <View style={styles.modalDetails}>
              <Text style={styles.modalDetailLabel}>Order ID:</Text>
              <Text style={styles.modalDetailVal}>{selectedOrder?.id || 'PM-8921'}</Text>
            </View>
            <View style={styles.modalDetails}>
              <Text style={styles.modalDetailLabel}>Dispatch Type:</Text>
              <Text style={styles.modalDetailVal}>20-Minute Express Dispatch</Text>
            </View>
            <View style={styles.modalDetails}>
              <Text style={styles.modalDetailLabel}>Cost to You:</Text>
              <Text style={[styles.modalDetailVal, { color: '#059669', fontWeight: '800' }]}>₹0 (100% Free)</Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setReplaceModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={confirmReplacement}
              >
                <Text style={styles.modalConfirmText}>
                  {replacementSubmitted ? 'Dispatching...' : 'Dispatch Replacement →'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { paddingTop: 50, paddingHorizontal: Spacing.md, paddingBottom: Spacing.md },
  headerNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, marginHorizontal: 12 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  helpBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  scroll: { flex: 1, padding: Spacing.md },
  orderCard: { backgroundColor: '#fff', borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.border, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  orderId: { fontSize: 15, fontWeight: '800', color: Colors.text },
  orderDate: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  statusOngoing: { backgroundColor: '#eff6ff' },
  statusDone: { backgroundColor: '#f0fdf4' },
  statusText: { fontSize: 12, fontWeight: '800' },
  stepperContainer: { backgroundColor: '#f8fafc', padding: 12, borderRadius: Radius.md, marginTop: 12 },
  stepperTitle: { fontSize: 10, fontWeight: '800', color: Colors.textMuted, letterSpacing: 0.8, marginBottom: 10 },
  stepRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  stepCol: { alignItems: 'center', flex: 1 },
  stepDot: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#cbd5e1', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  stepDotDone: { backgroundColor: '#22c55e' },
  stepDotActive: { backgroundColor: '#2563eb' },
  stepLabel: { fontSize: 9, color: Colors.textMuted, fontWeight: '600' },
  stepLabelActive: { color: '#2563eb', fontWeight: '800' },
  riderStrip: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#eff6ff', padding: 10, borderRadius: Radius.sm },
  riderAvatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#3b82f6', alignItems: 'center', justifyContent: 'center' },
  riderName: { fontSize: 12, fontWeight: '800', color: '#1e3a8a' },
  riderEta: { fontSize: 10, color: '#3b82f6', marginTop: 1 },
  callRiderBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#2563eb', paddingHorizontal: 10, paddingVertical: 6, borderRadius: Radius.sm },
  callRiderText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  itemsList: { paddingVertical: 12 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  leafBullet: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center' },
  itemName: { flex: 1, fontSize: 13, fontWeight: '700', color: Colors.text },
  itemPrice: { fontSize: 13, fontWeight: '800', color: Colors.text },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  modeText: { fontSize: 11, fontWeight: '700', color: Colors.textSecondary },
  guaranteeText: { fontSize: 10, color: '#059669', marginTop: 2, fontWeight: '700' },
  grandTotal: { fontSize: 18, fontWeight: '800', color: Colors.primary },
  cardActions: { flexDirection: 'row', gap: 10, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  replaceBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#ecfdf5', borderWidth: 1, borderColor: '#a7f3d0', paddingVertical: 10, borderRadius: Radius.md },
  replaceBtnText: { fontSize: 12, fontWeight: '800', color: '#059669' },
  helpActionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border },
  helpActionText: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', padding: Spacing.xl, marginTop: 40 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: Colors.text, marginTop: 16, marginBottom: 8 },
  emptySub: { fontSize: 13, color: Colors.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  shopBtn: { backgroundColor: Colors.primary, borderRadius: Radius.lg, paddingVertical: 12, paddingHorizontal: 24 },
  shopBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: Spacing.lg },
  modalCard: { backgroundColor: '#fff', borderRadius: Radius.xl, padding: Spacing.xl },
  modalHeader: { alignItems: 'center', marginBottom: 16 },
  modalShieldIcon: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  modalTitle: { fontSize: 17, fontWeight: '800', color: Colors.text, textAlign: 'center' },
  modalSub: { fontSize: 12, color: Colors.textMuted, textAlign: 'center', marginTop: 6, lineHeight: 18 },
  modalDetails: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  modalDetailLabel: { fontSize: 13, color: Colors.textMuted },
  modalDetailVal: { fontSize: 13, fontWeight: '700', color: Colors.text },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 20 },
  modalCancelBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', justifyContent: 'center', borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border },
  modalCancelText: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary },
  modalConfirmBtn: { flex: 2, paddingVertical: 12, alignItems: 'center', justifyContent: 'center', borderRadius: Radius.md, backgroundColor: '#059669' },
  modalConfirmText: { fontSize: 13, fontWeight: '800', color: '#fff' },
});
