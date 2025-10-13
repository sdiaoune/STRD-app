import React from "react";
import { StyleSheet, View, ViewProps } from "react-native";

import Text from "./Text";
import { useTheme } from "../useTheme";

type Tone = "default" | "success" | "warning" | "danger";

type Props = ViewProps & {
  tone?: Tone;
  label: string;
  leading?: React.ReactNode;
};

export default function Badge({ tone = "default", label, leading, style, ...rest }: Props) {
  const { colors, spacing, radius } = useTheme();

  const backgroundColor =
    tone === "success"
      ? colors.success
      : tone === "warning"
      ? colors.warning
      : tone === "danger"
      ? colors.danger
      : colors.bgElevated;

  const textColor = tone === "default" ? colors.text : colors.primaryText;

  return (
    <View
      {...rest}
      style={StyleSheet.flatten([
        styles.badge,
        {
          backgroundColor,
          borderRadius: radius.sm,
          paddingHorizontal: spacing.sm,
          paddingVertical: spacing.xs,
        },
        style,
      ])}
    >
      {leading ? <View style={styles.leading}>{leading}</View> : null}
      <Text variant="caption" emphasis="semiBold" style={{ color: textColor }}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  leading: {
    marginRight: 4,
  },
});
