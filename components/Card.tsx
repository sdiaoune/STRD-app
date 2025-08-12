import React from 'react';
import { Pressable, ViewProps } from 'react-native';
import { radii, spacing, shadows, colors } from '../tokens';

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
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint={accessibilityHint}
      onPress={onPress}
      style={[
        {
          backgroundColor: colors.bg.elev1,
          padding: spacing[4],
          borderRadius: radii.lg,
          borderWidth: 1,
          borderColor: colors.border,
          minHeight: 44,
        },
        shadows.hairline,
        style,
      ]}
      {...rest}
    >
      {children}
    </Pressable>
  );
};
