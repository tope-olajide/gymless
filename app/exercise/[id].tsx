import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Clock,
  Repeat,
  AlertTriangle,
  CheckCircle,
  Sparkles,
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Card } from '@/components/ui/Card';
import { BorderRadius, FontSizes, FontWeights, Spacing } from '@/constants/theme';
import { getExerciseById } from '@/data/exercises';

export default function ExerciseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();

  const exercise = getExerciseById(id);

  if (!exercise) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>
          Exercise not found
        </Text>
      </SafeAreaView>
    );
  }

  const hasWarnings =
    exercise.safetyFlags.requiresSpace ||
    exercise.safetyFlags.highImpact ||
    exercise.safetyFlags.isExplosive;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: colors.surface }]}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.heroSection,
            { backgroundColor: colors.primaryLight },
          ]}
        >
          <Text style={styles.heroEmoji}>
            {exercise.targetMuscles.includes('legs') ||
            exercise.targetMuscles.includes('quadriceps')
              ? '🦵'
              : exercise.targetMuscles.includes('chest')
              ? '💪'
              : exercise.targetMuscles.includes('abs') ||
                exercise.targetMuscles.includes('core')
              ? '🎯'
              : exercise.targetMuscles.includes('shoulders')
              ? '🏋️'
              : '✨'}
          </Text>
        </View>

        <View style={styles.content}>
          <View style={styles.titleSection}>
            <Text style={[styles.title, { color: colors.text }]}>
              {exercise.name}
            </Text>
            <View style={styles.badges}>
              <View
                style={[
                  styles.difficultyBadge,
                  {
                    backgroundColor:
                      exercise.difficulty === 'beginner'
                        ? colors.primaryLight
                        : colors.secondaryLight,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.difficultyText,
                    {
                      color:
                        exercise.difficulty === 'beginner'
                          ? colors.primary
                          : colors.secondary,
                    },
                  ]}
                >
                  {exercise.difficulty === 'beginner' ? 'Beginner' : 'Intermediate'}
                </Text>
              </View>
              {exercise.poseDetection.supported && (
                <View style={[styles.poseBadge, { backgroundColor: colors.accentLight }]}>
                  <Sparkles size={12} color={colors.accent} />
                  <Text style={[styles.poseText, { color: colors.accent }]}>
                    Pose detection ready
                  </Text>
                </View>
              )}
            </View>
          </View>

          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {exercise.description}
          </Text>

          <View style={styles.statsRow}>
            {exercise.isTimeBased ? (
              <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
                <Clock size={20} color={colors.primary} />
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {exercise.defaultDuration}s
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Duration
                </Text>
              </View>
            ) : (
              <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
                <Repeat size={20} color={colors.primary} />
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {exercise.defaultReps}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Reps
                </Text>
              </View>
            )}
          </View>

          {hasWarnings && (
            <Card style={[styles.warningCard, { backgroundColor: colors.secondaryLight }]}>
              <View style={styles.warningHeader}>
                <AlertTriangle size={18} color={colors.secondary} />
                <Text style={[styles.warningTitle, { color: colors.secondary }]}>
                  Safety Notes
                </Text>
              </View>
              <View style={styles.warningList}>
                {exercise.safetyFlags.requiresSpace && (
                  <Text style={[styles.warningItem, { color: colors.secondary }]}>
                    Clear space around you before starting
                  </Text>
                )}
                {exercise.safetyFlags.highImpact && (
                  <Text style={[styles.warningItem, { color: colors.secondary }]}>
                    High impact - modify if you have joint issues
                  </Text>
                )}
                {exercise.safetyFlags.isExplosive && (
                  <Text style={[styles.warningItem, { color: colors.secondary }]}>
                    Explosive movement - warm up first
                  </Text>
                )}
              </View>
            </Card>
          )}

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Instructions
            </Text>
            <Card>
              {exercise.instructions.map((instruction, index) => (
                <View
                  key={index}
                  style={[
                    styles.instructionRow,
                    index < exercise.instructions.length - 1 && {
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.instructionNumber,
                      { backgroundColor: colors.primaryLight },
                    ]}
                  >
                    <Text style={[styles.instructionNumberText, { color: colors.primary }]}>
                      {index + 1}
                    </Text>
                  </View>
                  <Text style={[styles.instructionText, { color: colors.text }]}>
                    {instruction}
                  </Text>
                </View>
              ))}
            </Card>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              What it improves
            </Text>
            <View style={styles.benefitsGrid}>
              {exercise.benefits.map((benefit, index) => (
                <View
                  key={index}
                  style={[styles.benefitChip, { backgroundColor: colors.surface }]}
                >
                  <CheckCircle size={14} color={colors.primary} />
                  <Text style={[styles.benefitText, { color: colors.text }]}>
                    {benefit}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Target Muscles
            </Text>
            <View style={styles.musclesGrid}>
              {exercise.targetMuscles.map((muscle, index) => (
                <View
                  key={index}
                  style={[styles.muscleChip, { backgroundColor: colors.surfaceSecondary }]}
                >
                  <Text style={[styles.muscleText, { color: colors.textSecondary }]}>
                    {muscle}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: Spacing.lg,
    paddingTop: 60,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {},
  heroSection: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroEmoji: {
    fontSize: 72,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  titleSection: {
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    marginBottom: Spacing.sm,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  difficultyBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  difficultyText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
  },
  poseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  poseText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
  },
  description: {
    fontSize: FontSizes.md,
    lineHeight: 24,
    marginBottom: Spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    marginTop: Spacing.xs,
  },
  statLabel: {
    fontSize: FontSizes.sm,
    marginTop: 2,
  },
  warningCard: {
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  warningTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
  },
  warningList: {
    gap: 4,
  },
  warningItem: {
    fontSize: FontSizes.sm,
    lineHeight: 20,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    marginBottom: Spacing.sm,
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.md,
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  instructionNumberText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
  },
  instructionText: {
    flex: 1,
    fontSize: FontSizes.md,
    lineHeight: 22,
  },
  benefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  benefitChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  benefitText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
  },
  musclesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  muscleChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  muscleText: {
    fontSize: FontSizes.sm,
    textTransform: 'capitalize',
  },
  errorText: {
    fontSize: FontSizes.lg,
    textAlign: 'center',
    marginTop: 100,
  },
  bottomPadding: {
    height: Spacing.xxl,
  },
});
