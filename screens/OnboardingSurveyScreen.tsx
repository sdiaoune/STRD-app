import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { OnboardingSurveyForm } from '../components/OnboardingSurveyForm';
import { spacing, typography, useTheme as useTokensTheme } from '../theme';
import type { ColorTheme } from '../theme/colors';
import { useOnboardingSurvey } from '../hooks/useOnboardingSurvey';
import type { SurveyAnswers } from '../types/survey';

type RouteParams = {
  mode?: 'onboarding' | 'review';
};

export const OnboardingSurveyScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const mode = (route.params as RouteParams | undefined)?.mode ?? 'onboarding';
  const { record, loading, saveAnswers, skipSurvey } = useOnboardingSurvey();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
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
      palette.danger,
    ]
  );

  const allowSkip = mode === 'onboarding';

  useEffect(() => {
    if (mode === 'onboarding') {
      navigation.setOptions({ headerShown: false });
    } else {
      navigation.setOptions({
        headerShown: true,
        title: 'Onboarding preferences',
        headerBackTitle: 'Settings',
      });
    }
  }, [mode, navigation]);

  const initialAnswers = useMemo(() => record?.answers ?? null, [record]);

  const handleSubmit = async (answers: SurveyAnswers) => {
    setSubmitting(true);
    setError(null);
    try {
      await saveAnswers(answers);
      if (mode === 'review') {
        navigation.goBack();
      } else {
        navigation.replace('Main' as never);
      }
    } catch (err) {
      console.error('[OnboardingSurveyScreen] Failed to save survey', err);
      setError('Unable to save your preferences. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await skipSurvey();
      navigation.replace('Main' as never);
    } catch (err) {
      console.error('[OnboardingSurveyScreen] Failed to skip survey', err);
      setError('Unable to skip right now. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const safeAreaEdges: Edge[] = mode === 'onboarding' ? ['top', 'bottom'] : ['bottom'];

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={safeAreaEdges}>
        <ActivityIndicator color={palette.primary} size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={safeAreaEdges}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 24 : 0}
      >
        <ScrollView
          contentContainerStyle={[
            styles.content,
            mode === 'onboarding' ? styles.centerContent : styles.topAlignedContent,
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formWrapper}>
            <OnboardingSurveyForm
              initialAnswers={initialAnswers}
              submitting={submitting}
              allowSkip={allowSkip}
              onSubmit={handleSubmit}
              onSkip={allowSkip ? handleSkip : undefined}
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const createStyles = (palette: ColorTheme) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: palette.bg,
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: palette.bg,
    },
    content: {
      flexGrow: 1,
      paddingHorizontal: spacing.xl,
    },
    centerContent: {
      justifyContent: 'center',
      paddingVertical: spacing.xl,
    },
    topAlignedContent: {
      paddingTop: 0,
      paddingBottom: spacing.xl,
    },
    formWrapper: {
      width: '100%',
      maxWidth: 520,
      alignSelf: 'center',
    },
    errorText: {
      marginTop: spacing.md,
      textAlign: 'center',
      ...typography.caption,
      color: palette.danger,
    },
  });

