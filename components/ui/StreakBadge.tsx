import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Flame } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { BorderRadius, FontSizes, FontWeights, Spacing } from '@/constants/theme';

interface StreakBadgeProps {
  streak: number;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

export const StreakBadge: React.FC<StreakBadgeProps> = ({
  streak,
  size = 'medium',
  showLabel = true,
}) => {
  const { colors } = useTheme();

  const sizeConfig = {
    small: { iconSize: 16, fontSize: FontSizes.sm, padding: Spacing.xs },
    medium: { iconSize: 20, fontSize: FontSizes.md, padding: Spacing.sm },
    large: { iconSize: 28, fontSize: FontSizes.xl, padding: Spacing.md },
  };

  const config = sizeConfig[size];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.streakLight,
          paddingVertical: config.padding,
          paddingHorizontal: config.padding * 1.5,
        },
      ]}
    >
      <Flame size={config.iconSize} color={colors.streak} fill={colors.streak} />
      <Text style={[styles.number, { fontSize: config.fontSize, color: colors.streak }]}>
        {streak}
      </Text>
      {showLabel && size !== 'small' && (
        <Text style={[styles.label, { color: colors.streak }]}>
          {streak === 1 ? 'day' : 'days'}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  number: {
    fontWeight: FontWeights.bold,
  },
  label: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
  },
});
