import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Image, StyleSheet, Dimensions, Alert, Platform, KeyboardAvoidingView, Modal } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { TimelineStackParamList } from '../types/navigation';
import { useBottomTabOverflow } from '../components/ui/TabBarBackground.ios';

type PostDetailsScreenNavigationProp = NativeStackNavigationProp<TimelineStackParamList, 'PostDetails'>;
type PostDetailsScreenRouteProp = RouteProp<TimelineStackParamList, 'PostDetails'>;

const { width } = Dimensions.get('window');

import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../theme';
import { useLegacyStyles } from '../theme/useLegacyStyles';
import { Avatar } from '../components/Avatar';
import { LikeButton } from '../components/LikeButton';
import { getRelativeTime } from '../utils/format';
import { formatDistance as fmtDistance, formatDuration as fmtDuration, formatPace as fmtPace } from '../utils/formatters';
import Stat from '../components/ui/Stat';
import MapCard from '../components/ui/MapCard';
import { useStore } from '../state/store';
import MapView, { Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import { openUserProfile } from '../utils/openUserProfile';
import { decodePolyline, regionForCoordinates } from '../utils/geo';
import CertifiedBadge from '../components/CertifiedBadge';

export const PostDetailsScreen: React.FC = () => {
  const navigation = useNavigation<PostDetailsScreenNavigationProp>();
  const route = useRoute<PostDetailsScreenRouteProp>();
  const { postId } = route.params;
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabOverflow?.() ?? 0;
  
  const [commentText, setCommentText] = useState('');
  const [isCommentModalVisible, setIsCommentModalVisible] = useState(false);
  const post = useStore(state => state.postById(postId));
  const user = useStore(state => post ? state.userById(post.userId) : null);
  const likeToggle = useStore(state => state.likeToggle);
  const addComment = useStore(state => state.addComment);
  const deleteComment = useStore(state => state.deleteComment);
  const deleteRunPost = useStore(state => state.deleteRunPost);
  const currentUser = useStore(state => state.currentUser);
  const unit = useStore(state => state.unitPreference);
  const decodedPath = post?.routePolyline ? decodePolyline(post.routePolyline) : [];
  const [routeSize, setRouteSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const styles = useLegacyStyles(createStyles);

  if (!post || !user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Post not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleDelete = () => {
    Alert.alert('Delete Post', 'Are you sure you want to delete this post?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        const ok = await deleteRunPost(post.id);
        if (ok) navigation.goBack();
      }}
    ]);
  };

  const handleLike = () => {
    likeToggle(post.id);
  };

  const handleAddComment = () => {
    if (commentText.trim()) {
      addComment(post.id, commentText.trim());
      setCommentText('');
      setIsCommentModalVisible(false);
    }
  };

  const renderTrajectory = () => {
    const isOwner = currentUser.id === post.userId;
    const isFollower = useStore.getState().followingUserIds.includes(post.userId);
    const canShowMap = isOwner; // Owners can view full map with polyline
    const canShowRoute = isOwner || isFollower; // Followers see schematic route
    return (
      <View style={styles.trajectoryContainer}>
        <Text style={styles.sectionTitle}>Run Route</Text>
        {canShowMap ? (
          <MapCard>
            <MapView
              style={{ width: '100%', height: '100%' }}
              provider={PROVIDER_DEFAULT}
              showsCompass={false}
              scrollEnabled={false}
              zoomEnabled={false}
              pitchEnabled={false}
              rotateEnabled={false}
              region={decodedPath.length > 1 ? regionForCoordinates(decodedPath) : undefined as any}
              initialRegion={{ latitude: decodedPath[0]?.latitude || 37.78825, longitude: decodedPath[0]?.longitude || -122.4324, latitudeDelta: 0.05, longitudeDelta: 0.05 }}
            >
              {decodedPath.length > 1 && (
                <Polyline coordinates={decodedPath} strokeColor={colors.primary} strokeWidth={4} />
              )}
            </MapView>
          </MapCard>
        ) : canShowRoute ? (
          <MapCard>
            {/* Privacy-friendly: real map for scale, hidden by an opaque overlay; route drawn above */}
            <View style={{ width: '100%', height: '100%' }}>
              <MapView
                style={{ width: '100%', height: '100%' }}
                provider={PROVIDER_DEFAULT}
                scrollEnabled={false}
                zoomEnabled={false}
                pitchEnabled={false}
                rotateEnabled={false}
                region={decodedPath.length > 1 ? regionForCoordinates(decodedPath) : undefined as any}
                initialRegion={{ latitude: decodedPath[0]?.latitude || 37.78825, longitude: decodedPath[0]?.longitude || -122.4324, latitudeDelta: 0.05, longitudeDelta: 0.05 }}
              />
              <View style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, backgroundColor: '#000' }} />
              <View
                style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }}
                onLayout={(e) => setRouteSize({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}
              >
              {decodedPath.length > 1 ? (
                <View style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }}>
                  {(() => {
                    const pad = 12;
                    // Use fitted region from MapView to align perfectly
                    const fitted = regionForCoordinates(decodedPath);
                    const minLon = fitted.longitude - fitted.longitudeDelta / 2;
                    const maxLon = fitted.longitude + fitted.longitudeDelta / 2;
                    const minLat = fitted.latitude - fitted.latitudeDelta / 2;
                    const maxLat = fitted.latitude + fitted.latitudeDelta / 2;
                    const w = Math.max(1, routeSize.width - pad * 2);
                    const h = Math.max(1, routeSize.height - pad * 2);
                    const toXY = (lat: number, lon: number) => {
                      const nx = (lon - minLon) / Math.max(1e-9, (maxLon - minLon));
                      const ny = (maxLat - lat) / Math.max(1e-9, (maxLat - minLat));
                      const x = pad + nx * w;
                      const y = pad + ny * h;
                      return { x, y };
                    };
                    const points = decodedPath.map(p => toXY(p.latitude, p.longitude));
                    const segs = [] as any[];
                    for (let i = 0; i < points.length - 1; i++) {
                      const a = points[i];
                      const b = points[i + 1];
                      const dx = b.x - a.x; const dy = b.y - a.y;
                      const len = Math.max(1, Math.hypot(dx, dy));
                      const ang = Math.atan2(dy, dx) + 'rad';
                      segs.push(
                        <View
                          key={`seg-${i}`}
                          style={{ position: 'absolute', left: a.x, top: a.y, width: len, height: 3, backgroundColor: colors.primary, borderRadius: 2, transform: [{ rotateZ: ang }] }}
                        />
                      );
                    }
                    return (
                      <>
                        {segs}
                        <View style={{ position: 'absolute', left: points[0].x - 4, top: points[0].y - 4, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary }} />
                        <View style={{ position: 'absolute', left: points[points.length - 1].x - 4, top: points[points.length - 1].y - 4, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary }} />
                      </>
                    );
                  })()}
                </View>
              ) : (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ ...typography.caption, color: colors.text.secondary }}>No route recorded</Text>
                </View>
              )}
            </View>
            {/* end route overlay */}
          </View>
          </MapCard>
        ) : (
          <Text style={{ ...typography.caption, color: colors.text.secondary }}>Only followers can view the route.</Text>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: spacing.lg + insets.bottom + tabBarHeight }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Post Header */}
        <View style={styles.postHeader}>
          <TouchableOpacity style={styles.userInfo} onPress={() => openUserProfile(navigation as any, post.userId)} accessibilityRole="button" hitSlop={12}>
            <Avatar source={user.avatar} size={48} />
            <View style={styles.userDetails}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.userName}>{user.name}</Text>
                {user.isCertified ? <CertifiedBadge /> : null}
              </View>
              <Text style={styles.userHandle}>{user.handle}</Text>
            </View>
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.timestamp}>{getRelativeTime(post.createdAtISO)}</Text>
            {currentUser.id === post.userId && (
              <TouchableOpacity onPress={handleDelete} style={{ marginLeft: spacing.md }} accessibilityRole="button">
                <Ionicons name="trash" size={20} color={colors.icon.secondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Run Stats */}
        <View style={styles.runStats}>
          <View style={styles.stat}>
            <Stat icon="speedometer" value={fmtDistance(post.distanceKm * 1000)} label="Distance" />
          </View>
          <View style={styles.stat}>
            <Stat icon="time" value={fmtDuration(post.durationMin * 60)} label="Duration" />
          </View>
          <View style={styles.stat}>
            <Stat icon="flash" value={fmtPace(Math.round(post.avgPaceMinPerKm * 60))} label="Pace" />
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
          <TouchableOpacity 
            style={styles.commentActionButton}
            onPress={() => setIsCommentModalVisible(true)}
          >
            <Ionicons name="chatbubble-outline" size={20} color={colors.icon.secondary} />
            <Text style={styles.commentActionCount}>{post.comments.length}</Text>
          </TouchableOpacity>
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
                <TouchableOpacity onPress={() => openUserProfile(navigation as any, comment.userId)} accessibilityRole="button" hitSlop={12}>
                  <Avatar source={commentUser?.avatar || ''} size={32} />
                </TouchableOpacity>
                <View style={styles.commentContent}>
                  <View style={styles.commentHeader}>
                    <TouchableOpacity onPress={() => openUserProfile(navigation as any, comment.userId)} accessibilityRole="button" hitSlop={12}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.commentUserName}>
                          {commentUser?.name || 'Unknown User'}
                        </Text>
                        {commentUser?.isCertified ? <CertifiedBadge /> : null}
                      </View>
                    </TouchableOpacity>
                    {comment.createdAtISO && (
                      <Text style={styles.commentTime}>
                        {getRelativeTime(comment.createdAtISO)}
                      </Text>
                    )}
                  </View>
                  <Text style={styles.commentText}>{comment.text}</Text>
                  {comment.userId === currentUser.id && (
                    <TouchableOpacity 
                      onPress={() => deleteComment(post.id, comment.id)}
                      style={{ marginTop: spacing.xs }}
                      accessibilityRole="button"
                    >
                      <Ionicons name="trash" size={16} color={colors.icon.secondary} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
        </View>
        <View style={{ height: 250 }} />
      </ScrollView>

      {/* Comment Modal */}
      <Modal
        visible={isCommentModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsCommentModalVisible(false)}
      >
        <KeyboardAvoidingView 
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <TouchableOpacity 
            style={styles.modalBackdrop}
            onPress={() => setIsCommentModalVisible(false)}
          />
          <View style={[styles.commentModal, { paddingBottom: insets.bottom + spacing.md }]}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Add a Comment</Text>
            
            <View style={styles.modalCommentInputContainer}>
              <TextInput
                style={styles.modalCommentInput}
                placeholder="What do you think..."
                placeholderTextColor={colors.text.secondary}
                value={commentText}
                onChangeText={setCommentText}
                multiline
                autoFocus
              />
              <TouchableOpacity 
                style={[styles.modalSendButton, commentText.trim() && styles.modalSendButtonActive]}
                onPress={handleAddComment}
                disabled={!commentText.trim()}
              >
                <Ionicons 
                  name="send" 
                  size={20} 
                  color={commentText.trim() ? colors.onPrimary : colors.icon.muted} 
                />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
    color: colors.text.primary,
    marginBottom: spacing.xs,
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
    backgroundColor: colors.card,
    margin: spacing.md,
    borderRadius: 12,
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
    color: colors.text.primary,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  statLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  routePreview: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  routeImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: colors.surfaceMuted,
  },
  caption: {
    ...typography.body,
    color: colors.text.primary,
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
    color: colors.text.primary,
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
    color: colors.text.primary,
    fontWeight: '600',
  },
  commentTime: {
    ...typography.small,
    color: colors.text.secondary,
  },
  commentText: {
    ...typography.body,
    color: colors.text.primary,
    lineHeight: 20,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    ...typography.h2,
    color: colors.text.secondary,
  },
  // Mock Map Styles
  trajectoryContainer: {
    padding: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
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
    borderRadius: 12,
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
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  commentActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.md,
  },
  commentActionCount: {
    ...typography.small,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  commentModal: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    paddingTop: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  modalCommentInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  modalCommentInput: {
    flex: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    color: colors.text.primary,
    ...typography.body,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    minHeight: 44,
    maxHeight: 100,
  },
  modalSendButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  modalSendButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
});
