import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';
import { colors } from '../tokens';

interface Props {
  width: number | string;
  height: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<Props> = ({ width, height, style }) => {
  const opacity = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, [opacity]);
  return (
    <Animated.View
      style={[{ width, height, borderRadius: 4, backgroundColor: colors.surfaceAlt, opacity }, style]}
    />
  );
};
