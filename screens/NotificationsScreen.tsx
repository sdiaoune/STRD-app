import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, useTheme as useTokensTheme } from '../theme';
import EmptyState from '../components/ui/EmptyState';
import { useLegacyStyles } from '../theme/useLegacyStyles';
import { supabase } from '../supabase/client';
import { useNavigation } from '@react-navigation/native';
import TopBar from '../components/TopBar';
import { openUserProfile } from '../utils/openUserProfile';

type Notif = {
  id: string;
  type: 'like' | 'follow';
  target_type: 'post' | 'user';
  target_id: string;
  actor_id?: string | null;
  data: any;
  is_read: boolean;
  created_at: string;
};

export const NotificationsScreen: React.FC = () => {
  const [items, setItems] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const styles = useLegacyStyles(createStyles);
  const tokensTheme = useTokensTheme();

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('notifications')
      .select('id, type, target_type, target_id, actor_id, data, is_read, created_at')
      .order('created_at', { ascending: false })
      .limit(100);
    setItems((data as any) || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const markAllRead = async () => {
    await supabase.from('notifications').update({ is_read: true }).eq('is_read', false);
    load();
  };

  const renderIcon = (t: string) => (
    <Ionicons name={t === 'like' ? 'heart' : 'person-add'} size={20} color={colors.primary} />
  );

  const onItemPress = (n: Notif) => {
    if (n.target_type === 'post') {
      // Navigate to post details via Timeline stack
      // @ts-ignore
      navigation.navigate('Timeline' as never, { screen: 'PostDetails', params: { postId: n.target_id } } as never);
    } else if (n.target_type === 'user') {
      openUserProfile(navigation as any, n.actor_id || n.target_id);
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: tokensTheme.mode === 'light' ? tokensTheme.colors.surface : tokensTheme.colors.bg },
      ]}
    >
      <TopBar
        title="Notifications"
        leftIcon={{ icon: 'search', accessibilityLabel: 'Search', onPress: () => (navigation as any).navigate('Search' as never) }}
        rightActions={[{ icon: 'settings-outline', accessibilityLabel: 'Settings', onPress: () => (navigation as any).navigate('Settings' as never) }]}
        rightAvatar={{ source: (require('../state/store').useStore.getState().currentUser?.avatar) || '', label: require('../state/store').useStore.getState().currentUser?.name || 'Profile', onPress: () => (navigation as any).navigate('Profile' as never) }}
      />
      <View style={{ paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: 0, alignItems: 'flex-end' }}>
        <TouchableOpacity onPress={markAllRead} accessibilityRole="button" hitSlop={12}>
          <Text style={styles.markRead}>Mark all read</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row} onPress={() => onItemPress(item)}>
            {renderIcon(item.type)}
            <View style={{ marginLeft: spacing.sm, flex: 1 }}>
              <Text style={styles.rowTitle}>
                {item.type === 'like' ? 'Someone liked your post' : 'New follower'}
              </Text>
              <Text style={styles.rowMeta}>{new Date(item.created_at).toLocaleString()}</Text>
            </View>
            {!item.is_read && <View style={styles.unreadDot} />}
          </TouchableOpacity>
        )}
        ListEmptyComponent={!loading ? (
          <EmptyState
            icon="notifications-outline"
            title="Quiet for now"
            body="Follow runners or join a club to get updates."
            primaryCta={{
              label: 'Find runners to follow',
              onPress: () => {
                // @ts-ignore
                navigation.navigate('Search' as never, { screen: 'UserSearch' } as never);
              },
            }}
          />
        ) : null}
      />
    </SafeAreaView>
  );
};

const createStyles = () => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {},
  title: {},
  markRead: { ...typography.caption, color: colors.primary },
  row: { flexDirection: 'row', alignItems: 'center', padding: spacing.md },
  rowTitle: { ...typography.body, color: colors.text.primary },
  rowMeta: { ...typography.caption, color: colors.text.secondary },
  sep: { height: 1, backgroundColor: colors.border },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
  empty: { ...typography.caption, color: colors.text.secondary, padding: spacing.md },
});


