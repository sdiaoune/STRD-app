import React from 'react';
import { Text, View, ViewProps } from 'react-native';
import { typography } from '../tokens';

interface Props extends ViewProps {
  label: string;
}

export const Chip: React.FC<Props> = ({ label, style, ...rest }) => {
  return (
    <View
      className="border rounded-full justify-center"
      style={[{ height: 24, paddingHorizontal: 10, borderColor: '#6B5300' }, style]}
      {...rest}
    >
      <Text
        numberOfLines={1}
        ellipsizeMode="tail"
        className="text-primary"
        style={[typography.caption]}
      >
        {label}
      </Text>
    </View>
  );
};
