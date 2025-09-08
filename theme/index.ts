// Backwards-compatible theme facade built on top of tokens
import * as tokens from '../tokens';

export const colors = {
  bg: tokens.colors.bg.page,
  card: tokens.colors.bg.elev1,
  primary: tokens.colors.accent,
  text: tokens.colors.text.primary,
  muted: tokens.colors.text.muted,
  border: tokens.colors.border,
  // Non-breaking: expose secondary for finer contrast tuning
  secondary: tokens.colors.text.secondary,
};

export const spacing = {
  // Numeric aliases for backwards compatibility with code using spacing[1..8]
  1: tokens.spacing[1],
  2: tokens.spacing[2],
  3: tokens.spacing[3],
  4: tokens.spacing[4],
  5: tokens.spacing[5],
  6: tokens.spacing[6],
  7: tokens.spacing[7],
  8: tokens.spacing[8],
  // Named scale
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
