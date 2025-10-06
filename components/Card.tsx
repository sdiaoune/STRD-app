import React from 'react';
import { Pressable, View, ViewProps, Platform } from 'react-native';
import { borderRadius as radii, spacing, colors } from '../theme';
import { shadows as themeShadows, surfaces } from '../theme';

interface Props extends ViewProps {
  onPress?: () => void;
  children: React.ReactNode;
  accessibilityHint?: string;
}

export const Card: React.FC<Props> = ({
  onPress,
  children,
  style,
  accessibilityHint = 'Open event details',
  ...rest
}) => {
  const iosShadow = themeShadows.shadowMd.ios;
  const androidShadow = themeShadows.shadowMd.android;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint={accessibilityHint}
      onPress={onPress}
      style={[
        {
          backgroundColor: colors.card,
          padding: spacing[4],
          borderRadius: radii.lg,
          borderWidth: 1,
          borderColor: colors.border,
          minHeight: 44,
          overflow: 'hidden',
          ...(Platform.OS === 'ios'
            ? {
                shadowColor: '#000',
                shadowOpacity: iosShadow.opacity,
                shadowRadius: iosShadow.radius,
                shadowOffset: { width: 0, height: iosShadow.y },
              }
            : { elevation: androidShadow.elevation }),
        },
        style,
      ]}
      {...rest}
    >
      {/* Subtle surface overlay for depth on dark theme */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: surfaces.surface1,
        }}
      />
      {children}
    </Pressable>
  );
};
