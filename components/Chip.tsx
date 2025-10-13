import React from 'react';
import { Text, View, type ViewProps } from 'react-native';

import { colors, spacing, typography, sharedStyles } from '../theme';

interface Props extends ViewProps {
  label: string;
}

export const Chip: React.FC<Props> = ({ label, style, ...rest }) => {
  return (
    <View
      style={[
        sharedStyles.pill,
        {
          paddingHorizontal: spacing[3],
          paddingVertical: spacing[1] - 2,
          alignSelf: 'flex-start',
          backgroundColor: 'transparent',
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
          color: colors.text.primary,
        }}
        maxFontSizeMultiplier={1.2}
      >
        {label}
      </Text>
    </View>
  );
};
