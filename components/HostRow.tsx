import React from 'react';
import { View, Text } from 'react-native';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import { spacing, typography } from '../theme';
import { colors } from '../theme';

interface Props {
  name: string;
  avatarUrl?: string | null;
  avatar?: string | null;
  isPartner?: boolean;
  style?: any;
}

export const HostRow: React.FC<Props> = ({ name, avatarUrl, avatar, isPartner, style }) => {
  const source = avatar ?? avatarUrl ?? undefined;
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center' }, style]}>
      <Avatar size={44} source={source} label={name} />
      <View style={{ marginLeft: spacing[3], flex: 1 }}>
        <Text style={[typography.title, { color: colors.text }]}>
          {name}
        </Text>
      </View>
      {isPartner && (
        <Badge label="Partner" />
      )}
    </View>
  );
};
