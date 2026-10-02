import React, { useState } from 'react';
import {
  View, Text, ScrollView, Image, TouchableOpacity,
  StyleSheet, Dimensions, StatusBar, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius } from '../constants/theme';
import { useApp } from '../context/AppContext';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen({ route, navigation }: any) {
  const { product } = route.params;
  const { addToCart, wishlist, toggleWishlist, cart } = useApp();
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'care' | 'reviews'>('desc');
  const inWishlist = wishlist.includes(product.id);
  const inCart = cart.find(c => c.id === product.id);

  const goToCart = () => {
    try {
      const parent = navigation.getParent();
      if (parent) {
        parent.navigate('CartTab');
        return;
      }
    } catch {}
    try {
      navigation.navigate('CartTab');
      return;
    } catch {}
    navigation.navigate('Cart');
  };

  const handleAddToCart = () => {
    addToCart(product, qty);
    Alert.alert('Added to Cart!', `${qty}x ${product.name} added to your cart.`, [
      { text: 'Continue Shopping', style: 'cancel' },
      { text: 'Go to Cart →', onPress: goToCart },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Image Header */}
      <View style={[styles.imageSection, { backgroundColor: product.color || '#e8f5e9' }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.topRightActions}>
          <TouchableOpacity style={styles.headerIconCircle} onPress={() => toggleWishlist(product.id)}>
            <Ionicons
              name={inWishlist ? 'heart' : 'heart-outline'}
              size={20}
              color={inWishlist ? '#ef4444' : '#fff'}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIconCircle} onPress={goToCart}>
            <Ionicons name="bag-outline" size={20} color="#fff" />
            {cart.length > 0 && (
              <View style={styles.badgeSmall}>
                <Text style={styles.badgeTextSmall}>{cart.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        <Image source={{ uri: product.image || product.images?.[0] }} style={styles.heroImage} resizeMode="cover" />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Tags */}
          <View style={styles.tagsRow}>
            {[product.tag, product.category].filter(Boolean).map((t: string, i: number) => (
              <View key={i} style={styles.tagChip}>
                <Text style={styles.tagChipText}>{t}</Text>
              </View>
            ))}
          </View>

          {/* Name & price */}
          <Text style={styles.productName}>{product.name}</Text>
          {product.tagline && <Text style={styles.tagline}>{product.tagline}</Text>}

          <View style={styles.priceRatingRow}>
            <Text style={styles.price}>₹{product.price}</Text>
            <View style={styles.ratingChip}>
              <Ionicons name="star" size={13} color={Colors.accent} />
              <Text style={styles.ratingText}>{product.rating || '4.9'}</Text>
              <Text style={styles.reviewCount}>(248 reviews)</Text>
            </View>
          </View>

          {/* Delivery Promise */}
          <View style={styles.deliveryBanner}>
            <Ionicons name="flash" size={16} color={Colors.success} />
            <Text style={styles.deliveryText}>Express delivery in <Text style={{ fontWeight: '800' }}>20–30 minutes</Text> to Bengaluru / Hyderabad</Text>
          </View>

          {/* Qty Selector */}
          <View style={styles.qtyRow}>
            <Text style={styles.qtyLabel}>Quantity</Text>
            <View style={styles.qtyStepper}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setQty(q => Math.max(1, q - 1))}
              >
                <Ionicons name="remove" size={18} color={Colors.primary} />
              </TouchableOpacity>
              <Text style={styles.qtyValue}>{qty}</Text>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setQty(q => q + 1)}
              >
                <Ionicons name="add" size={18} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Info Tabs */}
          <View style={styles.tabs}>
            {(['desc', 'care', 'reviews'] as const).map(tab => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === tab && styles.tabActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                  {tab === 'desc' ? 'About' : tab === 'care' ? 'Care Guide' : 'Reviews'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {activeTab === 'desc' && (
            <View style={styles.tabContent}>
              <Text style={styles.description}>
                The {product.name} is one of the most popular houseplants, celebrated for its stunning foliage and relatively easy-care nature. Perfect for bright, indirect light and thrives in well-draining potting mix. A statement piece for any living room, balcony, or office corner.
              </Text>
              <View style={styles.specs}>
                {[
                  { label: 'Sunlight', value: 'Bright Indirect', icon: 'sunny-outline' },
                  { label: 'Water', value: 'Every 8–10 days', icon: 'water-outline' },
                  { label: 'Difficulty', value: 'Easy', icon: 'leaf-outline' },
                  { label: 'Growth', value: 'Moderate – Fast', icon: 'trending-up-outline' },
                ].map((spec, i) => (
                  <View key={i} style={styles.specItem}>
                    <View style={styles.specIcon}>
                      <Ionicons name={spec.icon as any} size={16} color={Colors.primary} />
                    </View>
                    <View>
                      <Text style={styles.specLabel}>{spec.label}</Text>
                      <Text style={styles.specValue}>{spec.value}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {activeTab === 'care' && (
            <View style={styles.tabContent}>
              {[
                { step: '1', title: 'Watering', tip: 'Water only when the top 2 inches of soil feel dry. Overwatering is the #1 killer.' },
                { step: '2', title: 'Light', tip: 'Place near a bright window, avoiding direct afternoon sun which scorches leaves.' },
                { step: '3', title: 'Fertilizing', tip: 'Feed with liquid NPK fertilizer once a month during spring and summer.' },
                { step: '4', title: 'Repotting', tip: 'Repot every 2 years or when roots start coming out of the drainage hole.' },
              ].map(c => (
                <View key={c.step} style={styles.careCard}>
                  <View style={styles.careStep}>
                    <Text style={styles.careStepText}>{c.step}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.careTitle}>{c.title}</Text>
                    <Text style={styles.careTip}>{c.tip}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {activeTab === 'reviews' && (
            <View style={styles.tabContent}>
              {[
                { name: 'Priya M.', rating: 5, date: 'Sep 28', text: 'Absolutely gorgeous plant! Arrived in perfect condition with a lovely care card. The 20-min delivery is real!' },
                { name: 'Arjun K.', rating: 5, date: 'Sep 25', text: 'Third plant I have ordered from PlantMe. Always fresh and healthy. Will never go back to offline nurseries.' },
                { name: 'Sneha R.', rating: 4, date: 'Sep 20', text: 'Beautiful monstera, slightly smaller than I expected from photos, but very healthy. Customer support resolved it instantly.' },
              ].map((r, i) => (
                <View key={i} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewAvatar}>
                      <Text style={{ color: '#fff', fontWeight: '800' }}>{r.name[0]}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.reviewName}>{r.name}</Text>
                      <View style={styles.reviewStars}>
                        {[...Array(5)].map((_, si) => (
                          <Ionicons key={si} name="star" size={11} color={si < r.rating ? Colors.accent : '#e0e0e0'} />
                        ))}
                        <Text style={styles.reviewDate}>{r.date}</Text>
                      </View>
                    </View>
                  </View>
                  <Text style={styles.reviewText}>{r.text}</Text>
                </View>
              ))}
            </View>
          )}

          {/* 30-Day Guarantee */}
          <View style={styles.guaranteeBanner}>
            <Ionicons name="shield-checkmark" size={20} color={Colors.success} />
            <View style={{ flex: 1 }}>
              <Text style={styles.guaranteeTitle}>30-Day PlantMe Thrive Guarantee</Text>
              <Text style={styles.guaranteeSub}>If your plant doesn't thrive in 30 days, we'll replace it instantly. Zero hassle.</Text>
            </View>
          </View>

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomTotal}>
          <Text style={styles.bottomTotalLabel}>Total</Text>
          <Text style={styles.bottomTotalValue}>₹{product.price * qty}</Text>
        </View>
        <TouchableOpacity style={styles.addToCartBtn} onPress={handleAddToCart}>
          <Ionicons name="bag-add-outline" size={20} color="#fff" />
          <Text style={styles.addToCartBtnText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  imageSection: { height: width * 0.75, position: 'relative' },
  backBtn: { position: 'absolute', top: 50, left: 16, zIndex: 10, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center' },
  topRightActions: { position: 'absolute', top: 50, right: 16, zIndex: 10, flexDirection: 'row', gap: 8 },
  headerIconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center' },
  badgeSmall: { position: 'absolute', top: -3, right: -3, backgroundColor: Colors.accent, borderRadius: 9, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  badgeTextSmall: { color: '#fff', fontSize: 10, fontWeight: '800' },
  heroImage: { width: '100%', height: '100%' },
  scroll: { flex: 1 },
  content: { padding: Spacing.md },
  tagsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: 8 },
  tagChip: { backgroundColor: Colors.surfaceAlt, borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  tagChipText: { fontSize: 11, fontWeight: '700', color: Colors.primary },
  productName: { fontSize: 22, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  tagline: { fontSize: 13, color: Colors.textMuted, marginBottom: 12 },
  priceRatingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  price: { fontSize: 26, fontWeight: '800', color: Colors.primary },
  ratingChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 14, fontWeight: '700', color: Colors.text },
  reviewCount: { fontSize: 12, color: Colors.textMuted },
  deliveryBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#f0fdf4', borderRadius: Radius.md, padding: Spacing.sm, marginBottom: 16, borderWidth: 1, borderColor: Colors.borderGreen },
  deliveryText: { fontSize: 12, color: Colors.success },
  qtyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  qtyLabel: { fontSize: 14, fontWeight: '700', color: Colors.text },
  qtyStepper: { flexDirection: 'row', alignItems: 'center', gap: 0, borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.md, overflow: 'hidden' },
  qtyBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.surfaceAlt },
  qtyValue: { width: 36, textAlign: 'center', fontSize: 15, fontWeight: '800', color: Colors.text },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: Colors.border, marginBottom: Spacing.md },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2.5, borderBottomColor: Colors.primary },
  tabText: { fontSize: 13, fontWeight: '600', color: Colors.textMuted },
  tabTextActive: { color: Colors.primary, fontWeight: '800' },
  tabContent: { marginBottom: Spacing.md },
  description: { fontSize: 14, lineHeight: 22, color: Colors.textSecondary, marginBottom: 16 },
  specs: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  specItem: { flexDirection: 'row', alignItems: 'center', gap: 10, width: (width - 48) / 2 },
  specIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
  specLabel: { fontSize: 10, color: Colors.textMuted, fontWeight: '600' },
  specValue: { fontSize: 12, fontWeight: '700', color: Colors.text },
  careCard: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  careStep: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  careStepText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  careTitle: { fontSize: 13, fontWeight: '800', color: Colors.text, marginBottom: 2 },
  careTip: { fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },
  reviewCard: { marginBottom: 16, padding: 14, backgroundColor: Colors.bg, borderRadius: Radius.md },
  reviewHeader: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  reviewAvatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  reviewName: { fontSize: 13, fontWeight: '700', color: Colors.text },
  reviewStars: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 3 },
  reviewDate: { fontSize: 10, color: Colors.textMuted, marginLeft: 6 },
  reviewText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
  guaranteeBanner: { flexDirection: 'row', gap: 12, padding: 14, backgroundColor: '#f0fdf4', borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.borderGreen, alignItems: 'flex-start' },
  guaranteeTitle: { fontSize: 13, fontWeight: '800', color: Colors.success, marginBottom: 2 },
  guaranteeSub: { fontSize: 12, color: '#166534', lineHeight: 17 },
  bottomBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: Colors.border, paddingBottom: 32 },
  bottomTotal: {},
  bottomTotalLabel: { fontSize: 11, color: Colors.textMuted, fontWeight: '600' },
  bottomTotalValue: { fontSize: 22, fontWeight: '800', color: Colors.primary },
  addToCartBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.primary, borderRadius: Radius.lg, paddingVertical: 14, paddingHorizontal: 24 },
  addToCartBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
});
