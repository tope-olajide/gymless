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

export const SUMO_SQUAT_DEFINITION: ExerciseMotionCapture = {
  supported: true,
  movementPattern: 'squat-pattern',
  cameraView: 'front',

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
        name: 'knee-tracking-wide',
        points: ['knee', 'ankle', 'footIndex'],
        axis: 'x',
        tolerance: 0.08,
        critical: true,
      },
      {
        name: 'toe-out-angle',
        points: ['hip', 'knee', 'ankle'],
        axis: 'frontal',
        tolerance: 0.1,
        critical: false,
      },
    ],

    symmetry: [
      {
        leftPoint: 'hip',
        rightPoint: 'hip',
        maxDeviation: 0.03,
      },
      {
        leftPoint: 'knee',
        rightPoint: 'knee',
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
    triggerJoint: 'hip',
    triggerAxis: 'y',
    startThreshold: 0.65,
    endThreshold: 0.90,
    minDuration: 800,
    requiresFullROM: true,
  },

  formRules: [
    {
      id: 'sumo-depth',
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
      id: 'knee-tracking-out',
      name: 'Knee Tracking',
      description: 'Knees track over toes',
      severity: 'critical',
      measurement: {
        type: 'alignment',
        points: ['knee', 'ankle'],
        calculation: 'knee-valgus',
        optimalValue: 0,
        tolerance: 0.08,
      },
      feedback: {
        violation: 'Knees caving in',
        correction: 'Push knees out wide',
      },
    },
    {
      id: 'stance-width',
      name: 'Wide Stance',
      description: 'Feet wider than shoulders',
      severity: 'minor',
      measurement: {
        type: 'distance',
        points: ['leftAnkle', 'rightAnkle'],
        calculation: 'stance-width',
        optimalValue: 1.5,
        tolerance: 0.3,
      },
      feedback: {
        violation: 'Stance too narrow',
        correction: 'Widen your stance',
      },
    },
  ],

  coaching: {
    setupCues: [
      'Stand with feet wide apart',
      'Toes at 45-degree angle',
      'Camera facing you at chest level',
    ],
    commonMistakes: ['knees-cave-in', 'narrow-stance', 'forward-lean'],
    motivationalCues: [
      'Perfect form. Knees out.',
      'Great depth. Keep going.',
      'Inner thighs engaged.',
    ],
    correctionPriority: 'safety',
  },

  safety: {
    stopConditions: ['excessive-forward-lean', 'knee-valgus-severe'],
    warningConditions: ['partial-ROM', 'asymmetric-loading'],
    requiresWarmup: false,
  },
};

