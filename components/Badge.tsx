import React from 'react';
import { Text, View, ViewProps } from 'react-native';
import { typography, colors, spacing, radii } from '../tokens';

interface Props extends ViewProps {
  label: string;
  // Optional left accessory rendered via children without changing public API
  children?: React.ReactNode;
}

export const Badge: React.FC<Props> = ({ label, style, children, ...rest }) => (
  <View
    style={[
      {
        backgroundColor: colors.accent,
        borderRadius: radii.sm,
        paddingHorizontal: spacing[2],
        paddingVertical: spacing[1],
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
      },
      style,
    ]}
    {...rest}
  >
    {children ? <View style={{ marginRight: 4 }}>{children}</View> : null}
    <Text
      style={[
        typography.overline,
        {
          color: colors.accentOn,
          fontWeight: '700',
          letterSpacing: 0.3,
        },
      ]}
    >
      {label}
    </Text>
  </View>
);
