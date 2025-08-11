import React, { useEffect, useRef } from 'react';
import { Animated, Text } from 'react-native';
import { typography } from '../tokens';

interface Props {
  message: string;
  visible: boolean;
  onHide: () => void;
}

export const Toast: React.FC<Props> = ({ message, visible, onHide }) => {
  const translateY = useRef(new Animated.Value(100)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(translateY, {
        toValue: 0,
        duration: 320,
        useNativeDriver: true,
      }).start();
      const timer = setTimeout(() => {
        Animated.timing(translateY, {
          toValue: 100,
          duration: 320,
          useNativeDriver: true,
        }).start(onHide);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [visible, onHide, translateY]);

  return (
    <Animated.View
      accessibilityRole="alert"
      style={{ transform: [{ translateY }], position: 'absolute', bottom: 16, left: 16, right: 16 }}
      className="bg-surfaceAlt rounded-lg px-4 py-3"
    >
      <Text style={typography.body} className="text-text">
        {message}
      </Text>
    </Animated.View>
  );
};
