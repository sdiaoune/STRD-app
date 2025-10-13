import { PixelRatio } from "react-native";

type Weight = "400" | "600" | "700";

type TypographyVariant = {
  fontSize: number;
  lineHeight: number;
  fontWeight: Weight;
  letterSpacing?: number;
};

const baseFontScale = PixelRatio.getFontScale();

const scale = (size: number) => {
  const scaled = size * baseFontScale;
  return Math.max(Math.round(scaled), 12);
};

const sizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  "2xl": 24,
  "3xl": 28,
  "4xl": 34,
} as const;

const lineHeight = (size: number) => Math.round(size * 1.35);

export const variants: Record<
  "caption" | "body" | "bodyLarge" | "subheading" | "title" | "headline" | "display",
  TypographyVariant
> = {
  caption: { fontSize: scale(sizes.xs), lineHeight: lineHeight(sizes.xs), fontWeight: "400" },
  body: { fontSize: scale(sizes.md), lineHeight: lineHeight(sizes.md), fontWeight: "400" },
  bodyLarge: { fontSize: scale(sizes.lg), lineHeight: lineHeight(sizes.lg), fontWeight: "400" },
  subheading: { fontSize: scale(sizes.xl), lineHeight: lineHeight(sizes.xl), fontWeight: "600" },
  title: { fontSize: scale(sizes["2xl"]), lineHeight: lineHeight(sizes["2xl"]), fontWeight: "600" },
  headline: { fontSize: scale(sizes["3xl"]), lineHeight: lineHeight(sizes["3xl"]), fontWeight: "700" },
  display: { fontSize: scale(sizes["4xl"]), lineHeight: lineHeight(sizes["4xl"]), fontWeight: "700" },
};

export const weights = {
  regular: "400" as Weight,
  semiBold: "600" as Weight,
  bold: "700" as Weight,
};

export type TextVariant = keyof typeof variants;

export const getTextVariant = (variant: TextVariant): TypographyVariant => variants[variant];

export const getFontSize = (variant: TextVariant) => variants[variant].fontSize;
