import {
  PoseFrame,
  FormMetrics,
  FormViolation,
  ExerciseMotionCapture,
  FormRule,
} from '@/types/motion-capture';
import {
  calculateAngle,
  getLandmark,
  isPointAligned,
  calculateSymmetry,
  calculateVelocity,
  calculateSmoothness,
  calculateKneeAngle,
  calculateElbowAngle,
  calculateTorsoAngle,
  detectKneeValgus,
  isLandmarkVisible,
} from '../utils/biomechanicsUtils';

export class FormScorer {
  private definition: ExerciseMotionCapture;
  private frameBuffer: PoseFrame[] = [];
  private velocityBuffer: number[] = [];
  private scoreHistory: number[] = [];
  private maxBufferSize: number = 60;

  constructor(definition: ExerciseMotionCapture) {
    this.definition = definition;
  }

  evaluate(frame: PoseFrame): FormMetrics {
    this.frameBuffer.push(frame);
    if (this.frameBuffer.length > this.maxBufferSize) {
      this.frameBuffer.shift();
    }

    if (this.frameBuffer.length > 1) {
      const velocity = calculateVelocity(
        frame,
        this.frameBuffer[this.frameBuffer.length - 2],
        this.definition.repCounting.triggerJoint
      );
      this.velocityBuffer.push(velocity);
      if (this.velocityBuffer.length > this.maxBufferSize) {
        this.velocityBuffer.shift();
      }
    }

    const violations = this.checkFormRules(frame);
    const score = this.calculateFormScore(violations);

    this.scoreHistory.push(score);
    if (this.scoreHistory.length > 10) {
      this.scoreHistory.shift();
    }

    const consistency = this.calculateConsistency();
    const velocity = this.getAverageVelocity();
    const smoothness = calculateSmoothness(this.velocityBuffer);
    const fatigueScore = this.detectFatigue();
    const rangeOfMotion = this.calculateROM(frame);

    return {
      score,
      violations,
      velocity,
      consistency,
      fatigueScore,
      rangeOfMotion,
    };
  }

  private checkFormRules(frame: PoseFrame): FormViolation[] {
    const violations: FormViolation[] = [];

    for (const rule of this.definition.formRules) {
      const violation = this.evaluateRule(frame, rule);
      if (violation) {
        violations.push(violation);
      }
    }

    return violations;
  }

  private evaluateRule(frame: PoseFrame, rule: FormRule): FormViolation | null {
    try {
      switch (rule.measurement.type) {
        case 'angle':
          return this.evaluateAngleRule(frame, rule);
        case 'alignment':
          return this.evaluateAlignmentRule(frame, rule);
        case 'symmetry':
          return this.evaluateSymmetryRule(frame, rule);
        case 'velocity':
          return this.evaluateVelocityRule(frame, rule);
        default:
          return null;
      }
    } catch (error) {
      console.error(`Error evaluating rule ${rule.id}:`, error);
      return null;
    }
  }

  private evaluateAngleRule(frame: PoseFrame, rule: FormRule): FormViolation | null {
    const { points, calculation } = rule.measurement;

    let angle = 0;

    if (calculation === 'knee-angle') {
      angle = calculateKneeAngle(frame, 'left');
    } else if (calculation === 'elbow-angle') {
      angle = calculateElbowAngle(frame, 'left');
    } else if (calculation === 'torso-angle') {
      angle = calculateTorsoAngle(frame);
    } else if (points.length === 3) {
      const p1 = getLandmark(frame, points[0]);
      const p2 = getLandmark(frame, points[1]);
      const p3 = getLandmark(frame, points[2]);
      angle = calculateAngle(p1, p2, p3);
    }

    const optimal = rule.measurement.optimalValue;
    const tolerance = rule.measurement.tolerance;

    let isValid = false;

    if (Array.isArray(optimal)) {
      isValid = angle >= optimal[0] - tolerance && angle <= optimal[1] + tolerance;
    } else {
      isValid = Math.abs(angle - optimal) <= tolerance;
    }

    if (!isValid) {
      return {
        ruleId: rule.id,
        severity: rule.severity,
        message: rule.feedback.violation,
        correction: rule.feedback.correction,
      };
    }

    return null;
  }

