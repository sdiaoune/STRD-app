import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../theme';
import { supabase } from '../supabase/client';
import { useNavigation } from '@react-navigation/native';

type Notif = {
  id: string;
  type: 'like' | 'follow';
  target_type: 'post' | 'user';
  target_id: string;
  data: any;
  is_read: boolean;
  created_at: string;
};

export const NotificationsScreen: React.FC = () => {
  const [items, setItems] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('notifications')
      .select('id, type, target_type, target_id, data, is_read, created_at')
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
      // Navigate to profile (RunnerProfile in Profile stack)
      // @ts-ignore
      navigation.navigate('Profile' as never, { screen: 'RunnerProfile', params: { userId: n.target_id } } as never);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
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
        ListEmptyComponent={!loading ? <Text style={styles.empty}>No notifications</Text> : null}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  title: { ...typography.h2, color: colors.text },
  markRead: { ...typography.caption, color: colors.primary },
  row: { flexDirection: 'row', alignItems: 'center', padding: spacing.md },
  rowTitle: { ...typography.body, color: colors.text },
  rowMeta: { ...typography.caption, color: colors.muted },
  sep: { height: 1, backgroundColor: colors.border },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
  empty: { ...typography.caption, color: colors.muted, padding: spacing.md },
});


