import React from 'react';
import { Pressable, Text, ViewStyle, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../theme';

type Variant = 'primary' | 'secondary' | 'tertiary' | 'destructive';

export type ButtonProps = {
  variant?: Variant;
  title: string;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  iconLeft?: keyof typeof Ionicons.glyphMap;
  accessibilityLabel?: string;
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  title,
  onPress,
  disabled,
  style,
  iconLeft,
  accessibilityLabel,
}) => {
  const { colors, spacing, radius, typography, mode } = useTheme();

  const styles = StyleSheet.create({
    base: {
      height: 52,
      borderRadius: radius.control,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.x4,
      flexDirection: 'row',
      minWidth: 44,
    },
    primary: {
      backgroundColor: colors.primary,
    },
    secondary: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.border,
    },
    tertiary: {
      backgroundColor: colors.surfaceMuted,
      borderWidth: 1,
      borderColor: colors.border,
    },
    destructive: {
      backgroundColor: colors.danger,
    },
    label: {
      fontSize: typography.body.fontSize,
      lineHeight: typography.body.lineHeight,
      fontWeight: '600',
      color: variant === 'primary' ? colors.onPrimary : variant === 'destructive' ? colors.onDanger : colors.text.primary,
    },
    icon: {
      marginRight: iconLeft ? spacing.x2 : 0,
    },
  });

  const containerStyle = [
    styles.base,
    variant === 'primary' && styles.primary,
    variant === 'secondary' && styles.secondary,
    variant === 'tertiary' && styles.tertiary,
    variant === 'destructive' && styles.destructive,
    disabled && { opacity: 0.6 },
    style,
  ];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [containerStyle, pressed && { opacity: 0.9 }]}
      hitSlop={12}
    >
      {iconLeft ? (
        <Ionicons
          name={iconLeft}
          size={20}
          color={variant === 'primary' ? colors.onPrimary : colors.text.primary}
          style={styles.icon}
        />
      ) : null}
      <Text style={styles.label}>{title}</Text>
    </Pressable>
  );
};

export default Button;