  private evaluateAlignmentRule(frame: PoseFrame, rule: FormRule): FormViolation | null {
    const { points, calculation } = rule.measurement;

    if (calculation === 'knee-valgus') {
      const hasValgus = detectKneeValgus(frame, 'left') || detectKneeValgus(frame, 'right');
      if (hasValgus) {
        return {
          ruleId: rule.id,
          severity: rule.severity,
          message: rule.feedback.violation,
          correction: rule.feedback.correction,
        };
      }
    } else if (calculation === 'middle-point-deviation' && points.length === 3) {
      const p1 = getLandmark(frame, points[0]);
      const p2 = getLandmark(frame, points[1]);
      const p3 = getLandmark(frame, points[2]);

      const isAligned = isPointAligned(p1, p2, p3, 'y', rule.measurement.tolerance);

      if (!isAligned) {
        return {
          ruleId: rule.id,
          severity: rule.severity,
          message: rule.feedback.violation,
          correction: rule.feedback.correction,
        };
      }
    }

    return null;
  }

  private evaluateSymmetryRule(frame: PoseFrame, rule: FormRule): FormViolation | null {
    const { points } = rule.measurement;

    if (points.length === 2) {
      const left = getLandmark(frame, points[0]);
      const right = getLandmark(frame, points[1]);

      const deviation = calculateSymmetry(left, right, 'y');

      if (deviation > rule.measurement.tolerance) {
        return {
          ruleId: rule.id,
          severity: rule.severity,
          message: rule.feedback.violation,
          correction: rule.feedback.correction,
        };
      }
    }

    return null;
  }

  private evaluateVelocityRule(frame: PoseFrame, rule: FormRule): FormViolation | null {
    if (this.velocityBuffer.length < 5) {
      return null;
    }

    const avgVelocity = this.getAverageVelocity();
    const smoothness = calculateSmoothness(this.velocityBuffer);

    if (smoothness < rule.measurement.tolerance) {
      return {
        ruleId: rule.id,
        severity: rule.severity,
        message: rule.feedback.violation,
        correction: rule.feedback.correction,
      };
    }

    return null;
  }

  private calculateFormScore(violations: FormViolation[]): number {
    let score = 100;

    for (const violation of violations) {
      switch (violation.severity) {
        case 'critical':
          score -= 30;
          break;
        case 'major':
          score -= 15;
          break;
        case 'minor':
          score -= 5;
          break;
      }
    }

    return Math.max(0, Math.min(100, score));
  }

  private calculateConsistency(): number {
    if (this.scoreHistory.length < 3) {
      return 1.0;
    }

    const avg = this.scoreHistory.reduce((a, b) => a + b, 0) / this.scoreHistory.length;
    let variance = 0;

    for (const score of this.scoreHistory) {
      variance += Math.pow(score - avg, 2);
    }

    variance /= this.scoreHistory.length;
    const stdDev = Math.sqrt(variance);

    const consistency = 1 - Math.min(stdDev / 50, 1);

    return consistency;
  }

  private getAverageVelocity(): number {
    if (this.velocityBuffer.length === 0) {
      return 0;
    }

    return this.velocityBuffer.reduce((a, b) => a + b, 0) / this.velocityBuffer.length;
  }

  private detectFatigue(): number {
    if (this.scoreHistory.length < 5) {
      return 0;
    }

    const recent = this.scoreHistory.slice(-5);
    const earlier = this.scoreHistory.slice(0, 5);

    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const earlierAvg = earlier.reduce((a, b) => a + b, 0) / earlier.length;

    const drop = earlierAvg - recentAvg;

    return Math.max(0, Math.min(1, drop / 30));
  }

  private calculateROM(frame: PoseFrame): number {
    if (this.definition.repCounting.triggerJoint === 'timer') {
      return 100;
    }

    const joint = getLandmark(frame, this.definition.repCounting.triggerJoint);
    const currentValue = joint[this.definition.repCounting.triggerAxis];

    if (this.frameBuffer.length < 10) {
      return 50;
    }

    const values = this.frameBuffer.map((f) => {
      const j = getLandmark(f, this.definition.repCounting.triggerJoint);
      return j[this.definition.repCounting.triggerAxis];
    });

    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;

    const expectedRange = Math.abs(
      this.definition.repCounting.endThreshold - this.definition.repCounting.startThreshold
    );

    return Math.min((range / expectedRange) * 100, 100);
  }

  reset(): void {
    this.frameBuffer = [];
    this.velocityBuffer = [];
    this.scoreHistory = [];
  }

  getAverageScore(): number {
    if (this.scoreHistory.length === 0) {
      return 0;
    }

    return this.scoreHistory.reduce((a, b) => a + b, 0) / this.scoreHistory.length;
  }
}
