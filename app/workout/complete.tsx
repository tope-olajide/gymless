import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Animated,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CheckCircle, Flame, Clock, Dumbbell, Trophy } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { BorderRadius, FontSizes, FontWeights, Spacing } from '@/constants/theme';
import { GeneratedWorkout } from '@/types/exercise';
import { muscleGroups } from '@/data/bodyParts';

export default function WorkoutCompleteScreen() {
  const { workoutData, duration, fromChallenge } = useLocalSearchParams<{
    workoutData: string;
    duration: string;
    fromChallenge?: string;
  }>();
  const router = useRouter();
  const { colors } = useTheme();
  const { recordWorkout, streakData, challengeData, challengeAchievements } = useApp();

  const workout: GeneratedWorkout = JSON.parse(workoutData || '{}');
  const actualDuration = parseInt(duration || '0');

  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const saveWorkout = async () => {
      await recordWorkout({
        date: new Date().toISOString().split('T')[0],
        bodyParts: workout.bodyParts,
        exercises: workout.exercises.map(e => e.exerciseId),
        duration: actualDuration,
      });

      if (fromChallenge === 'true' && challengeData.currentDay >= 30) {
        setTimeout(() => {
          router.replace('/challenge/complete');
        }, 2000);
      }
    };

    saveWorkout();

    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const bodyPartNames = workout.bodyParts
    .map(id => muscleGroups[id]?.name)
    .filter(Boolean)
    .join(' & ');

  const handleDone = () => {
    router.replace('/(tabs)');
  };

  const handleViewProgress = () => {
    router.replace('/(tabs)/progress');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.checkContainer,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={[styles.checkCircle, { backgroundColor: colors.primaryLight }]}>
            <CheckCircle size={64} color={colors.primary} fill={colors.primaryLight} />
          </View>
        </Animated.View>

        <Animated.View style={[styles.textContainer, { opacity: fadeAnim }]}>
          <Text style={[styles.title, { color: colors.text }]}>
            Workout Complete!
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            You trained {bodyPartNames} today
          </Text>
        </Animated.View>

        <Animated.View style={[styles.statsContainer, { opacity: fadeAnim }]}>
          <Card style={styles.statsCard}>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Clock size={24} color={colors.primary} />
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {actualDuration}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Minutes
                </Text>
              </View>

              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />

              <View style={styles.statItem}>
                <Dumbbell size={24} color={colors.secondary} />
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {workout.exercises.length}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Exercises
                </Text>
              </View>

              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />

              <View style={styles.statItem}>
                <Flame size={24} color={colors.streak} />
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {streakData.currentStreak + 1}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Day Streak
                </Text>
              </View>
            </View>
          </Card>

          {challengeData.isActive && (
            <Card style={styles.challengeCard}>
              <View style={styles.challengeContent}>
                <Trophy size={24} color={colors.secondary} />
                <View style={styles.challengeInfo}>
                  <Text style={[styles.challengeTitle, { color: colors.text }]}>
                    30-Day Challenge
                  </Text>
                  <Text style={[styles.challengeProgress, { color: colors.textSecondary }]}>
                    Day {challengeData.currentDay + 1} complete!
                  </Text>
                </View>
              </View>
              <View style={[styles.challengeBar, { backgroundColor: colors.border }]}>
                <View
                  style={[
                    styles.challengeFill,
                    {
                      backgroundColor: colors.secondary,
                      width: `${((challengeData.currentDay + 1) / 30) * 100}%`,
                    },
                  ]}
                />
              </View>
            </Card>
          )}

          <View
            style={[
              styles.motivationCard,
              { backgroundColor: colors.primaryLight },
            ]}
          >
            <Text style={[styles.motivationText, { color: colors.primary }]}>
              {streakData.currentStreak >= 7
                ? "You're on fire! A week strong!"
                : streakData.currentStreak >= 3
                ? 'Great consistency! Keep it up!'
                : streakData.currentStreak >= 1
                ? "You're building momentum!"
                : "Great start! Come back tomorrow!"}
            </Text>
          </View>
        </Animated.View>
      </View>

      <View style={styles.footer}>
        <Button
          title="View Progress"
          onPress={handleViewProgress}
          variant="outline"
          size="large"
          style={styles.secondaryButton}
        />
        <Button
          title="Done"
          onPress={handleDone}
          size="large"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  checkContainer: {
    marginBottom: Spacing.lg,
  },
  checkCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSizes.md,
    textAlign: 'center',
  },
  statsContainer: {
    width: '100%',
    gap: Spacing.md,
  },
  statsCard: {
    padding: Spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 50,
  },
  statValue: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    marginTop: Spacing.xs,
  },
  statLabel: {
    fontSize: FontSizes.xs,
    marginTop: 2,
  },
  challengeCard: {
    padding: Spacing.md,
  },
  challengeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
  },
  challengeProgress: {
    fontSize: FontSizes.sm,
    marginTop: 2,
  },
  challengeBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  challengeFill: {
    height: '100%',
    borderRadius: 3,
  },
  motivationCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  motivationText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    textAlign: 'center',
  },
  footer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  secondaryButton: {
    marginBottom: Spacing.xs,
  },
});
