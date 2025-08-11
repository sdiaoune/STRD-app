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

export const PostDetailsScreen: React.FC = () => {
  const navigation = useNavigation<PostDetailsScreenNavigationProp>();
  const route = useRoute<PostDetailsScreenRouteProp>();
  const { postId } = route.params;
  
  const [commentText, setCommentText] = useState('');
  const { postById, userById, likeToggle, addComment } = useStore();
  const post = postById(postId);
  const user = post ? userById(post.userId) : null;

  // Mock trajectory data - in a real app this would come from GPS coordinates
  const trajectoryPoints = [
    { x: 0.1, y: 0.2 },
    { x: 0.15, y: 0.25 },
    { x: 0.25, y: 0.3 },
    { x: 0.35, y: 0.28 },
    { x: 0.45, y: 0.35 },
    { x: 0.55, y: 0.32 },
    { x: 0.65, y: 0.38 },
    { x: 0.75, y: 0.36 },
    { x: 0.85, y: 0.42 },
    { x: 0.9, y: 0.4 },
    { x: 0.95, y: 0.45 },
  ];

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
            {/* Mock Map Background */}
            <View style={styles.mapBackground}>
              {/* Grid lines for map effect */}
              <View style={styles.mapGrid}>
                {[...Array(5)].map((_, i) => (
                  <View key={`h-${i}`} style={[styles.gridLine, styles.horizontalLine, { top: i * 40 }]} />
                ))}
                {[...Array(5)].map((_, i) => (
                  <View key={`v-${i}`} style={[styles.gridLine, styles.verticalLine, { left: i * 40 }]} />
                ))}
              </View>
              
              {/* Route Path */}
              <View style={styles.routePath}>
                {trajectoryPoints.map((point, index) => {
                  const x = point.x * (width - 120);
                  const y = point.y * 160;
                  
                  return (
                    <View key={index}>
                      {/* Route line segments */}
                      {index > 0 && (
                        <View
                          style={[
                            styles.routeLine,
                            {
                              left: trajectoryPoints[index - 1].x * (width - 120),
                              top: trajectoryPoints[index - 1].y * 160,
                              width: Math.sqrt(
                                Math.pow(x - trajectoryPoints[index - 1].x * (width - 120), 2) +
                                Math.pow(y - trajectoryPoints[index - 1].y * 160, 2)
                              ),
                              transform: [{
                                rotate: `${Math.atan2(
                                  y - trajectoryPoints[index - 1].y * 160,
                                  x - trajectoryPoints[index - 1].x * (width - 120)
                                )}rad`
                              }]
                            }
                          ]}
                        />
                      )}
                      
                      {/* Route points */}
                      <View
                        style={[
                          styles.routePoint,
                          { left: x - 3, top: y - 3 },
                          index === 0 && styles.startPoint,
                          index === trajectoryPoints.length - 1 && styles.endPoint
                        ]}
                      >
                        {index === 0 && <Ionicons name="location" size={12} color={colors.primary} />}
                        {index === trajectoryPoints.length - 1 && <Ionicons name="flag" size={12} color={colors.primary} />}
                      </View>
                    </View>
                  );
                })}
              </View>
              
              {/* Map landmarks */}
              <View style={[styles.landmark, { left: 60, top: 40 }]}>
                <Ionicons name="home" size={16} color={colors.muted} />
              </View>
              <View style={[styles.landmark, { left: 200, top: 80 }]}>
                <Ionicons name="cafe" size={16} color={colors.muted} />
              </View>
              <View style={[styles.landmark, { left: 140, top: 120 }]}>
                <Ionicons name="leaf" size={16} color={colors.muted} />
              </View>
            </View>
            
            {/* Map legend */}
            <View style={styles.mapLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
                <Text style={styles.legendText}>Route</Text>
              </View>
              <View style={styles.legendItem}>
                <Ionicons name="location" size={12} color={colors.primary} />
                <Text style={styles.legendText}>Start</Text>
              </View>
              <View style={styles.legendItem}>
                <Ionicons name="flag" size={12} color={colors.primary} />
                <Text style={styles.legendText}>End</Text>
              </View>
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
            isLiked={post.likes > 0}
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
                    <Text style={styles.commentTime}>
                      {getRelativeTime(post.createdAtISO)}
                    </Text>
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
