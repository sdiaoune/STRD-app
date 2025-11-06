import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../theme';

export const CertifiedBadge: React.FC<{ size?: number } & { style?: any }>
  = ({ size = 14, style }) => (
  <View style={[{ marginLeft: spacing.xs }, style]}>
    <Ionicons name="checkmark-circle" size={size} color={colors.primary} />
  </View>
);

export default CertifiedBadge;


