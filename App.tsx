import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';



import { colors, getNavigationTheme } from './theme';
import { EventsScreen } from './screens/EventsScreen';
import { EventDetailsScreen } from './screens/EventDetailsScreen';
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
import { HapticTab } from './components/HapticTab';
import { SignInScreen } from './screens/SignInScreen';
import { SignUpScreen } from './screens/SignUpScreen';
import { useStore } from './state/store';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function EventsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        headerTitleStyle: { color: colors.text },
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
    </Stack.Navigator>
  );
}

function TimelineStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        headerTitleStyle: { color: colors.text },
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
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        headerTitleStyle: { color: colors.text },
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
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        headerTitleStyle: { color: colors.text },
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
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        headerTitleStyle: { color: colors.text },
      }}
    >
      <Stack.Screen 
        name="NotificationsHome" 
        component={NotificationsScreen}
        options={{ title: 'Notifications' }}
      />
    </Stack.Navigator>
  );
}

function SearchStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        headerTitleStyle: { color: colors.text },
      }}
    >
      <Stack.Screen 
        name="UserSearch" 
        component={UserSearchScreen}
        options={{ title: 'Search' }}
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
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        headerTitleStyle: { color: colors.text },
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

export default function App() {
  const isAuthenticated = useStore(state => state.isAuthenticated);
  const initializeAuth = useStore(state => state.initializeAuth);
  const themePreference = 'dark';
  useEffect(() => {
    initializeAuth();
  }, []);
  return (
    <SafeAreaProvider>
      <NavigationContainer theme={getNavigationTheme()}>
        {isAuthenticated ? (
          <Tab.Navigator
            initialRouteName="Events"
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
              tabBarActiveTintColor: colors.primary,
              tabBarInactiveTintColor: colors.muted,
              tabBarStyle: {
                backgroundColor: colors.card,
                borderTopWidth: 0,
                elevation: 0,
                shadowOpacity: 0,
              },
              tabBarBackground: () => <BlurTabBarBackground />,
              tabBarButton: (props) => <HapticTab {...props} />,
              tabBarLabelStyle: { fontWeight: '600' },
              headerShown: false,
            })}
          >
            <Tab.Screen name="Events" component={EventsStack} />
            <Tab.Screen name="Timeline" component={TimelineStack} />
            <Tab.Screen name="Search" component={SearchStack} />
            <Tab.Screen name="Run" component={RunStack} options={{ tabBarLabel: 'STRD' }} />
            <Tab.Screen name="Notifications" component={NotificationsStack} />
            <Tab.Screen name="Profile" component={ProfileStack} />
          </Tab.Navigator>
        ) : (
          <AuthStack />
        )}
      </NavigationContainer>
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}
