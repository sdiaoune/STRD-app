import React, { useState } from 'react';
import { View, Pressable, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../theme';
import { Avatar } from '../Avatar';

type Action = { icon: keyof typeof Ionicons.glyphMap; accessibilityLabel: string; onPress: () => void };
type DropdownAction = { label: string; icon?: keyof typeof Ionicons.glyphMap; onPress: () => void };

type Props = {
  title: string;
  leftIcon?: { icon: keyof typeof Ionicons.glyphMap; accessibilityLabel: string; onPress: () => void };
  rightActions?: Action[];
  rightDropdown?: { icon: keyof typeof Ionicons.glyphMap; accessibilityLabel: string; actions: DropdownAction[] };
  rightAvatar?: { source?: string; label?: string; onPress: () => void };
  compact?: boolean; // reduces vertical padding for tighter pages
};

export const TopBar: React.FC<Props> = ({ title, leftIcon, rightActions = [], rightDropdown, rightAvatar, compact }) => {
  const { colors, spacing, typography, mode } = useTheme();
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const padY = compact ? spacing.x2 : spacing.x4;
  const styles = StyleSheet.create({
    container: {
      width: '100%',
      backgroundColor: mode === 'light' ? colors.surface : colors.bg,
      borderBottomColor: colors.border,
      borderBottomWidth: StyleSheet.hairlineWidth,
      paddingTop: padY,
      paddingBottom: padY,
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
    dropdownMenu: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: spacing.sm,
      minWidth: 200,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 5,
    },
    dropdownItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
    dropdownText: {
      color: colors.text.primary,
      marginLeft: spacing.sm,
      fontSize: 16,
    },
  });

  const handleDropdownAction = (onPress: () => void) => {
    setDropdownVisible(false);
    onPress();
  };

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
      <Text
        style={styles.title}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.7}
        ellipsizeMode="tail"
      >
        {title}
      </Text>
      <View style={[styles.side, { justifyContent: 'flex-end' }]}>
        {rightDropdown ? (
          <>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={rightDropdown.accessibilityLabel}
              onPress={() => setDropdownVisible(!dropdownVisible)}
              hitSlop={12}
              style={styles.button}
            >
              <Ionicons name={rightDropdown.icon} size={22} color={colors.text.primary} />
            </Pressable>
            {dropdownVisible && (
              <Modal transparent animationType="none" visible={dropdownVisible}>
                <TouchableOpacity style={{ flex: 1 }} onPress={() => setDropdownVisible(false)} />
                <View style={styles.dropdownMenu}>
                  {rightDropdown.actions.map((action, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.dropdownItem}
                      onPress={() => handleDropdownAction(action.onPress)}
                    >
                      {action.icon && <Ionicons name={action.icon} size={18} color={colors.text.primary} />}
                      <Text style={styles.dropdownText}>{action.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </Modal>
            )}
          </>
        ) : (
          rightActions.map((a) => (
            <Pressable
              key={a.accessibilityLabel}
              accessibilityRole="button"
              accessibilityLabel={a.accessibilityLabel}
              onPress={a.onPress}
              // Keep right-side hitSlop tighter on the side facing the avatar to avoid overlap
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 4 }}
              style={styles.button}
            >
              <Ionicons name={a.icon} size={22} color={colors.text.primary} />
            </Pressable>
          ))
        )}
        {rightAvatar ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={rightAvatar.label || 'Open profile'}
            onPress={rightAvatar.onPress}
            // Mirror hitSlop to avoid encroaching on the settings button
            hitSlop={{ top: 12, bottom: 12, left: 4, right: 12 }}
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

