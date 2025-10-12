// Backwards-compatible theme facade with dynamic light/dark support
import * as tokens from '../tokens';

export type ThemeName = tokens.ThemeName;

type Palette = (typeof tokens.themePalettes)[ThemeName];

type SemanticColors = {
  background: string;
  surface: string;
  elevatedSurface: string;
  overlay: string;
  card: string;
  primary: string;
  secondary: string;
  accent: string;
  onPrimary: string;
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    muted: string;
  };
  muted: string;
  border: string;
  outline: string;
  focus: string;
  disabled: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  scrim: string;
  legacyBackground: {
    default: string;
    elevated: string;
    higher: string;
    page: string;
    elev1: string;
    elev2: string;
  };
};

const buildSemanticColors = (palette: Palette): SemanticColors => {
  const scheme = palette.semantic;

  return {
    background: scheme.background,
    surface: scheme.surface,
    elevatedSurface: scheme.elevatedSurface,
    overlay: scheme.overlay,
    card: scheme.surface,
    primary: scheme.primary,
    secondary: scheme.secondary,
    accent: scheme.accent,
    onPrimary: palette.accentOn,
    text: {
      primary: scheme.textPrimary,
      secondary: scheme.textSecondary,
      tertiary: scheme.textTertiary,
      muted: scheme.textTertiary,
    },
    muted: scheme.muted,
    border: scheme.border,
    outline: scheme.outline,
    focus: scheme.focus,
    disabled: scheme.disabled,
    success: scheme.success,
    warning: scheme.warning,
    danger: scheme.danger,
    info: scheme.info,
    scrim: scheme.overlay,
    legacyBackground: {
      default: palette.bg.page,
      elevated: palette.bg.elev1,
      higher: palette.bg.elev2,
      page: palette.bg.page,
      elev1: palette.bg.elev1,
      elev2: palette.bg.elev2,
    },
  };
};

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
  get background() { return getColors(getCurrentTheme()).background; },
  get surface() { return getColors(getCurrentTheme()).surface; },
  get elevatedSurface() { return getColors(getCurrentTheme()).elevatedSurface; },
  get overlay() { return getColors(getCurrentTheme()).overlay; },
  get card() { return getColors(getCurrentTheme()).card; },
  get primary() { return getColors(getCurrentTheme()).primary; },
  get secondary() { return getColors(getCurrentTheme()).secondary; },
  get accent() { return getColors(getCurrentTheme()).accent; },
  get onPrimary() { return getColors(getCurrentTheme()).onPrimary; },
  get text() { return getColors(getCurrentTheme()).text; },
  get muted() { return getColors(getCurrentTheme()).muted; },
  get border() { return getColors(getCurrentTheme()).border; },
  get outline() { return getColors(getCurrentTheme()).outline; },
  get focus() { return getColors(getCurrentTheme()).focus; },
  get disabled() { return getColors(getCurrentTheme()).disabled; },
  get warning() { return getColors(getCurrentTheme()).warning; },
  get danger() { return getColors(getCurrentTheme()).danger; },
  get success() { return getColors(getCurrentTheme()).success; },
  get info() { return getColors(getCurrentTheme()).info; },
  get scrim() { return getColors(getCurrentTheme()).scrim; },
  // Legacy getters retained
  get bg() { return getColors(getCurrentTheme()).legacyBackground.page; },
  get bgElevated() { return getColors(getCurrentTheme()).legacyBackground.elevated; },
  get bgSecondary() { return getColors(getCurrentTheme()).legacyBackground.higher; },
  get backgroundLayers() { return getColors(getCurrentTheme()).legacyBackground; },
  get surfaceAlt() { return getColors(getCurrentTheme()).elevatedSurface; },
  get textMuted() { return getColors(getCurrentTheme()).text.muted; },
  get accentOn() { return getColors(getCurrentTheme()).onPrimary; },
  get error() { return getColors(getCurrentTheme()).danger; },
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
  h2: tokens.typography.headline,
  h3: tokens.typography.title,
  body: tokens.typography.body,
  caption: tokens.typography.caption,
  small: { fontSize: 12, fontWeight: '400' as const },
};

// New re-exports (non-breaking additions)
export const shadows = tokens.nativeShadows;
export const surfaces = tokens.surfaces;
export const gradient = tokens.gradient;
export const opacity = tokens.opacity;
export const elevation = tokens.elevation;

// Helper to get React Navigation theme objects (dynamic)
export const getNavigationTheme = () => {
  const theme = getCurrentTheme();
  const palette = getColors(theme);
  return {
    dark: theme === 'dark',
    colors: {
      primary: palette.primary,
      background: palette.background,
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
