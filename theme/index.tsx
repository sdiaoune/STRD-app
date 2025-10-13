import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme, Appearance } from 'react-native';

import * as palette from './colors';
import { typography } from './typography';
import { spacing } from './spacing';
import { radius } from './radius';
import { surfaces } from './surfaces';

export type ThemeMode = 'light' | 'dark';

// Dynamic colors proxy for back-compat usage outside hooks
let runtimeMode: ThemeMode | undefined;
function getCurrentMode(): ThemeMode {
  if (runtimeMode) return runtimeMode;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { useStore } = require('../state/store');
    const pref = useStore.getState?.()?.themePreference as 'light' | 'dark' | undefined;
    if (pref === 'light' || pref === 'dark') return pref;
  } catch {}
  return (Appearance.getColorScheme?.() === 'dark' ? 'dark' : 'light') as ThemeMode;
}

export const colors = new Proxy({} as any, {
  get(_target, prop: string) {
    const mode = getCurrentMode();
    const current = mode === 'dark' ? palette.dark : palette.light;
    if (prop === 'card') return current.surface;
    if (prop === 'bgElevated') return current.surface;
    if (prop === 'error') return (current as any).danger;
    if (prop === 'onError') return (current as any).onDanger ?? current.onPrimary;
    if (prop === 'muted') return current.text.muted;
    return (current as any)[prop];
  },
});

const ThemeContext = createContext<{ mode: ThemeMode } | undefined>(undefined);

export function ThemeProvider({ children, mode: forcedMode }: { children: React.ReactNode; mode?: ThemeMode }) {
  const scheme = useColorScheme();
  const mode: ThemeMode = forcedMode ?? (scheme === 'dark' ? 'dark' : 'light');
  const value = useMemo(() => ({ mode }), [mode]);
  runtimeMode = mode;
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  const c = ctx.mode === 'dark' ? palette.dark : palette.light;
  return {
    mode: ctx.mode,
    colors: c,
    typography,
    spacing,
    radius,
    surfaces,
  } as const;
}

// Back-compat exports used by existing components
export const borderRadius = { card: radius.card, modal: radius.modal, lg: radius.card, xl: radius.modal } as const;
export const getCurrentThemeName = () => (useColorScheme() === 'dark' ? 'dark' : 'light');

export function getNavigationTheme(mode: ThemeMode) {
  const c = mode === 'dark' ? palette.dark : palette.light;
  return {
    dark: mode === 'dark',
    colors: {
      primary: c.primary,
      background: c.bg,
      card: c.surface,
      text: c.text.primary,
      border: c.border,
      notification: c.primary,
    },
    fonts: {
      regular: { fontFamily: 'System', fontWeight: '400' as const },
      medium: { fontFamily: 'System', fontWeight: '500' as const },
      bold: { fontFamily: 'System', fontWeight: '700' as const },
      heavy: { fontFamily: 'System', fontWeight: '900' as const },
    },
  } as const;
}

export const sharedStyles = {
  containerPadding: { paddingHorizontal: spacing.container },
} as const;

export const opacity = { hover: 0.92, pressed: 0.8, disabled: 0.48 } as const;

export { typography, spacing, radius, surfaces };

