import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './Card';
import { Chip } from './Chip';
import { Badge } from './Badge';
import { spacing, typography, colors } from '../tokens';
import { formatEventDate, formatEventTime, formatDistance } from '../utils/format';
import type { Event } from '../data/mock';
import { useStore } from '../state/store';

interface Props {
  event: Event;
  onPress: () => void;
}

export const EventCard: React.FC<Props> = ({ event, onPress }) => {
  const orgById = useStore((s) => s.orgById);
  const organization = orgById(event.orgId);

  return (
    <Card onPress={onPress} className="mb-3 relative">
      <View className="flex-row justify-between mb-2">
        <View className="flex-1">
          <Text className="text-text" style={typography.caption}>
            {organization?.name}
          </Text>
          {organization?.type === 'partner' && <Badge label="Partner" className="mt-1" />}
        </View>
        <View className="flex-row items-center">
          <Ionicons name="location" size={20} color={colors.textMuted} />
          <Text className="ml-2 text-textMuted" style={typography.caption}>
            {formatDistance(event.distanceFromUserKm)}
          </Text>
        </View>
      </View>

      <Text className="text-text mb-2" style={typography.h3}>
        {event.title}
      </Text>

      <View className="mb-2">
        <View className="flex-row items-center mb-1">
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
      </View>

      <View className="flex-row flex-wrap">
        {event.tags.slice(0, 3).map((tag) => (
          <Chip key={tag} label={tag} style={{ marginRight: spacing[1], marginBottom: spacing[1] }} />
        ))}
      </View>

      <Ionicons
        name="chevron-forward"
        size={24}
        color={colors.textMuted}
        style={{ position: 'absolute', right: spacing[4] - 4, top: spacing[4] - 4 }}
      />
    </Card>
  );
};
