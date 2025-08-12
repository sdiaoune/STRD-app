import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from './Button';
import { OutlineButton } from './OutlineButton';
import { colors, spacing, typography, motion } from '../tokens';

interface Props {
  isRunning: boolean;
  elapsedTime?: number; // in seconds
  distance?: number; // in meters
  pace?: number; // in seconds per km
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onEnd: () => void;
  hasLocationPermission?: boolean;
}

export const RunControls: React.FC<Props> = ({
  isRunning,
  elapsedTime = 0,
  distance = 0,
  pace = 0,
  onStart,
  onPause,
  onResume,
  onEnd,
  hasLocationPermission = true,
}) => {
  const [isPaused, setIsPaused] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const holdAnim = useRef(new Animated.Value(0)).current;

  // Pulse animation for pre-start play button
  useEffect(() => {
    if (!isRunning) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [isRunning]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(2)}km`;
  };

  const formatPace = (secondsPerKm: number) => {
    const minutes = Math.floor(secondsPerKm / 60);
    const seconds = Math.floor(secondsPerKm % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}/km`;
  };

  const handleEndPressIn = () => {
    setHoldProgress(0);
    Animated.timing(holdAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: false,
    }).start();
  };

  const handleEndPressOut = () => {
    setHoldProgress(0);
    holdAnim.setValue(0);
  };

  const handleEndPress = () => {
    if (holdProgress >= 0.8) {
      onEnd();
    }
  };

  if (!isRunning) {
    return (
      <View style={styles.container}>
        <View style={styles.preStartContainer}>
          <Animated.View
            style={[
              styles.playButtonContainer,
              {
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            <Pressable
              style={styles.playButton}
              onPress={onStart}
              disabled={!hasLocationPermission}
              accessibilityRole="button"
              accessibilityLabel="Start run"
            >
              <Ionicons name="play" size={48} color={colors.onPrimary} />
            </Pressable>
          </Animated.View>
          
          <Text style={styles.helperText}>
            We'll track time, distance & route. You can pause anytime.
          </Text>
          
          {!hasLocationPermission && (
            <View style={styles.errorBanner}>
              <Ionicons name="location-off" size={20} color={colors.error} />
              <Text style={styles.errorText}>
                Location permission required to start tracking
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.statsContainer}>
        <View style={styles.mainStat}>
          <Text style={styles.elapsedTime}>{formatTime(elapsedTime)}</Text>
          <Text style={styles.elapsedLabel}>Elapsed Time</Text>
        </View>
        
        <View style={styles.secondaryStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatDistance(distance)}</Text>
            <Text style={styles.statLabel}>Distance</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatPace(pace)}</Text>
            <Text style={styles.statLabel}>Pace</Text>
          </View>
        </View>
      </View>

      <View style={styles.controlsContainer}>
        {isPaused ? (
          <Button onPress={() => { setIsPaused(false); onResume(); }}>
            Resume
          </Button>
        ) : (
          <Button onPress={() => { setIsPaused(true); onPause(); }}>
            Pause
          </Button>
        )}
        
        <Pressable
          style={styles.endButton}
          onPressIn={handleEndPressIn}
          onPressOut={handleEndPressOut}
          onPress={handleEndPress}
          accessibilityRole="button"
          accessibilityLabel="End run (hold for 800ms)"
        >
          <Animated.View
            style={[
              styles.endButtonProgress,
              {
                width: `${holdProgress * 100}%`,
              },
            ]}
          />
          <Text style={styles.endButtonText}>End Run</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
  },
  preStartContainer: {
    alignItems: 'center',
  },
  playButtonContainer: {
    marginBottom: spacing[6],
  },
  playButton: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  helperText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 280,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error + '20',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderRadius: 8,
    marginTop: spacing[4],
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginLeft: spacing[2],
  },
  statsContainer: {
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  mainStat: {
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  elapsedTime: {
    fontSize: 48,
    lineHeight: 56,
    fontWeight: '800',
    color: colors.text,
  },
  elapsedLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  secondaryStats: {
    flexDirection: 'row',
    gap: spacing[6],
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...typography.title,
    color: colors.text,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  controlsContainer: {
    flexDirection: 'row',
    gap: spacing[3],
    width: '100%',
  },
  endButton: {
    flex: 1,
    height: 56,
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  endButtonProgress: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.error + '20',
  },
  endButtonText: {
    ...typography.body,
    color: colors.error,
    fontWeight: '600',
  },
});
