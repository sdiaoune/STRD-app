import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { EventsStackParamList } from '../types/navigation';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../state/store';
import { borderRadius, colors, spacing, typography } from '../theme';

type Nav = NativeStackNavigationProp<EventsStackParamList, 'ManageEvents'>;

export const ManageEventsScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { manageableEvents, deleteEvent } = useStore();
  const events = manageableEvents();

  const handleDelete = (eventId: string) => {
    Alert.alert('Delete Event', 'Are you sure? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteEvent(eventId); } },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.md }}>
        {events.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={32} color={colors.icon.secondary} />
            <Text style={styles.emptyTitle}>No events yet</Text>
            <Text style={styles.emptyBody}>Create an event to get started.</Text>
            <TouchableOpacity style={[styles.primaryBtn]} onPress={() => navigation.navigate('CreateEvent' as any)}>
              <Text style={styles.primaryText}>Create Event</Text>
            </TouchableOpacity>
          </View>
        ) : (
          events.map((ev) => (
            <View key={ev.id} style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{ev.title}</Text>
                <Text style={styles.subtitle}>{ev.city}</Text>
              </View>
              <TouchableOpacity accessibilityRole="button" style={[styles.action, styles.edit]} onPress={() => navigation.navigate('EditEvent' as any, { eventId: ev.id } as any)}>
                <Ionicons name="create-outline" size={18} color={colors.onPrimary} />
                <Text style={styles.actionText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity accessibilityRole="button" style={[styles.action, styles.delete]} onPress={() => handleDelete(ev.id)}>
                <Ionicons name="trash-outline" size={18} color={colors.onDanger} />
                <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  title: { ...typography.h3, color: colors.text.primary },
  subtitle: { ...typography.caption, color: colors.text.secondary },
  action: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderRadius: borderRadius.md, marginLeft: spacing.sm,
  },
  edit: { backgroundColor: colors.primary },
  delete: { backgroundColor: colors.danger },
  actionText: { ...typography.body, color: colors.onPrimary, marginLeft: spacing.xs, fontWeight: '600' },
  deleteText: { color: colors.onDanger },
  emptyState: { alignItems: 'center', marginTop: spacing.xl },
  emptyTitle: { ...typography.h3, color: colors.text.primary, marginTop: spacing.sm },
  emptyBody: { ...typography.body, color: colors.text.secondary, marginTop: spacing.xs, marginBottom: spacing.md },
  primaryBtn: { backgroundColor: colors.primary, borderRadius: borderRadius.md, paddingVertical: spacing.md, paddingHorizontal: spacing.lg },
  primaryText: { ...typography.body, color: colors.onPrimary, fontWeight: '700' },
});

export default ManageEventsScreen;




