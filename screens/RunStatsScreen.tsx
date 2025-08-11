import React from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { TimelineStackParamList } from '../types/navigation';
import { colors, spacing, borderRadius, typography } from '../theme';
import { Avatar } from '../components/Avatar';
import { formatDistance, formatPace, formatTime, getRelativeTime } from '../utils/format';
import { useStore } from '../state/store';

type RunStatsScreenNavigationProp = NativeStackNavigationProp<TimelineStackParamList, 'RunStats'>;
type RunStatsScreenRouteProp = RouteProp<TimelineStackParamList, 'RunStats'>;

const { width } = Dimensions.get('window');

export const RunStatsScreen: React.FC = () => {
  const navigation = useNavigation<RunStatsScreenNavigationProp>();
  const route = useRoute<RunStatsScreenRouteProp>();
  const { runId } = route.params;
  
  const { postById, userById } = useStore();
  const run = postById(runId);
  const user = run ? userById(run.userId) : null;

  if (!run || !user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Run not found</Text>
        </View>
      </SafeAreaView>
    );
  }

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
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Avatar source={user.avatar} size={48} />
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userHandle}>{user.handle}</Text>
            </View>
          </View>
          <Text style={styles.timestamp}>{getRelativeTime(run.createdAtISO)}</Text>
        </View>

        {/* Main Stats */}
        <View style={styles.mainStats}>
          <View style={styles.statCard}>
            <Ionicons name="speedometer" size={32} color={colors.primary} />
            <Text style={styles.statValue}>{formatDistance(run.distanceKm)}</Text>
            <Text style={styles.statLabel}>Distance</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="time" size={32} color={colors.primary} />
            <Text style={styles.statValue}>{run.durationMin}m</Text>
            <Text style={styles.statLabel}>Duration</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="flash" size={32} color={colors.primary} />
            <Text style={styles.statValue}>{formatPace(run.avgPaceMinPerKm)}</Text>
            <Text style={styles.statLabel}>Average Pace</Text>
          </View>
        </View>

        {/* Detailed Stats */}
        <View style={styles.detailedStats}>
          <Text style={styles.sectionTitle}>Detailed Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.detailStat}>
              <Text style={styles.detailStatValue}>
                {run.durationMin > 0 ? (run.distanceKm / run.durationMin * 60).toFixed(2) : '0.00'}
              </Text>
              <Text style={styles.detailStatLabel}>km/h</Text>
            </View>
            <View style={styles.detailStat}>
              <Text style={styles.detailStatValue}>
                {run.distanceKm > 0 ? (run.durationMin / run.distanceKm).toFixed(1) : '0.0'}
              </Text>
              <Text style={styles.detailStatLabel}>min/km</Text>
            </View>
            <View style={styles.detailStat}>
              <Text style={styles.detailStatValue}>{(run.distanceKm * 1000).toFixed(0)}</Text>
              <Text style={styles.detailStatLabel}>meters</Text>
            </View>
            <View style={styles.detailStat}>
              <Text style={styles.detailStatValue}>{(run.durationMin * 60).toFixed(0)}</Text>
              <Text style={styles.detailStatLabel}>seconds</Text>
            </View>
          </View>
        </View>

        {/* Trajectory */}
        {renderTrajectory()}

        {/* Route Preview */}
        {run.routePreview && (
          <View style={styles.routePreview}>
            <Text style={styles.sectionTitle}>Route Preview</Text>
            <View style={styles.routeImageContainer}>
              <View style={styles.routeImagePlaceholder}>
                <Ionicons name="image" size={48} color={colors.muted} />
                <Text style={styles.routeImageText}>Route Image</Text>
              </View>
            </View>
          </View>
        )}

        {/* Caption */}
        {run.caption && (
          <View style={styles.captionSection}>
            <Text style={styles.sectionTitle}>Run Notes</Text>
            <Text style={styles.caption}>{run.caption}</Text>
          </View>
        )}
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
  header: {
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
  mainStats: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: {
    ...typography.h2,
    color: colors.text,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.caption,
    color: colors.muted,
  },
  detailedStats: {
    padding: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  detailStat: {
    width: (width - spacing.md * 3) / 2,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  detailStatValue: {
    ...typography.h3,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  detailStatLabel: {
    ...typography.caption,
    color: colors.muted,
  },
  trajectoryContainer: {
    padding: spacing.md,
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
  routePreview: {
    padding: spacing.md,
  },
  routeImageContainer: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  routeImagePlaceholder: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
  },
  routeImageText: {
    ...typography.body,
    color: colors.muted,
    marginTop: spacing.sm,
  },
  captionSection: {
    padding: spacing.md,
  },
  caption: {
    ...typography.body,
    color: colors.text,
    lineHeight: 24,
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
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
