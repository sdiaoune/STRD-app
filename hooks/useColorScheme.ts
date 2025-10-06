import { useColorScheme as useSystemColorScheme } from 'react-native';

import { useStore } from '../state/store';

type Scheme = 'light' | 'dark';

/**
 * Return the user's explicit theme preference when set, otherwise fall back
 * to the device color scheme. This keeps the legacy Expo helpers working with
 * the shared theme store.
 */
export function useColorScheme(): Scheme {
  const themePreference = useStore((state) => state.themePreference);
  const systemScheme = useSystemColorScheme();

  if (themePreference) {
    return themePreference;
  }

  return (systemScheme as Scheme | null) ?? 'light';
}
