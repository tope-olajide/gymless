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

export const STATIC_LUNGE_DEFINITION: ExerciseMotionCapture = {
  supported: true,
  movementPattern: 'lunge-pattern',
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
        optimalRange: [85, 95],
      },
      {
        joint: 'hip',
        axis: 'sagittal',
        minAngle: 70,
        maxAngle: 175,
        optimalRange: [75, 90],
      },
    ],

    alignment: [
      {
        name: 'front-knee-tracking',
        points: ['knee', 'ankle', 'footIndex'],
        axis: 'x',
        tolerance: 0.05,
        critical: true,
      },
      {
        name: 'torso-upright',
        points: ['shoulder', 'hip'],
        axis: 'y',
        tolerance: 0.08,
        critical: true,
      },
    ],

    symmetry: [
      {
        leftPoint: 'hip',
        rightPoint: 'hip',
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
    startThreshold: 0.60,
    endThreshold: 0.85,
    minDuration: 800,
    requiresFullROM: true,
  },

  formRules: [
    {
      id: 'knee-angle',
      name: '90-Degree Front Knee',
      description: 'Front knee at 90 degrees',
      severity: 'major',
      measurement: {
        type: 'angle',
        points: ['hip', 'knee', 'ankle'],
        calculation: 'knee-angle',
        optimalValue: [85, 95],
        tolerance: 8,
      },
      feedback: {
        violation: 'Knee angle off',
        correction: 'Lower to 90 degrees',
      },
    },
    {
      id: 'knee-over-toe',
      name: 'Knee Position',
      description: 'Knee stays behind toes',
      severity: 'critical',
      measurement: {
        type: 'alignment',
        points: ['knee', 'ankle'],
        calculation: 'knee-forward',
        optimalValue: 0,
        tolerance: 0.05,
      },
      feedback: {
        violation: 'Knee too far forward',
        correction: 'Keep knee behind toes',
      },
    },
    {
      id: 'torso-upright',
      name: 'Upright Torso',
      description: 'Keep torso vertical',
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
        correction: 'Chest up. Stay tall.',
      },
    },
    {
      id: 'back-knee-hover',
      name: 'Back Knee Hover',
      description: 'Back knee hovers above ground',
      severity: 'minor',
      measurement: {
        type: 'distance',
        points: ['backKnee', 'ground'],
        calculation: 'knee-height',
        optimalValue: 0.05,
        tolerance: 0.03,
      },
      feedback: {
        violation: 'Knee touching ground',
        correction: 'Hover knee just above floor',
      },
    },
  ],

  coaching: {
    setupCues: [
      'Split stance, feet hip-width',
      'Front heel, back toes down',
      'Camera at hip level, side view',
    ],
    commonMistakes: ['knee-forward', 'torso-lean', 'narrow-stance'],
    motivationalCues: [
      'Perfect depth. Control it.',
      'Strong hold. Keep going.',
      'Chest up. Looking good.',
    ],
    correctionPriority: 'safety',
  },

  safety: {
    stopConditions: ['knee-valgus-severe', 'excessive-forward-lean'],
    warningConditions: ['partial-ROM', 'knee-touching'],
    requiresWarmup: false,
  },
};

