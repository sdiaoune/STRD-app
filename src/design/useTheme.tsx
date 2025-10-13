import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Appearance, useColorScheme } from "react-native";

import { Theme, ThemeName, themes, getThemeFromScheme } from "./theme";

export type ThemeMode = "system" | ThemeName;

export type ThemeContextValue = Theme & {
  name: ThemeName;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => Promise<void>;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = "design.theme.mode";

export function ThemeProvider({ children }: PropsWithChildren) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>("system");
  const [resolved, setResolved] = useState<ThemeName>(
    getThemeFromScheme(systemScheme),
  );

  useEffect(() => {
    let isMounted = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (!stored || !isMounted) return;
        if (stored === "system" || stored === "light" || stored === "dark") {
          setModeState(stored as ThemeMode);
          if (stored === "light" || stored === "dark") {
            setResolved(stored);
          }
        }
      })
      .catch(() => {
        /* noop */
      });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (mode === "system") {
      setResolved(getThemeFromScheme(systemScheme));
    }
  }, [systemScheme, mode]);

  useEffect(() => {
    if (mode === "light" || mode === "dark") {
      setResolved(mode);
    }
  }, [mode]);

  useEffect(() => {
    const listener = Appearance.addChangeListener(({ colorScheme }) => {
      if (mode === "system") {
        setResolved(getThemeFromScheme(colorScheme));
      }
    });
    return () => listener.remove();
  }, [mode]);

  const theme = useMemo<Theme>(() => themes[resolved], [resolved]);

  const setMode = useCallback(async (next: ThemeMode) => {
    setModeState(next);
    if (next === "system") {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } else {
      await AsyncStorage.setItem(STORAGE_KEY, next);
    }
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      ...theme,
      name: resolved,
      mode,
      setMode,
    }),
    [theme, resolved, mode, setMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}
