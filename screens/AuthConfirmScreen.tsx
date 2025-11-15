import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Linking as RNLinking, Platform } from 'react-native';
import * as Linking from 'expo-linking';
import { supabase } from '../supabase/client';
import { useTheme } from '../theme';

function getQueryParams(url?: string) {
  try {
    const target = url ?? (Platform.OS === 'web' ? window.location.href : undefined);
    if (!target) return {} as Record<string, string>;
    const u = new URL(target);
    const params = Object.fromEntries(u.searchParams.entries());
    return params as Record<string, string>;
  } catch {
    return {} as Record<string, string>;
  }
}

export function AuthConfirmScreen() {
  const theme = useTheme();
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const process = async () => {
      // Prefer current URL; fallback to last deep link
      const currentUrl = Platform.OS === 'web' ? window.location.href : (await Linking.getInitialURL()) ?? undefined;
      const { token_hash, type, next } = getQueryParams(currentUrl);
      if (!token_hash || !type) {
        setStatus('error');
        setError('Missing token parameters.');
        return;
      }
      const { error: err } = await supabase.auth.verifyOtp({ token_hash, type: type as any });
      if (cancelled) return;
      if (err) {
        setStatus('error');
        setError(err.message);
        // Redirect to error page path so the web URL is stable for UX
        const fallback = '/auth/auth-code-error';
        if (Platform.OS === 'web') {
          window.location.replace(fallback);
        }
        return;
      }
      setStatus('success');
      const deepLink = next || 'strd://reset-password';
      try {
        // Attempt to open the app via custom scheme
        await RNLinking.openURL(deepLink);
      } catch {
        // If it fails (e.g., scheme unhandled on desktop), show hint
        setError('Tried to open the app. If nothing happened, open STRD and try again.');
      }
    };
    void process();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: theme.colors.bg, alignItems: 'center', justifyContent: 'center' }}>
      {status === 'pending' && (
        <>
          <ActivityIndicator color={theme.colors.primary} />
          <Text style={{ color: theme.colors.text.muted, marginTop: 12 }}>Confirming your request…</Text>
        </>
      )}
      {status === 'error' && (
        <>
          <Text style={{ color: theme.colors.danger, marginBottom: 8 }}>We couldn’t verify your link.</Text>
          {error ? <Text style={{ color: theme.colors.text.muted }}>{error}</Text> : null}
        </>
      )}
      {status === 'success' && (
        <Text style={{ color: theme.colors.text.primary }}>Opening the app to finish resetting your password…</Text>
      )}
    </View>
  );
}



