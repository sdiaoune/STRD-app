import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radii } from '../tokens';

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
  return (
    <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}>
      <BlurView intensity={90} style={{ paddingVertical: spacing[2] }}>
        <View style={{ flexDirection: 'row', paddingHorizontal: spacing[4], gap: spacing[3] }}>
          {items.map((item) => {
            const active = item.key === activeKey;
            return (
              <Pressable
                key={item.key}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                onPress={() => onPress(item.key)}
                style={{ flex: 1, alignItems: 'center', paddingVertical: spacing[2] }}
                hitSlop={12}
              >
                <View
                  style={{
                    paddingHorizontal: spacing[3],
                    paddingVertical: spacing[1],
                    backgroundColor: active ? colors.accent : 'transparent',
                    borderRadius: radii.lg,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons
                      name={item.icon}
                      size={18}
                      color={active ? colors.accentOn : colors.text.muted}
                    />
                    <Text
                      style={{
                        marginLeft: spacing[1],
                        color: active ? colors.accentOn : colors.text.secondary,
                        fontWeight: '600',
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







