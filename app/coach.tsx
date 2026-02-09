// Live AI Coach - Gemini 3 Flash Integration
import { Keypoint, PushUpPose } from '@/types';
import { BlurView } from 'expo-blur';
import { useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import ViewShot, { captureRef } from 'react-native-view-shot';

// Pose & Exercise Analysis
import { Exercise, getExerciseById } from '@/data/exercises';
import { useGymCoach } from '@/hooks/useGymCoach';
import { createExerciseAnalyzer, ExerciseAnalyzer, PoseData } from '@/services/pose/ExerciseAnalyzer';
import { usePushUpPoseProcessor } from '@/services/pose/PoseDetector.native';

// Native-only Skia imports
import { Canvas, Circle, Line, vec } from '@shopify/react-native-skia';
import { MediapipeCamera } from 'react-native-mediapipe-posedetection';

type CoachState = 'selecting' | 'ready' | 'detecting' | 'summary';

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

    // Session Data
    const sessionStartRef = useRef<number>(0);
    const repLogsRef = useRef<any[]>([]); // Logging reps for summary
    const [showSummary, setShowSummary] = useState(false);
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
                setSelectedExercise(ex);
                analyzerRef.current = createExerciseAnalyzer(ex.id);
                setCoachState('ready');

                // Fetch Tip
                getExerciseTip(ex).then(tip => setAiCoaching(tip));
                Speech.speak(`Ready for ${ex.name}. Position yourself.`, { rate: 1.0 });
            }
        }
    }, [paramExerciseId]);

    // Cleanup Speech
    useEffect(() => {
        return () => { Speech.stop(); };
    }, []);

    const startWorkout = () => {
        setIsDetecting(true);
        setCoachState('detecting');
        setRepCount(0);
        sessionStartRef.current = Date.now();
        setAiCoaching("Let's go!");
        repLogsRef.current = [];
    };

    const finishWorkout = async () => {
        setIsDetecting(false);
        setCoachState('summary');

        // Generate Summary
        if (selectedExercise) {
            const duration = (Date.now() - sessionStartRef.current) / 1000;
            const stats = {
                totalReps: repCount,
                averageFormScore: 85, // Placeholder, normally calculated from analyzer
            };

            setAiCoaching("Generating Coach's Grade...");
            const result = await generateSessionSummary(selectedExercise, stats, repLogsRef.current);
            setSummaryData(result);

            // Save (Placeholder for storage service)
            // storageService.saveSession({...})
        }
    };

    // Main Loop
    const handlePoseDetected = useCallback(async (pose: PushUpPose) => {
        setCurrentPose(pose);

        if (!isDetecting || !selectedExercise || !analyzerRef.current) return;

        // 1. Rep Counting (Mediapipe / Analyzer)
        // Skip frames for cleaner analysis logic
        if (frameSkipRef.current++ % 3 !== 0) return;

        const pd: PoseData = {
            landmarks: pose as any, // Quick cast logic, would map fields in real impl
            timestamp: Date.now()
        };
        // Reuse existing analyzer logic for reliable counting
        const analysis = analyzerRef.current.analyze(pd);

        if (analysis.repCompleted) {
            const newCount = analyzerRef.current.getSessionStats().repCount;
            if (newCount > repCount) {
                setRepCount(newCount);
                setRepPulse(true);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                setTimeout(() => setRepPulse(false), 500);

                // Log Rep
                repLogsRef.current.push({ time: Date.now(), score: analysis.formScore });
            }
        }

        // 2. Gemini Vision Analysis (Throttled 1.5s)
        if (!isThinking && viewShotRef.current && (frameSkipRef.current % 15 === 0)) { // ~Once every 0.5-1s check triggers
            // Determine if we should analyze (e.g. if user is moving or in specific phase)
            // For "Live Coach", we just try to analyze periodically
            try {
                const uri = await captureRef(viewShotRef as any, { format: 'jpg', quality: 0.5, result: 'base64' });
                const feedback = await analyzeForm(uri, selectedExercise, repCount);

                if (feedback) {
                    setAiCoaching(feedback);
                    setLastFeedbackError(!feedback.toLowerCase().includes('good') && !feedback.toLowerCase().includes('nice'));
                }
            } catch (e) {
                // console.error("Capture failed", e);
            }
        }

    }, [isDetecting, selectedExercise, repCount, isThinking, analyzeForm]);

    // Render
    if (!permission?.granted) {
        return <View style={styles.center}><Text style={styles.text}>Camera permission needed</Text><Pressable onPress={requestPermission}><Text style={styles.btnText}>Grant</Text></Pressable></View>;
    }

    return (
        <View style={styles.container}>
            {/* Camera Feed */}
            {Platform.OS !== 'web' && (
                <NativeCameraView
                    isDetecting={true} // Always run detection to show skeleton in ready state too
                    onPoseDetected={handlePoseDetected}
                    viewShotRef={viewShotRef}
                />
            )}

            {/* Ghost Overlay for Errors */}
            {isDetecting && lastFeedbackError && (
                <GhostOverlay pose={currentPose} isError={true} />
            )}

            {/* UI Overlay */}
            <View style={styles.uiOverlay}>
                {/* Header / Top Bar */}
                <View style={styles.topBar}>
                    <Pressable onPress={() => router.back()} style={styles.backBtn}>
                        <Text style={styles.backText}>✕</Text>
                    </Pressable>
                    <View style={styles.pill}>
                        <Text style={styles.pillText}>{selectedExercise?.name || 'Loading...'}</Text>
                    </View>
                    <View style={styles.statePill}>
                        <View style={[styles.dot, isThinking && styles.dotActive]} />
                        <Text style={styles.pillText}>{aiRateDisplay}</Text>
                    </View>
                </View>

                {/* Main Content Areas */}
                {coachState === 'ready' && (
                    <View style={styles.centerOverlay}>
                        <Text style={styles.bigText}>Ready?</Text>
                        <Text style={styles.subText}>{aiCoaching}</Text>
                        <Pressable onPress={startWorkout} style={styles.startBtn}>
                            <Text style={styles.startBtnText}>START</Text>
                        </Pressable>
                    </View>
                )}

                {coachState === 'detecting' && (
                    <>
                        <View style={styles.coachingBox}>
                            <Text style={styles.coachingText}>{aiCoaching}</Text>
                            {isThinking && <Text style={styles.thinkingText}>Analyzing...</Text>}
                        </View>

                        <RepCounterHUD count={repCount} target={10} pulse={repPulse} />

                        <Pressable onPress={finishWorkout} style={styles.stopBtn}>
                            <Text style={styles.stopBtnText}>FINISH</Text>
                        </Pressable>
                    </>
                )}

                {coachState === 'summary' && summaryData && (
                    <BlurView intensity={80} style={StyleSheet.absoluteFill}>
                        <View style={styles.summaryBox}>
                            <Text style={styles.gradeTitle}>Coach's Grade</Text>
                            <Text style={styles.gradeScore}>{summaryData.grade}</Text>
                            <Text style={styles.summaryText}>{summaryData.tip}</Text>
                            <Pressable onPress={() => router.back()} style={styles.doneBtn}>
                                <Text style={styles.doneBtnText}>Done</Text>
                            </Pressable>
                        </View>
                    </BlurView>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    text: { color: '#fff' },
    btnText: { color: '#0f0', marginTop: 10 },
    uiOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, padding: 20, justifyContent: 'space-between' },
    topBar: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 40 },
    backBtn: { padding: 10, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20 },
    backText: { color: '#fff', fontSize: 18 },
    pill: { backgroundColor: 'rgba(50,50,50,0.8)', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
    statePill: {
        backgroundColor: 'rgba(50,50,50,0.8)',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6
    },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#666' },
    dotActive: { backgroundColor: '#00ff00' },
    pillText: { color: '#fff', fontWeight: 'bold' },

    centerOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },
    bigText: { fontSize: 40, fontWeight: '900', color: '#fff', marginBottom: 10 },
    subText: { fontSize: 18, color: '#ccc', marginBottom: 30, textAlign: 'center', width: '80%' },
    startBtn: { backgroundColor: '#00ff00', paddingHorizontal: 40, paddingVertical: 15, borderRadius: 30 },
    startBtnText: { color: '#000', fontWeight: 'bold', fontSize: 20 },

    coachingBox: { position: 'absolute', bottom: 120, alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.7)', padding: 20, borderRadius: 15, width: '90%' },
    coachingText: { color: '#fff', fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
    thinkingText: { color: '#aaa', fontSize: 12, textAlign: 'center', marginTop: 5 },

    hudContainer: { position: 'absolute', top: 150, alignSelf: 'center', alignItems: 'center' },
    hudCount: { fontSize: 120, fontWeight: '900', color: 'rgba(255,255,255,0.9)' },
    hudLabel: { fontSize: 24, color: '#aaa' },
    hudPulse: { transform: [{ scale: 1.2 }] },

    stopBtn: { position: 'absolute', bottom: 40, alignSelf: 'center', backgroundColor: '#ff3333', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 25 },
    stopBtnText: { color: '#fff', fontWeight: 'bold' },

    summaryBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
    gradeTitle: { fontSize: 24, color: '#fff', marginBottom: 10 },
    gradeScore: { fontSize: 100, fontWeight: '900', color: '#00ff00', marginBottom: 20 },
    summaryText: { fontSize: 18, color: '#fff', textAlign: 'center', marginBottom: 40 },
    doneBtn: { backgroundColor: '#fff', paddingHorizontal: 40, paddingVertical: 15, borderRadius: 30 },
    doneBtnText: { color: '#000', fontWeight: 'bold' },
});
