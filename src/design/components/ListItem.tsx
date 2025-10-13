import React from "react";
import { Pressable, PressableProps, StyleSheet, View, ViewProps } from "react-native";

import Text from "./Text";
import { useTheme } from "../useTheme";

type Density = "comfortable" | "compact";

type Props = Omit<PressableProps, "style"> & {
  title: string;
  subtitle?: string;
  density?: Density;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  disabled?: boolean;
  accessory?: React.ReactNode;
  containerProps?: ViewProps;
};

export default function ListItem({
  title,
  subtitle,
  density = "comfortable",
  leading,
  trailing,
  disabled,
  accessory,
  containerProps,
  style,
  ...rest
}: Props) {
  const { colors, spacing, radius } = useTheme();
  const paddingVertical = density === "compact" ? spacing.sm : spacing.md;
  const content = (
    <View
      {...containerProps}
      style={StyleSheet.flatten([
        styles.container,
        {
          backgroundColor: colors.bg,
          borderRadius: radius.md,
          paddingVertical,
          paddingHorizontal: spacing.lg,
        },
        containerProps?.style,
      ])}
    >
      {leading ? <View style={styles.leading}>{leading}</View> : null}
      <View style={styles.texts}>
        <Text emphasis="semiBold" numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" muted numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {accessory ? <View style={styles.accessory}>{accessory}</View> : null}
      {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
    </View>
  );

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      hitSlop={styles.hitSlop}
      style={({ pressed }) => [
        styles.pressable,
        style,
        disabled && { opacity: 0.4 },
        pressed && !disabled && { backgroundColor: colors.bgElevated },
      ]}
      {...rest}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    borderRadius: 14,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  texts: {
    flex: 1,
    gap: 2,
  },
  leading: {
    justifyContent: "center",
    alignItems: "center",
  },
  trailing: {
    marginLeft: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  accessory: {
    marginLeft: 12,
  },
  hitSlop: {
    top: 8,
    right: 8,
    bottom: 8,
    left: 8,
  },
});
