import React from "react";
import { StyleSheet, View, ViewProps } from "react-native";

import { Elevation, getElevationStyle } from "../theme";
import { useTheme } from "../useTheme";

type Props = ViewProps & {
  elevation?: Elevation | "none";
  padding?: keyof ReturnType<typeof useTheme>["spacing"] | "none";
};

export default function Surface({
  elevation = "none",
  padding = "none",
  style,
  ...rest
}: Props) {
  const theme = useTheme();
  const paddingValue = padding === "none" ? 0 : theme.spacing[padding];
  const elevationStyle = elevation === "none" ? undefined : getElevationStyle(theme, elevation);

  return (
    <View
      {...rest}
      style={StyleSheet.flatten([
        styles.surface,
        {
          backgroundColor: theme.colors.bg,
          borderRadius: theme.radius.md,
          padding: paddingValue,
        },
        elevationStyle,
        style,
      ])}
    />
  );
}

const styles = StyleSheet.create({
  surface: {
    width: "100%",
  },
});
