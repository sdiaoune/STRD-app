import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../theme';

interface LikeButtonProps {
  isLiked: boolean;
  likeCount: number;
  onPress: () => void;
  style?: any;
}

export const LikeButton: React.FC<LikeButtonProps> = ({ 
  isLiked, 
  likeCount, 
  onPress, 
  style 
}) => {
  return (
    <TouchableOpacity 
      style={[styles.container, style]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons 
        name="flash" 
        size={20} 
        color={isLiked ? colors.primary : colors.muted} 
      />
      <Text style={[styles.count, { color: isLiked ? colors.primary : colors.muted }]}>
        {likeCount}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  count: {
    ...typography.caption,
    marginLeft: spacing.xs,
    fontWeight: '600',
  },
});
