import { Keypoint, PushUpPose } from '@/types';
import { Pose, PoseLandmark, detectPose } from '@scottjgilroy/react-native-vision-camera-v4-pose-detection';
import { useFrameProcessor } from 'react-native-vision-camera';
import { Worklets } from 'react-native-worklets-core';

/**
 * Native Pose Detector for Android
 * Uses @scottjgilroy/react-native-vision-camera-v4-pose-detection (ML Kit)
 */

// Mapping from ML Kit Pose Landmark Index to our PushUpPose keys
// See: https://developers.google.com/ml-kit/vision/pose-detection/landmarks
const MLKIT_LANDMARKS = {
    NOSE: 0,
    LEFT_SHOULDER: 11,
    RIGHT_SHOULDER: 12,
    LEFT_ELBOW: 13,
    RIGHT_ELBOW: 14,
    LEFT_WRIST: 15,
    RIGHT_WRIST: 16,
    LEFT_HIP: 23,
    RIGHT_HIP: 24,
    LEFT_KNEE: 25,
    RIGHT_KNEE: 26,
    LEFT_ANKLE: 27,
    RIGHT_ANKLE: 28,
};

/**
 * Maps a single ML Kit landmark to our Keypoint interface
 */
function mapLandmark(landmark: PoseLandmark): Keypoint {
    'worklet';
    return {
        x: landmark.x,
        y: landmark.y,
        confidence: landmark.confidence,
    };
}

/**
 * Maps the raw ML Kit pose to our PushUpPose interface
 */
export function mapToPushUpPose(pose: Pose, timestamp: number): PushUpPose | null {
    'worklet';
    if (!pose || !pose.landmarks) return null;

    const landmarks = pose.landmarks;

    // Helper to get landmark safely
    const get = (index: number): Keypoint => {
        const kp = landmarks[index];
        // If landmark is missing, return low confidence
        if (!kp) return { x: 0, y: 0, confidence: 0 };
        return mapLandmark(kp);
    };

    return {
        timestamp,
        nose: get(MLKIT_LANDMARKS.NOSE),
        leftShoulder: get(MLKIT_LANDMARKS.LEFT_SHOULDER),
        rightShoulder: get(MLKIT_LANDMARKS.RIGHT_SHOULDER),
        leftElbow: get(MLKIT_LANDMARKS.LEFT_ELBOW),
        rightElbow: get(MLKIT_LANDMARKS.RIGHT_ELBOW),
        leftWrist: get(MLKIT_LANDMARKS.LEFT_WRIST),
        rightWrist: get(MLKIT_LANDMARKS.RIGHT_WRIST),
        leftHip: get(MLKIT_LANDMARKS.LEFT_HIP),
        rightHip: get(MLKIT_LANDMARKS.RIGHT_HIP),
        leftKnee: get(MLKIT_LANDMARKS.LEFT_KNEE),
        rightKnee: get(MLKIT_LANDMARKS.RIGHT_KNEE),
        leftAnkle: get(MLKIT_LANDMARKS.LEFT_ANKLE),
        rightAnkle: get(MLKIT_LANDMARKS.RIGHT_ANKLE),
    };
}

/**
 * Hook to create the frame processor
 */
export function usePushUpPoseProcessor(onPoseDetected: (pose: PushUpPose) => void) {
    // Create a runOnJS wrapper for the callback
    const runOnJS = Worklets.createRunOnJS(onPoseDetected);

    return useFrameProcessor((frame) => {
        'worklet';

        // Run detection
        const { poses } = detectPose(frame, {
            mode: 'stream', // optimized for video stream
            autoScale: true,
        });

        // We only care about the first person detected
        if (poses && poses.length > 0) {
            const rawPose = poses[0];
            const pushUpPose = mapToPushUpPose(rawPose, frame.timestamp);

            if (pushUpPose) {
                runOnJS(pushUpPose);
            }
        }
    }, [runOnJS]);
}
