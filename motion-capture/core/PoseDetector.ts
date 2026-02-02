import { Platform } from 'react-native';
import { PoseFrame } from '@/types/motion-capture';
import {
  convertMediaPipeLandmarksToFrame,
  isValidPose,
} from '@/motion-capture/constants/landmarks';

let MediaPipePose: any = null;

if (Platform.OS !== 'web') {
  try {
    MediaPipePose = require('@gymbrosinc/react-native-mediapipe-pose');
  } catch (error) {
    console.warn('Native MediaPipe not available:', error);
  }
}

export interface CameraFrame {
  width: number;
  height: number;
  data: any;
  timestamp: number;
}

export class PoseDetector {
  private detector: any = null;
  private isInitialized: boolean = false;
  private isInitializing: boolean = false;
  private lastFrameTime: number = 0;
  private frameSkipMs: number = 33;

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
      if (Platform.OS === 'web') {
        console.warn(
          'Native MediaPipe not available on web. Motion capture disabled.'
        );
        this.isInitializing = false;
        return false;
      }

      if (!MediaPipePose) {
        throw new Error('MediaPipe module not loaded');
      }

      this.detector = await MediaPipePose.createPoseDetector({
        modelComplexity: 1,
        smoothLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      this.isInitialized = true;
      this.isInitializing = false;

      console.log('Native MediaPipe pose detector initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize pose detector:', error);
      this.isInitializing = false;
      return false;
    }
  }

  async detectPose(frame: CameraFrame): Promise<PoseFrame | null> {
    if (!this.isInitialized || !this.detector) {
      return null;
    }

    const now = Date.now();
    if (now - this.lastFrameTime < this.frameSkipMs) {
      return null;
    }
    this.lastFrameTime = now;

    try {
      const result = await this.detector.detectPose(frame);

      if (!result || !result.landmarks || result.landmarks.length === 0) {
        return null;
      }

      const poseFrame = convertMediaPipeLandmarksToFrame(
        result.landmarks,
        frame.timestamp
      );

      if (!isValidPose(poseFrame)) {
        return null;
      }

      return poseFrame;
    } catch (error) {
      console.error('Pose detection error:', error);
      return null;
    }
  }

  setFrameRate(fps: number): void {
    this.frameSkipMs = Math.floor(1000 / fps);
  }

  async dispose(): Promise<void> {
    if (this.detector) {
      try {
        if (this.detector.dispose) {
          await this.detector.dispose();
        }
        this.detector = null;
        this.isInitialized = false;
        console.log('Pose detector disposed');
      } catch (error) {
        console.error('Error disposing pose detector:', error);
      }
    }
  }

  isReady(): boolean {
    return this.isInitialized && Platform.OS !== 'web';
  }
}
