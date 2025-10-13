import { light, dark } from './colors';

export const surfaces = {
  surface(theme: 'light' | 'dark') {
    const c = theme === 'dark' ? dark : light;
    return {
      backgroundColor: c.surface,
      borderColor: c.border,
      borderWidth: 1,
      // Light shadow per spec; dark uses muted surface instead
      ...(theme === 'light'
        ? { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 2 }
        : {}),
    } as const;
  },
  elevated(theme: 'light' | 'dark') {
    const c = theme === 'dark' ? dark : light;
    return {
      backgroundColor: theme === 'dark' ? c.surfaceMuted : c.surface,
      ...(theme === 'light'
        ? { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12 }
        : {}),
    } as const;
  },
} as const;

export type Surfaces = typeof surfaces;

