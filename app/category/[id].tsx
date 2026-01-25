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
import { ArrowLeft, Play, AlertTriangle } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/Button';
import { ExerciseCard } from '@/components/ui/ExerciseCard';
import { BorderRadius, FontSizes, FontWeights, Spacing } from '@/constants/theme';
import { getMuscleGroupById } from '@/data/bodyParts';
import { getExerciseById } from '@/data/exercises';
import { shouldSuggestRecovery } from '@/utils/workoutGenerator';

export default function CategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const { bodyPartHistory, preferences } = useApp();

  const muscleGroup = getMuscleGroupById(id);

  if (!muscleGroup) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>
          Category not found
        </Text>
      </SafeAreaView>
    );
  }

  const exercises = muscleGroup.exercises
    .map(exerciseId => getExerciseById(exerciseId))
    .filter(Boolean);

  const history = bodyPartHistory[id];
  const recovery = shouldSuggestRecovery(id, history?.lastTrained || null);

  const handleStartWorkout = () => {
    router.push({
      pathname: '/workout/configure',
      params: {
        muscleGroups: id,
        duration: preferences.preferredDuration.toString(),
      },
    });
  };

  const handleExercisePress = (exerciseId: string) => {
    router.push({
      pathname: '/exercise/[id]',
      params: { id: exerciseId },
    });
  };

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
            { backgroundColor: muscleGroup.gradientColors[0] },
          ]}
        >
          <Text style={styles.heroTitle}>{muscleGroup.name}</Text>
          <Text style={styles.heroDescription}>{muscleGroup.description}</Text>
          <View style={styles.heroBenefits}>
            {muscleGroup.benefits.map((benefit, index) => (
              <View key={index} style={styles.benefitBadge}>
                <Text style={styles.benefitText}>{benefit}</Text>
              </View>
            ))}
          </View>
        </View>

        {recovery.suggest && (
          <View
            style={[
              styles.recoveryWarning,
              { backgroundColor: colors.secondaryLight },
            ]}
          >
            <AlertTriangle size={18} color={colors.secondary} />
            <Text style={[styles.recoveryText, { color: colors.secondary }]}>
              {recovery.message}
            </Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Exercises ({exercises.length})
          </Text>

          {exercises.map(exercise => (
            <ExerciseCard
              key={exercise!.id}
              exercise={exercise!}
              onPress={() => handleExercisePress(exercise!.id)}
              showSafetyWarning
              showPoseIndicator
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
  scrollContent: {
    paddingBottom: 100,
  },
  heroSection: {
    paddingTop: 120,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  heroTitle: {
    fontSize: FontSizes.xxxl,
    fontWeight: FontWeights.bold,
    color: '#FFFFFF',
    marginBottom: Spacing.xs,
  },
  heroDescription: {
    fontSize: FontSizes.md,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 22,
  },
  heroBenefits: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: Spacing.md,
  },
  benefitBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  benefitText: {
    fontSize: FontSizes.sm,
    color: '#FFFFFF',
    fontWeight: FontWeights.medium,
  },
  recoveryWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  recoveryText: {
    flex: 1,
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
  },
  section: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    marginBottom: Spacing.md,
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
