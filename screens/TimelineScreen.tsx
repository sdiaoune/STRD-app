import React from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { TimelineStackParamList, AppNavigationParamList } from '../types/navigation';

type TimelineScreenNavigationProp = NativeStackNavigationProp<TimelineStackParamList & AppNavigationParamList, 'TimelineList'>;
import { colors, spacing, typography, getCurrentThemeName, useTheme as useTokensTheme } from '../theme';
// Removed tab bar height hook to avoid cross-screen state updates during render
import { RunPostCard } from '../components/RunPostCard';
import { EventCard } from '../components/EventCard';
import EmptyState from '../components/ui/EmptyState';
import { useStore } from '../state/store';
import TopBar from '../components/ui/TopBar';

export const TimelineScreen: React.FC = () => {
  const navigation = useNavigation<TimelineScreenNavigationProp>();
  const tokensTheme = useTokensTheme();
  const { timelineItems, postById, eventById } = useStore();
  const reload = useStore(s => s._loadInitialData);
  const [refreshing, setRefreshing] = React.useState(false);
  const insets = useSafeAreaInsets();
  const tabBarHeight = insets.bottom;
  const themeName = useStore(s => s.themePreference);
  const themedStyles = React.useMemo(() => createStyles(), [themeName, getCurrentThemeName()]);

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

  return (
    <SafeAreaView
      style={[
        themedStyles.container,
        { backgroundColor: tokensTheme.mode === 'light' ? tokensTheme.colors.surface : tokensTheme.colors.bg },
      ]}
      edges={["top"]}
    >
      <TopBar
        title="Timeline"
        leftIcon={{ icon: 'search', accessibilityLabel: 'Search', onPress: () => (navigation as any).navigate('Search' as never) }}
        rightActions={[{ icon: 'settings-outline', accessibilityLabel: 'Settings', onPress: () => (navigation as any).navigate('Profile' as never, { screen: 'Settings' } as never) }]}
        rightAvatar={{ source: (useStore.getState().currentUser?.avatar) || '', label: useStore.getState().currentUser?.name || 'Profile', onPress: () => (navigation as any).navigate('Profile' as never) }}
      />

      <ScrollView
        style={[themedStyles.scrollView, { backgroundColor: tokensTheme.mode === 'light' ? tokensTheme.colors.surface : tokensTheme.colors.bg }]}
        contentContainerStyle={[themedStyles.scrollContent, { paddingBottom: spacing.lg + insets.bottom + spacing.md, backgroundColor: tokensTheme.mode === 'light' ? tokensTheme.colors.surface : tokensTheme.colors.bg }]}
        contentInsetAdjustmentBehavior="never"
        automaticallyAdjustContentInsets={false}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              try { setRefreshing(true); await reload(); } finally { setRefreshing(false); }
            }}
            tintColor={tokensTheme.colors.primary}
          />
        }
      >
        {timelineItems.length > 0 ? (
          timelineItems.map((item) => renderTimelineItem(item))
        ) : (
          <EmptyState icon="home-outline" title="No posts yet" body="Start running or check out events to see activity here" />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = () =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    header: {},
    headerTop: {},
    title: {},
    scrollView: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    scrollContent: {
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.lg,
    },
  });

const styles = createStyles();
