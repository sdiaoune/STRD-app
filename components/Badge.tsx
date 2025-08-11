import React from 'react';
import { Text, View, ViewProps } from 'react-native';
import { typography } from '../tokens';

interface Props extends ViewProps {
  label: string;
}

export const Badge: React.FC<Props> = ({ label, style, ...rest }) => (
  <View
    className="bg-primary rounded-sm px-2 py-1"
    style={style}
    {...rest}
  >
    <Text className="text-onPrimary" style={[typography.overline]}>
      {label}
    </Text>
  </View>
);
