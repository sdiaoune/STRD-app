import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, useTheme as useTokensTheme } from '../theme';
import { Button } from '../components/Button';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '../state/store';
import { supabase } from '../supabase/client';

export const SignUpScreen: React.FC = () => {
  const navigation = useNavigation();
  const signIn = useStore(state => state.signIn);
  const authError = useStore(state => state.authError);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const theme = useTokensTheme();
  const toggleBg = theme.mode === 'light' ? colors.surfaceMuted : colors.card;
  const toggleIcon = theme.mode === 'light' ? 'moon' : 'sunny';
  const subtitleOpacity = theme.mode === 'light' ? 0.7 : 1;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={["top"]}>
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
              backgroundColor: toggleBg,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Ionicons name={toggleIcon} size={18} color={colors.text.primary} />
          </Pressable>
        </View>
        <View style={styles.header}>
          <Text style={styles.title}>Create account</Text>
          <Text style={[styles.subtitle, { opacity: subtitleOpacity }]}>Join the community</Text>
        </View>

        <View style={styles.inputs}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor={colors.text.secondary}
            style={styles.input}
          />
          <Text style={[styles.label, { marginTop: spacing.md }]}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={colors.text.secondary}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />
          <Text style={[styles.label, { marginTop: spacing.md }]}>Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Create a password"
            placeholderTextColor={colors.text.secondary}
            secureTextEntry
            style={styles.input}
          />
          <View style={{ height: spacing.lg }} />
          <Button onPress={async () => {
            try {
              if (!email || !password) throw new Error('Missing credentials');
              const { error } = await supabase.auth.signUp({ email, password });
              if (error) throw error;
              // Send user to OTP screen to confirm signup
              (navigation as any).navigate('SignupCode', { email, name });
            } catch (e: any) {
              useStore.setState({ authError: e?.message || 'Sign-up failed' });
            }
          }}>Create account</Button>
        </View>

        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.divider} />
        </View>

        <Pressable style={[styles.googleButton, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => signIn('google')} accessibilityRole="button">
        {!!authError && (
          <Text style={{ color: colors.danger, textAlign: 'center', marginTop: spacing.md }}>{authError}</Text>
        )}
          <Ionicons name="logo-google" size={18} color={colors.text.primary} style={{ marginRight: spacing.sm }} />
          <Text style={[styles.googleText, { color: colors.text.primary }]}>Sign up with Google</Text>
        </Pressable>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Already have an account?</Text>
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