import React from 'react';
import { Platform, Pressable, View, type ViewProps } from 'react-native';

import { borderRadius as radii, spacing, colors, shadows as themeShadows, surfaces } from '../theme';

interface Props extends ViewProps {
  onPress?: () => void;
  children: React.ReactNode;
  accessibilityHint?: string;
}

export const Card: React.FC<Props> = ({
  onPress,
  children,
  style,
  accessibilityHint = 'Open details',
  ...rest
}) => {
  const iosShadow = themeShadows.shadowMd.ios;
  const androidShadow = themeShadows.shadowMd.android;

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityHint={onPress ? accessibilityHint : undefined}
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        {
          backgroundColor: pressed ? colors.elevatedSurface : colors.surface,
          padding: spacing[4],
          borderRadius: radii.lg,
          borderWidth: 1,
          borderColor: colors.outline,
          minHeight: 64,
          overflow: 'hidden',
          ...(Platform.OS === 'ios'
            ? {
                shadowColor: colors.overlay,
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
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: surfaces.translucent,
        }}
      />
      {children}
    </Pressable>
  );
};
