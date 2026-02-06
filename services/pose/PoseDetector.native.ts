import { Keypoint, PushUpPose } from '@/types';
import { useEffect } from 'react';
import { Dimensions } from 'react-native';
import { TensorflowModel, useTensorflowModel } from 'react-native-fast-tflite';
import { useFrameProcessor } from 'react-native-vision-camera';
import { Worklets, useSharedValue } from 'react-native-worklets-core';
import { useResizePlugin } from 'vision-camera-resize-plugin';

/**
 * Native Pose Detector for Android/iOS
 * Uses MoveNet Lightning (int8) via react-native-fast-tflite
 * 
 * The int8 model is optimized for uint8 RGB input which matches
 * what vision-camera-resize-plugin provides.
 * 
 * IMPORTANT: Frame coordinates are in sensor orientation, not display orientation.
 * We use frame.orientation and frame.isMirrored to transform coordinates correctly.
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

// Get screen dimensions for coordinate mapping
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Transform coordinates from sensor orientation to display orientation
 * 
 * MoveNet outputs normalized [0,1] coordinates in sensor orientation.
 * We need to transform them based on:
 * 1. Frame orientation (rotation relative to portrait)
 * 2. Whether the frame is mirrored (front camera)
 * 3. Screen dimensions
 */
function transformCoordinates(
    normalizedX: number,
    normalizedY: number,
    orientation: string,
    isMirrored: boolean,
    screenWidth: number,
    screenHeight: number
): { x: number; y: number } {
    'worklet';

    let x = normalizedX;
    let y = normalizedY;

    // Apply rotation based on orientation
    // The orientation indicates how the sensor is rotated relative to portrait
    switch (orientation) {
        case 'portrait':
            // No rotation needed
            break;
        case 'portrait-upside-down':
            // 180 degree rotation
            x = 1.0 - x;
            y = 1.0 - y;
            break;
        case 'landscape-left':
            // 90 degrees clockwise (sensor is rotated 90 CCW)
            // Swap and adjust: newX = y, newY = 1 - x
            const tempL = x;
            x = y;
            y = 1.0 - tempL;
            break;
        case 'landscape-right':
            // 90 degrees counter-clockwise (sensor is rotated 90 CW)
            // Swap and adjust: newX = 1 - y, newY = x
            const tempR = x;
            x = 1.0 - y;
            y = tempR;
            break;
    }

    // Apply mirroring for front camera
    if (isMirrored) {
        x = 1.0 - x;
    }

    // Scale to screen coordinates
    return {
        x: x * screenWidth,
        y: y * screenHeight,
    };
}

/**
 * Parse MoveNet output to keypoints with orientation handling
 * 
 * MoveNet outputs a tensor of shape [1, 1, 17, 3] containing:
 * - 17 keypoints
 * - Each keypoint has 3 values: [y, x, confidence]
 * - y and x are normalized coordinates [0, 1] in sensor orientation
 */
function parseOutput(
    output: ArrayBufferLike,
    orientation: string,
    isMirrored: boolean,
    screenWidth: number,
    screenHeight: number
): Keypoint[] {
    'worklet';
    const keypoints: Keypoint[] = [];
    const data = new Float32Array(output);

    for (let i = 0; i < 17; i++) {
        const baseIdx = i * 3;
        const normalizedY = data[baseIdx];
        const normalizedX = data[baseIdx + 1];
        const confidence = data[baseIdx + 2];

        // Transform from sensor coordinates to screen coordinates
        const { x, y } = transformCoordinates(
            normalizedX,
            normalizedY,
            orientation,
            isMirrored,
            screenWidth,
            screenHeight
        );

        keypoints.push({
            x,
            y,
            confidence,
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
    // Load the MoveNet TFLite model (int8 version for uint8 input compatibility)
    const modelResult = useTensorflowModel(require('@/assets/models/movenet_int8.tflite'));

    // Store model in a shared value for worklet access
    const modelRef = useSharedValue<TensorflowModel | null>(null);

    // Store screen dimensions in shared values for worklet access
    const screenWidth = useSharedValue(SCREEN_WIDTH);
    const screenHeight = useSharedValue(SCREEN_HEIGHT);

    // Get the resize plugin
    const { resize } = useResizePlugin();

    // Update shared value when model loads
    useEffect(() => {
        if (modelResult.state === 'loaded' && modelResult.model) {
            modelRef.value = modelResult.model;
            console.log('✅ MoveNet int8 model loaded successfully');
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
            const outputs = model.runSync([resized]);

            if (outputs && outputs.length > 0) {
                // 3. Get frame properties for coordinate transformation
                const orientation = frame.orientation;
                const isMirrored = frame.isMirrored;

                // 4. Parse output to keypoints with orientation handling
                const keypoints = parseOutput(
                    outputs[0].buffer,
                    orientation,
                    isMirrored,
                    screenWidth.value,
                    screenHeight.value
                );

                // 5. Map to PushUpPose
                const pushUpPose = mapToPushUpPose(keypoints, Date.now());

                if (pushUpPose) {
                    runOnJS(pushUpPose);
                }
            }
        } catch (_error) {
            // Silently handle errors in frame processor
        }
    }, [resize, runOnJS, modelRef, screenWidth, screenHeight]);
}

// Re-export mapToPushUpPose for testing if needed
export { mapToPushUpPose };

