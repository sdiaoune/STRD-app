import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { colors } from '../theme';

interface AvatarProps {
  source: string;
  size?: number;
  style?: any;
}

export const Avatar: React.FC<AvatarProps> = ({
  source,
  size = 40,
  style
}) => {
  const radius = size / 2;
  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: radius }, style]}>
      {source ? (
        <Image
          source={{ uri: source }}
          style={{ width: size, height: size, borderRadius: radius }}
          resizeMode="cover"
        />
      ) : (
        <View style={{ width: size, height: size, borderRadius: radius, backgroundColor: colors.border }} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: colors.border,
  },
});
