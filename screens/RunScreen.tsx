import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Alert, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RunStackParamList } from '../types/navigation';

type RunScreenNavigationProp = NativeStackNavigationProp<RunStackParamList, 'RunTracker'>;
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../theme';
import { formatTime, formatDistance, formatPace } from '../utils/format';
import { useStore } from '../state/store';

export const RunScreen: React.FC = () => {
  const navigation = useNavigation<RunScreenNavigationProp>();
  const [showPostForm, setShowPostForm] = useState(false);
  const [caption, setCaption] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | undefined>();
  
  const { 
    runState, 
    startRun, 
    tickRun, 
    endRun, 
    postRun 
  } = useStore();
  
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
  }, [runState.isRunning, tickRun]);

  const handleStartRun = () => {
    startRun();
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
            <View style={styles.idleIcon}>
              <Ionicons name="play-circle" size={80} color={colors.primary} />
            </View>
            <Text style={styles.idleTitle}>Ready to Run?</Text>
            <Text style={styles.idleSubtitle}>
              Tap the button below to start tracking your run
            </Text>
            <TouchableOpacity style={styles.startButton} onPress={handleStartRun}>
              <Text style={styles.startButtonText}>Start Run</Text>
            </TouchableOpacity>
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
            <TouchableOpacity style={styles.endButton} onPress={handleEndRun}>
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
  startButtonText: {
    ...typography.h3,
    color: colors.bg,
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
