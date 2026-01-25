import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity, StyleProp } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { BorderRadius, Spacing } from '@/constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  padding?: 'none' | 'small' | 'medium' | 'large';
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  padding = 'medium',
}) => {
  const { colors } = useTheme();

  const paddingStyles: Record<string, ViewStyle> = {
    none: { padding: 0 },
    small: { padding: Spacing.sm },
    medium: { padding: Spacing.md },
    large: { padding: Spacing.lg },
  };

  const cardStyle: ViewStyle = {
    backgroundColor: colors.surface,
    borderRadius: BorderRadius.lg,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
    ...paddingStyles[padding],
  };

  if (onPress) {
    return (
      <TouchableOpacity style={[cardStyle, style]} onPress={onPress} activeOpacity={0.9}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[cardStyle, style]}>{children}</View>;
};
