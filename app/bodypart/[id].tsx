/**
 * Body Part Detail Screen
 * 
 * Shows all exercises for a specific body part.
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
import Animated, { FadeInDown } from 'react-native-reanimated';
import { BodyPart, getBodyPartById } from '../../data/bodyParts';
import { Exercise, getExercisesByBodyPart } from '../../data/exercises';

export default function BodyPartDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [bodyPart, setBodyPart] = useState<BodyPart | null>(null);
    const [exercises, setExercises] = useState<Exercise[]>([]);

    useEffect(() => {
        if (id) {
            const bp = getBodyPartById(id);
            if (bp) {
                setBodyPart(bp);
                setExercises(getExercisesByBodyPart(id));
            }
        }
    }, [id]);

    const handleExercisePress = (exercise: Exercise) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push(`/exercise/${exercise.id}`);
    };

    const handleBack = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.back();
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'beginner': return '#22C55E';
            case 'intermediate': return '#F59E0B';
            case 'advanced': return '#EF4444';
            default: return '#8B5CF6';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'reps': return '🔄';
            case 'hold': return '⏱️';
            case 'timed': return '⏳';
            default: return '💪';
        }
    };

    if (!bodyPart) {
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
                <View style={styles.header}>
                    <Pressable onPress={handleBack} style={styles.backButton}>
                        <Text style={styles.backText}>← Back</Text>
                    </Pressable>

                    <View style={styles.headerContent}>
                        <View style={[styles.iconContainer, { backgroundColor: bodyPart.color + '20' }]}>
                            <Text style={styles.headerIcon}>{bodyPart.icon}</Text>
                        </View>
                        <View>
                            <Text style={styles.headerTitle}>{bodyPart.name}</Text>
                            <Text style={styles.headerSubtitle}>
                                {exercises.length} {exercises.length === 1 ? 'exercise' : 'exercises'} available
                            </Text>
                        </View>
                    </View>

                    {/* Benefits */}
                    <View style={styles.benefitsRow}>
                        {bodyPart.benefits.map((benefit, i) => (
                            <View key={i} style={[styles.benefitChip, { backgroundColor: bodyPart.color + '20' }]}>
                                <Text style={[styles.benefitText, { color: bodyPart.color }]}>{benefit}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Exercises List */}
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {exercises.map((exercise, index) => (
                        <Animated.View
                            key={exercise.id}
                            entering={FadeInDown.delay(index * 80).springify()}
                        >
                            <Pressable
                                style={({ pressed }) => [
                                    styles.exerciseCard,
                                    pressed && styles.cardPressed,
                                ]}
                                onPress={() => handleExercisePress(exercise)}
                            >
                                <View style={styles.exerciseHeader}>
                                    <View style={styles.typeContainer}>
                                        <Text style={styles.typeIcon}>{getTypeIcon(exercise.type)}</Text>
                                    </View>
                                    <View style={styles.exerciseInfo}>
                                        <Text style={styles.exerciseName}>{exercise.name}</Text>
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
                                            <Text style={styles.metaText}>
                                                {exercise.type === 'hold'
                                                    ? `${exercise.defaultHoldSeconds}s hold`
                                                    : `${exercise.defaultReps} reps × ${exercise.defaultSets} sets`}
                                            </Text>
                                        </View>
                                    </View>
                                    <Text style={styles.arrow}>→</Text>
                                </View>

                                <Text style={styles.exerciseDescription} numberOfLines={2}>
                                    {exercise.description}
                                </Text>

                                {/* Target body parts */}
                                <View style={styles.targetRow}>
                                    {exercise.bodyParts.slice(0, 3).map((bpId) => {
                                        const bp = getBodyPartById(bpId);
                                        return bp ? (
                                            <View key={bpId} style={styles.targetChip}>
                                                <Text style={styles.targetIcon}>{bp.icon}</Text>
                                                <Text style={styles.targetText}>{bp.name}</Text>
                                            </View>
                                        ) : null;
                                    })}
                                </View>
                            </Pressable>
                        </Animated.View>
                    ))}

                    {exercises.length === 0 && (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyIcon}>🏋️</Text>
                            <Text style={styles.emptyText}>No exercises found</Text>
                            <Text style={styles.emptySubtext}>More coming soon!</Text>
                        </View>
                    )}

                    <View style={{ height: 40 }} />
                </ScrollView>
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
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    backButton: {
        marginBottom: 16,
    },
    backText: {
        color: '#8B5CF6',
        fontSize: 16,
        fontWeight: '600',
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        marginBottom: 16,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerIcon: {
        fontSize: 28,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.5)',
        marginTop: 2,
    },
    benefitsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    benefitChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    benefitText: {
        fontSize: 12,
        fontWeight: '600',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        gap: 12,
    },
    exerciseCard: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    cardPressed: {
        opacity: 0.7,
        transform: [{ scale: 0.98 }],
    },
    exerciseHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    typeContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    typeIcon: {
        fontSize: 20,
    },
    exerciseInfo: {
        flex: 1,
    },
    exerciseName: {
        fontSize: 17,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    difficultyBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
    },
    difficultyText: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'capitalize',
    },
    metaText: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.5)',
    },
    arrow: {
        fontSize: 18,
        color: 'rgba(255,255,255,0.3)',
    },
    exerciseDescription: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.6)',
        lineHeight: 18,
        marginBottom: 12,
    },
    targetRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    targetChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4,
    },
    targetIcon: {
        fontSize: 12,
    },
    targetText: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.6)',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    emptySubtext: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.5)',
    },
});
