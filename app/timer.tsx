/**
 * Enhanced Timer Mode
 * 
 * Features:
 * - Works with any exercise (passed via params or selected)
 * - Supports both rep-based and hold exercises
 * - Gemini AI tips before and during workout
 * - Voice coaching with expo-speech
 * - Session saving with streak tracking
 */

import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
    Easing,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { Exercise, EXERCISES, getExerciseById } from '../data/exercises';
import { geminiService } from '../services/ai/GeminiService';
import { storageService, UserPreferences } from '../services/storage/StorageService';

const { width, height } = Dimensions.get('window');

type TimerState = 'selecting' | 'idle' | 'countdown' | 'active' | 'hold' | 'rest' | 'complete';

interface SessionData {
    exerciseId: string;
    setsCompleted: number;
    totalReps: number;
    startTime: number;
    endTime?: number;
}

export default function TimerMode() {
    const router = useRouter();
    const { exerciseId: paramExerciseId } = useLocalSearchParams<{ exerciseId?: string }>();

    // Exercise selection
    const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
    const [preferences, setPreferences] = useState<UserPreferences | null>(null);

    // Timer settings (from exercise or defaults)
    const [targetReps, setTargetReps] = useState(10);
    const [targetHoldSeconds, setTargetHoldSeconds] = useState(30);
    const [totalSets, setTotalSets] = useState(3);
    const [restSeconds, setRestSeconds] = useState(60);

    // State
    const [state, setState] = useState<TimerState>('selecting');
    const [currentSet, setCurrentSet] = useState(1);
    const [reps, setReps] = useState(0);
    const [holdTimeRemaining, setHoldTimeRemaining] = useState(0);
    const [restTimeRemaining, setRestTimeRemaining] = useState(0);

    // Session tracking
    const sessionRef = useRef<SessionData | null>(null);

    // AI tips
    const [currentTip, setCurrentTip] = useState<string>('');
    const [voiceEnabled, setVoiceEnabled] = useState(true);

    // Animations
    const scale = useSharedValue(1);
    const countdownValue = useSharedValue(3);
    const repScale = useSharedValue(1);
    const holdProgress = useSharedValue(1);

    // Load preferences and exercise
    useEffect(() => {
        loadPreferences();

        if (paramExerciseId) {
            const exercise = getExerciseById(paramExerciseId);
            if (exercise) {
                selectExercise(exercise);
            }
        }
    }, [paramExerciseId]);

    const loadPreferences = async () => {
        const prefs = await storageService.getUserPreferences();
        setPreferences(prefs);
    };

    const selectExercise = async (exercise: Exercise) => {
        setSelectedExercise(exercise);
        setTargetReps(exercise.defaultReps);
        setTargetHoldSeconds(exercise.defaultHoldSeconds || 30);
        setTotalSets(exercise.defaultSets);
        setRestSeconds(exercise.restSeconds);
        setState('idle');

        // Fetch AI tip
        const tip = await geminiService.getExerciseTip(exercise.id, preferences);
        setCurrentTip(tip);
    };

    // Voice helper
    const speak = (text: string) => {
        if (voiceEnabled) {
            Speech.speak(text, {
                language: 'en',
                pitch: 1.0,
                rate: 0.9,
            });
        }
    };

    // Start countdown
    const startCountdown = () => {
        setState('countdown');
        countdownValue.value = 3;

        // Initialize session on first set
        if (currentSet === 1 && selectedExercise) {
            sessionRef.current = {
                exerciseId: selectedExercise.id,
                setsCompleted: 0,
                totalReps: 0,
                startTime: Date.now(),
            };
        }

        speak('Get ready');

        const countdown = (n: number) => {
            if (n === 0) {
                const isHoldExercise = selectedExercise?.type === 'hold';
                if (isHoldExercise) {
                    runOnJS(startHold)();
                } else {
                    runOnJS(setState)('active');
                }
                runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Heavy);
                runOnJS(speak)('Go!');
                return;
            }

            countdownValue.value = withSequence(
                withTiming(n, { duration: 0 }),
                withSpring(n + 0.2, { damping: 2 }),
                withSpring(n, { damping: 2 })
            );

            runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);

            setTimeout(() => countdown(n - 1), 1000);
        };

        countdown(3);
    };

    // Hold exercise mode
    const startHold = () => {
        setState('hold');
        setHoldTimeRemaining(targetHoldSeconds);
        holdProgress.value = 1;

        holdProgress.value = withTiming(0, {
            duration: targetHoldSeconds * 1000,
            easing: Easing.linear,
        });

        const holdTimer = setInterval(() => {
            setHoldTimeRemaining(prev => {
                if (prev <= 1) {
                    clearInterval(holdTimer);
                    runOnJS(completeHoldSet)();
                    return 0;
                }
                // Announce time remaining
                if (prev === 10) {
                    runOnJS(speak)('10 seconds');
                } else if (prev === 5) {
                    runOnJS(speak)('5, 4, 3, 2, 1');
                }
                return prev - 1;
            });
        }, 1000);
    };

    const completeHoldSet = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        speak('Great hold!');

        // Update session
        if (sessionRef.current) {
            sessionRef.current.setsCompleted++;
            sessionRef.current.totalReps += 1; // Count each hold as 1 rep
        }

        if (currentSet >= totalSets) {
            completeWorkout();
        } else {
            startRest();
        }
    };

    // Count a rep
    const countRep = () => {
        if (state !== 'active') return;

        const newReps = reps + 1;
        setReps(newReps);

        // Haptic feedback
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        // Animate rep counter
        repScale.value = withSequence(
            withSpring(1.3, { damping: 2 }),
            withSpring(1, { damping: 2 })
        );

        // Announce milestone reps
        if (newReps === targetReps - 2) {
            speak('2 more');
        } else if (newReps === targetReps) {
            speak('Set complete!');
        }

        // Check if set complete
        if (newReps >= targetReps) {
            // Update session
            if (sessionRef.current) {
                sessionRef.current.setsCompleted++;
                sessionRef.current.totalReps += newReps;
            }

            if (currentSet >= totalSets) {
                completeWorkout();
            } else {
                startRest();
            }
        }
    };

    // Start rest period
    const startRest = async () => {
        setState('rest');
        setRestTimeRemaining(restSeconds);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Get AI encouragement
        if (selectedExercise) {
            const encouragement = await geminiService.getRestEncouragement(
                selectedExercise.id,
                currentSet,
                totalSets
            );
            setCurrentTip(encouragement);
            speak(encouragement);
        }

        const restTimer = setInterval(() => {
            setRestTimeRemaining(prev => {
                if (prev <= 1) {
                    clearInterval(restTimer);
                    runOnJS(startNextSet)();
                    return 0;
                }
                if (prev === 10) {
                    runOnJS(speak)('10 seconds left');
                }
                return prev - 1;
            });
        }, 1000);
    };

    // Start next set
    const startNextSet = () => {
        setCurrentSet(prev => prev + 1);
        setReps(0);
        startCountdown();
    };

    // Complete workout
    const completeWorkout = async () => {
        setState('complete');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        speak('Workout complete! Great job!');

        if (sessionRef.current && selectedExercise) {
            sessionRef.current.endTime = Date.now();

            const duration = Math.floor((sessionRef.current.endTime - sessionRef.current.startTime) / 1000);

            // Save session
            await storageService.saveWorkoutSession({
                id: Date.now().toString(),
                date: new Date().toISOString(),
                exerciseId: selectedExercise.id,
                exerciseName: selectedExercise.name,
                bodyParts: selectedExercise.bodyParts,
                mode: 'timer',
                repsCompleted: sessionRef.current.totalReps,
                setsCompleted: sessionRef.current.setsCompleted,
                durationSeconds: duration,
            });

            // Get AI summary
            const summary = await geminiService.generateSessionSummary(
                selectedExercise.id,
                sessionRef.current.setsCompleted,
                targetReps,
                duration,
                preferences
            );
            setCurrentTip(summary.encouragement);
        }
    };

    // Reset everything
    const reset = () => {
        Speech.stop();
        setState(selectedExercise ? 'idle' : 'selecting');
        setCurrentSet(1);
        setReps(0);
        setHoldTimeRemaining(0);
        setRestTimeRemaining(restSeconds);
        sessionRef.current = null;
    };

    const repAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: repScale.value }]
    }));

    const holdProgressStyle = useAnimatedStyle(() => ({
        width: `${holdProgress.value * 100}%`,
    }));

    // Exercise selection screen
    if (state === 'selecting') {
        return (
            <LinearGradient colors={['#0F0F1A', '#1A1A2E']} style={styles.container}>
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()} style={styles.backButton}>
                        <Text style={styles.backText}>←</Text>
                    </Pressable>
                    <Text style={styles.headerTitle}>Select Exercise</Text>
                    <View style={styles.placeholder} />
                </View>

                <ScrollView style={styles.exerciseList} contentContainerStyle={styles.exerciseListContent}>
                    {EXERCISES.map(exercise => (
                        <Pressable
                            key={exercise.id}
                            style={({ pressed }) => [
                                styles.exerciseCard,
                                pressed && styles.cardPressed,
                            ]}
                            onPress={() => selectExercise(exercise)}
                        >
                            <View style={styles.exerciseInfo}>
                                <Text style={styles.exerciseName}>{exercise.name}</Text>
                                <Text style={styles.exerciseMeta}>
                                    {exercise.type === 'hold'
                                        ? `${exercise.defaultHoldSeconds}s hold × ${exercise.defaultSets} sets`
                                        : `${exercise.defaultReps} reps × ${exercise.defaultSets} sets`}
                                </Text>
                            </View>
                            <Text style={styles.exerciseArrow}>→</Text>
                        </Pressable>
                    ))}
                </ScrollView>
            </LinearGradient>
        );
    }

    return (
        <LinearGradient colors={['#0F0F1A', '#1A1A2E']} style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backText}>←</Text>
                </Pressable>
                <Text style={styles.headerTitle}>{selectedExercise?.name || 'Timer'}</Text>
                <Pressable onPress={reset} style={styles.resetButton}>
                    <Text style={styles.resetText}>Reset</Text>
                </Pressable>
            </View>

            {/* Voice toggle */}
            <Pressable
                style={styles.voiceToggle}
                onPress={() => setVoiceEnabled(!voiceEnabled)}
            >
                <Text style={styles.voiceIcon}>{voiceEnabled ? '🔊' : '🔇'}</Text>
            </Pressable>

            {/* Main Content */}
            <View style={styles.content}>
                {state === 'idle' && (
                    <View style={styles.idleContent}>
                        <Text style={styles.idleTitle}>{selectedExercise?.name}</Text>
                        <Text style={styles.idleSubtitle}>
                            {selectedExercise?.type === 'hold'
                                ? `${targetHoldSeconds}s hold × ${totalSets} sets`
                                : `${targetReps} reps × ${totalSets} sets`}
                            {'\n'}{restSeconds}s rest between sets
                        </Text>

                        {/* AI Tip */}
                        {currentTip && (
                            <View style={styles.tipCard}>
                                <Text style={styles.tipLabel}>💡 AI Tip</Text>
                                <Text style={styles.tipText}>{currentTip}</Text>
                            </View>
                        )}

                        <Pressable style={styles.startButton} onPress={startCountdown}>
                            <LinearGradient
                                colors={['#8B5CF6', '#6366F1']}
                                style={styles.startButtonGradient}
                            >
                                <Text style={styles.startButtonText}>START</Text>
                            </LinearGradient>
                        </Pressable>
                    </View>
                )}

                {state === 'countdown' && (
                    <Animated.View style={styles.countdownContent}>
                        <Animated.Text style={styles.countdownNumber}>
                            {Math.round(countdownValue.value)}
                        </Animated.Text>
                        <Text style={styles.countdownText}>Get Ready...</Text>
                    </Animated.View>
                )}

                {state === 'active' && (
                    <Pressable style={styles.activeContent} onPress={countRep}>
                        <View style={styles.setIndicator}>
                            <Text style={styles.setLabel}>SET</Text>
                            <Text style={styles.setNumber}>{currentSet}/{totalSets}</Text>
                        </View>

                        <Animated.View style={[styles.repCounter, repAnimatedStyle]}>
                            <Text style={styles.repNumber}>{reps}</Text>
                            <Text style={styles.repLabel}>/ {targetReps}</Text>
                        </Animated.View>

                        <Text style={styles.tapHint}>Tap to count rep</Text>
                    </Pressable>
                )}

                {state === 'hold' && (
                    <View style={styles.holdContent}>
                        <View style={styles.setIndicator}>
                            <Text style={styles.setLabel}>SET</Text>
                            <Text style={styles.setNumber}>{currentSet}/{totalSets}</Text>
                        </View>

                        <Text style={styles.holdTimer}>{holdTimeRemaining}s</Text>
                        <Text style={styles.holdLabel}>HOLD</Text>

                        {/* Progress bar */}
                        <View style={styles.holdProgressContainer}>
                            <Animated.View style={[styles.holdProgressBar, holdProgressStyle]} />
                        </View>

                        <Text style={styles.holdHint}>Keep holding!</Text>
                    </View>
                )}

                {state === 'rest' && (
                    <View style={styles.restContent}>
                        <Text style={styles.restLabel}>Rest</Text>
                        <Text style={styles.restTimer}>{restTimeRemaining}s</Text>

                        {currentTip && (
                            <View style={styles.restTipCard}>
                                <Text style={styles.restTipText}>{currentTip}</Text>
                            </View>
                        )}

                        <Text style={styles.restHint}>
                            Next: Set {currentSet + 1}/{totalSets}
                        </Text>
                    </View>
                )}

                {state === 'complete' && (
                    <View style={styles.completeContent}>
                        <Text style={styles.completeEmoji}>🎉</Text>
                        <Text style={styles.completeTitle}>Workout Complete!</Text>
                        <View style={styles.summary}>
                            <Text style={styles.summaryText}>
                                {totalSets} sets × {selectedExercise?.type === 'hold'
                                    ? `${targetHoldSeconds}s holds`
                                    : `${targetReps} reps`}
                            </Text>
                            <Text style={styles.summaryTotal}>
                                {selectedExercise?.type === 'hold'
                                    ? `${totalSets} holds completed`
                                    : `Total: ${totalSets * targetReps} ${selectedExercise?.name || 'reps'}`}
                            </Text>
                        </View>

                        {currentTip && (
                            <View style={styles.completeTipCard}>
                                <Text style={styles.completeTipText}>{currentTip}</Text>
                            </View>
                        )}

                        <Pressable style={styles.doneButton} onPress={() => router.back()}>
                            <Text style={styles.doneButtonText}>Done</Text>
                        </Pressable>
                    </View>
                )}
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
    },
    backButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
    },
    backText: {
        fontSize: 32,
        color: '#fff',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
    },
    resetButton: {
        width: 60,
        alignItems: 'flex-end',
    },
    resetText: {
        fontSize: 14,
        color: '#8B5CF6',
        fontWeight: '600',
    },
    placeholder: {
        width: 60,
    },
    voiceToggle: {
        position: 'absolute',
        top: 60,
        right: 20,
        zIndex: 10,
        padding: 8,
    },
    voiceIcon: {
        fontSize: 24,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Exercise selection
    exerciseList: {
        flex: 1,
    },
    exerciseListContent: {
        padding: 20,
        gap: 12,
    },
    exerciseCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    cardPressed: {
        opacity: 0.7,
    },
    exerciseInfo: {
        flex: 1,
    },
    exerciseName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 4,
    },
    exerciseMeta: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.5)',
    },
    exerciseArrow: {
        fontSize: 18,
        color: 'rgba(255,255,255,0.3)',
    },

    // Idle state
    idleContent: {
        alignItems: 'center',
        gap: 20,
        paddingHorizontal: 24,
    },
    idleTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: '#fff',
    },
    idleSubtitle: {
        fontSize: 16,
        color: '#888',
        textAlign: 'center',
        lineHeight: 24,
    },
    tipCard: {
        backgroundColor: 'rgba(139, 92, 246, 0.15)',
        borderRadius: 16,
        padding: 16,
        width: '100%',
        borderLeftWidth: 3,
        borderLeftColor: '#8B5CF6',
    },
    tipLabel: {
        fontSize: 12,
        color: '#8B5CF6',
        fontWeight: '700',
        marginBottom: 6,
    },
    tipText: {
        fontSize: 15,
        color: 'rgba(255,255,255,0.8)',
        lineHeight: 22,
    },
    startButton: {
        borderRadius: 16,
        overflow: 'hidden',
        marginTop: 16,
    },
    startButtonGradient: {
        paddingHorizontal: 60,
        paddingVertical: 18,
    },
    startButtonText: {
        fontSize: 20,
        fontWeight: '900',
        color: '#fff',
        letterSpacing: 2,
    },

    // Countdown
    countdownContent: {
        alignItems: 'center',
    },
    countdownNumber: {
        fontSize: 120,
        fontWeight: '900',
        color: '#8B5CF6',
    },
    countdownText: {
        fontSize: 24,
        color: '#888',
        marginTop: 20,
    },

    // Active (rep counting)
    activeContent: {
        alignItems: 'center',
        width: '100%',
    },
    setIndicator: {
        alignItems: 'center',
        marginBottom: 60,
    },
    setLabel: {
        fontSize: 14,
        color: '#666',
        fontWeight: '700',
        letterSpacing: 2,
    },
    setNumber: {
        fontSize: 24,
        color: '#fff',
        fontWeight: '800',
        marginTop: 4,
    },
    repCounter: {
        alignItems: 'center',
    },
    repNumber: {
        fontSize: 140,
        fontWeight: '900',
        color: '#8B5CF6',
        lineHeight: 140,
    },
    repLabel: {
        fontSize: 32,
        color: '#666',
        fontWeight: '700',
    },
    tapHint: {
        fontSize: 16,
        color: '#555',
        marginTop: 60,
        fontWeight: '600',
    },

    // Hold mode
    holdContent: {
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 40,
    },
    holdTimer: {
        fontSize: 100,
        fontWeight: '900',
        color: '#F59E0B',
    },
    holdLabel: {
        fontSize: 20,
        color: '#666',
        fontWeight: '700',
        letterSpacing: 4,
        marginTop: 8,
    },
    holdProgressContainer: {
        width: '100%',
        height: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 4,
        marginTop: 40,
        overflow: 'hidden',
    },
    holdProgressBar: {
        height: '100%',
        backgroundColor: '#F59E0B',
        borderRadius: 4,
    },
    holdHint: {
        fontSize: 16,
        color: '#888',
        marginTop: 32,
        fontWeight: '600',
    },

    // Rest
    restContent: {
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    restLabel: {
        fontSize: 20,
        color: '#666',
        fontWeight: '700',
        letterSpacing: 2,
        marginBottom: 16,
    },
    restTimer: {
        fontSize: 100,
        fontWeight: '900',
        color: '#F59E0B',
    },
    restTipCard: {
        backgroundColor: 'rgba(245, 158, 11, 0.15)',
        borderRadius: 12,
        padding: 16,
        marginTop: 24,
        marginHorizontal: 20,
    },
    restTipText: {
        fontSize: 15,
        color: '#F59E0B',
        textAlign: 'center',
        lineHeight: 22,
    },
    restHint: {
        fontSize: 16,
        color: '#888',
        marginTop: 32,
    },

    // Complete
    completeContent: {
        alignItems: 'center',
        gap: 16,
        paddingHorizontal: 24,
    },
    completeEmoji: {
        fontSize: 80,
    },
    completeTitle: {
        fontSize: 32,
        fontWeight: '900',
        color: '#fff',
    },
    summary: {
        alignItems: 'center',
        gap: 8,
        marginVertical: 8,
    },
    summaryText: {
        fontSize: 18,
        color: '#888',
    },
    summaryTotal: {
        fontSize: 22,
        color: '#22C55E',
        fontWeight: '800',
    },
    completeTipCard: {
        backgroundColor: 'rgba(34, 197, 94, 0.15)',
        borderRadius: 12,
        padding: 16,
        marginTop: 8,
    },
    completeTipText: {
        fontSize: 15,
        color: '#22C55E',
        textAlign: 'center',
        lineHeight: 22,
    },
    doneButton: {
        backgroundColor: '#22C55E',
        paddingHorizontal: 60,
        paddingVertical: 16,
        borderRadius: 16,
        marginTop: 16,
    },
    doneButtonText: {
        fontSize: 18,
        fontWeight: '900',
        color: '#000',
    },
});
