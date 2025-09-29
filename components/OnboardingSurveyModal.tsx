import React, { useState } from 'react';
import { Modal, View, Text, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, typography } from '../theme';

type SurveyAnswers = Record<string, string>;

interface Props {
  visible: boolean;
  onSubmit: (answers: SurveyAnswers) => void;
  onSkip: () => void;
}

export const OnboardingSurveyModal: React.FC<Props> = ({ visible, onSubmit, onSkip }) => {
  const [goal, setGoal] = useState('');
  const [distance, setDistance] = useState('');

  const handleSubmit = () => {
    onSubmit({ goal, distance });
    setGoal('');
    setDistance('');
  };

  const handleSkip = () => {
    setGoal('');
    setDistance('');
    onSkip();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboard}
        >
          <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Welcome to STRD</Text>
            <Text style={styles.subtitle}>Help us personalize your experience. You can update this later in Settings.</Text>

            <View style={styles.field}>
              <Text style={styles.label}>What&apos;s your primary running goal?</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Build endurance"
                placeholderTextColor={colors.muted}
                value={goal}
                onChangeText={setGoal}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Preferred distance?</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 5K, Half Marathon"
                placeholderTextColor={colors.muted}
                value={distance}
                onChangeText={setDistance}
              />
            </View>

            <View style={styles.actions}>
              <TouchableOpacity style={styles.skipButton} onPress={handleSkip} accessibilityRole="button">
                <Text style={styles.skipText}>Skip for now</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitButton, (!goal.trim() && !distance.trim()) && styles.submitDisabled]}
                onPress={handleSubmit}
                disabled={!goal.trim() && !distance.trim()}
                accessibilityRole="button"
              >
                <Text style={styles.submitText}>Save</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  keyboard: {
    width: '100%',
  },
  container: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.muted,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  field: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.caption,
    color: colors.muted,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.bg,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
  },
  skipButton: {
    flex: 1,
    marginRight: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  skipText: {
    ...typography.body,
    color: colors.text,
  },
  submitButton: {
    flex: 1,
    marginLeft: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  submitDisabled: {
    opacity: 0.5,
  },
  submitText: {
    ...typography.body,
    color: colors.onPrimary,
    fontWeight: '600',
  },
});
