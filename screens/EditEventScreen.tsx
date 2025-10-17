import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { useStore } from '../state/store';
import { borderRadius, colors, spacing, typography } from '../theme';
import BlurTabBarBackground, { useBottomTabOverflow } from '../components/ui/TabBarBackground.ios';

type Params = { eventId: string };

export const EditEventScreen: React.FC = () => {
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

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: spacing.sm, paddingBottom: insets.bottom + tabBarHeight + spacing.xl }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formRow}><Text style={styles.label}>Title</Text><TextInput value={title} onChangeText={setTitle} style={styles.input} /></View>
        <View style={styles.formRow}><Text style={styles.label}>Date ISO</Text><TextInput value={dateISO} onChangeText={setDateISO} style={styles.input} /></View>
        <View style={styles.formRow}><Text style={styles.label}>City</Text><TextInput value={city} onChangeText={setCity} style={styles.input} /></View>
        <View style={styles.formRow}><Text style={styles.label}>Location name</Text><TextInput value={locationName} onChangeText={setLocationName} style={styles.input} /></View>
        <View style={styles.row}>
          <View style={[styles.formRow, { flex: 1, marginRight: spacing.sm }]}><Text style={styles.label}>Lat</Text><TextInput value={lat} onChangeText={setLat} style={styles.input} keyboardType="decimal-pad" /></View>
          <View style={[styles.formRow, { flex: 1 }]}><Text style={styles.label}>Lon</Text><TextInput value={lon} onChangeText={setLon} style={styles.input} keyboardType="decimal-pad" /></View>
        </View>
        <View style={styles.formRow}><Text style={styles.label}>Tags (comma-separated)</Text><TextInput value={tags} onChangeText={setTags} style={styles.input} /></View>
        <View style={styles.formRow}><Text style={styles.label}>Description</Text><TextInput value={description} onChangeText={setDescription} style={[styles.input, { height: 100 }]} multiline /></View>
        <TouchableOpacity style={styles.btn} onPress={pickImage}><Text style={styles.btnText}>{coverUri ? 'Change Cover' : 'Replace Cover'}</Text></TouchableOpacity>
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
  primaryText: { color: colors.bg },
  danger: { borderColor: '#aa2e25' },
  dangerText: { color: '#aa2e25' },
});

export default EditEventScreen;



