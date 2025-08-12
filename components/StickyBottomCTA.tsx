import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Button } from './Button';
import { OutlineButton } from './OutlineButton';
import { colors, spacing } from '../tokens';

interface Props {
  primaryText: string;
  secondaryText?: string;
  onPrimaryPress: () => void;
  onSecondaryPress?: () => void;
  primaryDisabled?: boolean;
  secondaryDisabled?: boolean;
}

export const StickyBottomCTA: React.FC<Props> = ({
  primaryText,
  secondaryText,
  onPrimaryPress,
  onSecondaryPress,
  primaryDisabled = false,
  secondaryDisabled = false,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <BlurView intensity={80} style={styles.blurContainer}>
        <View style={styles.content}>
          {secondaryText && onSecondaryPress && (
            <OutlineButton
              onPress={onSecondaryPress}
              disabled={secondaryDisabled}
              style={styles.secondaryButton}
            >
              {secondaryText}
            </OutlineButton>
          )}
          <Button
            onPress={onPrimaryPress}
            disabled={primaryDisabled}
            style={styles.primaryButton}
          >
            {primaryText}
          </Button>
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 96,
  },
  blurContainer: {
    flex: 1,
    backgroundColor: 'rgba(15, 17, 21, 0.8)',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    gap: spacing[3],
  },
  primaryButton: {
    flex: 1,
  },
  secondaryButton: {
    flex: 1,
  },
});
