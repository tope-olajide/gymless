export interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

export interface PoseFrame {
  timestamp: number;
  landmarks: {
    nose: PoseLandmark;
    leftEye: PoseLandmark;
    rightEye: PoseLandmark;
    leftEar: PoseLandmark;
    rightEar: PoseLandmark;
    leftShoulder: PoseLandmark;
    rightShoulder: PoseLandmark;
    leftElbow: PoseLandmark;
    rightElbow: PoseLandmark;
    leftWrist: PoseLandmark;
    rightWrist: PoseLandmark;
    leftHip: PoseLandmark;
    rightHip: PoseLandmark;
    leftKnee: PoseLandmark;
    rightKnee: PoseLandmark;
    leftAnkle: PoseLandmark;
    rightAnkle: PoseLandmark;
    leftHeel: PoseLandmark;
    rightHeel: PoseLandmark;
    leftFootIndex: PoseLandmark;
    rightFootIndex: PoseLandmark;
    leftPinky: PoseLandmark;
    rightPinky: PoseLandmark;
    leftIndex: PoseLandmark;
    rightIndex: PoseLandmark;
    leftThumb: PoseLandmark;
    rightThumb: PoseLandmark;
  };
}

export type MovementPattern =
  | 'squat-pattern'
  | 'hinge-pattern'
  | 'lunge-pattern'
  | 'push-pattern'
  | 'pull-pattern'
  | 'plank-pattern'
  | 'rotation-pattern'
  | 'single-leg-pattern';

export type CameraView = 'side' | 'front' | 'diagonal' | 'auto';

export interface RangeOfMotion {
  joint: string;
  axis: 'sagittal' | 'frontal' | 'transverse';
  minAngle: number;
  maxAngle: number;
  optimalRange: [number, number];
}

export interface AlignmentRule {
  name: string;
  points: string[];
  axis: 'x' | 'y' | 'z';
  tolerance: number;
  critical: boolean;
}

export interface SymmetryRule {
  leftPoint: string;
  rightPoint: string;
  maxDeviation: number;
}

export interface VelocityRule {
  phase: 'eccentric' | 'concentric' | 'isometric';
  expectedSpeed: 'slow' | 'moderate' | 'explosive';
  smoothnessThreshold: number;
}

export interface BiomechanicsConfig {
  primaryJoints: string[];
  secondaryJoints: string[];
  rangeOfMotion: RangeOfMotion[];
  alignment: AlignmentRule[];
  symmetry: SymmetryRule[];
  velocity: VelocityRule[];
}

export interface RepCountingConfig {
  triggerJoint: string;
  triggerAxis: 'y' | 'z';
  startThreshold: number;
  endThreshold: number;
  minDuration: number;
  requiresFullROM: boolean;
}

export interface FormRule {
  id: string;
  name: string;
  description: string;
  severity: 'critical' | 'major' | 'minor';
  measurement: {
    type: 'angle' | 'alignment' | 'symmetry' | 'velocity';
    points: string[];
    calculation: string;
    optimalValue: number | [number, number];
    tolerance: number;
  };
  feedback: {
    violation: string;
    correction: string;
  };
}

export interface CoachingConfig {
  setupCues: string[];
  commonMistakes: string[];
  motivationalCues: string[];
  correctionPriority: 'safety' | 'efficiency' | 'depth';
}

export interface SafetyConfig {
  stopConditions: string[];
  warningConditions: string[];
  requiresWarmup: boolean;
}

export interface ExerciseMotionCapture {
  supported: boolean;
  movementPattern: MovementPattern;
  cameraView: CameraView;
  biomechanics: BiomechanicsConfig;
  repCounting: RepCountingConfig;
  formRules: FormRule[];
  coaching: CoachingConfig;
  safety: SafetyConfig;
}

export interface RepState {
  count: number;
  phase: 'idle' | 'descending' | 'bottom' | 'ascending';
  rangeOfMotion: number;
}

export interface FormViolation {
  ruleId: string;
  severity: 'critical' | 'major' | 'minor';
  message: string;
  correction: string;
}

export interface FormMetrics {
  score: number;
  violations: FormViolation[];
  velocity: number;
  consistency: number;
  fatigueScore: number;
  rangeOfMotion: number;
}

export interface CoachingCue {
  message: string;
  type: 'safety' | 'form' | 'motivation';
  urgency: 'critical' | 'high' | 'normal';
  duration: number;
  timestamp: number;
}

export interface FormAnalytics {
  exerciseId: string;
  workoutId: string;
  date: string;
  totalReps: number;
  validReps: number;
  avgFormScore: number;
  peakFormScore: number;
  fatigueOnset: number | null;
  repScores: {
    repNumber: number;
    formScore: number;
    violations: string[];
    timestamp: number;
  }[];
  rangeOfMotionAvg: number;
  velocityAvg: number;
  consistencyScore: number;
  coachingCues: {
    timestamp: number;
    message: string;
    type: 'safety' | 'form' | 'motivation';
  }[];
}

export interface MotionCaptureSettings {
  enabled: boolean;
  showSkeleton: boolean;
  showAlignmentGuides: boolean;
  audioCoaching: boolean;
  hapticFeedback: boolean;
  cameraPosition: CameraView;
}
