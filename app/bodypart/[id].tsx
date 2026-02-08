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
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ModernExerciseCard } from '../../components/ui/ModernExerciseCard';
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

    const insets = useSafeAreaInsets();

    return (
        <LinearGradient
            colors={['#0F0F1A', '#1A1A2E', '#16213E']}
            style={styles.container}
        >
            <View style={[styles.safeArea, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
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

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.exercisesGrid}>
                        {exercises.map((exercise, index) => (
                            <Animated.View
                                key={exercise.id}
                                entering={FadeInDown.delay(index * 80).springify()}
                            >
                                <ModernExerciseCard
                                    exercise={{
                                        id: exercise.id,
                                        name: exercise.name,
                                        bodyPart: exercise.bodyParts[0],
                                        reps: exercise.defaultReps,
                                        sets: exercise.defaultSets,
                                        imageUri: exercise.imageUri,
                                        level: exercise.difficulty,
                                        duration: exercise.type === 'hold' ? Math.ceil((exercise.defaultHoldSeconds || 0) / 60) : undefined
                                    }}
                                    index={index}
                                    onPress={() => handleExercisePress(exercise)}
                                />
                            </Animated.View>
                        ))}
                    </View>

                    {exercises.length === 0 && (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyIcon}>🏋️</Text>
                            <Text style={styles.emptyText}>No exercises found</Text>
                            <Text style={styles.emptySubtext}>More coming soon!</Text>
                        </View>
                    )}

                    <View style={{ height: 40 }} />
                </ScrollView>
            </View>
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
    },
    exercisesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        justifyContent: 'center',
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
