import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, Pressable, Platform, Keyboard, Modal } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
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
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [iosTempDate, setIosTempDate] = useState<Date>(new Date());
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
  const fieldStyle = { backgroundColor: colors.card, color: colors.text.primary, borderColor: colors.border } as const;
  const pressableStyle = { backgroundColor: colors.card, borderColor: colors.border } as const;
  const labelStyle = { color: colors.text.secondary } as const;
  const neutralBtnStyle = { backgroundColor: colors.card, borderColor: colors.border } as const;
  const neutralBtnText = { color: colors.text.primary } as const;
  const dangerBtnStyle = { backgroundColor: isLight ? colors.surfaceMuted : colors.card, borderColor: colors.danger } as const;
  const dangerBtnText = { color: colors.danger } as const;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['bottom']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: spacing.sm, paddingBottom: insets.bottom + tabBarHeight + spacing.xl }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formRow}><Text style={[styles.label, labelStyle]}>Title</Text><TextInput value={title} onChangeText={setTitle} style={[styles.input, fieldStyle]} placeholderTextColor={colors.text.secondary} /></View>
        <View style={styles.formRow}>
          <Text style={[styles.label, labelStyle]}>Date & Time</Text>
          <Pressable
            onPress={() => { Keyboard.dismiss(); if (Platform.OS === 'ios') setIosTempDate(new Date(dateISO)); setShowDatePicker(true); }}
            style={[styles.input, pressableStyle, { justifyContent: 'center' }]}
            accessibilityRole="button"
            hitSlop={12}
          >
            <Text style={{ color: fieldStyle.color }}>{new Date(dateISO).toLocaleString()}</Text>
          </Pressable>
          {showDatePicker && Platform.OS !== 'ios' ? (
            <DateTimePicker
              value={new Date(dateISO)}
              mode="datetime"
              display="default"
              onChange={(e, selectedDate) => {
                setShowDatePicker(false);
                if (!selectedDate) return;
                setDateISO(selectedDate.toISOString());
              }}
            />
          ) : null}
          {Platform.OS === 'ios' && (
            <Modal visible={showDatePicker} transparent animationType="slide" onRequestClose={() => setShowDatePicker(false)}>
              <Pressable style={{ flex: 1 }} onPress={() => setShowDatePicker(false)} />
              <View style={styles.iosSheet}>
                <Text style={[styles.label, { marginBottom: spacing.sm }]}>Select date</Text>
                <DateTimePicker
                  value={iosTempDate}
                  mode="date"
                  display="spinner"
                  themeVariant={isLight ? 'light' : 'dark'} as any
                  style={{ height: 216 }}
                  onChange={(_, d) => { if (d) setIosTempDate(prev => new Date(d.getFullYear(), d.getMonth(), d.getDate(), prev.getHours(), prev.getMinutes())); }}
                />
                <View style={{ height: spacing.md }} />
                <Text style={[styles.label, { marginBottom: spacing.sm }]}>Select time</Text>
                <DateTimePicker
                  value={iosTempDate}
                  mode="time"
                  display="spinner"
                  themeVariant={isLight ? 'light' : 'dark'} as any
                  style={{ height: 216 }}
                  onChange={(_, d) => { if (d) setIosTempDate(prev => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate(), d.getHours(), d.getMinutes())); }}
                />
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: spacing.md }}>
                  <TouchableOpacity style={[styles.btn, neutralBtnStyle]} onPress={() => setShowDatePicker(false)}>
                    <Text style={[styles.btnText, neutralBtnText]}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.btn, neutralBtnStyle, { marginLeft: spacing.sm }]} onPress={() => { setDateISO(iosTempDate.toISOString()); setShowDatePicker(false); }}>
                    <Text style={[styles.btnText, neutralBtnText]}>Done</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          )}
        </View>
        <View style={styles.formRow}><Text style={[styles.label, labelStyle]}>City</Text><TextInput value={city} onChangeText={setCity} style={[styles.input, fieldStyle]} placeholderTextColor={colors.text.secondary} /></View>
        <View style={styles.formRow}><Text style={[styles.label, labelStyle]}>Location name</Text><TextInput value={locationName} onChangeText={setLocationName} style={[styles.input, fieldStyle]} placeholderTextColor={colors.text.secondary} /></View>
        <View style={styles.row}>
          <View style={[styles.formRow, { flex: 1, marginRight: spacing.sm }]}><Text style={[styles.label, labelStyle]}>Lat</Text><TextInput value={lat} onChangeText={setLat} style={[styles.input, fieldStyle]} keyboardType="decimal-pad" placeholderTextColor={colors.text.secondary} /></View>
          <View style={[styles.formRow, { flex: 1 }]}><Text style={[styles.label, labelStyle]}>Lon</Text><TextInput value={lon} onChangeText={setLon} style={[styles.input, fieldStyle]} keyboardType="decimal-pad" placeholderTextColor={colors.text.secondary} /></View>
        </View>
        <View style={styles.formRow}><Text style={[styles.label, labelStyle]}>Tags (comma-separated)</Text><TextInput value={tags} onChangeText={setTags} style={[styles.input, fieldStyle]} placeholderTextColor={colors.text.secondary} /></View>
        <View style={styles.formRow}>
          <Text style={[styles.label, labelStyle]}>Description</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            style={[styles.input, fieldStyle, { height: 100 }]}
            multiline
            placeholderTextColor={colors.text.secondary}
          />
        </View>
        <TouchableOpacity style={[styles.btn, neutralBtnStyle]} onPress={pickImage}><Text style={[styles.btnText, neutralBtnText]}>{coverUri ? 'Change Cover' : 'Replace Cover'}</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.primary]} onPress={save}><Text style={[styles.btnText, styles.primaryText]}>Save</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.btn, dangerBtnStyle]} onPress={remove}><Text style={[styles.btnText, dangerBtnText]}>Delete</Text></TouchableOpacity>
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
  primaryText: { color: colors.onPrimary },
  iosSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.card,
    borderTopLeftRadius: borderRadius.md,
    borderTopRightRadius: borderRadius.md,
    padding: spacing.md,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
});

export default EditEventScreen;



