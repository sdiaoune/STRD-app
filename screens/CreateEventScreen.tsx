import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, Pressable } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import BlurTabBarBackground, { useBottomTabOverflow } from '../components/ui/TabBarBackground.ios';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import MapView, { Marker, Region } from 'react-native-maps';
import { useStore } from '../state/store';
import { borderRadius, colors, spacing, typography } from '../theme';

export const CreateEventScreen: React.FC = () => {
  const createEvent = useStore(state => (state as any).createEvent);
  const organizations = useStore(state => state.organizations);
  const currentUserId = useStore(state => state.currentUser.id);
  const myPages = useMemo(() => organizations.filter(o => o.ownerId === currentUserId), [organizations, currentUserId]);

  const [orgId, setOrgId] = useState(myPages[0]?.id || '');
  const [orgOpen, setOrgOpen] = useState(false);
  const selectedOrg = useMemo(() => myPages.find(p => p.id === orgId), [myPages, orgId]);
  const [title, setTitle] = useState('');
  const [dateISO, setDateISO] = useState(new Date().toISOString());
  const [city, setCity] = useState('');
  const [locationName, setLocationName] = useState('');
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [region, setRegion] = useState<Region | null>(null);
  const [tags, setTags] = useState('');
  const [description, setDescription] = useState('');
  const [coverUri, setCoverUri] = useState<string | undefined>();
  const [address, setAddress] = useState('');
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabOverflow?.() ?? 0;

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.9 });
    if (!res.canceled && res.assets && res.assets[0]?.uri) setCoverUri(res.assets[0].uri);
  };

  // Bootstrap map region from user location or typed lat/lon
  useEffect(() => {
    (async () => {
      try {
        const parsedLat = Number(lat);
        const parsedLon = Number(lon);
        const hasTyped = isFinite(parsedLat) && isFinite(parsedLon);
        if (hasTyped) {
          setRegion({ latitude: parsedLat, longitude: parsedLon, latitudeDelta: 0.02, longitudeDelta: 0.02 });
          return;
        }
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status !== 'granted') {
          try { await Location.requestForegroundPermissionsAsync(); } catch {}
        }
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced } as any);
        setRegion({ latitude: pos.coords.latitude, longitude: pos.coords.longitude, latitudeDelta: 0.02, longitudeDelta: 0.02 });
        setLat(pos.coords.latitude.toFixed(6));
        setLon(pos.coords.longitude.toFixed(6));
      } catch {}
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep map marker in sync when user types lat/lon (avoid loops by checking delta)
  useEffect(() => {
    const parsedLat = Number(lat);
    const parsedLon = Number(lon);
    if (!region) return;
    if (isFinite(parsedLat) && isFinite(parsedLon)) {
      const dLat = Math.abs(parsedLat - region.latitude);
      const dLon = Math.abs(parsedLon - region.longitude);
      if (dLat > 1e-7 || dLon > 1e-7) {
        setRegion({ ...region, latitude: parsedLat, longitude: parsedLon });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lon]);

  const submit = async () => {
    if (!orgId || !title || !city || !locationName || !lat || !lon) return;
    const ok = await createEvent(orgId, { title, dateISO, city, location: { name: locationName, lat: Number(lat), lon: Number(lon) }, tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [], description }, coverUri);
    if (!ok) { Alert.alert('Error', 'Failed to create event'); return; }
    Alert.alert('Success', 'Event created');
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: spacing.sm, paddingBottom: insets.bottom + tabBarHeight + spacing.xl }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formRow}>
          <Text style={styles.label}>Page</Text>
          <Pressable
            onPress={() => setOrgOpen((v) => !v)}
            style={styles.inputPressable}
            accessibilityRole="button"
            hitSlop={12}
          >
            <Text style={styles.inputPressableText}>
              {selectedOrg ? `${selectedOrg.name} (${selectedOrg.city})` : (myPages.length ? 'Select a page' : 'No pages yet — create one first')}
            </Text>
            {selectedOrg ? (
              <Text style={styles.inputSubtle}>{selectedOrg.id}</Text>
            ) : null}
          </Pressable>
          {orgOpen ? (
            <View style={styles.dropdown}>
              {myPages.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={styles.dropdownOption}
                  onPress={() => { setOrgId(p.id); setOrgOpen(false); }}
                >
                  <Text style={styles.dropdownOptionText}>{p.name}</Text>
                  <Text style={styles.dropdownOptionSub}>{p.city} · {p.id.slice(0,8)}…</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}
        </View>
        <View style={styles.formRow}><Text style={styles.label}>Title</Text><TextInput value={title} onChangeText={setTitle} style={styles.input} placeholder="Morning Run" placeholderTextColor={colors.text.secondary} /></View>
        <View style={styles.formRow}><Text style={styles.label}>Date ISO</Text><TextInput value={dateISO} onChangeText={setDateISO} style={styles.input} placeholder={new Date().toISOString()} placeholderTextColor={colors.text.secondary} /></View>
        <View style={styles.formRow}><Text style={styles.label}>City</Text><TextInput value={city} onChangeText={setCity} style={styles.input} placeholder="Charlotte" placeholderTextColor={colors.text.secondary} /></View>
        <View style={styles.formRow}><Text style={styles.label}>Location name</Text><TextInput value={locationName} onChangeText={setLocationName} style={styles.input} placeholder="Park" placeholderTextColor={colors.text.secondary} /></View>
        <View style={styles.formRow}>
          <Text style={styles.label}>Address</Text>
          <View style={styles.inlineRow}>
            <TextInput
              value={address}
              onChangeText={setAddress}
              style={[styles.input, { flex: 1, marginRight: spacing.sm }]}
              placeholder="Search address"
              placeholderTextColor={colors.text.secondary}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.smallBtn}
              onPress={async () => {
                if (!address) return;
                try {
                  const results = await Location.geocodeAsync(address);
                  const first = results && results[0];
                  if (first) {
                    setRegion({ latitude: first.latitude, longitude: first.longitude, latitudeDelta: 0.02, longitudeDelta: 0.02 });
                    setLat(first.latitude.toFixed(6));
                    setLon(first.longitude.toFixed(6));
                    try {
                      const rev = await Location.reverseGeocodeAsync({ latitude: first.latitude, longitude: first.longitude });
                      const r0 = rev && rev[0];
                      if (r0) {
                        const composed = r0.name || r0.street || r0.district || r0.city || r0.subregion;
                        if (composed) setLocationName(composed);
                        if (r0.city) setCity(r0.city);
                      }
                    } catch {}
                  } else {
                    Alert.alert('Not found', 'No results for that address');
                  }
                } catch {
                  Alert.alert('Error', 'Failed to geocode address');
                }
              }}
            >
              <Text style={styles.smallBtnText}>Find</Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* Map picker */}
        <View style={styles.formRow}>
          <Text style={styles.label}>Pick on map</Text>
          <View style={styles.mapWrap}>
            {region ? (
              <MapView
                style={styles.map}
                initialRegion={region}
                region={region}
                onRegionChangeComplete={async (r) => {
                  setRegion(r);
                  setLat(r.latitude.toFixed(6));
                  setLon(r.longitude.toFixed(6));
                  try {
                    const rev = await Location.reverseGeocodeAsync({ latitude: r.latitude, longitude: r.longitude });
                    const first = rev && rev[0];
                    if (first) {
                      const composed = first.name || first.street || first.district || first.city || first.subregion;
                      if (composed) setLocationName(composed);
                      if (first.city) setCity(first.city);
                    }
                  } catch {}
                }}
                showsUserLocation
              >
                <Marker
                  coordinate={{ latitude: region.latitude, longitude: region.longitude }}
                  draggable
                  onDragEnd={async (e) => {
                    const { latitude: dLat, longitude: dLon } = e.nativeEvent.coordinate;
                    setLat(dLat.toFixed(6));
                    setLon(dLon.toFixed(6));
                    setRegion({ ...region, latitude: dLat, longitude: dLon });
                    try {
                      const res = await Location.reverseGeocodeAsync({ latitude: dLat, longitude: dLon });
                      const first = res && res[0];
                      if (first) {
                        const composed = first.name || first.street || first.district || first.city || first.subregion;
                        if (composed) setLocationName(composed);
                      }
                    } catch {}
                  }}
                />
              </MapView>
            ) : (
              <View style={styles.mapFallback} />
            )}
          </View>
          <View style={{ flexDirection: 'row', marginTop: spacing.xs }}>
            <TouchableOpacity
              style={[styles.smallBtn, { marginRight: spacing.sm }]}
              onPress={async () => {
                try {
                  const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced } as any);
                  setRegion({ latitude: pos.coords.latitude, longitude: pos.coords.longitude, latitudeDelta: 0.02, longitudeDelta: 0.02 });
                  setLat(pos.coords.latitude.toFixed(6));
                  setLon(pos.coords.longitude.toFixed(6));
                } catch {}
              }}
            >
              <Text style={styles.smallBtnText}>Use current location</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.row}>
          <View style={[styles.formRow, { flex: 1, marginRight: spacing.sm }]}><Text style={styles.label}>Lat</Text><TextInput value={lat} onChangeText={setLat} style={styles.input} placeholder="35.22" placeholderTextColor={colors.text.secondary} keyboardType="decimal-pad" /></View>
          <View style={[styles.formRow, { flex: 1 }]}><Text style={styles.label}>Lon</Text><TextInput value={lon} onChangeText={setLon} style={styles.input} placeholder="-80.84" placeholderTextColor={colors.text.secondary} keyboardType="decimal-pad" /></View>
        </View>
        <View style={styles.formRow}><Text style={styles.label}>Tags (comma-separated)</Text><TextInput value={tags} onChangeText={setTags} style={styles.input} placeholder="5k, group, hills" placeholderTextColor={colors.text.secondary} /></View>
        <View style={styles.formRow}><Text style={styles.label}>Description</Text><TextInput value={description} onChangeText={setDescription} style={[styles.input, { height: 100 }]} placeholder="About the run" placeholderTextColor={colors.text.secondary} multiline /></View>
        <TouchableOpacity style={styles.btn} onPress={pickImage}><Text style={styles.btnText}>{coverUri ? 'Change Cover' : 'Pick Cover'}</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.primary]} onPress={submit}><Text style={[styles.btnText, styles.primaryText]}>Create Event</Text></TouchableOpacity>
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
  inputPressable: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md },
  inputPressableText: { ...typography.body, color: colors.text.primary },
  inputSubtle: { ...typography.caption, color: colors.text.secondary, marginTop: spacing.xs },
  dropdown: { marginTop: spacing.xs, borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md, backgroundColor: colors.card },
  dropdownOption: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  dropdownOptionText: { ...typography.body, color: colors.text.primary, fontWeight: '600' },
  dropdownOptionSub: { ...typography.caption, color: colors.text.secondary },
  mapWrap: { height: 200, borderRadius: borderRadius.md, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  map: { width: '100%', height: '100%' },
  mapFallback: { width: '100%', height: '100%', backgroundColor: colors.surfaceMuted },
  inlineRow: { flexDirection: 'row', alignItems: 'center' },
  smallBtn: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  smallBtnText: { ...typography.caption, color: colors.text.primary, fontWeight: '600' },
  btn: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, paddingVertical: spacing.md, borderRadius: borderRadius.md, alignItems: 'center', marginTop: spacing.md },
  btnText: { ...typography.body, color: colors.text.primary, fontWeight: '600' },
  primary: { backgroundColor: colors.primary, borderColor: colors.primary },
  primaryText: { color: colors.bg },
});

export default CreateEventScreen;


