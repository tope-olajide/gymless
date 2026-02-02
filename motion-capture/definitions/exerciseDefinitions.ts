import { ExerciseMotionCapture } from '@/types/motion-capture';

export const SQUAT_DEFINITION: ExerciseMotionCapture = {
  supported: true,
  movementPattern: 'squat-pattern',
  cameraView: 'side',

  biomechanics: {
    primaryJoints: ['hip', 'knee', 'ankle'],
    secondaryJoints: ['shoulder', 'spine'],

    rangeOfMotion: [
      {
        joint: 'knee',
        axis: 'sagittal',
        minAngle: 70,
        maxAngle: 175,
        optimalRange: [80, 90],
      },
      {
        joint: 'hip',
        axis: 'sagittal',
        minAngle: 60,
        maxAngle: 175,
        optimalRange: [70, 85],
      },
    ],

    alignment: [
      {
        name: 'knee-tracking',
        points: ['knee', 'ankle', 'footIndex'],
        axis: 'x',
        tolerance: 0.05,
        critical: true,
      },
    ],

    symmetry: [
      {
        leftPoint: 'hip',
        rightPoint: 'hip',
        maxDeviation: 0.03,
      },
    ],

    velocity: [
      {
        phase: 'eccentric',
        expectedSpeed: 'moderate',
        smoothnessThreshold: 0.8,
      },
    ],
  },

  repCounting: {
    triggerJoint: 'hip',
    triggerAxis: 'y',
    startThreshold: 0.65,
    endThreshold: 0.90,
    minDuration: 800,
    requiresFullROM: true,
  },

  formRules: [
    {
      id: 'squat-depth',
      name: 'Depth',
      description: 'Hips below knee level',
      severity: 'major',
      measurement: {
        type: 'angle',
        points: ['hip', 'knee', 'ankle'],
        calculation: 'knee-angle',
        optimalValue: [80, 95],
        tolerance: 10,
      },
      feedback: {
        violation: 'Shallow squat',
        correction: 'Lower to parallel',
      },
    },
    {
      id: 'spine-neutral',
      name: 'Neutral Spine',
      description: 'Back stays straight',
      severity: 'critical',
      measurement: {
        type: 'angle',
        points: ['shoulder', 'hip', 'knee'],
        calculation: 'torso-angle',
        optimalValue: [75, 85],
        tolerance: 8,
      },
      feedback: {
        violation: 'Rounded back',
        correction: 'Chest up. Neutral spine.',
      },
    },
    {
      id: 'knee-valgus',
      name: 'Knee Tracking',
      description: 'Knees track over toes',
      severity: 'critical',
      measurement: {
        type: 'alignment',
        points: ['knee', 'ankle'],
        calculation: 'knee-valgus',
        optimalValue: 0,
        tolerance: 0.05,
      },
      feedback: {
        violation: 'Knees caving in',
        correction: 'Push knees out',
      },
    },
  ],

  coaching: {
    setupCues: [
      'Stand hip-width apart',
      'Toes slightly out',
      'Camera at hip level, 6 feet away',
    ],
    commonMistakes: ['knees-cave-in', 'forward-lean', 'heels-lift'],
    motivationalCues: [
      'Perfect form. Keep going.',
      'Strong control. 3 more.',
      'Depth looks good.',
    ],
    correctionPriority: 'safety',
  },

  safety: {
    stopConditions: ['excessive-forward-lean', 'knee-valgus-severe'],
    warningConditions: ['partial-ROM', 'asymmetric-loading'],
    requiresWarmup: false,
  },
};

