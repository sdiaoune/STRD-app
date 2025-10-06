import React from 'react';
import { View, Text } from 'react-native';
import { colors, spacing, typography } from '../theme';

export const OfflineBanner: React.FC = () => {
  return (
    <View
      style={{
        backgroundColor: colors.warning + '20',
        borderColor: colors.warning,
        borderWidth: 1,
        padding: spacing[3],
        borderRadius: 12,
      }}
    >
      <Text style={[typography.body, { color: colors.text.primary }]}>You&apos;re offline</Text>
      <Text style={[typography.caption, { color: colors.text.muted }]}>We&apos;ll retry when you&apos;re back online.</Text>
    </View>
  );
};
