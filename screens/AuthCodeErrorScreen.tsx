import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { supabase } from '../supabase/client';
import { useTheme } from '../theme';

export function AuthCodeErrorScreen() {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resend = async () => {
    if (!email) {
      setError('Enter your email to resend the reset link.');
      return;
    }
    setSubmitting(true);
    setError(null);
    setMessage(null);
    try {
      const { error: err } = await supabase.auth.resetPasswordForEmail(email);
      if (err) {
        setError(err.message);
      } else {
        setMessage('If this email exists, a reset link has been sent.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: theme.colors.bg }}>
      <Text style={{ fontSize: 20, fontWeight: '600', color: theme.colors.text.primary, marginBottom: 16 }}>
        Problem verifying your link
      </Text>
      <Text style={{ color: theme.colors.text.muted, marginBottom: 8 }}>
        Your reset link may have expired or was already used. You can request a new one below.
      </Text>
      <TextInput
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
        placeholderTextColor={theme.colors.text.muted}
        style={{
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 10,
          color: theme.colors.text.primary,
          marginBottom: 12,
          backgroundColor: theme.colors.surface,
        }}
      />
      {error ? (
        <Text style={{ color: theme.colors.danger, marginBottom: 8 }}>{error}</Text>
      ) : null}
      {message ? (
        <Text style={{ color: theme.colors.success, marginBottom: 8 }}>{message}</Text>
      ) : null}
      <TouchableOpacity
        disabled={submitting}
        onPress={resend}
        style={{
          backgroundColor: theme.colors.primary,
          paddingVertical: 12,
          borderRadius: 8,
          alignItems: 'center',
          opacity: submitting ? 0.7 : 1,
        }}
      >
        <Text style={{ color: theme.colors.primaryForeground, fontWeight: '600' }}>
          {submitting ? 'Resending…' : 'Resend reset email'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}



