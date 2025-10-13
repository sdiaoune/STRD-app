import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, typography, getCurrentThemeName } from '../theme';
import Button from './Button';

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
  style?: any;
  actionLabel?: string;
  onActionPress?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  message,
  style,
  actionLabel,
  onActionPress,
}) => {
  const themed = React.useMemo(() => stylesFactory(), [getCurrentThemeName()]);
  return (
    <View style={[themed.container, style]}>
      <View style={themed.iconWrapper}>
        <Ionicons name={icon} size={36} color={colors.primary} />
      </View>
      <Text style={themed.title}>{title}</Text>
      <Text style={themed.message}>{message}</Text>
      {actionLabel && onActionPress ? (
        <Button onPress={onActionPress} style={{ marginTop: spacing.md }}>
          {actionLabel}
        </Button>
      ) : null}
    </View>
  );
};

const stylesFactory = () => StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  iconWrapper: {
    padding: spacing[3],
    borderRadius: spacing.lg,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    fontSize: typography.h2.fontSize,
    lineHeight: typography.h2.lineHeight,
    fontWeight: typography.h2.fontWeight,
    color: colors.text.primary,
    textAlign: 'center',
  },
  message: {
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
    color: colors.text.secondary,
    textAlign: 'center',
    maxWidth: 280,
  },
});
