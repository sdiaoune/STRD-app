// Backwards-compatible theme facade with dynamic light/dark support
import * as tokens from '../tokens';

export type ThemeName = tokens.ThemeName;

type Palette = (typeof tokens.themePalettes)[ThemeName];

type SemanticColors = {
  bg: string;
  bgElevated: string;
  bgSecondary: string;
  background: {
    default: string;
    elevated: string;
    higher: string;
  };
  card: string;
  primary: string;
  accent: string;
  accentOn: string;
  text: {
    primary: string;
    secondary: string;
    muted: string;
  };
  muted: string;
  secondary: string;
  border: string;
  warning: string;
  error: string;
  danger: string;
  success: string;
  info: string;
  surface: string;
  surfaceAlt: string;
  textMuted: string;
  onPrimary: string;
};

const buildSemanticColors = (palette: Palette): SemanticColors => ({
  bg: palette.bg.page,
  bgElevated: palette.bg.elev1,
  bgSecondary: palette.bg.elev2,
  background: {
    default: palette.bg.page,
    elevated: palette.bg.elev1,
    higher: palette.bg.elev2,
  },
  card: palette.card,
  primary: palette.accent,
  accent: palette.accent,
  accentOn: palette.accentOn,
  text: {
    primary: palette.text.primary,
    secondary: palette.text.secondary,
    muted: palette.text.muted,
  },
  muted: palette.text.muted,
  secondary: palette.text.secondary,
  border: palette.border,
  warning: palette.warning,
  error: palette.danger,
  danger: palette.danger,
  success: palette.success,
  info: palette.info,
  surface: palette.surface,
  surfaceAlt: palette.surfaceAlt,
  textMuted: palette.text.muted,
  onPrimary: palette.accentOn,
});

const colorCache: Record<ThemeName, SemanticColors> = {
  dark: buildSemanticColors(tokens.themePalettes.dark),
  light: buildSemanticColors(tokens.themePalettes.light),
};

export type ThemeColors = SemanticColors;

export const getColors = (theme: ThemeName): SemanticColors => colorCache[theme];

// Read current theme from store (fallback to dark before store initializes)
const getCurrentTheme = (): ThemeName => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { useStore } = require('../state/store');
    const pref = useStore.getState?.()?.themePreference as ThemeName | undefined;
    return pref || 'dark';
  } catch {
    return 'dark';
  }
};

export const getCurrentThemeName = (): ThemeName => getCurrentTheme();

// Colors object that switches in bulk for our top-level usages while keeping nested shapes stable
export const colors = {
  get bg() { return getColors(getCurrentTheme()).bg; },
  get bgElevated() { return getColors(getCurrentTheme()).bgElevated; },
  get bgSecondary() { return getColors(getCurrentTheme()).bgSecondary; },
  get background() { return getColors(getCurrentTheme()).background; },
  get card() { return getColors(getCurrentTheme()).card; },
  get primary() { return getColors(getCurrentTheme()).primary; },
  get accent() { return getColors(getCurrentTheme()).accent; },
  get accentOn() { return getColors(getCurrentTheme()).accentOn; },
  get text() { return getColors(getCurrentTheme()).text; },
  get muted() { return getColors(getCurrentTheme()).muted; },
  get border() { return getColors(getCurrentTheme()).border; },
  get secondary() { return getColors(getCurrentTheme()).secondary; },
  get warning() { return getColors(getCurrentTheme()).warning; },
  get error() { return getColors(getCurrentTheme()).error; },
  get danger() { return getColors(getCurrentTheme()).danger; },
  get success() { return getColors(getCurrentTheme()).success; },
  get info() { return getColors(getCurrentTheme()).info; },
  get surface() { return getColors(getCurrentTheme()).surface; },
  get surfaceAlt() { return getColors(getCurrentTheme()).surfaceAlt; },
  get textMuted() { return getColors(getCurrentTheme()).textMuted; },
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
      text: palette.text.primary,
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
