import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabOverflow } from '../components/ui/TabBarBackground.ios';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { EventsStackParamList } from '../types/navigation';

type EventDetailsScreenNavigationProp = NativeStackNavigationProp<EventsStackParamList, 'EventDetails'>;
type EventDetailsScreenRouteProp = RouteProp<EventsStackParamList, 'EventDetails'>;
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../theme';
import { useLegacyStyles } from '../theme/useLegacyStyles';
import { Avatar } from '../components/Avatar';
import { Chip } from '../components/Chip';
import { formatEventDate, formatEventTime, formatDistance } from '../utils/format';
import { useStore } from '../state/store';
import { supabase } from '../supabase/client';

export const EventDetailsScreen: React.FC = () => {
  const navigation = useNavigation<EventDetailsScreenNavigationProp>();
  const route = useRoute<EventDetailsScreenRouteProp>();
  const { eventId } = route.params;
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabOverflow?.() ?? 0;
  
  const { eventById, orgById, joinEvent, leaveEvent, setReminder, clearReminder, currentUser } = useStore();
  const unit = useStore(state => state.unitPreference);
  const event = eventById(eventId);
  const organization = event ? orgById(event.orgId) : null;

  const [isJoined, setIsJoined] = useState(false);
  const [isReminded, setIsReminded] = useState(false);
  const styles = useLegacyStyles(createStyles);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!currentUser.id || !event) return;
      const { data: p } = await supabase
        .from('event_participants')
        .select('user_id')
        .eq('event_id', event.id)
        .eq('user_id', currentUser.id)
        .maybeSingle();
      if (mounted) setIsJoined(!!p);
      const { data: r } = await supabase
        .from('event_reminders')
        .select('user_id')
        .eq('event_id', event.id)
        .eq('user_id', currentUser.id)
        .maybeSingle();
      if (mounted) setIsReminded(!!r);
    })();
    return () => { mounted = false; };
  }, [currentUser.id, event?.id]);

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

  const handleImIn = async () => {
    const ok = isJoined ? await leaveEvent(event.id) : await joinEvent(event.id);
    if (ok) {
      setIsJoined(!isJoined);
    } else {
      Alert.alert('Error', 'Unable to update participation. Please sign in and try again.');
    }
  };

  const handleRemindMe = async () => {
    const ok = isReminded ? await clearReminder(event.id) : await setReminder(event.id);
    if (ok) {
      setIsReminded(!isReminded);
    } else {
      Alert.alert('Error', 'Unable to update reminder. Please sign in and try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.coverImage}>
          {event.coverImage ? (
            <Image source={{ uri: event.coverImage }} style={styles.coverMedia} contentFit="cover" />
          ) : (
            <View style={styles.coverPlaceholder}>
              <Ionicons name="image" size={48} color={colors.muted} />
              <Text style={styles.coverText}>Event Cover</Text>
            </View>
          )}
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
                {event.distanceFromUserKm == null ? 'Distance unavailable' : `${formatDistance(event.distanceFromUserKm, unit)} away`}
              </Text>
            </View>
          </View>

          {/* Tags */}
          <View style={styles.tagsSection}>
            <Text style={styles.sectionTitle}>Tags</Text>
            <View style={styles.tags}>
              {event.tags.map((tag) => (
                <Chip key={tag} label={tag} style={styles.tag} />
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
              <Text style={styles.attendeesText}>{isJoined ? 'You are attending' : 'No attendees yet'}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={[styles.actionButtons, { paddingBottom: insets.bottom + spacing.sm, marginBottom: tabBarHeight + spacing.md }]}>
        <TouchableOpacity style={styles.remindButton} onPress={handleRemindMe}>
          <Text style={styles.remindButtonText}>{isReminded ? 'Reminder Set' : 'Remind Me'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.imInButton} onPress={handleImIn}>
          <Text style={styles.imInButtonText}>{isJoined ? 'Leave' : "I'm In"}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const createStyles = () => StyleSheet.create({
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
  coverMedia: {
    width: '100%',
    height: '100%',
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
    color: colors.text.primary,
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
    color: colors.text.primary,
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
    color: colors.text.primary,
    marginLeft: spacing.sm,
  },
  tagsSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
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
    color: colors.text.primary,
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
    color: colors.text.primary,
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
