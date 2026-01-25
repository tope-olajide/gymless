import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { BorderRadius, FontSizes, FontWeights, Spacing } from '@/constants/theme';

interface DurationPickerProps {
  value: 5 | 10 | 15 | 20;
  onChange: (duration: 5 | 10 | 15 | 20) => void;
  disabled?: boolean;
}

const durations: (5 | 10 | 15 | 20)[] = [5, 10, 15, 20];

export const DurationPicker: React.FC<DurationPickerProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {durations.map(duration => {
        const isSelected = value === duration;
        return (
          <TouchableOpacity
            key={duration}
            onPress={() => !disabled && onChange(duration)}
            disabled={disabled}
            style={[
              styles.option,
              {
                backgroundColor: isSelected ? colors.primary : colors.surfaceSecondary,
                opacity: disabled ? 0.5 : 1,
              },
            ]}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.duration,
                { color: isSelected ? '#FFFFFF' : colors.text },
              ]}
            >
              {duration}
            </Text>
            <Text
              style={[
                styles.unit,
                { color: isSelected ? 'rgba(255,255,255,0.8)' : colors.textSecondary },
              ]}
            >
              min
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
    gap: Spacing.sm,
  },
  option: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  duration: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
  },
  unit: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.medium,
    marginTop: 2,
  },
});
