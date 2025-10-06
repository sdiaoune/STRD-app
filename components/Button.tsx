import React, { useMemo, useState } from 'react';
import { Pressable, Text, PressableProps, View, ViewStyle, StyleProp } from 'react-native';
import { colors, spacing, typography, borderRadius as radii } from '../theme';
import { gradient } from '../theme';
import { LinearGradient } from 'expo-linear-gradient';

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
  const [pressed, setPressed] = useState(false);
  const height = Math.max(size === 'primary' ? 56 : 48, 48);
  const horizontalPadding = variant === 'icon' ? spacing[2] : spacing[4];

  const variantStyles = useMemo<ViewStyle>(() => {
    switch (variant) {
      case 'primary':
        return {
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
        return {} as ViewStyle;
    }
  }, [variant]);

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

  const baseContainerStyle = useMemo<StyleProp<ViewStyle>>(() => {
    const styles: StyleProp<ViewStyle>[] = [
      {
        height,
        paddingHorizontal: horizontalPadding,
        borderRadius: radii.lg,
        justifyContent: 'center',
        alignItems: 'center',
        opacity: disabled ? 0.48 : 1,
        overflow: 'hidden',
      } as ViewStyle,
      variantStyles,
    ];

    if (style) {
      styles.push(style as StyleProp<ViewStyle>);
    }

    return styles;
  }, [disabled, height, horizontalPadding, style, variantStyles]);

  if (variant === 'primary') {
    return (
      <Pressable
        disabled={disabled}
        accessibilityRole="button"
        hitSlop={12}
        style={baseContainerStyle}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        {...props}
      >
        {/* Outer subtle highlight */}
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: radii.lg,
            borderWidth: 1,
            borderColor: '#FFFFFF14',
          }}
        />
        {/* Gradient background */}
        <LinearGradient
          colors={gradient.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: radii.lg,
            opacity: disabled ? 0.7 : 1,
          }}
        />
        {/* Pressed overlay (darken ~5%) below text */}
        {pressed ? (
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.05)',
              borderRadius: radii.lg,
            }}
          />
        ) : null}
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
  }

  return (
    <Pressable
      style={baseContainerStyle}
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
