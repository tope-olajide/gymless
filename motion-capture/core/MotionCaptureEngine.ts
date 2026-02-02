import { RepCounter } from './RepCounter';
import { FormScorer } from './FormScorer';
import { GeminiClient } from './GeminiClient';
import {
  PoseFrame,
  RepState,
  FormMetrics,
  CoachingCue,
  ExerciseMotionCapture,
  FormAnalytics,
} from '@/types/motion-capture';

export interface MotionCaptureConfig {
  exerciseDefinition: ExerciseMotionCapture;
  geminiApiKey: string;
  onRepComplete?: (count: number) => void;
  onCoachingCue?: (cue: CoachingCue) => void;
  onFormUpdate?: (metrics: FormMetrics) => void;
}

export class MotionCaptureEngine {
  private repCounter: RepCounter;
  private formScorer: FormScorer;
  private geminiClient: GeminiClient;
  private config: MotionCaptureConfig;
  private isRunning: boolean = false;
  private lastPoseFrame: PoseFrame | null = null;
  private analytics: Partial<FormAnalytics> = {};
  private lastGeminiCallTime: number = 0;
  private geminiCallDebounceMs: number = 3000;

  constructor(config: MotionCaptureConfig) {
    this.config = config;
    this.repCounter = new RepCounter(config.exerciseDefinition.repCounting);
    this.formScorer = new FormScorer(config.exerciseDefinition);
    this.geminiClient = new GeminiClient(config.geminiApiKey);

    if (config.onRepComplete) {
      this.repCounter.onRepComplete(config.onRepComplete);
    }

    this.analytics = {
      totalReps: 0,
      validReps: 0,
      repScores: [],
      coachingCues: [],
    };
  }

  start(): void {
    if (this.isRunning) {
      console.warn('Motion capture already running');
      return;
    }

    this.isRunning = true;
    this.analytics.repScores = [];
    this.analytics.coachingCues = [];
  }

  stop(): void {
    this.isRunning = false;
  }

  async processPoseFrame(poseFrame: PoseFrame): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    try {
      this.lastPoseFrame = poseFrame;

      const repState = this.repCounter.analyze(poseFrame);
      const formMetrics = this.formScorer.evaluate(poseFrame);

      if (this.config.onFormUpdate) {
        this.config.onFormUpdate(formMetrics);
      }

      this.recordRepScore(repState, formMetrics);

      const now = Date.now();
      if (now - this.lastGeminiCallTime >= this.geminiCallDebounceMs) {
        this.lastGeminiCallTime = now;

        const coachingCue = await this.geminiClient.getCoachingFeedback(
          this.config.exerciseDefinition.movementPattern,
          formMetrics,
          repState
        );

        if (coachingCue && this.config.onCoachingCue) {
          this.config.onCoachingCue(coachingCue);
          this.analytics.coachingCues?.push({
            timestamp: coachingCue.timestamp,
            message: coachingCue.message,
            type: coachingCue.type,
          });
        }
      }
    } catch (error) {
      console.error('Frame processing error:', error);
    }
  }

  private recordRepScore(repState: RepState, formMetrics: FormMetrics): void {
    const currentCount = repState.count;

    if (currentCount > (this.analytics.totalReps || 0)) {
      this.analytics.totalReps = currentCount;

      if (formMetrics.score >= 70) {
        this.analytics.validReps = (this.analytics.validReps || 0) + 1;
      }

      this.analytics.repScores?.push({
        repNumber: currentCount,
        formScore: formMetrics.score,
        violations: formMetrics.violations.map((v) => v.message),
        timestamp: Date.now(),
      });
    }
  }

  getLastPoseFrame(): PoseFrame | null {
    return this.lastPoseFrame;
  }

  getRepCount(): number {
    return this.repCounter.getCount();
  }

  getCurrentPhase(): 'idle' | 'descending' | 'bottom' | 'ascending' {
    return this.repCounter.getCurrentPhase();
  }

  getAverageFormScore(): number {
    return this.formScorer.getAverageScore();
  }

  getAnalytics(): Partial<FormAnalytics> {
    const avgScore = this.formScorer.getAverageScore();

    return {
      ...this.analytics,
      avgFormScore: avgScore,
      peakFormScore: Math.max(...(this.analytics.repScores?.map((r) => r.formScore) || [0])),
    };
  }

  reset(): void {
    this.repCounter.reset();
    this.formScorer.reset();
    this.analytics = {
      totalReps: 0,
      validReps: 0,
      repScores: [],
      coachingCues: [],
    };
  }

  dispose(): void {
    this.stop();
  }

  isReady(): boolean {
    return this.config.exerciseDefinition.supported;
  }
}
