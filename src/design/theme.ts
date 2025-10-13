import { ColorSchemeName, Platform } from "react-native";

export type ColorToken =
  | "bg"
  | "bgElevated"
  | "text"
  | "textMuted"
  | "primary"
  | "primaryText"
  | "border"
  | "outline"
  | "success"
  | "warning"
  | "danger";

export type ThemeSpacing = {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  "2xl": number;
};

export type ThemeRadius = {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
};

export type ThemeShadow = {
  sm: number;
  md: number;
  lg: number;
};

export type Theme = {
  colors: Record<ColorToken, string>;
  radius: ThemeRadius;
  spacing: ThemeSpacing;
  shadow: ThemeShadow;
};

export const light: Theme = {
  colors: {
    bg: "#FFFFFF",
    bgElevated: "#F7F7F9",
    text: "#0F172A",
    textMuted: "rgba(15,23,42,0.7)",
    primary: "#4F46E5",
    primaryText: "#FFFFFF",
    border: "#E5E7EB",
    outline: "#CBD5E1",
    success: "#16A34A",
    warning: "#D97706",
    danger: "#DC2626",
  },
  radius: { xs: 6, sm: 10, md: 14, lg: 20, xl: 28 },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, "2xl": 32 },
  shadow: { sm: 2, md: 4, lg: 8 },
};

export const dark: Theme = {
  ...light,
  colors: {
    bg: "#0B0F1A",
    bgElevated: "#141A2B",
    text: "#E5E7EB",
    textMuted: "rgba(229,231,235,0.72)",
    primary: "#6366F1",
    primaryText: "#0B0F1A",
    border: "rgba(148,163,184,0.24)",
    outline: "rgba(148,163,184,0.35)",
    success: "#22C55E",
    warning: "#F59E0B",
    danger: "#F87171",
  },
};

export type ThemeName = "light" | "dark";

export const themes: Record<ThemeName, Theme> = {
  light,
  dark,
};

export const getThemeFromScheme = (
  scheme: ColorSchemeName | undefined | null,
): ThemeName => {
  if (scheme === "dark") {
    return "dark";
  }
  return "light";
};

export type Elevation = keyof ThemeShadow;

export const getElevationStyle = (
  theme: Theme,
  level: Elevation,
): {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
} => {
  const height = level === "sm" ? 1 : level === "md" ? 3 : 6;
  const radius = theme.shadow[level];
  const opacity = level === "sm" ? 0.12 : level === "md" ? 0.16 : 0.2;

  return {
    shadowColor: "#000",
    shadowOffset: { width: 0, height },
    shadowOpacity: Platform.OS === "ios" ? opacity : 0,
    shadowRadius: Platform.OS === "ios" ? radius : 0,
    elevation: theme.shadow[level],
  };
};
