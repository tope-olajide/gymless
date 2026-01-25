import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Clock, Repeat, AlertTriangle, Sparkles } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { BorderRadius, FontSizes, FontWeights, Spacing } from '@/constants/theme';
import { Exercise } from '@/types/exercise';

interface ExerciseCardProps {
  exercise: Exercise;
  onPress?: () => void;
  duration?: number;
  reps?: number | null;
  showSafetyWarning?: boolean;
  isActive?: boolean;
  showPoseIndicator?: boolean;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  onPress,
  duration,
  reps,
  showSafetyWarning = false,
  isActive = false,
  showPoseIndicator = false,
}) => {
  const { colors } = useTheme();

  const needsSpaceWarning =
    showSafetyWarning && (exercise.safetyFlags.requiresSpace || exercise.safetyFlags.highImpact);

  const displayDuration = duration || exercise.defaultDuration;
  const displayReps = reps !== undefined ? reps : exercise.defaultReps;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.9}
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: isActive ? colors.primary : colors.border,
          borderWidth: isActive ? 2 : 1,
        },
      ]}
    >
      <View
        style={[
          styles.imagePlaceholder,
          {
            backgroundColor: colors.primaryLight,
          },
        ]}
      >
        <Text style={[styles.emoji, { color: colors.primary }]}>
          {exercise.targetMuscles.includes('legs') ||
          exercise.targetMuscles.includes('quadriceps')
            ? '🦵'
            : exercise.targetMuscles.includes('chest')
            ? '💪'
            : exercise.targetMuscles.includes('abs') || exercise.targetMuscles.includes('core')
            ? '🎯'
            : exercise.targetMuscles.includes('shoulders')
            ? '🏋️'
            : '✨'}
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
            {exercise.name}
          </Text>
          <View style={styles.badges}>
            {exercise.difficulty === 'beginner' && (
              <View style={[styles.difficultyBadge, { backgroundColor: colors.primaryLight }]}>
                <Text style={[styles.difficultyText, { color: colors.primary }]}>Beginner</Text>
              </View>
            )}
            {showPoseIndicator && exercise.poseDetection.supported && (
              <View style={[styles.poseBadge, { backgroundColor: colors.accentLight }]}>
                <Sparkles size={10} color={colors.accent} />
              </View>
            )}
          </View>
        </View>

        <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
          {exercise.description}
        </Text>

        <View style={styles.footer}>
          <View style={styles.stats}>
            {exercise.isTimeBased ? (
              <View style={styles.stat}>
                <Clock size={14} color={colors.textTertiary} />
                <Text style={[styles.statText, { color: colors.textSecondary }]}>
                  {displayDuration}s
                </Text>
              </View>
            ) : (
              <View style={styles.stat}>
                <Repeat size={14} color={colors.textTertiary} />
                <Text style={[styles.statText, { color: colors.textSecondary }]}>
                  {displayReps} reps
                </Text>
              </View>
            )}
          </View>

          {needsSpaceWarning && (
            <View style={styles.warningContainer}>
              <AlertTriangle size={12} color={colors.warning} />
              <Text style={[styles.warningText, { color: colors.warning }]}>
                Clear space
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  imagePlaceholder: {
    width: 80,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 32,
  },
  content: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  name: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    flex: 1,
  },
  badges: {
    flexDirection: 'row',
    gap: 4,
  },
  difficultyBadge: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  difficultyText: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.medium,
  },
  poseBadge: {
    width: 18,
    height: 18,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  description: {
    fontSize: FontSizes.sm,
    lineHeight: 18,
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  stats: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: FontSizes.sm,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  warningText: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.medium,
  },
});
