import React from 'react';
import { View, Text } from 'react-native';

import { colors, spacing, borderRadius, typography } from '../theme';

interface TagPillProps {
  tag: string;
  style?: any;
}

export const TagPill: React.FC<TagPillProps> = ({ tag, style }) => {
  return (
    <View
      style={[
        {
          backgroundColor: colors.overlay,
          paddingHorizontal: spacing[3],
          paddingVertical: spacing[1],
          borderRadius: borderRadius.lg,
          borderWidth: 1,
          borderColor: colors.outline,
        },
        style,
      ]}
    >
      <Text
        style={{
          fontSize: typography.caption.fontSize,
          lineHeight: typography.caption.lineHeight,
          fontWeight: '600',
          color: colors.text.secondary,
          textTransform: 'uppercase',
        }}
      >
        {tag}
      </Text>
    </View>
  );
};
