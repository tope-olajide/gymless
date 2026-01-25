import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Play, RefreshCw, Clock, Dumbbell } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { DurationPicker } from '@/components/ui/DurationPicker';
import { DifficultyToggle } from '@/components/ui/DifficultyToggle';
import { ExerciseCard } from '@/components/ui/ExerciseCard';
import { BorderRadius, FontSizes, FontWeights, Spacing } from '@/constants/theme';
import { getMuscleGroupById } from '@/data/bodyParts';
import { getExerciseById } from '@/data/exercises';
import { generateWorkout } from '@/utils/workoutGenerator';
import { Difficulty, GeneratedWorkout } from '@/types/exercise';

export default function ConfigureWorkoutScreen() {
  const params = useLocalSearchParams<{ muscleGroups?: string; duration?: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const { preferences } = useApp();

  const initialMuscleGroups = params.muscleGroups?.split(',') || [];
  const initialDuration = params.duration
    ? (parseInt(params.duration) as 5 | 10 | 15 | 20)
    : preferences.preferredDuration;

  const [duration, setDuration] = useState<5 | 10 | 15 | 20>(initialDuration);
  const [difficulty, setDifficulty] = useState<Difficulty>(preferences.difficulty);
  const [workout, setWorkout] = useState<GeneratedWorkout | null>(null);
  const [regenerateKey, setRegenerateKey] = useState(0);

  const muscleGroupNames = useMemo(() => {
    return initialMuscleGroups
      .map(id => getMuscleGroupById(id)?.name)
      .filter(Boolean)
      .join(' & ');
  }, [initialMuscleGroups]);

  useMemo(() => {
    if (initialMuscleGroups.length > 0) {
      const generated = generateWorkout({
        muscleGroupIds: initialMuscleGroups,
        duration,
        difficulty,
      });
      setWorkout(generated);
    }
  }, [duration, difficulty, regenerateKey]);

  const handleRegenerate = () => {
    setRegenerateKey(prev => prev + 1);
  };

  const handleStartWorkout = () => {
    if (!workout) return;

    router.push({
      pathname: '/workout/session',
      params: { workoutId: workout.id, workoutData: JSON.stringify(workout) },
    });
  };

  if (!workout) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>
          Unable to generate workout
        </Text>
      </SafeAreaView>
    );
  }

  const exercises = workout.exercises
    .map(we => ({
      ...we,
      exercise: getExerciseById(we.exerciseId),
    }))
    .filter(we => we.exercise);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: colors.surface }]}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Workout Setup
        </Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleSection}>
          <Text style={[styles.title, { color: colors.text }]}>
            {muscleGroupNames || 'Full Body'} Workout
          </Text>
        </View>

        <View style={styles.configSection}>
          <Text style={[styles.configLabel, { color: colors.textSecondary }]}>
            Duration
          </Text>
          <DurationPicker value={duration} onChange={setDuration} />
        </View>

        <View style={styles.configSection}>
          <Text style={[styles.configLabel, { color: colors.textSecondary }]}>
            Difficulty
          </Text>
          <DifficultyToggle value={difficulty} onChange={setDifficulty} />
        </View>

        <Card style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Clock size={20} color={colors.primary} />
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {workout.totalDuration} min
              </Text>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                Duration
              </Text>
            </View>
            <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
            <View style={styles.summaryItem}>
              <Dumbbell size={20} color={colors.secondary} />
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {workout.exercises.length}
              </Text>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                Exercises
              </Text>
            </View>
          </View>
          {workout.warmupIncluded && workout.cooldownIncluded && (
            <Text style={[styles.summaryNote, { color: colors.textTertiary }]}>
              Includes warm-up and cool-down
            </Text>
          )}
        </Card>

        <View style={styles.exercisesSection}>
          <View style={styles.exercisesHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Exercises
            </Text>
            <TouchableOpacity
              onPress={handleRegenerate}
              style={[styles.regenerateButton, { backgroundColor: colors.surfaceSecondary }]}
            >
              <RefreshCw size={16} color={colors.primary} />
              <Text style={[styles.regenerateText, { color: colors.primary }]}>
                Regenerate
              </Text>
            </TouchableOpacity>
          </View>

          {exercises.map((we, index) => (
            <ExerciseCard
              key={`${we.exerciseId}-${index}`}
              exercise={we.exercise!}
              duration={we.duration}
              reps={we.reps}
              showSafetyWarning
            />
          ))}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.background }]}>
        <Button
          title="Start Workout"
          onPress={handleStartWorkout}
          size="large"
          icon={<Play size={18} color="#FFFFFF" fill="#FFFFFF" />}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
  },
  headerPlaceholder: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 120,
  },
  titleSection: {
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
  },
  configSection: {
    marginBottom: Spacing.lg,
  },
  configLabel: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
    marginBottom: Spacing.sm,
  },
  summaryCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    height: 40,
  },
  summaryValue: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    marginTop: Spacing.xs,
  },
  summaryLabel: {
    fontSize: FontSizes.sm,
    marginTop: 2,
  },
  summaryNote: {
    fontSize: FontSizes.xs,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
  exercisesSection: {
    marginTop: Spacing.sm,
  },
  exercisesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
  },
  regenerateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  regenerateText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
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
