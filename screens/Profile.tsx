import React from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../state/store';
import { Avatar } from '../components/Avatar';
import { RunPostCard } from '../components/RunPostCard';
import { typography, spacing, colors } from '../theme';

export const Profile: React.FC = () => {
  const { currentUser, runPosts } = useStore();
  const userRuns = runPosts.filter((p) => p.userId === currentUser.id);
  const totalRuns = userRuns.length;
  const totalDistance = userRuns.reduce((s, r) => s + r.distanceKm, 0);

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView contentContainerStyle={{ paddingBottom: spacing[7] }}>
        <View className="items-center px-6 pt-6">
          <Avatar source={currentUser.avatar} size={80} />
          <TouchableOpacity className="absolute right-6 top-6" accessibilityRole="button">
            <Ionicons name="create-outline" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text className="text-text mt-4" style={typography.h2}>{currentUser.name}</Text>
          <Text className="text-textMuted" style={typography.body}>{currentUser.handle}</Text>
          <Text className="text-text text-center mt-2" numberOfLines={3} style={typography.body}>
            Passionate runner from {currentUser.city}. Always looking for new challenges and great routes!
          </Text>
        </View>

        <View className="flex-row mt-6 border-t border-b border-border">
          <View className="flex-1 items-center py-4 border-r border-border">
            <Text className="text-text" style={{ fontSize: 24, lineHeight: 28, fontWeight: '700' }}>{totalRuns}</Text>
            <Text className="text-textMuted" style={{ fontSize: 12, lineHeight: 16 }}>Runs</Text>
          </View>
          <View className="flex-1 items-center py-4">
            <Text className="text-text" style={{ fontSize: 24, lineHeight: 28, fontWeight: '700' }}>{totalDistance.toFixed(1)}</Text>
            <Text className="text-textMuted" style={{ fontSize: 12, lineHeight: 16 }}>km</Text>
          </View>
        </View>

        <View className="px-6 mt-6">
          <Text className="text-text mb-4" style={typography.h3}>Recent Posts</Text>
          {userRuns.length > 0 ? (
            userRuns.slice(0, 3).map((run) => <RunPostCard key={run.id} post={run} onPress={() => {}} />)
          ) : (
            <Text className="text-textMuted" style={typography.body}>No posts yet</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
