import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../theme';

interface StatItem {
  label: string;
  value: string | number;
}

interface StatsRowProps {
  stats: StatItem[];
  style?: any;
}

export const StatsRow: React.FC<StatsRowProps> = ({ stats, style }) => {
  return (
    <View style={[styles.container, style]}>
      {stats.map((stat, index) => (
        <View key={stat.label} style={[styles.statItem, index < stats.length - 1 && styles.statDivider]}>
          <Text style={styles.value}>{stat.value}</Text>
          <Text style={styles.label}>{stat.label}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  value: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  label: {
    ...typography.caption,
    color: colors.muted,
    textAlign: 'center',
  },
});
