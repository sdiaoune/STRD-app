import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useStore } from '../state/store';
import { borderRadius, colors, spacing, typography } from '../theme';

export const CreatePageScreen: React.FC = () => {
  const createPage = useStore(state => (state as any).createPage);
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [type, setType] = useState<'community' | 'partner' | 'sponsor' | 'run_club'>('community');
  const [logoUri, setLogoUri] = useState<string | undefined>();

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.9 });
    if (!res.canceled && res.assets && res.assets[0]?.uri) {
      setLogoUri(res.assets[0].uri);
    }
  };

  const submit = async () => {
    if (!name || !city) return;
    const id = await createPage({ name, type, city, logoUri });
    if (!id) {
      Alert.alert('Error', 'Failed to create page');
      return;
    }
    Alert.alert('Success', 'Page created');
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: spacing.sm, paddingBottom: spacing.xl }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formRow}><Text style={styles.label}>Name</Text><TextInput value={name} onChangeText={setName} style={styles.input} placeholder="Your page name" placeholderTextColor={colors.text.secondary} /></View>
        <View style={styles.formRow}><Text style={styles.label}>City</Text><TextInput value={city} onChangeText={setCity} style={styles.input} placeholder="City" placeholderTextColor={colors.text.secondary} /></View>
        <View style={styles.formRow}><Text style={styles.label}>Type</Text><TextInput value={type} onChangeText={(t) => setType((t as any) || 'community')} style={styles.input} placeholder="community | partner | sponsor | run_club" placeholderTextColor={colors.text.secondary} /></View>
        <TouchableOpacity style={styles.btn} onPress={pickImage}><Text style={styles.btnText}>{logoUri ? 'Change Logo' : 'Pick Logo'}</Text></TouchableOpacity>
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
  primaryText: { color: colors.bg },
});

export default CreatePageScreen;


