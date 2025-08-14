import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EventCard } from '../components/EventCard';
import { RunPostCard } from '../components/RunPostCard';
import { useStore } from '../state/store';
import { colors, spacing, typography } from '../theme';
import { useBottomTabOverflow } from '../components/ui/TabBarBackground';

export const Timeline: React.FC = () => {
  const { timelineItems, postById, eventById } = useStore();
  const tabBarHeight = useBottomTabOverflow?.() ?? 0;

  const renderItem = (item: any) => {
    if (item.type === 'run') {
      const post = postById(item.refId);
      if (!post) return null;
      return <RunPostCard key={item.refId} post={post} onPress={() => {}} />;
    }
    const event = eventById(item.refId);
    if (!event) return null;
    return <EventCard key={item.refId} event={event} onPress={() => {}} />;
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Timeline</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: spacing.lg }]}
        showsVerticalScrollIndicator={false}
      >
        {timelineItems.map(renderItem)}
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
    paddingBottom: spacing.lg,
  },
});
