import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Footprints,
  Target,
  Dumbbell,
  Activity,
  Zap,
  MoveVertical,
  CircleDot,
  ArrowDown,
  Square,
  GitBranch,
  Shield,
  Heart,
  ChevronsRight,
  ChevronsUp,
  MoveHorizontal,
  AlignCenter,
  Scale,
  Wind,
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { BorderRadius, FontSizes, FontWeights, Spacing } from '@/constants/theme';

const { width } = Dimensions.get('window');
const cardWidth = (width - Spacing.lg * 3) / 2;

interface CategoryCardProps {
  id: string;
  name: string;
  exerciseCount: number;
  gradientColors: [string, string];
  icon: string;
  lastTrained?: string | null;
  onPress: () => void;
  size?: 'small' | 'large';
}

const iconMap: Record<string, React.ComponentType<any>> = {
  footprints: Footprints,
  target: Target,
  dumbbell: Dumbbell,
  activity: Activity,
  zap: Zap,
  'move-vertical': MoveVertical,
  'circle-dot': CircleDot,
  'arrow-down': ArrowDown,
  square: Square,
  'git-branch': GitBranch,
  shield: Shield,
  heart: Heart,
  'chevrons-right': ChevronsRight,
  'chevrons-up': ChevronsUp,
  'move-horizontal': MoveHorizontal,
  'align-center': AlignCenter,
  scale: Scale,
  wind: Wind,
};

export const CategoryCard: React.FC<CategoryCardProps> = ({
  id,
  name,
  exerciseCount,
  gradientColors,
  icon,
  lastTrained,
  onPress,
  size = 'small',
}) => {
  const { colors } = useTheme();
  const IconComponent = iconMap[icon] || Target;

  const getRecoveryStatus = () => {
    if (!lastTrained) return { status: 'ready', label: 'Not trained yet' };

    const daysSince = Math.floor(
      (Date.now() - new Date(lastTrained).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSince === 0) return { status: 'today', label: 'Trained today' };
    if (daysSince === 1) return { status: 'recent', label: 'Yesterday' };
    if (daysSince <= 2) return { status: 'recovering', label: `${daysSince} days ago` };
    return { status: 'ready', label: `${daysSince} days ago` };
  };

  const recovery = getRecoveryStatus();

  const isLarge = size === 'large';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={[
        styles.container,
        isLarge ? styles.largeContainer : { width: cardWidth },
      ]}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradient, isLarge && styles.largeGradient]}
      >
        <View style={styles.iconContainer}>
          <IconComponent size={isLarge ? 32 : 24} color="rgba(255,255,255,0.9)" />
        </View>
        <View style={styles.content}>
          <Text style={[styles.name, isLarge && styles.largeName]}>{name}</Text>
          <Text style={styles.count}>
            {exerciseCount} exercise{exerciseCount !== 1 ? 's' : ''}
          </Text>
        </View>
        {lastTrained !== undefined && (
          <View
            style={[
              styles.recoveryBadge,
              recovery.status === 'today' && styles.recoveryToday,
              recovery.status === 'recent' && styles.recoveryRecent,
              recovery.status === 'recovering' && styles.recoveryRecovering,
            ]}
          >
            <Text style={styles.recoveryText}>{recovery.label}</Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  largeContainer: {
    width: '100%',
  },
  gradient: {
    padding: Spacing.md,
    minHeight: 120,
    justifyContent: 'space-between',
  },
  largeGradient: {
    minHeight: 140,
    padding: Spacing.lg,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    marginTop: Spacing.sm,
  },
  name: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: '#FFFFFF',
  },
  largeName: {
    fontSize: FontSizes.xl,
  },
  count: {
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  recoveryBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  recoveryToday: {
    backgroundColor: 'rgba(59,130,246,0.4)',
  },
  recoveryRecent: {
    backgroundColor: 'rgba(251,191,36,0.4)',
  },
  recoveryRecovering: {
    backgroundColor: 'rgba(251,191,36,0.3)',
  },
  recoveryText: {
    fontSize: FontSizes.xs,
    color: '#FFFFFF',
    fontWeight: FontWeights.medium,
  },
});
