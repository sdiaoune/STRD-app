import React from 'react';
import { View, Text } from 'react-native';
import { OutlineButton } from './OutlineButton';
import { typography } from '../tokens';

interface Props {
  onRetry: () => void;
}

export const OfflineBanner: React.FC<Props> = ({ onRetry }) => (
  <View className="w-full bg-warning flex-row items-center justify-between px-4 py-2">
    <Text style={typography.body} className="text-onPrimary flex-1 mr-2">
      {`You're offline. We'll retry when you're back.`}
    </Text>
    <OutlineButton title="Retry" onPress={onRetry} />
  </View>
);
