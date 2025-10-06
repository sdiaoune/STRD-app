/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { themePalettes } from '../tokens';

const buildExpoColors = (theme: 'light' | 'dark') => {
  const palette = themePalettes[theme];
  return {
    text: palette.text.primary,
    background: palette.bg.page,
    tint: palette.accent,
    icon: palette.text.secondary,
    tabIconDefault: palette.text.muted,
    tabIconSelected: palette.accent,
  } as const;
};

export const Colors = {
  light: buildExpoColors('light'),
  dark: buildExpoColors('dark'),
};
