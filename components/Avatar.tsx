import React from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';
import { colors } from '../theme';

interface AvatarProps {
  source: string | null | undefined;
  size?: number;
  style?: any;
  label?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  source,
  size = 40,
  style,
  label
}) => {
  const radius = size / 2;
  const initials = React.useMemo(() => {
    if (!label) return '';
    const parts = label.trim().split(' ');
    const first = parts[0]?.[0] ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase();
  }, [label]);
  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: radius }, style]}>
      {source ? (
        <Image
          source={{ uri: source }}
          style={{ width: size, height: size, borderRadius: radius }}
          resizeMode="cover"
        />
      ) : (
        <View style={{ width: size, height: size, borderRadius: radius, backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center' }}>
          {!!initials && (
            <Text style={{ color: colors.text, fontWeight: '700' }} accessibilityLabel={`Avatar ${initials}`}>
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
    backgroundColor: colors.border,
  },
});
