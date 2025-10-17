export default ({ config }: any) => ({
  ...config,
  extra: {
    ...config.extra,
    EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
    EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    SENTRY_DSN: process.env.SENTRY_DSN,
  },
});



