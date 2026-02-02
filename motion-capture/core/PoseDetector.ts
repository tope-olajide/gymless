import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import { PoseFrame, PoseLandmark } from '@/types/motion-capture';

export class PoseDetector {
  private detector: poseDetection.PoseDetector | null = null;
  private isInitialized: boolean = false;
  private isInitializing: boolean = false;

  async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return true;
    }

    if (this.isInitializing) {
      while (this.isInitializing) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      return this.isInitialized;
    }

    this.isInitializing = true;

    try {
      await tf.ready();
      await tf.setBackend('webgl');

      const model = poseDetection.SupportedModels.MoveNet;
      const detectorConfig: poseDetection.MoveNetModelConfig = {
        modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER,
        enableSmoothing: true,
        minPoseScore: 0.3,
      };

      this.detector = await poseDetection.createDetector(model, detectorConfig);
      this.isInitialized = true;
      this.isInitializing = false;

      console.log('Pose detector initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize pose detector:', error);
      this.isInitializing = false;
      return false;
    }
  }

  async detectPose(videoElement: HTMLVideoElement): Promise<PoseFrame | null> {
    if (!this.isInitialized || !this.detector) {
      console.warn('Pose detector not initialized');
      return null;
    }

    try {
      const poses = await this.detector.estimatePoses(videoElement);

      if (poses.length === 0) {
        return null;
      }

      const pose = poses[0];
      return this.convertToInternalFormat(pose);
    } catch (error) {
      console.error('Pose detection error:', error);
      return null;
    }
  }

  private convertToInternalFormat(pose: poseDetection.Pose): PoseFrame {
    const keypoints = pose.keypoints;

    const getLandmark = (name: string): PoseLandmark => {
      const kp = keypoints.find((k) => k.name === name);
      if (!kp) {
        return { x: 0, y: 0, z: 0, visibility: 0 };
      }

      return {
        x: kp.x || 0,
        y: kp.y || 0,
        z: (kp as any).z || 0,
        visibility: kp.score || 0,
      };
    };

    return {
      timestamp: Date.now(),
      landmarks: {
        nose: getLandmark('nose'),
        leftEye: getLandmark('left_eye'),
        rightEye: getLandmark('right_eye'),
        leftEar: getLandmark('left_ear'),
        rightEar: getLandmark('right_ear'),
        leftShoulder: getLandmark('left_shoulder'),
        rightShoulder: getLandmark('right_shoulder'),
        leftElbow: getLandmark('left_elbow'),
        rightElbow: getLandmark('right_elbow'),
        leftWrist: getLandmark('left_wrist'),
        rightWrist: getLandmark('right_wrist'),
        leftHip: getLandmark('left_hip'),
        rightHip: getLandmark('right_hip'),
        leftKnee: getLandmark('left_knee'),
        rightKnee: getLandmark('right_knee'),
        leftAnkle: getLandmark('left_ankle'),
        rightAnkle: getLandmark('right_ankle'),
        leftHeel: getLandmark('left_heel'),
        rightHeel: getLandmark('right_heel'),
        leftFootIndex: getLandmark('left_foot_index'),
        rightFootIndex: getLandmark('right_foot_index'),
        leftPinky: getLandmark('left_pinky'),
        rightPinky: getLandmark('right_pinky'),
        leftIndex: getLandmark('left_index'),
        rightIndex: getLandmark('right_index'),
        leftThumb: getLandmark('left_thumb'),
        rightThumb: getLandmark('right_thumb'),
      },
    };
  }

  async dispose(): Promise<void> {
    if (this.detector) {
      this.detector.dispose();
      this.detector = null;
      this.isInitialized = false;
      console.log('Pose detector disposed');
    }
  }

  isReady(): boolean {
    return this.isInitialized;
  }
}
