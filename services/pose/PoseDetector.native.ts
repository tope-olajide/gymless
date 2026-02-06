import { Keypoint, PushUpPose } from '@/types';
import { useEffect } from 'react';
import { TensorflowModel, useTensorflowModel } from 'react-native-fast-tflite';
import { useFrameProcessor } from 'react-native-vision-camera';
import { Worklets, useSharedValue } from 'react-native-worklets-core';
import { useResizePlugin } from 'vision-camera-resize-plugin';

/**
 * Native Pose Detector for Android/iOS
 * Uses MoveNet Lightning via react-native-fast-tflite
 */

// MoveNet Lightning keypoint indices (17 keypoints)
const MOVENET_KEYPOINTS = {
    NOSE: 0,
    LEFT_EYE: 1,
    RIGHT_EYE: 2,
    LEFT_EAR: 3,
    RIGHT_EAR: 4,
    LEFT_SHOULDER: 5,
    RIGHT_SHOULDER: 6,
    LEFT_ELBOW: 7,
    RIGHT_ELBOW: 8,
    LEFT_WRIST: 9,
    RIGHT_WRIST: 10,
    LEFT_HIP: 11,
    RIGHT_HIP: 12,
    LEFT_KNEE: 13,
    RIGHT_KNEE: 14,
    LEFT_ANKLE: 15,
    RIGHT_ANKLE: 16,
};

// MoveNet Lightning input size
const MODEL_INPUT_SIZE = 192;

/**
 * Parse MoveNet output to keypoints
 * Output is a TypedArray with shape [1, 1, 17, 3] flattened - y, x, confidence for 17 keypoints
 */
function parseOutput(
    output: ArrayBufferLike,
    frameWidth: number,
    frameHeight: number
): Keypoint[] {
    'worklet';
    const keypoints: Keypoint[] = [];
    const data = new Float32Array(output);

    for (let i = 0; i < 17; i++) {
        const baseIdx = i * 3;
        const y = data[baseIdx];
        const x = data[baseIdx + 1];
        const confidence = data[baseIdx + 2];

        keypoints.push({
            x: x * frameWidth,
            y: y * frameHeight,
            confidence: confidence,
        });
    }

    return keypoints;
}

/**
 * Maps MoveNet keypoints to our PushUpPose interface
 */
function mapToPushUpPose(keypoints: Keypoint[], timestamp: number): PushUpPose | null {
    'worklet';
    if (keypoints.length < 17) return null;

    const get = (index: number): Keypoint => {
        const kp = keypoints[index];
        if (!kp) return { x: 0, y: 0, confidence: 0 };
        return kp;
    };

    return {
        timestamp,
        nose: get(MOVENET_KEYPOINTS.NOSE),
        leftShoulder: get(MOVENET_KEYPOINTS.LEFT_SHOULDER),
        rightShoulder: get(MOVENET_KEYPOINTS.RIGHT_SHOULDER),
        leftElbow: get(MOVENET_KEYPOINTS.LEFT_ELBOW),
        rightElbow: get(MOVENET_KEYPOINTS.RIGHT_ELBOW),
        leftWrist: get(MOVENET_KEYPOINTS.LEFT_WRIST),
        rightWrist: get(MOVENET_KEYPOINTS.RIGHT_WRIST),
        leftHip: get(MOVENET_KEYPOINTS.LEFT_HIP),
        rightHip: get(MOVENET_KEYPOINTS.RIGHT_HIP),
        leftKnee: get(MOVENET_KEYPOINTS.LEFT_KNEE),
        rightKnee: get(MOVENET_KEYPOINTS.RIGHT_KNEE),
        leftAnkle: get(MOVENET_KEYPOINTS.LEFT_ANKLE),
        rightAnkle: get(MOVENET_KEYPOINTS.RIGHT_ANKLE),
    };
}

/**
 * Hook to load the MoveNet model and create the frame processor
 */
export function usePushUpPoseProcessor(onPoseDetected: (pose: PushUpPose) => void) {
    // Load the MoveNet TFLite model
    const modelResult = useTensorflowModel(require('@/assets/models/movenet.tflite'));

    // Store model in a shared value for worklet access
    const modelRef = useSharedValue<TensorflowModel | null>(null);

    // Get the resize plugin
    const { resize } = useResizePlugin();

    // Update shared value when model loads
    useEffect(() => {
        if (modelResult.state === 'loaded' && modelResult.model) {
            modelRef.value = modelResult.model;
            console.log('✅ MoveNet model loaded successfully');
        } else if (modelResult.state === 'error') {
            console.error('❌ Failed to load MoveNet model:', modelResult.error);
        }
    }, [modelResult, modelRef]);

    // Create a runOnJS wrapper for the callback
    const runOnJS = Worklets.createRunOnJS(onPoseDetected);

    return useFrameProcessor((frame) => {
        'worklet';

        const model = modelRef.value;
        if (model == null) {
            // Model not loaded yet
            return;
        }

        try {
            // 1. Resize frame to 192x192x3 (RGB) using vision-camera-resize-plugin
            const resized = resize(frame, {
                scale: {
                    width: MODEL_INPUT_SIZE,
                    height: MODEL_INPUT_SIZE,
                },
                pixelFormat: 'rgb',
                dataType: 'uint8',
            });

            // 2. Run MoveNet inference synchronously
            // MoveNet expects input of shape [1, 192, 192, 3]
            // and outputs [1, 1, 17, 3] (17 keypoints with y, x, confidence)
            const outputs = model.runSync([resized]);

            if (outputs && outputs.length > 0) {
                // 3. Get the output buffer
                const outputData = outputs[0];

                // 4. Parse output to keypoints
                const keypoints = parseOutput(
                    outputData.buffer,
                    frame.width,
                    frame.height
                );

                // 5. Map to PushUpPose
                const pushUpPose = mapToPushUpPose(keypoints, Date.now());

                if (pushUpPose) {
                    runOnJS(pushUpPose);
                }
            }
        } catch (_error) {
            // Silently handle errors in frame processor
            // Logging would be too verbose at 30fps
        }
    }, [resize, runOnJS, modelRef]);
}

// Re-export mapToPushUpPose for testing if needed
export { mapToPushUpPose };

