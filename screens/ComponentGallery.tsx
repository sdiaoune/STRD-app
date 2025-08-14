import React from 'react';
import { ScrollView, View } from 'react-native';
import { colors, spacing, typography } from '../theme';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { Chip } from '../components/Chip';
import { Badge } from '../components/Badge';
import { Card } from '../components/Card';
import { SegmentedControl } from '../components/SegmentedControl';
import { StatsRow } from '../components/StatsRow';
import { Skeleton, EventCardSkeleton, ProfileStatsSkeleton } from '../components/Skeleton';

export const ComponentGallery: React.FC = () => {
  const [seg, setSeg] = React.useState('For You');
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: spacing.md }}>
      <AppText variant="display">Display</AppText>
      <AppText variant="h1">Heading 1</AppText>
      <AppText variant="h2">Heading 2</AppText>
      <AppText>Body text with default color</AppText>
      <AppText color="secondary">Secondary text</AppText>
      <AppText color="muted">Muted text</AppText>

      <View style={{ height: spacing.md }} />

      <Button>Primary Button</Button>
      <View style={{ height: spacing.sm }} />
      <Button variant="outline">Outline Button</Button>

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
      <StatsRow stats={[{ label: 'Runs', value: 12 }, { label: 'Streak', value: 5 }, { label: 'Distance', value: '42.3 km' }]} />

      <View style={{ height: spacing.md }} />
      <EventCardSkeleton />
      <View style={{ height: spacing.sm }} />
      <ProfileStatsSkeleton />
      <View style={{ height: spacing.sm }} />
      <Skeleton height={12} />
    </ScrollView>
  );
};




