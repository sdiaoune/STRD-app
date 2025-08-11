import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../theme';

interface SegmentedControlProps {
  options: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  style?: any;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({ 
  options, 
  selectedIndex, 
  onSelect, 
  style 
}) => {
  return (
    <View style={[styles.container, style]}>
      {options.map((option, index) => (
        <TouchableOpacity
          key={option}
          style={[
            styles.option,
            selectedIndex === index && styles.selectedOption
          ]}
          onPress={() => onSelect(index)}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.optionText,
            selectedIndex === index && styles.selectedOptionText
          ]}>
            {option}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  option: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
  },
  selectedOption: {
    backgroundColor: colors.primary,
  },
  optionText: {
    ...typography.body,
    color: colors.muted,
    fontWeight: '600',
  },
  selectedOptionText: {
    color: colors.bg,
  },
});
