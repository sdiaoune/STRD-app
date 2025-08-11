import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, LayoutChangeEvent, Animated } from 'react-native';
import { spacing, typography } from '../tokens';

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
      className="flex-row items-center bg-[#1A1E24] rounded-xl p-1"
      style={{ height: 44 }}
    >
      <Animated.View
        className="absolute bg-primary rounded-lg"
        style={{
          height: 36,
          width: width / segments.length - spacing[1],
          transform: [{ translateX }],
        }}
      />
      {segments.map((segment) => {
        const selected = segment === value;
        return (
          <Pressable
            key={segment}
            className="flex-1 items-center justify-center"
            onPress={() => onChange(segment)}
            accessibilityRole="button"
          >
            <Text
              style={typography.body}
              className={selected ? 'text-onPrimary' : 'text-text'}
            >
              {segment}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};
