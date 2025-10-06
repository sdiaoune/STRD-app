import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useStore } from '../state/store';
import { Chip } from '../components/Chip';
import { HostRow } from '../components/HostRow';
import { StickyBottomCTA } from '../components/StickyBottomCTA';
import { typography, spacing, colors } from '../theme';
import { formatEventDate, formatEventTime, formatDistance } from '../utils/format';

export const EventDetails: React.FC = () => {
  const route = useRoute<any>();
  const { eventId } = (route.params || {}) as { eventId: string };
  const { eventById, orgById } = useStore();
  const event = eventById(eventId);
  const organization = event ? orgById(event.orgId) : null;
  if (!event || !organization) return null;

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView contentContainerStyle={{ padding: spacing[4], paddingBottom: 120 }}>
        <View className="w-full aspect-video rounded-lg bg-surfaceAlt items-center justify-center mb-4 overflow-hidden">
          {event.coverImage ? (
            <Image source={{ uri: event.coverImage }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
          ) : (
            <Ionicons name="image" size={48} color={colors.textMuted} />
          )}
        </View>

        <HostRow name={organization.name} avatar={organization.logo} isPartner={organization.type === 'partner'} />

        <Text className="text-text mt-4" style={typography.h2}>
          {event.title}
        </Text>

        <View className="mt-4 space-y-2">
          <View className="flex-row items-center">
            <Ionicons name="calendar" size={20} color={colors.textMuted} />
            <Text className="ml-2 text-textMuted" style={typography.caption}>
              {formatEventDate(event.dateISO)} • {formatEventTime(event.dateISO)}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="location-outline" size={20} color={colors.textMuted} />
            <Text className="ml-2 text-textMuted" style={typography.caption}>
              {event.location.name}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="navigate" size={20} color={colors.textMuted} />
            <Text className="ml-2 text-textMuted" style={typography.caption}>
              {event.distanceFromUserKm == null ? 'Distance unavailable' : `${formatDistance(event.distanceFromUserKm)} away`}
            </Text>
          </View>
        </View>

        <View className="mt-6">
          <Text className="text-text mb-2" style={typography.h3}>Tags</Text>
          <View className="flex-row flex-wrap">
            {event.tags.map((t) => (
              <Chip key={t} label={t} style={{ marginRight: spacing[1], marginBottom: spacing[1] }} />
            ))}
          </View>
        </View>

        <View className="mt-6">
          <Text className="text-text mb-2" style={typography.h3}>Description</Text>
          <Text className="text-text" style={typography.body}>
            {event.description}
          </Text>
        </View>

        <View className="mt-6 items-center py-6 border border-dashed border-border rounded-lg">
          <Ionicons name="people" size={24} color={colors.textMuted} />
          <Text className="text-textMuted mt-2" style={typography.body}>
            Be the first to join. Invite friends →
          </Text>
        </View>
      </ScrollView>

      <StickyBottomCTA
        primaryLabel="Join Run"
        secondaryLabel="Set Reminder"
        onPrimary={() => {}}
        onSecondary={() => {}}
      />
    </SafeAreaView>
  );
};
