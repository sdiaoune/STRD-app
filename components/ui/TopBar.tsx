import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../theme';
import { Avatar } from '../Avatar';

type Action = { icon: keyof typeof Ionicons.glyphMap; accessibilityLabel: string; onPress: () => void };

type Props = {
  title: string;
  leftIcon?: { icon: keyof typeof Ionicons.glyphMap; accessibilityLabel: string; onPress: () => void };
  rightActions?: Action[];
  rightAvatar?: { source?: string; label?: string; onPress: () => void };
};

export const TopBar: React.FC<Props> = ({ title, leftIcon, rightActions = [], rightAvatar }) => {
  const { colors, spacing, typography } = useTheme();
  const styles = StyleSheet.create({
    container: {
      width: '100%',
      backgroundColor: colors.surface,
      borderBottomColor: colors.border,
      borderBottomWidth: StyleSheet.hairlineWidth,
      paddingTop: spacing.x4,
      paddingBottom: spacing.x4,
      paddingHorizontal: spacing.container,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    title: {
      fontSize: typography.display.fontSize,
      lineHeight: typography.display.lineHeight,
      fontWeight: '700',
      color: colors.text.primary,
      textAlign: 'center',
      flex: 1,
    },
    button: {
      minHeight: 44,
      minWidth: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },
    side: { minWidth: 64, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'flex-start' },
    avatarBtn: { minHeight: 44, minWidth: 44, alignItems: 'center', justifyContent: 'center' },
  });

  return (
    <View style={styles.container}>
      <View style={styles.side}>
        {leftIcon ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={leftIcon.accessibilityLabel}
            onPress={leftIcon.onPress}
            hitSlop={12}
            style={styles.button}
          >
            <Ionicons name={leftIcon.icon} size={22} color={colors.text.primary} />
          </Pressable>
        ) : null}
      </View>
      <Text style={styles.title}>{title}</Text>
      <View style={[styles.side, { justifyContent: 'flex-end' }]}>
        {rightActions.map((a) => (
          <Pressable
            key={a.accessibilityLabel}
            accessibilityRole="button"
            accessibilityLabel={a.accessibilityLabel}
            onPress={a.onPress}
            hitSlop={12}
            style={styles.button}
          >
            <Ionicons name={a.icon} size={22} color={colors.text.primary} />
          </Pressable>
        ))}
        {rightAvatar ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={rightAvatar.label || 'Open profile'}
            onPress={rightAvatar.onPress}
            hitSlop={12}
            style={styles.avatarBtn}
          >
            <Avatar source={rightAvatar.source || ''} size={28} label={rightAvatar.label} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
};

export default TopBar;

