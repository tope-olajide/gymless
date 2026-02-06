/**
 * Platform-aware Pose Detector Router
 * Exports the correct detector based on platform
 */

import { Platform } from 'react-native';

// Platform-specific imports
let PoseDetector: any;

if (Platform.OS === 'web') {
    // Use web detector with MediaPipe
    PoseDetector = require('./PoseDetector.web').WebPoseDetector;
} else {
    // Use native detector (Android/iOS)
    PoseDetector = require('./PoseDetector.native').NativePoseDetector;
}

export { PoseDetector };
export type { PushUpPose, Keypoint } from '@/types';
