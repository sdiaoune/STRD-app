import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { EventsStackParamList } from '../types/navigation';

type EventsScreenNavigationProp = NativeStackNavigationProp<EventsStackParamList, 'EventsList'>;
import { colors, spacing, typography } from '../theme';
// Removed tab bar height hook to avoid cross-screen state updates during render
import { SegmentedControl } from '../components/SegmentedControl';
import { EventCard } from '../components/EventCard';
import { EmptyState } from '../components/EmptyState';
import { useStore } from '../state/store';
import TopBar from '../components/TopBar';

export const EventsScreen: React.FC = () => {
  const navigation = useNavigation<EventsScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const tabBarHeight = insets.bottom;
  const { 
    currentUser, 
    eventFilter, 
    filterEvents, 
    getFilteredEvents 
  } = useStore();

  const events = getFilteredEvents();

  const handleEventPress = (eventId: string) => {
    navigation.navigate('EventDetails', { eventId });
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <TopBar title={`STRD — ${currentUser.city}`} />

      <View style={styles.segmentedContainer}>
        <SegmentedControl
          segments={['All', 'For You']}
          value={eventFilter === 'forYou' ? 'For You' : 'All'}
          onChange={(value) => {
            const scope = value === 'For You' ? 'forYou' : 'all';
            filterEvents(scope);
          }}
        />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: spacing.lg }]}
        showsVerticalScrollIndicator={false}
      >
        {events.length > 0 ? (
          events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onPress={() => handleEventPress(event.id)}
            />
          ))
        ) : (
          <EmptyState
            icon="calendar-outline"
            title="No events found"
            message={
              eventFilter === 'forYou' 
                ? "Follow organizations or update your interests to see personalized events"
                : "No events are currently available"
            }
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
  header: {},
  title: {},
  segmentedContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
  },
});
