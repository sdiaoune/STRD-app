import React, { useEffect, useState } from 'react';
import { Modal, View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { supabase } from '../supabase/client';
import { colors, spacing, borderRadius, typography } from '../theme';

interface LikesSheetProps { postId: string; onClose: () => void }

export default function LikesSheet({ postId, onClose }: LikesSheetProps) {
  const [users, setUsers] = useState<Array<{ id: string; name: string | null; handle: string | null; avatar: string | null }>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const { data: likes } = await supabase
        .from('run_post_likes')
        .select('user_id')
        .eq('post_id', postId);
      const ids = (likes || []).map(l => l.user_id).filter(Boolean);
      if (ids.length === 0) {
        if (mounted) setUsers([]);
        setLoading(false);
        return;
      }
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, handle, avatar_url')
        .in('id', ids as any);
      const mapped = (profiles || []).map(p => ({ id: p.id, name: p.name, handle: p.handle, avatar: p.avatar_url }));
      if (mounted) setUsers(mapped);
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [postId]);

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Liked by</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.close}>Close</Text>
            </TouchableOpacity>
          </View>
          {loading ? (
            <Text style={styles.empty}>Loading…</Text>
          ) : users.length === 0 ? (
            <Text style={styles.empty}>No likes yet</Text>
          ) : (
            <FlatList
              data={users}
              keyExtractor={(u) => u.id}
              ItemSeparatorComponent={() => <View style={styles.sep} />}
              renderItem={({ item }) => (
                <View style={styles.row}>
                  <Image source={{ uri: item.avatar || '' }} style={styles.avatar} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{item.name || 'User'}</Text>
                    {!!item.handle && <Text style={styles.handle}>@{item.handle}</Text>}
                  </View>
                </View>
              )}
              style={{ maxHeight: 320 }}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: { ...typography.h3, color: colors.text.primary },
  close: { ...typography.caption, color: colors.primary },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.border, marginRight: spacing.sm },
  name: { ...typography.body, color: colors.text.primary },
  handle: { ...typography.caption, color: colors.muted },
  sep: { height: 1, backgroundColor: colors.border },
  empty: { ...typography.caption, color: colors.muted, paddingVertical: spacing.md },
});


