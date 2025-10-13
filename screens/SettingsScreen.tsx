import React from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View, TextInput, Alert, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../state/store';
import { borderRadius, colors, spacing, typography } from '../theme';
import { useLegacyStyles } from '../theme/useLegacyStyles';
import { supabase } from '../supabase/client';
import { useTheme as useDesignTheme } from '../src/design/useTheme';

export const SettingsScreen: React.FC = () => {
  const signOut = useStore(state => state.signOut);
  const unit = useStore(state => state.unitPreference);
  const setUnit = useStore(state => state.setUnitPreference);
  const theme = useStore(state => state.themePreference);
  const setTheme = useStore(state => state.setThemePreference);
  const currentUser = useStore(state => state.currentUser);
  const { setMode } = useDesignTheme();
  const [eventIdDraft, setEventIdDraft] = React.useState('');
  const [coverUrlDraft, setCoverUrlDraft] = React.useState('');
  const styles = useLegacyStyles(createStyles);
  const insets = useSafeAreaInsets();
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.bg }}
        contentContainerStyle={{ padding: spacing.md, paddingBottom: insets.bottom + spacing.xl, backgroundColor: colors.bg }}
        contentInsetAdjustmentBehavior="never"
        automaticallyAdjustContentInsets={false}
        showsVerticalScrollIndicator={false}
      >
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Units</Text>
        <View style={styles.row}>
          <Pressable onPress={() => setUnit('metric')} style={[styles.unitBtn, unit === 'metric' && styles.unitBtnActive]} accessibilityRole="button" hitSlop={12}>
            <Text style={[styles.unitText, unit === 'metric' && styles.unitTextActive]}>Metric (km)</Text>
          </Pressable>
          <Pressable onPress={() => setUnit('imperial')} style={[styles.unitBtn, unit === 'imperial' && styles.unitBtnActive]} accessibilityRole="button" hitSlop={12}>
            <Text style={[styles.unitText, unit === 'imperial' && styles.unitTextActive]}>Imperial (mi)</Text>
          </Pressable>
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        <View style={styles.row}>
          <Pressable onPress={() => { setTheme('dark'); void setMode('dark'); }} style={[styles.unitBtn, theme === 'dark' && styles.unitBtnActive]} accessibilityRole="button" hitSlop={12}>
            <Text style={[styles.unitText, theme === 'dark' && styles.unitTextActive]}>Dark</Text>
          </Pressable>
          <Pressable onPress={() => { setTheme('light'); void setMode('light'); }} style={[styles.unitBtn, theme === 'light' && styles.unitBtnActive]} accessibilityRole="button" hitSlop={12}>
            <Text style={[styles.unitText, theme === 'light' && styles.unitTextActive]}>Light</Text>
          </Pressable>
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Admin tools</Text>
        <View style={{ marginBottom: spacing.sm }}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={async () => {
              try {
                if (!currentUser?.id) return;
                await supabase.from('profiles').update({ is_super_admin: true }).eq('id', currentUser.id);
                Alert.alert('Success', 'You are now a super-admin.');
              } catch {
                Alert.alert('Error', 'Failed to update admin flag.');
              }
            }}
          >
            <Text style={styles.actionBtnText}>Promote me to Super Admin</Text>
          </TouchableOpacity>
        </View>
        <View style={{ gap: spacing.sm }}>
          <Text style={styles.smallLabel}>Event ID</Text>
          <TextInput
            value={eventIdDraft}
            onChangeText={setEventIdDraft}
            placeholder="uuid"
            placeholderTextColor={colors.text.secondary}
            style={styles.input}
            autoCapitalize="none"
          />
          <Text style={styles.smallLabel}>Cover Image URL</Text>
          <TextInput
            value={coverUrlDraft}
            onChangeText={setCoverUrlDraft}
            placeholder="https://..."
            placeholderTextColor={colors.text.secondary}
            style={styles.input}
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={async () => {
              if (!eventIdDraft || !coverUrlDraft) return;
              try {
                const { error } = await supabase.from('events').update({ cover_image_url: coverUrlDraft }).eq('id', eventIdDraft);
                if (error) throw error;
                Alert.alert('Success', 'Event cover image updated.');
              } catch {
                Alert.alert('Error', 'Failed to update cover image.');
              }
            }}
          >
            <Text style={styles.actionBtnText}>Update Event Cover</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <TouchableOpacity style={styles.signOutBtn} onPress={async () => { await signOut(); }} accessibilityRole="button" hitSlop={12}>
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = () =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    section: { marginTop: spacing.lg },
    sectionTitle: { ...typography.h3, color: colors.text.primary, marginBottom: spacing.md },
    row: { flexDirection: 'row' },
    unitBtn: {
      flex: 1,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderRadius: borderRadius.md,
      alignItems: 'center',
      marginRight: spacing.sm,
    },
    unitBtnActive: {
      borderColor: colors.primary,
    },
    unitText: { ...typography.body, color: colors.text.primary },
    unitTextActive: { color: colors.primary, fontWeight: '600' },
    input: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      color: colors.text.primary,
    },
    smallLabel: { ...typography.caption, color: colors.text.secondary },
    signOutBtn: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderRadius: borderRadius.md,
      alignItems: 'center',
    },
    signOutText: { ...typography.body, color: colors.primary, fontWeight: '600' },
    actionBtn: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderRadius: borderRadius.md,
      alignItems: 'center',
    },
    actionBtnText: { ...typography.body, color: colors.primary, fontWeight: '600' },
  });

