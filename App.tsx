import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';



import { colors } from './theme';
import { EventsScreen } from './screens/EventsScreen';
import { EventDetailsScreen } from './screens/EventDetailsScreen';
import { TimelineScreen } from './screens/TimelineScreen';
import { PostDetailsScreen } from './screens/PostDetailsScreen';
import { RunStatsScreen } from './screens/RunStatsScreen';
import { RunScreen } from './screens/RunScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { BusinessProfileScreen } from './screens/BusinessProfileScreen';
import BlurTabBarBackground, { useBottomTabOverflow } from './components/ui/TabBarBackground.ios';
import { HapticTab } from './components/HapticTab';

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
        options={{ title: 'Event Details' }}
      />
      <Stack.Screen 
        name="BusinessProfile" 
        component={BusinessProfileScreen}
        options={{ title: 'Organization' }}
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
        options={{ title: 'Post Details' }}
      />
      <Stack.Screen 
        name="RunStats" 
        component={RunStatsScreen}
        options={{ title: 'Run Statistics' }}
      />
      <Stack.Screen 
        name="EventDetails" 
        component={EventDetailsScreen}
        options={{ title: 'Event Details' }}
      />
      <Stack.Screen 
        name="BusinessProfile" 
        component={BusinessProfileScreen}
        options={{ title: 'Organization' }}
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
        options={{ title: 'Post Details' }}
      />
      <Stack.Screen 
        name="RunStats" 
        component={RunStatsScreen}
        options={{ title: 'Run Statistics' }}
      />
      <Stack.Screen 
        name="EventDetails" 
        component={EventDetailsScreen}
        options={{ title: 'Event Details' }}
      />
      <Stack.Screen 
        name="BusinessProfile" 
        component={BusinessProfileScreen}
        options={{ title: 'Organization' }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
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
                iconName = focused ? 'play-circle' : 'play-circle-outline';
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
              backgroundColor: colors.bg,
              borderTopColor: colors.border,
              borderTopWidth: 1,
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
          <Tab.Screen name="Run" component={RunStack} />
          <Tab.Screen name="Profile" component={ProfileStack} />
        </Tab.Navigator>
      </NavigationContainer>
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}
