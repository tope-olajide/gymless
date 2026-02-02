import { PoseFrame } from '@/types/motion-capture';

export class WebPoseDetector {
  async initialize(): Promise<boolean> {
    console.warn('WebPoseDetector is not available on native platforms');
    return false;
  }

  async detectPose(_video: any): Promise<PoseFrame | null> {
    return null;
  }

  setFrameRate(_fps: number): void {}

  async dispose(): Promise<void> {}

  isReady(): boolean {
    return false;
  }
}
