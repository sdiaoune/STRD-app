import React from 'react';

import { useTheme as useDesignTheme } from '../src/design/useTheme';
import { useStore } from '../state/store';

export function useLegacyStyles<T>(
  factory: () => T,
  deps: React.DependencyList = [],
): T {
  const { name } = useDesignTheme();
  const themePreference = useStore((state) => state.themePreference);
  const hasHydratedTheme = useStore((state) => state.hasHydratedTheme);

  return React.useMemo(
    () => factory(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [name, themePreference, hasHydratedTheme, ...deps],
  );
}
