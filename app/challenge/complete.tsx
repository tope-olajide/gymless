import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Trophy, Star, Flame, Target, Calendar, Award } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/Button';
import { format, differenceInDays, parseISO } from 'date-fns';

export default function ChallengeCompleteScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { challengeData, challengeAchievements, workoutHistory } = useApp();

  const startDate = challengeData.startDate ? parseISO(challengeData.startDate) : new Date();
  const endDate = new Date();
  const totalDays = differenceInDays(endDate, startDate) + 1;

  const challengeWorkouts = workoutHistory.filter((workout) => {
    if (!challengeData.startDate) return false;
    const workoutDate = new Date(workout.date);
    return workoutDate >= startDate && workoutDate <= endDate;
  });

  const totalWorkoutTime = challengeWorkouts.reduce((sum, workout) => sum + workout.duration, 0);
  const averageWorkoutTime = challengeWorkouts.length > 0
    ? Math.round(totalWorkoutTime / challengeWorkouts.length)
    : 0;

  const handleStartNewChallenge = () => {
    router.replace('/challenge/setup');
  };

  const handleGoHome = () => {
    router.replace('/(tabs)');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={['#10B981', '#059669', '#047857']}
        style={styles.backgroundGradient}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.celebrationSection}>
          <View style={styles.trophyContainer}>
            <Trophy size={80} color="white" />
            <View style={styles.sparkleContainer}>
              <Star size={24} color="#FCD34D" style={styles.sparkle1} />
              <Star size={20} color="#FCD34D" style={styles.sparkle2} />
              <Star size={28} color="#FCD34D" style={styles.sparkle3} />
            </View>
          </View>

          <Text style={styles.congratsTitle}>Challenge Complete!</Text>
          <Text style={styles.congratsSubtitle}>
            You've conquered the 30-day challenge
          </Text>
        </View>

        <View style={styles.statsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Achievement</Text>

          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Calendar size={28} color="#10B981" />
              <Text style={[styles.statValue, { color: colors.text }]}>{challengeData.currentDay}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Days Completed</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Flame size={28} color="#F59E0B" />
              <Text style={[styles.statValue, { color: colors.text }]}>{challengeWorkouts.length}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Workouts</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Target size={28} color="#3B82F6" />
              <Text style={[styles.statValue, { color: colors.text }]}>{Math.round(totalWorkoutTime)}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Minutes</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Trophy size={28} color="#8B5CF6" />
              <Text style={[styles.statValue, { color: colors.text }]}>{challengeAchievements.length}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Achievements</Text>
            </View>
          </View>
        </View>

        {challengeAchievements.length > 0 && (
          <View style={styles.achievementsSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Unlocked Achievements</Text>

            <View style={styles.achievementsList}>
              {challengeAchievements.map((achievement) => (
                <View key={achievement.id} style={[styles.achievementCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <View style={styles.achievementIconContainer}>
                    <Award size={24} color="#F59E0B" />
                  </View>
                  <View style={styles.achievementContent}>
                    <Text style={[styles.achievementName, { color: colors.text }]}>{achievement.name}</Text>
                    <Text style={[styles.achievementDescription, { color: colors.textSecondary }]}>{achievement.description}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.summarySection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Journey Summary</Text>

          <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Challenge Type</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {challengeData.challengeType
                  ? challengeData.challengeType.charAt(0).toUpperCase() + challengeData.challengeType.slice(1)
                  : 'N/A'}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Start Date</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {format(startDate, 'MMM d, yyyy')}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Completion Date</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {format(endDate, 'MMM d, yyyy')}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Average Workout</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>{averageWorkoutTime} min</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Completion Rate</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {Math.round((challengeData.completedDays.length / challengeData.targetDays) * 100)}%
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.motivationSection}>
          <Text style={[styles.motivationTitle, { color: colors.text }]}>What's Next?</Text>
          <Text style={[styles.motivationText, { color: colors.textSecondary }]}>
            You've proven you have what it takes to commit and follow through. Your dedication has
            built a foundation of strength and consistency. Ready for another challenge?
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <Button
          title="Start New Challenge"
          onPress={handleStartNewChallenge}
          variant="primary"
          style={styles.button}
        />
        <Button
          title="Back to Home"
          onPress={handleGoHome}
          variant="secondary"
          style={styles.button}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 400,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 80,
    paddingBottom: 140,
  },
  celebrationSection: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  trophyContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  sparkleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sparkle1: {
    position: 'absolute',
    top: -10,
    right: -10,
  },
  sparkle2: {
    position: 'absolute',
    bottom: 10,
    left: -10,
  },
  sparkle3: {
    position: 'absolute',
    top: 10,
    left: -20,
  },
  congratsTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  congratsSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  statsSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '48%',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  achievementsSection: {
    paddingHorizontal: 24,
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
  achievementIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEF3C7',
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
  summarySection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  summaryCard: {
    borderRadius: 16,
    padding: 20,
    gap: 16,
    borderWidth: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  motivationSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  motivationTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  motivationText: {
    fontSize: 14,
    lineHeight: 22,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    gap: 12,
    borderTopWidth: 1,
  },
  button: {
    width: '100%',
  },
});
