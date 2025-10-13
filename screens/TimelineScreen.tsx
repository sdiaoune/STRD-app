import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { TimelineStackParamList, AppNavigationParamList } from '../types/navigation';

type TimelineScreenNavigationProp = NativeStackNavigationProp<TimelineStackParamList & AppNavigationParamList, 'TimelineList'>;
import { colors, spacing, typography, getCurrentThemeName } from '../theme';
// Removed tab bar height hook to avoid cross-screen state updates during render
import { RunPostCard } from '../components/RunPostCard';
import { EventCard } from '../components/EventCard';
import { EmptyState } from '../components/EmptyState';
import { useStore } from '../state/store';
import TopBar from '../components/TopBar';

export const TimelineScreen: React.FC = () => {
  const navigation = useNavigation<TimelineScreenNavigationProp>();
  const { timelineItems, postById, eventById } = useStore();
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
    <SafeAreaView style={themedStyles.container} edges={["top"]}>
      <TopBar
        title="Timeline"
      />

      <ScrollView
        style={themedStyles.scrollView}
        contentContainerStyle={[themedStyles.scrollContent, { paddingBottom: spacing.lg + insets.bottom + spacing.md }]}
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
    },
    scrollContent: {
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.lg,
    },
  });

const styles = createStyles();
