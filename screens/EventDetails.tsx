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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: spacing[4], paddingBottom: 120 }}>
        <View style={{ width: '100%', aspectRatio: 16/9, borderRadius: 12, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', marginBottom: spacing[4], overflow: 'hidden' }}>
          {event.coverImage ? (
            <Image source={{ uri: event.coverImage }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
          ) : (
            <Ionicons name="image" size={48} color={colors.textMuted} />
          )}
        </View>

        <HostRow name={organization.name} avatar={organization.logo} isPartner={organization.type === 'partner'} />

        <Text style={[typography.h2, { color: colors.text.primary, marginTop: spacing[4] }]}>
          {event.title}
        </Text>

        <View className="mt-4 space-y-2">
          <View className="flex-row items-center">
            <Ionicons name="calendar" size={20} color={colors.icon.secondary} />
            <Text style={[typography.caption, { color: colors.text.muted, marginLeft: spacing[2] }]}>
              {formatEventDate(event.dateISO)} • {formatEventTime(event.dateISO)}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="location-outline" size={20} color={colors.icon.secondary} />
            <Text style={[typography.caption, { color: colors.text.muted, marginLeft: spacing[2] }]}>
              {event.location.name}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="navigate" size={20} color={colors.icon.secondary} />
            <Text style={[typography.caption, { color: colors.text.muted, marginLeft: spacing[2] }]}>
              {event.distanceFromUserKm == null ? 'Distance unavailable' : `${formatDistance(event.distanceFromUserKm)} away`}
            </Text>
          </View>
        </View>

        <View className="mt-6">
          <Text style={[typography.h3, { color: colors.text.primary, marginBottom: spacing[2] }]}>Tags</Text>
          <View className="flex-row flex-wrap">
            {event.tags.map((t) => (
              <Chip key={t} label={t} style={{ marginRight: spacing[1], marginBottom: spacing[1] }} />
            ))}
          </View>
        </View>

        <View className="mt-6">
          <Text style={[typography.h3, { color: colors.text.primary, marginBottom: spacing[2] }]}>Description</Text>
          <Text style={[typography.body, { color: colors.text.primary }]}>
            {event.description}
          </Text>
        </View>

        <View style={{ marginTop: spacing[6], alignItems: 'center', paddingVertical: spacing[6], borderWidth: 1, borderStyle: 'dashed', borderColor: colors.border, borderRadius: 12 }}>
          <Ionicons name="people" size={24} color={colors.icon.secondary} />
          <Text style={[typography.body, { color: colors.text.muted, marginTop: spacing[2] }]}>
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
