import { Ionicons } from '@expo/vector-icons';
import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import MapView, { Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '../components/Avatar';
import { useStore } from '../state/store';
import { borderRadius, colors, spacing, typography } from '../theme';
import Stat from '../components/ui/Stat';
import MapCard from '../components/ui/MapCard';
import { formatDistance as fmtDistance, formatDuration as fmtDuration, formatPace as fmtPace } from '../utils/formatters';
import { useLegacyStyles } from '../theme/useLegacyStyles';
import type { TimelineStackParamList } from '../types/navigation';
import { formatDistance, formatPace, getRelativeTime } from '../utils/format';
import { decodePolyline, regionForCoordinates } from '../utils/geo';
import { openUserProfile } from '../utils/openUserProfile';


type RunStatsScreenNavigationProp = NativeStackNavigationProp<TimelineStackParamList, 'RunStats'>;
type RunStatsScreenRouteProp = RouteProp<TimelineStackParamList, 'RunStats'>;

const { width } = Dimensions.get('window');

export const RunStatsScreen: React.FC = () => {
  const navigation = useNavigation<RunStatsScreenNavigationProp>();
  const route = useRoute<RunStatsScreenRouteProp>();
  const { runId } = route.params;

  const { postById, userById, currentUser } = useStore();
  const unit = useStore(state => state.unitPreference);
  const run = postById(runId);
  const user = run ? userById(run.userId) : null;
  const styles = useLegacyStyles(createStyles);

  if (!run || !user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Run not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const coords = run.routePolyline ? decodePolyline(run.routePolyline) : [];
  const [routeSize, setRouteSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  const renderTrajectory = () => {
    const isOwner = currentUser.id === run.userId;
    const isFollower = useStore.getState().followingUserIds.includes(run.userId);
    const canShowMap = isOwner;
    const canShowRoute = isOwner || isFollower;
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
                  initialRegion={{ latitude: coords[0]?.latitude || 37.78825, longitude: coords[0]?.longitude || -122.4324, latitudeDelta: 0.05, longitudeDelta: 0.05 }}
                  region={coords.length > 1 ? regionForCoordinates(coords) : undefined as any}
                >
                  {coords.length > 1 && (
                    <Polyline coordinates={coords} strokeColor={colors.primary} strokeWidth={4} />
                  )}
                </MapView>
              </MapCard>
            ) : canShowRoute ? (
              <MapCard>
                <View style={{ width: '100%', height: '100%' }}>
                  <MapView
                    style={{ width: '100%', height: '100%' }}
                    provider={PROVIDER_DEFAULT}
                    scrollEnabled={false}
                    zoomEnabled={false}
                    pitchEnabled={false}
                    rotateEnabled={false}
                    region={coords.length > 1 ? regionForCoordinates(coords) : undefined as any}
                    initialRegion={{ latitude: coords[0]?.latitude || 37.78825, longitude: coords[0]?.longitude || -122.4324, latitudeDelta: 0.05, longitudeDelta: 0.05 }}
                  />
                  <View style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, backgroundColor: '#000' }} />
                  <View
                    style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }}
                    onLayout={(e) => setRouteSize({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}
                  >
                    {coords.length > 1 ? (
                      <View style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }}>
                        {(() => {
                          const pad = 12;
                          const fitted = regionForCoordinates(coords);
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
                          const points = coords.map(p => toXY(p.latitude, p.longitude));
                          const segs: any[] = [];
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
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.userInfo} onPress={() => openUserProfile(navigation as any, run.userId)} accessibilityRole="button" hitSlop={12}>
            <Avatar source={user.avatar} size={48} />
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userHandle}>{user.handle}</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.timestamp}>{getRelativeTime(run.createdAtISO)}</Text>
        </View>

        {/* Main Stats */}
        <View style={styles.mainStats}>
          <Stat icon="speedometer" value={formatDistance(run.distanceKm, unit)} label="Distance" />
          <Stat icon="time" value={fmtDuration(Math.max(0, Math.round(run.durationMin * 60)))} label="Duration" />
          <Stat icon="flash" value={formatPace(run.avgPaceMinPerKm, unit)} label={unit === 'imperial' ? 'Avg Pace (min/mi)' : 'Avg Pace (min/km)'} />
        </View>

        {/* Detailed Stats */}
        <View style={styles.detailedStats}>
          <Text style={styles.sectionTitle}>Detailed Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.detailStat}>
              <Text style={styles.detailStatValue}>
                {(() => {
                  const kmh = run.durationMin > 0 ? (run.distanceKm / run.durationMin * 60) : 0;
                  const value = unit === 'imperial' ? kmh * 0.621371 : kmh;
                  return value.toFixed(2);
                })()}
              </Text>
              <Text style={styles.detailStatLabel}>{unit === 'imperial' ? 'mph' : 'km/h'}</Text>
            </View>
            <View style={styles.detailStat}>
              <Text style={styles.detailStatValue}>
                {(() => {
                  const minPerKm = run.distanceKm > 0 ? (run.durationMin / run.distanceKm) : 0;
                  const value = unit === 'imperial' ? (minPerKm * 1.60934) : minPerKm;
                  return value.toFixed(1);
                })()}
              </Text>
              <Text style={styles.detailStatLabel}>{unit === 'imperial' ? 'min/mi' : 'min/km'}</Text>
            </View>
            <View style={styles.detailStat}>
              <Text style={styles.detailStatValue}>{formatDistance(run.distanceKm, unit)}</Text>
              <Text style={styles.detailStatLabel}>distance</Text>
            </View>
            <View style={styles.detailStat}>
              <Text style={styles.detailStatValue}>{fmtDuration(Math.max(0, Math.round(run.durationMin * 60)))}</Text>
              <Text style={styles.detailStatLabel}>duration</Text>
            </View>
          </View>
        </View>

        {/* Trajectory */}
        {renderTrajectory()}

        {/* Route Preview */}
        {/* {run.routePreview && (
          <View style={styles.routePreview}>
            <Text style={styles.sectionTitle}>Route Preview</Text>
            <View style={styles.routeImageContainer}>
              <View style={styles.routeImagePlaceholder}>
                <Ionicons name="image" size={48} color={colors.icon.secondary} />
                <Text style={styles.routeImageText}>Route Image</Text>
              </View>
            </View>
          </View>
        )} */}

        {/* Caption */}
        {run.caption && (
          <View style={styles.captionSection}>
            <Text style={styles.sectionTitle}>Run Notes</Text>
            <Text style={styles.caption}>{run.caption}</Text>
          </View>
        )}
        <View style={{ height: 250 }} />
      </ScrollView>
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
    color: colors.text.primary,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  detailedStats: {
    padding: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
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
    color: colors.text.secondary,
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
    color: colors.text.secondary,
    marginTop: spacing.sm,
  },
  captionSection: {
    padding: spacing.md,
  },
  caption: {
    ...typography.body,
    color: colors.text.primary,
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
    color: colors.text.secondary,
  },
});