export const CHAIR_SQUAT_DEFINITION: ExerciseMotionCapture = {
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
        minAngle: 80,
        maxAngle: 175,
        optimalRange: [90, 110],
      },
      {
        joint: 'hip',
        axis: 'sagittal',
        minAngle: 70,
        maxAngle: 175,
        optimalRange: [80, 100],
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
        expectedSpeed: 'slow',
        smoothnessThreshold: 0.85,
      },
    ],
  },

  repCounting: {
    triggerJoint: 'hip',
    triggerAxis: 'y',
    startThreshold: 0.70,
    endThreshold: 0.90,
    minDuration: 1000,
    requiresFullROM: true,
  },

  formRules: [
    {
      id: 'controlled-descent',
      name: 'Controlled Descent',
      description: 'Lower slowly to chair',
      severity: 'major',
      measurement: {
        type: 'velocity',
        points: ['hip'],
        calculation: 'descent-speed',
        optimalValue: 0.3,
        tolerance: 0.15,
      },
      feedback: {
        violation: 'Dropping too fast',
        correction: 'Control the descent',
      },
    },
    {
      id: 'chair-touch',
      name: 'Touch Without Sitting',
      description: 'Tap chair lightly',
      severity: 'minor',
      measurement: {
        type: 'pause',
        points: ['hip'],
        calculation: 'pause-duration',
        optimalValue: 0.2,
        tolerance: 0.3,
      },
      feedback: {
        violation: 'Sitting on chair',
        correction: 'Just touch. Don\'t sit.',
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
  ],

  coaching: {
    setupCues: [
      'Stand in front of sturdy chair',
      'Feet hip-width apart',
      'Camera at hip level, side view',
    ],
    commonMistakes: ['sitting-fully', 'fast-descent', 'knees-forward'],
    motivationalCues: [
      'Controlled motion. Great.',
      'Touch. Don\'t sit.',
      'Perfect control.',
    ],
    correctionPriority: 'technique',
  },

  safety: {
    stopConditions: ['excessive-forward-lean'],
    warningConditions: ['fast-descent', 'full-sitting'],
    requiresWarmup: false,
  },
};

export const WALL_SIT_DEFINITION: ExerciseMotionCapture = {
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
        minAngle: 85,
        maxAngle: 95,
        optimalRange: [88, 92],
      },
      {
        joint: 'hip',
        axis: 'sagittal',
        minAngle: 85,
        maxAngle: 95,
        optimalRange: [88, 92],
      },
    ],

    alignment: [
      {
        name: 'back-against-wall',
        points: ['shoulder', 'hip'],
        axis: 'x',
        tolerance: 0.03,
        critical: true,
      },
      {
        name: 'shin-vertical',
        points: ['knee', 'ankle'],
        axis: 'y',
        tolerance: 0.04,
        critical: true,
      },
    ],

    symmetry: [
      {
        leftPoint: 'hip',
        rightPoint: 'hip',
        maxDeviation: 0.02,
      },
      {
        leftPoint: 'knee',
        rightPoint: 'knee',
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
      id: 'ninety-degree-knee',
      name: '90-Degree Angle',
      description: 'Knees at 90 degrees',
      severity: 'critical',
      measurement: {
        type: 'angle',
        points: ['hip', 'knee', 'ankle'],
        calculation: 'knee-angle',
        optimalValue: [88, 92],
        tolerance: 5,
      },
      feedback: {
        violation: 'Adjust knee angle',
        correction: 'Slide to 90 degrees',
      },
    },
    {
      id: 'back-flat',
      name: 'Back Against Wall',
      description: 'Back stays flat on wall',
      severity: 'critical',
      measurement: {
        type: 'alignment',
        points: ['shoulder', 'hip'],
        calculation: 'wall-contact',
        optimalValue: 0,
        tolerance: 0.03,
      },
      feedback: {
        violation: 'Back off wall',
        correction: 'Press back to wall',
      },
    },
    {
      id: 'position-drift',
      name: 'Hold Position',
      description: 'Maintain position without sliding',
      severity: 'major',
      measurement: {
        type: 'stability',
        points: ['hip'],
        calculation: 'position-drift',
        optimalValue: 0,
        tolerance: 0.05,
      },
      feedback: {
        violation: 'Sliding down',
        correction: 'Hold steady. Push through heels.',
      },
    },
  ],

  coaching: {
    setupCues: [
      'Back against wall',
      'Slide down to 90 degrees',
      'Camera at hip level, side view',
    ],
    commonMistakes: ['too-high', 'back-arching', 'sliding-down'],
    motivationalCues: [
      'Hold steady. Breathe.',
      'Strong hold. Keep going.',
      'Perfect position.',
    ],
    correctionPriority: 'safety',
  },

  safety: {
    stopConditions: ['knee-pain-indicated'],
    warningConditions: ['excessive-drift', 'back-arch'],
    requiresWarmup: false,
  },
};

