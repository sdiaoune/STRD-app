import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useNavigation, type NavigationProp } from '@react-navigation/native';

import { colors, spacing, typography } from '../theme';
import { Avatar } from './Avatar';
import { useStore } from '../state/store';

interface Props {
  title: string;
  left?: React.ReactNode;
}

export const TopBar: React.FC<Props> = ({ title, left }) => {
  const navigation = useNavigation<NavigationProp<Record<string, object | undefined>>>();
  const currentUser = useStore((s) => s.currentUser);

  return (
    <View
      style={{
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
        paddingBottom: spacing.md,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.outline,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: spacing.sm,
        }}
      >
        <View style={{ flex: 1 }}>{left}</View>
        <Pressable
          onPress={() => navigation.navigate('Profile')}
          style={{ borderRadius: spacing.lg, overflow: 'hidden' }}
          accessibilityRole="button"
          hitSlop={12}
        >
          <Avatar source={currentUser.avatar ?? undefined} size={36} label={currentUser.name ?? undefined} />
        </Pressable>
      </View>
      <Text
        style={{
          fontSize: typography.h2.fontSize,
          lineHeight: typography.h2.lineHeight,
          fontWeight: typography.h2.fontWeight,
          color: colors.text.primary,
          textAlign: 'center',
        }}
        maxFontSizeMultiplier={1.2}
      >
        {title}
      </Text>
    </View>
  );
};

export default TopBar;
