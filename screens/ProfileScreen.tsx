import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ProfileStackParamList, AppNavigationParamList } from '../types/navigation';

type ProfileScreenNavigationProp = NativeStackNavigationProp<ProfileStackParamList & AppNavigationParamList, 'UserProfile'>;
import { colors, spacing, typography } from '../theme';
import { Avatar } from '../components/Avatar';
import { StatsRow } from '../components/StatsRow';
import { RunPostCard } from '../components/RunPostCard';
import { EventCard } from '../components/EventCard';
import { EmptyState } from '../components/EmptyState';
import { useStore } from '../state/store';

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { currentUser, runPosts, events, postById, eventById } = useStore();

  // Calculate user stats
  const userRuns = runPosts.filter(post => post.userId === currentUser.id);
  const totalRuns = userRuns.length;
  const totalDistance = userRuns.reduce((sum, run) => sum + run.distanceKm, 0);
  const weeklyStreak = Math.floor(Math.random() * 7) + 1; // Mock data

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
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <Avatar source={currentUser.avatar} size={80} label={currentUser.name} />
          <Text style={styles.userName}>{currentUser.name}</Text>
          <Text style={styles.userHandle}>{currentUser.handle}</Text>
          <Text style={styles.userBio} numberOfLines={2} ellipsizeMode="tail">
            Passionate runner from {currentUser.city}. Always looking for new challenges and great routes!
          </Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsContainer}>
          <StatsRow
            stats={[
              { label: 'Total Runs', value: totalRuns },
              { label: 'Weekly Streak', value: weeklyStreak },
              { label: 'Total Distance', value: `${totalDistance.toFixed(1)} km` }
            ]}
          />
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

const styles = StyleSheet.create({
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
    color: colors.text,
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
    color: colors.text,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing.lg,
  },
  statsContainer: {
    padding: spacing.md,
  },
  recentPostsSection: {
    padding: spacing.md,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.md,
  },
});
