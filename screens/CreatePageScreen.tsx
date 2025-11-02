import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useStore } from '../state/store';
import { borderRadius, colors, spacing, typography, useTheme as useTokensTheme } from '../theme';

export const CreatePageScreen: React.FC = () => {
  const theme = useTokensTheme();
  const isLight = theme.mode === 'light';
  const fieldStyle = { backgroundColor: isLight ? '#ffffff' : colors.card, color: isLight ? '#000000' : colors.text.primary, borderColor: isLight ? '#e5e5e5' : colors.border } as const;
  const labelStyle = { color: isLight ? '#000000' : colors.text.secondary } as const;
  const createPage = useStore(state => (state as any).createPage);
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [type, setType] = useState<'community' | 'partner' | 'sponsor' | 'run_club'>('community');
  const [logoUri, setLogoUri] = useState<string | undefined>();
  const [website, setWebsite] = useState('');

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.9 });
    if (!res.canceled && res.assets && res.assets[0]?.uri) {
      setLogoUri(res.assets[0].uri);
    }
  };

  const submit = async () => {
    if (!name || !city) return;
    const normalizedWebsite = website.trim() ? website.trim() : undefined;
    const id = await createPage({ name, type, city, logoUri, website: normalizedWebsite });
    if (!id) {
      Alert.alert('Error', 'Failed to create page');
      return;
    }
    Alert.alert('Success', 'Page created');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isLight ? '#ffffff' : colors.bg }]} edges={['bottom']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: spacing.sm, paddingBottom: spacing.xl }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formRow}><Text style={[styles.label, labelStyle]}>Name</Text><TextInput value={name} onChangeText={setName} style={[styles.input, fieldStyle]} placeholder="Your page name" placeholderTextColor={isLight ? '#666666' : colors.text.secondary} /></View>
        <View style={styles.formRow}><Text style={[styles.label, labelStyle]}>City</Text><TextInput value={city} onChangeText={setCity} style={[styles.input, fieldStyle]} placeholder="City" placeholderTextColor={isLight ? '#666666' : colors.text.secondary} /></View>
        <View style={styles.formRow}><Text style={[styles.label, labelStyle]}>Website (optional)</Text><TextInput value={website} onChangeText={setWebsite} style={[styles.input, fieldStyle]} placeholder="https://example.org" placeholderTextColor={isLight ? '#666666' : colors.text.secondary} autoCapitalize="none" keyboardType="url" /></View>
        <View style={styles.formRow}><Text style={[styles.label, labelStyle]}>Type</Text><TextInput value={type} onChangeText={(t) => setType((t as any) || 'community')} style={[styles.input, fieldStyle]} placeholder="community | partner | sponsor | run_club" placeholderTextColor={isLight ? '#666666' : colors.text.secondary} /></View>
        <TouchableOpacity style={[styles.btn, fieldStyle]} onPress={pickImage}><Text style={[styles.btnText, { color: fieldStyle.color }]}>{logoUri ? 'Change Logo' : 'Pick Logo'}</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.primary]} onPress={submit}><Text style={[styles.btnText, styles.primaryText]}>Create Page</Text></TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: spacing.md },
  formRow: { marginBottom: spacing.md },
  label: { ...typography.small, color: colors.text.secondary, marginBottom: spacing.xs },
  input: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, color: colors.text.primary },
  btn: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, paddingVertical: spacing.md, borderRadius: borderRadius.md, alignItems: 'center', marginTop: spacing.md },
  btnText: { ...typography.body, color: colors.text.primary, fontWeight: '600' },
  primary: { backgroundColor: colors.primary, borderColor: colors.primary },
  primaryText: { color: '#ffffff' },
});

export default CreatePageScreen;