export const REVERSE_LUNGE_DEFINITION: ExerciseMotionCapture = {
  supported: true,
  movementPattern: 'lunge-pattern',
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
        optimalRange: [85, 95],
      },
      {
        joint: 'hip',
        axis: 'sagittal',
        minAngle: 70,
        maxAngle: 175,
        optimalRange: [75, 90],
      },
    ],

    alignment: [
      {
        name: 'front-knee-tracking',
        points: ['knee', 'ankle', 'footIndex'],
        axis: 'x',
        tolerance: 0.05,
        critical: true,
      },
      {
        name: 'torso-vertical',
        points: ['shoulder', 'hip'],
        axis: 'y',
        tolerance: 0.08,
        critical: true,
      },
    ],

    symmetry: [
      {
        leftPoint: 'hip',
        rightPoint: 'hip',
        maxDeviation: 0.04,
      },
    ],

    velocity: [
      {
        phase: 'eccentric',
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
    minDuration: 900,
    requiresFullROM: true,
  },

  formRules: [
    {
      id: 'controlled-descent',
      name: 'Controlled Step Back',
      description: 'Step back with control',
      severity: 'major',
      measurement: {
        type: 'velocity',
        points: ['hip'],
        calculation: 'descent-speed',
        optimalValue: 0.4,
        tolerance: 0.2,
      },
      feedback: {
        violation: 'Stepping too fast',
        correction: 'Control the movement',
      },
    },
    {
      id: 'front-knee-stable',
      name: 'Front Knee Stable',
      description: 'Front knee stays over ankle',
      severity: 'critical',
      measurement: {
        type: 'alignment',
        points: ['knee', 'ankle'],
        calculation: 'knee-forward',
        optimalValue: 0,
        tolerance: 0.04,
      },
      feedback: {
        violation: 'Knee shifting forward',
        correction: 'Keep weight on front heel',
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
        correction: 'Engage core. Focus ahead.',
      },
    },
  ],

  coaching: {
    setupCues: [
      'Start standing tall',
      'Step back into lunge',
      'Camera at hip level, side view',
    ],
    commonMistakes: ['fast-descent', 'front-knee-shift', 'torso-lean'],
    motivationalCues: [
      'Controlled motion. Perfect.',
      'Strong balance.',
      'Drive through front heel.',
    ],
    correctionPriority: 'safety',
  },

  safety: {
    stopConditions: ['severe-imbalance', 'knee-valgus-severe'],
    warningConditions: ['fast-movement', 'knee-shift'],
    requiresWarmup: true,
  },
};

export const SINGLE_LEG_SQUAT_DEFINITION: ExerciseMotionCapture = {
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
        optimalRange: [75, 90],
      },
      {
        joint: 'hip',
        axis: 'sagittal',
        minAngle: 60,
        maxAngle: 175,
        optimalRange: [65, 85],
      },
    ],

    alignment: [
      {
        name: 'knee-tracking',
        points: ['knee', 'ankle', 'footIndex'],
        axis: 'x',
        tolerance: 0.07,
        critical: true,
      },
      {
        name: 'hip-level',
        points: ['hip'],
        axis: 'frontal',
        tolerance: 0.06,
        critical: true,
      },
    ],

    symmetry: [],

    velocity: [
      {
        phase: 'eccentric',
        expectedSpeed: 'slow',
        smoothnessThreshold: 0.75,
      },
    ],
  },

  repCounting: {
    triggerJoint: 'hip',
    triggerAxis: 'y',
    startThreshold: 0.55,
    endThreshold: 0.80,
    minDuration: 1000,
    requiresFullROM: true,
  },

  formRules: [
    {
      id: 'depth',
      name: 'Depth Control',
      description: 'Lower with control',
      severity: 'major',
      measurement: {
        type: 'angle',
        points: ['hip', 'knee', 'ankle'],
        calculation: 'knee-angle',
        optimalValue: [75, 90],
        tolerance: 10,
      },
      feedback: {
        violation: 'Limited depth',
        correction: 'Lower slowly. Use support.',
      },
    },
    {
      id: 'knee-alignment',
      name: 'Knee Alignment',
      description: 'Knee tracks over toes',
      severity: 'critical',
      measurement: {
        type: 'alignment',
        points: ['knee', 'ankle'],
        calculation: 'knee-valgus',
        optimalValue: 0,
        tolerance: 0.07,
      },
      feedback: {
        violation: 'Knee caving in',
        correction: 'Push knee out',
      },
    },
    {
      id: 'balance',
      name: 'Balance',
      description: 'Maintain stability',
      severity: 'critical',
      measurement: {
        type: 'stability',
        points: ['hip', 'shoulder'],
        calculation: 'body-wobble',
        optimalValue: 0,
        tolerance: 0.12,
      },
      feedback: {
        violation: 'Losing balance',
        correction: 'Use support. Slow down.',
      },
    },
  ],

  coaching: {
    setupCues: [
      'Stand near wall for support',
      'Lift one foot slightly',
      'Camera at hip level, side view',
    ],
    commonMistakes: ['knee-collapse', 'fast-descent', 'excessive-wobble'],
    motivationalCues: [
      'Slow and controlled.',
      'Use support as needed.',
      'Building strength.',
    ],
    correctionPriority: 'safety',
  },

  safety: {
    stopConditions: ['severe-imbalance', 'knee-valgus-severe'],
    warningConditions: ['excessive-wobble', 'fast-descent'],
    requiresWarmup: true,
  },
};

