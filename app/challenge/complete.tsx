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
    <View style={styles.container}>
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
          <Text style={styles.sectionTitle}>Your Achievement</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Calendar size={28} color="#10B981" />
              <Text style={styles.statValue}>{challengeData.currentDay}</Text>
              <Text style={styles.statLabel}>Days Completed</Text>
            </View>

            <View style={styles.statCard}>
              <Flame size={28} color="#F59E0B" />
              <Text style={styles.statValue}>{challengeWorkouts.length}</Text>
              <Text style={styles.statLabel}>Total Workouts</Text>
            </View>

            <View style={styles.statCard}>
              <Target size={28} color="#3B82F6" />
              <Text style={styles.statValue}>{Math.round(totalWorkoutTime)}</Text>
              <Text style={styles.statLabel}>Total Minutes</Text>
            </View>

            <View style={styles.statCard}>
              <Trophy size={28} color="#8B5CF6" />
              <Text style={styles.statValue}>{challengeAchievements.length}</Text>
              <Text style={styles.statLabel}>Achievements</Text>
            </View>
          </View>
        </View>

        {challengeAchievements.length > 0 && (
          <View style={styles.achievementsSection}>
            <Text style={styles.sectionTitle}>Unlocked Achievements</Text>

            <View style={styles.achievementsList}>
              {challengeAchievements.map((achievement) => (
                <View key={achievement.id} style={styles.achievementCard}>
                  <View style={styles.achievementIconContainer}>
                    <Award size={24} color="#F59E0B" />
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

        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Journey Summary</Text>

          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Challenge Type</Text>
              <Text style={styles.summaryValue}>
                {challengeData.challengeType
                  ? challengeData.challengeType.charAt(0).toUpperCase() + challengeData.challengeType.slice(1)
                  : 'N/A'}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Start Date</Text>
              <Text style={styles.summaryValue}>
                {format(startDate, 'MMM d, yyyy')}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Completion Date</Text>
              <Text style={styles.summaryValue}>
                {format(endDate, 'MMM d, yyyy')}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Average Workout</Text>
              <Text style={styles.summaryValue}>{averageWorkoutTime} min</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Completion Rate</Text>
              <Text style={styles.summaryValue}>
                {Math.round((challengeData.completedDays.length / challengeData.targetDays) * 100)}%
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.motivationSection}>
          <Text style={styles.motivationTitle}>What's Next?</Text>
          <Text style={styles.motivationText}>
            You've proven you have what it takes to commit and follow through. Your dedication has
            built a foundation of strength and consistency. Ready for another challenge?
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
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
    backgroundColor: colors.background,
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
    color: colors.text,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '48%',
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
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
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
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
    color: colors.text,
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  summarySection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  summaryCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  motivationSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  motivationTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  motivationText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    padding: 24,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  button: {
    width: '100%',
  },
});
