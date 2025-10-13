import React, { useEffect, useRef, useState } from 'react';
import { View, Pressable, LayoutChangeEvent, Animated, Text } from 'react-native';

import { useTheme } from '../../theme';

type Props = { segments: string[]; value: string; onChange: (value: string) => void };

export const SegmentedControl: React.FC<Props> = ({ segments, value, onChange }) => {
  const { colors, spacing, radius, typography } = useTheme();
  const [width, setWidth] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;
  const index = Math.max(0, segments.indexOf(value));

  useEffect(() => {
    Animated.timing(translateX, { toValue: (width / segments.length) * index, duration: 180, useNativeDriver: true }).start();
  }, [index, width, segments.length, translateX]);

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  const itemWidth = width / Math.max(1, segments.length);

  return (
    <View onLayout={onLayout} accessible accessibilityRole="tablist" style={{ height: 44, borderRadius: radius.card, backgroundColor: colors.surfaceMuted, padding: spacing.x1, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center' }}>
      <Animated.View style={{ position: 'absolute', height: 36, width: itemWidth - spacing.x1, backgroundColor: colors.primary, borderRadius: radius.card, transform: [{ translateX }] }} />
      {segments.map((segment) => {
        const selected = segment === value;
        return (
          <Pressable key={segment} accessibilityRole="tab" accessibilityState={{ selected }} style={{ flex: 1, height: 36, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.x4 }} onPress={() => onChange(segment)} hitSlop={12}>
            <Text style={{ fontSize: typography.body.fontSize, lineHeight: typography.body.lineHeight, fontWeight: '600', color: selected ? colors.onPrimary : colors.text.primary }}>{segment}</Text>
          </Pressable>
        );
      })}
    </View>
  );
};

export default SegmentedControl;

