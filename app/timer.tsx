import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    withSequence,
    Easing,
    runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

type TimerState = 'idle' | 'countdown' | 'active' | 'rest' | 'complete';

export default function TimerMode() {
    const router = useRouter();

    // Timer settings
    const [targetReps] = useState(10);
    const [totalSets] = useState(3);
    const [restSeconds] = useState(60);

    // State
    const [state, setState] = useState<TimerState>('idle');
    const [currentSet, setCurrentSet] = useState(1);
    const [reps, setReps] = useState(0);
    const [restTimeRemaining, setRestTimeRemaining] = useState(restSeconds);

    // Animations
    const scale = useSharedValue(1);
    const countdownValue = useSharedValue(3);
    const repScale = useSharedValue(1);

    // Start countdown
    const startCountdown = () => {
        setState('countdown');
        countdownValue.value = 3;

        const countdown = (n: number) => {
            if (n === 0) {
                runOnJS(setState)('active');
                runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Heavy);
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

        // Check if set complete
        if (newReps >= targetReps) {
            if (currentSet >= totalSets) {
                // Workout complete!
                setState('complete');
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } else {
                // Start rest period
                startRest();
            }
        }
    };

    // Start rest period
    const startRest = () => {
        setState('rest');
        setRestTimeRemaining(restSeconds);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        const restTimer = setInterval(() => {
            setRestTimeRemaining(prev => {
                if (prev <= 1) {
                    clearInterval(restTimer);
                    runOnJS(startNextSet)();
                    return 0;
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

    // Reset everything
    const reset = () => {
        setState('idle');
        setCurrentSet(1);
        setReps(0);
        setRestTimeRemaining(restSeconds);
    };

    const repAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: repScale.value }]
    }));

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backText}>←</Text>
                </Pressable>
                <Text style={styles.headerTitle}>Quick Timer</Text>
                <Pressable onPress={reset} style={styles.resetButton}>
                    <Text style={styles.resetText}>Reset</Text>
                </Pressable>
            </View>

            {/* Main Content */}
            <View style={styles.content}>
                {state === 'idle' && (
                    <View style={styles.idleContent}>
                        <Text style={styles.idleTitle}>Ready for Push-Ups?</Text>
                        <Text style={styles.idleSubtitle}>
                            {targetReps} reps × {totalSets} sets{'\n'}
                            {restSeconds}s rest between sets
                        </Text>
                        <Pressable
                            style={styles.startButton}
                            onPress={startCountdown}
                        >
                            <Text style={styles.startButtonText}>START</Text>
                        </Pressable>
                    </View>
                )}

                {state === 'countdown' && (
                    <Animated.View style={styles.countdownContent}>
                        <Animated.Text style={[styles.countdownNumber]}>
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

                {state === 'rest' && (
                    <View style={styles.restContent}>
                        <Text style={styles.restLabel}>Rest</Text>
                        <Text style={styles.restTimer}>{restTimeRemaining}s</Text>
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
                                {totalSets} sets × {targetReps} reps
                            </Text>
                            <Text style={styles.summaryTotal}>
                                Total: {totalSets * targetReps} push-ups
                            </Text>
                        </View>
                        <Pressable
                            style={styles.doneButton}
                            onPress={() => router.back()}
                        >
                            <Text style={styles.doneButtonText}>Done</Text>
                        </Pressable>
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
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
    },
    resetText: {
        fontSize: 14,
        color: '#00aaff',
        fontWeight: '600',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    idleContent: {
        alignItems: 'center',
        gap: 24,
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
    startButton: {
        backgroundColor: '#00aaff',
        paddingHorizontal: 60,
        paddingVertical: 20,
        borderRadius: 16,
        marginTop: 20,
    },
    startButtonText: {
        fontSize: 20,
        fontWeight: '900',
        color: '#000',
        letterSpacing: 2,
    },
    countdownContent: {
        alignItems: 'center',
    },
    countdownNumber: {
        fontSize: 120,
        fontWeight: '900',
        color: '#00aaff',
    },
    countdownText: {
        fontSize: 24,
        color: '#888',
        marginTop: 20,
    },
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
        color: '#00aaff',
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
    restContent: {
        alignItems: 'center',
    },
    restLabel: {
        fontSize: 20,
        color: '#666',
        fontWeight: '700',
        letterSpacing: 2,
        marginBottom: 20,
    },
    restTimer: {
        fontSize: 100,
        fontWeight: '900',
        color: '#ffaa00',
    },
    restHint: {
        fontSize: 16,
        color: '#888',
        marginTop: 40,
    },
    completeContent: {
        alignItems: 'center',
        gap: 20,
    },
    completeEmoji: {
        fontSize: 80,
    },
    completeTitle: {
        fontSize: 36,
        fontWeight: '900',
        color: '#fff',
    },
    summary: {
        alignItems: 'center',
        gap: 8,
        marginVertical: 20,
    },
    summaryText: {
        fontSize: 18,
        color: '#888',
    },
    summaryTotal: {
        fontSize: 24,
        color: '#00ff88',
        fontWeight: '800',
    },
    doneButton: {
        backgroundColor: '#00ff88',
        paddingHorizontal: 60,
        paddingVertical: 16,
        borderRadius: 16,
        marginTop: 20,
    },
    doneButtonText: {
        fontSize: 18,
        fontWeight: '900',
        color: '#000',
    },
});
