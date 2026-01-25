import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { BorderRadius, FontSizes, FontWeights, Spacing } from '@/constants/theme';
import { Difficulty } from '@/types/exercise';

interface DifficultyToggleProps {
  value: Difficulty;
  onChange: (difficulty: Difficulty) => void;
  disabled?: boolean;
}

export const DifficultyToggle: React.FC<DifficultyToggleProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const { colors } = useTheme();

  const options: { value: Difficulty; label: string }[] = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceSecondary }]}>
      {options.map(option => {
        const isSelected = value === option.value;
        return (
          <TouchableOpacity
            key={option.value}
            onPress={() => !disabled && onChange(option.value)}
            disabled={disabled}
            style={[
              styles.option,
              {
                backgroundColor: isSelected ? colors.primary : 'transparent',
                opacity: disabled ? 0.5 : 1,
              },
            ]}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.label,
                { color: isSelected ? '#FFFFFF' : colors.textSecondary },
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: BorderRadius.md,
    padding: 4,
  },
  option: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
  },
  label: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
  },
});
