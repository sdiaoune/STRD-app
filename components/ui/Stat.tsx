import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../theme';

type Props = { icon?: keyof typeof Ionicons.glyphMap; value: string; label: string };

export const Stat: React.FC<Props> = ({ icon, value, label }) => {
  const { colors, typography, spacing } = useTheme();
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', minWidth: 80, paddingHorizontal: spacing.x2 }}>
      {icon ? <Ionicons name={icon} size={20} color={colors.icon.primary} /> : null}
      <Text style={{ fontSize: typography.stat.fontSize, lineHeight: typography.stat.lineHeight, fontWeight: typography.stat.fontWeight, color: colors.text.primary, marginTop: icon ? spacing.x1 : 0 }}>{value}</Text>
      <Text style={{ fontSize: typography.caption.fontSize, lineHeight: typography.caption.lineHeight, fontWeight: typography.caption.fontWeight, color: colors.text.muted, marginTop: spacing.x1 }}>{label}</Text>
    </View>
  );
};

export default Stat;

