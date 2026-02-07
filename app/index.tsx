/**
 * Enhanced Home Dashboard
 * 
 * Features:
 * - Onboarding check (redirects if not completed)
 * - Streak counter and progress summary
 * - Quick access to Timer and AI Coach
 * - Explore exercises button
 */

import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
    FadeInDown,
    FadeInUp,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withSpring
} from 'react-native-reanimated';
import { getExercisesByBodyPart } from '../data/exercises';
import { storageService, StreakData, UserPreferences, WorkoutSession } from '../services/storage/StorageService';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [streak, setStreak] = useState<StreakData | null>(null);
    const [preferences, setPreferences] = useState<UserPreferences | null>(null);
    const [recentWorkouts, setRecentWorkouts] = useState<WorkoutSession[]>([]);

    // Animated pulse for the hero text
    const scale = useSharedValue(1);

    useEffect(() => {
        checkOnboardingAndLoadData();

        scale.value = withRepeat(
            withSequence(
                withSpring(1.02, { damping: 2 }),
                withSpring(1, { damping: 2 })
            ),
            -1,
            false
        );
    }, []);

    const checkOnboardingAndLoadData = async () => {
        const onboardingCompleted = await storageService.isOnboardingCompleted();

        if (!onboardingCompleted) {
            router.replace('/onboarding');
            return;
        }

        // Load user data
        const [prefs, streakData, recent] = await Promise.all([
            storageService.getUserPreferences(),
            storageService.getStreakData(),
            storageService.getRecentWorkouts(5),
        ]);

        setPreferences(prefs);
        setStreak(streakData);
        setRecentWorkouts(recent);
        setIsLoading(false);
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }]
    }));

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    };

    const getGoalEmoji = () => {
        if (!preferences?.primaryGoals?.length) return '💪';
        const goal = preferences.primaryGoals[0];
        switch (goal) {
            case 'belly-fat': return '🔥';
            case 'glutes': return '🍑';
            case 'upper-body': return '💪';
            case 'core': return '🎯';
            default: return '⚡';
        }
    };

    const getRecommendedExercise = () => {
        if (!preferences?.primaryGoals?.length) return null;

        const goal = preferences.primaryGoals[0];
        let bodyPartId = 'chest';

        switch (goal) {
            case 'belly-fat':
            case 'core':
                bodyPartId = 'abs';
                break;
            case 'glutes':
                bodyPartId = 'glutes';
                break;
            case 'upper-body':
                bodyPartId = 'chest';
                break;
        }

        const exercises = getExercisesByBodyPart(bodyPartId);
        return exercises[0] || null;
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    const recommended = getRecommendedExercise();

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
            {/* Header with Greeting & Streak */}
            <Animated.View
                entering={FadeInUp.delay(100).springify()}
                style={styles.header}
            >
                <View style={styles.greetingContainer}>
                    <Text style={styles.greeting}>{getGreeting()}</Text>
                    <Text style={styles.goalEmoji}>{getGoalEmoji()}</Text>
                </View>

                {/* Streak Card */}
                {streak && streak.currentStreak > 0 && (
                    <View style={styles.streakCard}>
                        <Text style={styles.streakFire}>🔥</Text>
                        <View>
                            <Text style={styles.streakCount}>{streak.currentStreak}-day streak</Text>
                            <Text style={styles.streakSub}>Keep it going!</Text>
                        </View>
                    </View>
                )}
            </Animated.View>

            {/* Hero Section */}
            <Animated.View
                entering={FadeInUp.delay(200).springify()}
                style={[styles.heroSection, animatedStyle]}
            >
                <Text style={styles.heroTitle}>Ready to Train?</Text>
                <Text style={styles.heroSubtitle}>
                    AI-powered coaching{'\n'}with real-time feedback
                </Text>
            </Animated.View>

            {/* Quick Stats Row */}
            {streak && streak.totalWorkouts > 0 && (
                <Animated.View
                    entering={FadeInDown.delay(300).springify()}
                    style={styles.statsRow}
                >
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{streak.totalWorkouts}</Text>
                        <Text style={styles.statLabel}>Workouts</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{streak.longestStreak}</Text>
                        <Text style={styles.statLabel}>Best Streak</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{streak.consistencyScore}%</Text>
                        <Text style={styles.statLabel}>Consistency</Text>
                    </View>
                </Animated.View>
            )}

            {/* Mode Selection Cards */}
            <View style={styles.modesContainer}>
                <Animated.View entering={FadeInDown.delay(400).springify()}>
                    <Pressable
                        style={({ pressed }) => [
                            styles.modeCard,
                            styles.timerCard,
                            pressed && styles.cardPressed
                        ]}
                        onPress={() => router.push('/timer')}
                    >
                        <View style={styles.cardIcon}>
                            <Text style={styles.iconText}>⏱️</Text>
                        </View>
                        <Text style={styles.cardTitle}>Quick Timer</Text>
                        <Text style={styles.cardDescription}>
                            Simple rep counter with rest periods. Tap to count exercises.
                        </Text>
                        <View style={styles.featureList}>
                            <Text style={styles.feature}>• 60fps countdown</Text>
                            <Text style={styles.feature}>• Set tracking</Text>
                            <Text style={styles.feature}>• Rest timer</Text>
                        </View>
                    </Pressable>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(500).springify()}>
                    <Pressable
                        style={({ pressed }) => [
                            styles.modeCard,
                            styles.coachCard,
                            pressed && styles.cardPressed
                        ]}
                        onPress={() => router.push('/coach')}
                    >
                        <View style={[styles.cardIcon, styles.coachIcon]}>
                            <Text style={styles.iconText}>🤖</Text>
                        </View>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>AI POWERED</Text>
                        </View>
                        <Text style={styles.cardTitle}>AI Coach</Text>
                        <Text style={styles.cardDescription}>
                            Real-time form analysis with voice coaching from Gemini AI.
                        </Text>
                        <View style={styles.featureList}>
                            <Text style={styles.feature}>• Pose detection</Text>
                            <Text style={styles.feature}>• Form validation</Text>
                            <Text style={styles.feature}>• Voice feedback</Text>
                        </View>
                    </Pressable>
                </Animated.View>
            </View>

            {/* Explore Exercises Button */}
            <Animated.View entering={FadeInDown.delay(600).springify()}>
                <Pressable
                    style={({ pressed }) => [
                        styles.exploreButton,
                        pressed && styles.cardPressed
                    ]}
                    onPress={() => router.push('/explore')}
                >
                    <LinearGradient
                        colors={['#374151', '#1F2937']}
                        style={styles.exploreGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <Text style={styles.exploreIcon}>📚</Text>
                        <View style={styles.exploreTextContainer}>
                            <Text style={styles.exploreTitle}>Explore Exercises</Text>
                            <Text style={styles.exploreSubtitle}>22+ exercises across 15 body parts</Text>
                        </View>
                        <Text style={styles.exploreArrow}>→</Text>
                    </LinearGradient>
                </Pressable>
            </Animated.View>

            {/* Recommended Workout */}
            {recommended && (
                <Animated.View entering={FadeInDown.delay(700).springify()}>
                    <View style={styles.recommendedSection}>
                        <Text style={styles.sectionTitle}>Recommended for you</Text>
                        <Pressable
                            style={({ pressed }) => [
                                styles.recommendedCard,
                                pressed && styles.cardPressed
                            ]}
                            onPress={() => router.push(`/exercise/${recommended.id}`)}
                        >
                            <View style={styles.recommendedContent}>
                                <Text style={styles.recommendedEmoji}>
                                    {getGoalEmoji()}
                                </Text>
                                <View style={styles.recommendedInfo}>
                                    <Text style={styles.recommendedName}>{recommended.name}</Text>
                                    <Text style={styles.recommendedMeta}>
                                        {recommended.defaultReps} reps × {recommended.defaultSets} sets
                                    </Text>
                                </View>
                                <Text style={styles.recommendedArrow}>→</Text>
                            </View>
                        </Pressable>
                    </View>
                </Animated.View>
            )}

            {/* Footer */}
            <Animated.View
                entering={FadeInUp.delay(800).springify()}
                style={styles.footer}
            >
                <Text style={styles.footerText}>
                    {preferences?.weeklyAvailability === '6-7'
                        ? 'Maximum gains mode activated 🚀'
                        : 'Consistency beats perfection 💪'}
                </Text>
            </Animated.View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 40,
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: '#000',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        color: '#666',
        fontSize: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    greetingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    greeting: {
        fontSize: 18,
        color: '#888',
        fontWeight: '500',
    },
    goalEmoji: {
        fontSize: 24,
    },
    streakCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(251, 146, 60, 0.15)',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 8,
    },
    streakFire: {
        fontSize: 20,
    },
    streakCount: {
        color: '#FB923C',
        fontSize: 14,
        fontWeight: '700',
    },
    streakSub: {
        color: '#FB923C',
        fontSize: 11,
        opacity: 0.7,
    },
    heroSection: {
        alignItems: 'center',
        marginBottom: 24,
    },
    heroTitle: {
        fontSize: 36,
        fontWeight: '800',
        color: '#fff',
        letterSpacing: -0.5,
        marginBottom: 8,
    },
    heroSubtitle: {
        fontSize: 15,
        color: '#888',
        textAlign: 'center',
        lineHeight: 22,
    },
    statsRow: {
        flexDirection: 'row',
        backgroundColor: '#111',
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: '800',
        color: '#fff',
    },
    statLabel: {
        fontSize: 11,
        color: '#666',
        marginTop: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: '#333',
    },
    modesContainer: {
        gap: 16,
        marginBottom: 16,
    },
    modeCard: {
        backgroundColor: '#111',
        borderRadius: 24,
        padding: 20,
        borderWidth: 2,
        borderColor: '#222',
    },
    timerCard: {
        borderColor: '#00aaff',
    },
    coachCard: {
        borderColor: '#00ff88',
        position: 'relative',
    },
    cardPressed: {
        opacity: 0.7,
        transform: [{ scale: 0.98 }],
    },
    cardIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#1a1a1a',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    coachIcon: {
        backgroundColor: '#001a0f',
    },
    iconText: {
        fontSize: 26,
    },
    badge: {
        position: 'absolute',
        top: 14,
        right: 14,
        backgroundColor: '#00ff88',
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 10,
    },
    badgeText: {
        fontSize: 9,
        fontWeight: '900',
        color: '#000',
        letterSpacing: 1,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#fff',
        marginBottom: 6,
    },
    cardDescription: {
        fontSize: 13,
        color: '#888',
        lineHeight: 18,
        marginBottom: 12,
    },
    featureList: {
        gap: 4,
    },
    feature: {
        fontSize: 12,
        color: '#aaa',
    },
    exploreButton: {
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 20,
    },
    exploreGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 14,
    },
    exploreIcon: {
        fontSize: 28,
    },
    exploreTextContainer: {
        flex: 1,
    },
    exploreTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
    exploreSubtitle: {
        fontSize: 12,
        color: '#9CA3AF',
        marginTop: 2,
    },
    exploreArrow: {
        fontSize: 20,
        color: '#9CA3AF',
    },
    recommendedSection: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginBottom: 10,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    recommendedCard: {
        backgroundColor: '#111',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#333',
    },
    recommendedContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 14,
    },
    recommendedEmoji: {
        fontSize: 32,
    },
    recommendedInfo: {
        flex: 1,
    },
    recommendedName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
    recommendedMeta: {
        fontSize: 12,
        color: '#888',
        marginTop: 3,
    },
    recommendedArrow: {
        fontSize: 18,
        color: '#666',
    },
    footer: {
        alignItems: 'center',
        marginTop: 10,
    },
    footerText: {
        fontSize: 13,
        color: '#444',
        fontWeight: '500',
    },
});
