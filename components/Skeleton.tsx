import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

import { surfaces } from '../theme';
import { motion } from '../tokens';

interface Props {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export const Skeleton: React.FC<Props> = ({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
}) => {
  const shimmerValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.timing(shimmerValue, {
        toValue: 1,
        duration: motion.shimmer.duration,
        useNativeDriver: false,
      })
    );
    shimmerAnimation.start();

    return () => shimmerAnimation.stop();
  }, [shimmerValue]);

  const shimmerOpacity = shimmerValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.18, 0.32, 0.18],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity: shimmerOpacity,
        },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: surfaces.subtle,
  },
});

export const EventCardSkeleton: React.FC = () => (
  <View style={{ marginBottom: 12 }}>
    <Skeleton height={16} width="60%" style={{ marginBottom: 8 }} />
    <Skeleton height={24} style={{ marginBottom: 8 }} />
    <Skeleton height={16} width="80%" style={{ marginBottom: 8 }} />
    <Skeleton height={16} width="70%" style={{ marginBottom: 12 }} />
    <View style={{ flexDirection: 'row', gap: 8 }}>
      <Skeleton height={24} width={60} borderRadius={12} />
      <Skeleton height={24} width={80} borderRadius={12} />
      <Skeleton height={24} width={70} borderRadius={12} />
    </View>
  </View>
);

export const ProfileStatsSkeleton: React.FC = () => (
  <View style={{ flexDirection: 'row', gap: 16 }}>
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Skeleton height={32} width={60} style={{ marginBottom: 4 }} />
      <Skeleton height={16} width={40} />
    </View>
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Skeleton height={32} width={60} style={{ marginBottom: 4 }} />
      <Skeleton height={16} width={40} />
    </View>
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Skeleton height={32} width={60} style={{ marginBottom: 4 }} />
      <Skeleton height={16} width={40} />
    </View>
  </View>
);
