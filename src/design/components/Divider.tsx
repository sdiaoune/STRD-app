import React from "react";
import { StyleSheet, View, ViewProps } from "react-native";

import { useTheme } from "../useTheme";

type Props = ViewProps & {
  inset?: number;
};

export default function Divider({ inset = 0, style, ...rest }: Props) {
  const { colors } = useTheme();
  return (
    <View
      {...rest}
      accessibilityRole="separator"
      style={StyleSheet.flatten([
        styles.divider,
        { marginLeft: inset, backgroundColor: colors.border },
        style,
      ])}
    />
  );
}

const styles = StyleSheet.create({
  divider: {
    height: StyleSheet.hairlineWidth,
    width: "100%",
  },
});
