import { PushUpAnalyzer } from '@/services/pushup/PushUpAnalyzer';
import { Keypoint, PushUpPose } from '@/types';
import { CameraType, useCameraPermissions } from 'expo-camera'; // Renamed to avoid specific conflict if needed, though they are different libs
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

// Native Imports (will likely be mocked/ignored on web bundle, but we validly import them for source code)
import { usePushUpPoseProcessor } from '@/services/pose/PoseDetector.native';
import { Canvas, Circle, Line, vec } from '@shopify/react-native-skia';
import { Camera, useCameraDevice } from 'react-native-vision-camera';

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

// Native Camera Component with Vision Camera + Skia
function NativeCameraView({
    isDetecting,
    onPoseDetected
}: {
    isDetecting: boolean;
    onPoseDetected: (pose: PushUpPose) => void;
}) {
    const device = useCameraDevice('front');
    const [latestPose, setLatestPose] = useState<PushUpPose | null>(null);
    const [status, setStatus] = useState('Camera Ready');

    // Wrapper to update local state for drawing
    const onPose = useCallback((pose: PushUpPose) => {
        if (isDetecting) {
            setLatestPose(pose);
            onPoseDetected(pose);
        }
    }, [isDetecting, onPoseDetected]);

    // Use our custom frame processor hook
    const frameProcessor = usePushUpPoseProcessor(onPose);

    if (!device) {
        return (
            <View style={styles.center}>
                <Text style={styles.text}>Finding Camera...</Text>
            </View>
        );
    }

    return (
        <View style={StyleSheet.absoluteFill}>
            <Camera
                style={StyleSheet.absoluteFill}
                device={device}
                isActive={true} // Keep camera active to show feed
                frameProcessor={isDetecting ? frameProcessor : undefined}
                pixelFormat="yuv" // Recommended for ML Kit
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
    const [permission, requestPermission] = useCameraPermissions();
    const [facing, setFacing] = useState<CameraType>('front');
    const [isDetecting, setIsDetecting] = useState(false);
    const [repCount, setRepCount] = useState(0);
    const [formScore, setFormScore] = useState(100);
    const [phase, setPhase] = useState<'up' | 'down' | 'transition'>('up');

    const analyzerRef = useRef<PushUpAnalyzer | null>(null);

    useEffect(() => {
        analyzerRef.current = new PushUpAnalyzer();
    }, []);

    const handlePoseDetected = useCallback((pose: PushUpPose) => {
        if (!analyzerRef.current) return;

        const analysis = analyzerRef.current.analyzePose(pose);

        setFormScore(analysis.score);
        setPhase(analysis.phase);
        setRepCount(analyzerRef.current.getRepCount());
    }, []);

    const startDetection = () => {
        setIsDetecting(true);
        if (analyzerRef.current) {
            analyzerRef.current.reset();
            setRepCount(0);
        }
    };

    const stopDetection = () => {
        setIsDetecting(false);
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
                <Text style={styles.headerTitle}>AI Coach</Text>
                <Pressable
                    onPress={() => setFacing(f => f === 'back' ? 'front' : 'back')}
                    style={styles.flipButton}
                >
                    <Text style={styles.flipText}>↻</Text>
                </Pressable>
            </View>

            {/* Camera View */}
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
                                { color: formScore >= 90 ? '#00ff88' : formScore >= 70 ? '#ffaa00' : '#ff4444' }
                            ]}>
                                {formScore}%
                            </Text>
                        </View>
                    </View>

                    {/* Phase Indicator */}
                    <View style={styles.phaseIndicator}>
                        <Text style={styles.phaseText}>
                            {phase === 'down' ? '↓ DOWN' : phase === 'up' ? '↑ UP' : '→ TRANSITION'}
                        </Text>
                    </View>

                    {/* Bottom Controls */}
                    <View style={styles.bottomControls}>
                        {!isDetecting ? (
                            <Pressable style={styles.startButton} onPress={startDetection}>
                                <Text style={styles.startButtonText}>START TRACKING</Text>
                            </Pressable>
                        ) : (
                            <Pressable style={styles.stopButton} onPress={stopDetection}>
                                <Text style={styles.stopButtonText}>STOP</Text>
                            </Pressable>
                        )}
                    </View>
                </View>
            </View>

            {/* Instructions Banner */}
            <View style={styles.infoBanner}>
                <Text style={styles.infoText}>
                    {isDetecting
                        ? '🟢 Stand back so camera sees your full body'
                        : '💡 TIP: Stand 5-8 feet from camera, full body visible'}
                </Text>
            </View>
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
});
