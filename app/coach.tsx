// Enhanced AI Coach - Works with any exercise
import { Keypoint, PushUpPose } from '@/types';
import { CameraType, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

// Pose & Exercise Analysis
import { Exercise, EXERCISES, getExerciseById } from '@/data/exercises';
import { geminiService } from '@/services/ai/GeminiService';
import { createExerciseAnalyzer, ExerciseAnalyzer, PoseData } from '@/services/pose/ExerciseAnalyzer';
import { usePushUpPoseProcessor } from '@/services/pose/PoseDetector.native';
import { storageService, UserPreferences } from '@/services/storage/StorageService';

// Native-only Skia imports
import { Canvas, Circle, Line, vec } from '@shopify/react-native-skia';
import { MediapipeCamera } from 'react-native-mediapipe-posedetection';

type CoachState = 'selecting' | 'ready' | 'detecting' | 'summary';

// Debug status component
function DebugOverlay({
    status,
    poseData
}: {
    status: string;
    poseData: { keypoints: number; confidence: number } | null;
}) {
    // Only render debug overlay for Web or if explicitly enabled
    if (Platform.OS !== 'web') return null;

    return (
        <div style={{
            position: 'absolute',
            top: 80,
            left: 10,
            backgroundColor: 'rgba(0,0,0,0.8)',
            color: '#0f0',
            padding: 10,
            borderRadius: 8,
            fontSize: 12,
            fontFamily: 'monospace',
            zIndex: 100,
            maxWidth: 200,
        }}>
            <div>Status: {status}</div>
            {poseData && (
                <>
                    <div>Keypoints: {poseData.keypoints}/13</div>
                    <div>Confidence: {(poseData.confidence * 100).toFixed(0)}%</div>
                </>
            )}
        </div>
    );
}

// Native Camera Component with MediaPipe Pose Detection
function NativeCameraView({
    isDetecting,
    onPoseDetected
}: {
    isDetecting: boolean;
    onPoseDetected: (pose: PushUpPose) => void;
}) {
    const [latestPose, setLatestPose] = useState<PushUpPose | null>(null);

    // Wrapper to update local state for drawing
    const onPose = useCallback((pose: PushUpPose) => {
        if (isDetecting) {
            setLatestPose(pose);
            onPoseDetected(pose);
        }
    }, [isDetecting, onPoseDetected]);

    // Use MediaPipe pose detection solution
    const solution = usePushUpPoseProcessor(onPose);

    return (
        <View style={StyleSheet.absoluteFill}>
            <MediapipeCamera
                style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                solution={solution}
                activeCamera="front"
            />

            {/* Skia Overlay */}
            <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
                {latestPose && isDetecting && (
                    <>
                        {/* Skeleton Lines */}
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

                        {/* Keypoints */}
                        <SkeletonPoint point={latestPose.nose} />
                        <SkeletonPoint point={latestPose.leftShoulder} />
                        <SkeletonPoint point={latestPose.rightShoulder} />
                        <SkeletonPoint point={latestPose.leftElbow} />
                        <SkeletonPoint point={latestPose.rightElbow} />
                        <SkeletonPoint point={latestPose.leftWrist} />
                        <SkeletonPoint point={latestPose.rightWrist} />
                        <SkeletonPoint point={latestPose.leftHip} />
                        <SkeletonPoint point={latestPose.rightHip} />
                        <SkeletonPoint point={latestPose.leftKnee} />
                        <SkeletonPoint point={latestPose.rightKnee} />
                        <SkeletonPoint point={latestPose.leftAnkle} />
                        <SkeletonPoint point={latestPose.rightAnkle} />
                    </>
                )}
            </Canvas>

            {/* instructions if not detecting */}
            {!isDetecting && (
                <View style={styles.overlayCenter}>
                    <Text style={styles.overlayText}>Press START to track</Text>
                </View>
            )}
        </View>
    );
}

// Skia Helper Components
const SkeletonLine = ({ start, end }: { start: Keypoint; end: Keypoint }) => {
    if (start.confidence < 0.2 || end.confidence < 0.2) return null;
    return (
        <Line
            p1={vec(start.x, start.y)}
            p2={vec(end.x, end.y)}
            color="#00ff00"
            strokeWidth={4}
            style="stroke"
            strokeCap="round"
        />
    );
};

const SkeletonPoint = ({ point }: { point: Keypoint }) => {
    if (point.confidence < 0.2) return null;
    return (
        <React.Fragment>
            <Circle cx={point.x} cy={point.y} r={8} color="white" />
            <Circle cx={point.x} cy={point.y} r={6} color="#00ff00" />
        </React.Fragment>
    );
};


// Web-specific camera component with pose detection
function WebCameraView({
    isDetecting,
    onPoseDetected
}: {
    isDetecting: boolean;
    onPoseDetected: (pose: PushUpPose) => void;
}) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const detectorRef = useRef<any>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [status, setStatus] = useState('Initializing...');
    const [isReady, setIsReady] = useState(false);
    const [poseData, setPoseData] = useState<{ keypoints: number; confidence: number } | null>(null);

    // Setup camera and detector on mount
    useEffect(() => {
        if (Platform.OS !== 'web') return;

        const setup = async () => {
            try {
                setStatus('Getting camera...');

                // Get camera stream
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: 'user',
                        width: { ideal: 640 },
                        height: { ideal: 480 }
                    },
                });
                streamRef.current = stream;

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    await new Promise<void>((resolve) => {
                        if (videoRef.current) {
                            videoRef.current.onloadedmetadata = () => {
                                videoRef.current?.play();
                                resolve();
                            };
                        }
                    });
                    setStatus('Camera ready! Loading AI model...');
                }

                // Initialize pose detector
                const { WebPoseDetector } = await import('@/services/pose/PoseDetector.web');
                detectorRef.current = new WebPoseDetector();

                setStatus('Loading pose model (may take 30s)...');
                const initialized = await detectorRef.current.initialize();

                if (initialized) {
                    setIsReady(true);
                    setStatus('Ready! Click START TRACKING');
                } else {
                    setStatus('⚠️ Failed to load AI model');
                }
            } catch (err: any) {
                console.error('Setup error:', err);
                setStatus(`Error: ${err.message || String(err)}`);
            }
        };

        setup();

        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(t => t.stop());
            }
            if (detectorRef.current) {
                detectorRef.current.dispose();
            }
        };
    }, []);

    // Detection loop - runs when isDetecting changes
    useEffect(() => {
        if (!isDetecting || !isReady || !videoRef.current || !detectorRef.current) {
            return;
        }

        setStatus('🔄 Detecting poses...');
        let animationFrameId: number;
        let isRunning = true;
        let frameCount = 0;

        const detectLoop = async () => {
            if (!isRunning || !videoRef.current || !detectorRef.current) return;

            try {
                const pose = await detectorRef.current.detectPose(videoRef.current);

                if (pose) {
                    // Count valid keypoints
                    const keypointNames: (keyof PushUpPose)[] = [
                        'nose', 'leftShoulder', 'rightShoulder',
                        'leftElbow', 'rightElbow', 'leftWrist', 'rightWrist',
                        'leftHip', 'rightHip', 'leftKnee', 'rightKnee',
                        'leftAnkle', 'rightAnkle'
                    ];

                    let validCount = 0;
                    let totalConfidence = 0;

                    keypointNames.forEach(name => {
                        const kp = pose[name] as Keypoint;
                        if (kp && kp.confidence > 0.2) {
                            validCount++;
                            totalConfidence += kp.confidence;
                        }
                    });

                    const avgConfidence = validCount > 0 ? totalConfidence / validCount : 0;
                    setPoseData({ keypoints: validCount, confidence: avgConfidence });

                    if (validCount >= 5) {
                        frameCount++;
                        if (frameCount % 30 === 1) {
                            setStatus(`✅ Pose detected! (${validCount} keypoints)`);
                        }
                        onPoseDetected(pose);
                        drawSkeleton(pose);
                    } else {
                        if (frameCount % 30 === 1) {
                            setStatus(`⚠️ Need more keypoints (${validCount}/5)`);
                        }
                    }
                } else {
                    frameCount++;
                    if (frameCount % 60 === 1) {
                        setStatus('Looking for person...');
                    }
                    setPoseData(null);
                }
            } catch (err) {
                console.error('Detection error:', err);
            }

            if (isRunning) {
                animationFrameId = requestAnimationFrame(detectLoop);
            }
        };

        detectLoop();

        return () => {
            isRunning = false;
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, [isDetecting, isReady, onPoseDetected]);

    // Draw skeleton on canvas
    const drawSkeleton = (pose: PushUpPose) => {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        if (!canvas || !video) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Match canvas to video dimensions
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;

        // Clear previous frame
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Define skeleton connections
        const connections: [keyof PushUpPose, keyof PushUpPose][] = [
            ['leftShoulder', 'rightShoulder'],
            ['leftShoulder', 'leftElbow'],
            ['leftElbow', 'leftWrist'],
            ['rightShoulder', 'rightElbow'],
            ['rightElbow', 'rightWrist'],
            ['leftShoulder', 'leftHip'],
            ['rightShoulder', 'rightHip'],
            ['leftHip', 'rightHip'],
            ['leftHip', 'leftKnee'],
            ['leftKnee', 'leftAnkle'],
            ['rightHip', 'rightKnee'],
            ['rightKnee', 'rightAnkle'],
        ];

        // Draw connections (thicker, brighter lines)
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';

        connections.forEach(([startKey, endKey]) => {
            const start = pose[startKey] as Keypoint;
            const end = pose[endKey] as Keypoint;

            if (start && end && start.confidence > 0.2 && end.confidence > 0.2) {
                ctx.beginPath();
                ctx.moveTo(start.x, start.y);
                ctx.lineTo(end.x, end.y);
                ctx.stroke();
            }
        });

        // Draw keypoints (larger, more visible)
        const keypointNames: (keyof PushUpPose)[] = [
            'nose', 'leftShoulder', 'rightShoulder',
            'leftElbow', 'rightElbow', 'leftWrist', 'rightWrist',
            'leftHip', 'rightHip', 'leftKnee', 'rightKnee',
            'leftAnkle', 'rightAnkle'
        ];

        keypointNames.forEach(name => {
            const kp = pose[name] as Keypoint;
            if (kp && kp.confidence > 0.2) {
                // Outer circle (white border)
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(kp.x, kp.y, 12, 0, 2 * Math.PI);
                ctx.fill();

                // Inner circle (green)
                ctx.fillStyle = '#00ff00';
                ctx.beginPath();
                ctx.arc(kp.x, kp.y, 8, 0, 2 * Math.PI);
                ctx.fill();
            }
        });
    };

    return (
        <div style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            backgroundColor: '#000'
        }}>
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transform: 'scaleX(-1)',
                }}
            />
            <canvas
                ref={canvasRef}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    transform: 'scaleX(-1)',
                    pointerEvents: 'none',
                }}
            />
            <DebugOverlay status={status} poseData={poseData} />
        </div>
    );
}

