import React from 'react';
import { Text, View, type ViewProps } from 'react-native';

import { typography, spacing, colors, borderRadius as radii } from '../theme';

interface Props extends ViewProps {
  label: string;
  children?: React.ReactNode;
}

export const Badge: React.FC<Props> = ({ label, style, children, ...rest }) => (
  <View
    style={[
      {
        backgroundColor: colors.secondary,
        borderRadius: radii.md,
        paddingHorizontal: spacing[3],
        paddingVertical: spacing[1],
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[1],
      },
      style,
    ]}
    {...rest}
  >
    {children ? <View style={{ marginRight: spacing[1] }}>{children}</View> : null}
    <Text
      style={{
        fontSize: typography.caption.fontSize,
        lineHeight: typography.caption.lineHeight,
        fontWeight: '600',
        color: colors.onPrimary,
        textTransform: 'uppercase',
        letterSpacing: 0.6,
      }}
      maxFontSizeMultiplier={1.1}
    >
      {label}
    </Text>
  </View>
);
