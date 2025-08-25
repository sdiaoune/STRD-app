import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Image, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { TimelineStackParamList } from '../types/navigation';

type PostDetailsScreenNavigationProp = NativeStackNavigationProp<TimelineStackParamList, 'PostDetails'>;
type PostDetailsScreenRouteProp = RouteProp<TimelineStackParamList, 'PostDetails'>;

const { width } = Dimensions.get('window');

import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../theme';
import { Avatar } from '../components/Avatar';
import { LikeButton } from '../components/LikeButton';
import { formatDistance, formatPace, getRelativeTime } from '../utils/format';
import { useStore } from '../state/store';
import MapView, { Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import { decodePolyline, regionForCoordinates } from '../utils/geo';

export const PostDetailsScreen: React.FC = () => {
  const navigation = useNavigation<PostDetailsScreenNavigationProp>();
  const route = useRoute<PostDetailsScreenRouteProp>();
  const { postId } = route.params;
  
  const [commentText, setCommentText] = useState('');
  const { postById, userById, likeToggle, addComment } = useStore();
  const post = postById(postId);
  const user = post ? userById(post.userId) : null;

  const decodedPath = post?.routePolyline ? decodePolyline(post.routePolyline) : [];

  if (!post || !user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Post not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleLike = () => {
    likeToggle(post.id);
  };

  const handleAddComment = () => {
    if (commentText.trim()) {
      addComment(post.id, commentText.trim());
      setCommentText('');
    }
  };

  const renderTrajectory = () => {
    return (
      <View style={styles.trajectoryContainer}>
        <Text style={styles.sectionTitle}>Run Route</Text>
        <View style={styles.trajectoryCard}>
          <View style={styles.mapContainer}>
            <View style={styles.mapBackground}>
              <MapView
                style={{ width: '100%', height: '100%' }}
                provider={PROVIDER_DEFAULT}
                showsCompass={false}
                scrollEnabled={false}
                zoomEnabled={false}
                pitchEnabled={false}
                rotateEnabled={false}
                initialRegion={{ latitude: 37.78825, longitude: -122.4324, latitudeDelta: 0.05, longitudeDelta: 0.05 }}
                region={decodedPath.length > 1 ? regionForCoordinates(decodedPath) : undefined as any}
              >
                {decodedPath.length > 1 && (
                  <Polyline
                    coordinates={decodedPath}
                    strokeColor={colors.primary}
                    strokeWidth={4}
                  />
                )}
              </MapView>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Post Header */}
        <View style={styles.postHeader}>
          <View style={styles.userInfo}>
            <Avatar source={user.avatar} size={48} />
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userHandle}>{user.handle}</Text>
            </View>
          </View>
          <Text style={styles.timestamp}>{getRelativeTime(post.createdAtISO)}</Text>
        </View>

        {/* Run Stats */}
        <View style={styles.runStats}>
          <View style={styles.stat}>
            <Ionicons name="speedometer" size={24} color={colors.primary} />
            <Text style={styles.statValue}>{formatDistance(post.distanceKm)}</Text>
            <Text style={styles.statLabel}>Distance</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="time" size={24} color={colors.primary} />
            <Text style={styles.statValue}>{post.durationMin}m</Text>
            <Text style={styles.statLabel}>Duration</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="flash" size={24} color={colors.primary} />
            <Text style={styles.statValue}>{formatPace(post.avgPaceMinPerKm)}</Text>
            <Text style={styles.statLabel}>Pace</Text>
          </View>
        </View>

        {/* Run Route Map */}
        {renderTrajectory()}

        {/* Route Preview */}
        {post.routePreview && (
          <View style={styles.routePreview}>
            <Image 
              source={{ uri: post.routePreview }} 
              style={styles.routeImage}
              resizeMode="cover"
            />
          </View>
        )}

        {/* Caption */}
        {post.caption && (
          <Text style={styles.caption}>{post.caption}</Text>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <LikeButton
            isLiked={!!post.likedByCurrentUser}
            likeCount={post.likes}
            onPress={handleLike}
          />
        </View>

        {/* Comments */}
        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>
            Comments ({post.comments.length})
          </Text>
          
          {post.comments.map((comment) => {
            const commentUser = userById(comment.userId);
            return (
              <View key={comment.id} style={styles.comment}>
                <Avatar source={commentUser?.avatar || ''} size={32} />
                <View style={styles.commentContent}>
                  <View style={styles.commentHeader}>
                    <Text style={styles.commentUserName}>
                      {commentUser?.name || 'Unknown User'}
                    </Text>
                    {comment.createdAtISO && (
                      <Text style={styles.commentTime}>
                        {getRelativeTime(comment.createdAtISO)}
                      </Text>
                    )}
                  </View>
                  <Text style={styles.commentText}>{comment.text}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Add Comment */}
      <View style={styles.addCommentSection}>
        <TextInput
          style={styles.commentInput}
          placeholder="Add a comment..."
          placeholderTextColor={colors.muted}
          value={commentText}
          onChangeText={setCommentText}
          multiline
        />
        <TouchableOpacity 
          style={[styles.sendButton, !commentText.trim() && styles.sendButtonDisabled]}
          onPress={handleAddComment}
          disabled={!commentText.trim()}
        >
          <Ionicons 
            name="send" 
            size={20} 
            color={commentText.trim() ? colors.primary : colors.muted} 
          />
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
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userDetails: {
    marginLeft: spacing.md,
    flex: 1,
  },
  userName: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  userHandle: {
    ...typography.caption,
    color: colors.muted,
  },
  timestamp: {
    ...typography.caption,
    color: colors.muted,
  },
  runStats: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    margin: spacing.md,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...typography.h2,
    color: colors.text,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  statLabel: {
    ...typography.caption,
    color: colors.muted,
  },
  routePreview: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  routeImage: {
    width: '100%',
    height: 200,
    borderRadius: borderRadius.md,
    backgroundColor: colors.border,
  },
  caption: {
    ...typography.body,
    color: colors.text,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    lineHeight: 24,
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  commentsSection: {
    padding: spacing.md,
  },
  commentsTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  comment: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  commentContent: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  commentUserName: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  commentTime: {
    ...typography.small,
    color: colors.muted,
  },
  commentText: {
    ...typography.body,
    color: colors.text,
    lineHeight: 20,
  },
  addCommentSection: {
    flexDirection: 'row',
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
    alignItems: 'flex-end',
  },
  commentInput: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    maxHeight: 100,
  },
  sendButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sendButtonDisabled: {
    opacity: 0.5,
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
  // Mock Map Styles
  trajectoryContainer: {
    padding: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  trajectoryCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  mapContainer: {
    padding: spacing.md,
  },
  mapBackground: {
    width: '100%',
    height: 200,
    backgroundColor: colors.bg,
    borderRadius: borderRadius.md,
    position: 'relative',
    overflow: 'hidden',
  },
  mapGrid: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: colors.border,
    opacity: 0.3,
  },
  horizontalLine: {
    width: '100%',
    height: 1,
  },
  verticalLine: {
    width: 1,
    height: '100%',
  },
  routePath: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  routeLine: {
    position: 'absolute',
    height: 3,
    backgroundColor: colors.primary,
    borderRadius: 1.5,
    transformOrigin: 'left center',
  },
  routePoint: {
    position: 'absolute',
    width: 6,
    height: 6,
    backgroundColor: colors.primary,
    borderRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  startPoint: {
    backgroundColor: colors.primary,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  endPoint: {
    backgroundColor: colors.primary,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  landmark: {
    position: 'absolute',
    width: 24,
    height: 24,
    backgroundColor: colors.card,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  mapLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  legendText: {
    ...typography.caption,
    color: colors.muted,
    marginLeft: spacing.xs,
  },
});
