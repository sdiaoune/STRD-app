import React from 'react';
import { View, Pressable, Text, Platform } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { colors, spacing, borderRadius, typography, getCurrentThemeName } from '../theme';
import { useStore } from '../state/store';

export const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();
  // subscribe to themePreference so the bar re-renders on toggle
  const themeName = useStore(s => s.themePreference) || getCurrentThemeName();
  // Subscribe to accent so active tab color updates instantly
  useStore(s => s.accentPreference);
  const isLight = themeName === 'light';

  return (
    <View
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 0,
        overflow: 'hidden',
        // never block touches to content behind the bar
        pointerEvents: 'box-none',
      }}
    >
      <BlurView tint={isLight ? 'light' : 'dark'} intensity={isLight ? 0 : 80} style={{ paddingTop: spacing.sm, paddingBottom: Math.max(insets.bottom, spacing.sm), backgroundColor: colors.surface }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md }}>
          {state.routes.filter(r => r.name !== 'Profile' && r.name !== 'Search').map((route) => {
            // Find the original index in the unfiltered routes array
            const originalIndex = state.routes.findIndex(r => r.key === route.key);
            const isFocused = state.index === originalIndex;
            const { options } = descriptors[route.key];
            const onPress = () => {
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name as never);
              }
            };
            const onLongPress = () => {
              navigation.emit({ type: 'tabLongPress', target: route.key });
            };

            const color = isFocused ? colors.primary : colors.text.secondary;
            const size = 22;
            const icon = options.tabBarIcon?.({ focused: isFocused, color, size });
            const labelRaw = route.name === 'Run' ? 'STRD' : route.name;

            return (
              <Pressable
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                onPress={onPress}
                onLongPress={onLongPress}
                style={{ flex: 1, alignItems: 'center', paddingVertical: spacing.xs }}
                hitSlop={12}
              >
                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                  {icon}
                  <Text
                    style={{
                      ...(typography.caption as any),
                      marginTop: spacing.xs,
                      color: isFocused ? colors.primary : colors.text.secondary,
                      fontWeight: isFocused ? '700' : '600',
                    }}
                    numberOfLines={1}
                  >
                    {labelRaw}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </BlurView>
      {/* Subtle hairline border to lift from background */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          borderRadius: 0,
          borderTopWidth: Platform.OS === 'ios' ? 0.5 : 1,
          borderTopColor: colors.border,
        }}
      />
    </View>
  );
};

export default CustomTabBar;


