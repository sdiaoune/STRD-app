import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EventCard } from '../components/EventCard';
import { RunPostCard } from '../components/RunPostCard';
import { useStore } from '../state/store';
import { typography, spacing } from '../tokens';

export const Timeline: React.FC = () => {
  const { timelineItems, postById, eventById } = useStore();

  const renderItem = (item: any) => {
    if (item.type === 'run') {
      const post = postById(item.refId);
      if (!post) return null;
      return <RunPostCard key={item.refId} post={post} onPress={() => {}} />;
    }
    const event = eventById(item.refId);
    if (!event) return null;
    return <EventCard key={item.refId} event={event} onPress={() => {}} />;
  };

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <View className="px-4 pt-4 pb-2">
        <Text className="text-text" style={typography.h1}>Timeline</Text>
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing[4], paddingBottom: spacing[7] }}>
        {timelineItems.map(renderItem)}
      </ScrollView>
    </SafeAreaView>
  );
};
