// Design tokens for STRD. Theme switching happens in theme/index.ts
export type ThemeName = 'dark' | 'light';

const baseColorTokens = {
  light: {
    background: '#F3F4F8',
    surface: '#FFFFFF',
    elevatedSurface: '#F8FAFF',
    overlay: 'rgba(15, 23, 42, 0.52)',
    primary: '#365CF6',
    onPrimary: '#FFFFFF',
    secondary: '#64748B',
    accent: '#14B8A6',
    success: '#16A34A',
    warning: '#D97706',
    danger: '#DC2626',
    info: '#0284C7',
    muted: '#CBD5F5',
    border: '#E2E8F0',
    focus: '#93C5FD',
    textPrimary: '#0F172A',
    textSecondary: '#334155',
    textTertiary: '#64748B',
    disabled: '#A1ADC8',
    outline: '#CBD5F5',
  },
  dark: {
    background: '#0B1120',
    surface: '#11172A',
    elevatedSurface: '#17223A',
    overlay: 'rgba(15, 23, 42, 0.72)',
    primary: '#5B7CFF',
    onPrimary: '#0B1120',
    secondary: '#94A3B8',
    accent: '#2DD4BF',
    success: '#22C55E',
    warning: '#F59E0B',
    danger: '#F87171',
    info: '#38BDF8',
    muted: '#273550',
    border: '#1F2A44',
    focus: '#2563EB',
    textPrimary: '#F8FAFC',
    textSecondary: '#CBD5F5',
    textTertiary: '#94A3B8',
    disabled: '#475569',
    outline: '#273550',
  },
} as const;

type BaseColorScheme = typeof baseColorTokens.light;

const buildPalette = (scheme: BaseColorScheme) => ({
  semantic: {
    background: scheme.background,
    surface: scheme.surface,
    elevatedSurface: scheme.elevatedSurface,
    overlay: scheme.overlay,
    primary: scheme.primary,
    secondary: scheme.secondary,
    accent: scheme.accent,
    success: scheme.success,
    warning: scheme.warning,
    danger: scheme.danger,
    info: scheme.info,
    muted: scheme.muted,
    border: scheme.border,
    focus: scheme.focus,
    textPrimary: scheme.textPrimary,
    textSecondary: scheme.textSecondary,
    textTertiary: scheme.textTertiary,
    disabled: scheme.disabled,
    outline: scheme.outline,
  },
  // Legacy aliases retained for compatibility
  bg: {
    page: scheme.background,
    elev1: scheme.surface,
    elev2: scheme.elevatedSurface,
  },
  text: {
    primary: scheme.textPrimary,
    secondary: scheme.textSecondary,
    muted: scheme.textTertiary,
  },
  accent: scheme.primary,
  accentOn: scheme.onPrimary,
  border: scheme.border,
  success: scheme.success,
  danger: scheme.danger,
  primary: scheme.primary,
  onPrimary: scheme.onPrimary,
  surface: scheme.surface,
  surfaceAlt: scheme.elevatedSurface,
  card: scheme.surface,
  textMuted: scheme.textTertiary,
  error: scheme.danger,
  warning: scheme.warning,
  info: scheme.info,
  secondary: scheme.secondary,
  muted: scheme.muted,
} as const);

const darkColors = buildPalette(baseColorTokens.dark);
const lightColors = buildPalette(baseColorTokens.light);

export const themePalettes: Record<ThemeName, typeof darkColors> = {
  dark: darkColors,
  light: lightColors,
};

const getCurrentTheme = (): ThemeName => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { useStore } = require('./state/store');
    const pref = useStore.getState?.()?.themePreference as ThemeName | undefined;
    return pref || 'dark';
  } catch {
    return 'dark';
  }
};

export const colors = new Proxy({} as any, {
  get(_target, prop: string) {
    const palette = themePalettes[getCurrentTheme()];
    return (palette as any)[prop];
  },
});

const spacingScale = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  11: 44,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
  28: 112,
  32: 128,
  36: 144,
  40: 160,
  44: 176,
  48: 192,
  52: 208,
  56: 224,
  60: 240,
  64: 256,
  72: 288,
  80: 320,
  96: 384,
} as const;

