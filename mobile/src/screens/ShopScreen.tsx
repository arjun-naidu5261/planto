import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image,
  StyleSheet, Dimensions, StatusBar, FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius } from '../constants/theme';
import { useApp } from '../context/AppContext';

const { width } = Dimensions.get('window');

const SAMPLE_PLANTS = [
  { id: '1', name: 'Monstera Deliciosa', price: 599, category: 'Indoor', rating: 4.9, tag: 'Bestseller', image: 'https://images.unsplash.com/photo-1616948465004-7a28b85c20ac?w=400', color: '#e8f5e9' },
  { id: '2', name: 'Snake Plant (Laurentii)', price: 349, category: 'Air Purifier', rating: 4.8, tag: 'Pet-Safe', image: 'https://images.unsplash.com/photo-1611211231915-1d76f17f65a6?w=400', color: '#fff3e0' },
  { id: '3', name: 'Golden Pothos', price: 249, category: 'Low-Light', rating: 4.7, tag: 'Low-Light', image: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=400', color: '#f3e5f5' },
  { id: '4', name: 'Peace Lily', price: 449, category: 'Indoor', rating: 4.9, tag: 'Air-Purifier', image: 'https://images.unsplash.com/photo-1593691509543-c55fb32d7dd7?w=400', color: '#e3f2fd' },
  { id: '5', name: 'ZZ Plant', price: 529, category: 'Office-Friendly', rating: 4.6, tag: 'Forgetful-Friendly', image: 'https://images.unsplash.com/photo-1598880940080-ff9a29891b85?w=400', color: '#fce4ec' },
  { id: '6', name: 'Fiddle Leaf Fig', price: 1299, category: 'Statement Plant', rating: 4.5, tag: 'Premium', image: 'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?w=400', color: '#f9fbe7' },
  { id: '7', name: 'Bird of Paradise', price: 899, category: 'Outdoor', rating: 4.8, tag: 'Rare', image: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=400', color: '#fff9c4' },
  { id: '8', name: 'Rubber Plant', price: 649, category: 'Indoor', rating: 4.7, tag: 'Decor-Friendly', image: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=400', color: '#fbe9e7' },
];

const FILTERS = ['All', 'Indoor', 'Outdoor', 'Air Purifier', 'Pet-Safe', 'Low-Light', 'Succulents'];

const CARD_W = (width - Spacing.md * 2 - Spacing.sm) / 2;

export default function ShopScreen({ navigation }: any) {
  const { addToCart, wishlist, toggleWishlist } = useApp();
  const [activeFilter, setActiveFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'popular'>('popular');

  const filteredPlants = SAMPLE_PLANTS
    .filter(p => activeFilter === 'All' || p.category === activeFilter || p.tag === activeFilter)
    .sort((a, b) =>
      sortBy === 'price_asc' ? a.price - b.price :
      sortBy === 'price_desc' ? b.price - a.price :
      b.rating - a.rating
    );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      {/* Header */}
      <LinearGradient colors={[Colors.primary, Colors.primaryLight]} style={styles.header}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Plant Collection</Text>
            <Text style={styles.headerSub}>{filteredPlants.length} plants available for 20-min delivery</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              style={styles.headerIconBtn}
              onPress={() => navigation.navigate('Wishlist')}
              accessibilityLabel="Wishlist"
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
              accessibilityLabel="Flora AI"
            >
              <Ionicons name="chatbubbles-outline" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.body}>
        {/* Filter chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
              onPress={() => setActiveFilter(f)}
            >
              <Text style={[styles.filterChipText, activeFilter === f && styles.filterChipTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Sort row */}
        <View style={styles.sortRow}>
          <Text style={styles.resultCount}>{filteredPlants.length} plants</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[
              { key: 'popular', label: 'Popular' },
              { key: 'price_asc', label: 'Price ↑' },
              { key: 'price_desc', label: 'Price ↓' },
            ].map(s => (
              <TouchableOpacity
                key={s.key}
                style={[styles.sortChip, sortBy === s.key && styles.sortChipActive]}
                onPress={() => setSortBy(s.key as any)}
              >
                <Text style={[styles.sortChipText, sortBy === s.key && styles.sortChipTextActive]}>{s.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Plant Grid */}
        <FlatList
          data={filteredPlants}
          numColumns={2}
          keyExtractor={item => item.id}
          columnWrapperStyle={{ gap: Spacing.sm }}
          contentContainerStyle={{ gap: Spacing.sm, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.plantCard}
              onPress={() => navigation.navigate('ProductDetail', { product: item })}
              activeOpacity={0.9}
            >
              <View style={[styles.imgContainer, { backgroundColor: item.color }]}>
                <Image source={{ uri: item.image }} style={styles.plantImg} resizeMode="cover" />
                <View style={styles.tagBadge}>
                  <Text style={styles.tagText}>{item.tag}</Text>
                </View>
                <TouchableOpacity
                  style={styles.heartBtn}
                  onPress={() => toggleWishlist(item.id)}
                >
                  <Ionicons
                    name={wishlist.includes(item.id) ? 'heart' : 'heart-outline'}
                    size={17}
                    color={wishlist.includes(item.id) ? '#ef4444' : '#999'}
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.plantName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.plantCat}>{item.category}</Text>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={11} color={Colors.accent} />
                  <Text style={styles.ratingText}>{item.rating}</Text>
                  <Text style={styles.deliveryText}>• 20 min</Text>
                </View>
                <View style={styles.priceRow}>
                  <Text style={styles.price}>₹{item.price}</Text>
                  <TouchableOpacity style={styles.addBtn} onPress={() => addToCart(item)}>
                    <Ionicons name="add" size={18} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { paddingTop: 50, paddingHorizontal: Spacing.md, paddingBottom: Spacing.md },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  headerIconBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: -3, right: -3, backgroundColor: Colors.accent, borderRadius: 9, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  body: { flex: 1, paddingHorizontal: Spacing.md, paddingTop: Spacing.sm },
  filterRow: { marginBottom: Spacing.sm },
  filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.full, backgroundColor: '#fff', borderWidth: 1.5, borderColor: Colors.border, marginRight: Spacing.sm },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterChipText: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  filterChipTextActive: { color: '#fff' },
  sortRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.sm },
  resultCount: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  sortChip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: Radius.full, backgroundColor: '#f0f0f0', marginLeft: 6 },
  sortChipActive: { backgroundColor: Colors.primary },
  sortChipText: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary },
  sortChipTextActive: { color: '#fff' },
  plantCard: { width: CARD_W, backgroundColor: '#fff', borderRadius: Radius.lg, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  imgContainer: { height: CARD_W * 0.9, position: 'relative' },
  plantImg: { width: '100%', height: '100%' },
  tagBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: Colors.primary, paddingHorizontal: 7, paddingVertical: 3, borderRadius: Radius.full },
  tagText: { fontSize: 9, fontWeight: '800', color: '#fff', textTransform: 'uppercase' },
  heartBtn: { position: 'absolute', top: 8, right: 8, width: 30, height: 30, borderRadius: 15, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  cardInfo: { padding: Spacing.sm },
  plantName: { fontSize: 13, fontWeight: '800', color: Colors.text },
  plantCat: { fontSize: 11, color: Colors.textMuted, marginTop: 1 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4 },
  ratingText: { fontSize: 11, fontWeight: '700', color: Colors.text },
  deliveryText: { fontSize: 11, color: Colors.success, fontWeight: '700' },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  price: { fontSize: 15, fontWeight: '800', color: Colors.primary },
  addBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
});
