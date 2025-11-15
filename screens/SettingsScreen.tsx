import React from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View, TextInput, Alert, ScrollView, Modal } from 'react-native';
import ColorPicker from '../components/ui/ColorPicker';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '../state/store';
import { borderRadius, colors, spacing, typography } from '../theme';
import { accentPalette, type AccentName } from '../theme/colors';
import { useLegacyStyles } from '../theme/useLegacyStyles';
// removed admin tools; no direct supabase usage here
import { useTheme as useDesignTheme } from '../src/design/useTheme';

const ACCENT_OPTIONS = Object.entries(accentPalette) as [AccentName, { light: string; dark: string }][];
const DEFAULT_CUSTOM_ACCENT = accentPalette.violet.light;

export const SettingsScreen: React.FC = () => {
  const signOut = useStore(state => state.signOut);
  const unit = useStore(state => state.unitPreference);
  const setUnit = useStore(state => state.setUnitPreference);
  const theme = useStore(state => state.themePreference);
  const setTheme = useStore(state => state.setThemePreference);
  const accent = useStore(state => state.accentPreference);
  const setAccent = useStore(state => state.setAccentPreference);
  const currentUser = useStore(state => state.currentUser);
  const [customPickerVisible, setCustomPickerVisible] = React.useState(false);
  const [customHex, setCustomHex] = React.useState('');
  const { setMode } = useDesignTheme();
  // Admin tools removed
  const styles = useLegacyStyles(createStyles);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
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
        <View style={{ height: spacing.md }} />
        <Text style={styles.smallLabel}>Accent color</Text>
        <View style={[styles.row, { marginTop: spacing.sm }]}> 
          {ACCENT_OPTIONS.map(([key, paletteEntry]) => {
            const color = theme === 'dark' ? paletteEntry.dark : paletteEntry.light;
            const isActive = accent === key;
            return (
              <Pressable
                key={key}
                onPress={() => setAccent(key)}
                accessibilityRole="button"
                hitSlop={10}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: color,
                  marginRight: spacing.sm,
                  borderWidth: isActive ? 3 : 1,
                  borderColor: isActive ? colors.primary : colors.border,
                }}
              />
            );
          })}
          {/* Custom color circle */}
          <Pressable
            onPress={() => { setCustomHex(typeof accent === 'string' && accent.startsWith('#') ? accent : DEFAULT_CUSTOM_ACCENT); setCustomPickerVisible(true); }}
            accessibilityRole="button"
            hitSlop={10}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: typeof accent === 'string' && accent.startsWith('#') ? (accent as string) : 'transparent',
              marginRight: spacing.sm,
              borderWidth: 2,
              borderColor: colors.border,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: typeof accent === 'string' && accent.startsWith('#') ? colors.onPrimary : colors.text.secondary, fontWeight: '800' }}>＋</Text>
          </Pressable>
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personalization</Text>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => navigation.navigate('OnboardingSurvey' as never, { mode: 'review' } as never)}
          accessibilityRole="button"
          hitSlop={12}
        >
          <Text style={styles.actionBtnText}>Onboarding preferences</Text>
        </TouchableOpacity>
      </View>
      {/* Custom color modal */}
      <Modal visible={customPickerVisible} transparent animationType="fade" onRequestClose={() => setCustomPickerVisible(false)}>
        <View style={{ flex: 1, backgroundColor: colors.scrim, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ backgroundColor: colors.card, borderRadius: borderRadius.lg, padding: spacing.lg, width: '85%', borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ ...typography.h3, color: colors.text.primary, marginBottom: spacing.md }}>Custom accent color</Text>
            <Text style={{ ...typography.body, color: colors.text.secondary }}>Enter a HEX color like {DEFAULT_CUSTOM_ACCENT}</Text>
            <View style={{ height: spacing.sm }} />
            <TextInput
              value={customHex}
              onChangeText={setCustomHex}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder={DEFAULT_CUSTOM_ACCENT}
              placeholderTextColor={colors.text.secondary}
              style={{
                backgroundColor: colors.bg,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: borderRadius.md,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
                color: colors.text.primary,
              }}
            />
            <View style={{ height: spacing.md }} />
            <ColorPicker initialHex={customHex || (typeof accent === 'string' && accent.startsWith('#') ? (accent as string) : DEFAULT_CUSTOM_ACCENT)} onChange={setCustomHex} />
            <View style={{ height: spacing.md }} />
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/.test(customHex) ? customHex : colors.border, marginRight: spacing.sm, borderWidth: 1, borderColor: colors.border }} />
              <Text style={{ ...typography.caption, color: colors.text.secondary }}>Preview</Text>
            </View>
            <View style={{ height: spacing.md }} />
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity style={[styles.actionBtn, { flex: 1, marginRight: spacing.sm }]} onPress={() => setCustomPickerVisible(false)}>
                <Text style={styles.actionBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, { flex: 1 }]}
                onPress={() => {
                  const hex = customHex.trim();
                  if (!/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/.test(hex)) {
                    Alert.alert('Invalid color', `Please enter a valid HEX like ${DEFAULT_CUSTOM_ACCENT}.`);
                    return;
                  }
                  setAccent(hex);
                  setCustomPickerVisible(false);
                }}
              >
                <Text style={styles.actionBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {currentUser.isSuperAdmin ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Admin</Text>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('AdminTools')}
            accessibilityRole="button"
            hitSlop={12}
          >
            <Text style={styles.actionBtnText}>Open Admin Tools</Text>
          </TouchableOpacity>
        </View>
      ) : null}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <TouchableOpacity
          style={styles.signOutBtn}
          onPress={async () => { await signOut(); }}
          accessibilityRole="button"
          hitSlop={12}
        >
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