export const HIP_HINGE_DEFINITION: ExerciseMotionCapture = {
  supported: true,
  movementPattern: 'hinge-pattern',
  cameraView: 'side',

  biomechanics: {
    primaryJoints: ['hip', 'knee', 'ankle'],
    secondaryJoints: ['shoulder', 'spine'],

    rangeOfMotion: [
      {
        joint: 'hip',
        axis: 'sagittal',
        minAngle: 45,
        maxAngle: 175,
        optimalRange: [50, 70],
      },
      {
        joint: 'knee',
        axis: 'sagittal',
        minAngle: 165,
        maxAngle: 175,
        optimalRange: [168, 175],
      },
    ],

    alignment: [
      {
        name: 'neutral-spine',
        points: ['shoulder', 'hip', 'knee'],
        axis: 'sagittal',
        tolerance: 0.05,
        critical: true,
      },
      {
        name: 'hip-dominant',
        points: ['hip', 'knee'],
        axis: 'sagittal',
        tolerance: 0.08,
        critical: true,
      },
    ],

    symmetry: [
      {
        leftPoint: 'hip',
        rightPoint: 'hip',
        maxDeviation: 0.02,
      },
    ],

    velocity: [
      {
        phase: 'eccentric',
        expectedSpeed: 'moderate',
        smoothnessThreshold: 0.85,
      },
    ],
  },

  repCounting: {
    triggerJoint: 'hip',
    triggerAxis: 'rotation',
    startThreshold: 0.50,
    endThreshold: 0.85,
    minDuration: 800,
    requiresFullROM: true,
  },

  formRules: [
    {
      id: 'hip-hinge',
      name: 'Hip Hinge',
      description: 'Hinge at hips, not spine',
      severity: 'critical',
      measurement: {
        type: 'angle',
        points: ['shoulder', 'hip', 'knee'],
        calculation: 'hip-flexion',
        optimalValue: [50, 70],
        tolerance: 10,
      },
      feedback: {
        violation: 'Spine rounding',
        correction: 'Hinge from hips. Neutral spine.',
      },
    },
    {
      id: 'soft-knees',
      name: 'Soft Knees',
      description: 'Slight knee bend',
      severity: 'major',
      measurement: {
        type: 'angle',
        points: ['hip', 'knee', 'ankle'],
        calculation: 'knee-angle',
        optimalValue: [168, 175],
        tolerance: 5,
      },
      feedback: {
        violation: 'Knees too bent',
        correction: 'Keep knees soft, not bent',
      },
    },
    {
      id: 'neutral-spine',
      name: 'Neutral Spine',
      description: 'Maintain spine position',
      severity: 'critical',
      measurement: {
        type: 'alignment',
        points: ['shoulder', 'hip', 'knee'],
        calculation: 'spine-alignment',
        optimalValue: 0,
        tolerance: 0.05,
      },
      feedback: {
        violation: 'Spine not neutral',
        correction: 'Chest up. Flat back.',
      },
    },
  ],

  coaching: {
    setupCues: [
      'Feet hip-width apart',
      'Hands on hips',
      'Camera at hip level, side view',
    ],
    commonMistakes: ['spine-rounding', 'knee-bending', 'shallow-hinge'],
    motivationalCues: [
      'Perfect hinge. Feel hamstrings.',
      'Neutral spine. Great.',
      'Hip movement, not back.',
    ],
    correctionPriority: 'safety',
  },

  safety: {
    stopConditions: ['severe-spine-flexion'],
    warningConditions: ['spine-rounding', 'knee-excessive-bend'],
    requiresWarmup: true,
  },
};

