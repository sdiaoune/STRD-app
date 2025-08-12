import React from 'react';
import { Text, View, ViewProps } from 'react-native';
import { typography, colors, spacing, radii } from '../tokens';

interface Props extends ViewProps {
  label: string;
}

export const Chip: React.FC<Props> = ({ label, style, ...rest }) => {
  return (
    <View
      style={[
        {
          minHeight: 24,
          paddingHorizontal: 10,
          paddingVertical: 6,
          borderRadius: radii.md,
          borderWidth: 1,
          borderColor: colors.primary,
          backgroundColor: colors.primary + '30',
          justifyContent: 'center',
          alignItems: 'center',
          maxWidth: '50%',
        },
        style,
      ]}
      {...rest}
    >
      <Text
        numberOfLines={1}
        ellipsizeMode="tail"
        style={[
          typography.caption,
          {
            color: colors.accent,
            fontWeight: '600',
            lineHeight: 18,
            textAlignVertical: 'center',
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
};
