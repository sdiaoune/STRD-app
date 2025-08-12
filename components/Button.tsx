import React from 'react';
import { Pressable, Text, PressableProps } from 'react-native';
import { colors, spacing, radii, typography } from '../tokens';

export interface ButtonProps extends PressableProps {
  variant?: 'primary' | 'outline' | 'ghost' | 'destructive' | 'icon';
  size?: 'primary' | 'secondary';
  children: React.ReactNode;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'primary',
  children,
  disabled = false,
  style,
  ...props
}) => {
  const height = Math.max(size === 'primary' ? 56 : 48, 48);
  const horizontalPadding = variant === 'icon' ? spacing[2] : spacing[4];

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: colors.accent,
          borderWidth: 0,
          borderColor: 'transparent',
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: colors.border,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          borderWidth: 0,
          borderColor: 'transparent',
        };
      case 'destructive':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: colors.danger,
        };
      case 'icon':
        return {
          backgroundColor: 'transparent',
          borderWidth: 0,
          borderColor: 'transparent',
        };
      default:
        return {};
    }
  };

  const getTextColor = () => {
    if (disabled) return colors.text.muted;
    
    switch (variant) {
      case 'primary':
        return colors.accentOn;
      case 'outline':
      case 'ghost':
        return colors.text.primary;
      case 'destructive':
        return colors.danger;
      case 'icon':
        return colors.text.primary;
      default:
        return colors.text.primary;
    }
  };

  return (
    <Pressable
      style={[
        {
          height,
          paddingHorizontal: horizontalPadding,
          borderRadius: radii.lg,
          justifyContent: 'center',
          alignItems: 'center',
          opacity: disabled ? 0.48 : 1,
          ...getVariantStyles(),
        },
        style,
      ]}
      disabled={disabled}
      accessibilityRole="button"
      hitSlop={12}
      {...props}
    >
      <Text
        style={[
          typography.body,
          {
            color: getTextColor(),
            fontWeight: '600',
          },
        ]}
      >
        {children}
      </Text>
    </Pressable>
  );
};
