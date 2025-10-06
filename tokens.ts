// Design tokens for STRD (static dark base). Theme switching happens in theme/index.ts
const darkColors = {
  bg: { page: '#0D0F12', elev1: '#121419', elev2: '#161922' },
  text: { primary: '#E8EAED', secondary: '#B0B7C1', muted: '#7D8590' },
  accent: '#F5C84C',
  accentOn: '#0B0C0F',
  border: '#242833',
  success: '#51D675',
  danger: '#FF6B6B',
  // Legacy aliases
  primary: '#F5C84C',
  onPrimary: '#0B0C0F',
  surface: '#121419',
  surfaceAlt: '#0D0F12',
  card: '#121419',
  textMuted: '#7D8590',
  error: '#FF6B6B',
  warning: '#F5C84C',
  info: '#51D675',
} as const;

const lightColors = {
  bg: { page: '#FFFFFF', elev1: '#FFFFFF', elev2: '#F7F9FC' },
  text: { primary: '#0B0C0F', secondary: '#2D3445', muted: '#586074' },
  accent: '#F5C84C',
  accentOn: '#0B0C0F',
  border: '#E5E8F0',
  success: '#2DBE63',
  danger: '#E25050',
  // Legacy aliases
  primary: '#F5C84C',
  onPrimary: '#0B0C0F',
  surface: '#FFFFFF',
  surfaceAlt: '#FFFFFF',
  card: '#FFFFFF',
  textMuted: '#586074',
  error: '#E25050',
  warning: '#E3B23C',
  info: '#2DBE63',
} as const;

const getCurrentTheme = (): 'dark' | 'light' => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { useStore } = require('./state/store');
    const pref = useStore.getState?.()?.themePreference as 'dark' | 'light' | undefined;
    return pref || 'dark';
  } catch {
    return 'dark';
  }
};

export const colors = new Proxy({} as any, {
  get(_target, prop: string) {
    const palette = getCurrentTheme() === 'light' ? lightColors : darkColors;
    return (palette as any)[prop];
  },
});

export const spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 32,
  8: 40,
  // Aliases (non-breaking)
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
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

// Platform-native shadow tokens (non-breaking addition)
export const nativeShadows = {
  shadowSm: {
    ios: { opacity: 0.12, radius: 12, y: 6 },
    android: { elevation: 2 },
  },
  shadowMd: {
    ios: { opacity: 0.15, radius: 18, y: 10 },
    android: { elevation: 3 },
  },
  shadowLg: {
    ios: { opacity: 0.18, radius: 24, y: 14 },
    android: { elevation: 5 },
  },
};

// Semi-transparent surface overlays for depth on dark theme
export const surfaces = {
  surface1: '#FFFFFF0A',
  surface2: '#FFFFFF14',
  surface3: '#FFFFFF1F',
};

// Gradients
export const gradient = {
  primary: ['#F5C84C', '#FFC86E'] as const,
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
  nativeShadows,
  surfaces,
  gradient,
  motion,
};
