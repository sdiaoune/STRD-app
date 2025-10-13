import React, { useMemo } from 'react';
import { Pressable, Text, type PressableProps, type ViewStyle, type StyleProp, View } from 'react-native';

import { colors, spacing, typography, borderRadius as radii, opacity, surfaces } from '../theme';

export interface ButtonProps extends PressableProps {
  variant?: 'primary' | 'outline' | 'ghost' | 'destructive' | 'icon';
  size?: 'primary' | 'secondary';
  children: React.ReactNode;
  disabled?: boolean;
}

const MIN_TOUCH_SIZE = 44;

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'primary',
  children,
  disabled = false,
  style,
  ...props
}) => {
  const sizePreset = useMemo(() => {
    if (variant === 'icon') {
      return { height: 48, paddingHorizontal: spacing[2], minWidth: 48 };
    }

    return size === 'secondary'
      ? { height: 48, paddingHorizontal: spacing[4], minWidth: MIN_TOUCH_SIZE }
      : { height: 56, paddingHorizontal: spacing[5], minWidth: MIN_TOUCH_SIZE };
  }, [size, variant]);

  const variantTokens = useMemo(() => {
    const disabledOpacity = disabled ? opacity.disabled : 1;

    switch (variant) {
      case 'primary':
        return {
          background: colors.primary,
          textColor: colors.onPrimary,
          borderColor: 'transparent',
          pressedBackground: colors.focus,
          disabledBackground: colors.primary,
          disabledOpacity,
          borderWidth: 0,
        };
      case 'outline':
        return {
          background: colors.surface,
          textColor: colors.text.primary,
          borderColor: colors.border,
          pressedBackground: colors.elevatedSurface,
          disabledBackground: colors.surface,
          disabledOpacity,
          borderWidth: 1,
        };
      case 'ghost':
        return {
          background: surfaces.subtle,
          textColor: colors.text.secondary,
          borderColor: 'transparent',
          pressedBackground: surfaces.strong,
          disabledBackground: surfaces.subtle,
          disabledOpacity,
          borderWidth: 0,
        };
      case 'destructive':
        return {
          background: colors.danger,
          textColor: colors.onPrimary,
          borderColor: 'transparent',
          pressedBackground: colors.danger,
          disabledBackground: colors.danger,
          disabledOpacity,
          borderWidth: 0,
        };
      case 'icon':
      default:
        return {
          background: 'transparent',
          textColor: colors.text.primary,
          borderColor: 'transparent',
          pressedBackground: colors.overlay,
          disabledBackground: 'transparent',
          disabledOpacity,
          borderWidth: 0,
        };
    }
  }, [disabled, variant]);

  const containerStyle: StyleProp<ViewStyle> = useMemo(
    () => [
      {
        minHeight: Math.max(sizePreset.height, MIN_TOUCH_SIZE),
        minWidth: sizePreset.minWidth,
        paddingHorizontal: sizePreset.paddingHorizontal,
        borderRadius: radii.lg,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        gap: spacing[2],
        overflow: 'hidden',
        borderWidth: variantTokens.borderWidth,
      } as ViewStyle,
      style,
    ],
    [sizePreset.height, sizePreset.minWidth, sizePreset.paddingHorizontal, style, variantTokens.borderWidth]
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      hitSlop={12}
      android_ripple={{ color: colors.focus, borderless: variant === 'icon' }}
      style={({ pressed }) => [
        containerStyle,
        {
          backgroundColor: pressed
            ? variantTokens.pressedBackground
            : disabled
            ? variantTokens.disabledBackground
            : variantTokens.background,
          borderColor: variantTokens.borderColor,
          opacity: pressed && !disabled ? opacity.pressed : variantTokens.disabledOpacity,
        },
      ]}
      {...props}
    >
      {variant === 'outline' ? (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: radii.lg,
            borderWidth: 1,
            borderColor: variantTokens.borderColor,
            opacity: 0.6,
          }}
        />
      ) : null}
      <Text
        style={[
          typography.body,
          {
            color: variantTokens.textColor,
            fontWeight: '600',
          },
        ]}
        maxFontSizeMultiplier={1.3}
      >
        {children}
      </Text>
    </Pressable>
  );
};
