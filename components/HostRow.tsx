import React from 'react';
import { View, Text } from 'react-native';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import { typography } from '../tokens';

interface Props {
  name: string;
  avatar: string;
  isPartner?: boolean;
}

export const HostRow: React.FC<Props> = ({ name, avatar, isPartner }) => (
  <View className="flex-row items-center space-x-3">
    <Avatar source={avatar} size={44} />
    <Text className="text-text" style={typography.title}>
      {name}
    </Text>
    {isPartner && <Badge label="Partner" />}
  </View>
);
