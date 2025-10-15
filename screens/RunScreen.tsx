import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Alert, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RunStackParamList } from '../types/navigation';

type RunScreenNavigationProp = NativeStackNavigationProp<RunStackParamList, 'RunTracker'>;
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius, typography, useTheme as useTokensTheme } from '../theme';
import { useLegacyStyles } from '../theme/useLegacyStyles';
import * as Location from 'expo-location';
import { formatTime } from '../utils/format';
import { formatDistance as fmtDistance, formatPace as fmtPace, formatDuration as fmtDuration } from '../utils/formatters';
import { useStore } from '../state/store';
import MapView, { Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import { regionForCoordinates } from '../utils/geo';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import TopBar from '../components/TopBar';
import { useBottomTabOverflow } from '../components/ui/TabBarBackground.ios';

export const RunScreen: React.FC = () => {
  const navigation = useNavigation<RunScreenNavigationProp>();
  const [showPostForm, setShowPostForm] = useState(false);
  const [caption, setCaption] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | undefined>();
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [hasMotionPermission, setHasMotionPermission] = useState(true); // mock
  const [isLowPowerMode, setIsLowPowerMode] = useState(false); // mock
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdown, setCountdown] = useState(3);
  
  const runState = useStore((s) => s.runState);
  const startRun = useStore((s) => s.startRun);
  const tickRun = useStore((s) => s.tickRun);
  const setActivityType = useStore((s) => s.setActivityType);
  const endRun = useStore((s) => s.endRun);
  const postRun = useStore((s) => s.postRun);
  const onLocationUpdate = useStore((s) => s.onLocationUpdate);
  const pauseRun = useStore((s) => s.pauseRun);
  const resumeRun = useStore((s) => s.resumeRun);
  const unit = useStore((s) => s.unitPreference);
  const tabBarHeight = useBottomTabOverflow?.() ?? 0;
  const styles = useLegacyStyles(createStyles);
  const tokensTheme = useTokensTheme();
  
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    Location.getForegroundPermissionsAsync()
      .then(({ status }) => {
        setHasLocationPermission(status === 'granted');
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (runState.isRunning && !runState.isPaused) {
      intervalRef.current = setInterval(() => {
        tickRun();
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [runState.isRunning, runState.isPaused]);

  const locationWatchRef = useRef<Location.LocationSubscription | null>(null);

  const stopLocationWatch = async () => {
    if (locationWatchRef.current) {
      locationWatchRef.current.remove();
      locationWatchRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopLocationWatch();
    };
  }, []);

  const startTracking = useCallback(() => {
    Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.BestForNavigation })
      .then((pos) => {
        const { latitude, longitude } = pos.coords;
        onLocationUpdate(latitude, longitude, pos.timestamp);
      })
      .catch(() => {});
    Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 1000,
        distanceInterval: 1,
      },
      (pos) => {
        const { latitude, longitude, speed, accuracy } = pos.coords;
        onLocationUpdate(latitude, longitude, pos.timestamp, accuracy ?? undefined, speed ?? null);
      }
    )
      .then((sub) => {
        locationWatchRef.current = sub;
      })
      .catch(() => {});
  }, [onLocationUpdate]);

  const handleStartRun = async () => {
    if (!hasLocationPermission) {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      setHasLocationPermission(true);
    }
    setIsCountingDown(true);
    setCountdown(3);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const id = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(id);
          setIsCountingDown(false);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          // Defer the startRun call to the next tick to avoid render-phase updates
          setTimeout(() => {
            startRun();
            startTracking();
          }, 0);
          return 0;
        }
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        return c - 1;
      });
    }, 1000);
  };

  const handleEndRun = () => {
    Alert.alert(
      'End Run',
      'Are you sure you want to end this run?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: runState.activityType === 'walk' ? 'End Walk' : 'End Run',
          style: 'destructive',
          onPress: () => {
            endRun();
            setShowPostForm(true);
            stopLocationWatch();
          }
        }
      ]
    );
  };

  const handlePostRun = async () => {
    if (!caption.trim()) {
      Alert.alert('Error', 'Please add a caption to your run post.');
      return;
    }
    
    try {
      const ok = await postRun(caption.trim(), selectedImage);
      if (ok) {
        setCaption('');
        setSelectedImage(undefined);
        setShowPostForm(false);
        Alert.alert('Success', 'Run posted!');
      } else {
        // Check if it was an image upload failure
        if (selectedImage) {
          Alert.alert(
            'Upload Failed', 
            'Unable to upload your photo. Please check your connection and try again, or post without a photo.'
          );
        } else {
          Alert.alert('Error', 'Failed to publish your run. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error posting run:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    }
  };

  const handleSkipPost = () => {
    setCaption('');
    setSelectedImage(undefined);
    setShowPostForm(false);
  };

  const handleAddPhoto = () => {
    Alert.alert(
      'Add Photo',
      'Choose how you want to add a photo',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Take Photo', 
          onPress: handleTakePhoto 
        },
        { 
          text: 'Choose from Library', 
          onPress: handleChooseFromLibrary 
        }
      ]
    );
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Allow camera access to take a photo.');
      return;
    }
    
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    
    if (!result.canceled && result.assets?.length) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleChooseFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Allow photo access to attach an image to your post.');
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    
    if (!result.canceled && result.assets?.length) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleRemovePhoto = () => {
    setSelectedImage(undefined);
  };

  const handlePause = () => {
    pauseRun();
    stopLocationWatch();
  };

  const handleResume = () => {
    resumeRun();
    startTracking();
  };

  const requestLocation = () => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') setHasLocationPermission(true);
    })();
  };

  if (showPostForm) {
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView 
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.postFormContainer}>
              <View style={styles.header}>
                <Text style={styles.title}>Post Your Run</Text>
              </View>

              <View style={styles.postForm}>
                <View style={styles.runSummary}>
                  <Text style={styles.summaryTitle}>Run Summary</Text>
                  <View style={styles.summaryStats}>
                    <View style={styles.summaryStat}>
                      <Text style={styles.summaryValue}>
                        {formatDistance(runState.distanceKm, unit)}
                      </Text>
                      <Text style={styles.summaryLabel}>Distance</Text>
                    </View>
                    <View style={styles.summaryStat}>
                      <Text style={styles.summaryValue}>
                        {formatTime(runState.elapsedSeconds)}
                      </Text>
                      <Text style={styles.summaryLabel}>Duration</Text>
                    </View>
                    <View style={styles.summaryStat}>
                      <Text style={styles.summaryValue}>
                        {formatPace(runState.currentPace, unit)}
                      </Text>
                      <Text style={styles.summaryLabel}>Pace</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.captionSection}>
                  <Text style={styles.captionLabel}>Caption</Text>
                  <TextInput
                    style={styles.captionInput}
                    placeholder="How was your run?"
                    placeholderTextColor={colors.text.secondary}
                    value={caption}
                    onChangeText={setCaption}
                    multiline
                    numberOfLines={4}
                  />
                </View>

                <View style={styles.photoSection}>
                  <Text style={styles.photoLabel}>Photo (Optional)</Text>
                  {selectedImage ? (
                    <View style={styles.photoPreview}>
                      <Image source={{ uri: selectedImage }} style={styles.photoPreviewImage} contentFit="cover" />
                      <TouchableOpacity style={styles.removePhotoButton} onPress={handleRemovePhoto} accessibilityRole="button">
                        <Ionicons name="close-circle" size={22} color={colors.error} />
                        <Text style={styles.removePhotoText}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity style={styles.photoButton} onPress={handleAddPhoto}>
                      <View style={styles.photoButtonIcons}>
                        <Ionicons name="camera" size={20} color={colors.primary} />
                        <Ionicons name="images" size={20} color={colors.primary} />
                      </View>
                      <Text style={styles.photoButtonText}>Add Photo</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.postActions}>
                  <TouchableOpacity style={styles.skipButton} onPress={handleSkipPost}>
                    <Text style={styles.skipButtonText}>Skip</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.postButton, !caption.trim() && styles.postButtonDisabled]}
                    onPress={handlePostRun}
                    disabled={!caption.trim()}
                  >
                    <Text style={styles.postButtonText}>Post</Text>
                  </TouchableOpacity>
                </View>
                {/* Spacer to avoid overlap with floating tab bar */}
                <View style={{ height: tabBarHeight + spacing.lg }} />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: tokensTheme.mode === 'light' ? tokensTheme.colors.surface : tokensTheme.colors.bg },
      ]}
    >
      <TopBar
        title="STRD"
        leftIcon={{ icon: 'search', accessibilityLabel: 'Search', onPress: () => (navigation as any).navigate('Search' as never) }}
        rightActions={[{ icon: 'settings-outline', accessibilityLabel: 'Settings', onPress: () => (navigation as any).navigate('Profile' as never, { screen: 'Settings' } as never) }]}
        rightAvatar={{ source: (useStore.getState().currentUser?.avatar) || '', label: useStore.getState().currentUser?.name || 'Profile', onPress: () => (navigation as any).navigate('Profile' as never) }}
      />

      <View style={styles.content}>
        {!runState.isRunning ? (
          // Idle State
          <View style={styles.idleState}>
            {/* Status tiles */}
            <View style={styles.statusRow}>
              <View style={styles.statusTile} accessibilityRole="text" accessibilityLabel={`GPS ${hasLocationPermission ? 'OK' : 'Disabled'}`}>
                <Ionicons name={hasLocationPermission ? 'location' : 'location-outline'} size={18} color={hasLocationPermission ? colors.primary : colors.icon.secondary} />
                <Text style={styles.statusLabel}>GPS</Text>
              </View>
              <View style={styles.statusTile} accessibilityRole="text" accessibilityLabel={`Motion ${hasMotionPermission ? 'OK' : 'Disabled'}`}>
                <Ionicons name={hasMotionPermission ? 'walk' : 'walk-outline'} size={18} color={hasMotionPermission ? colors.primary : colors.icon.secondary} />
                <Text style={styles.statusLabel}>Motion</Text>
              </View>
              <View style={styles.statusTile} accessibilityRole="text" accessibilityLabel={`Low Power ${isLowPowerMode ? 'On' : 'Off'}`}>
                <Ionicons name={isLowPowerMode ? 'battery-dead' : 'battery-half'} size={18} color={isLowPowerMode ? colors.primary : colors.icon.secondary} />
                <Text style={styles.statusLabel}>Low Power</Text>
              </View>
            </View>

            <View style={styles.idleIcon}>
              <Ionicons name="play-circle" size={80} color={colors.primary} />
            </View>
            <Text style={styles.idleTitle}>Ready to run?</Text>
            <Text style={styles.idleSubtitle}>We’ll track distance, route, and pace. Low Power reduces GPS checks.</Text>
            <View style={{ alignSelf: 'stretch' }}>
              <TouchableOpacity style={[styles.startButton, !hasLocationPermission && styles.startButtonDisabled]} onPress={() => { setActivityType('run'); handleStartRun(); }} accessibilityRole="button" hitSlop={12} disabled={!hasLocationPermission}>
                <Text style={styles.startButtonText}>Start Run</Text>
              </TouchableOpacity>
              <View style={{ height: spacing.sm }} />
              <TouchableOpacity style={[styles.startButton, !hasLocationPermission && styles.startButtonDisabled]} onPress={() => { setActivityType('walk'); handleStartRun(); }} accessibilityRole="button" hitSlop={12} disabled={!hasLocationPermission}>
                <Text style={styles.startButtonText}>Start Walk</Text>
              </TouchableOpacity>
              {!hasLocationPermission && (
                <TouchableOpacity style={styles.enableButton} onPress={requestLocation} accessibilityRole="button" hitSlop={12}>
                  <Text style={styles.enableButtonText}>Enable Location</Text>
                </TouchableOpacity>
              )}
            </View>
            {isCountingDown && (
              <View style={styles.countdownOverlay} accessibilityLabel={`Starting in ${countdown}`}>
                <Text style={styles.countdownText}>{countdown}</Text>
              </View>
            )}
          </View>
        ) : (
          // Running State
          <View style={styles.runningState}>
            {/* Timer */}
            <View style={styles.timerSection}>
              <Text style={styles.timer}>{formatTime(runState.elapsedSeconds)}</Text>
              <Text style={styles.timerLabel}>Elapsed Time</Text>
            </View>

            {/* Live Metrics */}
            <View style={styles.metricsSection}>
              <View style={styles.metric}>
                <Ionicons name="speedometer" size={32} color={colors.primary} />
                <Text style={styles.metricValue}>{fmtDistance(runState.distanceKm * 1000)}</Text>
                <Text style={styles.metricLabel}>Distance</Text>
              </View>
              <View style={styles.metric}>
                <Ionicons name="flash" size={32} color={colors.primary} />
                <Text style={styles.metricValue}>{runState.currentPace > 0 ? fmtPace(Math.round(runState.currentPace * 60)) : '–'}</Text>
                <Text style={styles.metricLabel}>Current Pace</Text>
              </View>
              <View style={styles.metric}>
                <Ionicons name="speedometer-outline" size={32} color={colors.primary} />
                <Text style={styles.metricValue}>
                  {Math.max(0, Math.round((runState.currentSpeedKmh || 0) * 10) / 10)} km/h
                </Text>
                <Text style={styles.metricLabel}>Speed</Text>
              </View>
            </View>

            {/* Live Route Map */}
            <View style={styles.routePreview}>
              <MapView
                style={{ flex: 1, borderRadius: borderRadius.lg }}
                provider={PROVIDER_DEFAULT}
                showsCompass={false}
                showsUserLocation
                initialRegion={{ latitude: 37.78825, longitude: -122.4324, latitudeDelta: 0.01, longitudeDelta: 0.01 }}
                region={(() => {
                  const pts = runState.path?.map(p => ({ latitude: p.latitude, longitude: p.longitude })) || [];
                  if (pts.length >= 2) return regionForCoordinates(pts);
                  if (runState.lastLocation) {
                    const { latitude, longitude } = runState.lastLocation;
                    return { latitude, longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 };
                  }
                  return undefined as any;
                })()}
                pointerEvents="none"
              >
                {runState.path.length > 1 && (
                  <Polyline
                    coordinates={runState.path.map(p => ({ latitude: p.latitude, longitude: p.longitude }))}
                    strokeColor={colors.primary}
                    strokeWidth={4}
                  />
                )}
              </MapView>
            </View>

            {/* Controls */}
            <View style={styles.controlRow}>
              <TouchableOpacity
                style={[styles.pauseButton, runState.isPaused && styles.pauseButtonActive]}
                onPress={runState.isPaused ? handleResume : handlePause}
                accessibilityRole="button"
                hitSlop={12}
              >
                <Ionicons name={runState.isPaused ? 'play' : 'pause'} size={22} color={colors.primary} />
                <Text style={styles.pauseButtonText}>{runState.isPaused ? 'Resume' : 'Pause'}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.endButton} onPress={handleEndRun} accessibilityRole="button" hitSlop={12}>
                <Text style={styles.endButtonText}>{runState.activityType === 'walk' ? 'End Walk' : 'End Run'}</Text>
              </TouchableOpacity>
            </View>
            <View style={{ height: tabBarHeight + spacing.lg }} />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const createStyles = () => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {},
  title: {},
  content: {
    flex: 1,
    padding: spacing.md,
  },
  idleState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusRow: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusTile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusLabel: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600',
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  idleIcon: {
    marginBottom: spacing.xl,
  },
  idleTitle: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  idleSubtitle: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  startButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  startButtonDisabled: {
    opacity: 0.5,
  },
  startButtonText: {
    ...typography.h3,
    color: colors.bg,
    fontWeight: '600',
  },
  enableButton: {
    backgroundColor: colors.card,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  enableButtonText: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
  runningState: {
    flex: 1,
  },
  timerSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingTop: spacing.lg,
  },
  timer: {
    ...typography.h1,
    color: colors.primary,
    fontSize: 56,
    fontWeight: 'bold',
    lineHeight: 64,
    includeFontPadding: false,
  },
  timerLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.sm,
  },
  metricsSection: {
    flexDirection: 'row',
    marginBottom: spacing.xl,
  },
  metric: {
    flex: 1,
    alignItems: 'center',
  },
  metricValue: {
    ...typography.h2,
    color: colors.text.primary,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  metricLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  routePreview: {
    flex: 1,
    marginBottom: spacing.xl,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
  },
  pauseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  pauseButtonActive: {
    borderColor: colors.primary,
  },
  pauseButtonText: {
    ...typography.body,
    color: colors.primary,
    marginLeft: spacing.sm,
    fontWeight: '600',
  },
  routePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  routeText: {
    ...typography.body,
    color: colors.text.secondary,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  progressBar: {
    width: '80%',
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  countdownOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.scrim,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    paddingTop: 100,
  },
  countdownText: {
    ...typography.h1,
    color: colors.primary,
    fontSize: 80,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    includeFontPadding: false,
    textAlignVertical: 'center',
    lineHeight: 80,
  },
  endButton: {
    flex: 1,
    marginLeft: spacing.md,
    backgroundColor: colors.error,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  endButtonText: {
    ...typography.body,
    color: colors.onPrimary,
    fontWeight: '700',
  },
  postForm: {
    flex: 1,
    padding: spacing.md,
  },
  runSummary: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  summaryStats: {
    flexDirection: 'row',
  },
  summaryStat: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    ...typography.h3,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  captionSection: {
    marginBottom: spacing.lg,
  },
  captionLabel: {
    ...typography.body,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  captionInput: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text.primary,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  photoSection: {
    marginBottom: spacing.lg,
  },
  photoLabel: {
    ...typography.body,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  photoButtonIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  photoButtonText: {
    ...typography.body,
    color: colors.primary,
    marginLeft: spacing.sm,
    fontWeight: '600',
  },
  photoPreview: {
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  photoPreviewImage: {
    width: '100%',
    height: 160,
    backgroundColor: colors.border,
  },
  removePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
    backgroundColor: colors.card,
  },
  removePhotoText: {
    ...typography.caption,
    color: colors.error,
    marginLeft: spacing.xs,
    fontWeight: '600',
  },
  postActions: {
    flexDirection: 'row',
    marginTop: 'auto',
  },
  skipButton: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    marginRight: spacing.sm,
    alignItems: 'center',
  },
  skipButtonText: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
  postButton: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    marginLeft: spacing.sm,
    alignItems: 'center',
  },
  postButtonDisabled: {
    opacity: 0.5,
  },
  postButtonText: {
    ...typography.body,
    color: colors.bg,
    fontWeight: '600',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  postFormContainer: {
    flex: 1,
  },
});
