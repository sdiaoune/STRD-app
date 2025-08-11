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
      className="bg-surface"
      style={[
        { padding: spacing[4], borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border },
        shadows.md,
        style,
      ]}
      {...rest}
    >
      {children}
    </Pressable>
  );
};
