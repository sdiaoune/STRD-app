import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SegmentedControl } from '../components/SegmentedControl';
import { EventCard } from '../components/EventCard';
import { useStore } from '../state/store';
import { typography, spacing } from '../tokens';

export const Events: React.FC = () => {
  const { currentUser, eventFilter, filterEvents, getFilteredEvents } = useStore();
  const events = getFilteredEvents();

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <View className="px-4 pt-4 pb-2">
        <Text className="text-text" style={typography.h1}>
          STRD — {currentUser.city}
        </Text>
      </View>
      <View className="px-4 pb-4">
        <SegmentedControl
          segments={['For You', 'All']}
          value={eventFilter === 'forYou' ? 'For You' : 'All'}
          onChange={(v) => filterEvents(v === 'For You' ? 'forYou' : 'all')}
        />
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing[4], paddingBottom: spacing[7] }}>
        {events.map((event) => (
          <EventCard key={event.id} event={event} onPress={() => {}} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};