export const spacing = {
  ...spacingScale,
  xs: spacingScale[2],
  sm: spacingScale[3],
  md: spacingScale[4],
  lg: spacingScale[6],
  xl: spacingScale[8],
  '2xl': spacingScale[12],
};

export const radii = {
  none: 0,
  sm: 6,
  md: 10,
  lg: 16,
  xl: 22,
  '2xl': 28,
  full: 999,
};

export const typography = {
  fontFamilySans: 'System',
  fontFamilyMono: 'SpaceMono-Regular',
  display: { fontSize: 36, lineHeight: 44, fontWeight: '700' as const },
  headline: { fontSize: 28, lineHeight: 34, fontWeight: '700' as const },
  title: { fontSize: 20, lineHeight: 26, fontWeight: '600' as const },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' as const },
  bodyStrong: { fontSize: 16, lineHeight: 24, fontWeight: '600' as const },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '500' as const },
  mono: { fontFamily: 'SpaceMono-Regular', fontVariant: ['tabular-nums'] as const },
  monoDigits: { fontVariant: ['tabular-nums'] as const },
  // Legacy aliases
  h1: { fontSize: 28, lineHeight: 34, fontWeight: '700' as const },
  h2: { fontSize: 24, lineHeight: 30, fontWeight: '600' as const },
  h3: { fontSize: 20, lineHeight: 26, fontWeight: '600' as const },
  titleLegacy: { fontSize: 18, lineHeight: 24, fontWeight: '600' as const },
  bodyLegacy: { fontSize: 16, lineHeight: 24, fontWeight: '400' as const },
  captionLegacy: { fontSize: 12, lineHeight: 16, fontWeight: '500' as const },
};

export const elevation = {
  x0: { shadowColor: 'transparent', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0, shadowRadius: 0 },
  x1: { shadowColor: '#0F172A', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.12, shadowRadius: 2 },
  x2: { shadowColor: '#0F172A', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.14, shadowRadius: 6 },
  x3: { shadowColor: '#0F172A', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.16, shadowRadius: 12 },
  x4: { shadowColor: '#0F172A', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.18, shadowRadius: 20 },
  x5: { shadowColor: '#0F172A', shadowOffset: { width: 0, height: 14 }, shadowOpacity: 0.2, shadowRadius: 28 },
} as const;

export const nativeShadows = {
  shadowSm: {
    ios: { opacity: 0.12, radius: 8, y: 4 },
    android: { elevation: 2 },
  },
  shadowMd: {
    ios: { opacity: 0.16, radius: 14, y: 8 },
    android: { elevation: 4 },
  },
  shadowLg: {
    ios: { opacity: 0.2, radius: 22, y: 12 },
    android: { elevation: 6 },
  },
  shadowXl: {
    ios: { opacity: 0.24, radius: 32, y: 18 },
    android: { elevation: 10 },
  },
} as const;

export const surfaces = {
  translucent: 'rgba(15, 23, 42, 0.04)',
  subtle: 'rgba(15, 23, 42, 0.08)',
  strong: 'rgba(15, 23, 42, 0.14)',
};

export const gradient = {
  primary: ['#365CF6', '#4B72FF'] as const,
  success: ['#16A34A', '#22C55E'] as const,
};

export const motion = {
  duration: { fast: 120, normal: 180, slow: 260 } as const,
  easing: {
    in: [0.4, 0, 1, 1] as const,
    out: [0, 0, 0.2, 1] as const,
    inOut: [0.2, 0, 0, 1] as const,
  },
  transitions: {
    subtle: { duration: 160, easing: [0.2, 0, 0.2, 1] as const },
    emphasized: { duration: 220, easing: [0.34, 1.56, 0.64, 1] as const },
    overlay: { duration: 260, easing: [0.2, 0, 0.2, 1] as const },
  },
  shimmer: { duration: 1400, easing: 'linear' as const },
};

export const opacity = {
  hover: 0.92,
  pressed: 0.8,
  disabled: 0.48,
  scrim: 0.6,
} as const;

export const colorTokens = baseColorTokens;

export default {
  colors,
  spacing,
  radii,
  typography,
  elevation,
  nativeShadows,
  surfaces,
  gradient,
  motion,
  opacity,
  colorTokens,
};
