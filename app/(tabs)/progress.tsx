import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  getDay,
  isToday,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Flame, Trophy, Target } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import { Card } from '@/components/ui/Card';
import { StreakBadge } from '@/components/ui/StreakBadge';
import { BorderRadius, FontSizes, FontWeights, Spacing } from '@/constants/theme';
import { muscleGroups } from '@/data/bodyParts';

export default function ProgressScreen() {
  const { colors } = useTheme();
  const { streakData, challengeData, workoutHistory, bodyPartHistory } = useApp();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });

    const startDayOfWeek = getDay(start);
    const paddingDays = Array(startDayOfWeek).fill(null);

    return [...paddingDays, ...days];
  }, [currentMonth]);

  const workoutsByDate = useMemo(() => {
    const map: Record<string, typeof workoutHistory> = {};
    for (const workout of workoutHistory) {
      const date = format(new Date(workout.completedAt), 'yyyy-MM-dd');
      if (!map[date]) map[date] = [];
      map[date].push(workout);
    }
    return map;
  }, [workoutHistory]);

  const monthStats = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);

    const monthWorkouts = workoutHistory.filter(w => {
      const date = new Date(w.completedAt);
      return date >= monthStart && date <= monthEnd;
    });

    const totalWorkouts = monthWorkouts.length;
    const totalMinutes = monthWorkouts.reduce((sum, w) => sum + w.duration, 0);
    const uniqueDays = new Set(
      monthWorkouts.map(w => format(new Date(w.completedAt), 'yyyy-MM-dd'))
    ).size;

    return { totalWorkouts, totalMinutes, uniqueDays };
  }, [currentMonth, workoutHistory]);

  const mostTrainedParts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const [id, data] of Object.entries(bodyPartHistory)) {
      counts[id] = data.totalWorkouts;
    }

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id, count]) => ({
        name: muscleGroups[id]?.name || id,
        count,
        color: muscleGroups[id]?.color || colors.primary,
      }));
  }, [bodyPartHistory, colors.primary]);

  const getDayStatus = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const workouts = workoutsByDate[dateStr];

    if (!workouts || workouts.length === 0) {
      return { status: 'empty', color: 'transparent' };
    }

    return { status: 'complete', color: colors.primary };
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Progress</Text>
        </View>

        <View style={styles.statsRow}>
          <Card style={[styles.statCard, { flex: 1 }]}>
            <View style={styles.statContent}>
              <Flame size={24} color={colors.streak} />
              <Text style={[styles.statValue, { color: colors.text }]}>
                {streakData.currentStreak}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Current Streak
              </Text>
            </View>
          </Card>

          <Card style={[styles.statCard, { flex: 1 }]}>
            <View style={styles.statContent}>
              <Trophy size={24} color={colors.secondary} />
              <Text style={[styles.statValue, { color: colors.text }]}>
                {streakData.longestStreak}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Best Streak
              </Text>
            </View>
          </Card>

          <Card style={[styles.statCard, { flex: 1 }]}>
            <View style={styles.statContent}>
              <Target size={24} color={colors.primary} />
              <Text style={[styles.statValue, { color: colors.text }]}>
                {workoutHistory.length}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Total Workouts
              </Text>
            </View>
          </Card>
        </View>

        <Card style={styles.calendarCard}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity
              onPress={() => setCurrentMonth(subMonths(currentMonth, 1))}
              style={styles.monthButton}
            >
              <ChevronLeft size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.monthTitle, { color: colors.text }]}>
              {format(currentMonth, 'MMMM yyyy')}
            </Text>
            <TouchableOpacity
              onPress={() => setCurrentMonth(addMonths(currentMonth, 1))}
              style={styles.monthButton}
            >
              <ChevronRight size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.weekDays}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <Text
                key={day}
                style={[styles.weekDay, { color: colors.textTertiary }]}
              >
                {day}
              </Text>
            ))}
          </View>

          <View style={styles.daysGrid}>
            {calendarDays.map((day, index) => {
              if (!day) {
                return <View key={`empty-${index}`} style={styles.dayCell} />;
              }

              const { status, color } = getDayStatus(day);
              const isCurrentDay = isToday(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);

              return (
                <View key={day.toISOString()} style={styles.dayCell}>
                  <View
                    style={[
                      styles.dayCircle,
                      status === 'complete' && {
                        backgroundColor: color,
                      },
                      isCurrentDay && {
                        borderWidth: 2,
                        borderColor: colors.primary,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        {
                          color:
                            status === 'complete'
                              ? '#FFFFFF'
                              : isCurrentMonth
                              ? colors.text
                              : colors.textTertiary,
                        },
                      ]}
                    >
                      {format(day, 'd')}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>

          <View style={[styles.monthSummary, { borderTopColor: colors.border }]}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {monthStats.uniqueDays}
              </Text>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                Active days
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {monthStats.totalWorkouts}
              </Text>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                Workouts
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {monthStats.totalMinutes}
              </Text>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                Minutes
              </Text>
            </View>
          </View>
        </Card>

        {mostTrainedParts.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Most Trained
            </Text>
            <Card>
              {mostTrainedParts.map((part, index) => (
                <View
                  key={part.name}
                  style={[
                    styles.trainedItem,
                    index < mostTrainedParts.length - 1 && {
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border,
                    },
                  ]}
                >
                  <View
                    style={[styles.trainedDot, { backgroundColor: part.color }]}
                  />
                  <Text style={[styles.trainedName, { color: colors.text }]}>
                    {part.name}
                  </Text>
                  <Text style={[styles.trainedCount, { color: colors.textSecondary }]}>
                    {part.count} workout{part.count !== 1 ? 's' : ''}
                  </Text>
                </View>
              ))}
            </Card>
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
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  title: {
    fontSize: FontSizes.xxxl,
    fontWeight: FontWeights.bold,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statCard: {
    padding: Spacing.md,
  },
  statContent: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    marginTop: Spacing.xs,
  },
  statLabel: {
    fontSize: FontSizes.xs,
    marginTop: 2,
    textAlign: 'center',
  },
  calendarCard: {
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  monthButton: {
    padding: Spacing.xs,
  },
  monthTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
  },
  weekDays: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.medium,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
  },
  monthSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
  },
  summaryLabel: {
    fontSize: FontSizes.xs,
    marginTop: 2,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    marginBottom: Spacing.sm,
  },
  trainedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  trainedDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: Spacing.md,
  },
  trainedName: {
    flex: 1,
    fontSize: FontSizes.md,
    fontWeight: FontWeights.medium,
  },
  trainedCount: {
    fontSize: FontSizes.sm,
  },
  bottomPadding: {
    height: Spacing.xxl,
  },
});
