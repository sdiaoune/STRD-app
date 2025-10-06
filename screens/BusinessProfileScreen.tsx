import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { EventsStackParamList, AppNavigationParamList } from '../types/navigation';

type BusinessProfileScreenNavigationProp = NativeStackNavigationProp<EventsStackParamList & AppNavigationParamList, 'BusinessProfile'>;
type BusinessProfileScreenRouteProp = RouteProp<EventsStackParamList, 'BusinessProfile'>;
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../theme';
import { Avatar } from '../components/Avatar';
import { EventCard } from '../components/EventCard';
import { RunPostCard } from '../components/RunPostCard';
import { EmptyState } from '../components/EmptyState';
import { useStore } from '../state/store';

export const BusinessProfileScreen: React.FC = () => {
  const navigation = useNavigation<BusinessProfileScreenNavigationProp>();
  const route = useRoute<BusinessProfileScreenRouteProp>();
  const { orgId } = route.params;
  
  const { orgById, events, runPosts, postById, eventById } = useStore();
  const organization = orgById(orgId);

  if (!organization) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Organization not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Get organization's events
  const orgEvents = events.filter(event => event.orgId === orgId);
  
  // Get organization's posts (mock: some run posts from partners)
  const orgPosts = runPosts.filter(post => post.isFromPartner && Math.random() > 0.5);

  const handleEventPress = (eventId: string) => {
    navigation.navigate('EventDetails', { eventId });
  };

  const handlePostPress = (postId: string) => {
    navigation.navigate('PostDetails', { postId });
  };

  const handleWebsitePress = () => {
    // Placeholder for website link
    console.log('Website link pressed');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Organization Header */}
        <View style={styles.orgHeader}>
          <Avatar source={organization.logo} size={80} />
          <Text style={styles.orgName}>{organization.name}</Text>
          {organization.type === 'partner' && (
            <View style={styles.partnerBadge}>
              <Text style={styles.partnerText}>Partner</Text>
            </View>
          )}
          <Text style={styles.orgLocation}>{organization.city}</Text>
          <Text style={styles.orgDescription}>
            {organization.type === 'partner' 
              ? 'Official partner organization dedicated to promoting running and wellness in the community.'
              : 'Community organization bringing runners together for events and activities.'
            }
          </Text>
          
          <TouchableOpacity style={styles.websiteButton} onPress={handleWebsitePress}>
            <Ionicons name="globe" size={20} color={colors.primary} />
            <Text style={styles.websiteText}>Visit Website</Text>
          </TouchableOpacity>
        </View>

        {/* Upcoming Events */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Events</Text>
          
          {orgEvents.length > 0 ? (
            orgEvents.slice(0, 3).map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onPress={() => handleEventPress(event.id)}
              />
            ))
          ) : (
            <EmptyState
              icon="calendar-outline"
              title="No upcoming events"
              message="This organization hasn't posted any events yet"
            />
          )}
        </View>

        {/* Recent Posts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Posts</Text>
          
          {orgPosts.length > 0 ? (
            orgPosts.slice(0, 3).map((post) => (
              <RunPostCard
                key={post.id}
                post={post}
                onPress={() => handlePostPress(post.id)}
              />
            ))
          ) : (
            <EmptyState
              icon="document-outline"
              title="No posts yet"
              message="This organization hasn't shared any posts yet"
            />
          )}
        </View>
      </ScrollView>
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
  orgHeader: {
    alignItems: 'center',
    padding: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  orgName: {
    ...typography.h2,
    color: colors.text.primary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  partnerBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  partnerText: {
    ...typography.caption,
    color: colors.bg,
    fontWeight: 'bold',
  },
  orgLocation: {
    ...typography.body,
    color: colors.muted,
    marginBottom: spacing.md,
  },
  orgDescription: {
    ...typography.body,
    color: colors.text.primary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  websiteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  websiteText: {
    ...typography.body,
    color: colors.primary,
    marginLeft: spacing.sm,
    fontWeight: '600',
  },
  section: {
    padding: spacing.md,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.md,
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
