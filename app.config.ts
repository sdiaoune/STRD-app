export default ({ config }: any) => {
  const iosClientId: string | undefined = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  const webClientId: string | undefined = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

  // Build the reversed client ID scheme required by Google on iOS
  const reversedGoogleScheme = iosClientId?.includes('.apps.googleusercontent.com')
    ? `com.googleusercontent.apps.${iosClientId.split('.apps.googleusercontent.com')[0]}`
    : undefined;

  const baseScheme: string = config.scheme || 'strd';

  // Merge CFBundleURLTypes to ensure both our app scheme and Google's reversed scheme are registered
  const existingUrlTypes = (config.ios?.infoPlist?.CFBundleURLTypes || []) as any[];
  const urlTypes = [
    // Ensure our primary scheme is present
    { CFBundleURLSchemes: [baseScheme] },
    // Add Google's reversed scheme if available
    ...(reversedGoogleScheme ? [{ CFBundleURLSchemes: [reversedGoogleScheme] }] : []),
  ];

  return {
    ...config,
    scheme: baseScheme,
    ios: {
      ...config.ios,
      infoPlist: {
        ...(config.ios?.infoPlist || {}),
        CFBundleURLTypes: [...existingUrlTypes, ...urlTypes],
      },
    },
    extra: {
      ...config.extra,
      EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
      EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      SENTRY_DSN: process.env.SENTRY_DSN,
      EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: iosClientId,
      EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: webClientId,
      EXPO_PUBLIC_GOOGLE_IOS_REVERSED_SCHEME: reversedGoogleScheme,
    },
  };
};



