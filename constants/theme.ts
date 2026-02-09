/**
 * Gymless 2.0 Theme System
 * 
 * Premium glassmorphism design tokens with dark mode first approach.
 * Theme-aware structure for future light mode support.
 */

import { Platform } from 'react-native';

// ============================================================
// LEGACY EXPORTS (backward compatibility)
// ============================================================

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#F0F4F8',  // Arctic blue
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#0B0E14',  // Deep obsidian
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: { sans: 'system-ui', serif: 'ui-serif', rounded: 'ui-rounded', mono: 'ui-monospace' },
  default: { sans: 'normal', serif: 'serif', rounded: 'normal', mono: 'monospace' },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
});

// ============================================================
// GLASSMORPHISM COLOR PALETTE
// ============================================================

export const colors = {
  // Primary backgrounds (Dark Mode - Obsidian/Deep Space)
  background: {
    primary: '#0B0E14',
    secondary: '#0F1318',
    tertiary: '#151A22',
    elevated: '#1A1F2A',
  },

  // Glass effects
  glass: {
    light: 'rgba(255, 255, 255, 0.05)',
    medium: 'rgba(255, 255, 255, 0.08)',
    strong: 'rgba(255, 255, 255, 0.12)',
    border: 'rgba(255, 255, 255, 0.10)',
    borderActive: 'rgba(255, 255, 255, 0.20)',
  },

  // Neon accents
  neon: {
    cyan: '#00FFCC',
    green: '#22FF22',
    orange: '#FB923C',
    red: '#FF6B6B',
    purple: '#A855F7',
    blue: '#00AAFF',
    yellow: '#FFB800',
  },

  // Text hierarchy
  text: {
    primary: '#FFFFFF',
    secondary: 'rgba(255, 255, 255, 0.7)',
    tertiary: 'rgba(255, 255, 255, 0.5)',
    muted: 'rgba(255, 255, 255, 0.3)',
  },
};

// ============================================================
// SPACING & TYPOGRAPHY
// ============================================================

export const spacing = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, '2xl': 24, '3xl': 32,
  safeTop: 60, safeBottom: 20, screenPadding: 20,
};

export const borderRadius = {
  sm: 8, md: 12, lg: 16, xl: 20, '2xl': 24, '3xl': 32, full: 9999,
};

// ============================================================
// GLASS STYLES
// ============================================================

export const glassStyles = {
  card: {
    backgroundColor: colors.glass.medium,
    borderWidth: 1,
    borderColor: colors.glass.border,
    borderRadius: borderRadius.xl,
  },
  hero: {
    backgroundColor: colors.glass.strong,
    borderWidth: 1.5,
    borderColor: colors.glass.borderActive,
    borderRadius: borderRadius['2xl'],
  },
};

// ============================================================
// 30-DAY CHALLENGE CONFIG
// ============================================================

export interface DailyFocus {
  day: number;
  theme: string;
  icon: string;
  bodyParts: string[];
  milestone?: boolean;
}

export interface MilestoneReward {
  title: string;
  description: string;
  reward: 'badge' | 'exercises' | 'feature' | 'blueprint';
  badge?: string;
  unlocks?: string[];
  feature?: string;
  unlockMessage: string;
}

