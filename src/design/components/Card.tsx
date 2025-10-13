import React from "react";
import { Pressable, PressableProps, StyleSheet, View, ViewProps } from "react-native";

import { Elevation, getElevationStyle } from "../theme";
import { useTheme } from "../useTheme";

type Props = ViewProps & {
  elevation?: Elevation;
  padding?: keyof ReturnType<typeof useTheme>["spacing"];
  interactive?: boolean;
  onPress?: PressableProps["onPress"];
  children: React.ReactNode;
  accessibilityHint?: string;
};

export default function Card({
  elevation = "md",
  padding = "lg",
  interactive = false,
  onPress,
  style,
  children,
  accessibilityHint,
  ...rest
}: Props) {
  const theme = useTheme();
  const content = (
    <View
      {...rest}
      style={StyleSheet.flatten([
        styles.card,
        getElevationStyle(theme, elevation),
        {
          backgroundColor: theme.colors.bgElevated,
          borderRadius: theme.radius.lg,
          padding: theme.spacing[padding],
          borderColor: theme.colors.border,
          borderWidth: StyleSheet.hairlineWidth,
        },
        style,
      ])}
    >
      {children}
    </View>
  );

  if (interactive) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityHint={accessibilityHint}
        hitSlop={styles.hitSlop}
        onPress={onPress}
        style={({ pressed }) => [
          styles.pressable,
          { transform: pressed ? [{ scale: 0.99 }] : undefined },
        ]}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
  },
  pressable: {
    width: "100%",
  },
  hitSlop: {
    top: 8,
    right: 8,
    bottom: 8,
    left: 8,
  },
});
