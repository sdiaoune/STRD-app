import React from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../state/store';
import { borderRadius, colors, spacing, typography } from '../theme';

export const SettingsScreen: React.FC = () => {
  const signOut = useStore(state => state.signOut);
  const unit = useStore(state => state.unitPreference);
  const setUnit = useStore(state => state.setUnitPreference);
  const theme = useStore(state => state.themePreference);
  const setTheme = useStore(state => state.setThemePreference);
  return (
    <SafeAreaView style={styles.container}>
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
          <Pressable onPress={() => setTheme('dark')} style={[styles.unitBtn, theme === 'dark' && styles.unitBtnActive]} accessibilityRole="button" hitSlop={12}>
            <Text style={[styles.unitText, theme === 'dark' && styles.unitTextActive]}>Dark</Text>
          </Pressable>
          <Pressable onPress={() => setTheme('light')} style={[styles.unitBtn, theme === 'light' && styles.unitBtnActive]} accessibilityRole="button" hitSlop={12}>
            <Text style={[styles.unitText, theme === 'light' && styles.unitTextActive]}>Light</Text>
          </Pressable>
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <TouchableOpacity style={styles.signOutBtn} onPress={async () => { await signOut(); }} accessibilityRole="button" hitSlop={12}>
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.md },
  section: { marginTop: spacing.lg },
  sectionTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.md },
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
  unitText: { ...typography.body, color: colors.text },
  unitTextActive: { color: colors.primary, fontWeight: '600' },
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
});


