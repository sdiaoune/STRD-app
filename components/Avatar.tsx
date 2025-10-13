import React from 'react';
import { View, Image, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import Text from '@/src/design/components/Text';
import { useTheme } from '@/src/design/useTheme';

interface AvatarProps {
  source: string | null | undefined;
  size?: number;
  style?: StyleProp<ViewStyle>;
  label?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ source, size = 40, style, label }) => {
  const theme = useTheme();
  const radius = size / 2;
  const initials = React.useMemo(() => {
    if (!label) return '';
    const parts = label.trim().split(' ').filter(Boolean);
    const first = parts[0]?.[0] ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase();
  }, [label]);

  return (
    <View
      style={StyleSheet.flatten([
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: radius,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.bgElevated,
        },
        style,
      ])}
    >
      {source ? (
        <Image
          source={{ uri: source }}
          style={{ width: size, height: size, borderRadius: radius }}
          resizeMode="cover"
        />
      ) : (
        <View
          style={{
            width: size,
            height: size,
            borderRadius: radius,
            backgroundColor: theme.colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          accessible
          accessibilityLabel={label ? `Avatar ${label}` : 'Avatar'}
        >
          {!!initials && (
            <Text emphasis="bold" style={{ color: theme.colors.primaryText }}>
              {initials}
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderWidth: 1,
  },
});

export default Avatar;
