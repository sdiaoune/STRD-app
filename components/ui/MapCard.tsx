import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../theme';

type Props = { children?: React.ReactNode };

export const MapCard: React.FC<Props> = ({ children }) => {
  const { colors, spacing, radius, typography, mode, surfaces } = useTheme();
  return (
    <View style={{ borderRadius: radius.card, overflow: 'hidden', borderWidth: 1, borderColor: colors.border }}>
      <View style={{ backgroundColor: colors.surface, paddingHorizontal: spacing.container, paddingVertical: spacing.x3, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <Text style={{ fontSize: typography.caption.fontSize, lineHeight: typography.caption.lineHeight, fontWeight: typography.caption.fontWeight, color: colors.text.muted }}>Run Route • Apple Maps</Text>
      </View>
      <View style={[{ height: 180, backgroundColor: colors.surfaceMuted }, surfaces.elevated(mode)]}>{children}</View>
    </View>
  );
};

export default MapCard;

