import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { EventsStackParamList } from '../types/navigation';
import * as ImagePicker from 'expo-image-picker';
import { useStore } from '../state/store';
import { borderRadius, colors, spacing, typography, useTheme as useTokensTheme } from '../theme';

type EditOrganizationScreenNavigationProp = NativeStackNavigationProp<EventsStackParamList, 'EditOrganization'>;
type EditOrganizationScreenRouteProp = RouteProp<EventsStackParamList, 'EditOrganization'>;

export const EditOrganizationScreen: React.FC = () => {
  const navigation = useNavigation<EditOrganizationScreenNavigationProp>();
  const route = useRoute<EditOrganizationScreenRouteProp>();
  const { orgId } = route.params;
  
  const theme = useTokensTheme();
  const isLight = theme.mode === 'light';
  const fieldStyle = { backgroundColor: isLight ? '#ffffff' : colors.card, color: isLight ? '#000000' : colors.text.primary, borderColor: isLight ? '#e5e5e5' : colors.border } as const;
  const labelStyle = { color: isLight ? '#000000' : colors.text.secondary } as const;
  
  const { orgById, updatePage } = useStore();
  const organization = orgById(orgId);
  
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [logoUri, setLogoUri] = useState<string | undefined>();
  const [website, setWebsite] = useState<string>('');

  useEffect(() => {
    if (organization) {
      setName(organization.name);
      setCity(organization.city);
      setWebsite(organization.website || '');
      // Do NOT set logoUri to the existing remote URL.
      // We only set logoUri when the user picks a new local image.
    }
  }, [organization]);

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.9 });
    if (!res.canceled && res.assets && res.assets[0]?.uri) {
      setLogoUri(res.assets[0].uri);
    }
  };

  const submit = async () => {
    if (!name || !city) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    const normalizedWebsite = website.trim() ? website.trim() : null;
    const success = await updatePage(orgId, { name, city, logoUri, website: normalizedWebsite });
    if (!success) {
      Alert.alert('Error', 'Failed to update organization');
      return;
    }
    Alert.alert('Success', 'Organization updated');
    navigation.goBack();
  };

  if (!organization) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isLight ? '#ffffff' : colors.bg }]} edges={['bottom']}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: isLight ? '#000000' : colors.text.secondary }]}>Organization not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isLight ? '#ffffff' : colors.bg }]} edges={['bottom']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: spacing.sm, paddingBottom: spacing.xl }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formRow}>
          <Text style={[styles.label, labelStyle]}>Name</Text>
          <TextInput 
            value={name} 
            onChangeText={setName} 
            style={[styles.input, fieldStyle]} 
            placeholder="Organization name" 
            placeholderTextColor={isLight ? '#666666' : colors.text.secondary} 
          />
        </View>
        <View style={styles.formRow}>
          <Text style={[styles.label, labelStyle]}>Website</Text>
          <TextInput 
            value={website}
            onChangeText={setWebsite}
            style={[styles.input, fieldStyle]}
            placeholder="https://example.org"
            placeholderTextColor={isLight ? '#666666' : colors.text.secondary}
            autoCapitalize="none"
            keyboardType="url"
          />
        </View>
        <View style={styles.formRow}>
          <Text style={[styles.label, labelStyle]}>City</Text>
          <TextInput 
            value={city} 
            onChangeText={setCity} 
            style={[styles.input, fieldStyle]} 
            placeholder="City" 
            placeholderTextColor={isLight ? '#666666' : colors.text.secondary} 
          />
        </View>
        <TouchableOpacity style={[styles.btn, fieldStyle]} onPress={pickImage}>
          <Text style={[styles.btnText, { color: fieldStyle.color }]}>
            {organization?.logo ? 'Change Logo' : 'Pick Logo'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.primary]} onPress={submit}>
          <Text style={[styles.btnText, styles.primaryText]}>Save Changes</Text>
        </TouchableOpacity>
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
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    ...typography.h2,
    color: colors.muted,
  },
});

export default EditOrganizationScreen;
