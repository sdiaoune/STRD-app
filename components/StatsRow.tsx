import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, getCurrentThemeName } from '../theme';

interface StatItem {
  label: string;
  value: string | number;
}

interface StatsRowProps {
  stats: StatItem[];
  style?: any;
}

export const StatsRow: React.FC<StatsRowProps> = ({ stats, style }) => {
  const themedStyles = React.useMemo(() => createStyles(), [getCurrentThemeName()]);
  return (
    <View style={[themedStyles.container, style]}>
      {stats.map((stat, index) => (
        <View key={stat.label} style={[themedStyles.statItem, index < stats.length - 1 && themedStyles.statDivider]}>
          <Text style={themedStyles.value}>{stat.value}</Text>
          <Text style={themedStyles.label}>{stat.label}</Text>
        </View>
      ))}
    </View>
  );
};

const createStyles = () =>
  StyleSheet.create({
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
      color: colors.text.primary,
      marginBottom: spacing.xs,
    },
    label: {
      ...typography.caption,
      color: colors.muted,
      textAlign: 'center',
    },
  });

const styles = createStyles();
