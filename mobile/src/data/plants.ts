export interface Plant {
  id: string;
  name: string;
  tagline?: string;
  price: number;
  category: string;
  rating: number;
  tag: string;
  image: string;
  color?: string;
  description?: string;
  light?: string;
  water?: string;
  petSafe?: boolean;
}

export const ALL_PLANTS: Plant[] = [
  {
    id: '1',
    name: 'Monstera Deliciosa',
    tagline: 'The Iconic Swiss Cheese Plant',
    price: 599,
    category: 'Indoor',
    rating: 4.9,
    tag: 'Bestseller',
    image: 'https://images.unsplash.com/photo-1616948465004-7a28b85c20ac?w=600',
    color: '#e8f5e9',
    description: 'Iconic split leaves, exceptionally air-purifying, and fast-growing for any living room.',
    light: 'Bright, indirect light',
    water: 'Once every 7 days',
    petSafe: false,
  },
  {
    id: '2',
    name: 'Snake Plant (Laurentii)',
    tagline: 'NASA Certified 24/7 Oxygen Booster',
    price: 349,
    category: 'Air Purifier',
    rating: 4.8,
    tag: 'Pet-Safe',
    image: 'https://images.unsplash.com/photo-1611211231915-1d76f17f65a6?w=600',
    color: '#fff3e0',
    description: 'Releases oxygen even at night! Thrives in near complete neglect, perfect for bedrooms.',
    light: 'Any light from low to full sun',
    water: 'Once every 14 days',
    petSafe: true,
  },
  {
    id: '3',
    name: 'Golden Pothos (Money Plant)',
    tagline: 'Vibrant trailing vine that brings prosperity',
    price: 249,
    category: 'Low-Light',
    rating: 4.7,
    tag: 'Low-Light',
    image: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=600',
    color: '#f3e5f5',
    description: 'Cascading golden green vines that purify toxins from indoor air effortlessly.',
    light: 'Medium to low indirect light',
    water: 'Every 5 to 7 days',
    petSafe: false,
  },
  {
    id: '4',
    name: 'Peace Lily (Spathiphyllum)',
    tagline: 'Low-Maintenance Bloom & Natural Air Filter',
    price: 449,
    category: 'Indoor',
    rating: 4.9,
    tag: 'Air-Purifier',
    image: 'https://images.unsplash.com/photo-1593691509543-c55fb32d7dd7?w=600',
    color: '#e3f2fd',
    description: 'Graceful snow-white blooms that visibly tell you when they need water by gently drooping.',
    light: 'Low to bright indirect light',
    water: 'Every 4 to 6 days',
    petSafe: false,
  },
  {
    id: '5',
    name: 'ZZ Plant (Zamioculcas)',
    tagline: 'The Invincible Houseplant',
    price: 529,
    category: 'Office-Friendly',
    rating: 4.6,
    tag: 'Forgetful-Friendly',
    image: 'https://images.unsplash.com/photo-1598880940080-ff9a29891b85?w=600',
    color: '#fce4ec',
    description: 'Waxy deep emerald stems that store water in potato-like underground rhizomes.',
    light: 'Low light to fluorescent light',
    water: 'Once every 2 to 3 weeks',
    petSafe: false,
  },
  {
    id: '6',
    name: 'Fiddle Leaf Fig',
    tagline: "Interior Designer's Statement Centerpiece",
    price: 1299,
    category: 'Statement Plant',
    rating: 4.5,
    tag: 'Premium',
    image: 'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?w=600',
    color: '#f9fbe7',
    description: 'Violin-shaped dramatic leaves that elevate the architecture of modern luxury rooms.',
    light: 'Bright filtered sunlight',
    water: 'Weekly when top 2 inches dry',
    petSafe: false,
  },
  {
    id: '7',
    name: 'Bird of Paradise',
    tagline: 'Tropical Luxury with Exotic Foliage',
    price: 899,
    category: 'Outdoor',
    rating: 4.8,
    tag: 'Rare',
    image: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=600',
    color: '#fff9c4',
    description: 'Majestic paddle-shaped leaves that bring an instant resort ambiance.',
    light: 'Full sun to bright indirect light',
    water: 'Weekly during summer',
    petSafe: false,
  },
  {
    id: '8',
    name: 'Rubber Plant (Burgundy)',
    tagline: 'Glossy Deep-Wine Foliage',
    price: 649,
    category: 'Indoor',
    rating: 4.7,
    tag: 'Decor-Friendly',
    image: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=600',
    color: '#fbe9e7',
    description: 'Thick, leathery ruby-toned leaves that remove mold spores and formaldehyde from air.',
    light: 'Bright indirect light',
    water: 'Every 7-10 days',
    petSafe: false,
  },
];

export const getPlantById = (id: string): Plant | undefined => {
  return ALL_PLANTS.find(p => p.id === id);
};
