export const spacing = {
  // Scale
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  // Aliases
  x0: 0,
  x1: 4,
  x2: 8,
  x3: 12,
  x4: 16,
  x5: 20,
  x6: 24,
  x7: 28,
  x8: 32,
  // Roles
  container: 16,
  gapSm: 8,
  gapMd: 12,
  gapLg: 16,
  // Legacy names
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export type Spacing = typeof spacing;

