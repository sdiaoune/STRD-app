import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// We mirror RunPostCard visual language instead of reusing Card
import { TagPill } from './TagPill';
import { Badge } from './Badge';
import CertifiedBadge from './CertifiedBadge';
import { spacing, typography, colors, borderRadius } from '../theme';
import { formatEventDate, formatEventTime, formatDistance } from '../utils/format';
import type { Event } from '../types/models';
import { useStore } from '../state/store';
import Animated, { FadeIn, Easing, Layout } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { useLegacyStyles } from '../theme/useLegacyStyles';
import { supabase } from '../supabase/client';
import SponsorDurationModal from './SponsorDurationModal';
import * as Location from 'expo-location';

interface Props {
  event: Event;
  onPress: () => void;
}

export const EventCard: React.FC<Props> = ({ event, onPress }) => {
  const orgById = useStore((s) => s.orgById);
  const organization = orgById(event.orgId);
  const unit = useStore(s => s.unitPreference);
  const isSuperAdmin = useStore(s => s.currentUser.isSuperAdmin);
  const [fallbackMeters, setFallbackMeters] = useState<number | null>(null);
  const distanceLabel = (() => {
    const km = event.distanceFromUserKm != null ? event.distanceFromUserKm : (fallbackMeters != null ? fallbackMeters / 1000 : null);
    return km == null ? '—' : formatDistance(km, unit);
  })();

  const styles = useLegacyStyles(createStyles);
  const nowTs = Date.now();
  const isSponsored = !!(
    event.sponsoredUntil &&
    new Date(event.sponsoredUntil).getTime() > nowTs &&
    (!event.sponsoredFrom || new Date(event.sponsoredFrom).getTime() <= nowTs)
  );
  const [showSponsorPicker, setShowSponsorPicker] = useState(false);

  const setSponsoredUntil = async (untilISO: string | null) => {
    try {
      const { error } = await supabase.from('events').update({ sponsored_until: untilISO }).eq('id', event.id);
      if (error) return;
      const prev = useStore.getState().events;
      useStore.setState({ events: prev.map(e => e.id === event.id ? { ...e, sponsoredUntil: untilISO } : e) });
    } catch {}
  };
  const openSponsorPicker = () => setShowSponsorPicker(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (event.distanceFromUserKm != null) return;
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status !== 'granted') {
          try { await Location.requestForegroundPermissionsAsync(); } catch {}
        }
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced } as any);
        const toRad = (v: number) => (v * Math.PI) / 180;
        const R = 6371; // km
        const dLat = toRad(event.location.lat - pos.coords.latitude);
        const dLon = toRad(event.location.lon - pos.coords.longitude);
        const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(pos.coords.latitude)) * Math.cos(toRad(event.location.lat)) * Math.sin(dLon / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const km = R * c;
        if (mounted) setFallbackMeters(km * 1000);
      } catch {}
    })();
    return () => { mounted = false; };
  }, [event.distanceFromUserKm, event.location.lat, event.location.lon]);

  return (
    <Animated.View entering={FadeIn.duration(140).easing(Easing.out(Easing.cubic))} layout={Layout.springify().damping(20).stiffness(120)}>
      <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text accessibilityRole="header" numberOfLines={1} style={styles.orgName}>
                {organization?.name}
              </Text>
              {organization?.isCertified ? <CertifiedBadge /> : null}
            </View>
            {organization?.type === 'partner' && (
              <Badge label="Partner" style={{ marginLeft: spacing[2] }} />
            )}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {isSponsored && (
              <View style={styles.pinnedPill}>
                <Ionicons name="pricetag" size={12} color={colors.primary} />
                <Text style={styles.pinnedText}>Sponsored</Text>
              </View>
            )}
            <View style={styles.distanceChip}>
              <Ionicons name="location" size={16} color={colors.icon.secondary} />
              <Text style={styles.distanceText}>{distanceLabel}</Text>
            </View>
            {isSuperAdmin ? (
              <TouchableOpacity onPress={openSponsorPicker} style={{ marginLeft: spacing.xs }} accessibilityRole="button" hitSlop={12}>
                <Ionicons name={'pricetag-outline'} size={18} color={colors.primary} />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {event.coverImage && (
          <View style={styles.coverWrap}>
            <Image
              source={{ uri: event.coverImage }}
              style={styles.coverImage}
              contentFit="cover"
            />
          </View>
        )}
        <View style={{ marginBottom: spacing.md }}>
          <Text numberOfLines={2} style={styles.title}> 
            {event.title}
          </Text>
        </View>

        <View style={{ marginBottom: spacing.md }}>
          <View style={styles.metaRow}>
            <Ionicons name="calendar" size={18} color={colors.icon.secondary} />
            <Text style={styles.metaText}>
              {formatEventDate(event.dateISO)} • {formatEventTime(event.dateISO)}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={18} color={colors.icon.secondary} />
            <Text numberOfLines={1} style={styles.metaText} accessibilityLabel={`Location ${event.location.name}`}>
              {event.location.name}
            </Text>
          </View>
        </View>

        <View style={styles.tagsRow}>
          {event.tags.slice(0, 3).map((tag) => (
            <TagPill key={tag} tag={tag} style={styles.tag} />
          ))}
          {event.tags.length > 3 && (
            <TagPill tag={`+${event.tags.length - 3}`} style={styles.tag} />
          )}
        </View>

      </TouchableOpacity>
      <SponsorDurationModal
        visible={showSponsorPicker}
        onClose={() => setShowSponsorPicker(false)}
        onConfirm={async (startISO, untilISO) => {
          setShowSponsorPicker(false);
          try {
            const { error } = await supabase.from('events').update({ sponsored_from: startISO, sponsored_until: untilISO }).eq('id', event.id);
            if (!error) {
              const prev = useStore.getState().events;
              useStore.setState({ events: prev.map(e => e.id === event.id ? { ...e, sponsoredFrom: startISO, sponsoredUntil: untilISO } : e) });
            }
          } catch {}
        }}
      />
    </Animated.View>
  );
};

const createStyles = () =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: spacing.md,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.md,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flexShrink: 1,
      paddingRight: spacing.sm,
    },
    orgName: {
      ...typography.caption,
      color: colors.text.primary,
    },
    distanceChip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.bg,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing[2],
      paddingVertical: spacing[1],
      borderWidth: 1,
      borderColor: colors.border,
    },
    distanceText: {
      ...typography.caption,
      color: colors.text.secondary,
      marginLeft: spacing[1],
    },
    coverWrap: {
      marginBottom: spacing.md,
      borderRadius: borderRadius.lg,
      overflow: 'hidden',
    },
    coverImage: {
      height: 180,
      width: '100%',
      backgroundColor: colors.surfaceMuted,
    },
    title: {
      ...typography.h2,
      color: colors.text.primary,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.xs,
    },
    metaText: {
      ...typography.caption,
      color: colors.text.secondary,
      marginLeft: spacing[2],
      flexShrink: 1,
    },
    tagsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    tag: {
      marginRight: spacing[1],
      marginBottom: spacing[1],
    },
    pinnedPill: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.bg,
      borderWidth: 1,
      borderColor: colors.primary,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing[2],
      paddingVertical: spacing[1],
      marginRight: spacing.xs,
    },
    pinnedText: {
      ...typography.caption,
      color: colors.primary,
      marginLeft: spacing[1],
      fontWeight: '700',
    },
  });
