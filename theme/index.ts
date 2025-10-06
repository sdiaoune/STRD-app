// Backwards-compatible theme facade with dynamic light/dark support
import * as tokens from '../tokens';

const darkColors = {
  bg: tokens.colors.bg.page,
  card: tokens.colors.bg.elev1,
  primary: tokens.colors.accent,
  text: tokens.colors.text.primary,
  muted: tokens.colors.text.muted,
  border: tokens.colors.border,
  secondary: tokens.colors.text.secondary,
  warning: tokens.colors.warning,
  error: tokens.colors.danger,
  onPrimary: tokens.colors.accentOn,
};

const lightColors = {
  bg: '#FFFFFF',
  card: '#FFFFFF',
  primary: tokens.colors.accent,
  text: '#0B0C0F',
  muted: '#586074',
  border: '#E5E8F0',
  secondary: '#2D3445',
  warning: '#E3B23C',
  error: '#E25050',
  onPrimary: '#0B0C0F',
};

export const getColors = (theme: 'dark' | 'light') => (theme === 'light' ? lightColors : darkColors);

// Read current theme from store (fallback to dark before store initializes)
const getCurrentTheme = (): 'dark' | 'light' => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { useStore } = require('../state/store');
    const pref = useStore.getState?.()?.themePreference as 'dark' | 'light' | undefined;
    return pref || 'dark';
  } catch {
    return 'dark';
  }
};

// Colors object that switches in bulk for our top-level usages while keeping nested shapes stable
export const colors = {
  get bg() { return getColors(getCurrentTheme()).bg; },
  get card() { return getColors(getCurrentTheme()).card; },
  get primary() { return getColors(getCurrentTheme()).primary; },
  get text() { return getColors(getCurrentTheme()).text; },
  get muted() { return getColors(getCurrentTheme()).muted; },
  get border() { return getColors(getCurrentTheme()).border; },
  get secondary() { return getColors(getCurrentTheme()).secondary; },
  get warning() { return getColors(getCurrentTheme()).warning; },
  get error() { return getColors(getCurrentTheme()).error; },
  get onPrimary() { return getColors(getCurrentTheme()).onPrimary; },
};

export const spacing = {
  xs: tokens.spacing[1],
  sm: tokens.spacing[2],
  md: tokens.spacing[4],
  lg: tokens.spacing[6],
  xl: tokens.spacing[7],
  xxl: tokens.spacing[8],
};

export const borderRadius = {
  sm: tokens.radii.sm,
  md: tokens.radii.md,
  lg: tokens.radii.lg,
  xl: tokens.radii.xl,
};

export const typography = {
  h1: tokens.typography.display,
  h2: tokens.typography.h1,
  h3: tokens.typography.h2,
  body: tokens.typography.body,
  caption: tokens.typography.caption,
  small: { fontSize: 12, fontWeight: '400' as const },
};

// New re-exports (non-breaking additions)
export const shadows = tokens.nativeShadows;
export const surfaces = tokens.surfaces;
export const gradient = tokens.gradient;

// Helper to get React Navigation theme objects (dynamic)
export const getNavigationTheme = () => {
  const theme = getCurrentTheme();
  const palette = getColors(theme);
  return {
    dark: theme === 'dark',
    colors: {
      primary: palette.primary,
      background: palette.bg,
      card: palette.card,
      text: palette.text,
      border: palette.border,
      notification: palette.primary,
    },
    fonts: {
      regular: { fontFamily: 'System', fontWeight: '400' as const },
      medium: { fontFamily: 'System', fontWeight: '500' as const },
      bold: { fontFamily: 'System', fontWeight: '700' as const },
      heavy: { fontFamily: 'System', fontWeight: '900' as const },
    },
  } as const;
};

// No runtime theme hook to keep module simple and crash-free
