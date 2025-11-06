const lightBase = {
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

const darkBase = {
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

type AccentName = 'blue' | 'teal' | 'violet' | 'pink' | 'orange' | 'green';

const accentPalette: Record<AccentName, { light: string; dark: string }> = {
  blue:   { light: '#2D5BFF', dark: '#5B86FF' },
  teal:   { light: '#14B8A6', dark: '#2DD4BF' },
  violet: { light: '#7C3AED', dark: '#A78BFA' },
  pink:   { light: '#EC4899', dark: '#F472B6' },
  orange: { light: '#F97316', dark: '#FB923C' },
  green:  { light: '#16A34A', dark: '#22C55E' },
};

function getAccent(): string {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { useStore } = require('../state/store');
    const pref = useStore.getState?.()?.accentPreference as string | undefined;
    return pref || 'blue';
  } catch {
    return 'blue';
  }
}

export const light = new Proxy(lightBase, {
  get(target, prop: keyof typeof lightBase) {
    if (prop === 'primary') {
      const accent = getAccent();
      if (typeof accent === 'string' && /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/.test(accent)) {
        return accent;
      }
      const named = (accent as AccentName) in accentPalette ? (accent as AccentName) : 'blue';
      return accentPalette[named].light;
    }
    return (target as any)[prop];
  },
});

export const dark = new Proxy(darkBase, {
  get(target, prop: keyof typeof darkBase) {
    if (prop === 'primary') {
      const accent = getAccent();
      if (typeof accent === 'string' && /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/.test(accent)) {
        return accent;
      }
      const named = (accent as AccentName) in accentPalette ? (accent as AccentName) : 'blue';
      return accentPalette[named].dark;
    }
    return (target as any)[prop];
  },
});

export type ColorTheme = typeof lightBase;

