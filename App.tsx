import React, { useEffect, useMemo, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { supabase } from './supabase/client';
import Constants from 'expo-constants';

import { ThemeProvider as LegacyThemeProvider, useTheme as useLegacyDesignTheme } from './src/design/useTheme';
import { ThemeProvider as TokensThemeProvider, useTheme as useTokensTheme, getNavigationTheme as getTokensNavigationTheme } from './theme';
import { EventsScreen } from './screens/EventsScreen';
import { EventDetailsScreen } from './screens/EventDetailsScreen';
import { CreatePageScreen } from './screens/CreatePageScreen';
import { CreateEventScreen } from './screens/CreateEventScreen';
import { EditEventScreen } from './screens/EditEventScreen';
import { TimelineScreen } from './screens/TimelineScreen';
import { PostDetailsScreen } from './screens/PostDetailsScreen';
import { RunStatsScreen } from './screens/RunStatsScreen';
import { RunScreen } from './screens/RunScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { BusinessProfileScreen } from './screens/BusinessProfileScreen';
import { UserSearchScreen } from './screens/UserSearchScreen';
import { RunnerProfileScreen } from './screens/RunnerProfileScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { NotificationsScreen } from './screens/NotificationsScreen';
import BlurTabBarBackground, { useBottomTabOverflow } from './components/ui/TabBarBackground.ios';
import CustomTabBar from './components/CustomTabBar';
import { HapticTab } from './components/HapticTab';
import { SignInScreen } from './screens/SignInScreen';
import { SignUpScreen } from './screens/SignUpScreen';
import { useStore } from './state/store';
import { OnboardingSurveyModal } from './components/OnboardingSurveyModal';

const LOCATION_PROMPT_KEY = 'strd_location_prompted';
const SURVEY_STORAGE_KEY = 'strd_onboarding_survey';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function EventsStack() {
  const theme = useTokensTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.bg },
        headerTintColor: theme.colors.text.primary,
        headerTitleStyle: { color: theme.colors.text.primary } as any,
      }}
    >
      <Stack.Screen 
        name="EventsList" 
        component={EventsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="EventDetails" 
        component={EventDetailsScreen}
        options={{ title: 'Event Details', headerBackTitle: 'Events' }}
      />
      <Stack.Screen 
        name="BusinessProfile" 
        component={BusinessProfileScreen}
        options={{ title: 'Organization', headerBackTitle: 'Events' }}
      />
      <Stack.Screen 
        name="CreatePage" 
        component={CreatePageScreen}
        options={{ title: 'Create Page' }}
      />
      <Stack.Screen 
        name="CreateEvent" 
        component={CreateEventScreen}
        options={{ title: 'Create Event' }}
      />
      <Stack.Screen 
        name="EditEvent" 
        component={EditEventScreen}
        options={{ title: 'Edit Event' }}
      />
    </Stack.Navigator>
  );
}

function TimelineStack() {
  const theme = useTokensTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.bg },
        headerTintColor: theme.colors.text.primary,
        headerTitleStyle: { color: theme.colors.text.primary } as any,
      }}
    >
      <Stack.Screen 
        name="TimelineList" 
        component={TimelineScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="PostDetails" 
        component={PostDetailsScreen}
        options={{ title: 'Post Details', headerBackTitle: 'Timeline' }}
      />
      <Stack.Screen 
        name="RunStats" 
        component={RunStatsScreen}
        options={{ title: 'Run Statistics', headerBackTitle: 'Timeline' }}
      />
      <Stack.Screen 
        name="EventDetails" 
        component={EventDetailsScreen}
        options={{ title: 'Event Details', headerBackTitle: 'Timeline' }}
      />
      <Stack.Screen 
        name="EditEvent" 
        component={EditEventScreen}
        options={{ title: 'Edit Event', headerBackTitle: 'Timeline' }}
      />
      <Stack.Screen 
        name="BusinessProfile" 
        component={BusinessProfileScreen}
        options={{ title: 'Organization', headerBackTitle: 'Timeline' }}
      />
      <Stack.Screen 
        name="Notifications" 
        component={NotificationsScreen}
        options={{ title: 'Notifications' }}
      />
    </Stack.Navigator>
  );
}

