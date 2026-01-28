import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Target, Dumbbell, Activity, ChevronRight, Sparkles } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/Button';
import { DurationPicker } from '@/components/ui/DurationPicker';
import { DifficultyToggle } from '@/components/ui/DifficultyToggle';
import { BorderRadius, FontSizes, FontWeights, Spacing } from '@/constants/theme';
import { Difficulty } from '@/types/exercise';

type Goal = 'consistency' | 'strength' | 'mobility';

interface GoalOption {
  id: Goal;
  label: string;
  description: string;
  icon: React.ReactNode;
}

export default function OnboardingScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { updatePreferences, completeOnboarding, startChallenge } = useApp();

  const [difficulty, setDifficulty] = useState<Difficulty>('beginner');
  const [duration, setDuration] = useState<5 | 10 | 15 | 20>(10);
  const [goal, setGoal] = useState<Goal | null>(null);

  const goals: GoalOption[] = [
    {
      id: 'consistency',
      label: 'Consistency',
      description: 'Build a daily habit',
      icon: <Target size={24} color={goal === 'consistency' ? '#FFFFFF' : colors.primary} />,
    },
    {
      id: 'strength',
      label: 'Strength',
      description: 'Get stronger',
      icon: <Dumbbell size={24} color={goal === 'strength' ? '#FFFFFF' : colors.primary} />,
    },
    {
      id: 'mobility',
      label: 'Mobility',
      description: 'Move better',
      icon: <Activity size={24} color={goal === 'mobility' ? '#FFFFFF' : colors.primary} />,
    },
  ];

  const handleComplete = async () => {
    await updatePreferences({
      difficulty,
      preferredDuration: duration,
      goal,
    });
    await completeOnboarding();
    router.replace('/(tabs)');
  };

  const handleSkip = async () => {
    await completeOnboarding();
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={[styles.skipText, { color: colors.textSecondary }]}>Skip</Text>
          <ChevronRight size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.titleSection}>
          <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
            <Sparkles size={32} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>Welcome to Gymless</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Let's personalize your experience. This takes 30 seconds.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            What's your fitness level?
          </Text>
          <DifficultyToggle value={difficulty} onChange={setDifficulty} />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            How much time do you have?
          </Text>
          <DurationPicker value={duration} onChange={setDuration} />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            What's your main goal?
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textTertiary }]}>
            Optional - helps us personalize suggestions
          </Text>
          <View style={styles.goalsContainer}>
            {goals.map(goalOption => {
              const isSelected = goal === goalOption.id;
              return (
                <TouchableOpacity
                  key={goalOption.id}
                  onPress={() => setGoal(isSelected ? null : goalOption.id)}
                  style={[
                    styles.goalCard,
                    {
                      backgroundColor: isSelected ? colors.primary : colors.surface,
                      borderColor: isSelected ? colors.primary : colors.border,
                    },
                  ]}
                  activeOpacity={0.8}
                >
                  {goalOption.icon}
                  <Text
                    style={[
                      styles.goalLabel,
                      { color: isSelected ? '#FFFFFF' : colors.text },
                    ]}
                  >
                    {goalOption.label}
                  </Text>
                  <Text
                    style={[
                      styles.goalDescription,
                      {
                        color: isSelected ? 'rgba(255,255,255,0.8)' : colors.textSecondary,
                      },
                    ]}
                  >
                    {goalOption.description}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Button title="Start Your 30-Day Challenge" onPress={handleComplete} size="large" />
        <Text style={[styles.footerNote, { color: colors.textTertiary }]}>
          No account needed. All data stays on your device.
        </Text>
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
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
  },
  skipText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.medium,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FontSizes.md,
    textAlign: 'center',
    marginTop: Spacing.xs,
    lineHeight: 22,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    marginBottom: Spacing.sm,
  },
  sectionSubtitle: {
    fontSize: FontSizes.sm,
    marginBottom: Spacing.sm,
    marginTop: -Spacing.xs,
  },
  goalsContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  goalCard: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
  },
  goalLabel: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    marginTop: Spacing.xs,
  },
  goalDescription: {
    fontSize: FontSizes.xs,
    marginTop: 2,
    textAlign: 'center',
  },
  footer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  footerNote: {
    fontSize: FontSizes.xs,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
});
