import { Ionicons } from '@expo/vector-icons';
import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import MapView, { Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '../components/Avatar';
import { useStore } from '../state/store';
import { borderRadius, colors, spacing, typography } from '../theme';
import { useLegacyStyles } from '../theme/useLegacyStyles';
import type { TimelineStackParamList } from '../types/navigation';
import { formatDistance, formatPace, getRelativeTime } from '../utils/format';
import { decodePolyline, regionForCoordinates } from '../utils/geo';


type RunStatsScreenNavigationProp = NativeStackNavigationProp<TimelineStackParamList, 'RunStats'>;
type RunStatsScreenRouteProp = RouteProp<TimelineStackParamList, 'RunStats'>;

const { width } = Dimensions.get('window');

export const RunStatsScreen: React.FC = () => {
  const navigation = useNavigation<RunStatsScreenNavigationProp>();
  const route = useRoute<RunStatsScreenRouteProp>();
  const { runId } = route.params;

  const { postById, userById } = useStore();
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
                region={coords.length > 1 ? regionForCoordinates(coords) : undefined as any}
              >
                {coords.length > 1 && (
                  <Polyline
                    coordinates={coords}
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
            <Text style={styles.statValue}>{formatDistance(run.distanceKm, unit)}</Text>
            <Text style={styles.statLabel}>Distance</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="time" size={32} color={colors.primary} />
            <Text style={styles.statValue}>{run.durationMin}m</Text>
            <Text style={styles.statLabel}>Duration</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="flash" size={32} color={colors.primary} />
            <Text style={styles.statValue}>{formatPace(run.avgPaceMinPerKm, unit)}</Text>
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
                <Ionicons name="image" size={48} color={colors.icon.secondary} />
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
    color: colors.text.primary,
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
    color: colors.muted,
  },
});
