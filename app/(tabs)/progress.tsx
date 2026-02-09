import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { getBodyPartById } from '@/data/bodyParts';
import { geminiService } from '@/services/ai/GeminiService';
import { storageService, StreakData, UserPreferences, WorkoutSession } from '@/services/storage/StorageService';

// Goal definitions based on user preferences
const GOAL_DEFINITIONS = {
    'lose-belly-fat': {
        id: 'lose-belly-fat',
        title: 'Lose Belly Fat',
        emoji: '🔥',
        targetBodyParts: ['abs', 'core', 'obliques'],
        description: 'Build core strength for a leaner midsection',
        milestones: [
            { reps: 100, title: 'Getting Started', badge: '🌱' },
            { reps: 500, title: 'Building Foundation', badge: '💪' },
            { reps: 1000, title: 'Core Warrior', badge: '⚔️' },
            { reps: 2500, title: 'Ab Master', badge: '🏆' },
            { reps: 5000, title: 'Legend', badge: '👑' },
        ],
    },
    'build-glutes': {
        id: 'build-glutes',
        title: 'Build Stronger Glutes',
        emoji: '🍑',
        targetBodyParts: ['glutes', 'hips', 'thighs'],
        description: 'Sculpt and strengthen your lower body',
        milestones: [
            { reps: 100, title: 'First Steps', badge: '👟' },
            { reps: 500, title: 'Gaining Momentum', badge: '🚀' },
            { reps: 1000, title: 'Glute Builder', badge: '🏗️' },
            { reps: 2500, title: 'Power House', badge: '💎' },
            { reps: 5000, title: 'Elite', badge: '⭐' },
        ],
    },
    'build-muscle': {
        id: 'build-muscle',
        title: 'Build Overall Muscle',
        emoji: '💪',
        targetBodyParts: ['chest', 'back', 'shoulders', 'arms'],
        description: 'Full body strength and muscle building',
        milestones: [
            { reps: 200, title: 'Beginner Gains', badge: '🌟' },
            { reps: 1000, title: 'Consistent', badge: '🔄' },
            { reps: 2000, title: 'Strong', badge: '💪' },
            { reps: 5000, title: 'Beast Mode', badge: '🦁' },
            { reps: 10000, title: 'Legendary', badge: '🏆' },
        ],
    },
    'improve-flexibility': {
        id: 'improve-flexibility',
        title: 'Improve Flexibility',
        emoji: '🧘',
        targetBodyParts: ['hips', 'back', 'shoulders'],
        description: 'Increase mobility and reduce stiffness',
        milestones: [
            { reps: 50, title: 'Loosening Up', badge: '🌊' },
            { reps: 200, title: 'More Mobile', badge: '🤸' },
            { reps: 500, title: 'Flexible', badge: '🧘' },
            { reps: 1000, title: 'Stretchy', badge: '🎗️' },
            { reps: 2000, title: 'Yoga Master', badge: '🪷' },
        ],
    },
    'general-fitness': {
        id: 'general-fitness',
        title: 'General Fitness',
        emoji: '🏃',
        targetBodyParts: ['full-body'],
        description: 'Stay active and maintain health',
        milestones: [
            { reps: 100, title: 'Active', badge: '✅' },
            { reps: 500, title: 'Regular', badge: '📅' },
            { reps: 1500, title: 'Dedicated', badge: '🎯' },
            { reps: 3000, title: 'Committed', badge: '💯' },
            { reps: 5000, title: 'Champion', badge: '🏅' },
        ],
    },
};

interface CalendarDay {
    date: Date;
    hasWorkout: boolean;
    workoutCount: number;
    isToday: boolean;
    isCurrentMonth: boolean;
}

interface GoalCardData {
    goal: typeof GOAL_DEFINITIONS[keyof typeof GOAL_DEFINITIONS];
    totalReps: number;
    currentMilestone: number;
    nextMilestone: { reps: number; title: string; badge: string } | null;
    progress: number;
}

