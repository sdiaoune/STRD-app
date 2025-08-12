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
    <Card onPress={onPress} style={{ marginBottom: spacing[3], position: 'relative' }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing[2] }}>
        <View style={{ flex: 1 }}>
          <Text accessibilityRole="header" numberOfLines={1} style={[typography.caption, { color: colors.text.primary }]}>
            {organization?.name}
          </Text>
          {organization?.type === 'partner' && (
            <Badge label="Partner" style={{ marginTop: spacing[1], alignSelf: 'flex-start' }} />
          )}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="location" size={20} color={colors.text.muted} />
          <Text style={[typography.caption, { color: colors.text.secondary, marginLeft: spacing[2] }]}
                accessibilityLabel={`Distance ${formatDistance(event.distanceFromUserKm)}`}>
            {formatDistance(event.distanceFromUserKm)}
          </Text>
        </View>
      </View>

      <View style={{ marginBottom: spacing[2] }}>
        <Text numberOfLines={2} style={[typography.h2, { color: colors.text.primary }]}> 
          {event.title}
        </Text>
      </View>

      <View style={{ marginBottom: spacing[2] }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing[1] }}>
          <Ionicons name="calendar" size={20} color={colors.text.muted} />
          <Text style={[typography.caption, { color: colors.text.secondary, marginLeft: spacing[2] }]}>
            {formatEventDate(event.dateISO)} • {formatEventTime(event.dateISO)}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="location-outline" size={20} color={colors.text.muted} />
          <Text numberOfLines={1} style={[typography.caption, { color: colors.text.secondary, marginLeft: spacing[2] }]}
                accessibilityLabel={`Location ${event.location.name}`}>
            {event.location.name}
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {event.tags.slice(0, 3).map((tag) => (
          <Chip 
            key={tag} 
            label={tag} 
            style={{ marginRight: spacing[1], marginBottom: spacing[1] }} 
          />
        ))}
        {event.tags.length > 3 && (
          <Chip label={`+${event.tags.length - 3}`} />
        )}
      </View>

      {/* Distance badge anchored above now present */}
    </Card>
  );
};
