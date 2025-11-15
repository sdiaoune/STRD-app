# UI Theming Overview

This codebase now centralizes presentation concerns inside `src/design/`. The design system provides:

- `theme.ts` – light/dark tokens for color, spacing, radii, and elevation. Use the exported `themes` map via the `useTheme` hook.
- `typography.ts` – a responsive type ramp (caption through display) that scales with the device font multiplier.
- `components/` – primitive building blocks (`Text`, `Heading`, `Button`, `IconButton`, `Input`, `Card`, `ListItem`, `Badge`, `Divider`, `Modal`, `Surface`). Each component consumes the active theme automatically and exposes ergonomic props for variant, tone, size, and state management.
- `useTheme.ts` – a provider/hook pair that resolves the current color scheme, listens for system changes, and persists the in-app override via `AsyncStorage`.

## Usage

- The legacy tree is wrapped by `src/design/useTheme` while the newer tokenized tree uses `theme/index.tsx`. When you need colors, spacing, or radius inside legacy components, call `const { colors, spacing, radius } = useTheme()` from `theme/index.tsx`. Inside the design system primitives (`src/design/components/*`), lean on the props those components expose instead of hand-picking tokens.
- Never hard-code literal hex, rgba, or named colors in UI files (`screens/`, `components/`, `app/`, `src/design/`). Reach for `theme.colors.*`, `theme.surfaces.*`, or component props such as `<Button tone="danger" />`.
- Layout primitives (padding, gap, radius) should always reference `spacing.*` and `radius.*`. This keeps touch targets aligned between tablet/phone form factors.

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

The canonical color tokens live in `theme/colors.ts` and are surfaced via the `useTheme` hook:

| Token | Light | Dark | Notes |
| --- | --- | --- | --- |
| `colors.primary` | Accent preference (defaults to `#2D5BFF`) | Accent preference (defaults to `#5B86FF`) | Controlled via Settings → Accent |
| `colors.onPrimary` | `#FFFFFF` | `#0A0F1A` | Always use for text/icons on primary buttons |
| `colors.danger` / `colors.onDanger` | `#EF4444` / `#FFFFFF` | `#FF6B6B` / `#0A0F1A` | Use for destructive actions |
| `colors.bg` | `#F6F8FB` | `#0B0F17` | App background |
| `colors.surface` / `colors.card` | `#FFFFFF` | `#111827` | Cards, modals, text inputs |
| `colors.surfaceMuted` | `#F2F4F8` | `#0F1623` | Skeletons, secondary surfaces |
| `colors.border` | `#E6EAF0` | `#1F2937` | Divider & outline color |
| `colors.text.primary` | `#0B1220` | `#E6EAF2` | Default copy |
| `colors.text.secondary` | `#475569` | `#B8C0CC` | Labels, helper text |
| `colors.text.muted` | `#94A3B8` | `#7A8699` | Placeholder text |
| `colors.icon.*` | Mirrors text tokens | Mirrors text tokens | Use with Icon components |

Spacing and radius tokens (from `theme/spacing.ts` and `theme/radius.ts`) should replace numeric literals:

| Token | Value | Usage |
| --- | --- | --- |
| `spacing.xs` | `4` | Tight gaps, label spacing |
| `spacing.sm` | `8` | Input padding |
| `spacing.md` | `12` | Default block spacing |
| `spacing.lg` | `16` | Section padding |
| `spacing.xl` | `24` | Page gutters |
| `radius.sm` | `8` | Pills, chips |
| `radius.md` | `12` | Inputs, cards |
| `radius.lg` / `radius.modal` | `20` / `28` | Sheets, modals |

### Light/Dark QA Checklist

1. Toggle the appearance override in Settings and reload the screen—no layout thrash, no flashes.
2. Ensure every surface uses either `colors.bg`, `colors.card`, or `colors.surfaceMuted`.
3. All text/icon colors must be `colors.text.*` or component-provided props (e.g., `tone`, `muted`).
4. Verify outlines and dividers respect `colors.border` with sufficient contrast in both schemes.
5. Snapshot or screen-record the flow to catch transitions (pickers, sheets) which often regress first.

Use `Button`'s `tone` prop for semantic emphasis (e.g., `tone="danger"` for destructive actions). `ListItem` exposes `density` for compact/comfortable layouts, and every pressable includes `hitSlop` to meet accessibility touch targets. Keep body copy at least `variant="body"` (16sp) and lean on the `Heading` component for hierarchy.
