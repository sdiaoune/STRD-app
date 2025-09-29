import React from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { TimelineStackParamList, AppNavigationParamList } from '../types/navigation';

type TimelineScreenNavigationProp = NativeStackNavigationProp<TimelineStackParamList & AppNavigationParamList, 'TimelineList'>;
import { colors, spacing, typography } from '../theme';
// Removed tab bar height hook to avoid cross-screen state updates during render
import { RunPostCard } from '../components/RunPostCard';
import { EventCard } from '../components/EventCard';
import { EmptyState } from '../components/EmptyState';
import { useStore } from '../state/store';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../components/Avatar';

export const TimelineScreen: React.FC = () => {
  const navigation = useNavigation<TimelineScreenNavigationProp>();
  const { timelineItems, postById, eventById, currentUser } = useStore();
  const insets = useSafeAreaInsets();
  const tabBarHeight = insets.bottom;
  const [searchQuery, setSearchQuery] = React.useState('');

  const handlePostPress = (postId: string) => {
    navigation.navigate('PostDetails', { postId });
  };

  const handleEventPress = (eventId: string) => {
    navigation.navigate('EventDetails', { eventId });
  };

  const renderTimelineItem = (item: any) => {
    if (item.type === 'run') {
      const post = postById(item.refId);
      if (!post) return null;
      
      return (
        <RunPostCard
          key={item.refId}
          post={post}
          onPress={() => handlePostPress(item.refId)}
        />
      );
    } else if (item.type === 'event') {
      const event = eventById(item.refId);
      if (!event) return null;
      
      return (
        <EventCard
          key={item.refId}
          event={event}
          onPress={() => handleEventPress(item.refId)}
        />
      );
    }
    return null;
  };

  const handleSearchSubmit = () => {
    const query = searchQuery.trim();
    const parentNav = navigation.getParent<NavigationProp<Record<string, object | undefined>>>();
    if (query.length > 0) {
      parentNav?.navigate('Search', { screen: 'UserSearch', params: { initialQuery: query } });
    } else {
      parentNav?.navigate('Search');
    }
  };

  const handleProfilePress = () => {
    navigation.getParent<NavigationProp<Record<string, object | undefined>>>()?.navigate('Profile');
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={18} color={colors.muted} style={{ marginRight: spacing.sm }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search STRD"
              placeholderTextColor={colors.muted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              onSubmitEditing={handleSearchSubmit}
              autoCorrect={false}
              autoCapitalize="none"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} accessibilityRole="button" hitSlop={12}>
                <Ionicons name="close-circle" size={18} color={colors.muted} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity onPress={handleProfilePress} style={styles.profileButton} accessibilityRole="button" hitSlop={8}>
            <Avatar source={currentUser.avatar ?? undefined} size={36} label={currentUser.name ?? undefined} />
          </TouchableOpacity>
        </View>
        <Text style={styles.title}>Timeline</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: spacing.lg }]}
        showsVerticalScrollIndicator={false}
      >
        {timelineItems.length > 0 ? (
          timelineItems.map((item) => renderTimelineItem(item))
        ) : (
          <EmptyState
            icon="home-outline"
            title="No posts yet"
            message="Start running or check out events to see activity here"
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    textAlign: 'center',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.md,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    paddingVertical: spacing.xs,
  },
  profileButton: {
    borderRadius: spacing.lg,
    overflow: 'hidden',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
  },
});
