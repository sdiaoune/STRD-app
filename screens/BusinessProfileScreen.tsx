import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { EventsStackParamList, AppNavigationParamList } from '../types/navigation';

type BusinessProfileScreenNavigationProp = NativeStackNavigationProp<EventsStackParamList & AppNavigationParamList, 'BusinessProfile'>;
type BusinessProfileScreenRouteProp = RouteProp<EventsStackParamList, 'BusinessProfile'>;
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { useTheme as useTokensTheme } from '../theme';
import { Avatar } from '../components/Avatar';
import { EventCard } from '../components/EventCard';
import { RunPostCard } from '../components/RunPostCard';
import { PagePostCard } from '../components/PagePostCard';
import { EmptyState } from '../components/EmptyState';
import { useStore } from '../state/store';
import CertifiedBadge from '../components/CertifiedBadge';

export const BusinessProfileScreen: React.FC = () => {
  const navigation = useNavigation<BusinessProfileScreenNavigationProp>();
  const route = useRoute<BusinessProfileScreenRouteProp>();
  const { orgId } = route.params;
  
  const { orgById, events, runPosts, postById, eventById, deletePage, currentUser, followPage, unfollowPage, pagePosts } = useStore();
  const theme = useTokensTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [followPending, setFollowPending] = React.useState(false);
  const organization = orgById(orgId);
  const isOwner = organization && organization.ownerId === currentUser.id;
  const isFollowingPage = !!organization && currentUser.followingOrgs.includes(organization.id);

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
  
  // Get organization's page posts
  const orgPosts = pagePosts.filter(p => p.orgId === orgId);

  const handleEventPress = (eventId: string) => {
    navigation.navigate('EventDetails', { eventId });
  };

  const handlePostPress = (postId: string) => {
    navigation.navigate('PostDetails', { postId });
  };

  const handleWebsitePress = async () => {
    const url = organization?.website;
    if (!url) return;
    const normalized = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
    Alert.alert(
      'Open External Link',
      `You are about to open:\n${normalized}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: async () => {
            try {
              await WebBrowser.openBrowserAsync(normalized, {
                presentationStyle: 'automatic',
                controlsColor: theme.colors.primary,
                toolbarColor: theme.colors.surface,
                enableBarCollapsing: true,
                dismissButtonStyle: 'close',
              } as any);
            } catch {}
          },
        },
      ]
    );
  };

  const handleEditPress = () => {
    navigation.navigate('EditOrganization', { orgId });
  };

  const handleDeletePress = () => {
    Alert.alert(
      'Delete Organization',
      'Are you sure you want to delete this organization? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deletePage(orgId);
            navigation.goBack();
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.container}>
      <ScrollView contentInsetAdjustmentBehavior="never" style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Organization Header */}
        <View style={styles.orgHeader}>
          <Avatar source={organization.logo} size={80} />
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.orgName}>{organization.name}</Text>
            {organization.isCertified ? <CertifiedBadge /> : null}
          </View>
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
          
          {organization.website ? (
            <TouchableOpacity style={styles.websiteButton} onPress={handleWebsitePress}>
              <Ionicons name="globe" size={20} color={theme.colors.primary} />
              <Text style={styles.websiteText}>Visit Website</Text>
            </TouchableOpacity>
          ) : null}

          {!isOwner && (
              <TouchableOpacity
              style={[styles.followBtn, isFollowingPage ? styles.following : null, followPending ? { opacity: 0.5 } : null]}
              onPress={async () => {
                if (!organization || followPending) return;
                setFollowPending(true);
                try {
                  if (isFollowingPage) {
                    await unfollowPage(organization.id);
                  } else {
                    await followPage(organization.id);
                  }
                } finally {
                  setFollowPending(false);
                }
              }}
              accessibilityRole="button"
              disabled={followPending}
            >
              <Ionicons name={isFollowingPage ? 'checkmark' : 'add'} size={18} color={theme.colors.primary} />
              <Text style={styles.followBtnText}>{isFollowingPage ? 'Following' : 'Follow'}</Text>
            </TouchableOpacity>
          )}

          {isOwner && (
            <View style={styles.ownerActions}>
              <TouchableOpacity style={[styles.actionButton, styles.editButton, styles.editButtonSpacing]} onPress={handleEditPress}>
                <Ionicons name="create-outline" size={18} color={theme.colors.onPrimary} />
                <Text style={styles.actionButtonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={handleDeletePress}>
                <Ionicons name="trash-outline" size={18} color={theme.colors.onDanger} />
                <Text style={[styles.actionButtonText, styles.deleteText]}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
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
              body="This organization hasn't posted any events yet"
            />
          )}
        </View>

        {/* Recent Posts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Posts</Text>
          
          {orgPosts.length > 0 ? (
            orgPosts.slice(0, 3).map((post) => (
              <PagePostCard
                key={post.id}
                post={post}
                onPress={() => {}}
              />
            ))
          ) : (
            <EmptyState
              icon="document-outline"
              title="No posts yet"
              body="This organization hasn't shared any posts yet"
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (theme: ReturnType<typeof useTokensTheme>) => {
  const { colors, spacing, radius, typography } = theme;
  return StyleSheet.create({
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
      backgroundColor: colors.surface,
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
      borderRadius: radius.card,
      marginBottom: spacing.sm,
    },
    partnerText: {
      ...typography.caption,
      color: colors.bg,
      fontWeight: 'bold',
    },
    orgLocation: {
      ...typography.body,
      color: colors.text.secondary,
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
      backgroundColor: colors.surface,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderRadius: radius.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    websiteText: {
      ...typography.body,
      color: colors.primary,
      marginLeft: spacing.sm,
      fontWeight: '600',
    },
    followBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: radius.card,
      borderWidth: 1,
      borderColor: colors.border,
      marginTop: spacing.sm,
    },
    following: { opacity: 0.9 },
    followBtnText: { ...typography.body, marginLeft: spacing.sm, fontWeight: '600', color: colors.primary },
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
      color: colors.text.muted,
    },
    ownerActions: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: spacing.md,
      paddingHorizontal: spacing.lg,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    editButton: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    editButtonSpacing: {
      marginRight: spacing.sm,
    },
    deleteButton: {
      backgroundColor: colors.danger,
      borderColor: colors.danger,
    },
    actionButtonText: {
      ...typography.body,
      marginLeft: spacing.sm,
      fontWeight: '600',
      color: colors.onPrimary,
    },
    deleteText: { color: colors.onDanger },
  });
};
