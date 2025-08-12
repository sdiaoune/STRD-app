import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Alert, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RunStackParamList } from '../types/navigation';

type RunScreenNavigationProp = NativeStackNavigationProp<RunStackParamList, 'RunTracker'>;
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius, typography } from '../theme';
import { formatTime, formatDistance, formatPace } from '../utils/format';
import { useStore } from '../state/store';

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
  const endRun = useStore((s) => s.endRun);
  const postRun = useStore((s) => s.postRun);
  
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (runState.isRunning) {
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
  }, [runState.isRunning]);

  const handleStartRun = () => {
    if (!hasLocationPermission) return;
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
          text: 'End Run', 
          style: 'destructive',
          onPress: () => {
            endRun();
            setShowPostForm(true);
          }
        }
      ]
    );
  };

  const handlePostRun = () => {
    if (caption.trim()) {
      postRun(caption.trim(), selectedImage);
      setCaption('');
      setSelectedImage(undefined);
      setShowPostForm(false);
      // Navigate to timeline - this would need to be handled differently in a real app
      console.log('Navigate to timeline');
    } else {
      Alert.alert('Error', 'Please add a caption to your run post.');
    }
  };

  const handleSkipPost = () => {
    setCaption('');
    setSelectedImage(undefined);
    setShowPostForm(false);
  };

  const handleAddPhoto = () => {
    // Placeholder for photo picker
    Alert.alert('Photo Picker', 'Photo picker functionality would be implemented here.');
  };

  const requestLocation = () => {
    Alert.alert('Location Permission', 'Grant location to enable GPS tracking (mock).', [
      { text: 'Not now', style: 'cancel' },
      { text: 'Grant', onPress: () => setHasLocationPermission(true) },
    ]);
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
                        {formatDistance(runState.distanceKm)}
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
                        {formatPace(runState.currentPace)}
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
                    placeholderTextColor={colors.muted}
                    value={caption}
                    onChangeText={setCaption}
                    multiline
                    numberOfLines={4}
                  />
                </View>

                <View style={styles.photoSection}>
                  <Text style={styles.photoLabel}>Photo (Optional)</Text>
                  <TouchableOpacity style={styles.photoButton} onPress={handleAddPhoto}>
                    <Ionicons name="camera" size={24} color={colors.primary} />
                    <Text style={styles.photoButtonText}>Add Photo</Text>
                  </TouchableOpacity>
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
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Run</Text>
      </View>

      <View style={styles.content}>
        {!runState.isRunning ? (
          // Idle State
          <View style={styles.idleState}>
            {/* Status tiles */}
            <View style={styles.statusRow}>
              <View style={styles.statusTile} accessibilityRole="text" accessibilityLabel={`GPS ${hasLocationPermission ? 'OK' : 'Disabled'}`}>
                <Ionicons name={hasLocationPermission ? 'location' : 'location-outline'} size={18} color={hasLocationPermission ? colors.primary : colors.muted} />
                <Text style={styles.statusLabel}>GPS</Text>
              </View>
              <View style={styles.statusTile} accessibilityRole="text" accessibilityLabel={`Motion ${hasMotionPermission ? 'OK' : 'Disabled'}`}>
                <Ionicons name={hasMotionPermission ? 'walk' : 'walk-outline'} size={18} color={hasMotionPermission ? colors.primary : colors.muted} />
                <Text style={styles.statusLabel}>Motion</Text>
              </View>
              <View style={styles.statusTile} accessibilityRole="text" accessibilityLabel={`Low Power ${isLowPowerMode ? 'On' : 'Off'}`}>
                <Ionicons name={isLowPowerMode ? 'battery-dead' : 'battery-half'} size={18} color={isLowPowerMode ? colors.warning : colors.muted} />
                <Text style={styles.statusLabel}>Low Power</Text>
              </View>
            </View>

            <View style={styles.idleIcon}>
              <Ionicons name="play-circle" size={80} color={colors.primary} />
            </View>
            <Text style={styles.idleTitle}>Ready to Run?</Text>
            <Text style={styles.idleSubtitle}>
              Tap the button below to start tracking your run
            </Text>
            <View style={{ alignSelf: 'stretch' }}>
              <TouchableOpacity style={[styles.startButton, !hasLocationPermission && styles.startButtonDisabled]} onPress={handleStartRun} accessibilityRole="button" hitSlop={12} disabled={!hasLocationPermission}>
                <Text style={styles.startButtonText}>Start Run</Text>
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
                <Text style={styles.metricValue}>
                  {formatDistance(runState.distanceKm)}
                </Text>
                <Text style={styles.metricLabel}>Distance</Text>
              </View>
              <View style={styles.metric}>
                <Ionicons name="flash" size={32} color={colors.primary} />
                <Text style={styles.metricValue}>
                  {formatPace(runState.currentPace)}
                </Text>
                <Text style={styles.metricLabel}>Current Pace</Text>
              </View>
            </View>

            {/* Route Preview Placeholder */}
            <View style={styles.routePreview}>
              <View style={styles.routePlaceholder}>
                <Ionicons name="map" size={48} color={colors.muted} />
                <Text style={styles.routeText}>Route Preview</Text>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${Math.min((runState.distanceKm / 10) * 100, 100)}%` }
                    ]} 
                  />
                </View>
              </View>
            </View>

            {/* End Run Button */}
            <TouchableOpacity style={styles.endButton} onPress={handleEndRun} accessibilityRole="button" hitSlop={12}>
              <Text style={styles.endButtonText}>End Run</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    textAlign: 'center',
  },
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
    ...typography.caption,
    color: colors.muted,
    marginLeft: spacing.xs,
  },
  idleIcon: {
    marginBottom: spacing.xl,
  },
  idleTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  idleSubtitle: {
    ...typography.body,
    color: colors.muted,
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
    color: colors.text,
    fontWeight: '600',
  },
  runningState: {
    flex: 1,
  },
  timerSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  timer: {
    ...typography.h1,
    color: colors.primary,
    fontSize: 48,
    fontWeight: 'bold',
  },
  timerLabel: {
    ...typography.caption,
    color: colors.muted,
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
    color: colors.text,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  metricLabel: {
    ...typography.caption,
    color: colors.muted,
  },
  routePreview: {
    flex: 1,
    marginBottom: spacing.xl,
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
    color: colors.muted,
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
    backgroundColor: 'rgba(0,0,0,0.9)',
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
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  endButtonText: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: '600',
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
    color: colors.text,
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
    color: colors.muted,
  },
  captionSection: {
    marginBottom: spacing.lg,
  },
  captionLabel: {
    ...typography.body,
    color: colors.text,
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  captionInput: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  photoSection: {
    marginBottom: spacing.lg,
  },
  photoLabel: {
    ...typography.body,
    color: colors.text,
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
  photoButtonText: {
    ...typography.body,
    color: colors.primary,
    marginLeft: spacing.sm,
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
    color: colors.text,
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
