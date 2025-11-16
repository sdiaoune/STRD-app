import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { spacing, typography, borderRadius, useTheme as useTokensTheme } from '../theme';
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
  const theme = useTokensTheme();
  const setThemePreference = useStore(s => s.setThemePreference);
  const accentPreference = useStore(s => s.accentPreference);
  const styles = useMemo(() => createStyles(theme.colors), [theme.mode, accentPreference]);

  useEffect(() => {
    if (authError) {
      setShowToast(true);
      // Also show a system alert so the error is clearly visible
      Alert.alert('Sign-in failed', authError, [{ text: 'OK' }], { cancelable: true });
    }
  }, [authError]);

  const toggleBg = theme.mode === 'light' ? theme.colors.surfaceMuted : theme.colors.card;
  const toggleIcon = theme.mode === 'light' ? 'moon' : 'sunny';
  const subtitleOpacity = theme.mode === 'light' ? 0.7 : 1;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={{ alignItems: 'flex-end' }}>
          <Pressable
            onPress={() => setThemePreference(theme.mode === 'light' ? 'dark' : 'light')}
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
              borderColor: theme.colors.border,
            }}
          >
            <Ionicons name={toggleIcon} size={18} color={theme.colors.text.primary} />
          </Pressable>
        </View>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={[styles.subtitle, { opacity: subtitleOpacity }]}>Sign in to continue</Text>
        </View>

        <View style={styles.inputs}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={theme.colors.text.secondary}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />
          <Text style={[styles.label, { marginTop: spacing.md }]}>Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor={theme.colors.text.secondary}
            secureTextEntry
            style={styles.input}
          />
          <View style={{ alignItems: 'flex-end', marginTop: spacing.sm }}>
            <Pressable onPress={() => navigation.navigate('ForgotPassword' as never)} accessibilityRole="button">
              <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>Forgot password?</Text>
            </Pressable>
          </View>
          <View style={{ height: spacing.lg }} />
          <Button onPress={() => signIn('email', email, password)}>Sign in</Button>
        </View>

        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.divider} />
        </View>

        <Pressable
          style={styles.googleButton}
          onPress={() => signIn('google')}
          accessibilityRole="button"
        >
          <Ionicons
            name="logo-google"
            size={18}
            color={theme.colors.text.primary}
            style={{ marginRight: spacing.sm }}
          />
          <Text
            style={[
              styles.googleText,
              { color: theme.colors.text.primary },
            ]}
          >
            Continue with Google
          </Text>
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

const createStyles = (themeColors: ReturnType<typeof useTokensTheme>['colors']) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.bg,
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
      color: themeColors.text.primary,
    },
    subtitle: {
      ...typography.body,
      color: themeColors.text.secondary,
      marginTop: spacing.sm,
    },
    inputs: {
      marginTop: spacing.lg,
    },
    label: {
      ...typography.caption,
      color: themeColors.text.secondary,
      marginBottom: spacing.sm,
    },
    input: {
      ...typography.body,
      color: themeColors.text.primary,
      backgroundColor: themeColors.card,
      borderWidth: 1,
      borderColor: themeColors.border,
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
      backgroundColor: themeColors.border,
    },
    dividerText: {
      ...typography.caption,
      color: themeColors.text.secondary,
      marginHorizontal: spacing.md,
    },
    googleButton: {
      height: 56,
      borderWidth: 1,
      borderColor: themeColors.border,
      borderRadius: borderRadius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: themeColors.card,
      flexDirection: 'row',
    },
    googleText: {
      ...typography.body,
      color: themeColors.text.primary,
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
      color: themeColors.text.secondary,
      marginRight: spacing.sm,
    },
    footerLink: {
      ...typography.body,
      color: themeColors.primary,
      fontWeight: '600',
    },
  });