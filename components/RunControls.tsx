import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Button } from './Button';
import { OutlineButton } from './OutlineButton';
import { formatTime, formatDistance, formatPace } from '../utils/format';
import { typography } from '../tokens';

interface Props {
  status: 'idle' | 'running' | 'paused';
  elapsedSec: number;
  distanceKm: number;
  pace: number;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onEnd: () => void;
}

export const RunControls: React.FC<Props> = ({
  status,
  elapsedSec,
  distanceKm,
  pace,
  onStart,
  onPause,
  onResume,
  onEnd,
}) => {
  if (status === 'idle') {
    return (
      <View className="items-center justify-center flex-1">
        <Pressable
          accessibilityRole="button"
          onPress={onStart}
          className="w-24 h-24 rounded-full bg-primary items-center justify-center"
        >
          <Text className="text-onPrimary" style={{ fontSize: 32 }}>▶</Text>
        </Pressable>
        <Text className="text-text mt-4 text-center" style={typography.body}>
          We’ll track time, distance & route. You can pause anytime.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-text" style={{ fontSize: 48, fontWeight: '800', lineHeight: 56 }}>
        {formatTime(elapsedSec)}
      </Text>
      <View className="flex-row mt-4">
        <View className="items-center mr-8">
          <Text className="text-textMuted" style={typography.caption}>Distance</Text>
          <Text className="text-text" style={typography.title}>{formatDistance(distanceKm)}</Text>
        </View>
        <View className="items-center">
          <Text className="text-textMuted" style={typography.caption}>Pace</Text>
          <Text className="text-text" style={typography.title}>{formatPace(pace)}</Text>
        </View>
      </View>
      <View className="flex-row mt-6 space-x-3">
        {status === 'running' ? (
          <OutlineButton title="Pause" onPress={onPause} />
        ) : (
          <Button title="Resume" onPress={onResume} variant="primary" />
        )}
        <OutlineButton title="End Run" variant="destructive" onPress={onEnd} />
      </View>
    </View>
  );
};
