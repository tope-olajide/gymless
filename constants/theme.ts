export const Colors = {
  light: {
    background: '#FAFAFA',
    surface: '#FFFFFF',
    surfaceSecondary: '#F5F5F5',
    text: '#1A1A1A',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',
    primary: '#10B981',
    primaryDark: '#059669',
    primaryLight: '#D1FAE5',
    secondary: '#F59E0B',
    secondaryLight: '#FEF3C7',
    accent: '#3B82F6',
    accentLight: '#DBEAFE',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    border: '#E5E7EB',
    borderLight: '#F3F4F6',
    cardShadow: 'rgba(0, 0, 0, 0.05)',
    streak: '#FF6B35',
    streakLight: '#FFF0EB',
  },
  dark: {
    background: '#0F0F0F',
    surface: '#1A1A1A',
    surfaceSecondary: '#262626',
    text: '#FFFFFF',
    textSecondary: '#A1A1AA',
    textTertiary: '#71717A',
    primary: '#34D399',
    primaryDark: '#10B981',
    primaryLight: '#064E3B',
    secondary: '#FBBF24',
    secondaryLight: '#78350F',
    accent: '#60A5FA',
    accentLight: '#1E3A5F',
    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
    border: '#3F3F46',
    borderLight: '#27272A',
    cardShadow: 'rgba(0, 0, 0, 0.3)',
    streak: '#FF8C5A',
    streakLight: '#3D2A22',
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const FontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  display: 40,
};

export const FontWeights = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export type ThemeMode = 'light' | 'dark';
