/**
 * ChallengeHero - 30-Day Build Challenge Hero Section
 * 
 * Optimized for resilience:
 * - Temporarily removed SVG to prevent ViewManager crashes
 * - Uses pure View-based progress indicator
 */

import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

import { BANNER_IMAGES } from '../../constants/assets';
import { borderRadius, colors, getDailyFocus, getMilestone, spacing } from '../../constants/theme';
import { ChallengeProgress } from '../../services/storage/StorageService';

interface ChallengeHeroProps {
    challenge: ChallengeProgress | null;
    streakDays?: number;
    onStartChallenge?: () => void;
    onTodayPress?: () => void;
    onMilestonePress?: (day: number) => void;
}

export function ChallengeHero({
    challenge,
    streakDays = 0,
    onStartChallenge,
    onTodayPress,
    onMilestonePress,
}: ChallengeHeroProps) {
    const [expanded, setExpanded] = useState(false);

    const fireScale = useSharedValue(1);
    const glowOpacity = useSharedValue(0.5);
    const drawerHeight = useSharedValue(0);

    useEffect(() => {
        if (streakDays > 0) {
            fireScale.value = withRepeat(
                withSequence(
                    withSpring(1.15, { damping: 4 }),
                    withSpring(1, { damping: 4 })
                ),
                -1,
                false
            );
            glowOpacity.value = withRepeat(
                withSequence(
                    withTiming(0.8, { duration: 800 }),
                    withTiming(0.4, { duration: 800 })
                ),
                -1,
                true
            );
        }
    }, [streakDays]);

    useEffect(() => {
        drawerHeight.value = withSpring(expanded ? 150 : 0, { damping: 15 });
    }, [expanded]);

    const fireStyle = useAnimatedStyle(() => ({
        transform: [{ scale: fireScale.value }],
    }));

    const glowStyle = useAnimatedStyle(() => ({
        opacity: glowOpacity.value,
    }));

    const drawerStyle = useAnimatedStyle(() => ({
        height: drawerHeight.value,
        overflow: 'hidden',
    }));

    if (!challenge) {
        return (
            <Pressable onPress={onStartChallenge} style={styles.container}>
                <ImageBackground
                    source={BANNER_IMAGES.challenge_30}
                    style={styles.ctaCard}
                    imageStyle={styles.ctaImage}
                >
                    <LinearGradient
                        colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']}
                        style={styles.ctaOverlay}
                    >
                        <Text style={styles.ctaEmoji}>🚀</Text>
                        <Text style={styles.ctaTitle}>Start Your 30-Day Build</Text>
                        <Text style={styles.ctaSubtitle}>Transform your fitness with daily focus themes</Text>
                        <View style={styles.ctaButton}>
                            <Text style={styles.ctaButtonText}>Begin Challenge</Text>
                        </View>
                    </LinearGradient>
                </ImageBackground>
            </Pressable>
        );
    }

    const currentDay = challenge.currentDay;
    const dailyFocus = getDailyFocus(currentDay);
    const progress = challenge.completedDays.length / 30;
    const isMilestoneDay = dailyFocus.milestone;
    const milestone = isMilestoneDay ? getMilestone(currentDay) : null;

    return (
        <Pressable onPress={() => setExpanded(!expanded)} style={styles.container}>
            <View style={styles.heroCard}>
                <Animated.View style={[styles.backgroundGlow, glowStyle]}>
                    <LinearGradient
                        colors={['rgba(0, 255, 204, 0.2)', 'transparent']}
                        style={StyleSheet.absoluteFill}
                    />
                </Animated.View>

                {/* Simplified Progress View (Replaced SVG to stop crash) */}
                <View style={styles.arcContainer}>
                    <View style={styles.progressPlaceholder}>
                        <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
                        <View style={styles.dayCounterContainer}>
                            <Animated.Text style={[styles.fireIcon, fireStyle]}>
                                {streakDays > 0 ? '🔥' : dailyFocus.icon}
                            </Animated.Text>
                            <Text style={styles.dayNumber}>Day {currentDay}</Text>
                            <Text style={styles.dayLabel}>of 30</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.focusContainer}>
                    <Text style={styles.focusLabel}>TODAY'S FOCUS</Text>
                    <Text style={[styles.focusTheme, isMilestoneDay && styles.milestoneTheme]}>
                        {dailyFocus.theme}
                    </Text>
                    {isMilestoneDay && milestone && (
                        <Text style={styles.milestoneReward}>🏆 {milestone.title}</Text>
                    )}
                </View>

                {streakDays > 0 && (
                    <View style={styles.streakBadge}>
                        <Text style={styles.streakText}>{streakDays} day streak</Text>
                    </View>
                )}

                <Animated.View style={[styles.drawer, drawerStyle]}>
                    <Text style={styles.drawerTitle}>Upcoming Milestones</Text>
                    {[7, 14, 21, 30].map(day => {
                        const ms = getMilestone(day);
                        const isUnlocked = challenge.unlockedMilestones.includes(day);
                        const isUpcoming = day > currentDay;
                        return ms ? (
                            <Pressable key={day} style={styles.milestoneRow} onPress={() => onMilestonePress?.(day)}>
                                <Text style={styles.milestoneDay}>Day {day}</Text>
                                <Text style={[styles.milestoneName, isUnlocked && styles.unlocked, isUpcoming && styles.upcoming]}>
                                    {isUnlocked ? '✓ ' : isUpcoming ? '🔒 ' : ''}{ms.title}
                                </Text>
                            </Pressable>
                        ) : null;
                    })}
                </Animated.View>

                <Text style={styles.expandHint}>{expanded ? '▲ Tap to close' : '▼ Tap for milestones'}</Text>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: { marginBottom: spacing.lg },
    heroCard: {
        backgroundColor: colors.glass.strong,
        borderWidth: 1.5,
        borderColor: colors.glass.borderActive,
        borderRadius: borderRadius['2xl'],
        padding: spacing.xl,
        alignItems: 'center',
        overflow: 'hidden',
    },
    backgroundGlow: { ...StyleSheet.absoluteFillObject },
    arcContainer: { width: '100%', alignItems: 'center', marginBottom: spacing.lg },
    progressPlaceholder: {
        width: '100%',
        height: 120,
        backgroundColor: colors.glass.medium,
        borderRadius: borderRadius.lg,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressBar: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 255, 204, 0.15)',
    },
    dayCounterContainer: { alignItems: 'center' },
    fireIcon: { fontSize: 32, marginBottom: 4 },
    dayNumber: { fontSize: 36, fontWeight: '800', color: colors.text.primary },
    dayLabel: { fontSize: 14, color: colors.text.tertiary },
    focusContainer: { alignItems: 'center', marginBottom: spacing.md },
    focusLabel: { fontSize: 10, fontWeight: '700', color: colors.text.muted, letterSpacing: 1.5, marginBottom: 4 },
    focusTheme: { fontSize: 18, fontWeight: '700', color: colors.text.primary, textAlign: 'center' },
    milestoneTheme: { color: colors.neon.cyan },
    milestoneReward: { fontSize: 14, color: colors.neon.orange, marginTop: 4 },
    streakBadge: { backgroundColor: 'rgba(251, 146, 60, 0.2)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginTop: spacing.sm },
    streakText: { color: colors.neon.orange, fontSize: 12, fontWeight: '700' },
    drawer: { width: '100%', marginTop: spacing.md },
    drawerTitle: { fontSize: 12, fontWeight: '600', color: colors.text.tertiary, marginBottom: spacing.sm },
    milestoneRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
    milestoneDay: { fontSize: 12, color: colors.text.tertiary },
    milestoneName: { fontSize: 12, color: colors.text.secondary, fontWeight: '600' },
    unlocked: { color: colors.neon.green },
    upcoming: { color: colors.text.muted },
    expandHint: { fontSize: 10, color: colors.text.muted, marginTop: spacing.sm },
    ctaCard: {
        borderRadius: borderRadius['2xl'],
        borderWidth: 1.5,
        borderColor: colors.glass.borderActive,
        overflow: 'hidden',
    },
    ctaImage: {
        borderRadius: borderRadius['2xl'],
    },
    ctaOverlay: {
        padding: spacing['2xl'],
        alignItems: 'center',
    },
    ctaEmoji: { fontSize: 48, marginBottom: spacing.md },
    ctaTitle: { fontSize: 24, fontWeight: '800', color: colors.text.primary, marginBottom: spacing.xs, textAlign: 'center' },
    ctaSubtitle: { fontSize: 14, color: colors.text.secondary, textAlign: 'center', marginBottom: spacing.lg },
    ctaButton: { backgroundColor: colors.neon.cyan, paddingHorizontal: spacing['2xl'], paddingVertical: spacing.md, borderRadius: borderRadius.full },
    ctaButtonText: { color: '#000', fontSize: 16, fontWeight: '800' },
});

export default ChallengeHero;