export const GLUTE_BRIDGE_DEFINITION: ExerciseMotionCapture = {
  supported: true,
  movementPattern: 'bridge-pattern',
  cameraView: 'side',

  biomechanics: {
    primaryJoints: ['hip', 'knee', 'ankle'],
    secondaryJoints: ['shoulder', 'spine'],

    rangeOfMotion: [
      {
        joint: 'hip',
        axis: 'sagittal',
        minAngle: 160,
        maxAngle: 180,
        optimalRange: [165, 180],
      },
      {
        joint: 'knee',
        axis: 'sagittal',
        minAngle: 85,
        maxAngle: 95,
        optimalRange: [88, 92],
      },
    ],

    alignment: [
      {
        name: 'shoulder-hip-knee',
        points: ['shoulder', 'hip', 'knee'],
        axis: 'y',
        tolerance: 0.04,
        critical: true,
      },
      {
        name: 'shin-vertical',
        points: ['knee', 'ankle'],
        axis: 'y',
        tolerance: 0.05,
        critical: false,
      },
    ],

    symmetry: [
      {
        leftPoint: 'hip',
        rightPoint: 'hip',
        maxDeviation: 0.02,
      },
    ],

    velocity: [
      {
        phase: 'concentric',
        expectedSpeed: 'moderate',
        smoothnessThreshold: 0.8,
      },
    ],
  },

  repCounting: {
    triggerJoint: 'hip',
    triggerAxis: 'y',
    startThreshold: 0.15,
    endThreshold: 0.40,
    minDuration: 700,
    requiresFullROM: true,
  },

  formRules: [
    {
      id: 'full-extension',
      name: 'Full Hip Extension',
      description: 'Hips fully extended at top',
      severity: 'major',
      measurement: {
        type: 'angle',
        points: ['shoulder', 'hip', 'knee'],
        calculation: 'hip-extension',
        optimalValue: [165, 180],
        tolerance: 10,
      },
      feedback: {
        violation: 'Hips not fully extended',
        correction: 'Squeeze glutes. Push hips up.',
      },
    },
    {
      id: 'no-arch',
      name: 'No Lower Back Arch',
      description: 'Avoid arching lower back',
      severity: 'critical',
      measurement: {
        type: 'alignment',
        points: ['shoulder', 'hip', 'knee'],
        calculation: 'spine-arch',
        optimalValue: 0,
        tolerance: 0.04,
      },
      feedback: {
        violation: 'Arching lower back',
        correction: 'Tuck pelvis. Use glutes.',
      },
    },
    {
      id: 'knee-position',
      name: 'Knee Position',
      description: 'Knees at 90 degrees',
      severity: 'minor',
      measurement: {
        type: 'angle',
        points: ['hip', 'knee', 'ankle'],
        calculation: 'knee-angle',
        optimalValue: [88, 92],
        tolerance: 5,
      },
      feedback: {
        violation: 'Adjust foot position',
        correction: 'Knees at 90 degrees',
      },
    },
  ],

  coaching: {
    setupCues: [
      'Lie on back, knees bent',
      'Feet flat, hip-width apart',
      'Camera at hip level, side view',
    ],
    commonMistakes: ['lower-back-arch', 'incomplete-extension', 'using-back'],
    motivationalCues: [
      'Squeeze glutes at top.',
      'Feel it in glutes, not back.',
      'Full extension. Perfect.',
    ],
    correctionPriority: 'safety',
  },

  safety: {
    stopConditions: ['excessive-lumbar-extension'],
    warningConditions: ['incomplete-hip-extension', 'back-compensation'],
    requiresWarmup: false,
  },
};

