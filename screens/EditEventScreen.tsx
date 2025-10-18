import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { useStore } from '../state/store';
import { borderRadius, colors, spacing, typography, useTheme as useTokensTheme } from '../theme';
import BlurTabBarBackground, { useBottomTabOverflow } from '../components/ui/TabBarBackground.ios';

type Params = { eventId: string };

export const EditEventScreen: React.FC = () => {
  const theme = useTokensTheme();
  const route = useRoute<RouteProp<Record<string, Params>, string>>();
  const navigation = useNavigation();
  const updateEvent = useStore(state => (state as any).updateEvent);
  const deleteEvent = useStore(state => (state as any).deleteEvent);
  const eventById = useStore(state => state.eventById);
  const evt = eventById((route.params as any).eventId);

  const [title, setTitle] = useState(evt?.title || '');
  const [dateISO, setDateISO] = useState(evt?.dateISO || new Date().toISOString());
  const [city, setCity] = useState(evt?.city || '');
  const [locationName, setLocationName] = useState(evt?.location.name || '');
  const [lat, setLat] = useState(String(evt?.location.lat ?? ''));
  const [lon, setLon] = useState(String(evt?.location.lon ?? ''));
  const [tags, setTags] = useState((evt?.tags || []).join(', '));
  const [description, setDescription] = useState(evt?.description || '');
  const [coverUri, setCoverUri] = useState<string | undefined>();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabOverflow?.() ?? 0;

  useEffect(() => {
    if (!evt) {
      Alert.alert('Not found', 'Event not found');
    }
  }, [evt]);

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.9 });
    if (!res.canceled && res.assets && res.assets[0]?.uri) setCoverUri(res.assets[0].uri);
  };

  const save = async () => {
    if (!evt) return;
    const ok = await updateEvent(evt.id, {
      title,
      dateISO,
      city,
      location: { name: locationName, lat: Number(lat), lon: Number(lon) },
      tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      description,
    }, coverUri);
    if (!ok) { Alert.alert('Error', 'Failed to update event'); return; }
    Alert.alert('Success', 'Event updated');
    (navigation as any).goBack();
  };

  const remove = async () => {
    if (!evt) return;
    const ok = await deleteEvent(evt.id);
    if (!ok) { Alert.alert('Error', 'Failed to delete event'); return; }
    (navigation as any).goBack();
  };

  const isLight = theme.mode === 'light';
  const fieldStyle = { backgroundColor: isLight ? '#ffffff' : colors.card, color: isLight ? '#000000' : colors.text.primary, borderColor: isLight ? '#e5e5e5' : colors.border } as const;
  const labelStyle = { color: isLight ? '#000000' : colors.text.secondary } as const;
  const neutralBtnStyle = { backgroundColor: isLight ? '#ffffff' : colors.card, borderColor: isLight ? '#e5e5e5' : colors.border } as const;
  const neutralBtnText = { color: isLight ? '#000000' : colors.text.primary } as const;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isLight ? '#ffffff' : colors.bg }]} edges={['bottom']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: spacing.sm, paddingBottom: insets.bottom + tabBarHeight + spacing.xl }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formRow}><Text style={[styles.label, labelStyle]}>Title</Text><TextInput value={title} onChangeText={setTitle} style={[styles.input, fieldStyle]} placeholderTextColor={isLight ? '#666666' : colors.text.secondary} /></View>
        <View style={styles.formRow}><Text style={[styles.label, labelStyle]}>Date ISO</Text><TextInput value={dateISO} onChangeText={setDateISO} style={[styles.input, fieldStyle]} placeholderTextColor={isLight ? '#666666' : colors.text.secondary} /></View>
        <View style={styles.formRow}><Text style={[styles.label, labelStyle]}>City</Text><TextInput value={city} onChangeText={setCity} style={[styles.input, fieldStyle]} placeholderTextColor={isLight ? '#666666' : colors.text.secondary} /></View>
        <View style={styles.formRow}><Text style={[styles.label, labelStyle]}>Location name</Text><TextInput value={locationName} onChangeText={setLocationName} style={[styles.input, fieldStyle]} placeholderTextColor={isLight ? '#666666' : colors.text.secondary} /></View>
        <View style={styles.row}>
          <View style={[styles.formRow, { flex: 1, marginRight: spacing.sm }]}><Text style={[styles.label, labelStyle]}>Lat</Text><TextInput value={lat} onChangeText={setLat} style={[styles.input, fieldStyle]} keyboardType="decimal-pad" placeholderTextColor={isLight ? '#666666' : colors.text.secondary} /></View>
          <View style={[styles.formRow, { flex: 1 }]}><Text style={[styles.label, labelStyle]}>Lon</Text><TextInput value={lon} onChangeText={setLon} style={[styles.input, fieldStyle]} keyboardType="decimal-pad" placeholderTextColor={isLight ? '#666666' : colors.text.secondary} /></View>
        </View>
        <View style={styles.formRow}><Text style={[styles.label, labelStyle]}>Tags (comma-separated)</Text><TextInput value={tags} onChangeText={setTags} style={[styles.input, fieldStyle]} placeholderTextColor={isLight ? '#666666' : colors.text.secondary} /></View>
        <View style={styles.formRow}><Text style={[styles.label, labelStyle]}>Description</Text><TextInput value={description} onChangeText={setDescription} style={[styles.input, fieldStyle, { height: 100 }]} multiline placeholderTextColor={isLight ? '#666666' : colors.text.secondary} /></View>
        <TouchableOpacity style={[styles.btn, neutralBtnStyle]} onPress={pickImage}><Text style={[styles.btnText, neutralBtnText]}>{coverUri ? 'Change Cover' : 'Replace Cover'}</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.primary]} onPress={save}><Text style={[styles.btnText, styles.primaryText]}>Save</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.danger]} onPress={remove}><Text style={[styles.btnText, styles.dangerText]}>Delete</Text></TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: spacing.md },
  row: { flexDirection: 'row' },
  formRow: { marginBottom: spacing.md },
  label: { ...typography.small, color: colors.text.secondary, marginBottom: spacing.xs },
  input: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, color: colors.text.primary },
  btn: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, paddingVertical: spacing.md, borderRadius: borderRadius.md, alignItems: 'center', marginTop: spacing.md },
  btnText: { ...typography.body, color: colors.text.primary, fontWeight: '600' },
  primary: { backgroundColor: colors.primary, borderColor: colors.primary },
  primaryText: { color: '#ffffff' },
  danger: { borderColor: '#aa2e25' },
  dangerText: { color: '#aa2e25' },
});

export default EditEventScreen;



