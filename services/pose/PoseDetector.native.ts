import { Keypoint, PushUpPose } from '@/types';
import { useEffect, useRef } from 'react';
import {
    Delegate,
    KnownPoseLandmarks,
    RunningMode,
    usePoseDetection,
    type PoseDetectionResultBundle,
    type ViewCoordinator,
} from 'react-native-mediapipe-posedetection';

/**
 * Native Pose Detector for Android/iOS
 * Uses MediaPipe Pose Detection - reliable, production-ready solution
 * 
 * MediaPipe provides 33 landmarks, we map to our 13 required keypoints.
 * Landmarks come as normalized coordinates (0-1) and MUST be converted
 * to screen pixel coordinates using the viewCoordinator.
 */

/**
 * Convert MediaPipe pose landmarks to our PushUpPose format
 * Uses viewCoordinator to convert normalized (0-1) coordinates to screen pixels
 */
function convertToPushUpPose(
    landmarks: Array<{ x: number; y: number; z?: number; visibility?: number }>,
    timestamp: number,
    viewCoordinator: ViewCoordinator | undefined,
    frameDims: { width: number; height: number }
): PushUpPose | null {
    if (!landmarks || landmarks.length < 33) {
        return null;
    }

    const getKeypoint = (index: number): Keypoint => {
        const landmark = landmarks[index];
        if (!landmark) {
            return { x: 0, y: 0, confidence: 0 };
        }

        // Convert normalized coordinates to screen pixels
        let x = landmark.x;
        let y = landmark.y;

        if (viewCoordinator) {
            const converted = viewCoordinator.convertPoint(frameDims, { x: landmark.x, y: landmark.y });
            x = converted.x;
            y = converted.y;
        } else {
            // Fallback: manually scale if no viewCoordinator (shouldn't happen)
            x = landmark.x * frameDims.width;
            y = landmark.y * frameDims.height;
        }

        return {
            x,
            y,
            confidence: landmark.visibility ?? 1.0,
        };
    };

    return {
        timestamp,
        nose: getKeypoint(KnownPoseLandmarks.nose),
        leftShoulder: getKeypoint(KnownPoseLandmarks.leftShoulder),
        rightShoulder: getKeypoint(KnownPoseLandmarks.rightShoulder),
        leftElbow: getKeypoint(KnownPoseLandmarks.leftElbow),
        rightElbow: getKeypoint(KnownPoseLandmarks.rightElbow),
        leftWrist: getKeypoint(KnownPoseLandmarks.leftWrist),
        rightWrist: getKeypoint(KnownPoseLandmarks.rightWrist),
        leftHip: getKeypoint(KnownPoseLandmarks.leftHip),
        rightHip: getKeypoint(KnownPoseLandmarks.rightHip),
        leftKnee: getKeypoint(KnownPoseLandmarks.leftKnee),
        rightKnee: getKeypoint(KnownPoseLandmarks.rightKnee),
        leftAnkle: getKeypoint(KnownPoseLandmarks.leftAnkle),
        rightAnkle: getKeypoint(KnownPoseLandmarks.rightAnkle),
    };
}

/**
 * Hook to initialize MediaPipe pose detection and get the solution object
 * Returns the MediaPipeSolution object that will be used with MediapipeCamera
 */
export function usePushUpPoseProcessor(onPoseDetected: (pose: PushUpPose) => void) {
    const callbackRef = useRef(onPoseDetected);

    // Keep callback ref up to date
    useEffect(() => {
        callbackRef.current = onPoseDetected;
    }, [onPoseDetected]);

    // Initialize MediaPipe pose detection with callbacks
    const solution = usePoseDetection(
        {
            onResults: (result: PoseDetectionResultBundle, viewCoordinator) => {
                // DetectionResultBundle.results is an array
                if (result.results && result.results.length > 0) {
                    // Each result has landmarks as a 2D array (for multiple people)
                    const firstResult = result.results[0];

                    if (firstResult.landmarks && firstResult.landmarks.length > 0) {
                        // Get first person's landmarks
                        const landmarks = firstResult.landmarks[0];

                        // Get frame dimensions using viewCoordinator
                        const frameDims = viewCoordinator.getFrameDims(result);

                        const pushUpPose = convertToPushUpPose(
                            landmarks,
                            Date.now(),
                            viewCoordinator,
                            frameDims
                        );

                        if (pushUpPose) {
                            callbackRef.current(pushUpPose);
                        }
                    }
                }
            },
            onError: (error) => {
                console.error('MediaPipe pose detection error:', error);
            },
        },
        RunningMode.LIVE_STREAM,
        'pose_landmarker_lite.task', // Built-in model
        {
            numPoses: 1,
            minPoseDetectionConfidence: 0.5,
            minPosePresenceConfidence: 0.5,
            minTrackingConfidence: 0.5,
            delegate: Delegate.GPU, // Use enum, not string
        }
    );

    return solution;
}

export { convertToPushUpPose };

