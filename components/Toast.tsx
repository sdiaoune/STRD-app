import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, typography, opacity, useTheme } from '../theme';

interface Props {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  onDismiss?: () => void;
  duration?: number;
  position?: 'top' | 'bottom';
  size?: 'normal' | 'large';
}

const typeStyles = {
  success: { icon: 'checkmark-circle' as const, color: colors.success },
  error: { icon: 'close-circle' as const, color: colors.danger },
  warning: { icon: 'warning' as const, color: colors.warning },
  info: { icon: 'information-circle' as const, color: colors.info },
};

export const Toast: React.FC<Props> = ({
  message,
  type = 'info',
  onDismiss,
  duration = 3500,
  position = 'bottom',
  size = 'normal',
}) => {
  const theme = useTheme();
  const translateY = useRef(new Animated.Value(position === 'top' ? -100 : 100)).current;
  const alpha = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 260,
        useNativeDriver: true,
      }),
      Animated.timing(alpha, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: position === 'top' ? -100 : 100,
          duration: 260,
          useNativeDriver: true,
        }),
        Animated.timing(alpha, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onDismiss?.();
      });
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onDismiss, position, alpha, translateY]);

  const palette = typeStyles[type];

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity: alpha,
          top: position === 'top' ? spacing[8] : undefined,
          bottom: position === 'bottom' ? spacing[8] : undefined,
          borderLeftColor: palette.color,
          // Light mode: solid white with subtle border; Dark mode: elevated dark surface
          backgroundColor: theme.mode === 'light' ? '#FFFFFF' : colors.surface,
          borderColor: theme.mode === 'light' ? '#E6EAF0' : colors.border,
          // Keep light mode fully opaque to avoid appearing gray over white screens
          ...(theme.mode === 'light' ? { opacity: 1 } : {}),
        },
      ]}
      accessibilityRole="alert"
    >
      <View style={[styles.content, size === 'large' && styles.contentLarge]}>
        <Ionicons name={palette.icon} size={22} color={palette.color} />
        <Text
          style={[styles.text, size === 'large' && styles.textLarge, { color: colors.text.primary }]}
        >
          {message}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: spacing[4],
    right: spacing[4],
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
    shadowColor: colors.overlay,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
    opacity: opacity.hover,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    gap: spacing[2],
  },
  contentLarge: {
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
    borderRadius: 18,
  },
  text: {
    ...typography.body,
    marginLeft: spacing[1],
    flex: 1,
  },
  textLarge: {
    fontSize: typography.h3.fontSize,
    lineHeight: typography.h3.lineHeight,
  },
});

