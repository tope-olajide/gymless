/**
 * Exercise Detail Screen
 * 
 * Shows exercise info, instructions, and mode selection buttons.
 */

import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { getBodyPartById } from '../../data/bodyParts';
import { Exercise, getExerciseById } from '../../data/exercises';

export default function ExerciseDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [exercise, setExercise] = useState<Exercise | null>(null);

    useEffect(() => {
        if (id) {
            const ex = getExerciseById(id);
            if (ex) {
                setExercise(ex);
            }
        }
    }, [id]);

    const handleBack = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.back();
    };

    const handleStartTimer = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.push({
            pathname: '/timer',
            params: { exerciseId: exercise?.id },
        });
    };

    const handleStartCoach = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.push({
            pathname: '/coach',
            params: { exerciseId: exercise?.id },
        });
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'beginner': return '#22C55E';
            case 'intermediate': return '#F59E0B';
            case 'advanced': return '#EF4444';
            default: return '#8B5CF6';
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'reps': return '🔄 Rep-based';
            case 'hold': return '⏱️ Hold exercise';
            case 'timed': return '⏳ Timed';
            default: return '💪 Exercise';
        }
    };

    if (!exercise) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    return (
        <LinearGradient
            colors={['#0F0F1A', '#1A1A2E', '#16213E']}
            style={styles.container}
        >
            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <Animated.View
                    entering={FadeInUp.duration(300)}
                    style={styles.header}
                >
                    <Pressable onPress={handleBack} style={styles.backButton}>
                        <Text style={styles.backText}>← Back</Text>
                    </Pressable>
                </Animated.View>

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Exercise Title */}
                    <Animated.View entering={FadeInDown.delay(100).springify()}>
                        <Text style={styles.exerciseName}>{exercise.name}</Text>
                        <Text style={styles.exerciseDescription}>{exercise.description}</Text>

                        {/* Meta badges */}
                        <View style={styles.metaRow}>
                            <View style={[
                                styles.difficultyBadge,
                                { backgroundColor: getDifficultyColor(exercise.difficulty) + '20' }
                            ]}>
                                <Text style={[
                                    styles.difficultyText,
                                    { color: getDifficultyColor(exercise.difficulty) }
                                ]}>
                                    {exercise.difficulty}
                                </Text>
                            </View>
                            <Text style={styles.typeLabel}>{getTypeLabel(exercise.type)}</Text>
                        </View>
                    </Animated.View>

                    {/* Target Body Parts */}
                    <Animated.View entering={FadeInDown.delay(200).springify()}>
                        <Text style={styles.sectionTitle}>Targets</Text>
                        <View style={styles.targetsRow}>
                            {exercise.bodyParts.map((bpId) => {
                                const bp = getBodyPartById(bpId);
                                return bp ? (
                                    <View key={bpId} style={[styles.targetChip, { backgroundColor: bp.color + '15', borderColor: bp.color + '30' }]}>
                                        <Text style={styles.targetIcon}>{bp.icon}</Text>
                                        <Text style={[styles.targetText, { color: bp.color }]}>{bp.name}</Text>
                                    </View>
                                ) : null;
                            })}
                        </View>
                    </Animated.View>

                    {/* Workout Config */}
                    <Animated.View entering={FadeInDown.delay(300).springify()}>
                        <Text style={styles.sectionTitle}>Workout</Text>
                        <View style={styles.workoutCard}>
                            {exercise.type === 'hold' ? (
                                <>
                                    <View style={styles.workoutItem}>
                                        <Text style={styles.workoutValue}>{exercise.defaultHoldSeconds}s</Text>
                                        <Text style={styles.workoutLabel}>Hold</Text>
                                    </View>
                                    <View style={styles.workoutDivider} />
                                    <View style={styles.workoutItem}>
                                        <Text style={styles.workoutValue}>{exercise.defaultSets}</Text>
                                        <Text style={styles.workoutLabel}>Sets</Text>
                                    </View>
                                    <View style={styles.workoutDivider} />
                                    <View style={styles.workoutItem}>
                                        <Text style={styles.workoutValue}>{exercise.restSeconds}s</Text>
                                        <Text style={styles.workoutLabel}>Rest</Text>
                                    </View>
                                </>
                            ) : (
                                <>
                                    <View style={styles.workoutItem}>
                                        <Text style={styles.workoutValue}>{exercise.defaultReps}</Text>
                                        <Text style={styles.workoutLabel}>Reps</Text>
                                    </View>
                                    <View style={styles.workoutDivider} />
                                    <View style={styles.workoutItem}>
                                        <Text style={styles.workoutValue}>{exercise.defaultSets}</Text>
                                        <Text style={styles.workoutLabel}>Sets</Text>
                                    </View>
                                    <View style={styles.workoutDivider} />
                                    <View style={styles.workoutItem}>
                                        <Text style={styles.workoutValue}>{exercise.restSeconds}s</Text>
                                        <Text style={styles.workoutLabel}>Rest</Text>
                                    </View>
                                </>
                            )}
                        </View>
                    </Animated.View>

                    {/* Instructions */}
                    <Animated.View entering={FadeInDown.delay(400).springify()}>
                        <Text style={styles.sectionTitle}>Instructions</Text>
                        <View style={styles.instructionsCard}>
                            {exercise.instructions.map((instruction, index) => (
                                <View key={index} style={styles.instructionItem}>
                                    <View style={styles.instructionNumber}>
                                        <Text style={styles.instructionNumberText}>{index + 1}</Text>
                                    </View>
                                    <Text style={styles.instructionText}>{instruction}</Text>
                                </View>
                            ))}
                        </View>
                    </Animated.View>

                    {/* Tips */}
                    {exercise.tips.length > 0 && (
                        <Animated.View entering={FadeInDown.delay(500).springify()}>
                            <Text style={styles.sectionTitle}>💡 Tips</Text>
                            <View style={styles.tipsCard}>
                                {exercise.tips.map((tip, index) => (
                                    <Text key={index} style={styles.tipText}>• {tip}</Text>
                                ))}
                            </View>
                        </Animated.View>
                    )}

                    {/* Common Mistakes */}
                    {exercise.commonMistakes.length > 0 && (
                        <Animated.View entering={FadeInDown.delay(600).springify()}>
                            <Text style={styles.sectionTitle}>⚠️ Avoid These Mistakes</Text>
                            <View style={styles.mistakesCard}>
                                {exercise.commonMistakes.map((mistake, index) => (
                                    <Text key={index} style={styles.mistakeText}>• {mistake}</Text>
                                ))}
                            </View>
                        </Animated.View>
                    )}

                    {/* Spacer for buttons */}
                    <View style={{ height: 120 }} />
                </ScrollView>

                {/* Action Buttons */}
                <View style={styles.actionsContainer}>
                    <Animated.View
                        entering={FadeInUp.delay(400).springify()}
                        style={styles.actionsRow}
                    >
                        <Pressable
                            style={({ pressed }) => [
                                styles.actionButton,
                                styles.timerButton,
                                pressed && styles.buttonPressed,
                            ]}
                            onPress={handleStartTimer}
                        >
                            <Text style={styles.buttonIcon}>⏱️</Text>
                            <Text style={styles.buttonText}>Timer</Text>
                        </Pressable>

                        <Pressable
                            style={({ pressed }) => [
                                styles.actionButton,
                                styles.coachButton,
                                pressed && styles.buttonPressed,
                            ]}
                            onPress={handleStartCoach}
                        >
                            <LinearGradient
                                colors={['#8B5CF6', '#6366F1']}
                                style={styles.coachGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <Text style={styles.buttonIcon}>🤖</Text>
                                <Text style={styles.buttonTextWhite}>AI Coach</Text>
                            </LinearGradient>
                        </Pressable>
                    </Animated.View>
                </View>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: '#0F0F1A',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        color: '#666',
        fontSize: 16,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 8,
    },
    backButton: {
        paddingVertical: 8,
    },
    backText: {
        color: '#8B5CF6',
        fontSize: 16,
        fontWeight: '600',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 8,
    },
    exerciseName: {
        fontSize: 32,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    exerciseDescription: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.6)',
        lineHeight: 22,
        marginBottom: 16,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 28,
    },
    difficultyBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    difficultyText: {
        fontSize: 13,
        fontWeight: '700',
        textTransform: 'capitalize',
    },
    typeLabel: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.5)',
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.5)',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 12,
    },
    targetsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 28,
    },
    targetChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
        gap: 6,
    },
    targetIcon: {
        fontSize: 16,
    },
    targetText: {
        fontSize: 13,
        fontWeight: '600',
    },
    workoutCard: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 16,
        padding: 20,
        marginBottom: 28,
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    workoutItem: {
        alignItems: 'center',
    },
    workoutValue: {
        fontSize: 28,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    workoutLabel: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.5)',
        marginTop: 4,
        textTransform: 'uppercase',
    },
    workoutDivider: {
        width: 1,
        height: 40,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    instructionsCard: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 28,
        gap: 12,
    },
    instructionItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    instructionNumber: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#8B5CF6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    instructionNumberText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    instructionText: {
        flex: 1,
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        lineHeight: 20,
    },
    tipsCard: {
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 28,
        gap: 8,
        borderWidth: 1,
        borderColor: 'rgba(34, 197, 94, 0.2)',
    },
    tipText: {
        fontSize: 14,
        color: '#22C55E',
        lineHeight: 20,
    },
    mistakesCard: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 28,
        gap: 8,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.2)',
    },
    mistakeText: {
        fontSize: 14,
        color: '#EF4444',
        lineHeight: 20,
    },
    actionsContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
        paddingBottom: 32,
        paddingTop: 16,
        backgroundColor: 'rgba(15, 15, 26, 0.95)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
    },
    actionsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        flex: 1,
        borderRadius: 16,
        overflow: 'hidden',
    },
    timerButton: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    coachButton: {
        flex: 1.5,
    },
    coachGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 8,
    },
    buttonPressed: {
        opacity: 0.7,
        transform: [{ scale: 0.98 }],
    },
    buttonIcon: {
        fontSize: 20,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.8)',
    },
    buttonTextWhite: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});
