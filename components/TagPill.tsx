import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../theme';

interface TagPillProps {
  tag: string;
  style?: any;
}

export const TagPill: React.FC<TagPillProps> = ({ tag, style }) => {
  return (
    <View style={[{
      backgroundColor: colors.primary + '20',
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.primary + '40',
    }, style]}>
      <Text style={[typography.small, { color: colors.primary, fontWeight: '600' }]}>{tag}</Text>
    </View>
  );
};