function RunStack() {
  const theme = useTokensTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.bg },
        headerTintColor: theme.colors.text.primary,
        headerTitleStyle: { color: theme.colors.text.primary } as any,
      }}
    >
      <Stack.Screen 
        name="RunTracker" 
        component={RunScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  const theme = useTokensTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.bg },
        headerTintColor: theme.colors.text.primary,
        headerTitleStyle: { color: theme.colors.text.primary } as any,
      }}
    >
      <Stack.Screen 
        name="UserProfile" 
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="PostDetails" 
        component={PostDetailsScreen}
        options={{ title: 'Post Details', headerBackTitle: 'Profile' }}
      />
      <Stack.Screen 
        name="RunStats" 
        component={RunStatsScreen}
        options={{ title: 'Run Statistics', headerBackTitle: 'Profile' }}
      />
      <Stack.Screen 
        name="EventDetails" 
        component={EventDetailsScreen}
        options={{ title: 'Event Details', headerBackTitle: 'Profile' }}
      />
      <Stack.Screen 
        name="EditEvent" 
        component={EditEventScreen}
        options={{ title: 'Edit Event', headerBackTitle: 'Profile' }}
      />
      <Stack.Screen 
        name="BusinessProfile" 
        component={BusinessProfileScreen}
        options={{ title: 'Organization', headerBackTitle: 'Profile' }}
      />
      <Stack.Screen 
        name="RunnerProfile" 
        component={RunnerProfileScreen}
        options={{ title: 'Runner', headerBackTitle: 'Profile' }}
      />
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ title: 'Settings', headerBackTitle: 'Profile' }}
      />
    </Stack.Navigator>
  );
}

function NotificationsStack() {
  const theme = useTokensTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.bg },
        headerTintColor: theme.colors.text.primary,
        headerTitleStyle: { color: theme.colors.text.primary } as any,
      }}
    >
      <Stack.Screen 
        name="NotificationsHome" 
        component={NotificationsScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

function SearchStack() {
  const theme = useTokensTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.bg },
        headerTintColor: theme.colors.text.primary,
        headerTitleStyle: { color: theme.colors.text.primary } as any,
      }}
    >
      <Stack.Screen 
        name="UserSearch" 
        component={UserSearchScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="RunnerProfile" 
        component={RunnerProfileScreen}
        options={{ title: 'Runner', headerBackTitle: 'Search' }}
      />
    </Stack.Navigator>
  );
}

