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
 * CRITICAL: vision-camera-resize-plugin performs CENTER-CROP when resizing
 * to a different aspect ratio. For a portrait frame resized to a square:
 * - Full width is used
 * - Top and bottom are cropped equally
 * 
 * Model outputs [0,1] coordinates relative to the CROP, not the full frame.
 * We must reverse this crop when mapping to screen coordinates.
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
 * Transform coordinates from model output space to screen space
 * 
 * The resize plugin center-crops the frame to a square before resizing to 192x192.
 * For a portrait frame (height > width):
 * - crop_size = frame_width (uses full width)
 * - crop_y_offset = (frame_height - frame_width) / 2
 * 
 * Model outputs [0,1] coordinates relative to this crop.
 * We need to:
 * 1. Scale to crop dimensions
 * 2. Add crop offset
 * 3. Scale to screen dimensions
 */
function transformToScreenCoordinates(
    normalizedX: number,
    normalizedY: number,
    frameWidth: number,
    frameHeight: number,
    screenWidth: number,
    screenHeight: number,
    orientation: string,
    isMirrored: boolean
): { x: number; y: number } {
    'worklet';

    // For portrait orientation (height > width), the crop uses full width
    // and crops equal amounts from top/bottom
    const isPortrait = frameHeight > frameWidth;
    const cropSize = isPortrait ? frameWidth : frameHeight;

    // Calculate crop offset
    const cropOffsetX = isPortrait ? 0 : (frameWidth - cropSize) / 2;
    const cropOffsetY = isPortrait ? (frameHeight - cropSize) / 2 : 0;

    // Scale normalized [0,1] coordinates to crop coordinate space
    let cropX = normalizedX * cropSize;
    let cropY = normalizedY * cropSize;

    // Add offset to get position in full frame
    let frameX = cropX + cropOffsetX;
    let frameY = cropY + cropOffsetY;

    // Apply rotation based on frame orientation
    // The frame.orientation tells us how the sensor is rotated
    switch (orientation) {
        case 'portrait':
            // No rotation needed for portrait
            break;
        case 'portrait-upside-down':
            // 180 degree rotation
            frameX = frameWidth - frameX;
            frameY = frameHeight - frameY;
            break;
        case 'landscape-left':
            // 90 degrees - swap and adjust
            const tempL = frameX;
            frameX = frameY;
            frameY = frameHeight - tempL;
            break;
        case 'landscape-right':
            // 270 degrees - swap and adjust
            const tempR = frameX;
            frameX = frameWidth - frameY;
            frameY = tempR;
            break;
    }

    // Apply mirroring for front camera
    if (isMirrored) {
        frameX = frameWidth - frameX;
    }

    // Scale from frame coordinates to screen coordinates
    const screenX = (frameX / frameWidth) * screenWidth;
    const screenY = (frameY / frameHeight) * screenHeight;

    return { x: screenX, y: screenY };
}

/**
 * Parse MoveNet output to keypoints with proper coordinate transformation
 * 
 * MoveNet outputs a tensor of shape [1, 1, 17, 3] containing:
 * - 17 keypoints
 * - Each keypoint has 3 values: [y, x, confidence]
 * - y and x are normalized [0, 1] relative to the CENTER-CROPPED input
 */
function parseOutput(
    output: ArrayBufferLike,
    frameWidth: number,
    frameHeight: number,
    screenWidth: number,
    screenHeight: number,
    orientation: string,
    isMirrored: boolean
): Keypoint[] {
    'worklet';
    const keypoints: Keypoint[] = [];
    const data = new Float32Array(output);

    for (let i = 0; i < 17; i++) {
        const baseIdx = i * 3;
        const normalizedY = data[baseIdx];      // y comes first in MoveNet output
        const normalizedX = data[baseIdx + 1];  // x comes second
        const confidence = data[baseIdx + 2];

        // Transform from crop coordinates to screen coordinates
        const { x, y } = transformToScreenCoordinates(
            normalizedX,
            normalizedY,
            frameWidth,
            frameHeight,
            screenWidth,
            screenHeight,
            orientation,
            isMirrored
        );

        keypoints.push({ x, y, confidence });
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
            return;
        }

        try {
            // 1. Resize frame to 192x192 (center-crop + scale)
            const resized = resize(frame, {
                scale: {
                    width: MODEL_INPUT_SIZE,
                    height: MODEL_INPUT_SIZE,
                },
                pixelFormat: 'rgb',
                dataType: 'uint8',
            });

            // 2. Run MoveNet inference
            const outputs = model.runSync([resized]);

            if (outputs && outputs.length > 0) {
                // 3. Parse output with proper coordinate transformation
                // Pass frame dimensions to account for center-crop
                const keypoints = parseOutput(
                    outputs[0].buffer,
                    frame.width,
                    frame.height,
                    screenWidth.value,
                    screenHeight.value,
                    frame.orientation,
                    frame.isMirrored
                );

                // 4. Map to PushUpPose
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

export { mapToPushUpPose };

