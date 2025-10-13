import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors, spacing, borderRadius, typography } from '../theme';
import { useStore } from '../state/store';
import TopBar from '../components/TopBar';
import { Avatar } from '../components/Avatar';

export const UserSearchScreen: React.FC = () => {
  const navigation = useNavigation();
  const searchUsers = useStore(s => s.searchUsers);
  const followUser = useStore(s => s.followUser);
  const unfollowUser = useStore(s => s.unfollowUser);
  const currentUser = useStore(s => s.currentUser);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const route = useRoute<any>();

  useEffect(() => {
    const initial = route.params?.initialQuery;
    if (initial && initial !== query) {
      setQuery(initial);
    }
  }, [route.params?.initialQuery]);
  useEffect(() => {
    let active = true;
    const run = async () => {
      if (query.trim().length < 2) { setResults([]); return; }
      const r = await searchUsers(query.trim());
      if (active) setResults(r);
    };
    const id = setTimeout(run, 250);
    return () => { active = false; clearTimeout(id); };
  }, [query]);

  return (
    <SafeAreaView style={styles.container}>
      <TopBar
        title="Search"
        searchPlaceholder="Search runners"
        searchAccessibilityLabel="Search runners"
        searchValue={query}
        onChangeSearch={setQuery}
        onClearSearch={() => setQuery('')}
      />
      <FlatList
        data={results}
        keyExtractor={(i) => i.id}
        ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: colors.border }} />}
        renderItem={({ item }) => (
          <View style={styles.userRow}>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }} onPress={() => (navigation as any).navigate('RunnerProfile', { userId: item.id })}>
              <Avatar source={item.avatar || undefined} size={40} label={item.name || undefined} />
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <Text style={styles.name}>{item.name || 'Unnamed Runner'}</Text>
                <Text style={styles.handle}>{item.handle || ''}</Text>
              </View>
            </TouchableOpacity>
            {item.id !== currentUser.id && (
              <TouchableOpacity
                style={styles.followBtn}
                onPress={async () => {
                  if (item.__following) {
                    const ok = await unfollowUser(item.id);
                    if (ok) setResults(prev => prev.map(u => u.id === item.id ? { ...u, __following: false } : u));
                  } else {
                    const ok = await followUser(item.id);
                    if (ok) setResults(prev => prev.map(u => u.id === item.id ? { ...u, __following: true } : u));
                  }
                }}
              >
                <Text style={styles.followBtnText}>{item.__following ? 'Following' : 'Follow'}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  userRow: {
    flexDirection: 'row', alignItems: 'center', padding: spacing.md,
  },
  name: { ...typography.body, color: colors.text.primary },
  handle: { ...typography.caption, color: colors.muted },
  followBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  followBtnText: { ...typography.caption, color: colors.primary, fontWeight: '600' },
});


