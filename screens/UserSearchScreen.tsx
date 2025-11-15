import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors, spacing, borderRadius, typography, useTheme as useTokensTheme } from '../theme';
import { useLegacyStyles } from '../theme/useLegacyStyles';
import { useStore } from '../state/store';
import TopBar from '../components/ui/TopBar';
import { Avatar } from '../components/Avatar';
import Input from '../src/design/components/Input';
import { openUserProfile } from '../utils/openUserProfile';
import CertifiedBadge from '../components/CertifiedBadge';
import { SegmentedControl } from '../components/SegmentedControl';

const SEGMENTS = ['People', 'Organizations'] as const;
type SegmentLabel = typeof SEGMENTS[number];
type SearchMode = 'people' | 'organizations';

const segmentLabelByMode: Record<SearchMode, SegmentLabel> = {
  people: 'People',
  organizations: 'Organizations',
};

const modeBySegmentLabel: Record<SegmentLabel, SearchMode> = {
  People: 'people',
  Organizations: 'organizations',
};

const ORG_TYPE_LABELS: Record<string, string> = {
  community: 'Community',
  partner: 'Partner',
  sponsor: 'Sponsor',
  run_club: 'Run Club',
};

const getOrgTypeLabel = (type?: string | null) => ORG_TYPE_LABELS[type ?? ''] || 'Organization';

