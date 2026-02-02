import { PoseFrame, RepState, RepCountingConfig } from '@/types/motion-capture';
import { getLandmark } from '../utils/biomechanicsUtils';

export class RepCounter {
  private state: 'idle' | 'descending' | 'bottom' | 'ascending' = 'idle';
  private repCount: number = 0;
  private lastTriggerTime: number = 0;
  private config: RepCountingConfig;
  private onRepCompleteCallback?: (count: number) => void;
  private startValue: number = 0;
  private bottomValue: number = 0;

  constructor(config: RepCountingConfig) {
    this.config = config;
  }

  analyze(frame: PoseFrame): RepState {
    if (this.config.triggerJoint === 'timer') {
      return {
        count: this.repCount,
        phase: 'idle',
        rangeOfMotion: 0,
      };
    }

    const joint = getLandmark(frame, this.config.triggerJoint);
    const currentValue = joint[this.config.triggerAxis];
    const now = Date.now();

    switch (this.state) {
      case 'idle':
        this.startValue = currentValue;
        this.state = 'descending';
        break;

      case 'descending':
        if (currentValue <= this.config.startThreshold) {
          if (now - this.lastTriggerTime > this.config.minDuration) {
            this.bottomValue = currentValue;
            this.state = 'bottom';
          }
        }
        break;

      case 'bottom':
        if (currentValue > this.config.startThreshold) {
          this.state = 'ascending';
        } else {
          this.bottomValue = Math.min(this.bottomValue, currentValue);
        }
        break;

      case 'ascending':
        if (currentValue >= this.config.endThreshold) {
          if (now - this.lastTriggerTime > this.config.minDuration) {
            this.repCount++;
            this.lastTriggerTime = now;
            this.state = 'descending';
            this.startValue = currentValue;

            if (this.onRepCompleteCallback) {
              this.onRepCompleteCallback(this.repCount);
            }
          }
        }
        break;
    }

    const rom = this.calculateRangeOfMotion(this.startValue, this.bottomValue);

    return {
      count: this.repCount,
      phase: this.state,
      rangeOfMotion: rom,
    };
  }

  private calculateRangeOfMotion(start: number, bottom: number): number {
    const range = Math.abs(start - bottom);
    const maxExpected = Math.abs(
      this.config.endThreshold - this.config.startThreshold
    );

    return Math.min((range / maxExpected) * 100, 100);
  }

  reset(): void {
    this.state = 'idle';
    this.repCount = 0;
    this.lastTriggerTime = 0;
    this.startValue = 0;
    this.bottomValue = 0;
  }

  onRepComplete(callback: (count: number) => void): void {
    this.onRepCompleteCallback = callback;
  }

  getCount(): number {
    return this.repCount;
  }

  getCurrentPhase(): 'idle' | 'descending' | 'bottom' | 'ascending' {
    return this.state;
  }
}