export default function CoachMode() {
    const router = useRouter();
    const { exerciseId: paramExerciseId } = useLocalSearchParams<{ exerciseId?: string }>();
    const [permission, requestPermission] = useCameraPermissions();
    const [facing, setFacing] = useState<CameraType>('front');

    // State management
    const [coachState, setCoachState] = useState<CoachState>('selecting');
    const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
    const [preferences, setPreferences] = useState<UserPreferences | null>(null);
    const [isDetecting, setIsDetecting] = useState(false);
    const [repCount, setRepCount] = useState(0);
    const [formScore, setFormScore] = useState(100);
    const [phase, setPhase] = useState<'up' | 'down' | 'transition' | 'hold' | 'start'>('start');

    // AI coaching
    const [aiTip, setAiTip] = useState<string>('');
    const [aiCoaching, setAiCoaching] = useState<string>('');
    const [voiceEnabled, setVoiceEnabled] = useState(true);

    // Session summary
    const [sessionSummary, setSessionSummary] = useState<{
        totalReps: number;
        averageFormScore: number;
        durationSeconds: number;
        aiSummary?: string;
        aiEncouragement?: string;
        nextStep?: string;
    } | null>(null);

    const analyzerRef = useRef<ExerciseAnalyzer | null>(null);
    const sessionStartRef = useRef<number>(0);
    const lastCoachingRef = useRef<number>(0);

    // Load preferences and exercise
    useEffect(() => {
        loadData();
    }, [paramExerciseId]);

    const loadData = async () => {
        const prefs = await storageService.getUserPreferences();
        setPreferences(prefs);

        if (paramExerciseId) {
            const exercise = getExerciseById(paramExerciseId);
            if (exercise) {
                await selectExercise(exercise);
            }
        }
    };

    const selectExercise = async (exercise: Exercise) => {
        setSelectedExercise(exercise);
        analyzerRef.current = createExerciseAnalyzer(exercise.id);
        setCoachState('ready');

        // Get AI tip
        const tip = await geminiService.getExerciseTip(exercise.id, preferences);
        setAiTip(tip);
    };

    const speak = (text: string) => {
        if (voiceEnabled && text) {
            Speech.speak(text, { language: 'en', rate: 0.9 });
        }
    };

    const handlePoseDetected = useCallback((pose: PushUpPose) => {
        if (!analyzerRef.current || !isDetecting) return;

        // Convert PushUpPose to PoseData format
        const poseData: PoseData = {
            landmarks: {
                nose: pose.nose,
                left_shoulder: pose.leftShoulder,
                right_shoulder: pose.rightShoulder,
                left_elbow: pose.leftElbow,
                right_elbow: pose.rightElbow,
                left_wrist: pose.leftWrist,
                right_wrist: pose.rightWrist,
                left_hip: pose.leftHip,
                right_hip: pose.rightHip,
                left_knee: pose.leftKnee,
                right_knee: pose.rightKnee,
                left_ankle: pose.leftAnkle,
                right_ankle: pose.rightAnkle,
            },
            timestamp: Date.now(),
        };

        const result = analyzerRef.current.analyze(poseData);

        setFormScore(result.formScore);
        setPhase(result.phase as any);

        if (result.repCompleted) {
            setRepCount(prev => prev + 1);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

            // Announce rep if divisible by 5
            if (analyzerRef.current.getSessionStats().repCount % 5 === 0) {
                speak(`${analyzerRef.current.getSessionStats().repCount} reps`);
            }
        }

        // Provide AI coaching for form issues (throttled)
        const now = Date.now();
        if (result.formFeedback.length > 0 && now - lastCoachingRef.current > 5000) {
            const feedback = result.formFeedback[0];
            if (feedback.message) {
                setAiCoaching(feedback.message);
                speak(feedback.message);
                lastCoachingRef.current = now;
            }
        }
    }, [isDetecting, voiceEnabled]);

    const startDetection = async () => {
        if (!selectedExercise) return;

        setIsDetecting(true);
        sessionStartRef.current = Date.now();
        setRepCount(0);
        setFormScore(100);
        setAiCoaching('');

        if (analyzerRef.current) {
            analyzerRef.current.resetForNewSet();
        }

        speak('Starting. Get ready!');
        setCoachState('detecting');
    };

    const stopDetection = async () => {
        setIsDetecting(false);

        if (analyzerRef.current && selectedExercise) {
            const stats = analyzerRef.current.getSessionSummary();
            const duration = Math.floor((Date.now() - sessionStartRef.current) / 1000);

            // Save session
            await storageService.saveWorkoutSession({
                id: Date.now().toString(),
                date: new Date().toISOString(),
                exerciseId: selectedExercise.id,
                exerciseName: selectedExercise.name,
                bodyParts: selectedExercise.bodyParts,
                mode: 'ai-coach',
                repsCompleted: stats.totalReps,
                setsCompleted: 1,
                formScore: stats.averageFormScore,
                durationSeconds: duration,
            });

            // Get AI summary
            const aiSummary = await geminiService.generateSessionSummary(
                selectedExercise.id,
                1,
                stats.totalReps,
                duration,
                preferences
            );

            setSessionSummary({
                totalReps: stats.totalReps,
                averageFormScore: stats.averageFormScore,
                durationSeconds: duration,
                aiSummary: aiSummary.summary,
                aiEncouragement: aiSummary.encouragement,
                nextStep: aiSummary.nextStep,
            });

            speak('Great workout!');
            setCoachState('summary');
        }
    };

    // On web, we handle our own camera permissions
    if (Platform.OS !== 'web' && !permission) {
        // Native permission check (might need Vision Camera specific check but expo-camera handles manifest)
        return (
            <View style={styles.container}>
                <Text style={styles.message}>Loading camera permissions...</Text>
            </View>
        );
    }

    if (Platform.OS !== 'web' && !permission?.granted) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()} style={styles.backButton}>
                        <Text style={styles.backText}>←</Text>
                    </Pressable>
                    <Text style={styles.headerTitle}>AI Coach</Text>
                    <View style={{ width: 60 }} />
                </View>

                <View style={styles.permissionContainer}>
                    <Text style={styles.permissionTitle}>Camera Access Required</Text>
                    <Text style={styles.permissionText}>
                        AI Coach needs your camera to analyze{'\n'}your push-up form in real-time.
                    </Text>
                    <Pressable style={styles.permissionButton} onPress={requestPermission}>
                        <Text style={styles.permissionButtonText}>Grant Permission</Text>
                    </Pressable>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backText}>←</Text>
                </Pressable>
                <Text style={styles.headerTitle}>
                    {selectedExercise ? selectedExercise.name : 'AI Coach'}
                </Text>
                <Pressable onPress={() => setVoiceEnabled(!voiceEnabled)} style={styles.flipButton}>
                    <Text style={styles.flipText}>{voiceEnabled ? '🔊' : '🔇'}</Text>
                </Pressable>
            </View>

            {/* Exercise Selection State */}
            {coachState === 'selecting' && (
                <ScrollView style={styles.selectContainer} contentContainerStyle={styles.selectContent}>
                    <Text style={styles.selectTitle}>Choose Exercise</Text>
                    <Text style={styles.selectSubtitle}>
                        AI Coach will analyze your form in real-time
                    </Text>
                    {EXERCISES.filter(e => e.type === 'reps').map(exercise => (
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
                                <Text style={styles.exerciseDifficulty}>{exercise.difficulty}</Text>
                            </View>
                            <Text style={styles.exerciseArrow}>→</Text>
                        </Pressable>
                    ))}
                </ScrollView>
            )}

            {/* Ready State - Show AI tip */}
            {coachState === 'ready' && selectedExercise && (
                <View style={styles.readyContainer}>
                    <Text style={styles.readyTitle}>{selectedExercise.name}</Text>
                    <Text style={styles.readySubtitle}>
                        Position your phone to see your full body
                    </Text>

                    {aiTip && (
                        <View style={styles.tipCard}>
                            <Text style={styles.tipLabel}>💡 AI Tip</Text>
                            <Text style={styles.tipText}>{aiTip}</Text>
                        </View>
                    )}

                    <Pressable style={styles.startButton} onPress={startDetection}>
                        <Text style={styles.startButtonText}>START AI COACHING</Text>
                    </Pressable>

                    <Pressable
                        style={styles.changeExercise}
                        onPress={() => setCoachState('selecting')}
                    >
                        <Text style={styles.changeExerciseText}>Choose Different Exercise</Text>
                    </Pressable>
                </View>
            )}

            {/* Detecting State - Camera View */}
            {coachState === 'detecting' && (
                <View style={styles.cameraContainer}>
                    {Platform.OS === 'web' ? (
                        <WebCameraView
                            isDetecting={isDetecting}
                            onPoseDetected={handlePoseDetected}
                        />
                    ) : (
                        <NativeCameraView
                            isDetecting={isDetecting}
                            onPoseDetected={handlePoseDetected}
                        />
                    )}

                    {/* Overlay UI */}
                    <View style={styles.overlay}>
                        {/* Top Stats */}
                        <View style={styles.topStats}>
                            <View style={styles.statCard}>
                                <Text style={styles.statLabel}>REPS</Text>
                                <Text style={styles.statValue}>{repCount}</Text>
                            </View>
                            <View style={styles.statCard}>
                                <Text style={styles.statLabel}>FORM</Text>
                                <Text style={[
                                    styles.statValue,
                                    { color: formScore >= 90 ? '#22C55E' : formScore >= 70 ? '#F59E0B' : '#EF4444' }
                                ]}>
                                    {formScore}%
                                </Text>
                            </View>
                        </View>

                        {/* Phase Indicator */}
                        <View style={styles.phaseIndicator}>
                            <Text style={styles.phaseText}>
                                {phase === 'down' ? '↓ DOWN' : phase === 'up' ? '↑ UP' : phase === 'hold' ? '⏸ HOLD' : '→ MOVE'}
                            </Text>
                        </View>

                        {/* AI Coaching Message */}
                        {aiCoaching && (
                            <View style={styles.coachingBubble}>
                                <Text style={styles.coachingText}>{aiCoaching}</Text>
                            </View>
                        )}

                        {/* Bottom Controls */}
                        <View style={styles.bottomControls}>
                            <Pressable style={styles.stopButton} onPress={stopDetection}>
                                <Text style={styles.stopButtonText}>FINISH</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            )}

            {/* Summary State */}
            {coachState === 'summary' && sessionSummary && (
                <ScrollView style={styles.summaryContainer} contentContainerStyle={styles.summaryContent}>
                    <Text style={styles.summaryEmoji}>🎉</Text>
                    <Text style={styles.summaryTitle}>Workout Complete!</Text>

                    <View style={styles.summaryStats}>
                        <View style={styles.summaryStat}>
                            <Text style={styles.summaryStatValue}>{sessionSummary.totalReps}</Text>
                            <Text style={styles.summaryStatLabel}>Reps</Text>
                        </View>
                        <View style={styles.summaryStat}>
                            <Text style={[
                                styles.summaryStatValue,
                                { color: sessionSummary.averageFormScore >= 80 ? '#22C55E' : '#F59E0B' }
                            ]}>
                                {sessionSummary.averageFormScore}%
                            </Text>
                            <Text style={styles.summaryStatLabel}>Form Score</Text>
                        </View>
                        <View style={styles.summaryStat}>
                            <Text style={styles.summaryStatValue}>
                                {Math.floor(sessionSummary.durationSeconds / 60)}:{String(sessionSummary.durationSeconds % 60).padStart(2, '0')}
                            </Text>
                            <Text style={styles.summaryStatLabel}>Duration</Text>
                        </View>
                    </View>

                    {sessionSummary.aiSummary && (
                        <View style={styles.aiSummaryCard}>
                            <Text style={styles.aiSummaryTitle}>🤖 AI Analysis</Text>
                            <Text style={styles.aiSummaryText}>{sessionSummary.aiSummary}</Text>
                            {sessionSummary.aiEncouragement && (
                                <Text style={styles.aiEncouragement}>{sessionSummary.aiEncouragement}</Text>
                            )}
                        </View>
                    )}

                    {sessionSummary.nextStep && (
                        <View style={styles.nextStepCard}>
                            <Text style={styles.nextStepLabel}>📌 Next Step</Text>
                            <Text style={styles.nextStepText}>{sessionSummary.nextStep}</Text>
                        </View>
                    )}

                    <Pressable
                        style={styles.anotherSetButton}
                        onPress={() => {
                            setSessionSummary(null);
                            setCoachState('ready');
                        }}
                    >
                        <Text style={styles.anotherSetText}>Do Another Set</Text>
                    </Pressable>

                    <Pressable style={styles.doneButton} onPress={() => router.back()}>
                        <Text style={styles.doneButtonText}>Done</Text>
                    </Pressable>
                </ScrollView>
            )}

            {/* Instructions Banner */}
            {coachState === 'detecting' && (
                <View style={styles.infoBanner}>
                    <Text style={styles.infoText}>
                        🟢 Stand back so camera sees your full body
                    </Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        color: '#fff',
        fontSize: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
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
    flipButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    flipText: {
        fontSize: 28,
        color: '#fff',
    },
    message: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 100,
    },
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    permissionTitle: {
        fontSize: 28,
        fontWeight: '900',
        color: '#fff',
        marginBottom: 16,
    },
    permissionText: {
        fontSize: 16,
        color: '#888',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 40,
    },
    permissionButton: {
        backgroundColor: '#00ff88',
        paddingHorizontal: 40,
        paddingVertical: 16,
        borderRadius: 12,
    },
    permissionButtonText: {
        fontSize: 16,
        fontWeight: '900',
        color: '#000',
    },
    cameraContainer: {
        flex: 1,
        position: 'relative',
    },
    camera: {
        flex: 1,
    },
    nativeNote: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 200,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: 20,
        borderRadius: 12,
        marginHorizontal: 40,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'transparent',
        pointerEvents: 'box-none',
        zIndex: 50,
    },
    overlayCenter: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        pointerEvents: 'none',
    },
    overlayText: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
        textShadowColor: 'black',
        textShadowRadius: 10,
    },
    topStats: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingHorizontal: 20,
        paddingTop: 70,
        gap: 12,
        pointerEvents: 'none',
    },
    statCard: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderRadius: 16,
        padding: 16,
        minWidth: 100,
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#888',
        letterSpacing: 1,
    },
    statValue: {
        fontSize: 32,
        fontWeight: '900',
        color: '#00aaff',
        marginTop: 4,
    },
    phaseIndicator: {
        position: 'absolute',
        top: 160,
        right: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        pointerEvents: 'none',
    },
    phaseText: {
        fontSize: 14,
        fontWeight: '800',
        color: '#fff',
        letterSpacing: 1,
    },
    bottomControls: {
        position: 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 60,
    },
    startButton: {
        backgroundColor: '#00ff88',
        paddingHorizontal: 48,
        paddingVertical: 20,
        borderRadius: 16,
    },
    startButtonText: {
        fontSize: 18,
        fontWeight: '900',
        color: '#000',
        letterSpacing: 1,
    },
    stopButton: {
        backgroundColor: '#ff4444',
        paddingHorizontal: 48,
        paddingVertical: 20,
        borderRadius: 16,
    },
    stopButtonText: {
        fontSize: 18,
        fontWeight: '900',
        color: '#fff',
        letterSpacing: 1,
    },
    infoBanner: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        paddingVertical: 12,
        alignItems: 'center',
        zIndex: 10,
    },
    infoText: {
        fontSize: 14,
        color: '#aaa',
        fontWeight: '600',
    },

    // Exercise Selection
    selectContainer: {
        flex: 1,
    },
    selectContent: {
        padding: 20,
        paddingTop: 100,
    },
    selectTitle: {
        fontSize: 28,
        fontWeight: '900',
        color: '#fff',
        marginBottom: 8,
    },
    selectSubtitle: {
        fontSize: 16,
        color: '#888',
        marginBottom: 24,
    },
    exerciseCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
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
    exerciseDifficulty: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.5)',
        textTransform: 'capitalize',
    },
    exerciseArrow: {
        fontSize: 18,
        color: 'rgba(255,255,255,0.3)',
    },

    // Ready State
    readyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    readyTitle: {
        fontSize: 32,
        fontWeight: '900',
        color: '#fff',
        marginBottom: 12,
    },
    readySubtitle: {
        fontSize: 16,
        color: '#888',
        textAlign: 'center',
        marginBottom: 32,
    },
    tipCard: {
        backgroundColor: 'rgba(139, 92, 246, 0.15)',
        borderRadius: 16,
        padding: 16,
        width: '100%',
        marginBottom: 32,
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
    changeExercise: {
        marginTop: 20,
        padding: 12,
    },
    changeExerciseText: {
        fontSize: 14,
        color: '#8B5CF6',
        fontWeight: '600',
    },

    // Coaching Bubble
    coachingBubble: {
        position: 'absolute',
        bottom: 120,
        left: 20,
        right: 20,
        backgroundColor: 'rgba(239, 68, 68, 0.9)',
        borderRadius: 12,
        padding: 16,
    },
    coachingText: {
        fontSize: 16,
        color: '#fff',
        textAlign: 'center',
        fontWeight: '700',
    },

    // Summary Screen
    summaryContainer: {
        flex: 1,
    },
    summaryContent: {
        padding: 24,
        paddingTop: 100,
        alignItems: 'center',
    },
    summaryEmoji: {
        fontSize: 64,
        marginBottom: 16,
    },
    summaryTitle: {
        fontSize: 28,
        fontWeight: '900',
        color: '#fff',
        marginBottom: 24,
    },
    summaryStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginBottom: 32,
    },
    summaryStat: {
        alignItems: 'center',
    },
    summaryStatValue: {
        fontSize: 28,
        fontWeight: '900',
        color: '#fff',
    },
    summaryStatLabel: {
        fontSize: 12,
        color: '#888',
        fontWeight: '600',
        marginTop: 4,
    },
    aiSummaryCard: {
        backgroundColor: 'rgba(139, 92, 246, 0.15)',
        borderRadius: 16,
        padding: 20,
        width: '100%',
        marginBottom: 16,
    },
    aiSummaryTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#8B5CF6',
        marginBottom: 8,
    },
    aiSummaryText: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.9)',
        lineHeight: 24,
        marginBottom: 12,
    },
    aiEncouragement: {
        fontSize: 15,
        color: '#22C55E',
        fontWeight: '600',
        fontStyle: 'italic',
    },
    nextStepCard: {
        backgroundColor: 'rgba(34, 197, 94, 0.15)',
        borderRadius: 16,
        padding: 16,
        width: '100%',
        marginBottom: 24,
    },
    nextStepLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#22C55E',
        marginBottom: 6,
    },
    nextStepText: {
        fontSize: 15,
        color: 'rgba(255,255,255,0.9)',
        lineHeight: 22,
    },
    anotherSetButton: {
        backgroundColor: 'rgba(139, 92, 246, 0.2)',
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#8B5CF6',
    },
    anotherSetText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#8B5CF6',
    },
    doneButton: {
        backgroundColor: '#22C55E',
        paddingHorizontal: 48,
        paddingVertical: 16,
        borderRadius: 12,
    },
    doneButtonText: {
        fontSize: 16,
        fontWeight: '900',
        color: '#000',
    },
});
