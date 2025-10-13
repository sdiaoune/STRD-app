import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { EventsStackParamList } from '../types/navigation';

type EventsScreenNavigationProp = NativeStackNavigationProp<EventsStackParamList, 'EventsList'>;
import { colors, spacing, typography } from '../theme';
import { useLegacyStyles } from '../theme/useLegacyStyles';
// Removed tab bar height hook to avoid cross-screen state updates during render
import SegmentedControl from '../components/ui/SegmentedControl';
import { EventCard } from '../components/EventCard';
import EmptyState from '../components/ui/EmptyState';
import { useStore } from '../state/store';
import TopBar from '../components/ui/TopBar';
import * as Location from 'expo-location';

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

  const [locationLabel, setLocationLabel] = React.useState<string>(currentUser?.city || '');
  const styles = useLegacyStyles(createStyles);

  React.useEffect(() => {
    if (!locationLabel) {
      (async () => {
        try {
          const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced } as any);
          const list = await Location.reverseGeocodeAsync({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
          const city = (list && list[0] && (list[0].city || list[0].district || list[0].subregion)) || '';
          if (city) setLocationLabel(city);
        } catch {
          // silently ignore if permission not granted or reverse geocode fails
        }
      })();
    }
  }, [locationLabel]);

  const handleEventPress = (eventId: string) => {
    navigation.navigate('EventDetails', { eventId });
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <TopBar
        title={locationLabel || 'Events'}
        leftIcon={{ icon: 'search', accessibilityLabel: 'Search', onPress: () => (navigation as any).navigate('Search' as never) }}
        rightActions={[{ icon: 'settings-outline', accessibilityLabel: 'Settings', onPress: () => (navigation as any).navigate('Profile' as never, { screen: 'Settings' } as never) }]}
        rightAvatar={{ source: (useStore.getState().currentUser?.avatar) || '', label: useStore.getState().currentUser?.name || 'Profile', onPress: () => (navigation as any).navigate('Profile' as never) }}
      />

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
            title="No events yet"
            body={
              eventFilter === 'forYou'
                ? 'Set your interests or follow local clubs to see Charlotte runs.'
                : 'No events are currently available'
            }
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = () => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
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
