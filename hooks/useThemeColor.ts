/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { getColors, type ThemeColors } from '@/theme';

type ColorName =
  | keyof ThemeColors
  | `text.${keyof ThemeColors['text']}`
  | keyof typeof Colors.light;

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: ColorName
) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  }

  const themeColors = getColors(theme);

  if (colorName.startsWith('text.')) {
    const key = colorName.split('.')[1] as keyof ThemeColors['text'];
    return themeColors.text[key];
  }

  if (colorName in themeColors) {
    return (themeColors as Record<string, string>)[colorName as keyof ThemeColors];
  }

  return Colors[theme][colorName as keyof typeof Colors.light];
}
