import React from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../state/store';
import { borderRadius, colors, spacing, typography, getCurrentThemeName } from '../theme';
import { supabase } from '../supabase/client';

export const SettingsScreen: React.FC = () => {
  const signOut = useStore(state => state.signOut);
  const unit = useStore(state => state.unitPreference);
  const setUnit = useStore(state => state.setUnitPreference);
  const theme = useStore(state => state.themePreference);
  const setTheme = useStore(state => state.setThemePreference);
  const currentUser = useStore(state => state.currentUser);
  const [eventIdDraft, setEventIdDraft] = React.useState('');
  const [coverUrlDraft, setCoverUrlDraft] = React.useState('');
  // Recreate styles when theme changes so colors update immediately
  const themedStyles = React.useMemo(() => createStyles(), [getCurrentThemeName()]);
  return (
    <SafeAreaView style={themedStyles.container}>
      <View style={styles.section}>
        <Text style={themedStyles.sectionTitle}>Units</Text>
        <View style={styles.row}>
          <Pressable onPress={() => setUnit('metric')} style={[themedStyles.unitBtn, unit === 'metric' && themedStyles.unitBtnActive]} accessibilityRole="button" hitSlop={12}>
            <Text style={[themedStyles.unitText, unit === 'metric' && themedStyles.unitTextActive]}>Metric (km)</Text>
          </Pressable>
          <Pressable onPress={() => setUnit('imperial')} style={[themedStyles.unitBtn, unit === 'imperial' && themedStyles.unitBtnActive]} accessibilityRole="button" hitSlop={12}>
            <Text style={[themedStyles.unitText, unit === 'imperial' && themedStyles.unitTextActive]}>Imperial (mi)</Text>
          </Pressable>
        </View>
      </View>
      <View style={styles.section}>
        <Text style={themedStyles.sectionTitle}>Appearance</Text>
        <View style={styles.row}>
          <Pressable onPress={() => setTheme('dark')} style={[themedStyles.unitBtn, theme === 'dark' && themedStyles.unitBtnActive]} accessibilityRole="button" hitSlop={12}>
            <Text style={[themedStyles.unitText, theme === 'dark' && themedStyles.unitTextActive]}>Dark</Text>
          </Pressable>
          <Pressable onPress={() => setTheme('light')} style={[themedStyles.unitBtn, theme === 'light' && themedStyles.unitBtnActive]} accessibilityRole="button" hitSlop={12}>
            <Text style={[themedStyles.unitText, theme === 'light' && themedStyles.unitTextActive]}>Light</Text>
          </Pressable>
        </View>
      </View>
      <View style={styles.section}>
        <Text style={themedStyles.sectionTitle}>Admin tools</Text>
        <View style={{ marginBottom: spacing.sm }}>
          <TouchableOpacity
            style={themedStyles.actionBtn}
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
            <Text style={themedStyles.actionBtnText}>Promote me to Super Admin</Text>
          </TouchableOpacity>
        </View>
        <View style={{ gap: spacing.sm }}>
          <Text style={themedStyles.smallLabel}>Event ID</Text>
          <TextInput
            value={eventIdDraft}
            onChangeText={setEventIdDraft}
            placeholder="uuid"
            placeholderTextColor={colors.muted}
            style={themedStyles.input}
            autoCapitalize="none"
          />
          <Text style={themedStyles.smallLabel}>Cover Image URL</Text>
          <TextInput
            value={coverUrlDraft}
            onChangeText={setCoverUrlDraft}
            placeholder="https://..."
            placeholderTextColor={colors.muted}
            style={themedStyles.input}
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={themedStyles.actionBtn}
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
            <Text style={themedStyles.actionBtnText}>Update Event Cover</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.section}>
        <Text style={themedStyles.sectionTitle}>Account</Text>
        <TouchableOpacity style={themedStyles.signOutBtn} onPress={async () => { await signOut(); }} accessibilityRole="button" hitSlop={12}>
          <Text style={themedStyles.signOutText}>Sign out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const createStyles = () =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg, padding: spacing.md },
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
    smallLabel: { ...typography.caption, color: colors.muted },
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

const styles = createStyles();