export const UserSearchScreen: React.FC = () => {
  const navigation = useNavigation();
  const searchUsers = useStore(s => s.searchUsers);
  const searchOrganizations = useStore(s => s.searchOrganizations);
  const followUser = useStore(s => s.followUser);
  const unfollowUser = useStore(s => s.unfollowUser);
  const followPage = useStore(s => s.followPage);
  const unfollowPage = useStore(s => s.unfollowPage);
  const currentUser = useStore(s => s.currentUser);
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<SearchMode>('people');
  const [results, setResults] = useState<{ people: any[]; organizations: any[] }>({
    people: [],
    organizations: [],
  });
  const route = useRoute<any>();
  const styles = useLegacyStyles(createStyles);
  const tokensTheme = useTokensTheme();

  useEffect(() => {
    const initial = route.params?.initialQuery;
    if (initial && initial !== query) {
      setQuery(initial);
    }
  }, [route.params?.initialQuery]);
  useEffect(() => {
    let active = true;
    const run = async () => {
      const trimmed = query.trim();
      if (trimmed.length < 2) {
        setResults(prev => ({ ...prev, [mode]: [] }));
        return;
      }
      const r = mode === 'people'
        ? await searchUsers(trimmed)
        : await searchOrganizations(trimmed);
      if (active) setResults(prev => ({ ...prev, [mode]: r }));
    };
    const id = setTimeout(run, 250);
    return () => { active = false; clearTimeout(id); };
  }, [query, mode, searchOrganizations, searchUsers]);

  const trimmedQuery = query.trim();
  const visibleResults = mode === 'people' ? results.people : results.organizations;
  const searchTargetLabel = mode === 'people' ? 'people' : 'organizations';
  const placeholderText = mode === 'people' ? 'Search people' : 'Search organizations';
  const emptyText = trimmedQuery.length < 2
    ? `Type at least 2 characters to search ${searchTargetLabel}`
    : `No ${searchTargetLabel} found`;

  const handleModeChange = (label: string) => {
    const nextMode = modeBySegmentLabel[label as SegmentLabel];
    if (!nextMode || nextMode === mode) return;
    setMode(nextMode);
  };

  const toggleUserFollow = async (userId: string, currentlyFollowing: boolean) => {
    if (currentlyFollowing) {
      const ok = await unfollowUser(userId);
      if (!ok) return;
      setResults(prev => ({
        ...prev,
        people: prev.people.map(u => u.id === userId ? { ...u, __following: false } : u),
      }));
    } else {
      const ok = await followUser(userId);
      if (!ok) return;
      setResults(prev => ({
        ...prev,
        people: prev.people.map(u => u.id === userId ? { ...u, __following: true } : u),
      }));
    }
  };

  const toggleOrgFollow = async (orgId: string, currentlyFollowing: boolean) => {
    if (currentlyFollowing) {
      const ok = await unfollowPage(orgId);
      if (!ok) return;
      setResults(prev => ({
        ...prev,
        organizations: prev.organizations.map(o => o.id === orgId ? { ...o, __following: false } : o),
      }));
    } else {
      const ok = await followPage(orgId);
      if (!ok) return;
      setResults(prev => ({
        ...prev,
        organizations: prev.organizations.map(o => o.id === orgId ? { ...o, __following: true } : o),
      }));
    }
  };

  const renderUserRow = (item: any) => (
    <View style={styles.userRow}>
      <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }} onPress={() => openUserProfile(navigation as any, item.id)}>
        <Avatar source={item.avatar || undefined} size={40} label={item.name || undefined} />
        <View style={{ flex: 1, marginLeft: spacing.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.name}>{item.name || 'Unnamed Runner'}</Text>
            {item.isCertified ? <CertifiedBadge /> : null}
          </View>
          <Text style={styles.handle}>{item.handle || ''}</Text>
        </View>
      </TouchableOpacity>
      {item.id !== currentUser.id && (
        <TouchableOpacity
          style={styles.followBtn}
          onPress={() => toggleUserFollow(item.id, !!item.__following)}
        >
          <Text style={styles.followBtnText}>{item.__following ? 'Following' : 'Follow'}</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderOrganizationRow = (item: any) => (
    <View style={styles.userRow}>
      <TouchableOpacity
        style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
        onPress={() => (navigation as any).navigate('BusinessProfile' as never, { orgId: item.id } as never)}
      >
        <Avatar source={item.logo || undefined} size={40} label={item.name || undefined} />
        <View style={{ flex: 1, marginLeft: spacing.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.name}>{item.name || 'Organization'}</Text>
            {item.isCertified ? <CertifiedBadge /> : null}
          </View>
          <Text style={styles.orgCity}>{item.city}</Text>
          <View style={styles.typePill}>
            <Text style={styles.typePillText}>{getOrgTypeLabel(item.type)}</Text>
          </View>
        </View>
      </TouchableOpacity>
      {item.ownerId !== currentUser.id && (
        <TouchableOpacity
          style={styles.followBtn}
          onPress={() => toggleOrgFollow(item.id, !!item.__following)}
        >
          <Text style={styles.followBtnText}>{item.__following ? 'Following' : 'Follow'}</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: tokensTheme.mode === 'light' ? tokensTheme.colors.surface : tokensTheme.colors.bg },
      ]}
    >
      <TopBar
        title="Search"
        leftIcon={{ icon: 'search', accessibilityLabel: 'Search', onPress: () => {} }}
        rightActions={[{ icon: 'settings-outline', accessibilityLabel: 'Settings', onPress: () => (navigation as any).navigate('Settings' as never) }]}
        rightAvatar={{ source: (useStore.getState().currentUser?.avatar) || '', label: useStore.getState().currentUser?.name || 'Profile', onPress: () => (navigation as any).navigate('Profile' as never) }}
      />
      <FlatList
        data={visibleResults}
        keyExtractor={(i) => i.id}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={(
          <View style={styles.listHeader}>
            <SegmentedControl
              segments={Array.from(SEGMENTS)}
              value={segmentLabelByMode[mode]}
              onChange={handleModeChange}
            />
            <Input
              containerProps={{ style: styles.searchField }}
              value={query}
              onChangeText={setQuery}
              placeholder={placeholderText}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              leftAdornment={<Ionicons name="search" size={18} color={colors.text.secondary} />}
            />
          </View>
        )}
        ListEmptyComponent={(
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              {emptyText}
            </Text>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: colors.border }} />}
        renderItem={({ item }) => (mode === 'people' ? renderUserRow(item) : renderOrganizationRow(item))}
      />
    </SafeAreaView>
  );
};

const createStyles = () => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  listHeader: { paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: spacing.sm },
  searchField: { marginTop: spacing.sm },
  userRow: {
    flexDirection: 'row', alignItems: 'center', padding: spacing.md,
  },
  name: { ...typography.body, color: colors.text.primary },
  handle: { ...typography.caption, color: colors.text.secondary },
  orgCity: { ...typography.caption, color: colors.text.secondary, marginTop: spacing.xs },
  typePill: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  typePillText: { ...typography.caption, color: colors.text.primary, fontWeight: '600' },
  followBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  followBtnText: { ...typography.caption, color: colors.primary, fontWeight: '600' },
  emptyState: { padding: spacing.lg },
  emptyText: { ...typography.caption, color: colors.text.secondary, textAlign: 'center' },
});


