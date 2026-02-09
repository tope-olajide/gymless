/**
 * ExerciseCarousel - Horizontal Scrolling Exercise Cards
 * 
 * A horizontal scrollable list of exercise cards with glass styling.
 * Used for recommended exercises and quick starts.
 */

import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { colors, spacing } from '../../constants/theme';
import { ModernExerciseCard } from './ModernExerciseCard';

interface ExerciseItem {
    id: string;
    name: string;
    icon?: string;
    bodyPart?: string;
    reps?: number;
    sets?: number;
    duration?: number;
    level?: string;
    imageUri?: string;
    isLocked?: boolean;
}

interface ExerciseCarouselProps {
    title?: string;
    exercises: ExerciseItem[];
    onExercisePress: (exercise: ExerciseItem) => void;
    onSeeAllPress?: () => void;
    style?: ViewStyle;
}

export function ExerciseCarousel({
    title,
    exercises,
    onExercisePress,
    onSeeAllPress,
    style,
}: ExerciseCarouselProps) {
    return (
        <View style={[styles.container, style]}>
            {/* Header */}
            {(title || onSeeAllPress) && (
                <View style={styles.header}>
                    {title && <Text style={styles.title}>{title}</Text>}
                    {onSeeAllPress && (
                        <Pressable onPress={onSeeAllPress}>
                            <Text style={styles.seeAll}>See All →</Text>
                        </Pressable>
                    )}
                </View>
            )}

            {/* Scrollable cards */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                decelerationRate="fast"
                snapToInterval={176} // Card width (160) + gap (16)
            >
                {exercises.map((exercise, index) => (
                    <ModernExerciseCard
                        key={exercise.id}
                        exercise={exercise}
                        index={index}
                        onPress={() => onExercisePress(exercise)}
                    />
                ))}

                {/* See all card at end */}
                {onSeeAllPress && exercises.length > 3 && (
                    <Pressable onPress={onSeeAllPress} style={styles.seeAllCard}>
                        <Text style={styles.seeAllIcon}>📚</Text>
                        <Text style={styles.seeAllText}>View All</Text>
                    </Pressable>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.xl,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.screenPadding,
        marginBottom: spacing.md,
    },
    title: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.text.tertiary,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    seeAll: {
        fontSize: 12,
        color: colors.neon.cyan,
        fontWeight: '600',
    },
    scrollContent: {
        paddingHorizontal: spacing.screenPadding,
        gap: spacing.md,
    },
    seeAllCard: {
        width: 100,
        height: 220,
        backgroundColor: colors.glass.light,
        borderWidth: 1,
        borderColor: colors.glass.border,
        borderRadius: 20,
        padding: spacing.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    seeAllIcon: {
        fontSize: 24,
        marginBottom: 4,
    },
    seeAllText: {
        fontSize: 10,
        color: colors.text.tertiary,
        fontWeight: '600',
    },
});

export default ExerciseCarousel;
