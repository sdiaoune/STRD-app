import React, { useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  NavigationProp,
  useNavigation,
} from '@react-navigation/native';

import Heading from '@/src/design/components/Heading';
import Input from '@/src/design/components/Input';
import Text from '@/src/design/components/Text';
import { useTheme } from '@/src/design/useTheme';
import { Avatar } from './Avatar';
import { useStore } from '../state/store';

type Props = {
  title: string;
  searchValue?: string;
  searchPlaceholder?: string;
  searchAccessibilityLabel?: string;
  onChangeSearch?: (value: string) => void;
  onSubmitSearch?: () => void;
  onClearSearch?: () => void;
  onPressSearch?: () => void;
  editableSearch?: boolean;
  caption?: string;
};

export const TopBar: React.FC<Props> = ({
  title,
  caption,
  searchValue,
  searchPlaceholder = 'Search STRD',
  searchAccessibilityLabel,
  onChangeSearch,
  onSubmitSearch,
  onClearSearch,
  onPressSearch,
  editableSearch,
}) => {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp<Record<string, object | undefined>>>();
  const currentUser = useStore((state) => state.currentUser);
  const avatarSource = currentUser?.avatar ?? undefined;
  const avatarLabel = currentUser?.name ?? undefined;

  const isEditable = editableSearch ?? typeof onChangeSearch === 'function';

  const parentNavigation = navigation.getParent<NavigationProp<Record<string, object | undefined>>>();

  const handleNavigateToSearch = useCallback(() => {
    if (onPressSearch) {
      onPressSearch();
      return;
    }
    if (isEditable) {
      return;
    }
    const targetParams: Record<string, unknown> = { screen: 'UserSearch' };
    if (parentNavigation) {
      parentNavigation.navigate('Search' as never, targetParams as never);
    } else {
      navigation.navigate('Search' as never, targetParams as never);
    }
  }, [isEditable, navigation, onPressSearch, parentNavigation]);

  const handleAvatarPress = useCallback(() => {
    if (parentNavigation) {
      parentNavigation.navigate('Profile' as never);
    } else {
      navigation.navigate('Profile' as never);
    }
  }, [navigation, parentNavigation]);

  const handleClearSearch = useCallback(() => {
    if (onClearSearch) {
      onClearSearch();
      return;
    }
    if (onChangeSearch) {
      onChangeSearch('');
    }
  }, [onChangeSearch, onClearSearch]);

  const showClear = Boolean(isEditable && (searchValue ?? '').length > 0 && (onClearSearch || onChangeSearch));

  return (
    <View
      style={StyleSheet.compose(styles.container, {
        backgroundColor: theme.colors.bg,
        borderBottomColor: theme.colors.outline,
        paddingHorizontal: theme.spacing.lg,
        paddingTop: theme.spacing.md,
        paddingBottom: theme.spacing.md,
      })}
    >
      <View style={styles.topRow}>
        <View style={styles.titleColumn}>
          <Heading level="h3" style={{ marginBottom: caption ? theme.spacing.xs : 0 }}>
            {title}
          </Heading>
          {caption ? (
            <Text variant="caption" muted>
              {caption}
            </Text>
          ) : null}
        </View>
        <Pressable
          onPress={handleAvatarPress}
          accessibilityRole="button"
          accessibilityLabel="Open profile"
          hitSlop={12}
          style={({ pressed }) => [styles.avatarButton, pressed && { opacity: 0.85 }]}
        >
          <Avatar source={avatarSource} size={40} label={avatarLabel} />
        </Pressable>
      </View>
      <View style={styles.searchWrapper}>
        <Input
          value={searchValue}
          editable={isEditable}
          onChangeText={onChangeSearch}
          placeholder={searchPlaceholder}
          accessibilityLabel={searchAccessibilityLabel ?? searchPlaceholder}
          returnKeyType="search"
          onSubmitEditing={() => {
            if (onSubmitSearch) {
              onSubmitSearch();
            } else if (!isEditable) {
              handleNavigateToSearch();
            }
          }}
          autoCorrect={false}
          autoCapitalize="none"
          leftAdornment={<Ionicons name="search" size={18} color={theme.colors.textMuted} />}
          rightAdornment={
            showClear ? (
              <Pressable
                onPress={handleClearSearch}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Clear search"
                style={({ pressed }) => [styles.clearButton, pressed && { opacity: 0.7 }]}
              >
                <Ionicons name="close-circle" size={18} color={theme.colors.textMuted} />
              </Pressable>
            ) : undefined
          }
          style={{
            paddingVertical: theme.spacing.xs,
            fontSize: 16,
            lineHeight: 22,
          }}
          containerProps={{
            style: {
              width: '100%',
            },
          }}
        />
        {!isEditable ? (
          <Pressable
            onPress={handleNavigateToSearch}
            accessibilityRole="button"
            accessibilityLabel={searchAccessibilityLabel ?? searchPlaceholder}
            style={StyleSheet.compose(styles.searchOverlay, { borderRadius: theme.radius.md })}
            hitSlop={8}
          />
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleColumn: {
    flex: 1,
    marginRight: 16,
  },
  avatarButton: {
    borderRadius: 28,
  },
  searchWrapper: {
    marginTop: 16,
  },
  searchOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  clearButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default TopBar;