export const SINGLE_LEG_GLUTE_BRIDGE_DEFINITION: ExerciseMotionCapture = {
  supported: true,
  movementPattern: 'bridge-pattern',
  cameraView: 'side',

  biomechanics: {
    primaryJoints: ['hip', 'knee', 'ankle'],
    secondaryJoints: ['shoulder', 'spine'],

    rangeOfMotion: [
      {
        joint: 'hip',
        axis: 'sagittal',
        minAngle: 160,
        maxAngle: 180,
        optimalRange: [165, 180],
      },
      {
        joint: 'knee',
        axis: 'sagittal',
        minAngle: 85,
        maxAngle: 95,
        optimalRange: [88, 92],
      },
    ],

    alignment: [
      {
        name: 'shoulder-hip-knee',
        points: ['shoulder', 'hip', 'knee'],
        axis: 'y',
        tolerance: 0.05,
        critical: true,
      },
      {
        name: 'hip-level',
        points: ['leftHip', 'rightHip'],
        axis: 'frontal',
        tolerance: 0.04,
        critical: true,
      },
    ],

    symmetry: [],

    velocity: [
      {
        phase: 'concentric',
        expectedSpeed: 'slow',
        smoothnessThreshold: 0.75,
      },
    ],
  },

  repCounting: {
    triggerJoint: 'hip',
    triggerAxis: 'y',
    startThreshold: 0.15,
    endThreshold: 0.40,
    minDuration: 800,
    requiresFullROM: true,
  },

  formRules: [
    {
      id: 'hip-level',
      name: 'Level Hips',
      description: 'Keep hips level',
      severity: 'critical',
      measurement: {
        type: 'alignment',
        points: ['leftHip', 'rightHip'],
        calculation: 'hip-rotation',
        optimalValue: 0,
        tolerance: 0.04,
      },
      feedback: {
        violation: 'Hips rotating',
        correction: 'Keep hips square. Level.',
      },
    },
    {
      id: 'full-extension',
      name: 'Full Extension',
      description: 'Complete hip extension',
      severity: 'major',
      measurement: {
        type: 'angle',
        points: ['shoulder', 'hip', 'knee'],
        calculation: 'hip-extension',
        optimalValue: [165, 180],
        tolerance: 10,
      },
      feedback: {
        violation: 'Not fully extended',
        correction: 'Drive hip up. Squeeze glute.',
      },
    },
    {
      id: 'no-arch',
      name: 'No Back Arch',
      description: 'Avoid lower back arch',
      severity: 'critical',
      measurement: {
        type: 'alignment',
        points: ['shoulder', 'hip', 'knee'],
        calculation: 'spine-arch',
        optimalValue: 0,
        tolerance: 0.05,
      },
      feedback: {
        violation: 'Arching back',
        correction: 'Glute power, not back.',
      },
    },
  ],

  coaching: {
    setupCues: [
      'Lie on back, one knee bent',
      'Other leg extended',
      'Camera at hip level, side view',
    ],
    commonMistakes: ['hip-rotation', 'lower-back-arch', 'incomplete-extension'],
    motivationalCues: [
      'Keep hips level.',
      'Single glute power.',
      'Controlled motion.',
    ],
    correctionPriority: 'safety',
  },

  safety: {
    stopConditions: ['excessive-lumbar-extension', 'severe-rotation'],
    warningConditions: ['hip-drop', 'back-compensation'],
    requiresWarmup: true,
  },
};