export default function ProgressScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [streakData, setStreakData] = useState<StreakData | null>(null);
    const [preferences, setPreferences] = useState<UserPreferences | null>(null);
    const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
    const [bodyPartStats, setBodyPartStats] = useState<Record<string, { count: number; totalReps: number }>>({});
    const [selectedMonth, setSelectedMonth] = useState(new Date());
    const [monthWorkouts, setMonthWorkouts] = useState<WorkoutSession[]>([]);
    const [aiNudge, setAiNudge] = useState<string>('');
    const [goalCards, setGoalCards] = useState<GoalCardData[]>([]);

    useEffect(() => {
        loadProgressData();
    }, []);

    useEffect(() => {
        loadMonthWorkouts();
    }, [selectedMonth]);

    const loadProgressData = async () => {
        try {
            const [streak, prefs, history, stats] = await Promise.all([
                storageService.getStreakData(),
                storageService.getUserPreferences(),
                storageService.getWorkoutHistory(),
                storageService.getBodyPartStats(),
            ]);

            setStreakData(streak);
            setPreferences(prefs);
            setWorkouts(history);
            setBodyPartStats(stats);

            // Calculate goal progress
            if (prefs?.primaryGoals) {
                const cards = calculateGoalProgress(prefs.primaryGoals, stats);
                setGoalCards(cards);
            }

            // Get AI nudge
            if (prefs) {
                const nudge = await geminiService.getAccountabilityNudge(
                    streak,
                    history.slice(0, 5),
                    prefs
                );
                setAiNudge(nudge);
            }

            setLoading(false);
        } catch (error) {
            console.error('Error loading progress data:', error);
            setLoading(false);
        }
    };

    const loadMonthWorkouts = async () => {
        const monthData = await storageService.getWorkoutsForMonth(
            selectedMonth.getFullYear(),
            selectedMonth.getMonth()
        );
        setMonthWorkouts(monthData);
    };

    const calculateGoalProgress = (
        goals: string[],
        stats: Record<string, { count: number; totalReps: number }>
    ): GoalCardData[] => {
        return goals.map(goalId => {
            const goalDef = GOAL_DEFINITIONS[goalId as keyof typeof GOAL_DEFINITIONS]
                || GOAL_DEFINITIONS['general-fitness'];

            // Calculate total reps for target body parts
            let totalReps = 0;
            if (goalDef.targetBodyParts.includes('full-body')) {
                // Sum all body parts
                totalReps = Object.values(stats).reduce((sum, s) => sum + s.totalReps, 0);
            } else {
                totalReps = goalDef.targetBodyParts.reduce((sum, bp) => {
                    return sum + (stats[bp]?.totalReps || 0);
                }, 0);
            }

            // Find current and next milestone
            let currentMilestone = 0;
            let nextMilestone = goalDef.milestones[0];

            for (let i = 0; i < goalDef.milestones.length; i++) {
                if (totalReps >= goalDef.milestones[i].reps) {
                    currentMilestone = i + 1;
                    nextMilestone = goalDef.milestones[i + 1] || null;
                }
            }

            // Calculate progress to next milestone
            const prevMilestone = currentMilestone > 0
                ? goalDef.milestones[currentMilestone - 1].reps
                : 0;
            const nextTarget = nextMilestone?.reps || goalDef.milestones[goalDef.milestones.length - 1].reps;
            const progress = nextMilestone
                ? ((totalReps - prevMilestone) / (nextTarget - prevMilestone)) * 100
                : 100;

            return {
                goal: goalDef,
                totalReps,
                currentMilestone,
                nextMilestone,
                progress: Math.min(100, Math.max(0, progress)),
            };
        });
    };

    // Generate calendar days for current month view
    const calendarDays = useMemo((): CalendarDay[] => {
        const year = selectedMonth.getFullYear();
        const month = selectedMonth.getMonth();
        const today = new Date();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startPadding = firstDay.getDay(); // 0 = Sunday

        const days: CalendarDay[] = [];

        // Add previous month padding
        for (let i = startPadding - 1; i >= 0; i--) {
            const date = new Date(year, month, -i);
            days.push({
                date,
                hasWorkout: false,
                workoutCount: 0,
                isToday: false,
                isCurrentMonth: false,
            });
        }

        // Add current month days
        for (let d = 1; d <= lastDay.getDate(); d++) {
            const date = new Date(year, month, d);
            const dateStr = date.toISOString().split('T')[0];
            const dayWorkouts = monthWorkouts.filter(w => w.date.startsWith(dateStr));

            days.push({
                date,
                hasWorkout: dayWorkouts.length > 0,
                workoutCount: dayWorkouts.length,
                isToday: date.toDateString() === today.toDateString(),
                isCurrentMonth: true,
            });
        }

        // Add next month padding to complete the grid
        const remaining = 42 - days.length; // 6 weeks
        for (let i = 1; i <= remaining; i++) {
            const date = new Date(year, month + 1, i);
            days.push({
                date,
                hasWorkout: false,
                workoutCount: 0,
                isToday: false,
                isCurrentMonth: false,
            });
        }

        return days;
    }, [selectedMonth, monthWorkouts]);

    const navigateMonth = (direction: 1 | -1) => {
        Haptics.selectionAsync();
        setSelectedMonth(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() + direction);
            return newDate;
        });
    };

    const formatMonthYear = (date: Date) => {
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#8B5CF6" />
                <Text style={styles.loadingText}>Loading your progress...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Your Progress</Text>
                <Text style={styles.subtitle}>
                    Stay consistent, see results ✨
                </Text>
            </View>

            {/* AI Nudge */}
            {aiNudge && (
                <Animated.View entering={FadeInDown.delay(100)} style={styles.nudgeCard}>
                    <Text style={styles.nudgeIcon}>🤖</Text>
                    <Text style={styles.nudgeText}>{aiNudge}</Text>
                </Animated.View>
            )}

            {/* Streak Stats */}
            {streakData && (
                <Animated.View entering={FadeInDown.delay(200)} style={styles.statsRow}>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{streakData.currentStreak}</Text>
                        <Text style={styles.statLabel}>Day Streak 🔥</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{streakData.totalWorkouts}</Text>
                        <Text style={styles.statLabel}>Total Workouts</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{streakData.consistencyScore}%</Text>
                        <Text style={styles.statLabel}>Consistency</Text>
                    </View>
                </Animated.View>
            )}

            {/* Calendar */}
            <Animated.View entering={FadeInDown.delay(300)} style={styles.calendarCard}>
                <View style={styles.calendarHeader}>
                    <Pressable onPress={() => navigateMonth(-1)} style={styles.navButton}>
                        <Text style={styles.navButtonText}>←</Text>
                    </Pressable>
                    <Text style={styles.calendarMonth}>{formatMonthYear(selectedMonth)}</Text>
                    <Pressable onPress={() => navigateMonth(1)} style={styles.navButton}>
                        <Text style={styles.navButtonText}>→</Text>
                    </Pressable>
                </View>

                <View style={styles.weekdayRow}>
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                        <Text key={i} style={styles.weekdayLabel}>{day}</Text>
                    ))}
                </View>

                <View style={styles.calendarGrid}>
                    {calendarDays.map((day, index) => (
                        <View
                            key={index}
                            style={[
                                styles.calendarDay,
                                !day.isCurrentMonth && styles.calendarDayFaded,
                                day.isToday && styles.calendarDayToday,
                            ]}
                        >
                            <Text style={[
                                styles.calendarDayText,
                                !day.isCurrentMonth && styles.calendarDayTextFaded,
                                day.isToday && styles.calendarDayTextToday,
                            ]}>
                                {day.date.getDate()}
                            </Text>
                            {day.hasWorkout && (
                                <View style={styles.workoutDot}>
                                    <Text style={styles.workoutDotText}>
                                        {day.workoutCount > 1 ? day.workoutCount : '✓'}
                                    </Text>
                                </View>
                            )}
                        </View>
                    ))}
                </View>

                <Text style={styles.calendarLegend}>
                    {monthWorkouts.length} workout{monthWorkouts.length !== 1 ? 's' : ''} this month
                </Text>
            </Animated.View>

            {/* Goal Progress Cards */}
            <Text style={styles.sectionTitle}>Your Goals</Text>
            {goalCards.map((card, index) => (
                <Animated.View
                    key={card.goal.id}
                    entering={FadeInDown.delay(400 + index * 100)}
                    style={styles.goalCard}
                >
                    <View style={styles.goalHeader}>
                        <Text style={styles.goalEmoji}>{card.goal.emoji}</Text>
                        <View style={styles.goalInfo}>
                            <Text style={styles.goalTitle}>{card.goal.title}</Text>
                            <Text style={styles.goalDescription}>{card.goal.description}</Text>
                        </View>
                    </View>

                    {/* Progress bar */}
                    <View style={styles.progressContainer}>
                        <View style={styles.progressBar}>
                            <View style={[styles.progressFill, { width: `${card.progress}%` }]} />
                        </View>
                        <Text style={styles.progressText}>
                            {card.totalReps.toLocaleString()} reps
                        </Text>
                    </View>

                    {/* Milestones */}
                    <View style={styles.milestonesRow}>
                        {card.goal.milestones.map((milestone, i) => {
                            const isAchieved = i < card.currentMilestone;
                            const isCurrent = i === card.currentMilestone;
                            return (
                                <View
                                    key={i}
                                    style={[
                                        styles.milestone,
                                        isAchieved && styles.milestoneAchieved,
                                        isCurrent && styles.milestoneCurrent,
                                    ]}
                                >
                                    <Text style={styles.milestoneBadge}>
                                        {isAchieved ? milestone.badge : '🔒'}
                                    </Text>
                                    <Text style={[
                                        styles.milestoneLabel,
                                        isAchieved && styles.milestoneLabelAchieved,
                                    ]}>
                                        {milestone.reps}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>

                    {card.nextMilestone && (
                        <Text style={styles.nextMilestoneText}>
                            Next: {card.nextMilestone.title} at {card.nextMilestone.reps.toLocaleString()} reps
                        </Text>
                    )}
                </Animated.View>
            ))}

            {/* Body Part Breakdown */}
            <Text style={styles.sectionTitle}>Body Part Activity</Text>
            <Animated.View entering={FadeInDown.delay(600)} style={styles.bodyPartGrid}>
                {Object.entries(bodyPartStats)
                    .sort((a, b) => b[1].totalReps - a[1].totalReps)
                    .slice(0, 6)
                    .map(([partId, stats]) => {
                        const bodyPart = getBodyPartById(partId);
                        return (
                            <View key={partId} style={styles.bodyPartItem}>
                                <View style={[styles.bodyPartIcon, { backgroundColor: (bodyPart?.color || '#666') + '20' }]}>
                                    <Text style={styles.bodyPartEmoji}>
                                        {partId === 'abs' ? '🔥' : partId === 'glutes' ? '🍑' : partId === 'chest' ? '💪' : '•'}
                                    </Text>
                                </View>
                                <Text style={styles.bodyPartName}>{bodyPart?.name || partId}</Text>
                                <Text style={styles.bodyPartReps}>{stats.totalReps} reps</Text>
                            </View>
                        );
                    })}
            </Animated.View>

            {/* Recent Workouts */}
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            {workouts.slice(0, 5).map((workout, index) => (
                <Animated.View
                    key={workout.id}
                    entering={FadeInDown.delay(700 + index * 50)}
                    style={styles.workoutItem}
                >
                    <View style={styles.workoutInfo}>
                        <Text style={styles.workoutName}>{workout.exerciseName}</Text>
                        <Text style={styles.workoutDate}>
                            {new Date(workout.date).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                            })}
                        </Text>
                    </View>
                    <View style={styles.workoutStats}>
                        <Text style={styles.workoutReps}>{workout.repsCompleted} reps</Text>
                        {workout.formScore && (
                            <Text style={[
                                styles.workoutForm,
                                { color: workout.formScore >= 80 ? '#22C55E' : '#F59E0B' }
                            ]}>
                                {workout.formScore}%
                            </Text>
                        )}
                    </View>
                </Animated.View>
            ))}

            <View style={styles.bottomPadding} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    content: {
        paddingTop: 60,
        paddingHorizontal: 20,
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#888',
        marginTop: 16,
        fontSize: 16,
    },
    header: {
        marginBottom: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        color: '#fff',
    },
    subtitle: {
        fontSize: 16,
        color: '#888',
        marginTop: 4,
    },
    nudgeCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: 'rgba(139, 92, 246, 0.15)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        borderLeftWidth: 3,
        borderLeftColor: '#8B5CF6',
    },
    nudgeIcon: {
        fontSize: 24,
        marginRight: 12,
    },
    nudgeText: {
        flex: 1,
        fontSize: 15,
        color: 'rgba(255,255,255,0.9)',
        lineHeight: 22,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
        gap: 12,
    },
    statBox: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 28,
        fontWeight: '900',
        color: '#fff',
    },
    statLabel: {
        fontSize: 12,
        color: '#888',
        marginTop: 4,
        textAlign: 'center',
    },
    calendarCard: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 20,
        padding: 20,
        marginBottom: 24,
    },
    calendarHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    navButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    navButtonText: {
        fontSize: 18,
        color: '#fff',
    },
    calendarMonth: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
    },
    weekdayRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    weekdayLabel: {
        flex: 1,
        textAlign: 'center',
        fontSize: 12,
        color: '#666',
        fontWeight: '600',
    },
    calendarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    calendarDay: {
        width: '14.28%',
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    calendarDayFaded: {
        opacity: 0.3,
    },
    calendarDayToday: {
        backgroundColor: 'rgba(139, 92, 246, 0.3)',
        borderRadius: 8,
    },
    calendarDayText: {
        fontSize: 14,
        color: '#fff',
    },
    calendarDayTextFaded: {
        color: '#666',
    },
    calendarDayTextToday: {
        fontWeight: '700',
        color: '#8B5CF6',
    },
    workoutDot: {
        position: 'absolute',
        bottom: 4,
        backgroundColor: '#22C55E',
        borderRadius: 6,
        minWidth: 12,
        height: 12,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 2,
    },
    workoutDotText: {
        fontSize: 8,
        color: '#000',
        fontWeight: '700',
    },
    calendarLegend: {
        textAlign: 'center',
        fontSize: 13,
        color: '#888',
        marginTop: 12,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#fff',
        marginBottom: 16,
        marginTop: 8,
    },
    goalCard: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
    },
    goalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    goalEmoji: {
        fontSize: 40,
        marginRight: 16,
    },
    goalInfo: {
        flex: 1,
    },
    goalTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#fff',
    },
    goalDescription: {
        fontSize: 13,
        color: '#888',
        marginTop: 2,
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 12,
    },
    progressBar: {
        flex: 1,
        height: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#8B5CF6',
        borderRadius: 4,
    },
    progressText: {
        fontSize: 14,
        color: '#888',
        fontWeight: '600',
    },
    milestonesRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    milestone: {
        alignItems: 'center',
        opacity: 0.4,
    },
    milestoneAchieved: {
        opacity: 1,
    },
    milestoneCurrent: {
        opacity: 0.7,
    },
    milestoneBadge: {
        fontSize: 24,
    },
    milestoneLabel: {
        fontSize: 10,
        color: '#666',
        marginTop: 4,
    },
    milestoneLabelAchieved: {
        color: '#22C55E',
    },
    nextMilestoneText: {
        fontSize: 13,
        color: '#8B5CF6',
        textAlign: 'center',
    },
    bodyPartGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 24,
    },
    bodyPartItem: {
        width: '30%',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        padding: 12,
        alignItems: 'center',
    },
    bodyPartIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    bodyPartEmoji: {
        fontSize: 18,
    },
    bodyPartName: {
        fontSize: 12,
        color: '#fff',
        fontWeight: '600',
        textAlign: 'center',
    },
    bodyPartReps: {
        fontSize: 11,
        color: '#888',
        marginTop: 2,
    },
    workoutItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
    },
    workoutInfo: {
        flex: 1,
    },
    workoutName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 4,
    },
    workoutDate: {
        fontSize: 12,
        color: '#888',
    },
    workoutStats: {
        alignItems: 'flex-end',
    },
    workoutReps: {
        fontSize: 15,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 2,
    },
    workoutForm: {
        fontSize: 12,
        fontWeight: '600',
    },
    bottomPadding: {
        height: 60,
    },
});
