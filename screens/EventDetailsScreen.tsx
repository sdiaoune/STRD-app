import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { EventsStackParamList } from '../types/navigation';

type EventDetailsScreenNavigationProp = NativeStackNavigationProp<EventsStackParamList, 'EventDetails'>;
type EventDetailsScreenRouteProp = RouteProp<EventsStackParamList, 'EventDetails'>;
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../theme';
import { Avatar } from '../components/Avatar';
import { TagPill } from '../components/TagPill';
import { formatEventDate, formatEventTime, formatDistance } from '../utils/format';
import { useStore } from '../state/store';

export const EventDetailsScreen: React.FC = () => {
  const navigation = useNavigation<EventDetailsScreenNavigationProp>();
  const route = useRoute<EventDetailsScreenRouteProp>();
  const { eventId } = route.params;
  
  const { eventById, orgById } = useStore();
  const event = eventById(eventId);
  const organization = event ? orgById(event.orgId) : null;

  if (!event || !organization) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Event not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleOrgPress = () => {
    navigation.navigate('BusinessProfile', { orgId: organization.id });
  };

  const handleImIn = () => {
    // No-op for mock
    console.log('I\'m in!');
  };

  const handleRemindMe = () => {
    // No-op for mock
    console.log('Remind me!');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Cover Image Placeholder */}
        <View style={styles.coverImage}>
          <View style={styles.coverPlaceholder}>
            <Ionicons name="image" size={48} color={colors.muted} />
            <Text style={styles.coverText}>Event Cover</Text>
          </View>
        </View>

        <View style={styles.content}>
          {/* Organization Info */}
          <TouchableOpacity style={styles.orgSection} onPress={handleOrgPress}>
            <Avatar source={organization.logo} size={48} />
            <View style={styles.orgInfo}>
              <Text style={styles.orgName}>{organization.name}</Text>
              {organization.type === 'partner' && (
                <View style={styles.partnerBadge}>
                  <Text style={styles.partnerText}>Partner</Text>
                </View>
              )}
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.muted} />
          </TouchableOpacity>

          {/* Event Title */}
          <Text style={styles.title}>{event.title}</Text>

          {/* Date & Time */}
          <View style={styles.dateTimeSection}>
            <View style={styles.dateTimeItem}>
              <Ionicons name="calendar" size={20} color={colors.primary} />
              <Text style={styles.dateTimeText}>
                {formatEventDate(event.dateISO)} • {formatEventTime(event.dateISO)}
              </Text>
            </View>
            <View style={styles.dateTimeItem}>
              <Ionicons name="location" size={20} color={colors.primary} />
              <Text style={styles.dateTimeText}>{event.location.name}</Text>
            </View>
            <View style={styles.dateTimeItem}>
              <Ionicons name="navigate" size={20} color={colors.primary} />
              <Text style={styles.dateTimeText}>
                {formatDistance(event.distanceFromUserKm)} away
              </Text>
            </View>
          </View>

          {/* Tags */}
          <View style={styles.tagsSection}>
            <Text style={styles.sectionTitle}>Tags</Text>
            <View style={styles.tags}>
              {event.tags.map((tag) => (
                <TagPill key={tag} tag={tag} style={styles.tag} />
              ))}
            </View>
          </View>

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{event.description}</Text>
          </View>

          {/* Attendees Placeholder */}
          <View style={styles.attendeesSection}>
            <Text style={styles.sectionTitle}>Attendees</Text>
            <View style={styles.attendeesPlaceholder}>
              <Ionicons name="people" size={24} color={colors.muted} />
              <Text style={styles.attendeesText}>No attendees yet</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.remindButton} onPress={handleRemindMe}>
          <Text style={styles.remindButtonText}>Remind Me</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.imInButton} onPress={handleImIn}>
          <Text style={styles.imInButtonText}>I'm In</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollView: {
    flex: 1,
  },
  coverImage: {
    height: 200,
    backgroundColor: colors.card,
  },
  coverPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.border,
  },
  coverText: {
    ...typography.caption,
    color: colors.muted,
    marginTop: spacing.sm,
  },
  content: {
    padding: spacing.md,
  },
  orgSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  orgInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  orgName: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  partnerBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  partnerText: {
    ...typography.small,
    color: colors.bg,
    fontWeight: 'bold',
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  dateTimeSection: {
    marginBottom: spacing.lg,
  },
  dateTimeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  dateTimeText: {
    ...typography.body,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  tagsSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  descriptionSection: {
    marginBottom: spacing.lg,
  },
  description: {
    ...typography.body,
    color: colors.text,
    lineHeight: 24,
  },
  attendeesSection: {
    marginBottom: spacing.lg,
  },
  attendeesPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  attendeesText: {
    ...typography.body,
    color: colors.muted,
    marginLeft: spacing.sm,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
  },
  remindButton: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    marginRight: spacing.sm,
    alignItems: 'center',
  },
  remindButtonText: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  imInButton: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    marginLeft: spacing.sm,
    alignItems: 'center',
  },
  imInButtonText: {
    ...typography.body,
    color: colors.bg,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    ...typography.h2,
    color: colors.muted,
  },
});