export const KNEE_PUSHUP_DEFINITION: ExerciseMotionCapture = {
  supported: true,
  movementPattern: 'push-pattern',
  cameraView: 'side',

  biomechanics: {
    primaryJoints: ['shoulder', 'elbow', 'wrist'],
    secondaryJoints: ['hip', 'knee'],

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
        name: 'shoulder-hip-knee',
        points: ['shoulder', 'hip', 'knee'],
        axis: 'y',
        tolerance: 0.06,
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
    endThreshold: 0.35,
    minDuration: 600,
    requiresFullROM: true,
  },

  formRules: [
    {
      id: 'depth',
      name: 'Push-up Depth',
      description: 'Lower chest near floor',
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
      id: 'body-line',
      name: 'Body Alignment',
      description: 'Shoulder to knee line',
      severity: 'critical',
      measurement: {
        type: 'alignment',
        points: ['shoulder', 'hip', 'knee'],
        calculation: 'middle-point-deviation',
        optimalValue: 0,
        tolerance: 0.06,
      },
      feedback: {
        violation: 'Hips sagging',
        correction: 'Engage core. Straight line.',
      },
    },
  ],

  coaching: {
    setupCues: [
      'Hands shoulder-width apart',
      'Knees on ground',
      'Camera at chest level, side view',
    ],
    commonMistakes: ['hip-sag', 'partial-range', 'head-drop'],
    motivationalCues: [
      'Full range. Perfect.',
      'Control the descent.',
      'Strong push.',
    ],
    correctionPriority: 'safety',
  },

  safety: {
    stopConditions: ['severe-hip-sag'],
    warningConditions: ['partial-ROM'],
    requiresWarmup: true,
  },
};

export const INCLINE_PUSHUP_DEFINITION: ExerciseMotionCapture = {
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
    startThreshold: 0.15,
    endThreshold: 0.30,
    minDuration: 600,
    requiresFullROM: true,
  },

  formRules: [
    {
      id: 'depth',
      name: 'Push-up Depth',
      description: 'Chest to surface',
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
        correction: 'Lower chest to surface',
      },
    },
    {
      id: 'body-line',
      name: 'Body Alignment',
      description: 'Maintain plank position',
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
        correction: 'Engage core. Straight body.',
      },
    },
  ],

  coaching: {
    setupCues: [
      'Hands on elevated surface',
      'Body straight',
      'Camera at chest level, side view',
    ],
    commonMistakes: ['hip-sag', 'partial-range'],
    motivationalCues: [
      'Full range. Great.',
      'Control it.',
      'Perfect form.',
    ],
    correctionPriority: 'safety',
  },

  safety: {
    stopConditions: ['severe-hip-sag'],
    warningConditions: ['partial-ROM'],
    requiresWarmup: true,
  },
};

export const CLOSE_GRIP_PUSHUP_DEFINITION: ExerciseMotionCapture = {
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
        minAngle: 70,
        maxAngle: 175,
        optimalRange: [70, 85],
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
      {
        name: 'elbow-tuck',
        points: ['shoulder', 'elbow', 'wrist'],
        axis: 'x',
        tolerance: 0.06,
        critical: true,
      },
    ],

    symmetry: [
      {
        leftPoint: 'elbow',
        rightPoint: 'elbow',
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
    triggerJoint: 'shoulder',
    triggerAxis: 'y',
    startThreshold: 0.2,
    endThreshold: 0.4,
    minDuration: 700,
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
        optimalValue: [70, 85],
        tolerance: 10,
      },
      feedback: {
        violation: 'Not deep enough',
        correction: 'Lower chest to floor',
      },
    },
    {
      id: 'elbow-tuck',
      name: 'Elbow Position',
      description: 'Elbows close to body',
      severity: 'critical',
      measurement: {
        type: 'alignment',
        points: ['shoulder', 'elbow'],
        calculation: 'elbow-flare',
        optimalValue: 0,
        tolerance: 0.06,
      },
      feedback: {
        violation: 'Elbows flaring out',
        correction: 'Keep elbows tucked in',
      },
    },
    {
      id: 'body-line',
      name: 'Body Alignment',
      description: 'Maintain plank position',
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
        correction: 'Engage core. Straight body.',
      },
    },
  ],

  coaching: {
    setupCues: [
      'Hands close together',
      'Elbows tucked',
      'Camera at chest level, side view',
    ],
    commonMistakes: ['elbow-flare', 'hip-sag', 'partial-range'],
    motivationalCues: [
      'Elbows in. Perfect.',
      'Triceps working.',
      'Full range. Strong.',
    ],
    correctionPriority: 'safety',
  },

  safety: {
    stopConditions: ['severe-hip-sag', 'shoulder-pain'],
    warningConditions: ['partial-ROM', 'elbow-flare'],
    requiresWarmup: true,
  },
};

