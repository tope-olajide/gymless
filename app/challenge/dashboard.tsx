import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, Trophy, Flame, Play, Pause, ChevronRight, Award, Target } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/Button';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { format, parseISO, differenceInDays } from 'date-fns';
import { getTodaysPlan, calculateChallengeProgress } from '@/utils/challengeGenerator';
import { getNextMilestone } from '@/utils/challengeAchievements';

export default function ChallengeDashboardScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const {
    challengeData,
    challengePlan,
    challengeAchievements,
    pauseChallenge,
    resumeChallenge,
    abandonChallenge,
    isLoading,
  } = useApp();

  const [todaysPlan, setTodaysPlan] = useState<any>(null);

  useEffect(() => {
    if (challengePlan) {
      const plan = getTodaysPlan(challengePlan);
      setTodaysPlan(plan);
    }
  }, [challengePlan]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!challengeData.isActive) {
    router.replace('/(tabs)');
    return null;
  }

  const progress = calculateChallengeProgress(challengeData.completedDays, challengeData.targetDays);
  const today = format(new Date(), 'yyyy-MM-dd');
  const isCompleted = challengeData.completedDays.includes(today);
  const nextMilestone = getNextMilestone(challengeData.currentDay);

  const handleStartWorkout = () => {
    if (todaysPlan && !todaysPlan.isRestDay) {
      router.push({
        pathname: '/workout/configure',
        params: {
          fromChallenge: 'true',
          challengeDay: todaysPlan.day,
        },
      });
    }
  };

  const handlePauseResume = async () => {
    if (challengeData.isPaused) {
      await resumeChallenge();
    } else {
      await pauseChallenge();
    }
  };

  const canPause = challengeData.pausedDays < challengeData.maxPauseDays;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.primary + '20', 'transparent']}
        style={styles.headerGradient}
      />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.backText, { color: colors.text }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>30-Day Challenge</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.progressSection}>
          <View style={styles.progressRingContainer}>
            <ProgressRing progress={progress} size={140} strokeWidth={12} />
            <View style={styles.progressCenter}>
              <Text style={styles.dayNumber}>{challengeData.currentDay}</Text>
              <Text style={styles.dayLabel}>/ {challengeData.targetDays}</Text>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Trophy size={20} color={colors.primary} />
              <Text style={styles.statValue}>{challengeAchievements.length}</Text>
              <Text style={styles.statLabel}>Achievements</Text>
            </View>

            <View style={styles.statCard}>
              <Flame size={20} color="#F59E0B" />
              <Text style={styles.statValue}>{challengeData.completedDays.length}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>

            <View style={styles.statCard}>
              <Target size={20} color="#10B981" />
              <Text style={styles.statValue}>{progress}%</Text>
              <Text style={styles.statLabel}>Progress</Text>
            </View>
          </View>
        </View>

        {challengeData.isPaused && (
          <View style={styles.pausedBanner}>
            <Pause size={20} color="#F59E0B" />
            <Text style={styles.pausedText}>
              Challenge Paused ({challengeData.maxPauseDays - challengeData.pausedDays} pause days remaining)
            </Text>
          </View>
        )}

        {nextMilestone && (
          <View style={styles.milestoneCard}>
            <Award size={24} color={colors.primary} />
            <View style={styles.milestoneContent}>
              <Text style={styles.milestoneTitle}>Next Milestone</Text>
              <Text style={styles.milestoneName}>{nextMilestone.name}</Text>
              <Text style={styles.milestoneDays}>{nextMilestone.daysRemaining} days to go</Text>
            </View>
          </View>
        )}

        {todaysPlan && (
          <View style={styles.todaySection}>
            <Text style={styles.sectionTitle}>Today's Workout</Text>

            {todaysPlan.isRestDay ? (
              <View style={styles.restDayCard}>
                <Text style={styles.restDayTitle}>Rest & Recovery Day</Text>
                <Text style={styles.restDayText}>
                  Take it easy today. Light stretching and flexibility work recommended.
                </Text>
              </View>
            ) : (
              <View style={styles.workoutCard}>
                <View style={styles.workoutHeader}>
                  <View>
                    <Text style={styles.workoutType}>
                      {todaysPlan.workoutType.charAt(0).toUpperCase() + todaysPlan.workoutType.slice(1)}
                    </Text>
                    <Text style={styles.workoutDuration}>{todaysPlan.duration} minutes</Text>
                  </View>
                  {isCompleted && (
                    <View style={styles.completedBadge}>
                      <Text style={styles.completedText}>✓ Completed</Text>
                    </View>
                  )}
                </View>

                <View style={styles.workoutDetails}>
                  <Text style={styles.workoutLabel}>Target Areas</Text>
                  <Text style={styles.workoutValue}>
                    {todaysPlan.bodyParts.map((bp: string) =>
                      bp.charAt(0).toUpperCase() + bp.slice(1)
                    ).join(', ')}
                  </Text>
                </View>

                <View style={styles.workoutDetails}>
                  <Text style={styles.workoutLabel}>Exercises</Text>
                  <Text style={styles.workoutValue}>{todaysPlan.exercises.length} exercises</Text>
                </View>

                {!isCompleted && !challengeData.isPaused && (
                  <Button
                    title="Start Today's Workout"
                    onPress={handleStartWorkout}
                    variant="primary"
                    style={styles.startButton}
                    icon={<Play size={20} color="white" />}
                  />
                )}
              </View>
            )}
          </View>
        )}

        {challengeAchievements.length > 0 && (
          <View style={styles.achievementsSection}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            <View style={styles.achievementsList}>
              {challengeAchievements.map((achievement) => (
                <View key={achievement.id} style={styles.achievementCard}>
                  <View style={styles.achievementIcon}>
                    <Trophy size={20} color={colors.primary} />
                  </View>
                  <View style={styles.achievementContent}>
                    <Text style={styles.achievementName}>{achievement.name}</Text>
                    <Text style={styles.achievementDescription}>{achievement.description}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.actionsSection}>
          {!challengeData.isPaused && canPause && (
            <Button
              title="Pause Challenge"
              onPress={handlePauseResume}
              variant="secondary"
              style={styles.actionButton}
            />
          )}

          {challengeData.isPaused && (
            <Button
              title="Resume Challenge"
              onPress={handlePauseResume}
              variant="primary"
              style={styles.actionButton}
            />
          )}

          <TouchableOpacity
            onPress={abandonChallenge}
            style={styles.abandonButton}
          >
            <Text style={styles.abandonText}>Abandon Challenge</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  backText: {
    fontSize: 24,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  progressSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  progressRingContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  progressCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayNumber: {
    fontSize: 40,
    fontWeight: '700',
  },
  dayLabel: {
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '600',
  },
  statLabel: {
    fontSize: 12,
  },
  pausedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  pausedText: {
    flex: 1,
    fontSize: 14,
    color: '#92400E',
  },
  milestoneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
  },
  milestoneContent: {
    flex: 1,
  },
  milestoneTitle: {
    fontSize: 12,
    marginBottom: 4,
  },
  milestoneName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  milestoneDays: {
    fontSize: 14,
  },
  todaySection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  restDayCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
  },
  restDayTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  restDayText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  workoutCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  workoutType: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  workoutDuration: {
    fontSize: 14,
  },
  completedBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  completedText: {
    fontSize: 12,
    color: '#065F46',
    fontWeight: '600',
  },
  workoutDetails: {
    marginBottom: 16,
  },
  workoutLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  workoutValue: {
    fontSize: 14,
  },
  startButton: {
    marginTop: 8,
  },
  achievementsSection: {
    marginBottom: 32,
  },
  achievementsList: {
    gap: 12,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  achievementIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementContent: {
    flex: 1,
  },
  achievementName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
  },
  actionsSection: {
    gap: 12,
    marginBottom: 32,
  },
  actionButton: {
    width: '100%',
  },
  abandonButton: {
    padding: 16,
    alignItems: 'center',
  },
  abandonText: {
    fontSize: 14,
    color: '#EF4444',
  },
});
