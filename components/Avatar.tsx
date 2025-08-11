import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius } from '../theme';

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
  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Image
        source={{ uri: source }}
        style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
        resizeMode="cover"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: colors.border,
  },
  image: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
});