export const PIKE_PUSHUP_DEFINITION: ExerciseMotionCapture = {
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
        minAngle: 70,
        maxAngle: 175,
        optimalRange: [70, 90],
      },
    ],

    alignment: [
      {
        name: 'pike-position',
        points: ['shoulder', 'hip', 'ankle'],
        axis: 'sagittal',
        tolerance: 0.08,
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
    startThreshold: 0.25,
    endThreshold: 0.45,
    minDuration: 700,
    requiresFullROM: true,
  },

  formRules: [
    {
      id: 'depth',
      name: 'Head Depth',
      description: 'Lower head toward floor',
      severity: 'major',
      measurement: {
        type: 'angle',
        points: ['shoulder', 'elbow', 'wrist'],
        calculation: 'elbow-angle',
        optimalValue: [70, 90],
        tolerance: 10,
      },
      feedback: {
        violation: 'Not deep enough',
        correction: 'Lower head to floor',
      },
    },
    {
      id: 'pike-angle',
      name: 'Pike Position',
      description: 'Maintain pike angle',
      severity: 'critical',
      measurement: {
        type: 'angle',
        points: ['shoulder', 'hip', 'ankle'],
        calculation: 'hip-angle',
        optimalValue: [90, 120],
        tolerance: 15,
      },
      feedback: {
        violation: 'Pike angle off',
        correction: 'Hips high. Inverted V.',
      },
    },
    {
      id: 'head-position',
      name: 'Head Neutral',
      description: 'Head in line with spine',
      severity: 'minor',
      measurement: {
        type: 'alignment',
        points: ['shoulder', 'head'],
        calculation: 'head-position',
        optimalValue: 0,
        tolerance: 0.06,
      },
      feedback: {
        violation: 'Head position off',
        correction: 'Neutral neck. Look at floor.',
      },
    },
  ],

  coaching: {
    setupCues: [
      'Start in downward dog',
      'Hands shoulder-width',
      'Camera at chest level, side view',
    ],
    commonMistakes: ['shallow-depth', 'pike-collapse', 'head-jutting'],
    motivationalCues: [
      'Pike position. Perfect.',
      'Shoulder strength.',
      'Control the descent.',
    ],
    correctionPriority: 'safety',
  },

  safety: {
    stopConditions: ['shoulder-pain', 'neck-strain'],
    warningConditions: ['partial-ROM', 'pike-collapse'],
    requiresWarmup: true,
  },
};

