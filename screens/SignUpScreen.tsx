import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, useTheme as useTokensTheme } from '../theme';
import { Button } from '../components/Button';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '../state/store';

export const SignUpScreen: React.FC = () => {
  const navigation = useNavigation();
  const signUp = useStore(state => state.signUp);
  const signIn = useStore(state => state.signIn);
  const authError = useStore(state => state.authError);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const theme = useTokensTheme();
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.mode === 'light' ? '#ffffff' : colors.bg }]} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={{ alignItems: 'flex-end' }}>
          <Pressable
            onPress={() => {
              const { setThemePreference } = require('../state/store');
            }}
          />
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Pressable
            onPress={() => (useStore.getState().setThemePreference(theme.mode === 'light' ? 'dark' : 'light'))}
            accessibilityRole="button"
            hitSlop={12}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme.mode === 'light' ? '#f2f2f2' : colors.card,
              borderWidth: 1,
              borderColor: theme.mode === 'light' ? '#e5e5e5' : colors.border,
            }}
          >
            <Ionicons name={theme.mode === 'light' ? 'moon' : 'sunny'} size={18} color={theme.mode === 'light' ? '#000000' : colors.text.primary} />
          </Pressable>
        </View>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.mode === 'light' ? '#000000' : colors.text.primary }]}>Create account</Text>
          <Text style={[styles.subtitle, { color: theme.mode === 'light' ? '#000000' : colors.text.secondary, opacity: theme.mode === 'light' ? 0.7 : 1 }]}>Join the community</Text>
        </View>

        <View style={styles.inputs}>
          <Text style={[styles.label, { color: theme.mode === 'light' ? '#000000' : colors.text.secondary }]}>Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor={theme.mode === 'light' ? '#666666' : colors.text.secondary}
            style={[styles.input, { backgroundColor: theme.mode === 'light' ? '#ffffff' : colors.card, color: theme.mode === 'light' ? '#000000' : colors.text.primary, borderColor: theme.mode === 'light' ? '#e5e5e5' : colors.border }]}
          />
          <Text style={[styles.label, { marginTop: spacing.md, color: theme.mode === 'light' ? '#000000' : colors.text.secondary }]}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={theme.mode === 'light' ? '#666666' : colors.text.secondary}
            keyboardType="email-address"
            autoCapitalize="none"
            style={[styles.input, { backgroundColor: theme.mode === 'light' ? '#ffffff' : colors.card, color: theme.mode === 'light' ? '#000000' : colors.text.primary, borderColor: theme.mode === 'light' ? '#e5e5e5' : colors.border }]}
          />
          <Text style={[styles.label, { marginTop: spacing.md, color: theme.mode === 'light' ? '#000000' : colors.text.secondary }]}>Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Create a password"
            placeholderTextColor={theme.mode === 'light' ? '#666666' : colors.text.secondary}
            secureTextEntry
            style={[styles.input, { backgroundColor: theme.mode === 'light' ? '#ffffff' : colors.card, color: theme.mode === 'light' ? '#000000' : colors.text.primary, borderColor: theme.mode === 'light' ? '#e5e5e5' : colors.border }]}
          />
          <View style={{ height: spacing.lg }} />
          <Button onPress={() => signUp(name, email, password)}>Create account</Button>
        </View>

        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.divider} />
        </View>

        <Pressable style={[styles.googleButton, { backgroundColor: theme.mode === 'light' ? '#ffffff' : 'transparent', borderColor: theme.mode === 'light' ? '#e5e5e5' : colors.border }]} onPress={() => signIn('google')} accessibilityRole="button">
        {!!authError && (
          <Text style={{ color: 'red', textAlign: 'center', marginTop: spacing.md }}>{authError}</Text>
        )}
          <Ionicons name="logo-google" size={18} color={theme.mode === 'light' ? '#000000' : colors.text.primary} style={{ marginRight: spacing.sm }} />
          <Text style={[styles.googleText, { color: theme.mode === 'light' ? '#000000' : colors.text.primary }]}>Sign up with Google</Text>
        </Pressable>

        <View style={styles.footerRow}>
          <Text style={[styles.footerText, { color: theme.mode === 'light' ? '#000000' : colors.text.secondary }]}>Already have an account?</Text>
          <Pressable onPress={() => navigation.navigate('SignIn' as never)} accessibilityRole="button">
            <Text style={styles.footerLink}>Sign in</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: spacing.xl,
    paddingTop: spacing.xl,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: colors.text.primary,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
    marginTop: spacing.sm,
  },
  inputs: {
    marginTop: spacing.lg,
  },
  label: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  input: {
    ...typography.body,
    color: colors.text.primary,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    ...typography.caption,
    color: colors.text.secondary,
    marginHorizontal: spacing.md,
  },
  googleButton: {
    height: 56,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    flexDirection: 'row',
  },
  googleText: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  footerText: {
    ...typography.body,
    color: colors.text.secondary,
    marginRight: spacing.sm,
  },
  footerLink: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
});