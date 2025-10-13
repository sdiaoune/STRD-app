# UI Theming Overview

This codebase now centralizes presentation concerns inside `src/design/`. The design system provides:

- `theme.ts` – light/dark tokens for color, spacing, radii, and elevation. Use the exported `themes` map via the `useTheme` hook.
- `typography.ts` – a responsive type ramp (caption through display) that scales with the device font multiplier.
- `components/` – primitive building blocks (`Text`, `Heading`, `Button`, `IconButton`, `Input`, `Card`, `ListItem`, `Badge`, `Divider`, `Modal`, `Surface`). Each component consumes the active theme automatically and exposes ergonomic props for variant, tone, size, and state management.
- `useTheme.ts` – a provider/hook pair that resolves the current color scheme, listens for system changes, and persists the in-app override via `AsyncStorage`.

## Usage

Wrap the app with `ThemeProvider` from `src/design/useTheme`. Within components, call `const theme = useTheme()` or, preferably, render the primitives above. All layout spacing, border radii, and colors should reference the tokens in `theme` to ensure consistency across light/dark variants.

### Example

```tsx
import Button from '@/src/design/components/Button';
import Card from '@/src/design/components/Card';
import Text from '@/src/design/components/Text';

function EmptyState() {
  return (
    <Card>
      <Text variant="title" emphasis="bold">
        Nothing yet
      </Text>
      <Text muted>
        Pull down to refresh or start a new conversation.
      </Text>
      <Button title="Create" onPress={handleCreate} />
    </Card>
  );
}
```

## Tokens

| Token              | Light value    | Dark value     |
| ------------------ | -------------- | -------------- |
| `colors.bg`        | `#FFFFFF`      | `#0B0F1A`      |
| `colors.text`      | `#0F172A`      | `#E5E7EB`      |
| `colors.primary`   | `#4F46E5`      | `#6366F1`      |
| `colors.border`    | `#E5E7EB`      | `rgba(148,163,184,0.24)` |
| `spacing.md`       | `12`           | `12`           |
| `radius.lg`        | `20`           | `20`           |

Use `Button`'s `tone` prop for semantic emphasis (e.g., `tone="danger"` for destructive actions). `ListItem` exposes `density` for compact/comfortable layouts, and every pressable includes `hitSlop` to meet accessibility touch targets.

Remember to keep body copy at least `variant="body"` (16sp) and lean on the `Heading` component for semantic hierarchy.
