import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Button } from './Button';
import { OutlineButton } from './OutlineButton';

interface Props {
  primaryLabel: string;
  secondaryLabel?: string;
  onPrimary: () => void;
  onSecondary?: () => void;
}

export const StickyBottomCTA: React.FC<Props> = ({
  primaryLabel,
  secondaryLabel,
  onPrimary,
  onSecondary,
}) => (
  <SafeAreaView edges={["bottom"]} className="absolute left-0 right-0 bottom-0">
    <BlurView intensity={30} tint="dark" className="h-24 px-4 justify-center">
      <View className="flex-row space-x-3">
        <Button title={primaryLabel} onPress={onPrimary} className="flex-1" />
        {secondaryLabel && (
          <OutlineButton
            title={secondaryLabel}
            onPress={onSecondary}
            className="flex-1"
          />
        )}
      </View>
    </BlurView>
  </SafeAreaView>
);
