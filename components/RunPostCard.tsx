import React, { useState } from 'react';
import LikesSheet from './LikesSheet';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, borderRadius, typography } from '../theme';
import { Avatar } from './Avatar';
import { LikeButton } from './LikeButton';
import { formatDistance, formatPace, getRelativeTime } from '../utils/format';
import { useStore } from '../state/store';
import type { RunPost } from '../types/models';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { TimelineStackParamList } from '../types/navigation';
import Animated, { FadeIn, Easing, Layout } from 'react-native-reanimated';
import { useLegacyStyles } from '../theme/useLegacyStyles';

type RunPostCardNavigationProp = NativeStackNavigationProp<TimelineStackParamList, 'TimelineList'>;

interface RunPostCardProps {
  post: RunPost;
  onPress: () => void;
  style?: any;
}

export const RunPostCard: React.FC<RunPostCardProps> = ({ post, onPress, style }) => {
  const [showLikes, setShowLikes] = useState(false);
  const userById = useStore(state => state.userById);
  const likeToggle = useStore(state => state.likeToggle);
  const user = userById(post.userId);
  const navigation = useNavigation<RunPostCardNavigationProp>();
  const unit = useStore(state => state.unitPreference);

  const handleLike = () => {
    likeToggle(post.id);
  };

  const handleViewStats = () => {
    navigation.navigate('RunStats', { runId: post.id });
  };

  const styles = useLegacyStyles(stylesFactory);
  return (
    <Animated.View entering={FadeIn.duration(140).easing(Easing.out(Easing.cubic))} layout={Layout.springify().damping(20).stiffness(120)}>
      <TouchableOpacity
        style={[styles.container, style]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Avatar source={user?.avatar || ''} size={40} />
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{user?.name}</Text>
              <Text style={styles.userHandle}>{user?.handle}</Text>
            </View>
          </View>
          <Text style={styles.timestamp}>{getRelativeTime(post.createdAtISO)}</Text>
        </View>

        <View style={styles.runStats}>
          <View style={styles.stat}>
            <Ionicons name="speedometer" size={20} color={colors.primary} />
            <Text style={styles.statValue}>{formatDistance(post.distanceKm, unit)}</Text>
            <Text style={styles.statLabel}>Distance</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="time" size={20} color={colors.primary} />
            <Text style={styles.statValue}>{post.durationMin}m</Text>
            <Text style={styles.statLabel}>Duration</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="flash" size={20} color={colors.primary} />
            <Text style={styles.statValue}>{formatPace(post.avgPaceMinPerKm, unit)}</Text>
            <Text style={styles.statLabel}>Pace</Text>
          </View>
        </View>

        {post.routePreview && (
          <View style={styles.routePreview}>
            <Image
              source={{ uri: post.routePreview }}
              style={styles.routeImage}
              resizeMode="cover"
            />
          </View>
        )}

        {post.caption && (
          <Text style={styles.caption}>{post.caption}</Text>
        )}

        <View style={styles.actions}>
          <LikeButton
            isLiked={!!post.likedByCurrentUser}
            likeCount={post.likes}
            onPress={handleLike}
          />
          <TouchableOpacity style={styles.commentButton} onPress={() => setShowLikes(true)}>
            <Ionicons name="people" size={20} color={colors.icon.secondary} />
            <Text style={styles.commentCount}>{post.likes}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.commentButton}>
            <Ionicons name="chatbubble-outline" size={20} color={colors.icon.secondary} />
            <Text style={styles.commentCount}>{post.comments.length}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statsButton} onPress={handleViewStats}>
            <Ionicons name="analytics" size={20} color={colors.primary} />
            <Text style={styles.statsButtonText}>Stats</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
      {showLikes && (
        // @ts-ignore - web-only overlay component; on native you may ignore
        <LikesSheet postId={post.id} onClose={() => setShowLikes(false)} />
      )}
    </Animated.View>
  );
};

const stylesFactory = () => StyleSheet.create({
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
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userDetails: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  userName: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
  userHandle: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  timestamp: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  runStats: {
    flexDirection: 'row',
    backgroundColor: colors.bg,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...typography.h3,
    color: colors.text.primary,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.small,
    color: colors.text.secondary,
  },
  routePreview: {
    marginBottom: spacing.md,
  },
  routeImage: {
    width: '100%',
    height: 180,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.border,
  },
  caption: {
    ...typography.body,
    color: colors.text.primary,
    marginBottom: spacing.md,
    lineHeight: 24,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  commentCount: {
    ...typography.caption,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
    fontWeight: '600',
  },
  statsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  statsButtonText: {
    ...typography.caption,
    color: colors.primary,
    marginLeft: spacing.xs,
    fontWeight: '600',
  },
});
