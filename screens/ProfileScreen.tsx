import React from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ProfileStackParamList, AppNavigationParamList } from '../types/navigation';

type ProfileScreenNavigationProp = NativeStackNavigationProp<ProfileStackParamList & AppNavigationParamList, 'UserProfile'>;
import { colors, spacing, typography } from '../theme';
import { useLegacyStyles } from '../theme/useLegacyStyles';
import { Avatar } from '../components/Avatar';
import * as ImagePicker from 'expo-image-picker';
import { StatsRow } from '../components/StatsRow';
import { RunPostCard } from '../components/RunPostCard';
import { EventCard } from '../components/EventCard';
import { EmptyState } from '../components/EmptyState';
import { useStore } from '../state/store';
import Stat from '../components/ui/Stat';
import { formatDistance as fmtDistance } from '../utils/formatters';

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const { currentUser, runPosts, events, postById, eventById } = useStore();
  const unit = useStore(state => state.unitPreference);
  const updateProfile = useStore(state => state.updateProfile);
  const [editingName, setEditingName] = React.useState(false);
  const [editingBio, setEditingBio] = React.useState(false);
  const [nameDraft, setNameDraft] = React.useState(currentUser.name || '');
  const [bioDraft, setBioDraft] = React.useState(currentUser.bio || '');
  const signOut = useStore(state => state.signOut);
  const uploadAvatar = useStore(state => state.uploadAvatar);
  const [uploading, setUploading] = React.useState(false);
  const styles = useLegacyStyles(createStyles);

  const handleChangeAvatar = async () => {
    try {
      setUploading(true);
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'We need access to your photos to update the profile picture.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });
      if (!result.canceled && result.assets?.length) {
        const ok = await uploadAvatar(result.assets[0].uri);
        if (!ok) {
          Alert.alert('Upload failed', 'Unable to update your photo. Please try again.');
        }
      }
    } finally {
      setUploading(false);
    }
  };

  // Calculate user stats
  const userRuns = runPosts.filter(post => post.userId === currentUser.id);
  const totalRuns = userRuns.length;
  const totalDistance = userRuns.reduce((sum, run) => sum + run.distanceKm, 0);
  // Calculate ISO week streak: consecutive weeks up to the current week with >=1 run
  const getIsoWeekKey = (date: Date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7; // 1..7, with Monday=1
    d.setUTCDate(d.getUTCDate() + 4 - dayNum); // Thursday in current week
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
  };

  const runWeeks = React.useMemo(() => {
    const s = new Set<string>();
    userRuns.forEach(r => {
      const dt = new Date(r.createdAtISO);
      if (!isNaN(dt.getTime())) s.add(getIsoWeekKey(dt));
    });
    return s;
  }, [userRuns]);

  const weeklyStreak = React.useMemo(() => {
    if (runWeeks.size === 0) return 0;
    let count = 0;
    let cursor = new Date();
    // Start from current week; if no runs this week streak is 0
    while (true) {
      const key = getIsoWeekKey(cursor);
      if (!runWeeks.has(key)) break;
      count += 1;
      cursor = new Date(cursor.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    return count;
  }, [runWeeks]);

  // Get user's recent posts (runs and events they posted)
  const userEvents = events.filter(event => {
    // Mock: assume user posted some events
    return Math.random() > 0.7;
  });

  const recentPosts = [
    ...userRuns.slice(0, 3).map(run => ({ type: 'run' as const, data: run })),
    ...userEvents.slice(0, 2).map(event => ({ type: 'event' as const, data: event }))
  ].sort((a, b) => {
    const aDate = a.type === 'run' ? a.data.createdAtISO : a.data.dateISO;
    const bDate = b.type === 'run' ? b.data.createdAtISO : b.data.dateISO;
    return new Date(bDate).getTime() - new Date(aDate).getTime();
  }).slice(0, 5);

  const handlePostPress = (postId: string) => {
    navigation.navigate('PostDetails', { postId });
  };

  const handleEventPress = (eventId: string) => {
    navigation.navigate('EventDetails', { eventId });
  };

  const renderRecentPost = (item: any) => {
    if (item.type === 'run') {
      return (
        <RunPostCard
          key={item.data.id}
          post={item.data}
          onPress={() => handlePostPress(item.data.id)}
        />
      );
    } else if (item.type === 'event') {
      return (
        <EventCard
          key={item.data.id}
          event={item.data}
          onPress={() => handleEventPress(item.data.id)}
        />
      );
    }
    return null;
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: spacing.lg + insets.bottom + spacing.md }} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={{ alignItems: 'center' }}>
            <Avatar source={currentUser.avatar ?? undefined} size={80} label={currentUser.name ?? undefined} />
            <Text onPress={handleChangeAvatar} style={styles.changePhoto} accessibilityRole="button">
              {uploading ? 'Uploading…' : 'Change photo'}
            </Text>
          </View>
          {editingName ? (
            <View style={styles.inlineFieldRow}>
              <TextInput
                value={nameDraft}
                onChangeText={setNameDraft}
                style={styles.inlineInput}
                placeholder="Your name"
                placeholderTextColor={colors.muted}
              />
              <TouchableOpacity onPress={async () => { if (await updateProfile({ name: nameDraft.trim() || null })) setEditingName(false); }} style={styles.inlineAction}>
                <Text style={styles.inlineActionText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setNameDraft(currentUser.name || ''); setEditingName(false); }} style={styles.inlineAction}>
                <Text style={styles.inlineActionText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={() => setEditingName(true)}>
              <Text style={styles.userName}>{currentUser.name || 'Set your name'}</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.userHandle}>{currentUser.handle}</Text>
          {editingBio ? (
            <View style={styles.inlineFieldCol}>
              <TextInput
                value={bioDraft}
                onChangeText={setBioDraft}
                style={[styles.inlineInput, { height: 80, textAlignVertical: 'top' }]}
                placeholder="Add a short bio"
                placeholderTextColor={colors.muted}
                multiline
              />
              <View style={{ flexDirection: 'row', marginTop: spacing.sm }}>
                <TouchableOpacity onPress={async () => { if (await updateProfile({ bio: bioDraft.trim() || null })) setEditingBio(false); }} style={styles.inlineAction}>
                  <Text style={styles.inlineActionText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setBioDraft(currentUser.bio || ''); setEditingBio(false); }} style={styles.inlineAction}>
                  <Text style={styles.inlineActionText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity onPress={() => setEditingBio(true)}>
              <Text style={styles.userBio} numberOfLines={2} ellipsizeMode="tail">
                {currentUser.bio || `Passionate runner from ${currentUser.city || ''}. Always looking for new challenges and great routes!`}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Stats Row */}
        <View style={[styles.statsContainer, { flexDirection: 'row', justifyContent: 'space-around' }]}>
          <Stat icon="walk" value={String(totalRuns)} label="Runs" />
          <Stat icon="flame" value={`${weeklyStreak}-week`} label="Streak" />
          <Stat icon="map" value={fmtDistance(totalDistance * 1000)} label="Total" />
        </View>

        {/* Recent Posts */}
        <View style={styles.recentPostsSection}>
          <Text style={styles.sectionTitle}>Recent Posts</Text>
          
          {recentPosts.length > 0 ? (
            recentPosts.map((item) => renderRecentPost(item))
          ) : (
            <EmptyState
              icon="document-outline"
              title="No posts yet"
              message="Start running or create events to see your activity here"
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = () => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    padding: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  userName: {
    ...typography.h2,
    color: colors.text.primary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  userHandle: {
    ...typography.body,
    color: colors.muted,
    marginBottom: spacing.md,
  },
  userBio: {
    ...typography.body,
    color: colors.text.primary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing.lg,
  },
  inlineFieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  inlineFieldCol: {
    width: '100%',
    marginTop: spacing.sm,
    alignItems: 'center',
  },
  inlineInput: {
    flex: 1,
    minWidth: 220,
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    color: colors.text.primary,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  inlineAction: {
    marginLeft: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 10,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inlineActionText: {
    ...typography.caption,
    color: colors.primary,
  },
  statsContainer: {
    padding: spacing.md,
  },
  recentPostsSection: {
    padding: spacing.md,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  changePhoto: {
    ...typography.caption,
    color: colors.primary,
    marginTop: spacing.sm,
    textDecorationLine: 'underline',
  },
  footerActions: {},
  footerRow: {},
});
