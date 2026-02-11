// Live AI Coach - Gemini 3 Flash Integration
import { Keypoint, PushUpPose } from '@/types';
import { BlurView } from 'expo-blur';
import { useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import ViewShot, { captureRef } from 'react-native-view-shot';

// Pose & Exercise Analysis
import { Exercise, EXERCISES, getExerciseById } from '@/data/exercises';
import { useGymCoach } from '@/hooks/useGymCoach';
import { createExerciseAnalyzer, ExerciseAnalyzer, PoseData } from '@/services/pose/ExerciseAnalyzer';
import { usePushUpPoseProcessor } from '@/services/pose/PoseDetector.native';

// Native-only Skia imports
import { Canvas, Circle, Line, vec } from '@shopify/react-native-skia';
import { MediapipeCamera } from 'react-native-mediapipe-posedetection';

type CoachState = 'selecting' | 'ready' | 'detecting' | 'summary';

const { width, height } = Dimensions.get('window');

// ===========================================
// UI COMPONENTS
// ===========================================

function RepCounterHUD({ count, target, pulse }: { count: number; target: number; pulse: boolean }) {
    if (count === 0) return null;
    return (
        <View style={[styles.hudContainer, pulse && styles.hudPulse]}>
            <Text style={styles.hudCount}>{count}</Text>
            <Text style={styles.hudLabel}>/ {target}</Text>
        </View>
    );
}

function GhostOverlay({ pose, isError }: { pose: PushUpPose | null; isError: boolean }) {
    if (!pose || !isError) return null;

    // Simple "Ghost" is the user's current pose but RED to indicate error/correction needed
    // In a future update, we could calculate the "Ideal" coordinates.
    return (
        <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
            {/* Draw Red Warning Skeleton */}
            <SkeletonLine start={pose.leftShoulder} end={pose.rightShoulder} error />
            <SkeletonLine start={pose.leftShoulder} end={pose.leftHip} error />
            <SkeletonLine start={pose.rightShoulder} end={pose.rightHip} error />
            <SkeletonLine start={pose.leftHip} end={pose.rightHip} error />
            <SkeletonLine start={pose.leftHip} end={pose.leftKnee} error />
            <SkeletonLine start={pose.rightHip} end={pose.rightKnee} error />
        </Canvas>
    );
}

// Native Camera Component with ViewShot for Frame Capture
function NativeCameraView({
    isDetecting,
    onPoseDetected,
    viewShotRef
}: {
    isDetecting: boolean;
    onPoseDetected: (pose: PushUpPose) => void;
    viewShotRef: React.RefObject<any>;
}) {
    const [latestPose, setLatestPose] = useState<PushUpPose | null>(null);

    // Wrapper to update local state for drawing
    const onPose = useCallback((pose: PushUpPose) => {
        if (isDetecting) {
            setLatestPose(pose);
            onPoseDetected(pose);
        }
    }, [isDetecting, onPoseDetected]);

    const solution = usePushUpPoseProcessor(onPose);

    return (
        <ViewShot ref={viewShotRef} options={{ format: 'jpg', quality: 0.5, result: 'base64' }} style={StyleSheet.absoluteFillObject}>
            <View style={StyleSheet.absoluteFill}>
                <MediapipeCamera
                    style={StyleSheet.absoluteFill}
                    solution={solution}
                    activeCamera="front"
                    resizeMode="cover"
                />

                {/* Main Skeleton Overlay */}
                <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
                    {latestPose && isDetecting && (
                        <>
                            <SkeletonLine start={latestPose.leftShoulder} end={latestPose.rightShoulder} />
                            <SkeletonLine start={latestPose.leftShoulder} end={latestPose.leftElbow} />
                            <SkeletonLine start={latestPose.leftElbow} end={latestPose.leftWrist} />
                            <SkeletonLine start={latestPose.rightShoulder} end={latestPose.rightElbow} />
                            <SkeletonLine start={latestPose.rightElbow} end={latestPose.rightWrist} />
                            <SkeletonLine start={latestPose.leftShoulder} end={latestPose.leftHip} />
                            <SkeletonLine start={latestPose.rightShoulder} end={latestPose.rightHip} />
                            <SkeletonLine start={latestPose.leftHip} end={latestPose.rightHip} />
                            <SkeletonLine start={latestPose.leftHip} end={latestPose.leftKnee} />
                            <SkeletonLine start={latestPose.leftKnee} end={latestPose.leftAnkle} />
                            <SkeletonLine start={latestPose.rightHip} end={latestPose.rightKnee} />
                            <SkeletonLine start={latestPose.rightKnee} end={latestPose.rightAnkle} />

                            <SkeletonPoint point={latestPose.nose} />
                            <SkeletonPoint point={latestPose.leftWrist} />
                            <SkeletonPoint point={latestPose.rightWrist} />
                            <SkeletonPoint point={latestPose.leftAnkle} />
                            <SkeletonPoint point={latestPose.rightAnkle} />
                        </>
                    )}
                </Canvas>
            </View>
        </ViewShot>
    );
}

const SkeletonLine = ({ start, end, error }: { start: Keypoint; end: Keypoint; error?: boolean }) => {
    if (start.confidence < 0.2 || end.confidence < 0.2) return null;
    return (
        <Line
            p1={vec(start.x, start.y)}
            p2={vec(end.x, end.y)}
            color={error ? "rgba(255, 0, 0, 0.6)" : "#00ff00"}
            strokeWidth={error ? 6 : 4}
            style="stroke"
            strokeCap="round"
        />
    );
};

const SkeletonPoint = ({ point }: { point: Keypoint }) => {
    if (point.confidence < 0.2) return null;
    return (
        <Circle cx={point.x} cy={point.y} r={6} color="#00ff00" />
    );
};

export default function CoachMode() {
    const router = useRouter();
    const { exerciseId: paramExerciseId } = useLocalSearchParams<{ exerciseId?: string }>();
    const [permission, requestPermission] = useCameraPermissions();

    // Hooks
    const { analyzeForm, generateSessionSummary, getExerciseTip, isThinking, aiRateDisplay } = useGymCoach();

    // State
    const viewShotRef = useRef<ViewShot>(null);
    const [coachState, setCoachState] = useState<CoachState>('selecting');
    const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
    const [isDetecting, setIsDetecting] = useState(false);

    // Live Workout Data
    const [repCount, setRepCount] = useState(0);
    const [aiCoaching, setAiCoaching] = useState<string>('');
    const [lastFeedbackError, setLastFeedbackError] = useState(false); // Validates if feedback was "Bad"
    const [repPulse, setRepPulse] = useState(false);

    // Goal & Completion
    const [targetReps, setTargetReps] = useState(10);
    const [isGoalReached, setIsGoalReached] = useState(false);

    // Session Data
    const sessionStartRef = useRef<number>(0);
    const repLogsRef = useRef<any[]>([]); // Logging reps for summary
    const [summaryData, setSummaryData] = useState<any>(null);

    // Analysis
    const [currentPose, setCurrentPose] = useState<PushUpPose | null>(null);
    const analyzerRef = useRef<ExerciseAnalyzer | null>(null);
    const frameSkipRef = useRef(0);

    // Initial Load
    useEffect(() => {
        if (paramExerciseId) {
            const ex = getExerciseById(paramExerciseId);
            if (ex) {
                handleSelectExercise(ex);
            }
        }
    }, [paramExerciseId]);

    // Cleanup Speech
    useEffect(() => {
        return () => { Speech.stop(); };
    }, []);

    const handleSelectExercise = (ex: Exercise) => {
        setSelectedExercise(ex);
        setTargetReps(ex.defaultReps || 10);
        analyzerRef.current = createExerciseAnalyzer(ex.id);
        setCoachState('ready');
        // Fetch Tip
        getExerciseTip(ex).then(tip => setAiCoaching(tip));
        Speech.speak(`Ready for ${ex.name}. Position yourself.`, { rate: 1.0 });
    };

    const startWorkout = () => {
        setIsDetecting(true);
        setCoachState('detecting');
        setRepCount(0);
        setIsGoalReached(false);
        sessionStartRef.current = Date.now();
        setAiCoaching("Let's go!");
        Speech.speak("Starting. Let's go!", { rate: 1.1 });
        repLogsRef.current = [];
    };

    const continueWorkout = () => {
        setIsGoalReached(false);
        setAiCoaching("Keep pushing!");
        Speech.speak("Continuing. Keep pushing!", { rate: 1.1 });
    };

    const finishWorkout = async () => {
        setIsDetecting(false);
        setCoachState('summary');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Speech.speak("Workout complete. Analyzing performance.", { rate: 1.0 });

        // Generate Summary
        if (selectedExercise) {
            const stats = {
                totalReps: repCount,
                averageFormScore: 85, // Placeholder
            };

            setAiCoaching("Generating Coach's Grade...");
            const result = await generateSessionSummary(selectedExercise, stats, repLogsRef.current);
            setSummaryData(result);
            Speech.speak(`Grade ${result.grade}. ${result.tip}`, { rate: 1.0 });
        }
    };

    // Main Loop
    const lastCaptureTime = useRef(0);

    const handlePoseDetected = useCallback(async (pose: PushUpPose) => {
        setCurrentPose(pose);

        if (!isDetecting || !selectedExercise || !analyzerRef.current) return;

        // 1. Rep Counting (Runs every few frames for performance)
        frameSkipRef.current += 1;
        if (frameSkipRef.current % 3 !== 0) return;

        const pd: PoseData = {
            landmarks: pose as any,
            timestamp: Date.now()
        };

        const analysis = analyzerRef.current.analyze(pd);

        if (analysis.repCompleted) {
            const newCount = analyzerRef.current.getSessionStats().repCount;

            // CRITICAL: Stop counting if goal reached and not continued
            if (!isGoalReached && newCount > repCount) {
                setRepCount(newCount);
                setRepPulse(true);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

                // 🗣️ Speak Rep Count
                Speech.speak(newCount.toString(), {
                    rate: 1.2,
                    pitch: 1.1
                });

                setTimeout(() => setRepPulse(false), 500);

                // Log Rep
                repLogsRef.current.push({ time: Date.now(), score: analysis.formScore });

                // Check Goal
                if (newCount >= targetReps) {
                    setIsGoalReached(true);
                    Speech.speak("Goal reached! Great job.", { rate: 1.0 });
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                }
            }
        }

        // 2. Gemini Vision Analysis (Time-based Throttle)
        const now = Date.now();
        if (now - lastCaptureTime.current > 1500) {
            // Debug Log to confirm loop is alive
            // console.log(`🔍 AI Loop Alive. Thinking: ${isThinking}, Goal: ${isGoalReached}`);

            if (!isThinking && viewShotRef.current && !isGoalReached) {
                lastCaptureTime.current = now;
                console.log("📸 Triggering Capture...");

                try {
                    const uri = await captureRef(viewShotRef as any, { format: 'jpg', quality: 0.5, result: 'base64' });
                    const feedback = await analyzeForm(uri, selectedExercise, repCount);

                    if (feedback) {
                        setAiCoaching(feedback);
                        setLastFeedbackError(!feedback.toLowerCase().includes('good') && !feedback.toLowerCase().includes('nice'));
                    }
                } catch (e) {
                    console.error("❌ Capture failed:", e);
                }
            }
        }

    }, [isDetecting, selectedExercise, repCount, isThinking, analyzeForm, isGoalReached, targetReps]);

    // Render
    if (!permission?.granted) {
        return <View style={styles.center}><Text style={styles.text}>Camera permission needed</Text><Pressable onPress={requestPermission}><Text style={styles.btnText}>Grant</Text></Pressable></View>;
    }

    return (
        <View style={styles.container}>
            {/* Camera Feed - DISABLED during selection AND summary */}
            {Platform.OS !== 'web' && (coachState === 'ready' || coachState === 'detecting') && (
                <NativeCameraView
                    isDetecting={true}
                    onPoseDetected={handlePoseDetected}
                    viewShotRef={viewShotRef}
                />
            )}

            {/* Ghost Overlay for Errors */}
            {isDetecting && lastFeedbackError && (
                <GhostOverlay pose={currentPose} isError={true} />
            )}

            {/* Main UI Layer */}
            {coachState === 'selecting' ? (
                /* 1. SELECTION SCREEN (Timer Style) */
                <LinearGradient colors={['#0F0F1A', '#1A1A2E']} style={StyleSheet.absoluteFill}>
                    <View style={styles.header}>
                        <Pressable onPress={() => router.back()} style={styles.backButton}>
                            <Text style={styles.backText}>←</Text>
                        </Pressable>
                        <Text style={styles.headerTitle}>AI Coach</Text>
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
                                onPress={() => handleSelectExercise(exercise)}
                            >
                                <View style={styles.exerciseInfo}>
                                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                                    <Text style={styles.exerciseMeta}>
                                        {exercise.bodyParts.join(', ')} • {exercise.defaultReps || 10} reps
                                    </Text>
                                </View>
                                <Text style={styles.exerciseArrow}>→</Text>
                            </Pressable>
                        ))}
                        <View style={{ height: 100 }} />
                    </ScrollView>
                </LinearGradient>
            ) : (
                /* 2. ACTIVE COACH UI */
                <View style={styles.uiOverlay}>
                    {/* Header / Top Bar */}
                    <View style={styles.topBar}>
                        <Pressable onPress={() => router.back()} style={styles.backBtn}>
                            <Text style={styles.backText}>✕</Text>
                        </Pressable>
                        <View style={styles.pill}>
                            <Text style={styles.pillText}>{selectedExercise?.name}</Text>
                        </View>
                        <View style={[styles.statePill, aiRateDisplay === 'Not Configured' && styles.errorPill]}>
                            <View style={[styles.dot, isThinking && styles.dotActive]} />
                            <Text style={styles.pillText}>{aiRateDisplay === 'Not Configured' ? 'AI OFF' : aiRateDisplay}</Text>
                        </View>
                    </View>

                    {/* Ready State */}
                    {coachState === 'ready' && (
                        <View style={styles.centerOverlay}>
                            <Text style={styles.bigText}>Ready?</Text>
                            <Text style={styles.subText}>{aiCoaching}</Text>
                            <Pressable onPress={startWorkout} style={styles.startBtn}>
                                <Text style={styles.startBtnText}>START</Text>
                            </Pressable>
                            <Pressable onPress={() => setCoachState('selecting')} style={styles.changeBtn}>
                                <Text style={styles.changeBtnText}>Change Exercise</Text>
                            </Pressable>
                        </View>
                    )}

                    {/* Detecting State */}
                    {coachState === 'detecting' && (
                        <>
                            <View style={styles.coachingBox}>
                                <Text style={styles.coachingText}>{aiCoaching}</Text>
                                {isThinking && <Text style={styles.thinkingText}>Analyzing...</Text>}
                            </View>

                            <RepCounterHUD count={repCount} target={targetReps} pulse={repPulse} />

                            {isGoalReached && (
                                <View style={styles.goalOverlay}>
                                    <Text style={styles.goalTitle}>🎉 Goal Reached! 🎉</Text>
                                    <View style={styles.goalButtons}>
                                        <Pressable onPress={continueWorkout} style={styles.continueBtn}>
                                            <Text style={styles.continueBtnText}>Continue</Text>
                                        </Pressable>
                                        <Pressable onPress={finishWorkout} style={styles.finishBtn}>
                                            <Text style={styles.finishBtnText}>Finish</Text>
                                        </Pressable>
                                    </View>
                                </View>
                            )}

                            {/* Safe Area for Finish Button */}
                            {!isGoalReached && (
                                <Pressable onPress={finishWorkout} style={styles.stopBtn}>
                                    <Text style={styles.stopBtnText}>FINISH</Text>
                                </Pressable>
                            )}
                        </>
                    )}

                    {/* Summary State */}
                    {coachState === 'summary' && (
                        <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill}>
                            {summaryData ? (
                                <View style={styles.summaryBox}>
                                    <Text style={styles.gradeTitle}>Coach's Grade</Text>
                                    <Text style={styles.gradeScore}>{summaryData.grade}</Text>
                                    <Text style={styles.summaryText}>{summaryData.tip}</Text>
                                    <Pressable onPress={() => router.back()} style={styles.doneBtn}>
                                        <Text style={styles.doneBtnText}>Done</Text>
                                    </Pressable>
                                </View>
                            ) : (
                                <View style={styles.center}>
                                    <ActivityIndicator size="large" color="#00ff00" />
                                    <Text style={[styles.text, { marginTop: 20, fontSize: 18 }]}>Analyzing Performance...</Text>
                                    <Text style={{ color: '#aaa', marginTop: 10 }}>This may take a moment</Text>
                                </View>
                            )}
                        </BlurView>
                    )}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    text: { color: '#fff' },
    btnText: { color: '#0f0', marginTop: 10 },

    // Header Styles (Copied from Timer)
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
    backButton: { width: 44, height: 44, justifyContent: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
    placeholder: { width: 44 },

    // List Styles
    exerciseList: { flex: 1 },
    exerciseListContent: { padding: 20, gap: 12 },
    exerciseCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    cardPressed: { opacity: 0.7 },
    exerciseInfo: { flex: 1 },
    exerciseName: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 4 },
    exerciseMeta: { fontSize: 13, color: 'rgba(255,255,255,0.5)' },
    exerciseArrow: { fontSize: 18, color: 'rgba(255,255,255,0.3)' },

    // Coach UI
    uiOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, padding: 20, justifyContent: 'space-between' },
    topBar: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 40 },
    backBtn: { padding: 10, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20 },
    backText: { color: '#fff', fontSize: 18 },
    pill: { backgroundColor: 'rgba(50,50,50,0.8)', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
    statePill: { backgroundColor: 'rgba(50,50,50,0.8)', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 6 },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#666' },
    dotActive: { backgroundColor: '#00ff00' },
    pillText: { color: '#fff', fontWeight: 'bold' },
    errorPill: { backgroundColor: 'rgba(255,50,50,0.8)' },

    centerOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },
    bigText: { fontSize: 40, fontWeight: '900', color: '#fff', marginBottom: 10 },
    subText: { fontSize: 18, color: '#ccc', marginBottom: 30, textAlign: 'center', width: '80%' },
    startBtn: { backgroundColor: '#00ff00', paddingHorizontal: 40, paddingVertical: 15, borderRadius: 30 },
    startBtnText: { color: '#000', fontWeight: 'bold', fontSize: 20 },
    changeBtn: { marginTop: 20 },
    changeBtnText: { color: '#aaa', textDecorationLine: 'underline' },

    coachingBox: { position: 'absolute', bottom: 140, alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.8)', padding: 20, borderRadius: 15, width: '90%', borderWidth: 1, borderColor: '#333' },
    coachingText: { color: '#fff', fontSize: 22, fontWeight: 'bold', textAlign: 'center' },
    thinkingText: { color: '#aaa', fontSize: 12, textAlign: 'center', marginTop: 5 },

    hudContainer: { position: 'absolute', top: 150, alignSelf: 'center', alignItems: 'center' },
    hudCount: { fontSize: 120, fontWeight: '900', color: 'rgba(255,255,255,0.9)' },
    hudLabel: { fontSize: 24, color: '#aaa' },
    hudPulse: { transform: [{ scale: 1.2 }] },

    stopBtn: { position: 'absolute', bottom: 60, alignSelf: 'center', backgroundColor: '#ff3333', paddingHorizontal: 30, paddingVertical: 14, borderRadius: 25, zIndex: 100 },
    stopBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

    summaryBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
    gradeTitle: { fontSize: 24, color: '#fff', marginBottom: 10 },
    gradeScore: { fontSize: 100, fontWeight: '900', color: '#00ff00', marginBottom: 20 },
    summaryText: { fontSize: 18, color: '#fff', textAlign: 'center', marginBottom: 40 },
    doneBtn: { backgroundColor: '#fff', paddingHorizontal: 60, paddingVertical: 18, borderRadius: 30 },
    doneBtnText: { color: '#000', fontWeight: 'bold', fontSize: 18 },

    // Goal UI
    goalOverlay: {
        position: 'absolute', top: '35%', alignSelf: 'center',
        backgroundColor: 'rgba(20,20,30,0.95)', padding: 30, borderRadius: 24, alignItems: 'center',
        borderColor: '#00ff00', borderWidth: 2, zIndex: 200, width: '90%'
    },
    goalTitle: { fontSize: 28, color: '#fff', fontWeight: 'bold', marginBottom: 30 },
    goalButtons: { flexDirection: 'row', gap: 15, width: '100%', justifyContent: 'center' },
    continueBtn: { backgroundColor: '#333', paddingHorizontal: 25, paddingVertical: 15, borderRadius: 15, flex: 1, alignItems: 'center' },
    continueBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    finishBtn: { backgroundColor: '#00ff00', paddingHorizontal: 25, paddingVertical: 15, borderRadius: 15, flex: 1, alignItems: 'center' },
    finishBtnText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
});