function AuthStack() {
  const theme = useTokensTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.bg },
        headerTintColor: theme.colors.text.primary,
        headerTitleStyle: { color: theme.colors.text.primary } as any,
      }}
    >
      <Stack.Screen 
        name="SignIn" 
        component={SignInScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="SignUp" 
        component={SignUpScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

function AppContainer() {
  const legacyTheme = useLegacyDesignTheme();
  const theme = useTokensTheme();
  const themeName = theme.mode;
  const setThemeMode = legacyTheme.setMode;
  const isAuthenticated = useStore(state => state.isAuthenticated);
  const initializeAuth = useStore(state => state.initializeAuth);
  const hydratePreferences = useStore(state => state.hydratePreferences);
  const reloadInitialData = useStore(state => state._loadInitialData);
  const themePreference = useStore(state => state.themePreference);
  const hasHydratedTheme = useStore(state => state.hasHydratedTheme);
  const [showSurvey, setShowSurvey] = useState(false);
  const [hasCheckedSurvey, setHasCheckedSurvey] = useState(false);

  useEffect(() => {
    hydratePreferences();
    initializeAuth();
    (async () => {
      try {
        const prompted = await AsyncStorage.getItem(LOCATION_PROMPT_KEY);
        if (!prompted) {
          const { status } = await Location.getForegroundPermissionsAsync();
          if (status !== 'granted') {
            await Location.requestForegroundPermissionsAsync();
          }
          await AsyncStorage.setItem(LOCATION_PROMPT_KEY, '1');
        }
        // Try to get location and update event distances in DB
        try {
          const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced } as any);
          const { latitude, longitude } = pos.coords;
          await supabase.rpc('update_event_distances_km', { lat: latitude, lon: longitude });
          // Refresh data if signed in (will no-op if not)
          await reloadInitialData();
        } catch {}
      } catch {
        // ignore permission errors during bootstrap
      }
    })();
  }, []);

  useEffect(() => {
    if (!hasHydratedTheme) {
      return;
    }
    if (themePreference && themePreference !== themeName) {
      void setThemeMode(themePreference);
    }
  }, [hasHydratedTheme, themePreference, themeName, setThemeMode]);

  useEffect(() => {
    if (hasCheckedSurvey) return;
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(SURVEY_STORAGE_KEY);
        if (!stored) {
          setShowSurvey(true);
        }
      } finally {
        setHasCheckedSurvey(true);
      }
    })();
  }, [hasCheckedSurvey]);

  const handleSurveySubmit = async (answers: Record<string, string>) => {
    await AsyncStorage.setItem(SURVEY_STORAGE_KEY, JSON.stringify({ answers, completedAt: new Date().toISOString() }));
    setShowSurvey(false);
  };

  const handleSurveySkip = async () => {
    await AsyncStorage.setItem(SURVEY_STORAGE_KEY, JSON.stringify({ skipped: true, completedAt: new Date().toISOString() }));
    setShowSurvey(false);
  };

  const navigationTheme = useMemo(() => getTokensNavigationTheme(theme.mode), [theme.mode]);

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={navigationTheme}>
        {isAuthenticated ? (
          <Tab.Navigator
            initialRouteName="Run"
            screenOptions={({ route }) => ({
              tabBarIcon: ({ focused, color, size }) => {
                let iconName: keyof typeof Ionicons.glyphMap;

                if (route.name === 'Events') {
                  iconName = focused ? 'calendar' : 'calendar-outline';
                } else if (route.name === 'Timeline') {
                  iconName = focused ? 'home' : 'home-outline';
                } else if (route.name === 'Run') {
                  iconName = focused ? 'flash' : 'flash-outline';
                } else if (route.name === 'Notifications') {
                  iconName = focused ? 'notifications' : 'notifications-outline';
                } else if (route.name === 'Search') {
                  iconName = focused ? 'search' : 'search-outline';
                } else if (route.name === 'Profile') {
                  iconName = focused ? 'person' : 'person-outline';
                } else {
                  iconName = 'help-outline';
                }

                return <Ionicons name={iconName} size={size} color={color} />;
              },
              tabBarActiveTintColor: theme.colors.primary,
              tabBarInactiveTintColor: theme.colors.text.muted,
              tabBarStyle: {
                backgroundColor: theme.colors.surface,
                borderTopWidth: 0,
                elevation: 0,
                shadowOpacity: 0,
              },
              tabBarLabelStyle: { fontWeight: '600' },
              headerShown: false,
            })}
            tabBar={(props) => <CustomTabBar {...props} />}
          >
            <Tab.Screen name="Timeline" component={TimelineStack} />
            <Tab.Screen name="Events" component={EventsStack} />
            <Tab.Screen name="Search" component={SearchStack} />
            <Tab.Screen name="Run" component={RunStack} options={{ tabBarLabel: 'STRD' }} />
            <Tab.Screen name="Notifications" component={NotificationsStack} />
            {/* Hidden Profile route for avatar navigation across the app */}
            <Tab.Screen
              name="Profile"
              component={ProfileStack}
              options={{ tabBarButton: () => null, headerShown: false }}
            />
          </Tab.Navigator>
        ) : (
          <AuthStack />
        )}
      </NavigationContainer>
      <StatusBar style={theme.mode === 'light' ? 'dark' : 'light'} />
      <OnboardingSurveyModal
        visible={showSurvey}
        onSubmit={handleSurveySubmit}
        onSkip={handleSurveySkip}
      />
    </SafeAreaProvider>
  );
}

function TokensBridge({ children }: { children: React.ReactNode }) {
  const legacy = useLegacyDesignTheme();
  const mode = legacy.name as 'light' | 'dark';
  return <TokensThemeProvider mode={mode}>{children}</TokensThemeProvider>;
}

export default function App() {
  useEffect(() => {
    const dsn = (Constants.expoConfig?.extra as any)?.SENTRY_DSN as string | undefined;
    if (dsn) {
      try {
        // Lazy-load Sentry to avoid hard dependency during dev
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const Sentry = require('@sentry/react-native');
        Sentry.init({ dsn, tracesSampleRate: 0.2 });
      } catch {}
    }
  }, []);
  return (
    <LegacyThemeProvider>
      <TokensBridge>
        <AppContainer />
      </TokensBridge>
    </LegacyThemeProvider>
  );
}
