import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../theme';
import { Avatar } from './Avatar';
import { TagPill } from './TagPill';
import { formatEventDate, formatEventTime, formatDistance } from '../utils/format';
import { useStore } from '../state/store';
import type { Event } from '../data/mock';

interface EventCardProps {
  event: Event;
  onPress: () => void;
  style?: any;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onPress, style }) => {
  const orgById = useStore(state => state.orgById);
  const organization = orgById(event.orgId);

  return (
    <TouchableOpacity 
      style={[styles.container, style]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.orgInfo}>
          <Avatar source={organization?.logo || ''} size={32} />
          <View style={styles.orgDetails}>
            <Text style={styles.orgName}>{organization?.name}</Text>
            {organization?.type === 'partner' && (
              <View style={styles.partnerBadge}>
                <Text style={styles.partnerText}>Partner</Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.distance}>
          <Ionicons name="location" size={16} color={colors.muted} />
          <Text style={styles.distanceText}>
            {formatDistance(event.distanceFromUserKm)}
          </Text>
        </View>
      </View>

      <Text style={styles.title}>{event.title}</Text>

      <View style={styles.meta}>
        <View style={styles.dateTime}>
          <Ionicons name="calendar" size={16} color={colors.muted} />
          <Text style={styles.dateTimeText}>
            {formatEventDate(event.dateISO)} • {formatEventTime(event.dateISO)}
          </Text>
        </View>
        <View style={styles.location}>
          <Ionicons name="location-outline" size={16} color={colors.muted} />
          <Text style={styles.locationText}>{event.location.name}</Text>
        </View>
      </View>

      <View style={styles.tags}>
        {event.tags.slice(0, 3).map((tag) => (
          <TagPill key={tag} tag={tag} style={styles.tag} />
        ))}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.viewButton} onPress={onPress}>
          <Text style={styles.viewButtonText}>View</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  orgInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  orgDetails: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  orgName: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '600',
  },
  partnerBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  partnerText: {
    ...typography.small,
    color: colors.bg,
    fontWeight: 'bold',
  },
  distance: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceText: {
    ...typography.caption,
    color: colors.muted,
    marginLeft: spacing.xs,
  },
  title: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  meta: {
    marginBottom: spacing.sm,
  },
  dateTime: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  dateTimeText: {
    ...typography.caption,
    color: colors.muted,
    marginLeft: spacing.xs,
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    ...typography.caption,
    color: colors.muted,
    marginLeft: spacing.xs,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
  },
  tag: {
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  footer: {
    alignItems: 'flex-end',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary + '20',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary + '40',
  },
  viewButtonText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
    marginRight: spacing.xs,
  },
});
