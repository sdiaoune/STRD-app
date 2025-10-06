import React, { useMemo, useState } from 'react';
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
  const [interests, setInterests] = useState<string[]>([]);
  const [locationPreference, setLocationPreference] = useState('');

  const interestOptions = useMemo(
    () => ['Speed & intervals', 'Community runs', 'Mindfulness', 'Nutrition', 'Trail adventures'],
    []
  );
  const locationOptions = useMemo(
    () => [
      { value: 'nearby_5', label: 'Within 5 miles' },
      { value: 'nearby_10', label: 'Within 10 miles' },
      { value: 'citywide', label: 'Show all city events' },
    ],
    []
  );

  const toggleInterest = (label: string) => {
    setInterests((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]
    );
  };

  const hasAnswers = goal.trim().length > 0 || distance.trim().length > 0 || interests.length > 0 || locationPreference.length > 0;

  const handleSubmit = () => {
    const payload: SurveyAnswers = {
      goal,
      distance,
      interests: JSON.stringify(interests),
      locationPreference,
    };
    onSubmit(payload);
    setGoal('');
    setDistance('');
    setInterests([]);
    setLocationPreference('');
  };

  const handleSkip = () => {
    setGoal('');
    setDistance('');
    setInterests([]);
    setLocationPreference('');
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

            <View style={styles.field}>
              <Text style={styles.label}>What are you most interested in?</Text>
              <View style={styles.choiceGrid}>
                {interestOptions.map((option) => {
                  const selected = interests.includes(option);
                  return (
                    <TouchableOpacity
                      key={option}
                      style={[styles.choiceChip, selected && styles.choiceChipSelected]}
                      onPress={() => toggleInterest(option)}
                      accessibilityRole="button"
                    >
                      <Text style={[styles.choiceChipText, selected && styles.choiceChipTextSelected]}>
                        {option}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>How far should we look for events?</Text>
              <View style={styles.locationChoices}>
                {locationOptions.map((option) => {
                  const selected = locationPreference === option.value;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      style={[styles.locationButton, selected && styles.locationButtonSelected]}
                      onPress={() => setLocationPreference(option.value)}
                      accessibilityRole="button"
                    >
                      <Text style={[styles.locationButtonText, selected && styles.locationButtonTextSelected]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity style={styles.skipButton} onPress={handleSkip} accessibilityRole="button">
                <Text style={styles.skipText}>Skip for now</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitButton, !hasAnswers && styles.submitDisabled]}
                onPress={handleSubmit}
                disabled={!hasAnswers}
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
  choiceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
  },
  choiceChip: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.xs,
    marginBottom: spacing.xs,
    backgroundColor: colors.bg,
  },
  choiceChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.card,
  },
  choiceChipText: {
    ...typography.body,
    color: colors.text,
  },
  choiceChipTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  locationChoices: {
    flexDirection: 'column',
  },
  locationButton: {
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.bg,
    marginBottom: spacing.sm,
  },
  locationButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.card,
  },
  locationButtonText: {
    ...typography.body,
    color: colors.text,
  },
  locationButtonTextSelected: {
    color: colors.primary,
    fontWeight: '600',
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
