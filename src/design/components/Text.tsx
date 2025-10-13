import React, { useMemo } from "react";
import { StyleSheet, Text as RNText, TextProps as RNTextProps } from "react-native";

import { getTextVariant, weights, TextVariant } from "../typography";
import { ColorToken } from "../theme";
import { useTheme } from "../useTheme";

type Emphasis = "regular" | "semiBold" | "bold";

type Props = RNTextProps & {
  variant?: TextVariant;
  muted?: boolean;
  emphasis?: Emphasis;
  align?: "auto" | "left" | "right" | "center" | "justify";
  colorToken?: ColorToken;
  tone?: "primary" | "secondary" | "tertiary" | "muted" | "danger" | "success" | "warning" | "info";
};

export default function Text({
  style,
  children,
  muted,
  emphasis = "regular",
  variant = "body",
  align = "auto",
  colorToken,
  tone,
  ...rest
}: Props) {
  const { colors } = useTheme();
  const base = useMemo(() => getTextVariant(variant), [variant]);
  const mappedTone = tone
    ? tone === "primary"
      ? colors.text.primary
      : tone === "secondary"
      ? colors.text.secondary
      : tone === "tertiary"
      ? colors.text.tertiary
      : tone === "danger"
      ? colors.danger
      : tone === "success"
      ? colors.success
      : tone === "warning"
      ? colors.warning
      : tone === "info"
      ? colors.info
      : colors.text.muted
    : undefined;
  const color = colorToken
    ? colors[colorToken]
    : mappedTone ?? (muted ? colors.text.muted : colors.text.primary);
  const fontWeight =
    emphasis === "bold"
      ? weights.bold
      : emphasis === "semiBold"
      ? weights.semiBold
      : weights.regular;

  return (
    <RNText
      {...rest}
      style={StyleSheet.flatten([
        {
          color,
          textAlign: align,
          fontSize: base.fontSize,
          lineHeight: base.lineHeight,
          fontWeight,
        },
        style,
      ])}
    >
      {children}
    </RNText>
  );
}
