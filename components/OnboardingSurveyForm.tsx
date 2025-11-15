import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, StyleProp, ViewStyle, ActivityIndicator } from 'react-native';
import { borderRadius, spacing, typography, useTheme as useTokensTheme } from '../theme';
import type { ColorTheme } from '../theme/colors';
import type { SurveyAnswers } from '../types/survey';

interface Props {
  initialAnswers?: Partial<SurveyAnswers> | null;
  submitting?: boolean;
  allowSkip?: boolean;
  onSubmit: (answers: SurveyAnswers) => void;
  onSkip?: () => void;
  style?: StyleProp<ViewStyle>;
}

const DEFAULT_ANSWERS: SurveyAnswers = {
  goal: '',
  distance: '',
  interests: [],
  locationPreference: '',
};

export const OnboardingSurveyForm: React.FC<Props> = ({
  initialAnswers,
  submitting = false,
  allowSkip = true,
  onSubmit,
  onSkip,
  style,
}) => {
  const theme = useTokensTheme();
  const palette = theme.colors;
  const styles = useMemo(
    () => createStyles(palette),
    [
      theme.mode,
      palette.primary,
      palette.surface,
      palette.bg,
      palette.border,
      palette.text.primary,
      palette.text.secondary,
      palette.text.muted,
      palette.onPrimary,
    ]
  );

  const [goal, setGoal] = useState(initialAnswers?.goal ?? DEFAULT_ANSWERS.goal);
  const [distance, setDistance] = useState(initialAnswers?.distance ?? DEFAULT_ANSWERS.distance);
  const [interests, setInterests] = useState<string[]>(initialAnswers?.interests ?? DEFAULT_ANSWERS.interests);
  const [locationPreference, setLocationPreference] = useState(initialAnswers?.locationPreference ?? DEFAULT_ANSWERS.locationPreference);

  useEffect(() => {
    if (!initialAnswers) {
      setGoal(DEFAULT_ANSWERS.goal);
      setDistance(DEFAULT_ANSWERS.distance);
      setInterests(DEFAULT_ANSWERS.interests);
      setLocationPreference(DEFAULT_ANSWERS.locationPreference);
      return;
    }
    setGoal(initialAnswers.goal ?? DEFAULT_ANSWERS.goal);
    setDistance(initialAnswers.distance ?? DEFAULT_ANSWERS.distance);
    setInterests(initialAnswers.interests ?? DEFAULT_ANSWERS.interests);
    setLocationPreference(initialAnswers.locationPreference ?? DEFAULT_ANSWERS.locationPreference);
  }, [initialAnswers]);

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

  const hasAnswers =
    goal.trim().length > 0 ||
    distance.trim().length > 0 ||
    interests.length > 0 ||
    locationPreference.length > 0;

  const handleSubmit = () => {
    if (!hasAnswers || submitting) return;
    onSubmit({
      goal: goal.trim(),
      distance: distance.trim(),
      interests,
      locationPreference,
    });
  };

  const handleSkip = () => {
    if (!allowSkip || submitting) return;
    onSkip?.();
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>Welcome to STRD</Text>
      <Text style={styles.subtitle}>Help us personalize your experience. You can update this later in Settings.</Text>

      <View style={styles.field}>
        <Text style={styles.label}>What&apos;s your primary running goal?</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Build endurance"
          placeholderTextColor={palette.text.muted}
          value={goal}
          onChangeText={setGoal}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Preferred distance?</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 5K, Half Marathon"
          placeholderTextColor={palette.text.muted}
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
        {allowSkip && onSkip ? (
          <TouchableOpacity
            style={[styles.skipButton, submitting && styles.disabledButton]}
            onPress={handleSkip}
            accessibilityRole="button"
            disabled={submitting}
          >
            <Text style={styles.skipText}>Complete later</Text>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!hasAnswers || submitting) && styles.submitDisabled,
            !allowSkip && styles.submitFullWidth,
          ]}
          onPress={handleSubmit}
          disabled={!hasAnswers || submitting}
          accessibilityRole="button"
        >
          {submitting ? (
            <ActivityIndicator color={palette.onPrimary} />
          ) : (
            <Text style={styles.submitText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const createStyles = (palette: ColorTheme) =>
  StyleSheet.create({
    container: {
      backgroundColor: palette.surface,
      borderRadius: borderRadius.xl,
      padding: spacing.xl,
      borderWidth: 1,
      borderColor: palette.border,
    },
    title: {
      ...typography.h2,
      color: palette.text.primary,
      textAlign: 'center',
      marginBottom: spacing.sm,
    },
    subtitle: {
      ...typography.body,
      color: palette.text.secondary,
      textAlign: 'center',
      marginBottom: spacing.lg,
    },
    field: {
      marginBottom: spacing.lg,
    },
    label: {
      ...typography.caption,
      color: palette.text.muted,
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
      borderColor: palette.border,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      marginHorizontal: spacing.xs,
      marginBottom: spacing.xs,
      backgroundColor: palette.bg,
    },
    choiceChipSelected: {
      borderColor: palette.primary,
      backgroundColor: palette.surface,
    },
    choiceChipText: {
      ...typography.body,
      color: palette.text.primary,
    },
    choiceChipTextSelected: {
      color: palette.primary,
      fontWeight: '600',
    },
    locationChoices: {
      flexDirection: 'column',
    },
    locationButton: {
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: palette.border,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      backgroundColor: palette.bg,
      marginBottom: spacing.sm,
    },
    locationButtonSelected: {
      borderColor: palette.primary,
      backgroundColor: palette.surface,
    },
    locationButtonText: {
      ...typography.body,
      color: palette.text.primary,
    },
    locationButtonTextSelected: {
      color: palette.primary,
      fontWeight: '600',
    },
    input: {
      backgroundColor: palette.bg,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderWidth: 1,
      borderColor: palette.border,
      color: palette.text.primary,
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
      borderColor: palette.border,
      alignItems: 'center',
    },
    skipText: {
      ...typography.body,
      color: palette.text.primary,
    },
    submitButton: {
      flex: 1,
      marginLeft: spacing.sm,
      backgroundColor: palette.primary,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    submitFullWidth: {
      flex: undefined,
      flexGrow: 1,
      width: '100%',
      marginLeft: 0,
    },
    submitDisabled: {
      opacity: 0.5,
    },
    disabledButton: {
      opacity: 0.5,
    },
    submitText: {
      ...typography.body,
      color: palette.onPrimary,
      fontWeight: '600',
    },
  });
