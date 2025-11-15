import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useStore } from '../state/store';
import type { SurveyAnswers, SurveyRecord } from '../types/survey';

export const SURVEY_STORAGE_KEY = 'strd_onboarding_survey';

const defaultRecord: SurveyRecord | null = null;

type SurveyContextValue = {
  record: SurveyRecord | null;
  hasCompleted: boolean;
  loading: boolean;
  sessionDeferred: boolean;
  saveAnswers: (answers: SurveyAnswers) => Promise<void>;
  skipSurvey: () => Promise<void>;
  refresh: () => Promise<void>;
};

const SurveyContext = createContext<SurveyContextValue | undefined>(undefined);

const normalizeRecord = (raw: SurveyRecord | null): SurveyRecord | null => {
  if (!raw) return null;
  if (!raw.answers) return raw;
  const interestsValue = raw.answers.interests;
  let interests: string[] = [];
  if (Array.isArray(interestsValue)) {
    interests = interestsValue;
  } else if (typeof interestsValue === 'string') {
    try {
      const parsed = JSON.parse(interestsValue);
      if (Array.isArray(parsed)) {
        interests = parsed.filter((item): item is string => typeof item === 'string');
      }
    } catch {
      // ignore parsing issues
    }
  }
  return {
    ...raw,
    answers: {
      ...raw.answers,
      interests,
    },
  };
};

export const SurveyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [record, setRecord] = useState<SurveyRecord | null>(defaultRecord);
  const [loading, setLoading] = useState(true);
  const [sessionDeferred, setSessionDeferred] = useState(false);
  const isAuthenticated = useStore((state) => state.isAuthenticated);

  const refresh = useCallback(async () => {
    setSessionDeferred(false);
    try {
      const stored = await AsyncStorage.getItem(SURVEY_STORAGE_KEY);
      if (!stored) {
        setRecord(null);
        return;
      }
      const parsed = JSON.parse(stored) as SurveyRecord;
      setRecord(normalizeRecord(parsed));
    } catch (error) {
      console.warn('[SurveyProvider] Failed to load survey answers', error);
      setRecord(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!isAuthenticated) {
      setSessionDeferred(false);
    }
  }, [isAuthenticated]);

  const saveAnswers = useCallback(async (answers: SurveyAnswers) => {
    const payload: SurveyRecord = {
      answers,
      completedAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(SURVEY_STORAGE_KEY, JSON.stringify(payload));
    setRecord(payload);
    setSessionDeferred(false);
  }, []);

  const skipSurvey = useCallback(async () => {
    const payload: SurveyRecord = {
      skipped: true,
      completedAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(SURVEY_STORAGE_KEY, JSON.stringify(payload));
    setRecord(payload);
    setSessionDeferred(true);
  }, []);

  const value = useMemo<SurveyContextValue>(
    () => ({
      record,
      hasCompleted: !!record?.answers,
      sessionDeferred,
      loading,
      saveAnswers,
      skipSurvey,
      refresh,
    }),
    [record, loading, sessionDeferred, saveAnswers, skipSurvey, refresh]
  );

  return <SurveyContext.Provider value={value}>{children}</SurveyContext.Provider>;
};

export const useOnboardingSurvey = (): SurveyContextValue => {
  const ctx = useContext(SurveyContext);
  if (!ctx) {
    throw new Error('useOnboardingSurvey must be used within SurveyProvider');
  }
  return ctx;
};

