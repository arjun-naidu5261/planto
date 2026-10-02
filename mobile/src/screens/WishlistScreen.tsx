import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image,
  StyleSheet, StatusBar, Alert, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { ALL_PLANTS, getPlantById } from '../data/plants';

const { width } = Dimensions.get('window');

export default function WishlistScreen({ navigation }: any) {
  const { wishlist, removeFromWishlist, addToCart, cart } = useApp();

  // Find plants in wishlist
  const wishlistedPlants = wishlist
    .map(id => getPlantById(id) || ALL_PLANTS.find(p => p.id === id))
    .filter(Boolean) as typeof ALL_PLANTS;

  const handleMoveToCart = (plant: any) => {
    addToCart({
      id: plant.id,
      name: plant.name,
      price: plant.price,
      images: [plant.image],
    });
    removeFromWishlist(plant.id);
    Alert.alert('Moved to Cart! 🌿', `${plant.name} is now in your cart. You can proceed to checkout anytime!`);
  };

  const handleMoveAllToCart = () => {
    wishlistedPlants.forEach(plant => {
      addToCart({
        id: plant.id,
        name: plant.name,
        price: plant.price,
        images: [plant.image],
      });
      removeFromWishlist(plant.id);
    });
    Alert.alert('All Added! 🌿', 'All wishlist plants were moved to your cart!');
    navigation.navigate('CartTab');
  };

  const totalWishlistVal = wishlistedPlants.reduce((s, p) => s + p.price, 0);

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
            <Text style={styles.headerTitle}>My Wishlist</Text>
            <Text style={styles.headerSub}>
              {wishlistedPlants.length} {wishlistedPlants.length === 1 ? 'favourite plant' : 'favourite plants'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.cartIconBtn}
            onPress={() => navigation.navigate('CartTab')}
          >
            <Ionicons name="bag-outline" size={22} color="#fff" />
            {cart.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{cart.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {wishlistedPlants.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="heart-dislike-outline" size={56} color={Colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>Your Wishlist is Empty</Text>
          <Text style={styles.emptySub}>
            Explore our curated selection of air-purifying, pet-safe, and low-light plants for instant 20-minute delivery.
          </Text>
          <TouchableOpacity
            style={styles.exploreBtn}
            onPress={() => navigation.navigate('ShopTab')}
          >
            <Text style={styles.exploreBtnText}>Explore Plants →</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            <View style={styles.bannerStrip}>
              <Ionicons name="flash" size={16} color="#16a34a" />
              <Text style={styles.bannerText}>
                All items in your wishlist are in stock for 20-min express delivery!
              </Text>
            </View>

            <View style={styles.list}>
              {wishlistedPlants.map(plant => (
                <View key={plant.id} style={styles.card}>
                  <TouchableOpacity
                    style={styles.cardContent}
                    onPress={() => navigation.navigate('ProductDetail', { product: plant })}
                    activeOpacity={0.9}
                  >
                    <Image source={{ uri: plant.image }} style={styles.plantImg} />
                    <View style={styles.info}>
                      <View style={styles.tagRow}>
                        <View style={styles.categoryBadge}>
                          <Text style={styles.categoryText}>{plant.category}</Text>
                        </View>
                        <View style={styles.ratingBadge}>
                          <Ionicons name="star" size={11} color="#f59e0b" />
                          <Text style={styles.ratingText}>{plant.rating}</Text>
                        </View>
                      </View>

                      <Text style={styles.plantName} numberOfLines={1}>{plant.name}</Text>
                      {plant.tagline ? (
                        <Text style={styles.tagline} numberOfLines={1}>{plant.tagline}</Text>
                      ) : null}

                      <View style={styles.priceRow}>
                        <Text style={styles.price}>₹{plant.price}</Text>
                        <Text style={styles.originalPrice}>₹{Math.round(plant.price * 1.35)}</Text>
                        <Text style={styles.discount}>35% OFF</Text>
                      </View>
                    </View>
                  </TouchableOpacity>

                  {/* Actions */}
                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => removeFromWishlist(plant.id)}
                      accessibilityLabel="Remove from wishlist"
                    >
                      <Ionicons name="trash-outline" size={18} color={Colors.error} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.moveToCartBtn}
                      onPress={() => handleMoveToCart(plant)}
                    >
                      <Ionicons name="cart-outline" size={16} color="#fff" />
                      <Text style={styles.moveToCartText}>Move to Cart</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>

            <View style={{ height: 120 }} />
          </ScrollView>

          {/* Bottom Bar */}
          <View style={styles.bottomBar}>
            <View>
              <Text style={styles.bottomVal}>₹{totalWishlistVal}</Text>
              <Text style={styles.bottomSub}>{wishlistedPlants.length} plants total</Text>
            </View>
            <TouchableOpacity
              style={styles.moveAllBtn}
              onPress={handleMoveAllToCart}
            >
              <Ionicons name="bag-check" size={18} color="#fff" />
              <Text style={styles.moveAllBtnText}>Move All to Cart →</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    paddingTop: 50,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  headerNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    marginHorizontal: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  headerSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  cartIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: Colors.accent,
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
  scroll: { flex: 1 },
  bannerStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#dcfce7',
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    padding: 10,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#86efac',
  },
  bannerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803d',
    flex: 1,
  },
  list: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardContent: {
    flexDirection: 'row',
    gap: 12,
  },
  plantImg: {
    width: 84,
    height: 84,
    borderRadius: Radius.md,
    backgroundColor: '#f1f5f9',
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  categoryBadge: {
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  plantName: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.text,
  },
  tagline: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  price: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
  },
  originalPrice: {
    fontSize: 12,
    color: Colors.textMuted,
    textDecorationLine: 'line-through',
  },
  discount: {
    fontSize: 11,
    fontWeight: '800',
    color: '#16a34a',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  deleteBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moveToCartBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    height: 40,
  },
  moveToCartText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: Spacing.md,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  bottomVal: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primary,
  },
  bottomSub: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  moveAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  moveAllBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e8f5e9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  exploreBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    paddingVertical: 14,
    paddingHorizontal: 28,
  },
  exploreBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
});
