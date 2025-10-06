import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../theme';
import { Button } from '../components/Button';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '../state/store';
import { Toast } from '../components/Toast';

export const SignInScreen: React.FC = () => {
  const navigation = useNavigation();
  const signIn = useStore(state => state.signIn);
  const authError = useStore(state => state.authError);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (authError) {
      setShowToast(true);
      // Also show a system alert so the error is clearly visible
      Alert.alert('Sign-in failed', authError, [{ text: 'OK' }], { cancelable: true });
    }
  }, [authError]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>
        </View>

        <View style={styles.inputs}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={colors.muted}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />
          <Text style={[styles.label, { marginTop: spacing.md }]}>Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor={colors.muted}
            secureTextEntry
            style={styles.input}
          />
          <View style={{ height: spacing.lg }} />
          <Button onPress={() => signIn('email', email, password)}>Sign in</Button>
        </View>

        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.divider} />
        </View>

        <Pressable style={styles.googleButton} onPress={() => signIn('google')} accessibilityRole="button">
          <Ionicons name="logo-google" size={18} color={colors.text.primary} style={{ marginRight: spacing.sm }} />
          <Text style={styles.googleText}>Continue with Google</Text>
        </Pressable>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Don't have an account?</Text>
          <Pressable onPress={() => navigation.navigate('SignUp' as never)} accessibilityRole="button">
            <Text style={styles.footerLink}>Create one</Text>
          </Pressable>
        </View>
      </ScrollView>
      {showToast && authError && (
        <Toast message={authError} type="warning" position="top" size="large" onDismiss={() => setShowToast(false)} />
      )}
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
    color: colors.muted,
    marginTop: spacing.sm,
  },
  inputs: {
    marginTop: spacing.lg,
  },
  label: {
    ...typography.caption,
    color: colors.muted,
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
    color: colors.muted,
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
    color: colors.muted,
    marginRight: spacing.sm,
  },
  footerLink: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
});