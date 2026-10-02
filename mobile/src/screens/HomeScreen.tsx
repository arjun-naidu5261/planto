import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Image, Dimensions, StatusBar, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Radius, Typography } from '../constants/theme';
import { api } from '../services/api';
import { useApp } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const FEATURED_PLANTS = [
  {
    id: '1', name: 'Monstera Deliciosa', tagline: 'Swiss Cheese Plant', price: 599,
    tag: 'Bestseller', color: '#e8f5e9',
    image: 'https://images.unsplash.com/photo-1616948465004-7a28b85c20ac?w=400',
  },
  {
    id: '2', name: 'Snake Plant (Laurentii)', tagline: 'Air-Purifying Champion', price: 349,
    tag: 'Pet-Safe', color: '#fff3e0',
    image: 'https://images.unsplash.com/photo-1611211231915-1d76f17f65a6?w=400',
  },
  {
    id: '3', name: 'Golden Pothos', tagline: 'Money Plant — Thrives on Neglect', price: 249,
    tag: 'Low-Light', color: '#f3e5f5',
    image: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=400',
  },
  {
    id: '4', name: 'Peace Lily', tagline: 'Low-Maintenance Bloom', price: 449,
    tag: 'Air-Purifier', color: '#e3f2fd',
    image: 'https://images.unsplash.com/photo-1593691509543-c55fb32d7dd7?w=400',
  },
  {
    id: '5', name: 'ZZ Plant', tagline: 'The Invincible Houseplant', price: 529,
    tag: 'Office-Friendly', color: '#fce4ec',
    image: 'https://images.unsplash.com/photo-1598880940080-ff9a29891b85?w=400',
  },
  {
    id: '6', name: 'Fiddle Leaf Fig', tagline: 'Instagram\'s Favourite', price: 1299,
    tag: 'Statement Plant', color: '#f9fbe7',
    image: 'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?w=400',
  },
];

const CATEGORIES = [
  { id: 'indoor', label: 'Indoor', icon: 'home-outline' },
  { id: 'outdoor', label: 'Outdoor', icon: 'sunny-outline' },
  { id: 'succulents', label: 'Succulents', icon: 'leaf-outline' },
  { id: 'pet-safe', label: 'Pet-Safe', icon: 'paw-outline' },
  { id: 'air', label: 'Air Purifiers', icon: 'cloud-outline' },
  { id: 'gifts', label: 'Gift Plants', icon: 'gift-outline' },
];

const FEATURE_BADGES = [
  { icon: 'flash', label: '20-Min Delivery', color: '#22c55e', bg: '#f0fdf4' },
  { icon: 'shield-checkmark', label: '30-Day Guarantee', color: '#3b82f6', bg: '#eff6ff' },
  { icon: 'leaf', label: 'Live Plants Only', color: '#1b4332', bg: '#e8f5e9' },
  { icon: 'star', label: '4.9★ Rating', color: '#D4A84B', bg: '#fffbeb' },
];

