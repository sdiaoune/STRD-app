export const colors = {
  primary: '#FFD233',
  onPrimary: '#111315',
  surface: '#171A1F',
  surfaceAlt: '#0F1115',
  border: '#2A2F3A',
  text: '#F5F6F8',
  textMuted: '#A1A6B0',
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
};

export const spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 32,
  8: 40,
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
};

export const typography = {
  h1: { fontSize: 32, lineHeight: 40, fontWeight: '700' as const },
  h2: { fontSize: 24, lineHeight: 32, fontWeight: '700' as const },
  h3: { fontSize: 20, lineHeight: 28, fontWeight: '700' as const },
  title: { fontSize: 18, lineHeight: 24, fontWeight: '600' as const },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' as const },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '500' as const },
  overline: { fontSize: 11, lineHeight: 16, fontWeight: '600' as const },
};

export const shadows = {
  sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.35, shadowRadius: 8 },
  md: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.45, shadowRadius: 24 },
  lg: { shadowColor: '#000', shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.5, shadowRadius: 40 },
};

export const motion = {
  press: { duration: 100, easing: [0.2, 0.8, 0.2, 1] as const },
  rebound: { duration: 200, easing: [0.2, 0.8, 0.2, 1] as const },
  page: { duration: 240, easing: [0.2, 0.8, 0.2, 1] as const },
  shimmer: { duration: 1400, easing: 'linear' as const },
};

export default {
  colors,
  spacing,
  radii,
  typography,
  shadows,
  motion,
};