export const STEP_UP_DEFINITION: ExerciseMotionCapture = {
  supported: true,
  movementPattern: 'single-leg-pattern',
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
        optimalRange: [80, 100],
      },
      {
        joint: 'hip',
        axis: 'sagittal',
        minAngle: 60,
        maxAngle: 175,
        optimalRange: [70, 90],
      },
    ],

    alignment: [
      {
        name: 'knee-over-toe',
        points: ['knee', 'ankle', 'footIndex'],
        axis: 'x',
        tolerance: 0.06,
        critical: true,
      },
      {
        name: 'torso-upright',
        points: ['shoulder', 'hip'],
        axis: 'y',
        tolerance: 0.08,
        critical: false,
      },
    ],

    symmetry: [
      {
        leftPoint: 'hip',
        rightPoint: 'hip',
        maxDeviation: 0.05,
      },
    ],

    velocity: [
      {
        phase: 'concentric',
        expectedSpeed: 'moderate',
        smoothnessThreshold: 0.75,
      },
    ],
  },

  repCounting: {
    triggerJoint: 'hip',
    triggerAxis: 'y',
    startThreshold: 0.60,
    endThreshold: 0.85,
    minDuration: 700,
    requiresFullROM: true,
  },

  formRules: [
    {
      id: 'lead-leg-power',
      name: 'Lead Leg Power',
      description: 'Push through lead leg',
      severity: 'major',
      measurement: {
        type: 'force',
        points: ['leadAnkle', 'leadKnee', 'leadHip'],
        calculation: 'leg-drive',
        optimalValue: 0.8,
        tolerance: 0.2,
      },
      feedback: {
        violation: 'Pushing off back leg',
        correction: 'Drive through front heel',
      },
    },
    {
      id: 'torso-upright',
      name: 'Upright Torso',
      description: 'Keep chest up',
      severity: 'major',
      measurement: {
        type: 'angle',
        points: ['shoulder', 'hip', 'knee'],
        calculation: 'torso-angle',
        optimalValue: [80, 90],
        tolerance: 10,
      },
      feedback: {
        violation: 'Leaning forward',
        correction: 'Chest up. Stay upright.',
      },
    },
    {
      id: 'controlled-descent',
      name: 'Controlled Step Down',
      description: 'Control the descent',
      severity: 'minor',
      measurement: {
        type: 'velocity',
        points: ['hip'],
        calculation: 'descent-speed',
        optimalValue: 0.4,
        tolerance: 0.2,
      },
      feedback: {
        violation: 'Dropping down too fast',
        correction: 'Control the step down',
      },
    },
    {
      id: 'balance',
      name: 'Balance',
      description: 'Maintain balance throughout',
      severity: 'major',
      measurement: {
        type: 'stability',
        points: ['hip', 'shoulder'],
        calculation: 'body-wobble',
        optimalValue: 0,
        tolerance: 0.1,
      },
      feedback: {
        violation: 'Loss of balance',
        correction: 'Focus on stability',
      },
    },
  ],

  coaching: {
    setupCues: [
      'Use sturdy chair or step',
      'Step fully onto platform',
      'Camera at hip level, side view',
    ],
    commonMistakes: ['back-leg-push', 'forward-lean', 'fast-descent'],
    motivationalCues: [
      'Drive through the heel.',
      'Controlled motion. Good.',
      'Perfect balance.',
    ],
    correctionPriority: 'safety',
  },

  safety: {
    stopConditions: ['severe-imbalance', 'platform-instability'],
    warningConditions: ['forward-lean', 'back-leg-compensation'],
    requiresWarmup: true,
  },
};

export const EXERCISE_DEFINITIONS: Record<string, ExerciseMotionCapture> = {
  squat: SQUAT_DEFINITION,
  squats: SQUAT_DEFINITION,
  pushup: PUSHUP_DEFINITION,
  pushups: PUSHUP_DEFINITION,
  'push-up': PUSHUP_DEFINITION,
  'push-ups': PUSHUP_DEFINITION,
  plank: PLANK_DEFINITION,
  sumoSquats: SUMO_SQUAT_DEFINITION,
  'sumo-squats': SUMO_SQUAT_DEFINITION,
  chairSquats: CHAIR_SQUAT_DEFINITION,
  'chair-squats': CHAIR_SQUAT_DEFINITION,
  wallSit: WALL_SIT_DEFINITION,
  'wall-sit': WALL_SIT_DEFINITION,
  stepUps: STEP_UP_DEFINITION,
  'step-ups': STEP_UP_DEFINITION,
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
