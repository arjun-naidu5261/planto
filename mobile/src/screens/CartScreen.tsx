import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image,
  StyleSheet, StatusBar, Alert, TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius } from '../constants/theme';
import { useApp } from '../context/AppContext';

export default function CartScreen({ navigation }: any) {
  const { cart, updateQty, removeFromCart, wallet, checkout, hasCarePass, setHasCarePass } = useApp();
  const [deliveryType, setDeliveryType] = useState('Express');
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState('');
  const [addCarePass, setAddCarePass] = useState(false);
  const [isGift, setIsGift] = useState(false);
  const [ordering, setOrdering] = useState(false);
  const [ordered, setOrdered] = useState(false);

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const deliveryFee = deliveryType === 'Express' ? 30 : deliveryType === 'Standard' ? 15 : 0;
  const giftFee = isGift ? 49 : 0;
  const carePassFee = (addCarePass && !hasCarePass) ? 99 : 0;
  const discountAmt = Math.round(subtotal * (discount / 100));
  const grandTotal = subtotal + deliveryFee + giftFee + carePassFee - discountAmt;

  const applyCoupon = () => {
    const code = coupon.trim().toUpperCase();
    if (code === 'PLANTME50' || code === 'FIRSTPLANT') {
      setDiscount(code === 'PLANTME50' ? 50 : 20);
      setCouponMsg(`Coupon applied: ${code === 'PLANTME50' ? '50%' : '20%'} off!`);
    } else {
      setDiscount(0);
      setCouponMsg('Invalid coupon code. Try PLANTME50 or FIRSTPLANT');
    }
  };

  const handleCheckout = async () => {
    if (wallet < grandTotal) {
      Alert.alert('Insufficient Balance', `Your wallet has ₹${Math.round(wallet)} but order total is ₹${grandTotal}. Please add funds in Profile.`);
      return;
    }
    setOrdering(true);
    const res = await checkout(deliveryType, grandTotal);
    setOrdering(false);
    if (res?.success) {
      if (addCarePass) setHasCarePass(true);
      setOrdered(true);
    } else {
      Alert.alert('Order Failed', res?.message || 'Something went wrong. Please try again.');
    }
  };

  if (ordered) {
    return (
      <View style={styles.successContainer}>
        <LinearGradient colors={[Colors.primary, Colors.primaryLight]} style={styles.successGradient}>
          <Text style={{ fontSize: 64, marginBottom: 16 }}>✅</Text>
          <Text style={styles.successTitle}>Order Confirmed!</Text>
          <Text style={styles.successSub}>
            Your plants are being packed with moisture-preserving eco-wrap.{'\n'}
            Expected delivery in <Text style={{ fontWeight: '800' }}>20–30 minutes</Text>
          </Text>
          <View style={styles.successBadges}>
            {['Eco-wrapped', 'Upright EV transit', '30-Day Guarantee'].map((b, i) => (
              <View key={i} style={styles.successBadge}>
                <Ionicons name="checkmark-circle" size={13} color="#4ade80" />
                <Text style={styles.successBadgeText}>{b}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity
            style={styles.successBtn}
            onPress={() => { setOrdered(false); navigation.navigate('Home'); }}
          >
            <Text style={styles.successBtnText}>Back to Home →</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Text style={styles.trackLink}>Track Order in Profile →</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  }

  if (cart.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={{ fontSize: 64 }}>🛒</Text>
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptySub}>Explore our premium live plants for 20-minute express delivery!</Text>
        <TouchableOpacity style={styles.shopBtn} onPress={() => navigation.navigate('Shop')}>
          <Text style={styles.shopBtnText}>Explore Plants →</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={[Colors.primary, Colors.primaryLight]} style={styles.header}>
        <Text style={styles.headerTitle}>My Cart ({cart.length} items)</Text>
      </LinearGradient>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Cart Items */}
        <View style={styles.section}>
          <View style={styles.fulfillmentBadge}>
            <Text style={styles.fulfillmentText}>Fulfilled by PlantMe Express Hub, Bengaluru</Text>
          </View>
          {cart.map(item => (
            <View key={item.id} style={styles.cartItem}>
              <Image source={{ uri: item.image }} style={styles.itemImage} />
              <View style={styles.itemDetails}>
                <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.itemPrice}>₹{item.price} each</Text>
              </View>
              <View style={styles.itemQty}>
                <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQty(item.id, item.quantity - 1)}>
                  <Ionicons name="remove" size={14} color={Colors.primary} />
                </TouchableOpacity>
                <Text style={styles.qtyValue}>{item.quantity}</Text>
                <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQty(item.id, item.quantity + 1)}>
                  <Ionicons name="add" size={14} color={Colors.primary} />
                </TouchableOpacity>
              </View>
              <View style={styles.itemRight}>
                <Text style={styles.itemTotal}>₹{item.price * item.quantity}</Text>
                <TouchableOpacity onPress={() => removeFromCart(item.id)}>
                  <Ionicons name="trash-outline" size={16} color={Colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Delivery Mode */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Mode</Text>
          {[
            { key: 'Express', label: 'PlantMe Express (20-30 min)', fee: 30 },
            { key: 'Standard', label: 'Eco-Shipping (1-2 days)', fee: 15 },
            { key: 'Pickup', label: 'PlantMe Hub Pickup', fee: 0 },
          ].map(opt => (
            <TouchableOpacity
              key={opt.key}
              style={[styles.deliveryOption, deliveryType === opt.key && styles.deliveryOptionActive]}
              onPress={() => setDeliveryType(opt.key)}
            >
              <Ionicons
                name={deliveryType === opt.key ? 'radio-button-on' : 'radio-button-off'}
                size={18}
                color={deliveryType === opt.key ? Colors.primary : Colors.textMuted}
              />
              <Text style={[styles.deliveryLabel, deliveryType === opt.key && { color: Colors.primary, fontWeight: '800' }]}>
                {opt.label}
              </Text>
              <Text style={styles.deliveryFee}>{opt.fee === 0 ? 'FREE' : `₹${opt.fee}`}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Coupon */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Promo Code</Text>
          <View style={styles.couponRow}>
            <TextInput
              style={styles.couponInput}
              placeholder="Try PLANTME50 or FIRSTPLANT"
              value={coupon}
              onChangeText={setCoupon}
              autoCapitalize="characters"
            />
            <TouchableOpacity style={styles.couponApplyBtn} onPress={applyCoupon}>
              <Text style={styles.couponApplyText}>Apply</Text>
            </TouchableOpacity>
          </View>
          {couponMsg !== '' && (
            <Text style={[styles.couponMsg, { color: discount > 0 ? Colors.success : Colors.error }]}>
              {couponMsg}
            </Text>
          )}
        </View>

        {/* PlantMe Care Pass */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.carePassToggle, (addCarePass || hasCarePass) && styles.carePassToggleActive]}
            onPress={() => !hasCarePass && setAddCarePass(v => !v)}
          >
            <Ionicons
              name={(addCarePass || hasCarePass) ? 'checkbox' : 'square-outline'}
              size={22}
              color={(addCarePass || hasCarePass) ? Colors.success : Colors.textMuted}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.carePassTitle}>
                {hasCarePass ? 'PlantMe Care Pass (Active VIP)' : 'Add PlantMe Care Pass (+₹99/mo)'}
              </Text>
              <Text style={styles.carePassSub}>
                Unlimited 1-Click replacements • Free vermicompost • 2 live botanist calls/mo
              </Text>
            </View>
            <View style={styles.carePassBadge}>
              <Text style={styles.carePassBadgeText}>{hasCarePass ? 'Active' : 'VIP'}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Price Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Items Subtotal</Text>
            <Text style={styles.priceVal}>₹{subtotal}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Delivery Fee</Text>
            <Text style={styles.priceVal}>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</Text>
          </View>
          {isGift && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Eco-Gift Wrap</Text>
              <Text style={styles.priceVal}>+₹49</Text>
            </View>
          )}
          {carePassFee > 0 && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Care Pass (1 mo)</Text>
              <Text style={styles.priceVal}>+₹99</Text>
            </View>
          )}
          {discountAmt > 0 && (
            <View style={styles.priceRow}>
              <Text style={[styles.priceLabel, { color: Colors.error }]}>Coupon Discount ({discount}%)</Text>
              <Text style={[styles.priceVal, { color: Colors.error }]}>-₹{discountAmt}</Text>
            </View>
          )}
          <View style={[styles.priceRow, styles.grandTotalRow]}>
            <Text style={styles.grandTotalLabel}>Grand Total</Text>
            <Text style={styles.grandTotalValue}>₹{grandTotal}</Text>
          </View>
          <View style={styles.walletBalance}>
            <Ionicons name="wallet-outline" size={14} color={Colors.textMuted} />
            <Text style={styles.walletText}>Wallet Balance: ₹{Math.round(wallet)}</Text>
          </View>
        </View>

        {/* Guarantee row */}
        <View style={styles.guaranteeStrip}>
          {['Eco Root Wrap', 'Upright EV Transit', '30-Day Guarantee'].map((g, i) => (
            <View key={i} style={styles.guaranteeItem}>
              <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
              <Text style={styles.guaranteeText}>{g}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Sticky Checkout */}
      <View style={styles.checkoutBar}>
        <View>
          <Text style={styles.checkoutTotal}>₹{grandTotal}</Text>
          <Text style={styles.checkoutSub}>Tap to pay from wallet</Text>
        </View>
        <TouchableOpacity
          style={[styles.checkoutBtn, ordering && { opacity: 0.7 }]}
          onPress={handleCheckout}
          disabled={ordering}
        >
          <Text style={styles.checkoutBtnText}>{ordering ? 'Placing...' : 'Place Order →'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { paddingTop: 50, paddingHorizontal: Spacing.md, paddingBottom: Spacing.md },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#fff' },
  scroll: { flex: 1 },
  section: { backgroundColor: '#fff', margin: Spacing.md, marginBottom: 0, padding: Spacing.md, borderRadius: Radius.lg },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: Colors.text, marginBottom: 12 },
  fulfillmentBadge: { backgroundColor: '#f0fdf4', borderRadius: Radius.sm, padding: 10, marginBottom: 12, borderWidth: 1, borderColor: Colors.borderGreen },
  fulfillmentText: { fontSize: 12, fontWeight: '700', color: Colors.success },
  cartItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingBottom: 14, marginBottom: 14, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  itemImage: { width: 56, height: 56, borderRadius: Radius.sm },
  itemDetails: { flex: 1 },
  itemName: { fontSize: 13, fontWeight: '800', color: Colors.text },
  itemPrice: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  itemQty: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.sm, overflow: 'hidden' },
  qtyBtn: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.bg },
  qtyValue: { width: 28, textAlign: 'center', fontSize: 14, fontWeight: '800' },
  itemRight: { alignItems: 'flex-end', gap: 6 },
  itemTotal: { fontSize: 14, fontWeight: '800', color: Colors.primary },
  deliveryOption: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.border, marginBottom: 8 },
  deliveryOptionActive: { borderColor: Colors.primary, backgroundColor: Colors.surfaceAlt },
  deliveryLabel: { flex: 1, fontSize: 13, color: Colors.textSecondary },
  deliveryFee: { fontSize: 13, fontWeight: '800', color: Colors.primary },
  couponRow: { flexDirection: 'row', gap: Spacing.sm },
  couponInput: { flex: 1, borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.md, padding: 10, fontSize: 14 },
  couponApplyBtn: { backgroundColor: Colors.primary, borderRadius: Radius.md, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
  couponApplyText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  couponMsg: { fontSize: 12, fontWeight: '700', marginTop: 6 },
  carePassToggle: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.bg },
  carePassToggleActive: { borderColor: Colors.success, backgroundColor: Colors.surfaceAlt },
  carePassTitle: { fontSize: 13, fontWeight: '800', color: Colors.text },
  carePassSub: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  carePassBadge: { backgroundColor: Colors.surfaceAlt, borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 3 },
  carePassBadgeText: { fontSize: 10, fontWeight: '800', color: Colors.success },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  priceLabel: { fontSize: 13, color: Colors.textSecondary },
  priceVal: { fontSize: 13, fontWeight: '700', color: Colors.text },
  grandTotalRow: { borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 10, marginTop: 4 },
  grandTotalLabel: { fontSize: 16, fontWeight: '800', color: Colors.text },
  grandTotalValue: { fontSize: 20, fontWeight: '800', color: Colors.primary },
  walletBalance: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  walletText: { fontSize: 12, color: Colors.textMuted },
  guaranteeStrip: { flexDirection: 'row', gap: 6, marginHorizontal: Spacing.md, justifyContent: 'space-between', padding: 12, backgroundColor: Colors.surfaceAlt, borderRadius: Radius.md, marginTop: Spacing.md },
  guaranteeItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  guaranteeText: { fontSize: 10, fontWeight: '700', color: Colors.success },
  checkoutBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: Spacing.md, paddingBottom: 32, borderTopWidth: 1, borderTopColor: Colors.border },
  checkoutTotal: { fontSize: 20, fontWeight: '800', color: Colors.primary },
  checkoutSub: { fontSize: 11, color: Colors.textMuted },
  checkoutBtn: { backgroundColor: Colors.primary, borderRadius: Radius.lg, paddingVertical: 14, paddingHorizontal: 24 },
  checkoutBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  emptyTitle: { fontSize: 22, fontWeight: '800', color: Colors.text, marginTop: 16, marginBottom: 8 },
  emptySub: { fontSize: 14, color: Colors.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  shopBtn: { backgroundColor: Colors.primary, borderRadius: Radius.lg, paddingVertical: 14, paddingHorizontal: 28 },
  shopBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  successContainer: { flex: 1 },
  successGradient: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  successTitle: { fontSize: 28, fontWeight: '800', color: '#fff', marginBottom: 12 },
  successSub: { fontSize: 14, color: 'rgba(255,255,255,0.8)', textAlign: 'center', lineHeight: 22, marginBottom: 20 },
  successBadges: { gap: 8, marginBottom: 28 },
  successBadge: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  successBadgeText: { fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },
  successBtn: { backgroundColor: '#fff', borderRadius: Radius.lg, paddingVertical: 14, paddingHorizontal: 28, marginBottom: 12 },
  successBtnText: { color: Colors.primary, fontWeight: '800', fontSize: 15 },
  trackLink: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '600', textDecorationLine: 'underline' },
});
