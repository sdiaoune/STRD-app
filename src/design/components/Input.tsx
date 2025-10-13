import React, { useState } from "react";
import {
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
  ViewProps,
} from "react-native";

import Text from "./Text";
import { useTheme } from "../useTheme";

type Props = TextInputProps & {
  label?: string;
  helperText?: string;
  errorText?: string;
  leftAdornment?: React.ReactNode;
  rightAdornment?: React.ReactNode;
  containerProps?: ViewProps;
};

export default function Input({
  label,
  helperText,
  errorText,
  leftAdornment,
  rightAdornment,
  containerProps,
  style,
  editable = true,
  ...rest
}: Props) {
  const { colors, radius, spacing } = useTheme();
  const [focused, setFocused] = useState(false);
  const hasError = Boolean(errorText);

  const borderColor = hasError
    ? colors.danger
    : focused
    ? colors.primary
    : colors.outline;

  return (
    <View {...containerProps} style={StyleSheet.flatten([styles.wrapper, containerProps?.style])}>
      {label ? (
        <Text
          accessibilityRole="text"
          variant="body"
          emphasis="semiBold"
          style={{ marginBottom: spacing.xs }}
        >
          {label}
        </Text>
      ) : null}
      <View
        style={StyleSheet.flatten([
          styles.inputContainer,
          {
            borderColor,
            backgroundColor: editable ? colors.bgElevated : colors.bg,
            borderRadius: radius.md,
            opacity: editable ? 1 : 0.6,
            paddingHorizontal: spacing.md,
            minHeight: 48,
          },
        ])}
      >
        {leftAdornment ? <View style={styles.icon}>{leftAdornment}</View> : null}
        <TextInput
          {...rest}
          editable={editable}
          style={StyleSheet.flatten([
            styles.input,
            {
              color: colors.text,
              textAlignVertical: rest.multiline ? "top" : "center",
            },
            style,
          ])}
          placeholderTextColor={colors.textMuted}
          onFocus={(event) => {
            setFocused(true);
            rest.onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            rest.onBlur?.(event);
          }}
        />
        {rightAdornment ? <View style={styles.icon}>{rightAdornment}</View> : null}
      </View>
      {hasError ? (
        <Text
          variant="caption"
          colorToken="danger"
          style={{ marginTop: spacing.xs }}
        >
          {errorText}
        </Text>
      ) : helperText ? (
        <Text variant="caption" muted style={{ marginTop: spacing.xs }}>
          {helperText}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    paddingVertical: 12,
  },
  icon: {
    marginHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
  },
});
