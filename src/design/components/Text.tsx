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
};

export default function Text({
  style,
  children,
  muted,
  emphasis = "regular",
  variant = "body",
  align = "auto",
  colorToken,
  ...rest
}: Props) {
  const { colors } = useTheme();
  const base = useMemo(() => getTextVariant(variant), [variant]);
  const color = colorToken ? colors[colorToken] : muted ? colors.textMuted : colors.text;
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
