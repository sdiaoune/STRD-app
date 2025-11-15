import React from 'react';
import { ScrollView, View } from 'react-native';
import { colors, spacing, typography, useTheme as useTokensTheme } from '../theme';
import { AppText } from '../components/AppText';
import UIButton from '../components/ui/Button';
import { Chip } from '../components/Chip';
import { Badge } from '../components/Badge';
import { Card } from '../components/Card';
import SegmentedControl from '../components/ui/SegmentedControl';
import Stat from '../components/ui/Stat';
import EmptyState from '../components/ui/EmptyState';
import MapCard from '../components/ui/MapCard';
import { Skeleton, EventCardSkeleton, ProfileStatsSkeleton } from '../components/Skeleton';
import { useStore } from '../state/store';

export const ComponentGallery: React.FC = () => {
  const [seg, setSeg] = React.useState('For You');
  const theme = useTokensTheme();
  const themePref = useStore((state) => state.themePreference ?? theme.mode);
  const setThemePreference = useStore((state) => state.setThemePreference);
  const themeToggleValue = themePref === 'dark' ? 'Dark' : 'Light';

  const handleThemeToggle = React.useCallback(
    (value: string) => {
      const next = value === 'Dark' ? 'dark' : 'light';
      setThemePreference(next as 'light' | 'dark');
    },
    [setThemePreference],
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: spacing.md }}>
      <View style={{ marginBottom: spacing.lg }}>
        <AppText variant="h2">Theme</AppText>
        <SegmentedControl segments={['Light', 'Dark']} value={themeToggleValue} onChange={handleThemeToggle} />
        <AppText color="muted" style={{ marginTop: spacing.xs }}>
          Toggle to quickly verify component contrast in each scheme.
        </AppText>
      </View>
      <AppText variant="display">Display</AppText>
      <AppText variant="h1">Heading 1</AppText>
      <AppText variant="h2">Heading 2</AppText>
      <AppText>Body text with default color</AppText>
      <AppText color="secondary">Secondary text</AppText>
      <AppText color="muted">Muted text</AppText>

      <View style={{ height: spacing.md }} />

      <UIButton title="Primary Button" />
      <View style={{ height: spacing.sm }} />
      <UIButton title="Secondary Button" variant="secondary" />
      <View style={{ height: spacing.sm }} />
      <UIButton title="Tertiary Button" variant="tertiary" />
      <View style={{ height: spacing.sm }} />
      <UIButton title="Destructive" variant="destructive" />

      <View style={{ height: spacing.md }} />
      <View style={{ flexDirection: 'row' }}>
        <Chip label="Trail" style={{ marginRight: spacing.xs }} />
        <Chip label="Tempo" />
      </View>
      <View style={{ height: spacing.sm }} />
      <Badge label="Partner" />

      <View style={{ height: spacing.md }} />
      <Card>
        <AppText>Card content</AppText>
      </Card>

      <View style={{ height: spacing.md }} />
      <SegmentedControl segments={[ 'For You', 'All' ]} value={seg} onChange={setSeg} />

      <View style={{ height: spacing.md }} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
        <Stat icon="walk" value="12" label="Runs" />
        <Stat icon="flame" value="4-week" label="Streak" />
        <Stat icon="map" value="0.34 km" label="Total" />
      </View>
      <EmptyState icon="image" title="Empty State" body="Use for empty lists and idle states." />

      <View style={{ height: spacing.md }} />
      <MapCard />

      <View style={{ height: spacing.md }} />
      <EventCardSkeleton />
      <View style={{ height: spacing.sm }} />
      <ProfileStatsSkeleton />
      <View style={{ height: spacing.sm }} />
      <Skeleton height={12} />
    </ScrollView>
  );
};










