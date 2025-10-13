export const light = {
  primary: '#2D5BFF',
  onPrimary: '#FFFFFF',
  danger: '#EF4444',
  onDanger: '#FFFFFF',
  bg: '#F6F8FB',
  surface: '#FFFFFF',
  surfaceMuted: '#F2F4F8',
  border: '#E6EAF0',
  text: { primary: '#0B1220', secondary: '#475569', muted: '#94A3B8' },
  icon: { primary: '#0B1220', secondary: '#475569', muted: '#9CA3AF' },
  scrim: 'rgba(0,0,0,0.5)',
} as const;

export const dark = {
  primary: '#5B86FF',
  onPrimary: '#0A0F1A',
  danger: '#FF6B6B',
  onDanger: '#0A0F1A',
  bg: '#0B0F17',
  surface: '#111827',
  surfaceMuted: '#0F1623',
  border: '#1F2937',
  text: { primary: '#E6EAF2', secondary: '#B8C0CC', muted: '#7A8699' },
  icon: { primary: '#E6EAF2', secondary: '#B8C0CC', muted: '#718096' },
  scrim: 'rgba(0,0,0,0.7)',
} as const;

export type ColorTheme = typeof light;

