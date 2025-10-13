import React, { useEffect, useRef, useState } from 'react';
import { View, Pressable, LayoutChangeEvent, Animated } from 'react-native';
import { spacing, typography, colors, borderRadius as radii } from '../theme';
import ThemedText from '@/src/design/components/Text';

interface Props {
  segments: string[];
  value: string;
  onChange: (value: string) => void;
}

export const SegmentedControl: React.FC<Props> = ({ segments, value, onChange }) => {
  const [width, setWidth] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;
  const index = segments.indexOf(value);

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: (width / segments.length) * index,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [index, width, segments.length, translateX]);

  const onLayout = (e: LayoutChangeEvent) => {
    setWidth(e.nativeEvent.layout.width);
  };

  return (
    <View
      onLayout={onLayout}
      accessible
      accessibilityRole="tablist"
      style={{
        height: 44,
        borderRadius: radii.md,
        backgroundColor: colors.surfaceMuted,
        padding: spacing[1],
        borderWidth: 1,
        borderColor: colors.border,
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <Animated.View
        style={{
          position: 'absolute',
          height: 36,
          width: width / segments.length - spacing[1],
          backgroundColor: colors.primary,
          borderRadius: 10,
          transform: [{ translateX }],
        }}
      />
      {segments.map((segment) => {
        const selected = segment === value;
        return (
          <Pressable
            key={segment}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            style={{
              flex: 1,
              height: 36,
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: spacing[4],
            }}
            onPress={() => onChange(segment)}
            hitSlop={12}
          >
            <ThemedText
              style={[
                typography.body,
                {
                  color: selected ? colors.onPrimary : colors.text.primary,
                  fontWeight: '600',
                },
              ]}
              
            >
              {segment}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
};
