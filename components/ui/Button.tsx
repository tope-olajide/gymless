import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { BorderRadius, FontSizes, FontWeights, Spacing } from '@/constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
}) => {
  const { colors } = useTheme();

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: BorderRadius.md,
    };

    const sizeStyles: Record<string, ViewStyle> = {
      small: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md },
      medium: { paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg },
      large: { paddingVertical: Spacing.lg, paddingHorizontal: Spacing.xl },
    };

    const variantStyles: Record<string, ViewStyle> = {
      primary: { backgroundColor: colors.primary },
      secondary: { backgroundColor: colors.secondary },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: colors.primary,
      },
      ghost: { backgroundColor: 'transparent' },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      opacity: disabled ? 0.5 : 1,
    };
  };

  const getTextStyle = (): TextStyle => {
    const sizeStyles: Record<string, TextStyle> = {
      small: { fontSize: FontSizes.sm },
      medium: { fontSize: FontSizes.md },
      large: { fontSize: FontSizes.lg },
    };

    const variantStyles: Record<string, TextStyle> = {
      primary: { color: '#FFFFFF' },
      secondary: { color: '#FFFFFF' },
      outline: { color: colors.primary },
      ghost: { color: colors.primary },
    };

    return {
      fontWeight: FontWeights.semibold,
      ...sizeStyles[size],
      ...variantStyles[variant],
    };
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' || variant === 'secondary' ? '#FFFFFF' : colors.primary}
        />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text style={[getTextStyle(), icon ? { marginLeft: Spacing.sm } : {}, textStyle]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};
