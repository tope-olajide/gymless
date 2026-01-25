import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ChevronRight,
  Play,
  Flame,
  Trophy,
  Sparkles,
  Info,
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StreakBadge } from '@/components/ui/StreakBadge';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { DurationPicker } from '@/components/ui/DurationPicker';
import { BorderRadius, FontSizes, FontWeights, Spacing } from '@/constants/theme';
import { muscleGroups, getAllMuscleGroups } from '@/data/bodyParts';
import { getWorkoutSuggestionReason } from '@/utils/workoutGenerator';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const {
    preferences,
    streakData,
    challengeData,
    workoutHistory,
    bodyPartHistory,
  } = useApp();

  const [quickDuration, setQuickDuration] = React.useState<5 | 10 | 15 | 20>(
    preferences.preferredDuration
  );

  const challengeProgress = useMemo(() => {
    if (!challengeData.isActive) return 0;
    return (challengeData.currentDay / challengeData.targetDays) * 100;
  }, [challengeData]);

  const suggestedMuscleGroups = useMemo(() => {
    const allGroups = getAllMuscleGroups();
    const lastTrainedDates: Record<string, string | null> = {};

    for (const group of allGroups) {
      lastTrainedDates[group.id] = bodyPartHistory[group.id]?.lastTrained || null;
    }

    const sorted = [...allGroups].sort((a, b) => {
      const aDate = lastTrainedDates[a.id];
      const bDate = lastTrainedDates[b.id];

      if (!aDate && !bDate) return 0;
      if (!aDate) return -1;
      if (!bDate) return 1;

      return new Date(aDate).getTime() - new Date(bDate).getTime();
    });

    return sorted.slice(0, 2);
  }, [bodyPartHistory]);

  const suggestionReason = useMemo(() => {
    const lastTrainedDates: Record<string, string | null> = {};
    for (const [key, value] of Object.entries(bodyPartHistory)) {
      lastTrainedDates[key] = value.lastTrained;
    }

    const lastWorkout = workoutHistory[0];
    const lastWorkoutBodyParts = lastWorkout?.bodyParts || [];

    return getWorkoutSuggestionReason(
      suggestedMuscleGroups.map(g => g.id),
      lastTrainedDates,
      lastWorkoutBodyParts
    );
  }, [bodyPartHistory, workoutHistory, suggestedMuscleGroups]);

  const todayMessage = useMemo(() => {
    const lastWorkout = workoutHistory[0];
    if (!lastWorkout) return "Ready for your first workout?";

    const lastDate = new Date(lastWorkout.completedAt);
    const today = new Date();
    const isToday =
      lastDate.toDateString() === today.toDateString();

    if (isToday) {
      const bodyPartNames = lastWorkout.bodyParts
        .map(id => muscleGroups[id]?.name)
        .filter(Boolean)
        .slice(0, 2)
        .join(' & ');
      return `You trained ${bodyPartNames} today`;
    }

    return "Let's keep the momentum going!";
  }, [workoutHistory]);

  const handleQuickStart = () => {
    router.push({
      pathname: '/workout/configure',
      params: {
        duration: quickDuration.toString(),
        muscleGroups: suggestedMuscleGroups.map(g => g.id).join(','),
      },
    });
  };

  const handleSuggestedWorkout = () => {
    router.push({
      pathname: '/workout/configure',
      params: {
        duration: preferences.preferredDuration.toString(),
        muscleGroups: suggestedMuscleGroups.map(g => g.id).join(','),
      },
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>
              {todayMessage}
            </Text>
            <Text style={[styles.title, { color: colors.text }]}>Gymless</Text>
          </View>
          <StreakBadge streak={streakData.currentStreak} size="medium" />
        </View>

        {challengeData.isActive && (
          <Card style={styles.challengeCard}>
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.challengeGradient}
            >
              <View style={styles.challengeContent}>
                <View style={styles.challengeInfo}>
                  <View style={styles.challengeHeader}>
                    <Trophy size={20} color="#FFFFFF" />
                    <Text style={styles.challengeTitle}>30-Day Challenge</Text>
                  </View>
                  <Text style={styles.challengeDay}>
                    Day {challengeData.currentDay} of {challengeData.targetDays}
                  </Text>
                  <Text style={styles.challengeSubtext}>
                    {challengeData.targetDays - challengeData.currentDay} days to go
                  </Text>
                </View>
                <ProgressRing
                  progress={challengeProgress}
                  size={80}
                  strokeWidth={8}
                  color="#FFFFFF"
                  backgroundColor="rgba(255,255,255,0.2)"
                >
                  <Text style={styles.progressText}>
                    {Math.round(challengeProgress)}%
                  </Text>
                </ProgressRing>
              </View>

              <View style={styles.milestones}>
                {[7, 14, 21, 30].map(day => (
                  <View
                    key={day}
                    style={[
                      styles.milestone,
                      challengeData.currentDay >= day && styles.milestoneComplete,
                    ]}
                  >
                    <Text
                      style={[
                        styles.milestoneText,
                        challengeData.currentDay >= day && styles.milestoneTextComplete,
                      ]}
                    >
                      {day}
                    </Text>
                  </View>
                ))}
              </View>
            </LinearGradient>
          </Card>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Quick Start
          </Text>
          <Card style={styles.quickStartCard}>
            <Text style={[styles.quickStartLabel, { color: colors.textSecondary }]}>
              Select duration
            </Text>
            <DurationPicker value={quickDuration} onChange={setQuickDuration} />
            <Button
              title="Start Workout"
              onPress={handleQuickStart}
              size="large"
              style={styles.startButton}
              icon={<Play size={18} color="#FFFFFF" fill="#FFFFFF" />}
            />
          </Card>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Suggested for Today
            </Text>
            <TouchableOpacity
              style={styles.infoButton}
              onPress={() => {}}
            >
              <Info size={16} color={colors.textTertiary} />
            </TouchableOpacity>
          </View>

          <Card style={styles.suggestedCard} onPress={handleSuggestedWorkout}>
            <View style={styles.suggestedHeader}>
              <View
                style={[
                  styles.suggestedIcon,
                  { backgroundColor: colors.primaryLight },
                ]}
              >
                <Sparkles size={20} color={colors.primary} />
              </View>
              <View style={styles.suggestedInfo}>
                <Text style={[styles.suggestedTitle, { color: colors.text }]}>
                  {suggestedMuscleGroups.map(g => g.name).join(' & ')}
                </Text>
                <Text style={[styles.suggestedDuration, { color: colors.textSecondary }]}>
                  {preferences.preferredDuration} min workout
                </Text>
              </View>
              <ChevronRight size={20} color={colors.textTertiary} />
            </View>

            <View
              style={[
                styles.reasonContainer,
                { backgroundColor: colors.surfaceSecondary },
              ]}
            >
              <Text style={[styles.reasonText, { color: colors.textSecondary }]}>
                {suggestionReason}
              </Text>
            </View>
          </Card>
        </View>

        {workoutHistory.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Recent Activity
              </Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/progress')}>
                <Text style={[styles.seeAll, { color: colors.primary }]}>
                  See all
                </Text>
              </TouchableOpacity>
            </View>

            {workoutHistory.slice(0, 3).map((workout, index) => {
              const date = new Date(workout.completedAt);
              const isToday = date.toDateString() === new Date().toDateString();
              const dateLabel = isToday
                ? 'Today'
                : date.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  });

              return (
                <Card key={workout.id} style={styles.activityCard}>
                  <View style={styles.activityContent}>
                    <View
                      style={[
                        styles.activityDot,
                        { backgroundColor: colors.primary },
                      ]}
                    />
                    <View style={styles.activityInfo}>
                      <Text style={[styles.activityTitle, { color: colors.text }]}>
                        {workout.bodyParts
                          .map(id => muscleGroups[id]?.name)
                          .filter(Boolean)
                          .join(', ')}
                      </Text>
                      <Text
                        style={[
                          styles.activityMeta,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {dateLabel} • {workout.duration} min
                      </Text>
                    </View>
                    <Flame size={16} color={colors.streak} />
                  </View>
                </Card>
              );
            })}
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  greeting: {
    fontSize: FontSizes.sm,
    marginBottom: 4,
  },
  title: {
    fontSize: FontSizes.xxxl,
    fontWeight: FontWeights.bold,
  },
  challengeCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  challengeGradient: {
    padding: Spacing.lg,
  },
  challengeContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  challengeInfo: {
    flex: 1,
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  challengeTitle: {
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: FontWeights.medium,
  },
  challengeDay: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    color: '#FFFFFF',
  },
  challengeSubtext: {
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  progressText: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: '#FFFFFF',
  },
  milestones: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  milestone: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  milestoneComplete: {
    backgroundColor: '#FFFFFF',
  },
  milestoneText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: 'rgba(255,255,255,0.8)',
  },
  milestoneTextComplete: {
    color: '#10B981',
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
  },
  infoButton: {
    padding: Spacing.xs,
  },
  seeAll: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
  },
  quickStartCard: {
    padding: Spacing.lg,
  },
  quickStartLabel: {
    fontSize: FontSizes.sm,
    marginBottom: Spacing.sm,
  },
  startButton: {
    marginTop: Spacing.lg,
  },
  suggestedCard: {
    padding: Spacing.md,
  },
  suggestedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  suggestedIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestedInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  suggestedTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
  },
  suggestedDuration: {
    fontSize: FontSizes.sm,
    marginTop: 2,
  },
  reasonContainer: {
    marginTop: Spacing.md,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  reasonText: {
    fontSize: FontSizes.sm,
    fontStyle: 'italic',
  },
  activityCard: {
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  activityContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.md,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.medium,
  },
  activityMeta: {
    fontSize: FontSizes.sm,
    marginTop: 2,
  },
  bottomPadding: {
    height: Spacing.xxl,
  },
});
