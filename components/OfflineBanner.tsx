import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from './Button';
import { colors, spacing, typography } from '../tokens';

interface Props {
  onRetry?: () => void;
}

export const OfflineBanner: React.FC<Props> = ({ onRetry }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Ionicons name="cloud-offline" size={20} color={colors.warning} />
          <Text style={styles.text}>
            You're offline. We'll retry when you're back.
          </Text>
        </View>
        {onRetry && (
          <Button variant="ghost" size="secondary" onPress={onRetry}>
            Retry
          </Button>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceAlt,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  text: {
    ...typography.caption,
    color: colors.text,
    marginLeft: spacing[2],
    flex: 1,
  },
});
