import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';
import { PoseFrame, PoseLandmark } from '@/types/motion-capture';

const BLAZEPOSE_KEYPOINT_MAP = {
  0: 'nose',
  1: 'leftEye',
  2: 'rightEye',
  3: 'leftEar',
  4: 'rightEar',
  5: 'leftShoulder',
  6: 'rightShoulder',
  7: 'leftElbow',
  8: 'rightElbow',
  9: 'leftWrist',
  10: 'rightWrist',
  11: 'leftHip',
  12: 'rightHip',
  13: 'leftKnee',
  14: 'rightKnee',
  15: 'leftAnkle',
  16: 'rightAnkle',
  17: 'leftHeel',
  18: 'rightHeel',
  19: 'leftFootIndex',
  20: 'rightFootIndex',
  21: 'leftIndex',
  22: 'rightIndex',
  23: 'leftPinky',
  24: 'rightPinky',
  25: 'leftThumb',
  26: 'rightThumb',
} as const;

export class WebPoseDetector {
  private detector: poseDetection.PoseDetector | null = null;
  private isInitialized: boolean = false;
  private lastFrameTime: number = 0;
  private targetFPS: number = 30;
  private frameSkipMs: number = 33;

  async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return true;
    }

    try {
      await tf.ready();

      const model = poseDetection.SupportedModels.BlazePose;
      const detectorConfig: poseDetection.BlazePoseMediaPipeModelConfig = {
        runtime: 'mediapipe',
        modelType: 'lite',
        solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/pose',
      };

      this.detector = await poseDetection.createDetector(model, detectorConfig);
      this.isInitialized = true;
      console.log('WebPoseDetector initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize WebPoseDetector:', error);
      this.isInitialized = false;
      return false;
    }
  }

  async detectPose(video: HTMLVideoElement): Promise<PoseFrame | null> {
    if (!this.isInitialized || !this.detector) {
      return null;
    }

    const now = Date.now();
    if (now - this.lastFrameTime < this.frameSkipMs) {
      return null;
    }
    this.lastFrameTime = now;

    try {
      const poses = await this.detector.estimatePoses(video, {
        flipHorizontal: false,
      });

      if (!poses || poses.length === 0) {
        return null;
      }

      const pose = poses[0];
      if (!pose.keypoints || pose.keypoints.length < 27) {
        return null;
      }

      return this.convertToPoseFrame(pose.keypoints, now);
    } catch (error) {
      console.error('Pose detection error:', error);
      return null;
    }
  }

  private convertToPoseFrame(
    keypoints: poseDetection.Keypoint[],
    timestamp: number
  ): PoseFrame {
    const landmarks: any = {};

    for (let i = 0; i < keypoints.length && i < 27; i++) {
      const kp = keypoints[i];
      const landmarkName = BLAZEPOSE_KEYPOINT_MAP[i as keyof typeof BLAZEPOSE_KEYPOINT_MAP];

      if (landmarkName) {
        landmarks[landmarkName] = {
          x: kp.x || 0,
          y: kp.y || 0,
          z: (kp as any).z || 0,
          visibility: kp.score || 0,
        } as PoseLandmark;
      }
    }

    return {
      timestamp,
      landmarks,
    } as PoseFrame;
  }

  setFrameRate(fps: number): void {
    this.targetFPS = fps;
    this.frameSkipMs = Math.floor(1000 / fps);
  }

  async dispose(): Promise<void> {
    if (this.detector) {
      try {
        this.detector.dispose();
        this.detector = null;
        this.isInitialized = false;
        console.log('WebPoseDetector disposed');
      } catch (error) {
        console.error('Error disposing WebPoseDetector:', error);
      }
    }
  }

  isReady(): boolean {
    return this.isInitialized;
  }
}
