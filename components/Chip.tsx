import React from 'react';
import { Text, View, ViewProps } from 'react-native';
import { colors } from '../tokens';

interface Props extends ViewProps {
  label: string;
}

export const Chip: React.FC<Props> = ({ label, style, ...rest }) => {
  return (
    <View
      style={[
        {
          minHeight: 28,
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 999,
          borderWidth: 1,
          borderColor: '#FFC86E33',
          backgroundColor: '#FFC86E1A',
          justifyContent: 'center',
          alignItems: 'center',
          alignSelf: 'flex-start',
          maxWidth: '70%',
        },
        style,
      ]}
      {...rest}
    >
      <Text
        numberOfLines={1}
        ellipsizeMode="tail"
        style={[
          { fontSize: 14, lineHeight: 18, fontWeight: '600', color: colors.accent },
        ]}
      >
        {label}
      </Text>
    </View>
  );
};
