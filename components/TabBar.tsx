import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, borderRadius as radii, surfaces, getCurrentThemeName } from '../theme';

type TabItem = {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

interface Props {
  items: TabItem[];
  activeKey: string;
  onPress: (key: string) => void;
}

export const TabBar: React.FC<Props> = ({ items, activeKey, onPress }) => {
  const tint = getCurrentThemeName() === 'dark' ? 'dark' : 'light';
  return (
    <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}>
      <BlurView intensity={80} tint={tint as any} style={{ paddingVertical: spacing[3] }}>
        <View style={{ flexDirection: 'row', paddingHorizontal: spacing[4], gap: spacing[3], alignItems: 'center', minHeight: 56 }}>
          {items.map((item) => {
            const active = item.key === activeKey;
            return (
              <Pressable
                key={item.key}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                onPress={() => onPress(item.key)}
                style={{ flex: 1, alignItems: 'center', paddingVertical: spacing[1] }}
                hitSlop={12}
              >
                <View
                  style={{
                    paddingHorizontal: spacing[3],
                    paddingVertical: spacing[1],
                    backgroundColor: active ? colors.primary : colors.surfaceMuted,
                    borderRadius: radii.lg,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons
                      name={item.icon}
                      size={18}
                      color={active ? colors.onPrimary : colors.text.secondary}
                    />
                    <Text
                      style={{
                        marginLeft: spacing[1],
                        color: active ? colors.onPrimary : colors.text.secondary,
                        fontWeight: '700',
                      }}
                    >
                      {item.label}
                    </Text>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
};
