import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { borderRadius, colors, spacing, typography, useTheme as useTokensTheme } from '../theme';
import { supabase } from '../supabase/client';
import { Avatar } from '../components/Avatar';
import { useStore } from '../state/store';
import DateTimePicker from '@react-native-community/datetimepicker';
import CertifiedBadge from '../components/CertifiedBadge';

type AdminUser = {
  id: string;
  name: string | null;
  handle: string | null;
  avatar_url: string | null;
  is_certified: boolean;
  sponsored_until: string | null;
  is_super_admin: boolean;
  role: string | null;
};

type AdminOrg = {
  id: string;
  name: string;
  logo_url: string | null;
  city: string | null;
  is_certified: boolean;
};

export const AdminToolsScreen: React.FC = () => {
  const theme = useTokensTheme();
  const currentUser = useStore(s => s.currentUser);
  const [query, setQuery] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [results, setResults] = React.useState<AdminUser[]>([]);
  const [orgQuery, setOrgQuery] = React.useState('');
  const [orgResults, setOrgResults] = React.useState<AdminOrg[]>([]);
  const [pickerState, setPickerState] = React.useState<{ visible: boolean; user: AdminUser | null }>({ visible: false, user: null });

  const runSearch = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, handle, avatar_url, is_certified, sponsored_until, is_super_admin, role')
        .ilike('name', `%${query}%`)
        .limit(20);
      if (error) throw error;
      setResults((data as AdminUser[]) || []);
    } catch (e: any) {
      Alert.alert('Search failed', e?.message || 'Unable to search users');
    } finally {
      setLoading(false);
    }
  };

  const runOrgSearch = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('organizations')
        .select('id, name, logo_url, city, is_certified')
        .ilike('name', `%${orgQuery}%`)
        .limit(20);
      if (error) throw error;
      setOrgResults((data as AdminOrg[]) || []);
    } catch (e: any) {
      Alert.alert('Search failed', e?.message || 'Unable to search organizations');
    } finally {
      setLoading(false);
    }
  };

  const toggleCertified = async (user: AdminUser) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_certified: !user.is_certified })
        .eq('id', user.id);
      if (error) throw error;
      setResults(prev => prev.map(u => u.id === user.id ? { ...u, is_certified: !u.is_certified } : u));
    } catch (e: any) {
      Alert.alert('Update failed', e?.message || 'Could not toggle certified');
    }
  };

  const setSponsoredDays = async (user: AdminUser, days: number) => {
    try {
      const until = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
      const { error } = await supabase
        .from('profiles')
        .update({ sponsored_until: until })
        .eq('id', user.id);
      if (error) throw error;
      setResults(prev => prev.map(u => u.id === user.id ? { ...u, sponsored_until: until } : u));
    } catch (e: any) {
      Alert.alert('Update failed', e?.message || 'Could not set sponsored');
    }
  };

  const clearSponsored = async (user: AdminUser) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ sponsored_until: null })
        .eq('id', user.id);
      if (error) throw error;
      setResults(prev => prev.map(u => u.id === user.id ? { ...u, sponsored_until: null } : u));
    } catch (e: any) {
      Alert.alert('Update failed', e?.message || 'Could not clear sponsored');
    }
  };

  const setSponsoredCustom = async (user: AdminUser, until: Date) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ sponsored_until: until.toISOString() })
        .eq('id', user.id);
      if (error) throw error;
      setResults(prev => prev.map(u => u.id === user.id ? { ...u, sponsored_until: until.toISOString() } : u));
    } catch (e: any) {
      Alert.alert('Update failed', e?.message || 'Could not set sponsored');
    }
  };

  const toggleOrgCertified = async (org: AdminOrg) => {
    try {
      const next = !org.is_certified;
      const { error } = await supabase
        .from('organizations')
        .update({ is_certified: next })
        .eq('id', org.id);
      if (error) throw error;
      setOrgResults(prev => prev.map(o => o.id === org.id ? { ...o, is_certified: next } : o));
    } catch (e: any) {
      Alert.alert('Update failed', e?.message || 'Could not toggle organization');
    }
  };

  const toggleSuperAdmin = async (user: AdminUser) => {
    if (user.id === currentUser.id) {
      Alert.alert('Not allowed', 'You cannot change your own super admin status here.');
      return;
    }
    try {
      const next = !user.is_super_admin;
      const payload: any = { is_super_admin: next };
      payload.role = next ? 'super_admin' : null;
      const { error } = await supabase
        .from('profiles')
        .update(payload)
        .eq('id', user.id);
      if (error) throw error;
      setResults(prev => prev.map(u => u.id === user.id ? { ...u, is_super_admin: next, role: payload.role } : u));
    } catch (e: any) {
      Alert.alert('Update failed', e?.message || 'Could not toggle super admin');
    }
  };

  const styles = React.useMemo(() => createStyles(), []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.bg }]} edges={['bottom']}> 
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.md }}>
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>Admin Tools</Text>

        <View style={styles.searchRow}>
          <TextInput
            style={[styles.input, { color: theme.colors.text.primary, backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
            placeholder="Search users by name"
            placeholderTextColor={theme.colors.text.secondary}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={runSearch}
            returnKeyType="search"
          />
          <TouchableOpacity onPress={runSearch} style={[styles.searchBtn, { borderColor: theme.colors.border, backgroundColor: theme.colors.card }]}> 
            <Text style={[styles.searchText, { color: theme.colors.primary }]}>{loading ? 'Searching…' : 'Search'}</Text>
          </TouchableOpacity>
        </View>

        {results.length === 0 ? (
          <Text style={[styles.empty, { color: theme.colors.text.secondary }]}>No results</Text>
        ) : (
          results.map(user => {
            const isSponsoredActive = !!(user.sponsored_until && new Date(user.sponsored_until).getTime() > Date.now());
            return (
              <View key={user.id} style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}> 
                <View style={styles.rowBetween}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Avatar source={user.avatar_url || undefined} size={44} label={user.name || undefined} />
                    <View style={{ marginLeft: spacing.sm }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={[styles.name, { color: theme.colors.text.primary }]}>{user.name || 'User'}</Text>
                        {user.is_certified ? <CertifiedBadge /> : null}
                      </View>
                      <Text style={[styles.handle, { color: theme.colors.text.secondary }]}>{user.handle || ''}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.actionsRow}>
                  <TouchableOpacity onPress={() => toggleCertified(user)} style={[styles.btn, user.is_certified && styles.btnActive]}> 
                    <Text style={[styles.btnText, user.is_certified && styles.btnTextActive]}>{user.is_certified ? 'Certified ✓' : 'Make Certified'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => toggleSuperAdmin(user)} style={[styles.btn, user.is_super_admin && styles.btnActive]}> 
                    <Text style={[styles.btnText, user.is_super_admin && styles.btnTextActive]}>{user.is_super_admin ? 'Super Admin ✓' : 'Make Super Admin'}</Text>
                  </TouchableOpacity>
                </View>

                {/* User-level sponsorship removed */}
              </View>
            );
          })
        )}

        <View style={{ height: spacing.lg }} />
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>Organizations</Text>
        <View style={styles.searchRow}>
          <TextInput
            style={[styles.input, { color: theme.colors.text.primary, backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
            placeholder="Search organizations by name"
            placeholderTextColor={theme.colors.text.secondary}
            value={orgQuery}
            onChangeText={setOrgQuery}
            onSubmitEditing={runOrgSearch}
            returnKeyType="search"
          />
          <TouchableOpacity onPress={runOrgSearch} style={[styles.searchBtn, { borderColor: theme.colors.border, backgroundColor: theme.colors.card }]}> 
            <Text style={[styles.searchText, { color: theme.colors.primary }]}>{loading ? 'Searching…' : 'Search'}</Text>
          </TouchableOpacity>
        </View>

        {orgResults.length === 0 ? (
          <Text style={[styles.empty, { color: theme.colors.text.secondary }]}>No organizations</Text>
        ) : (
          orgResults.map(org => (
            <View key={org.id} style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}> 
              <View style={styles.rowBetween}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Avatar source={org.logo_url || undefined} size={44} label={org.name || undefined} />
                  <View style={{ marginLeft: spacing.sm }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={[styles.name, { color: theme.colors.text.primary }]}>{org.name}</Text>
                      {org.is_certified ? <CertifiedBadge /> : null}
                    </View>
                    {!!org.city && <Text style={[styles.handle, { color: theme.colors.text.secondary }]}>{org.city}</Text>}
                  </View>
                </View>
              </View>
              <View style={styles.actionsRow}>
                <TouchableOpacity onPress={() => toggleOrgCertified(org)} style={[styles.btn, org.is_certified && styles.btnActive]}> 
                  <Text style={[styles.btnText, org.is_certified && styles.btnTextActive]}>{org.is_certified ? 'Certified ✓' : 'Make Certified'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        {pickerState.visible && pickerState.user && (
          <DateTimePicker
            value={new Date(Date.now() + 24*60*60*1000)}
            mode="datetime"
            display="default"
            onChange={(e, date) => {
              if (!date) { setPickerState({ visible: false, user: null }); return; }
              void setSponsoredCustom(pickerState.user as AdminUser, date).then(() => setPickerState({ visible: false, user: null }));
            }}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = () => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  title: { ...typography.h2, marginBottom: spacing.md },
  searchRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  searchBtn: {
    marginLeft: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  searchText: { ...typography.body, color: colors.primary, fontWeight: '600' },
  empty: { ...typography.body, marginTop: spacing.md },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.card,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  name: { ...typography.body, fontWeight: '700' },
  handle: { ...typography.caption },
  actionsRow: { flexDirection: 'row', marginTop: spacing.sm },
  btn: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginRight: spacing.sm,
  },
  btnActive: { borderColor: colors.primary, opacity: 0.95 },
  btnText: { ...typography.body, color: colors.primary, fontWeight: '600' },
  btnTextActive: { color: colors.primary },
  sponsoredRow: { marginTop: spacing.sm, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  small: { ...typography.caption },
  linkBtn: { marginLeft: spacing.sm },
  linkText: { ...typography.caption, color: colors.primary, fontWeight: '700' },
});

export default AdminToolsScreen;


