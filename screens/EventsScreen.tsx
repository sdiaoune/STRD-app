import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { EventsStackParamList } from '../types/navigation';

type EventsScreenNavigationProp = NativeStackNavigationProp<EventsStackParamList, 'EventsList'>;
import { colors, spacing, typography } from '../theme';
import { SegmentedControl } from '../components/SegmentedControl';
import { EventCard } from '../components/EventCard';
import { EmptyState } from '../components/EmptyState';
import { useStore } from '../state/store';

export const EventsScreen: React.FC = () => {
  const navigation = useNavigation<EventsScreenNavigationProp>();
  const { 
    currentUser, 
    eventFilter, 
    filterEvents, 
    getFilteredEvents 
  } = useStore();

  const events = getFilteredEvents();

  const handleFilterChange = (index: number) => {
    const scope = index === 0 ? 'forYou' : 'all';
    filterEvents(scope);
  };

  const handleEventPress = (eventId: string) => {
    navigation.navigate('EventDetails', { eventId });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>STRD — {currentUser.city}</Text>
      </View>

      <View style={styles.segmentedContainer}>
        <SegmentedControl
          options={['For You', 'All']}
          selectedIndex={eventFilter === 'forYou' ? 0 : 1}
          onSelect={handleFilterChange}
        />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
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
  segmentedContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
});
