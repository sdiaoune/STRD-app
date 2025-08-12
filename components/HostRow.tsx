import React from 'react';
import { View, Text, Image } from 'react-native';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import { spacing, typography, colors } from '../tokens';

interface Props {
  name: string;
  avatarUrl?: string;
  isPartner?: boolean;
  style?: any;
}

export const HostRow: React.FC<Props> = ({ name, avatarUrl, isPartner, style }) => {
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center' }, style]}>
      <Avatar size={44} source={avatarUrl} />
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
