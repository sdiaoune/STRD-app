export type FontWeight = '500' | '600' | '700';

export type TypeStyle = {
  fontSize: number;
  lineHeight: number;
  fontWeight: FontWeight;
};

// Roles per spec
export const typography = {
  display: { fontSize: 32, lineHeight: 38, fontWeight: '700' as const },
  h2: { fontSize: 20, lineHeight: 24, fontWeight: '700' as const },
  stat: { fontSize: 24, lineHeight: 28, fontWeight: '700' as const },
  body: { fontSize: 16, lineHeight: 22, fontWeight: '500' as const },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '500' as const },
  overline: { fontSize: 11, lineHeight: 14, fontWeight: '600' as const },
  // Legacy aliases for backward compatibility
  h1: { fontSize: 32, lineHeight: 38, fontWeight: '700' as const }, // maps to display
  h3: { fontSize: 20, lineHeight: 24, fontWeight: '700' as const }, // maps to h2
  small: { fontSize: 12, lineHeight: 16, fontWeight: '500' as const },
} as const;

export type Typography = typeof typography;

