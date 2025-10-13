import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../theme';
import Button from './Button';

type Cta = { label: string; onPress: () => void };

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
  primaryCta?: Cta;
  secondaryCta?: Cta;
};

export const EmptyState: React.FC<Props> = ({ icon, title, body, primaryCta, secondaryCta }) => {
  const { colors, spacing, radius, typography } = useTheme();
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', padding: spacing.x8, gap: spacing.gapMd }}>
      <View style={{ padding: spacing.x3, borderRadius: radius.card, backgroundColor: colors.surfaceMuted, borderWidth: 1, borderColor: colors.border }}>
        <Ionicons name={icon} size={36} color={colors.icon.primary} />
      </View>
      <Text style={{ fontSize: typography.h2.fontSize, lineHeight: typography.h2.lineHeight, fontWeight: typography.h2.fontWeight, color: colors.text.primary, textAlign: 'center' }}>{title}</Text>
      <Text style={{ fontSize: typography.body.fontSize, lineHeight: typography.body.lineHeight, fontWeight: typography.body.fontWeight, color: colors.text.secondary, textAlign: 'center', maxWidth: 320 }}>{body}</Text>
      <View style={{ flexDirection: 'row', gap: spacing.gapMd, marginTop: spacing.x3 }}>
        {primaryCta ? <Button title={primaryCta.label} onPress={primaryCta.onPress} variant="primary" /> : null}
        {secondaryCta ? <Button title={secondaryCta.label} onPress={secondaryCta.onPress} variant="secondary" /> : null}
      </View>
    </View>
  );
};

export default EmptyState;

