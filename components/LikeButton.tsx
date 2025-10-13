import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, getCurrentThemeName } from '../theme';
import * as Haptics from 'expo-haptics';

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
  const themed = React.useMemo(() => stylesFactory(), [getCurrentThemeName()]);
  return (
    <TouchableOpacity 
      style={[themed.container, style]} 
      onPress={() => {
        Haptics.selectionAsync();
        onPress();
      }}
      activeOpacity={0.7}
    >
      <Ionicons 
        name="flash" 
        size={20} 
        color={isLiked ? colors.primary : colors.icon.secondary} 
      />
      <Text style={[themed.count, { color: isLiked ? colors.primary : colors.text.secondary }]}>
        {likeCount}
      </Text>
    </TouchableOpacity>
  );
};

const stylesFactory = () => StyleSheet.create({
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
