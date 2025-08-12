// Design tokens for STRD (dark theme)
export const colors = {
  // Backgrounds
  bg: {
    page: '#0D0F12',
    elev1: '#121419',
    elev2: '#161922',
  },
  // Text
  text: {
    primary: '#E8EAED',
    secondary: '#A8AFB9',
    muted: '#7D8590',
  },
  // Accent & semantic
  accent: '#F5C84C',
  accentOn: '#0B0C0F',
  border: '#242833',
  success: '#51D675',
  danger: '#FF6B6B',

  // Legacy aliases (to minimize churn while refactoring)
  primary: '#F5C84C',
  onPrimary: '#0B0C0F',
  surface: '#121419',
  surfaceAlt: '#0D0F12',
  card: '#121419',
  textMuted: '#7D8590',
  error: '#FF6B6B',
  warning: '#F5C84C',
  info: '#51D675',
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
  display: { fontSize: 32, lineHeight: 38, fontWeight: '700' as const },
  h1: { fontSize: 24, lineHeight: 30, fontWeight: '700' as const },
  h2: { fontSize: 20, lineHeight: 26, fontWeight: '700' as const },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' as const },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '500' as const },
  monoDigits: { fontVariant: ['tabular-nums'] as const },
  // Legacy aliases
  h3: { fontSize: 20, lineHeight: 26, fontWeight: '700' as const },
  title: { fontSize: 18, lineHeight: 24, fontWeight: '600' as const },
  overline: { fontSize: 11, lineHeight: 16, fontWeight: '600' as const },
};

export const shadows = {
  hairline: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2 },
  sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 6 },
  md: { shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 16 },
  lg: { shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.45, shadowRadius: 28 },
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
