import React from "react";
import {
  ActivityIndicator,
  GestureResponderEvent,
  Pressable,
  PressableProps,
  StyleSheet,
  View,
} from "react-native";

import Text from "./Text";
import { useTheme } from "../useTheme";

type Variant = "solid" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";
type Tone = "default" | "danger" | "success";

type Props = Omit<PressableProps, "style"> & {
  title?: string;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  children?: React.ReactNode;
  tone?: Tone;
};

export default function Button({
  title,
  variant = "solid",
  size = "md",
  disabled = false,
  loading = false,
  leadingIcon,
  trailingIcon,
  onPress,
  children,
  tone = "default",
  ...rest
}: Props) {
  const { colors, spacing, radius } = useTheme();
  const buttonTitle = title ?? (typeof children === "string" ? children : "");
  const isDisabled = disabled || loading;
  const paddingVertical = size === "sm" ? spacing.sm : size === "lg" ? spacing.lg : spacing.md;
  const paddingHorizontal = size === "sm" ? spacing.lg : size === "lg" ? spacing["2xl"] : spacing.xl;

  const solidColor =
    tone === "danger"
      ? colors.danger
      : tone === "success"
      ? colors.success
      : colors.primary;

  const backgroundColor =
    variant === "solid"
      ? solidColor
      : variant === "outline"
      ? "transparent"
      : "transparent";

  const borderColor =
    variant === "outline"
      ? tone === "danger"
        ? colors.danger
        : tone === "success"
        ? colors.success
        : colors.outline
      : "transparent";
  const textColor =
    variant === "solid"
      ? colors.primaryText
      : tone === "danger"
      ? colors.danger
      : tone === "success"
      ? colors.success
      : colors.text;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      hitSlop={styles.hitSlop}
      onPress={onPress}
      style={({ pressed, focused }) => [
        styles.base,
        {
          backgroundColor,
          borderColor,
          borderWidth: variant === "outline" ? StyleSheet.hairlineWidth : 0,
          opacity: isDisabled ? 0.48 : 1,
          paddingHorizontal,
          paddingVertical,
          borderRadius: radius.lg,
        },
        focused && {
          borderColor: colors.primary,
          borderWidth: 2,
        },
        pressed && !isDisabled && {
          transform: [{ scale: 0.98 }],
          backgroundColor:
            variant === "solid"
              ? solidColor
              : variant === "outline"
              ? colors.bgElevated
              : colors.bgElevated,
        },
      ]}
      {...rest}
    >
      <View style={styles.content}>
        {leadingIcon ? <View style={styles.icon}>{leadingIcon}</View> : null}
        {loading ? (
          <ActivityIndicator color={textColor} size="small" />
        ) : children && typeof children !== "string" ? (
          children
        ) : (
          <Text emphasis="semiBold" variant={size === "lg" ? "bodyLarge" : "body"} style={{ color: textColor }}>
            {buttonTitle}
          </Text>
        )}
        {trailingIcon ? <View style={styles.icon}>{trailingIcon}</View> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
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