export const PUSHUP_DEFINITION: ExerciseMotionCapture = {
  supported: true,
  movementPattern: 'push-pattern',
  cameraView: 'side',

  biomechanics: {
    primaryJoints: ['shoulder', 'elbow', 'wrist'],
    secondaryJoints: ['hip', 'ankle'],

    rangeOfMotion: [
      {
        joint: 'elbow',
        axis: 'sagittal',
        minAngle: 75,
        maxAngle: 175,
        optimalRange: [75, 90],
      },
    ],

    alignment: [
      {
        name: 'plank-position',
        points: ['shoulder', 'hip', 'ankle'],
        axis: 'y',
        tolerance: 0.05,
        critical: true,
      },
    ],

    symmetry: [
      {
        leftPoint: 'elbow',
        rightPoint: 'elbow',
        maxDeviation: 0.04,
      },
    ],

    velocity: [
      {
        phase: 'eccentric',
        expectedSpeed: 'moderate',
        smoothnessThreshold: 0.8,
      },
    ],
  },

  repCounting: {
    triggerJoint: 'shoulder',
    triggerAxis: 'y',
    startThreshold: 0.2,
    endThreshold: 0.4,
    minDuration: 600,
    requiresFullROM: true,
  },

  formRules: [
    {
      id: 'depth',
      name: 'Push-up Depth',
      description: 'Chest near floor',
      severity: 'major',
      measurement: {
        type: 'angle',
        points: ['shoulder', 'elbow', 'wrist'],
        calculation: 'elbow-angle',
        optimalValue: [75, 90],
        tolerance: 10,
      },
      feedback: {
        violation: 'Not deep enough',
        correction: 'Lower chest to floor',
      },
    },
    {
      id: 'hip-sag',
      name: 'Body Alignment',
      description: 'Maintain plank position',
      severity: 'critical',
      measurement: {
        type: 'alignment',
        points: ['shoulder', 'hip', 'ankle'],
        calculation: 'middle-point-deviation',
        optimalValue: 0,
        tolerance: 0.06,
      },
      feedback: {
        violation: 'Hips sagging',
        correction: 'Engage core. Straight body.',
      },
    },
  ],

  coaching: {
    setupCues: [
      'Hands shoulder-width apart',
      'Core engaged',
      'Camera at chest level, side view',
    ],
    commonMistakes: ['hip-sag', 'partial-range'],
    motivationalCues: ['Full range. Keep going.', 'Control the descent.'],
    correctionPriority: 'safety',
  },

  safety: {
    stopConditions: ['severe-hip-sag'],
    warningConditions: ['partial-ROM'],
    requiresWarmup: true,
  },
};

export const PLANK_DEFINITION: ExerciseMotionCapture = {
  supported: true,
  movementPattern: 'plank-pattern',
  cameraView: 'side',

  biomechanics: {
    primaryJoints: ['shoulder', 'hip', 'ankle'],
    secondaryJoints: ['elbow'],

    rangeOfMotion: [],

    alignment: [
      {
        name: 'straight-line',
        points: ['shoulder', 'hip', 'ankle'],
        axis: 'y',
        tolerance: 0.05,
        critical: true,
      },
    ],

    symmetry: [
      {
        leftPoint: 'shoulder',
        rightPoint: 'shoulder',
        maxDeviation: 0.02,
      },
    ],

    velocity: [
      {
        phase: 'isometric',
        expectedSpeed: 'slow',
        smoothnessThreshold: 0.95,
      },
    ],
  },

  repCounting: {
    triggerJoint: 'timer',
    triggerAxis: 'y',
    startThreshold: 0,
    endThreshold: 0,
    minDuration: 0,
    requiresFullROM: false,
  },

  formRules: [
    {
      id: 'hip-sag',
      name: 'Hip Position',
      description: 'Hips level with shoulders/ankles',
      severity: 'critical',
      measurement: {
        type: 'alignment',
        points: ['shoulder', 'hip', 'ankle'],
        calculation: 'middle-point-deviation',
        optimalValue: 0,
        tolerance: 0.05,
      },
      feedback: {
        violation: 'Hips sagging',
        correction: 'Engage core. Lift hips.',
      },
    },
    {
      id: 'hip-pike',
      name: 'Hip Pike',
      description: 'Hips not too high',
      severity: 'major',
      measurement: {
        type: 'alignment',
        points: ['shoulder', 'hip', 'ankle'],
        calculation: 'middle-point-deviation',
        optimalValue: 0,
        tolerance: 0.05,
      },
      feedback: {
        violation: 'Hips too high',
        correction: 'Lower hips in line.',
      },
    },
  ],

  coaching: {
    setupCues: [
      'Elbows under shoulders',
      'Body straight',
      'Camera at torso level, side view',
    ],
    commonMistakes: ['hip-sag', 'hip-pike'],
    motivationalCues: ['Hold steady.', 'Core engaged. Breathe.'],
    correctionPriority: 'safety',
  },

  safety: {
    stopConditions: ['severe-hip-sag'],
    warningConditions: ['excessive-wobble'],
    requiresWarmup: false,
  },
};

export const EXERCISE_DEFINITIONS: Record<string, ExerciseMotionCapture> = {
  squat: SQUAT_DEFINITION,
  pushup: PUSHUP_DEFINITION,
  'push-up': PUSHUP_DEFINITION,
  plank: PLANK_DEFINITION,
};

export function getExerciseDefinition(exerciseId: string): ExerciseMotionCapture | null {
  const normalized = exerciseId.toLowerCase().replace(/[_\s-]/g, '');

  for (const [key, definition] of Object.entries(EXERCISE_DEFINITIONS)) {
    if (key.replace(/[_\s-]/g, '') === normalized) {
      return definition;
    }
  }

  return null;
}
