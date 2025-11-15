import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { EventsStackParamList } from '../types/navigation';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../state/store';
import { borderRadius, colors, spacing, typography } from '../theme';

type Nav = NativeStackNavigationProp<EventsStackParamList, 'ManageOrganizations'>;

export const ManageOrganizationsScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { ownedOrganizations, deletePage } = useStore();
  const orgs = ownedOrganizations();

  const handleDelete = (orgId: string) => {
    Alert.alert('Delete Organization', 'Are you sure? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deletePage(orgId); } },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.md }}>
        {orgs.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="business-outline" size={32} color={colors.icon.secondary} />
            <Text style={styles.emptyTitle}>No organizations yet</Text>
            <Text style={styles.emptyBody}>Create a page to get started.</Text>
            <TouchableOpacity style={[styles.primaryBtn]} onPress={() => navigation.navigate('CreatePage' as any)}>
              <Text style={styles.primaryText}>Create Page</Text>
            </TouchableOpacity>
          </View>
        ) : (
          orgs.map((org) => (
            <View key={org.id} style={styles.row}>
              <TouchableOpacity accessibilityRole="button" onPress={() => navigation.navigate('BusinessProfile' as any, { orgId: org.id } as any)}>
                <Text style={styles.title}>{org.name}</Text>
                <Text style={styles.subtitle}>{org.city}</Text>
              </TouchableOpacity>
              <View style={styles.actions}>
                <TouchableOpacity accessibilityRole="button" style={[styles.action, styles.view]} onPress={() => navigation.navigate('BusinessProfile' as any, { orgId: org.id } as any)}>
                  <Ionicons name="eye-outline" size={18} color={colors.text.primary} />
                  <Text style={[styles.actionText, { color: colors.text.primary }]}>View</Text>
                </TouchableOpacity>
                <TouchableOpacity accessibilityRole="button" style={[styles.action, styles.edit]} onPress={() => navigation.navigate('EditOrganization' as any, { orgId: org.id } as any)}>
                  <Ionicons name="create-outline" size={18} color={colors.onPrimary} />
                  <Text style={styles.actionText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity accessibilityRole="button" style={[styles.action, styles.delete]} onPress={() => handleDelete(org.id)}>
                  <Ionicons name="trash-outline" size={18} color={colors.onDanger} />
                  <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
                </TouchableOpacity>
              </View>
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
    flexDirection: 'column',
    alignItems: 'flex-start',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  title: { ...typography.h3, color: colors.text.primary },
  subtitle: { ...typography.caption, color: colors.text.secondary },
  action: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderRadius: borderRadius.md, marginLeft: spacing.sm,
  },
  view: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
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

export default ManageOrganizationsScreen;


