import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { supabase } from '../supabase/client';
import { useTheme } from '../theme';

export function SignupCodeScreen({ route, navigation }: any) {
  const theme = useTheme();
  const [email, setEmail] = useState<string>(route?.params?.email || '');
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);
    if (!email || !code) {
      setError('Enter your email and the 6-digit code.');
      return;
    }
    setSubmitting(true);
    try {
      const { error: verifyErr } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'signup' as any,
      });
      if (verifyErr) {
        setError(verifyErr.message);
        return;
      }
      // onAuthStateChange listener will sign the user in; navigate to main screen
      navigation.navigate('Timeline');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: theme.colors.bg }}>
      <Text style={{ fontSize: 20, fontWeight: '600', color: theme.colors.text.primary, marginBottom: 16 }}>
        Confirm your email
      </Text>
      <Text style={{ color: theme.colors.text.muted, marginBottom: 8 }}>
        We sent a 6-digit code to your email. Enter it to finish creating your account.
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
      <TextInput
        value={code}
        onChangeText={setCode}
        placeholder="123456"
        placeholderTextColor={theme.colors.text.muted}
        keyboardType="number-pad"
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
      <TouchableOpacity
        disabled={submitting}
        onPress={onSubmit}
        style={{
          backgroundColor: theme.colors.primary,
          paddingVertical: 12,
          borderRadius: 8,
          alignItems: 'center',
          opacity: submitting ? 0.7 : 1,
        }}
      >
        <Text style={{ color: theme.colors.primaryForeground, fontWeight: '600' }}>
          {submitting ? 'Confirming…' : 'Confirm'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}



