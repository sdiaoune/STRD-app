import React from "react";
import { Pressable, PressableProps, StyleSheet, View } from "react-native";

import { useTheme } from "../useTheme";

type Variant = "filled" | "outline" | "ghost";

type Props = Omit<PressableProps, "style"> & {
  icon: React.ReactNode;
  accessibilityLabel: string;
  variant?: Variant;
  size?: "sm" | "md" | "lg";
};

export default function IconButton({
  icon,
  variant = "ghost",
  size = "md",
  disabled,
  ...rest
}: Props) {
  const { colors, radius, spacing } = useTheme();
  const dimension = size === "sm" ? 36 : size === "lg" ? 52 : 44;
  const padding = size === "sm" ? spacing.xs : size === "lg" ? spacing.md : spacing.sm;

  const borderColor = variant === "outline" ? colors.outline : "transparent";
  const backgroundColor = variant === "filled" ? colors.primary : "transparent";

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      hitSlop={styles.hitSlop}
      style={({ pressed, focused }) => [
        styles.base,
        {
          width: dimension,
          height: dimension,
          borderRadius: radius.md,
          borderColor,
          backgroundColor,
          borderWidth: variant === "outline" ? StyleSheet.hairlineWidth : 0,
          opacity: disabled ? 0.4 : 1,
          padding,
        },
        focused && { borderColor: colors.outline, borderWidth: 2 },
        pressed && !disabled && { opacity: 0.85, transform: [{ scale: 0.96 }] },
      ]}
      {...rest}
    >
      <View style={styles.icon}>{icon}</View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    alignItems: "center",
    justifyContent: "center",
  },
  hitSlop: {
    top: 8,
    right: 8,
    bottom: 8,
    left: 8,
  },
});
