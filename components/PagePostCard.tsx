import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import Animated, { FadeIn, Easing, Layout } from 'react-native-reanimated';
import { colors, spacing, borderRadius, typography } from '../theme';
import { Avatar } from './Avatar';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../supabase/client';
import SponsorDurationModal from './SponsorDurationModal';
import { useStore } from '../state/store';
import type { PagePost } from '../types/models';

interface PagePostCardProps {
  post: PagePost;
  onPress?: () => void;
  style?: any;
}

export const PagePostCard: React.FC<PagePostCardProps> = ({ post, onPress, style }) => {
  const orgById = useStore(state => state.orgById);
  const org = orgById(post.orgId);
  const isSuperAdmin = useStore(state => state.currentUser.isSuperAdmin);
  const nowTs = Date.now();
  const isSponsored = !!(
    post.sponsoredUntil &&
    new Date(post.sponsoredUntil).getTime() > nowTs &&
    (!post.sponsoredFrom || new Date(post.sponsoredFrom).getTime() <= nowTs)
  );
  const [showSponsorPicker, setShowSponsorPicker] = React.useState(false);

  const setSponsoredUntil = async (untilISO: string | null) => {
    try {
      const { error } = await supabase.from('organization_posts').update({ sponsored_until: untilISO }).eq('id', post.id);
      if (error) return;
      const prev = useStore.getState().pagePosts;
      useStore.setState({ pagePosts: prev.map(p => p.id === post.id ? { ...p, sponsoredUntil: untilISO } : p) });
    } catch {}
  };
  const openSponsorPicker = () => setShowSponsorPicker(true);

  return (
    <Animated.View entering={FadeIn.duration(140).easing(Easing.out(Easing.cubic))} layout={Layout.springify().damping(20).stiffness(120)}>
      <TouchableOpacity
        style={[styles.container, style]}
        onPress={onPress}
        activeOpacity={onPress ? 0.7 : 1}
      >
        <View style={styles.header}>
          <View style={styles.orgInfo}>
            <Avatar source={org?.logo || ''} size={40} />
            <View style={styles.orgDetails}>
              <Text style={styles.orgName}>{org?.name || 'Page'}</Text>
              <Text style={styles.orgType}>{org?.city}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {isSponsored && (
              <View style={styles.pinnedPill}>
                <Ionicons name="pricetag" size={12} color={colors.primary} />
                <Text style={styles.pinnedText}>Sponsored</Text>
              </View>
            )}
            <Text style={styles.timestamp}>{new Date(post.createdAtISO).toLocaleDateString()}</Text>
            {isSuperAdmin ? (
              <TouchableOpacity onPress={openSponsorPicker} style={{ marginLeft: spacing.xs }} accessibilityRole="button" hitSlop={12}>
                <Ionicons name={'pricetag-outline'} size={18} color={colors.primary} />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {post.imageUrl ? (
          <View style={styles.imageWrap}>
            <Image source={{ uri: post.imageUrl }} style={styles.image} resizeMode="cover" />
          </View>
        ) : null}

        {post.content ? (
          <Text style={styles.content}>{post.content}</Text>
        ) : null}
      </TouchableOpacity>
      <SponsorDurationModal
        visible={showSponsorPicker}
        onClose={() => setShowSponsorPicker(false)}
        onConfirm={async (startISO, untilISO) => {
          setShowSponsorPicker(false);
          try {
            const { error } = await supabase.from('organization_posts').update({ sponsored_from: startISO, sponsored_until: untilISO }).eq('id', post.id);
            if (!error) {
              const prev = useStore.getState().pagePosts;
              useStore.setState({ pagePosts: prev.map(p => p.id === post.id ? { ...p, sponsoredFrom: startISO, sponsoredUntil: untilISO } : p) });
            }
          } catch {}
        }}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
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
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
  orgType: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  timestamp: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  pinnedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    marginRight: spacing.xs,
  },
  pinnedText: {
    ...typography.caption,
    color: colors.primary,
    marginLeft: spacing[1],
    fontWeight: '700',
  },
  imageWrap: {
    marginBottom: spacing.md,
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surfaceMuted,
  },
  content: {
    ...typography.body,
    color: colors.text.primary,
    lineHeight: 22,
  },
});


