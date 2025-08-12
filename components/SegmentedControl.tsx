import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, LayoutChangeEvent, Animated } from 'react-native';
import { spacing, typography, colors, radii } from '../tokens';

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
        backgroundColor: colors.bg.elev2,
        padding: spacing[1],
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <Animated.View
        style={{
          position: 'absolute',
          height: 36,
          width: width / segments.length - spacing[1],
          backgroundColor: colors.accent,
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
            <Text
              style={[
                typography.body,
                {
                  color: selected ? colors.accentOn : colors.text.primary,
                  fontWeight: '600',
                },
              ]}
            >
              {segment}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};
