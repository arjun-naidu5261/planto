// PlantMe Color Design System
export const Colors = {
  primary: '#1b4332',
  primaryLight: '#2d6a4f',
  primarySoft: '#52b788',
  accent: '#D4A84B',
  accentLight: '#ffd60a',
  bg: '#f5f7f0',
  white: '#ffffff',
  surface: '#ffffff',
  surfaceAlt: '#f0fdf4',
  border: '#e2e8f0',
  borderGreen: '#bbf7d0',
  text: '#1a202c',
  textSecondary: '#4a5568',
  textMuted: '#94a3b8',
  error: '#dc2626',
  success: '#16a34a',
  warning: '#f59e0b',
  cardShadow: 'rgba(27,67,50,0.08)',
  overlay: 'rgba(0,0,0,0.5)',
  gradientStart: '#1b4332',
  gradientEnd: '#2d6a4f',
  goldGradientStart: '#D4A84B',
  goldGradientEnd: '#f5c518',
};

export const Typography = {
  h1: { fontSize: 28, fontWeight: '800' as const, color: Colors.primary },
  h2: { fontSize: 22, fontWeight: '800' as const, color: Colors.primary },
  h3: { fontSize: 18, fontWeight: '700' as const, color: Colors.text },
  h4: { fontSize: 15, fontWeight: '700' as const, color: Colors.text },
  body: { fontSize: 14, fontWeight: '400' as const, color: Colors.textSecondary },
  bodyBold: { fontSize: 14, fontWeight: '700' as const, color: Colors.text },
  caption: { fontSize: 11, fontWeight: '600' as const, color: Colors.textMuted },
  price: { fontSize: 18, fontWeight: '800' as const, color: Colors.primary },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};