export default function HomeScreen({ navigation }: any) {
  const { cart, addToCart, wishlist, toggleWishlist } = useApp();
  const [activeCategory, setActiveCategory] = useState('indoor');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  useEffect(() => {
    api.getProducts()
      .then(data => setProducts(data || []))
      .catch(() => setProducts(FEATURED_PLANTS));
  }, []);

  const displayPlants = (products.length > 0 ? products : FEATURED_PLANTS)
    .filter((p: any) => !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleGoToShop = () => {
    try {
      const parent = navigation.getParent();
      if (parent) {
        parent.navigate('ShopTab');
        return;
      }
    } catch {}
    try {
      navigation.navigate('ShopTab');
      return;
    } catch {}
    navigation.navigate('Shop');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      {/* Header */}
      <LinearGradient colors={[Colors.primary, Colors.primaryLight]} style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerGreet}>Good morning 🌱</Text>
            <Text style={styles.headerTitle}>PlantMe</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerIconBtn}
              onPress={() => navigation.navigate('Wishlist')}
              accessibilityLabel="My Wishlist"
            >
              <Ionicons name="heart-outline" size={22} color="#fff" />
              {wishlist.length > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{wishlist.length}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerIconBtn}
              onPress={() => navigation.navigate('HelpBot')}
              accessibilityLabel="Flora AI Concierge"
            >
              <Ionicons name="chatbubbles-outline" size={22} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerIconBtn}
              onPress={() => navigation.navigate('CartTab')}
              accessibilityLabel="My Cart"
            >
              <Ionicons name="bag-outline" size={22} color="#fff" />
              {cartCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{cartCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerIconBtn}
              onPress={() => navigation.navigate('ProfileTab')}
              accessibilityLabel="Profile"
            >
              <Ionicons name="person-outline" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search plants, soil, pots..."
            placeholderTextColor={Colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>

        {/* Feature Badges */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.badgesRow}>
          {FEATURE_BADGES.map((b, i) => (
            <View key={i} style={[styles.featureBadge, { backgroundColor: b.bg }]}>
              <Ionicons name={b.icon as any} size={16} color={b.color} />
              <Text style={[styles.featureBadgeText, { color: b.color }]}>{b.label}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Hero Banner */}
        <LinearGradient
          colors={['#1b4332', '#2d6a4f']}
          style={styles.heroBanner}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        >
          <View style={styles.heroBannerContent}>
            <Text style={styles.heroBannerTag}>LIMITED TIME OFFER</Text>
            <Text style={styles.heroBannerTitle}>Get your first{'\n'}plant delivered{'\n'}in 20 minutes</Text>
            <Text style={styles.heroBannerSub}>Use code FIRSTPLANT for 20% off</Text>
            <TouchableOpacity style={styles.heroBannerBtn} onPress={handleGoToShop}>
              <Text style={styles.heroBannerBtnText}>Shop Now →</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.heroBannerEmoji}>🌿</Text>
        </LinearGradient>

        {/* Categories */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Browse by Category</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesRow}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.categoryPill, activeCategory === cat.id && styles.categoryPillActive]}
              onPress={() => setActiveCategory(cat.id)}
            >
              <Ionicons
                name={cat.icon as any}
                size={16}
                color={activeCategory === cat.id ? '#fff' : Colors.primary}
              />
              <Text style={[styles.categoryLabel, activeCategory === cat.id && styles.categoryLabelActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Plant Grid */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Trending Plants</Text>
          <TouchableOpacity onPress={handleGoToShop}>
            <Text style={styles.seeAll}>See All →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.plantsGrid}>
          {displayPlants.slice(0, 6).map((plant: any) => (
            <TouchableOpacity
              key={plant.id}
              style={styles.plantCard}
              onPress={() => navigation.navigate('ProductDetail', { product: plant })}
              activeOpacity={0.9}
            >
              <View style={[styles.plantImageContainer, { backgroundColor: plant.color || '#e8f5e9' }]}>
                <Image
                  source={{ uri: plant.image || plant.images?.[0] }}
                  style={styles.plantImage}
                  resizeMode="cover"
                />
                {plant.tag && (
                  <View style={styles.plantTag}>
                    <Text style={styles.plantTagText}>{plant.tag}</Text>
                  </View>
                )}
                <TouchableOpacity
                  style={styles.wishlistBtn}
                  onPress={() => toggleWishlist(plant.id)}
                >
                  <Ionicons
                    name={wishlist.includes(plant.id) ? 'heart' : 'heart-outline'}
                    size={18}
                    color={wishlist.includes(plant.id) ? '#e53e3e' : Colors.textMuted}
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.plantInfo}>
                <Text style={styles.plantName} numberOfLines={1}>{plant.name}</Text>
                <Text style={styles.plantTagline} numberOfLines={1}>
                  {plant.tagline || plant.category || 'Indoor Plant'}
                </Text>
                <View style={styles.plantPriceRow}>
                  <Text style={styles.plantPrice}>₹{plant.price}</Text>
                  <TouchableOpacity
                    style={styles.addBtn}
                    onPress={() => {
                      addToCart(plant);
                    }}
                  >
                    <Ionicons name="add" size={18} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Care Pass Banner */}
        <LinearGradient
          colors={['#064e3b', '#047857']}
          style={styles.carePassBanner}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.carePassTag}>VIP MEMBERSHIP</Text>
            <Text style={styles.carePassTitle}>PlantMe Care Pass</Text>
            <Text style={styles.carePassSub}>
              Unlimited 1-Click replacements • Free quarterly vermicompost • Live botanist calls
            </Text>
            <TouchableOpacity style={styles.carePassBtn} onPress={() => navigation.navigate('ProfileTab')}>
              <Text style={styles.carePassBtnText}>Activate for ₹99/mo</Text>
            </TouchableOpacity>
          </View>
          <Text style={{ fontSize: 48 }}>🛡️</Text>
        </LinearGradient>

        {/* Express Delivery Promise */}
        <View style={styles.expressRow}>
          {[
            { icon: '⚡', label: '20-Min Express', sub: 'Doorstep delivery' },
            { icon: '🌱', label: 'Live Guarantee', sub: '30-day thrive promise' },
            { icon: '♻️', label: 'Eco Packaging', sub: 'Zero plastic' },
          ].map((item, i) => (
            <View key={i} style={styles.expressCard}>
              <Text style={styles.expressEmoji}>{item.icon}</Text>
              <Text style={styles.expressLabel}>{item.label}</Text>
              <Text style={styles.expressSub}>{item.sub}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const CARD_W = (width - Spacing.md * 2 - Spacing.sm) / 2;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { paddingTop: 50, paddingHorizontal: Spacing.md, paddingBottom: Spacing.md },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  headerGreet: { fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#fff' },
  headerActions: { flexDirection: 'row', gap: Spacing.sm },
  headerIconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: -4, right: -4, width: 18, height: 18, borderRadius: 9, backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center' },
  badgeText: { fontSize: 10, color: '#fff', fontWeight: '800' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: Radius.md, paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs, gap: Spacing.sm },
  searchInput: { flex: 1, fontSize: 14, color: Colors.text },
  scroll: { flex: 1 },
  badgesRow: { paddingLeft: Spacing.md, paddingVertical: Spacing.md },
  featureBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: Radius.full, marginRight: Spacing.sm },
  featureBadgeText: { fontSize: 12, fontWeight: '700' },
  heroBanner: { marginHorizontal: Spacing.md, borderRadius: Radius.xl, padding: Spacing.lg, flexDirection: 'row', alignItems: 'center', overflow: 'hidden' },
  heroBannerContent: { flex: 1 },
  heroBannerTag: { fontSize: 10, fontWeight: '800', color: Colors.accent, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  heroBannerTitle: { fontSize: 22, fontWeight: '800', color: '#fff', lineHeight: 28, marginBottom: 8 },
  heroBannerSub: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 16 },
  heroBannerBtn: { backgroundColor: '#fff', borderRadius: Radius.md, paddingVertical: 10, paddingHorizontal: 18, alignSelf: 'flex-start' },
  heroBannerBtnText: { color: Colors.primary, fontWeight: '800', fontSize: 13 },
  heroBannerEmoji: { fontSize: 72, opacity: 0.6 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, marginTop: Spacing.lg, marginBottom: Spacing.sm },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: Colors.text },
  seeAll: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  categoriesRow: { paddingLeft: Spacing.md, marginBottom: Spacing.sm },
  categoryPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.full, backgroundColor: '#fff', borderWidth: 1.5, borderColor: Colors.border, marginRight: Spacing.sm },
  categoryPillActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  categoryLabel: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  categoryLabelActive: { color: '#fff' },
  plantsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.md, gap: Spacing.sm },
  plantCard: { width: CARD_W, backgroundColor: '#fff', borderRadius: Radius.lg, overflow: 'hidden', shadowColor: Colors.cardShadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  plantImageContainer: { height: CARD_W * 0.85, position: 'relative' },
  plantImage: { width: '100%', height: '100%' },
  plantTag: { position: 'absolute', top: 8, left: 8, backgroundColor: Colors.primary, paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
  plantTagText: { fontSize: 9, fontWeight: '800', color: '#fff', textTransform: 'uppercase' },
  wishlistBtn: { position: 'absolute', top: 8, right: 8, width: 32, height: 32, borderRadius: 16, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  plantInfo: { padding: Spacing.sm },
  plantName: { fontSize: 13, fontWeight: '800', color: Colors.text },
  plantTagline: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  plantPriceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  plantPrice: { fontSize: 15, fontWeight: '800', color: Colors.primary },
  addBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  carePassBanner: { margin: Spacing.md, borderRadius: Radius.xl, padding: Spacing.lg, flexDirection: 'row', alignItems: 'center' },
  carePassTag: { fontSize: 10, fontWeight: '800', color: Colors.accent, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  carePassTitle: { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 6 },
  carePassSub: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginBottom: 16, lineHeight: 18 },
  carePassBtn: { backgroundColor: '#22c55e', borderRadius: Radius.md, paddingVertical: 9, paddingHorizontal: 16, alignSelf: 'flex-start' },
  carePassBtnText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  expressRow: { flexDirection: 'row', paddingHorizontal: Spacing.md, gap: Spacing.sm, marginBottom: Spacing.md },
  expressCard: { flex: 1, backgroundColor: '#fff', borderRadius: Radius.md, padding: Spacing.sm, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  expressEmoji: { fontSize: 24, marginBottom: 4 },
  expressLabel: { fontSize: 11, fontWeight: '700', color: Colors.text, textAlign: 'center' },
  expressSub: { fontSize: 9, color: Colors.textMuted, textAlign: 'center', marginTop: 2 },
});
