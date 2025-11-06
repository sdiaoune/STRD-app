import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, TextInput, Platform, ScrollView, Dimensions } from 'react-native';
import { spacing, borderRadius, typography, useTheme } from '../theme';
import DateTimePicker from '@react-native-community/datetimepicker';

type Props = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (startISO: string, endISO: string) => void;
};

export const SponsorDurationModal: React.FC<Props> = ({ visible, onClose, onConfirm }) => {
  const theme = useTheme();
  const now = Date.now();
  const presets = [
    { label: '24h', ms: 24 * 60 * 60 * 1000 },
    { label: '3d', ms: 3 * 24 * 60 * 60 * 1000 },
    { label: '7d', ms: 7 * 24 * 60 * 60 * 1000 },
    { label: '30d', ms: 30 * 24 * 60 * 60 * 1000 },
  ] as const;

  const [startValue, setStartValue] = React.useState<string>('0');
  const [startUnit, setStartUnit] = React.useState<'hours' | 'days'>('hours');
  const [durValue, setDurValue] = React.useState<string>('24');
  const [durUnit, setDurUnit] = React.useState<'hours' | 'days'>('hours');
  const [segment, setSegment] = React.useState<'datetime' | 'presets'>('datetime');
  const [startDate, setStartDate] = React.useState<Date>(new Date(now));
  const [endDate, setEndDate] = React.useState<Date>(new Date(now + 24 * 60 * 60 * 1000));
  const contentMaxHeight = Math.min(560, Math.round(Dimensions.get('window').height * 0.6));

  const applyPreset = (ms: number) => {
    const startMs = 0;
    const startISO = new Date(now + startMs).toISOString();
    const endISO = new Date(now + startMs + ms).toISOString();
    onConfirm(startISO, endISO);
  };

  const applyCustom = () => {
    const nStart = Math.max(0, Math.floor(Number(startValue) || 0));
    const startMs = nStart * (startUnit === 'hours' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000);
    const nDur = Math.max(1, Math.floor(Number(durValue) || 0));
    const durMs = nDur * (durUnit === 'hours' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000);
    const startISO = new Date(now + startMs).toISOString();
    const endISO = new Date(now + startMs + durMs).toISOString();
    onConfirm(startISO, endISO);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles(theme).backdrop}>
        <View style={styles(theme).sheet}>
          <Text style={styles(theme).title}>Sponsor duration</Text>
          <View style={styles(theme).segRow}>
            <TouchableOpacity onPress={() => setSegment('datetime')} style={[styles(theme).segBtn, segment === 'datetime' && styles(theme).segBtnActive]} accessibilityRole="button">
              <Text style={[styles(theme).segText, segment === 'datetime' && styles(theme).segTextActive]}>Pick date & time</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSegment('presets')} style={[styles(theme).segBtn, segment === 'presets' && styles(theme).segBtnActive]} accessibilityRole="button">
              <Text style={[styles(theme).segText, segment === 'presets' && styles(theme).segTextActive]}>Presets</Text>
            </TouchableOpacity>
          </View>
          <View style={{ maxHeight: contentMaxHeight }}>
            <ScrollView contentContainerStyle={{ paddingBottom: spacing.sm }}>
          {segment === 'presets' ? (
            <>
              <View style={styles(theme).row}>
                {presets.map(p => (
                  <TouchableOpacity key={p.label} onPress={() => applyPreset(p.ms)} style={styles(theme).presetBtn} accessibilityRole="button">
                    <Text style={styles(theme).presetText}>{p.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={{ height: spacing.sm }} />
              <Text style={styles(theme).subtitle}>Start in</Text>
              <View style={styles(theme).customRow}>
                <TextInput keyboardType="number-pad" value={startValue} onChangeText={setStartValue} style={styles(theme).input} placeholder="Amount" placeholderTextColor={theme.colors.text.secondary} />
                <View style={{ flexDirection: 'row', marginLeft: spacing.sm }}>
                  <TouchableOpacity onPress={() => setStartUnit('hours')} style={[styles(theme).unitBtn, startUnit === 'hours' && styles(theme).unitBtnActive]} accessibilityRole="button"><Text style={[styles(theme).unitText, startUnit === 'hours' && styles(theme).unitTextActive]}>Hours</Text></TouchableOpacity>
                  <TouchableOpacity onPress={() => setStartUnit('days')} style={[styles(theme).unitBtn, startUnit === 'days' && styles(theme).unitBtnActive]} accessibilityRole="button"><Text style={[styles(theme).unitText, startUnit === 'days' && styles(theme).unitTextActive]}>Days</Text></TouchableOpacity>
                </View>
              </View>
              <View style={{ height: spacing.sm }} />
              <Text style={styles(theme).subtitle}>Duration</Text>
              <View style={styles(theme).customRow}>
                <TextInput keyboardType="number-pad" value={durValue} onChangeText={setDurValue} style={styles(theme).input} placeholder="Amount" placeholderTextColor={theme.colors.text.secondary} />
                <View style={{ flexDirection: 'row', marginLeft: spacing.sm }}>
                  <TouchableOpacity onPress={() => setDurUnit('hours')} style={[styles(theme).unitBtn, durUnit === 'hours' && styles(theme).unitBtnActive]} accessibilityRole="button"><Text style={[styles(theme).unitText, durUnit === 'hours' && styles(theme).unitTextActive]}>Hours</Text></TouchableOpacity>
                  <TouchableOpacity onPress={() => setDurUnit('days')} style={[styles(theme).unitBtn, durUnit === 'days' && styles(theme).unitBtnActive]} accessibilityRole="button"><Text style={[styles(theme).unitText, durUnit === 'days' && styles(theme).unitTextActive]}>Days</Text></TouchableOpacity>
                </View>
              </View>
            </>
          ) : (
            <>
              <Text style={styles(theme).subtitle}>Start</Text>
              <View style={styles(theme).pickerRow}>
                <DateTimePicker value={startDate} mode="date" display={Platform.OS === 'ios' ? 'inline' : 'default'} onChange={(e, d) => d && setStartDate(new Date(d))} />
                <DateTimePicker value={startDate} mode="time" display={Platform.OS === 'ios' ? 'inline' : 'default'} onChange={(e, d) => d && setStartDate(prev => new Date(d))} />
              </View>
              <View style={{ height: spacing.sm }} />
              <Text style={styles(theme).subtitle}>End</Text>
              <View style={styles(theme).pickerRow}>
                <DateTimePicker value={endDate} mode="date" display={Platform.OS === 'ios' ? 'inline' : 'default'} onChange={(e, d) => { if (!d) return; const nd = new Date(d); if (nd <= startDate) nd.setTime(startDate.getTime() + 60*60*1000); setEndDate(nd); }} />
                <DateTimePicker value={endDate} mode="time" display={Platform.OS === 'ios' ? 'inline' : 'default'} onChange={(e, d) => { if (!d) return; const nd = new Date(d); if (nd <= startDate) nd.setTime(startDate.getTime() + 60*60*1000); setEndDate(nd); }} />
              </View>
            </>
          )}
            </ScrollView>
          </View>
          <View style={styles(theme).footerRow}>
            <TouchableOpacity onPress={onClose} style={styles(theme).footerBtn} accessibilityRole="button">
              <Text style={styles(theme).cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { if (segment === 'datetime') { let s = startDate; let e = endDate; if (e <= s) e = new Date(s.getTime() + 60*60*1000); onConfirm(s.toISOString(), e.toISOString()); } else { applyCustom(); } }} style={[styles(theme).footerBtn, styles(theme).applyBtn]} accessibilityRole="button">
              <Text style={styles(theme).applyText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = (theme: ReturnType<typeof useTheme>) => {
  const sheetBg = theme.mode === 'light' ? '#ffffff' : theme.colors.card;
  const controlBg = theme.mode === 'light' ? '#ffffff' : theme.colors.bg;
  return StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', alignItems: 'center' },
  sheet: { width: '88%', backgroundColor: sheetBg, borderRadius: borderRadius.modal, borderWidth: 1, borderColor: theme.colors.border, padding: spacing.md },
  title: { ...typography.h3, color: theme.colors.text.primary, marginBottom: spacing.sm },
  subtitle: { ...typography.caption, color: theme.colors.text.secondary, marginBottom: spacing.xs },
  row: { flexDirection: 'row', flexWrap: 'wrap' },
  presetBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.md, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: controlBg, marginRight: spacing.sm, marginBottom: spacing.sm },
  presetText: { ...typography.body, color: theme.colors.text.primary },
  customRow: { flexDirection: 'row', alignItems: 'center' },
  pickerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  input: { width: 80, paddingHorizontal: spacing.sm, paddingVertical: spacing.sm, borderWidth: 1, borderColor: theme.colors.border, borderRadius: borderRadius.md, color: theme.colors.text.primary, backgroundColor: controlBg },
  unitBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderWidth: 1, borderColor: theme.colors.border, borderRadius: borderRadius.md, marginRight: spacing.sm, backgroundColor: controlBg },
  unitBtnActive: { borderColor: theme.colors.primary },
  unitText: { ...typography.caption, color: theme.colors.text.secondary },
  unitTextActive: { color: theme.colors.primary, fontWeight: '700' },
  segRow: { flexDirection: 'row', marginBottom: spacing.sm },
  segBtn: { flex: 1, paddingVertical: spacing.sm, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: controlBg, borderRadius: borderRadius.md, marginRight: spacing.sm, alignItems: 'center' },
  segBtnActive: { borderColor: theme.colors.primary },
  segText: { ...typography.caption, color: theme.colors.text.secondary },
  segTextActive: { color: theme.colors.primary, fontWeight: '700' },
  footerRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: spacing.md },
  footerBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.md, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: controlBg, marginLeft: spacing.sm },
  cancelText: { ...typography.body, color: theme.colors.text.secondary },
  applyBtn: { borderColor: theme.colors.primary },
  applyText: { ...typography.body, color: theme.colors.primary, fontWeight: '700' },
}); };

export default SponsorDurationModal;


