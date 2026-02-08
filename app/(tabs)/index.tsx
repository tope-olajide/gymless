/**
 * Gymless 2.0 - Premium Glassmorphism Dashboard
 * 
 * Features:
 * - 30-Day Build Challenge Hero with progress arc
 * - Glass morphic cards and effects
 * - Gemini AI pulse indicator
 * - Exercise carousel and muscle group grid
 * - SafeAreaView for Android navigation bar safety
 */

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

// Components
import { ChallengeHero } from '../../components/challenge/ChallengeHero';
import { ExerciseCarousel } from '../../components/ui/ExerciseCarousel';
import { GeminiPulse } from '../../components/ui/GeminiPulse';
import { defaultMuscleGroups, MuscleGroupGrid } from '../../components/ui/MuscleGroupGrid';

// Data & Services
import { FEATURE_IMAGES } from '../../constants/assets';
import { borderRadius, colors, getDailyFocus, spacing } from '../../constants/theme';
import { EXERCISES } from '../../data/exercises';
import {
  ChallengeProgress,
  storageService,
  StreakData,
  UserPreferences
} from '../../services/storage/StorageService';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [challenge, setChallenge] = useState<ChallengeProgress | null>(null);

  useEffect(() => {
    checkOnboardingAndLoadData();
  }, []);

  const checkOnboardingAndLoadData = async () => {
    const onboardingCompleted = await storageService.isOnboardingCompleted();

    if (!onboardingCompleted) {
      router.replace('/onboarding');
      return;
    }

    // Load user data
    const [prefs, streakData, challengeData] = await Promise.all([
      storageService.getUserPreferences(),
      storageService.getStreakData(),
      storageService.getChallengeProgress(),
    ]);

    setPreferences(prefs);
    setStreak(streakData);
    setChallenge(challengeData);
    setIsLoading(false);
  };

  const handleStartChallenge = async () => {
    const newChallenge = await storageService.startChallenge();
    setChallenge(newChallenge);
  };

  const handleTodayWorkout = () => {
    if (challenge) {
      const focus = getDailyFocus(challenge.currentDay);
      // Navigate to exercise selection with today's focus
      router.push('/(tabs)/explore');
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getRecommendedExercises = () => {
    // Get first 5 exercises for carousel
    return EXERCISES.slice(0, 5).map(ex => ({
      id: ex.id,
      name: ex.name,
      bodyPart: ex.bodyParts[0], // bodyParts is an array
      reps: ex.defaultReps,
      sets: ex.defaultSets,
      level: ex.difficulty.charAt(0).toUpperCase() + ex.difficulty.slice(1), // Capitalize
      duration: ex.defaultHoldSeconds ? Math.ceil(ex.defaultHoldSeconds / 60) : (ex.defaultSets * 2), // Mock duration
      imageUri: ex.imageUri,
    }));
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ============================================================ */}
        {/* GLASS HEADER */}
        {/* ============================================================ */}
        <Animated.View
          entering={FadeInUp.delay(100).springify()}
          style={styles.header}
        >
          <View style={styles.greetingRow}>
            <View>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.heroTitle}>Let's Train</Text>
            </View>
            {/* Streak badge */}
            {streak && streak.currentStreak > 0 && (
              <View style={styles.streakBadge}>
                <Text style={styles.streakFire}>🔥</Text>
                <Text style={styles.streakCount}>{streak.currentStreak}</Text>
              </View>
            )}
          </View>
        </Animated.View>

        {/* ============================================================ */}
        {/* 30-DAY CHALLENGE HERO */}
        {/* ============================================================ */}
        <Animated.View entering={FadeInUp.delay(200).springify()}>
          <ChallengeHero
            challenge={challenge}
            streakDays={streak?.currentStreak || 0}
            onStartChallenge={handleStartChallenge}
            onTodayPress={handleTodayWorkout}
          />
        </Animated.View>

        {/* ============================================================ */}
        {/* QUICK START CARDS */}
        {/* ============================================================ */}
        <Text style={styles.sectionTitle}>QUICK START</Text>
        <View style={styles.quickStartRow}>
          {/* Timer Card */}
          <Animated.View
            entering={FadeInDown.delay(300).springify()}
            style={styles.quickStartCard}
          >
            <Pressable onPress={() => router.push('/timer')}>
              <ImageBackground
                source={FEATURE_IMAGES.timer}
                style={styles.featureCard}
                imageStyle={styles.featureCardImage}
              >
                <LinearGradient
                  colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.9)']}
                  style={styles.featureGradient}
                >
                  <View style={[styles.featureIconContainer, { backgroundColor: 'rgba(0, 170, 255, 0.2)' }]}>
                    <Ionicons name="time" size={24} color={colors.neon.blue} />
                  </View>
                  <View>
                    <Text style={styles.featureTitle}>Timer</Text>
                    <Text style={styles.featureSubtitle}>Manual reps</Text>
                  </View>
                </LinearGradient>
              </ImageBackground>
            </Pressable>
          </Animated.View>

          {/* AI Coach Card */}
          <Animated.View
            entering={FadeInDown.delay(400).springify()}
            style={styles.quickStartCard}
          >
            <Pressable onPress={() => router.push('/coach')}>
              <ImageBackground
                source={FEATURE_IMAGES.ai_coach}
                style={styles.featureCard}
                imageStyle={styles.featureCardImage}
              >
                <LinearGradient
                  colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.9)']}
                  style={styles.featureGradient}
                >
                  <View style={[styles.featureIconContainer, { backgroundColor: 'rgba(34, 255, 34, 0.2)' }]}>
                    <GeminiPulse size="sm" isReady={true} />
                  </View>
                  <View>
                    <Text style={styles.featureTitle}>AI Coach</Text>
                    <Text style={styles.featureSubtitle}>Form analysis</Text>
                  </View>
                </LinearGradient>
              </ImageBackground>
            </Pressable>
          </Animated.View>
        </View>

        {/* ============================================================ */}
        {/* EXERCISE CAROUSEL */}
        {/* ============================================================ */}
        <Animated.View entering={FadeInDown.delay(500).springify()}>
          <ExerciseCarousel
            title="Recommended"
            exercises={getRecommendedExercises()}
            onExercisePress={(ex) => router.push(`/exercise/${ex.id}`)}
            onSeeAllPress={() => router.push('/(tabs)/explore')}
          />
        </Animated.View>

        {/* ============================================================ */}
        {/* MUSCLE GROUP GRID */}
        {/* ============================================================ */}
        <Animated.View entering={FadeInDown.delay(600).springify()}>
          <MuscleGroupGrid
            title="Muscle Groups"
            muscleGroups={defaultMuscleGroups}
            onGroupPress={(group) => router.push(`/bodypart/${group.id}`)}
          />
        </Animated.View>

        {/* ============================================================ */}
        {/* FOOTER STATS */}
        {/* ============================================================ */}
        {streak && streak.totalWorkouts > 0 && (
          <Animated.View
            entering={FadeInDown.delay(800).springify()}
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

        {/* Bottom padding for Android navigation */}
        <View style={{ height: spacing.safeBottom }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing.lg,
    paddingBottom: spacing.safeBottom + 20,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: colors.text.tertiary,
    fontSize: 16,
  },
  // Header
  header: {
    marginBottom: spacing.xl,
  },
  greetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 14,
    color: colors.text.tertiary,
    fontWeight: '500',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 146, 60, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  streakFire: {
    fontSize: 18,
  },
  streakCount: {
    color: colors.neon.orange,
    fontSize: 16,
    fontWeight: '800',
  },
  // Section titles
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text.muted,
    letterSpacing: 1.5,
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  // Quick start cards
  quickStartRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  quickStartCard: {
    flex: 1,
  },
  quickStartIcon: {
    marginBottom: spacing.xs,
  },
  quickStartName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
  },
  quickStartDesc: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  // New Feature Card Styles
  featureCard: {
    width: '100%',
    height: 160,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  featureCardImage: {
    borderRadius: borderRadius.xl,
  },
  featureGradient: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'space-between',
  },
  featureIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  featureSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  aiCoachHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.sm,
  },
  // Navigation cards
  navCard: {
    marginBottom: spacing.md,
  },
  navCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  navIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.glass.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIcon: {
    // Style handled by container and icon props
  },
  navTextContainer: {
    flex: 1,
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
  },
  navSubtitle: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  navArrow: {
    fontSize: 20,
    color: colors.text.muted,
  },
  // Stats row
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.glass.medium,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.glass.border,
    padding: spacing.lg,
    marginTop: spacing.xl,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text.primary,
  },
  statLabel: {
    fontSize: 10,
    color: colors.text.muted,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.glass.border,
  },
});
