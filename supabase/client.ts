import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';

const resolveExtra = () => {
  const expoExtra = (Constants.expoConfig?.extra ||
    (Constants as any)?.manifest?.extra ||
    (Constants as any)?.manifest2?.extra ||
    {}) as Record<string, string>;
  return {
    ...expoExtra,
    EXPO_PUBLIC_SUPABASE_URL: expoExtra.EXPO_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL,
    EXPO_PUBLIC_SUPABASE_ANON_KEY: expoExtra.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  };
};

const extra = resolveExtra();
const SUPABASE_URL = extra.EXPO_PUBLIC_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = extra.EXPO_PUBLIC_SUPABASE_ANON_KEY as string;

// Debug logging
console.log('[Supabase Client] Initializing with URL:', SUPABASE_URL);
console.log('[Supabase Client] Has anon key:', !!SUPABASE_ANON_KEY);

if (!SUPABASE_URL || SUPABASE_URL === 'undefined') {
  console.error('[Supabase Client] ERROR: Supabase URL is not defined! Check your .env file and restart Expo.');
}

// Ensure WebBrowser completes the auth session
WebBrowser.maybeCompleteAuthSession();

// Export the URL for use in OAuth flows
export const supabaseUrl = SUPABASE_URL;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,  // React Native doesn't have window.location
    flowType: 'implicit',
  },
});
