/**
 * Web Pose Detector using MoveNet (more reliable than BlazePose for web)
 * Detects push-up specific pose keypoints from webcam
 */

import { Keypoint, PushUpPose } from '@/types';
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs';

// MoveNet keypoint indices (17 keypoints)
const KEYPOINT_INDICES = {
    NOSE: 0,
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

export class WebPoseDetector {
    private detector: poseDetection.PoseDetector | null = null;
    private isInitialized: boolean = false;

    /**
     * Initialize the pose detector with MoveNet (faster & more reliable)
     */
    async initialize(): Promise<boolean> {
        try {
            console.log('🔄 Setting TensorFlow.js backend...');

            // Try WebGL first, fall back to WASM
            try {
                await tf.setBackend('webgl');
                await tf.ready();
                console.log('✅ Using WebGL backend');
            } catch (e) {
                console.log('⚠️ WebGL failed, trying WASM...');
                await tf.setBackend('wasm');
                await tf.ready();
                console.log('✅ Using WASM backend');
            }

            console.log('TensorFlow.js backend:', tf.getBackend());
            console.log('🔄 Loading MoveNet model (this may take 10-30 seconds)...');

            // Use MoveNet Lightning (faster) or Thunder (more accurate)
            const model = poseDetection.SupportedModels.MoveNet;
            const detectorConfig: poseDetection.MoveNetModelConfig = {
                modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
                enableSmoothing: true,
            };

            this.detector = await poseDetection.createDetector(model, detectorConfig);
            this.isInitialized = true;

            console.log('✅ WebPoseDetector initialized with MoveNet!');
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize WebPoseDetector:', error);
            this.isInitialized = false;
            return false;
        }
    }

    /**
     * Detect pose from video element
     */
    async detectPose(video: HTMLVideoElement): Promise<PushUpPose | null> {
        if (!this.detector || !this.isInitialized) {
            console.warn('Detector not initialized');
            return null;
        }

        // Make sure video is ready
        if (video.readyState < 2) {
            return null;
        }

        try {
            const poses = await this.detector.estimatePoses(video, {
                flipHorizontal: false,
            });

            if (poses.length === 0) {
                return null;
            }

            const pose = poses[0];

            // Log keypoint count for debugging
            if (pose.keypoints.length > 0) {
                const validKeypoints = pose.keypoints.filter(kp => (kp.score || 0) > 0.3).length;
                if (validKeypoints < 5) {
                    console.log(`⚠️ Only ${validKeypoints} keypoints detected with confidence > 0.3`);
                }
            }

            return this.convertToPushUpPose(pose);
        } catch (error) {
            console.error('Error detecting pose:', error);
            return null;
        }
    }

    /**
     * Convert MoveNet pose to our PushUpPose format
     */
    private convertToPushUpPose(pose: poseDetection.Pose): PushUpPose {
        const keypoints = pose.keypoints;

        const getKeypoint = (index: number): Keypoint => {
            if (index >= keypoints.length) {
                return { x: 0, y: 0, z: 0, confidence: 0 };
            }
            const kp = keypoints[index];
            return {
                x: kp.x || 0,
                y: kp.y || 0,
                z: 0,
                confidence: kp.score || 0,
            };
        };

        return {
            timestamp: Date.now(),
            nose: getKeypoint(KEYPOINT_INDICES.NOSE),
            leftShoulder: getKeypoint(KEYPOINT_INDICES.LEFT_SHOULDER),
            rightShoulder: getKeypoint(KEYPOINT_INDICES.RIGHT_SHOULDER),
            leftElbow: getKeypoint(KEYPOINT_INDICES.LEFT_ELBOW),
            rightElbow: getKeypoint(KEYPOINT_INDICES.RIGHT_ELBOW),
            leftWrist: getKeypoint(KEYPOINT_INDICES.LEFT_WRIST),
            rightWrist: getKeypoint(KEYPOINT_INDICES.RIGHT_WRIST),
            leftHip: getKeypoint(KEYPOINT_INDICES.LEFT_HIP),
            rightHip: getKeypoint(KEYPOINT_INDICES.RIGHT_HIP),
            leftKnee: getKeypoint(KEYPOINT_INDICES.LEFT_KNEE),
            rightKnee: getKeypoint(KEYPOINT_INDICES.RIGHT_KNEE),
            leftAnkle: getKeypoint(KEYPOINT_INDICES.LEFT_ANKLE),
            rightAnkle: getKeypoint(KEYPOINT_INDICES.RIGHT_ANKLE),
        };
    }

    /**
     * Cleanup resources
     */
    async dispose(): Promise<void> {
        if (this.detector) {
            this.detector.dispose();
            this.detector = null;
        }
        this.isInitialized = false;
    }

    /**
     * Check if detector is ready
     */
    isReady(): boolean {
        return this.isInitialized && this.detector !== null;
    }
}
