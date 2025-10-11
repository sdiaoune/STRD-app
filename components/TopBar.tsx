import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { colors, spacing, typography } from '../theme';
import { Avatar } from './Avatar';
import { useStore } from '../state/store';

interface Props {
  title: string;
  left?: React.ReactNode;
}

export const TopBar: React.FC<Props> = ({ title, left }) => {
  const navigation = useNavigation<NavigationProp<Record<string, object | undefined>>>();
  const currentUser = useStore(s => s.currentUser);

  return (
    <View style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm }}>
        <View style={{ flex: 1 }}>{left}</View>
        <TouchableOpacity
          onPress={() => navigation.navigate('Profile')}
          style={{ borderRadius: spacing.lg, overflow: 'hidden' }}
          accessibilityRole="button"
          hitSlop={8}
        >
          <Avatar source={currentUser.avatar ?? undefined} size={36} label={currentUser.name ?? undefined} />
        </TouchableOpacity>
      </View>
      <Text style={[typography.h1 as any, { color: colors.text.primary, textAlign: 'center' }]}>{title}</Text>
    </View>
  );
};

export default TopBar;


