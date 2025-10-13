import React from 'react';
import { Text, View, type ViewProps } from 'react-native';

import { colors, spacing, typography } from '../theme';

interface Props extends ViewProps {
  label: string;
}

export const Chip: React.FC<Props> = ({ label, style, ...rest }) => {
  return (
    <View
      style={[
        {
          minHeight: 24,
          paddingHorizontal: spacing[3],
          paddingVertical: spacing[1] - 2,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.primary,
          backgroundColor: 'transparent',
          justifyContent: 'center',
          alignItems: 'center',
          alignSelf: 'flex-start',
        },
        style,
      ]}
      {...rest}
    >
      <Text
        numberOfLines={1}
        ellipsizeMode="tail"
        style={{
          fontSize: typography.caption.fontSize,
          lineHeight: typography.caption.lineHeight,
          fontWeight: '700',
          letterSpacing: 0.6,
          color: colors.primary,
        }}
        maxFontSizeMultiplier={1.2}
      >
        {label}
      </Text>
    </View>
  );
};
