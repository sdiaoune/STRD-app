import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../theme';

interface TagPillProps {
  tag: string;
  style?: any;
}

export const TagPill: React.FC<TagPillProps> = ({ tag, style }) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.text}>{tag}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary + '40',
  },
  text: {
    ...typography.small,
    color: colors.primary,
    fontWeight: '600',
  },
});
