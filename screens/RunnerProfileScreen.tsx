import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '../types/navigation';
import { colors, spacing, borderRadius, typography, useTheme as useTokensTheme } from '../theme';
import { useStore } from '../state/store';
import { StatsRow } from '../components/StatsRow';
import { Avatar } from '../components/Avatar';

type RunnerProfileScreenNav = NativeStackNavigationProp<ProfileStackParamList, 'RunnerProfile'>;

export const RunnerProfileScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<RunnerProfileScreenNav>();
  const { userId } = route.params as { userId: string };
  const { userById, runPosts } = useStore();
  // Ensure we have the latest user info if not already in state
  useEffect(() => {
    (async () => {
      if (!userById(userId)) {
        const { supabase } = await import('../supabase/client');
        const { data } = await supabase.from('profiles').select('id, name, handle, avatar_url').eq('id', userId).maybeSingle();
        if (data) {
          // hydrate minimal user into store cache for display
          const u = { id: data.id, name: data.name, handle: data.handle, avatar: data.avatar_url, city: null, interests: [], followingOrgs: [] } as any;
          const prev = useStore.getState().users;
          useStore.setState({ users: [...prev.filter(p => p.id !== userId), u] });
        }
      }
    })();
  }, [userId]);
  const unit = useStore(state => state.unitPreference);
  const { formatDistance } = require('../utils/format');
  const followUser = useStore(s => s.followUser);
  const unfollowUser = useStore(s => s.unfollowUser);
  const currentUser = useStore(s => s.currentUser);
  const followingUserIds = useStore(s => s.followingUserIds);
  const [isFollowing, setIsFollowing] = useState<boolean | null>(
    followingUserIds.includes(userId) ? true : null
  );

  const user = userById(userId);

  useEffect(() => {
    if (isFollowing !== null) return;
    let mounted = true;
    (async () => {
      const { supabase } = await import('../supabase/client');
      const { data } = await supabase.from('user_follows').select('followee_id').eq('follower_id', currentUser.id).eq('followee_id', userId).maybeSingle();
      if (mounted) setIsFollowing(!!data);
    })();
    return () => { mounted = false; };
  }, [userId, currentUser.id, isFollowing]);

  const posts = runPosts.filter(p => p.userId === userId).sort((a, b) => new Date(b.createdAtISO).getTime() - new Date(a.createdAtISO).getTime());
  const totalRuns = posts.length;
  const totalDistance = posts.reduce((s, p) => s + p.distanceKm, 0);
  // ISO week streak calculation
  const getIsoWeekKey = (date: Date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
  };
  const weekSet = new Set<string>(posts.map(p => getIsoWeekKey(new Date(p.createdAtISO))));
  let streak = 0; {
    let cursor = new Date();
    while (true) {
      const key = getIsoWeekKey(cursor);
      if (!weekSet.has(key)) break;
      streak += 1;
      cursor = new Date(cursor.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
  }
  const weeklyStreak = streak;

  const theme = useTokensTheme();
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.mode === 'light' ? theme.colors.surface : theme.colors.bg }]}>
      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        <View style={styles.header}>
          <Avatar source={user?.avatar || undefined} size={80} label={user?.name || undefined} />
          <Text style={[styles.name, { color: theme.colors.text.primary }]}>{user?.name || 'Runner'}</Text>
          <Text style={[styles.handle, { color: theme.colors.text.secondary }]}>{user?.handle || ''}</Text>
          {userId !== currentUser.id && (
            <TouchableOpacity
              style={[styles.followBtn, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }, isFollowing ? styles.following : null]}
              onPress={async () => {
                if (isFollowing) {
                  const ok = await unfollowUser(userId);
                  if (ok) setIsFollowing(false);
                } else {
                  const ok = await followUser(userId);
                  if (ok) setIsFollowing(true);
                }
              }}
              disabled={isFollowing === null}
            >
              <Text style={[styles.followText, { color: theme.colors.primary }]}>{isFollowing ? 'Following' : 'Follow'}</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ marginTop: spacing.md }}>
          <StatsRow stats={[{ label: 'Total Runs', value: totalRuns }, { label: 'Weekly Streak', value: weeklyStreak }, { label: 'Total Distance', value: formatDistance(totalDistance, unit) }]} />
        </View>

        <Text style={styles.section}>Recent Posts</Text>
        {posts.length === 0 ? (
          <Text style={styles.empty}>No visible runs.</Text>
        ) : (
          posts.map(p => (
            <View key={p.id} style={[styles.postRow, { borderBottomColor: theme.colors.border }]}>
              <Text style={[styles.postText, { color: theme.colors.text.primary }]}>{new Date(p.createdAtISO).toLocaleDateString()} • {formatDistance(p.distanceKm, unit)}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { alignItems: 'center', marginBottom: spacing.lg },
  name: { ...typography.h2, color: colors.text.primary, marginTop: spacing.md },
  handle: { ...typography.caption, color: colors.text.secondary },
  followBtn: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  following: { opacity: 0.9 },
  followText: { ...typography.body, color: colors.primary, fontWeight: '600' },
  section: { ...typography.h3, color: colors.text.primary, marginTop: spacing.lg, marginBottom: spacing.sm },
  empty: { ...typography.body, color: colors.text.secondary },
  postRow: { paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  postText: { ...typography.body, color: colors.text.primary },
});


