import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, spacing, getCurrentThemeName } from '../theme';
import Stat from './ui/Stat';

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
      {stats.map((stat) => (
        <Stat key={stat.label} value={String(stat.value)} label={stat.label} />
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
    statItem: {},
  });

const styles = createStyles();
