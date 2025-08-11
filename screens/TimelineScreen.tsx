import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { TimelineStackParamList, AppNavigationParamList } from '../types/navigation';

type TimelineScreenNavigationProp = NativeStackNavigationProp<TimelineStackParamList & AppNavigationParamList, 'TimelineList'>;
import { colors, spacing, typography } from '../theme';
import { RunPostCard } from '../components/RunPostCard';
import { EventCard } from '../components/EventCard';
import { EmptyState } from '../components/EmptyState';
import { useStore } from '../state/store';

export const TimelineScreen: React.FC = () => {
  const navigation = useNavigation<TimelineScreenNavigationProp>();
  const { timelineItems, postById, eventById } = useStore();

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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Timeline</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
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
  title: {
    ...typography.h1,
    color: colors.text,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
});
