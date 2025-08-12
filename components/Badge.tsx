import React from 'react';
import { Text, View, ViewProps } from 'react-native';
import { typography, colors, spacing, radii } from '../tokens';

interface Props extends ViewProps {
  label: string;
}

export const Badge: React.FC<Props> = ({ label, style, ...rest }) => (
  <View
    style={[
      {
        backgroundColor: colors.accent,
        borderRadius: radii.sm,
        paddingHorizontal: spacing[2],
        paddingVertical: spacing[1],
      },
      style,
    ]}
    {...rest}
  >
    <Text
      style={[
        typography.overline,
        {
          color: colors.accentOn,
          fontWeight: '600',
        },
      ]}
    >
      {label}
    </Text>
  </View>
);
