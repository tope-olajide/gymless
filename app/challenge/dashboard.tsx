import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, Trophy, Flame, Play, Pause, Award, Target, ChevronLeft, AlertCircle } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/Button';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { format } from 'date-fns';
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
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
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
  const canPause = challengeData.pausedDays < challengeData.maxPauseDays;

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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.primary + '20', colors.background]}
        style={styles.headerGradient}
      />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: colors.surface }]}
        >
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Challenge</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.progressSection}>
          <View style={styles.progressRingContainer}>
            <ProgressRing progress={progress} size={160} strokeWidth={14} />
            <View style={styles.progressCenter}>
              <Text style={[styles.dayNumber, { color: colors.text }]}>
                {challengeData.currentDay}
              </Text>
              <Text style={[styles.dayLabel, { color: colors.textSecondary }]}>
                of {challengeData.targetDays} days
              </Text>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.statIconContainer, { backgroundColor: colors.primary + '15' }]}>
                <Trophy size={20} color={colors.primary} />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {challengeAchievements.length}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Badges
              </Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.statIconContainer, { backgroundColor: '#F59E0B15' }]}>
                <Flame size={20} color="#F59E0B" />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {challengeData.completedDays.length}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Completed
              </Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.statIconContainer, { backgroundColor: '#10B98115' }]}>
                <Target size={20} color="#10B981" />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {progress}%
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Progress
              </Text>
            </View>
          </View>
        </View>

        {challengeData.isPaused && (
          <View style={[styles.pausedBanner, { backgroundColor: colors.warning + '20', borderColor: colors.warning }]}>
            <Pause size={20} color={colors.warning} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.pausedTitle, { color: colors.warning }]}>Challenge Paused</Text>
              <Text style={[styles.pausedText, { color: colors.textSecondary }]}>
                {challengeData.maxPauseDays - challengeData.pausedDays} pause days remaining
              </Text>
            </View>
          </View>
        )}

        {nextMilestone && (
          <View style={[styles.milestoneCard, { backgroundColor: colors.surface, borderColor: colors.primary + '40' }]}>
            <LinearGradient
              colors={[colors.primary + '15', colors.primary + '05']}
              style={styles.milestoneGradient}
            />
            <View style={[styles.milestoneIcon, { backgroundColor: colors.primary }]}>
              <Award size={24} color="white" />
            </View>
            <View style={styles.milestoneContent}>
              <Text style={[styles.milestoneLabel, { color: colors.textSecondary }]}>
                Next Milestone
              </Text>
              <Text style={[styles.milestoneName, { color: colors.text }]}>
                {nextMilestone.name}
              </Text>
              <Text style={[styles.milestoneDays, { color: colors.primary }]}>
                {nextMilestone.daysRemaining} days to go
              </Text>
            </View>
          </View>
        )}

        {todaysPlan && (
          <View style={styles.todaySection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Today's Plan
            </Text>

            {todaysPlan.isRestDay ? (
              <View style={[styles.restDayCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={[styles.restIcon, { backgroundColor: colors.primaryLight }]}>
                  <Calendar size={32} color={colors.primary} />
                </View>
                <Text style={[styles.restDayTitle, { color: colors.text }]}>
                  Rest & Recovery
                </Text>
                <Text style={[styles.restDayText, { color: colors.textSecondary }]}>
                  Take it easy today. Light stretching and mobility work recommended.
                </Text>
              </View>
            ) : (
              <View style={[styles.workoutCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.workoutHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.workoutType, { color: colors.text }]}>
                      {todaysPlan.workoutType.charAt(0).toUpperCase() + todaysPlan.workoutType.slice(1)}
                    </Text>
                    <Text style={[styles.workoutDuration, { color: colors.textSecondary }]}>
                      {todaysPlan.duration} minutes • {todaysPlan.exercises.length} exercises
                    </Text>
                  </View>
                  {isCompleted && (
                    <View style={[styles.completedBadge, { backgroundColor: colors.success + '20' }]}>
                      <Text style={[styles.completedText, { color: colors.success }]}>✓ Done</Text>
                    </View>
                  )}
                </View>

                <View style={styles.workoutDetails}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                    Target Areas
                  </Text>
                  <View style={styles.bodyPartTags}>
                    {todaysPlan.bodyParts.map((bp: string, index: number) => (
                      <View
                        key={index}
                        style={[styles.bodyPartTag, { backgroundColor: colors.primaryLight }]}
                      >
                        <Text style={[styles.bodyPartText, { color: colors.primary }]}>
                          {bp.charAt(0).toUpperCase() + bp.slice(1)}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>

                {!isCompleted && !challengeData.isPaused && (
                  <Button
                    title="Start Today's Workout"
                    onPress={handleStartWorkout}
                    variant="primary"
                    style={styles.startButton}
                    icon={<Play size={18} color="white" />}
                  />
                )}
              </View>
            )}
          </View>
        )}

        {challengeAchievements.length > 0 && (
          <View style={styles.achievementsSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Your Achievements
            </Text>
            <View style={styles.achievementsList}>
              {challengeAchievements.slice(0, 3).map((achievement) => (
                <View
                  key={achievement.id}
                  style={[styles.achievementCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                >
                  <View style={[styles.achievementIcon, { backgroundColor: colors.secondaryLight }]}>
                    <Trophy size={20} color={colors.secondary} />
                  </View>
                  <View style={styles.achievementContent}>
                    <Text style={[styles.achievementName, { color: colors.text }]}>
                      {achievement.name}
                    </Text>
                    <Text style={[styles.achievementDescription, { color: colors.textSecondary }]}>
                      {achievement.description}
                    </Text>
                  </View>
                  <View style={[styles.achievementDay, { backgroundColor: colors.primaryLight }]}>
                    <Text style={[styles.achievementDayText, { color: colors.primary }]}>
                      Day {achievement.day}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.actionsSection}>
          {!challengeData.isPaused && canPause && (
            <TouchableOpacity
              onPress={handlePauseResume}
              style={[styles.actionButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <Pause size={20} color={colors.text} />
              <Text style={[styles.actionButtonText, { color: colors.text }]}>
                Pause Challenge
              </Text>
            </TouchableOpacity>
          )}

          {challengeData.isPaused && (
            <Button
              title="Resume Challenge"
              onPress={handlePauseResume}
              variant="primary"
              style={styles.resumeButton}
            />
          )}

          <TouchableOpacity
            onPress={abandonChallenge}
            style={styles.abandonButton}
          >
            <AlertCircle size={16} color={colors.error} />
            <Text style={[styles.abandonText, { color: colors.error }]}>
              Abandon Challenge
            </Text>
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
    height: 250,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  progressSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  progressRingContainer: {
    position: 'relative',
    marginBottom: 28,
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
    fontSize: 48,
    fontWeight: '700',
    lineHeight: 56,
  },
  dayLabel: {
    fontSize: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
  },
  pausedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
  },
  pausedTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  pausedText: {
    fontSize: 13,
  },
  milestoneCard: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  milestoneGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  milestoneIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  milestoneContent: {
    flex: 1,
  },
  milestoneLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  milestoneName: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  milestoneDays: {
    fontSize: 14,
    fontWeight: '500',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  restIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  restDayTitle: {
    fontSize: 20,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  completedText: {
    fontSize: 12,
    fontWeight: '600',
  },
  workoutDetails: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 12,
    marginBottom: 8,
  },
  bodyPartTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  bodyPartTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  bodyPartText: {
    fontSize: 12,
    fontWeight: '500',
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
    gap: 12,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementContent: {
    flex: 1,
  },
  achievementName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  achievementDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  achievementDay: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  achievementDayText: {
    fontSize: 11,
    fontWeight: '600',
  },
  actionsSection: {
    gap: 12,
    marginBottom: 32,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  resumeButton: {
    width: '100%',
  },
  abandonButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 16,
  },
  abandonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
