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
          minHeight: 32,
          paddingHorizontal: spacing[3],
          paddingVertical: spacing[1],
          borderRadius: 999,
          borderWidth: 1,
          borderColor: colors.accent,
          backgroundColor: colors.overlay,
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
          fontWeight: '600',
          color: colors.accent,
        }}
        maxFontSizeMultiplier={1.2}
      >
        {label}
      </Text>
    </View>
  );
};
