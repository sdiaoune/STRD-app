import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import Animated, { FadeIn, Easing, Layout } from 'react-native-reanimated';
import { colors, spacing, borderRadius, typography } from '../theme';
import { Avatar } from './Avatar';
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
          <Text style={styles.timestamp}>{new Date(post.createdAtISO).toLocaleDateString()}</Text>
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


