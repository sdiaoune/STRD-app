import React, { useMemo } from "react";
import { StyleSheet, TextProps as RNTextProps } from "react-native";

import { getTextVariant } from "../typography";
import Text from "./Text";
import { useTheme } from "../useTheme";

type Level = "h1" | "h2" | "h3" | "h4";

type Props = RNTextProps & {
  level?: Level;
  align?: "auto" | "left" | "right" | "center" | "justify";
};

const variantMap: Record<Level, Parameters<typeof getTextVariant>[0]> = {
  h1: "display",
  h2: "headline",
  h3: "title",
  h4: "subheading",
};

export default function Heading({
  level = "h2",
  style,
  align = "auto",
  ...rest
}: Props) {
  const { spacing } = useTheme();
  const base = useMemo(() => getTextVariant(variantMap[level]), [level]);

  return (
    <Text
      {...rest}
      variant={variantMap[level]}
      emphasis="bold"
      align={align}
      style={StyleSheet.flatten([
        styles.heading,
        { marginBottom: spacing.sm, lineHeight: base.lineHeight },
        style,
      ])}
    />
  );
}

const styles = StyleSheet.create({
  heading: {
    marginTop: 0,
  },
});