export const challengeConfig = {
  dailyFocus: [
    { day: 1, theme: 'Full Body Activation', icon: '💪', bodyParts: ['chest', 'legs', 'core'] },
    { day: 2, theme: 'Lower Body Power', icon: '🦵', bodyParts: ['legs', 'glutes'] },
    { day: 3, theme: 'Core & Stability', icon: '🎯', bodyParts: ['abs', 'core'] },
    { day: 4, theme: 'Upper Body Strength', icon: '💪', bodyParts: ['chest', 'shoulders'] },
    { day: 5, theme: 'Active Recovery', icon: '🧘', bodyParts: ['stretching'] },
    { day: 6, theme: 'Glute Focus', icon: '🍑', bodyParts: ['glutes', 'hips'] },
    { day: 7, theme: 'Milestone: Form Check', icon: '🏆', bodyParts: ['full-body'], milestone: true },
    { day: 8, theme: 'Push Day', icon: '🔥', bodyParts: ['chest', 'shoulders'] },
    { day: 9, theme: 'Pull & Back', icon: '🦴', bodyParts: ['back', 'biceps'] },
    { day: 10, theme: 'Leg Day Intensity', icon: '🦵', bodyParts: ['legs', 'glutes'] },
    { day: 11, theme: 'Core Burn', icon: '🔥', bodyParts: ['abs', 'obliques'] },
    { day: 12, theme: 'Full Body Circuit', icon: '⚡', bodyParts: ['full-body'] },
    { day: 13, theme: 'Active Recovery', icon: '🧘', bodyParts: ['stretching'] },
    { day: 14, theme: 'Milestone: Level Up', icon: '🚀', bodyParts: ['full-body'], milestone: true },
    { day: 15, theme: 'Advanced Push', icon: '💪', bodyParts: ['chest', 'shoulders'] },
    { day: 16, theme: 'Advanced Pull', icon: '🦴', bodyParts: ['back', 'biceps'] },
    { day: 17, theme: 'Explosive Legs', icon: '⚡', bodyParts: ['legs', 'glutes'] },
    { day: 18, theme: 'Core Endurance', icon: '🎯', bodyParts: ['abs', 'core'] },
    { day: 19, theme: 'Upper Body Sculpt', icon: '💪', bodyParts: ['arms', 'shoulders'] },
    { day: 20, theme: 'Active Recovery', icon: '🧘', bodyParts: ['stretching'] },
    { day: 21, theme: 'Milestone: Pro Mode', icon: '🤖', bodyParts: ['full-body'], milestone: true },
    { day: 22, theme: 'Pro Push Challenge', icon: '🔥', bodyParts: ['chest', 'shoulders'] },
    { day: 23, theme: 'Pro Pull Challenge', icon: '🔥', bodyParts: ['back', 'biceps'] },
    { day: 24, theme: 'Pro Leg Challenge', icon: '🔥', bodyParts: ['legs', 'glutes'] },
    { day: 25, theme: 'Core Mastery', icon: '🎯', bodyParts: ['abs', 'core'] },
    { day: 26, theme: 'Full Body Burn', icon: '⚡', bodyParts: ['full-body'] },
    { day: 27, theme: 'Active Recovery', icon: '🧘', bodyParts: ['stretching'] },
    { day: 28, theme: 'Final Push', icon: '🏋️', bodyParts: ['chest', 'shoulders'] },
    { day: 29, theme: 'Final Pull & Core', icon: '🎯', bodyParts: ['back', 'core'] },
    { day: 30, theme: 'Milestone: Champion', icon: '🏆', bodyParts: ['full-body'], milestone: true },
  ] as DailyFocus[],

  milestones: {
    7: {
      title: 'Form Master',
      description: 'One week of consistent training!',
      reward: 'badge' as const,
      badge: 'form-master',
      unlockMessage: 'You\'ve earned the Form Master badge! 🏆',
    },
    14: {
      title: 'Level Up',
      description: 'Two weeks strong! Advanced exercises unlocked.',
      reward: 'exercises' as const,
      unlocks: ['sumo-squats', 'diamond-pushups', 'burpees', 'pike-pushups'],
      unlockMessage: 'Advanced exercises unlocked! 🚀',
    },
    21: {
      title: 'Pro Coaching',
      description: 'Three weeks! Gemini Pro analysis activated.',
      reward: 'feature' as const,
      feature: 'pro-coaching',
      unlockMessage: 'Gemini Pro Coaching Mode activated! 🤖',
    },
    30: {
      title: 'Champion',
      description: 'You completed the 30-day challenge!',
      reward: 'blueprint' as const,
      unlockMessage: 'Your personalized 90-day AI Blueprint is ready! 🎉',
    },
  } as Record<number, MilestoneReward>,
};

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

export function getDailyFocus(day: number): DailyFocus {
  return challengeConfig.dailyFocus[(day - 1) % 30];
}

export function getMilestone(day: number): MilestoneReward | null {
  return challengeConfig.milestones[day] || null;
}

export function hexToRgba(hex: string, alpha: number = 1): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return `rgba(255, 255, 255, ${alpha})`;
  return `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${alpha})`;
}

export default { colors, spacing, borderRadius, glassStyles, challengeConfig };