export const CHAIR_DIP_DEFINITION: ExerciseMotionCapture = {
  supported: true,
  movementPattern: 'dip-pattern',
  cameraView: 'side',

  biomechanics: {
    primaryJoints: ['shoulder', 'elbow', 'wrist'],
    secondaryJoints: ['hip', 'knee'],

    rangeOfMotion: [
      {
        joint: 'elbow',
        axis: 'sagittal',
        minAngle: 80,
        maxAngle: 175,
        optimalRange: [80, 95],
      },
      {
        joint: 'shoulder',
        axis: 'sagittal',
        minAngle: 160,
        maxAngle: 180,
        optimalRange: [165, 180],
      },
    ],

    alignment: [
      {
        name: 'vertical-descent',
        points: ['shoulder', 'hip'],
        axis: 'y',
        tolerance: 0.06,
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
    startThreshold: 0.20,
    endThreshold: 0.40,
    minDuration: 700,
    requiresFullROM: true,
  },

  formRules: [
    {
      id: 'depth',
      name: 'Dip Depth',
      description: 'Lower until 90-degree elbow',
      severity: 'major',
      measurement: {
        type: 'angle',
        points: ['shoulder', 'elbow', 'wrist'],
        calculation: 'elbow-angle',
        optimalValue: [80, 95],
        tolerance: 10,
      },
      feedback: {
        violation: 'Not deep enough',
        correction: 'Lower to 90 degrees',
      },
    },
    {
      id: 'shoulder-position',
      name: 'Shoulder Safety',
      description: 'Avoid excessive shoulder stress',
      severity: 'critical',
      measurement: {
        type: 'angle',
        points: ['elbow', 'shoulder', 'hip'],
        calculation: 'shoulder-extension',
        optimalValue: [165, 180],
        tolerance: 10,
      },
      feedback: {
        violation: 'Too deep. Shoulder stress.',
        correction: 'Stop at 90-degree elbow',
      },
    },
    {
      id: 'vertical-movement',
      name: 'Vertical Motion',
      description: 'Move straight up and down',
      severity: 'major',
      measurement: {
        type: 'alignment',
        points: ['shoulder', 'hip'],
        calculation: 'forward-lean',
        optimalValue: 0,
        tolerance: 0.06,
      },
      feedback: {
        violation: 'Swinging forward',
        correction: 'Vertical motion only',
      },
    },
  ],

  coaching: {
    setupCues: [
      'Hands on chair behind you',
      'Legs extended forward',
      'Camera at chest level, side view',
    ],
    commonMistakes: ['too-deep', 'swinging', 'partial-range'],
    motivationalCues: [
      'Control the descent.',
      'Triceps working. Great.',
      'Stop at 90 degrees.',
    ],
    correctionPriority: 'safety',
  },

  safety: {
    stopConditions: ['shoulder-pain', 'excessive-depth'],
    warningConditions: ['swinging', 'partial-ROM'],
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
  staticLunges: STATIC_LUNGE_DEFINITION,
  'static-lunges': STATIC_LUNGE_DEFINITION,
  reverseLunges: REVERSE_LUNGE_DEFINITION,
  'reverse-lunges': REVERSE_LUNGE_DEFINITION,
  singleLegSquats: SINGLE_LEG_SQUAT_DEFINITION,
  'single-leg-squats': SINGLE_LEG_SQUAT_DEFINITION,
  hipHinges: HIP_HINGE_DEFINITION,
  'hip-hinges': HIP_HINGE_DEFINITION,
  gluteBridges: GLUTE_BRIDGE_DEFINITION,
  'glute-bridges': GLUTE_BRIDGE_DEFINITION,
  singleLegGluteBridges: SINGLE_LEG_GLUTE_BRIDGE_DEFINITION,
  'single-leg-glute-bridges': SINGLE_LEG_GLUTE_BRIDGE_DEFINITION,
  kneePushUps: KNEE_PUSHUP_DEFINITION,
  'knee-push-ups': KNEE_PUSHUP_DEFINITION,
  inclinePushUps: INCLINE_PUSHUP_DEFINITION,
  'incline-push-ups': INCLINE_PUSHUP_DEFINITION,
  closeGripPushUps: CLOSE_GRIP_PUSHUP_DEFINITION,
  'close-grip-push-ups': CLOSE_GRIP_PUSHUP_DEFINITION,
  pikePushUps: PIKE_PUSHUP_DEFINITION,
  'pike-push-ups': PIKE_PUSHUP_DEFINITION,
  chairDips: CHAIR_DIP_DEFINITION,
  'chair-dips': CHAIR_DIP_DEFINITION,
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
