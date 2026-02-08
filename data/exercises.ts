/**
 * Comprehensive Exercise Database for Gymless
 * 
 * 33+ bodyweight exercises across 15 body parts
 * Each exercise includes pose landmarks for detection, 
 * form rules, and rep counting patterns
 */


// Pose landmarks from MediaPipe (33 total points)
export type PoseLandmark =
    | 'nose'
    | 'leftEyeInner' | 'leftEye' | 'leftEyeOuter'
    | 'rightEyeInner' | 'rightEye' | 'rightEyeOuter'
    | 'leftEar' | 'rightEar'
    | 'mouthLeft' | 'mouthRight'
    | 'leftShoulder' | 'rightShoulder'
    | 'leftElbow' | 'rightElbow'
    | 'leftWrist' | 'rightWrist'
    | 'leftPinky' | 'rightPinky'
    | 'leftIndex' | 'rightIndex'
    | 'leftThumb' | 'rightThumb'
    | 'leftHip' | 'rightHip'
    | 'leftKnee' | 'rightKnee'
    | 'leftAnkle' | 'rightAnkle'
    | 'leftHeel' | 'rightHeel'
    | 'leftFootIndex' | 'rightFootIndex';

export type ExercisePhase = 'start' | 'down' | 'hold' | 'up' | 'transition';
export type ExerciseType = 'reps' | 'hold' | 'timed';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type CameraPosition = 'front' | 'side' | 'any';

export interface AngleCheck {
    joint: PoseLandmark;
    connectedTo: [PoseLandmark, PoseLandmark];
    minAngle: number;
    maxAngle: number;
    phase: ExercisePhase;
    feedbackIfWrong: string;
}

export interface PhaseDefinition {
    name: ExercisePhase;
    description: string;
    angleChecks: AngleCheck[];
}

export interface Exercise {
    id: string;
    name: string;
    bodyParts: string[]; // Body part IDs
    description: string;
    instructions: string[];
    tips: string[];
    commonMistakes: string[];

    // Detection config
    type: ExerciseType;
    difficulty: DifficultyLevel;
    cameraPosition: CameraPosition;
    requiredLandmarks: PoseLandmark[];
    phases: PhaseDefinition[];

    // Workout config
    defaultReps: number;
    defaultSets: number;
    defaultHoldSeconds?: number;
    restSeconds: number;

    // Calories estimate (per rep or per minute)
    caloriesPerRep?: number;
    caloriesPerMinute?: number;

    // Progression
    easierVariant?: string; // Exercise ID
    harderVariant?: string; // Exercise ID

    // Asset
    imageUri?: string;
}

// =============================================
// LOWER BODY EXERCISES
// =============================================

const SQUATS: Exercise = {
    id: 'squats',
    name: 'Squats',
    imageUri: 'https://images.unsplash.com/photo-1574680096145-d05b474e6152?auto=format&fit=crop&q=80&w=800',
    bodyParts: ['legs', 'thighs', 'glutes'],
    description: 'Fundamental lower body exercise for strength and endurance',
    instructions: [
        'Stand with feet shoulder-width apart',
        'Keep your back straight, core engaged',
        'Lower your body as if sitting into a chair',
        'Keep knees over toes, thighs parallel to ground',
        'Push through heels to stand back up',
    ],
    tips: [
        'Keep your weight on your heels',
        'Don\'t let knees cave inward',
        'Maintain a neutral spine',
    ],
    commonMistakes: [
        'Knees going past toes too much',
        'Rounding the lower back',
        'Not going low enough',
    ],
    type: 'reps',
    difficulty: 'beginner',
    cameraPosition: 'side',
    requiredLandmarks: ['leftHip', 'rightHip', 'leftKnee', 'rightKnee', 'leftAnkle', 'rightAnkle', 'leftShoulder', 'rightShoulder'],
    phases: [
        {
            name: 'start',
            description: 'Standing position',
            angleChecks: [
                {
                    joint: 'leftKnee',
                    connectedTo: ['leftHip', 'leftAnkle'],
                    minAngle: 160,
                    maxAngle: 180,
                    phase: 'start',
                    feedbackIfWrong: 'Extend fully at the top',
                },
            ],
        },
        {
            name: 'down',
            description: 'Squat position - thighs parallel',
            angleChecks: [
                {
                    joint: 'leftKnee',
                    connectedTo: ['leftHip', 'leftAnkle'],
                    minAngle: 70,
                    maxAngle: 110,
                    phase: 'down',
                    feedbackIfWrong: 'Go lower until thighs are parallel',
                },
            ],
        },
    ],
    defaultReps: 12,
    defaultSets: 3,
    restSeconds: 60,
    caloriesPerRep: 0.32,
    harderVariant: 'sumo-squats',
};

const WALL_SIT: Exercise = {
    id: 'wall-sit',
    name: 'Wall Sit',
    imageUri: 'https://images.unsplash.com/photo-1590234141364-7042da67bc9b?auto=format&fit=crop&q=80&w=800',
    bodyParts: ['legs', 'thighs'],
    description: 'Isometric hold for leg endurance',
    instructions: [
        'Stand with your back against a wall',
        'Slide down until thighs are parallel to floor',
        'Keep knees at 90 degrees',
        'Hold the position',
        'Keep your back flat against the wall',
    ],
    tips: [
        'Press your back firmly into the wall',
        'Don\'t let your knees go past your toes',
        'Breathe steadily throughout',
    ],
    commonMistakes: [
        'Thighs not parallel to ground',
        'Knees caving inward',
        'Holding breath',
    ],
    type: 'hold',
    difficulty: 'beginner',
    cameraPosition: 'side',
    requiredLandmarks: ['leftHip', 'rightHip', 'leftKnee', 'rightKnee', 'leftAnkle', 'rightAnkle'],
    phases: [
        {
            name: 'hold',
            description: 'Wall sit hold position',
            angleChecks: [
                {
                    joint: 'leftKnee',
                    connectedTo: ['leftHip', 'leftAnkle'],
                    minAngle: 85,
                    maxAngle: 100,
                    phase: 'hold',
                    feedbackIfWrong: 'Adjust until knees are at 90 degrees',
                },
            ],
        },
    ],
    defaultReps: 1,
    defaultSets: 3,
    defaultHoldSeconds: 30,
    restSeconds: 60,
    caloriesPerMinute: 5,
};

const GLUTE_BRIDGES: Exercise = {
    id: 'glute-bridges',
    name: 'Glute Bridges',
    bodyParts: ['glutes', 'hamstrings', 'lower-back'],
    description: 'Hip lift for glute activation and lower back support',
    instructions: [
        'Lie on your back, knees bent, feet flat on floor',
        'Arms at sides, palms down',
        'Push through heels to lift hips up',
        'Squeeze glutes at the top',
        'Lower back down with control',
    ],
    tips: [
        'Keep your core engaged',
        'Don\'t overarch your lower back',
        'Squeeze glutes hard at the top',
    ],
    commonMistakes: [
        'Not lifting hips high enough',
        'Pushing through toes instead of heels',
        'Rushing the movement',
    ],
    type: 'reps',
    difficulty: 'beginner',
    cameraPosition: 'side',
    requiredLandmarks: ['leftHip', 'rightHip', 'leftKnee', 'rightKnee', 'leftShoulder', 'rightShoulder', 'leftAnkle', 'rightAnkle'],
    phases: [
        {
            name: 'start',
            description: 'Lying position with hips down',
            angleChecks: [],
        },
        {
            name: 'up',
            description: 'Hips raised, body in straight line',
            angleChecks: [
                {
                    joint: 'leftHip',
                    connectedTo: ['leftShoulder', 'leftKnee'],
                    minAngle: 160,
                    maxAngle: 180,
                    phase: 'up',
                    feedbackIfWrong: 'Lift hips higher',
                },
            ],
        },
    ],
    defaultReps: 15,
    defaultSets: 3,
    restSeconds: 45,
    caloriesPerRep: 0.25,
    harderVariant: 'single-leg-bridges',
};

const LUNGES: Exercise = {
    id: 'lunges',
    name: 'Static Lunges',
    imageUri: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&q=80&w=800',
    bodyParts: ['legs', 'thighs', 'glutes'],
    description: 'Unilateral leg exercise for strength and balance',
    instructions: [
        'Stand with feet hip-width apart',
        'Step one foot forward into a split stance',
        'Lower your body until both knees are at 90 degrees',
        'Front knee stays over ankle',
        'Push back up to starting position',
    ],
    tips: [
        'Keep your torso upright',
        'Don\'t let front knee go past toes',
        'Back knee should almost touch the ground',
    ],
    commonMistakes: [
        'Leaning too far forward',
        'Front knee collapsing inward',
        'Not going low enough',
    ],
    type: 'reps',
    difficulty: 'beginner',
    cameraPosition: 'side',
    requiredLandmarks: ['leftHip', 'rightHip', 'leftKnee', 'rightKnee', 'leftAnkle', 'rightAnkle', 'leftShoulder', 'rightShoulder'],
    phases: [
        {
            name: 'start',
            description: 'Standing split stance',
            angleChecks: [],
        },
        {
            name: 'down',
            description: 'Lowered position with both knees bent',
            angleChecks: [
                {
                    joint: 'leftKnee',
                    connectedTo: ['leftHip', 'leftAnkle'],
                    minAngle: 80,
                    maxAngle: 100,
                    phase: 'down',
                    feedbackIfWrong: 'Bend knee to 90 degrees',
                },
            ],
        },
    ],
    defaultReps: 10,
    defaultSets: 3,
    restSeconds: 60,
    caloriesPerRep: 0.3,
    harderVariant: 'reverse-lunges',
};

const CALF_RAISES: Exercise = {
    id: 'calf-raises',
    name: 'Standing Calf Raises',
    bodyParts: ['calves'],
    description: 'Isolate your calf muscles for lower leg strength',
    instructions: [
        'Stand with feet hip-width apart',
        'Hold onto a wall or chair for balance',
        'Rise up onto the balls of your feet',
        'Hold briefly at the top',
        'Lower back down with control',
    ],
    tips: [
        'Go as high as possible on your toes',
        'Control the lowering phase',
        'Keep your core engaged',
    ],
    commonMistakes: [
        'Not going high enough',
        'Rushing the movement',
        'Leaning forward',
    ],
    type: 'reps',
    difficulty: 'beginner',
    cameraPosition: 'side',
    requiredLandmarks: ['leftAnkle', 'rightAnkle', 'leftKnee', 'rightKnee', 'leftHeel', 'rightHeel'],
    phases: [
        {
            name: 'start',
            description: 'Standing flat',
            angleChecks: [],
        },
        {
            name: 'up',
            description: 'On toes, calves contracted',
            angleChecks: [],
        },
    ],
    defaultReps: 15,
    defaultSets: 3,
    restSeconds: 45,
    caloriesPerRep: 0.1,
    harderVariant: 'single-leg-calf-raises',
};

const SUMO_SQUATS: Exercise = {
    id: 'sumo-squats',
    name: 'Sumo Squats',
    bodyParts: ['thighs', 'glutes', 'legs'],
    description: 'Wide stance squat targeting inner thighs',
    instructions: [
        'Stand with feet wider than shoulder-width',
        'Point toes outward at 45 degrees',
        'Keep back straight, core engaged',
        'Lower down by bending knees outward',
        'Push through heels to stand back up',
    ],
    tips: [
        'Keep knees tracking over toes',
        'Squeeze inner thighs on the way up',
        'Stay upright through the movement',
    ],
    commonMistakes: [
        'Knees caving inward',
        'Leaning forward',
        'Not going deep enough',
    ],
    type: 'reps',
    difficulty: 'intermediate',
    cameraPosition: 'front',
    requiredLandmarks: ['leftHip', 'rightHip', 'leftKnee', 'rightKnee', 'leftAnkle', 'rightAnkle'],
    phases: [
        {
            name: 'start',
            description: 'Wide stance standing',
            angleChecks: [],
        },
        {
            name: 'down',
            description: 'Squat position',
            angleChecks: [
                {
                    joint: 'leftKnee',
                    connectedTo: ['leftHip', 'leftAnkle'],
                    minAngle: 70,
                    maxAngle: 110,
                    phase: 'down',
                    feedbackIfWrong: 'Go lower',
                },
            ],
        },
    ],
    defaultReps: 12,
    defaultSets: 3,
    restSeconds: 60,
    caloriesPerRep: 0.35,
    easierVariant: 'squats',
};

// =============================================
// CORE EXERCISES
// =============================================

const CRUNCHES: Exercise = {
    id: 'crunches',
    name: 'Crunches',
    bodyParts: ['abs'],
    description: 'Classic ab exercise for front core strength',
    instructions: [
        'Lie on your back, knees bent, feet flat',
        'Place hands behind your head or crossed on chest',
        'Engage core and lift shoulders off ground',
        'Curl up toward your knees',
        'Lower back down with control',
    ],
    tips: [
        'Don\'t pull on your neck',
        'Keep lower back pressed to floor',
        'Exhale as you crunch up',
    ],
    commonMistakes: [
        'Pulling on the neck',
        'Using momentum',
        'Lifting too high',
    ],
    type: 'reps',
    difficulty: 'beginner',
    cameraPosition: 'side',
    requiredLandmarks: ['leftShoulder', 'rightShoulder', 'leftHip', 'rightHip', 'nose'],
    phases: [
        {
            name: 'start',
            description: 'Lying flat',
            angleChecks: [],
        },
        {
            name: 'up',
            description: 'Shoulders lifted, core contracted',
            angleChecks: [],
        },
    ],
    defaultReps: 15,
    defaultSets: 3,
    restSeconds: 45,
    caloriesPerRep: 0.15,
    harderVariant: 'russian-twists',
};

const LEG_RAISES: Exercise = {
    id: 'leg-raises',
    name: 'Leg Raises',
    bodyParts: ['abs'],
    description: 'Lower ab focus for core strength',
    instructions: [
        'Lie flat on your back',
        'Place hands under your hips for support',
        'Keep legs straight and together',
        'Lift legs to 90 degrees',
        'Lower back down without touching floor',
    ],
    tips: [
        'Keep lower back pressed to floor',
        'Control the lowering phase',
        'Don\'t use momentum',
    ],
    commonMistakes: [
        'Arching lower back',
        'Bending knees',
        'Dropping legs too fast',
    ],
    type: 'reps',
    difficulty: 'intermediate',
    cameraPosition: 'side',
    requiredLandmarks: ['leftHip', 'rightHip', 'leftKnee', 'rightKnee', 'leftAnkle', 'rightAnkle'],
    phases: [
        {
            name: 'start',
            description: 'Legs hovering above ground',
            angleChecks: [],
        },
        {
            name: 'up',
            description: 'Legs raised to 90 degrees',
            angleChecks: [],
        },
    ],
    defaultReps: 12,
    defaultSets: 3,
    restSeconds: 45,
    caloriesPerRep: 0.2,
};

const SIDE_PLANK: Exercise = {
    id: 'side-plank',
    name: 'Side Plank',
    imageUri: 'https://images.unsplash.com/photo-1541534741688-6078c65b5a33?auto=format&fit=crop&q=80&w=800',
    bodyParts: ['obliques', 'abs'],
    description: 'Isometric hold for side core stability',
    instructions: [
        'Lie on your side with elbow under shoulder',
        'Stack feet on top of each other',
        'Lift hips off ground to form straight line',
        'Hold position, keeping hips up',
        'Don\'t let hips sag or rotate',
    ],
    tips: [
        'Keep body in straight line',
        'Breathe normally',
        'Engage your obliques',
    ],
    commonMistakes: [
        'Hips sagging down',
        'Rotating forward or backward',
        'Holding breath',
    ],
    type: 'hold',
    difficulty: 'intermediate',
    cameraPosition: 'front',
    requiredLandmarks: ['leftShoulder', 'rightShoulder', 'leftHip', 'rightHip', 'leftAnkle', 'rightAnkle'],
    phases: [
        {
            name: 'hold',
            description: 'Side plank position',
            angleChecks: [],
        },
    ],
    defaultReps: 1,
    defaultSets: 3,
    defaultHoldSeconds: 30,
    restSeconds: 45,
    caloriesPerMinute: 5,
};

const RUSSIAN_TWISTS: Exercise = {
    id: 'russian-twists',
    name: 'Russian Twists',
    bodyParts: ['obliques', 'abs'],
    description: 'Rotational core exercise for waist stability',
    instructions: [
        'Sit with knees bent, feet flat or elevated',
        'Lean back slightly, core engaged',
        'Keep back straight, not rounded',
        'Rotate torso side to side',
        'Touch the ground beside each hip',
    ],
    tips: [
        'Move from your core, not shoulders',
        'Keep chest lifted',
        'Control the rotation speed',
    ],
    commonMistakes: [
        'Rounding the back',
        'Moving too fast',
        'Not rotating enough',
    ],
    type: 'reps',
    difficulty: 'intermediate',
    cameraPosition: 'front',
    requiredLandmarks: ['leftShoulder', 'rightShoulder', 'leftHip', 'rightHip', 'leftWrist', 'rightWrist'],
    phases: [
        {
            name: 'start',
            description: 'Center position',
            angleChecks: [],
        },
        {
            name: 'transition',
            description: 'Rotated to side',
            angleChecks: [],
        },
    ],
    defaultReps: 20,
    defaultSets: 3,
    restSeconds: 45,
    caloriesPerRep: 0.2,
    easierVariant: 'crunches',
};

const SUPERMAN: Exercise = {
    id: 'superman',
    name: 'Superman Hold',
    bodyParts: ['lower-back', 'glutes'],
    description: 'Back extension for spine support',
    instructions: [
        'Lie face down with arms extended overhead',
        'Keep legs straight behind you',
        'Simultaneously lift arms and legs off ground',
        'Hold at the top, squeezing lower back',
        'Lower back down with control',
    ],
    tips: [
        'Look down to keep neck neutral',
        'Lift from your back, not arms',
        'Squeeze glutes at the top',
    ],
    commonMistakes: [
        'Looking up and straining neck',
        'Not lifting high enough',
        'Rushing the movement',
    ],
    type: 'hold',
    difficulty: 'beginner',
    cameraPosition: 'side',
    requiredLandmarks: ['leftShoulder', 'rightShoulder', 'leftHip', 'rightHip', 'leftWrist', 'rightWrist', 'leftAnkle', 'rightAnkle'],
    phases: [
        {
            name: 'hold',
            description: 'Lifted position',
            angleChecks: [],
        },
    ],
    defaultReps: 1,
    defaultSets: 3,
    defaultHoldSeconds: 15,
    restSeconds: 45,
    caloriesPerMinute: 3,
    harderVariant: 'bird-dogs',
};

const BIRD_DOGS: Exercise = {
    id: 'bird-dogs',
    name: 'Bird Dogs',
    bodyParts: ['lower-back', 'abs', 'glutes'],
    description: 'Core stability exercise for spine health',
    instructions: [
        'Start on hands and knees',
        'Keep back flat, core engaged',
        'Extend right arm and left leg simultaneously',
        'Hold briefly, then return to start',
        'Repeat with opposite arm and leg',
    ],
    tips: [
        'Keep your back flat throughout',
        'Don\'t rotate hips or shoulders',
        'Move slowly and controlled',
    ],
    commonMistakes: [
        'Arching the back',
        'Rotating the hips',
        'Moving too fast',
    ],
    type: 'reps',
    difficulty: 'beginner',
    cameraPosition: 'side',
    requiredLandmarks: ['leftShoulder', 'rightShoulder', 'leftHip', 'rightHip', 'leftWrist', 'rightWrist', 'leftAnkle', 'rightAnkle'],
    phases: [
        {
            name: 'start',
            description: 'All fours position',
            angleChecks: [],
        },
        {
            name: 'up',
            description: 'Opposite arm and leg extended',
            angleChecks: [],
        },
    ],
    defaultReps: 10,
    defaultSets: 3,
    restSeconds: 45,
    caloriesPerRep: 0.2,
    easierVariant: 'superman',
};

// =============================================
// UPPER BODY EXERCISES
// =============================================

const PUSH_UPS: Exercise = {
    id: 'push-ups',
    name: 'Push-Ups',
    imageUri: 'https://images.unsplash.com/photo-1598971639058-aba7c0bfaf9b?auto=format&fit=crop&q=80&w=800',
    bodyParts: ['chest', 'triceps', 'shoulders'],
    description: 'Classic upper body pushing exercise',
    instructions: [
        'Start in high plank position',
        'Hands slightly wider than shoulders',
        'Keep body in straight line from head to heels',
        'Lower chest toward the ground, elbows at 45 degrees',
        'Push back up to starting position',
    ],
    tips: [
        'Keep core tight throughout',
        'Don\'t let hips sag or pike up',
        'Full range of motion',
    ],
    commonMistakes: [
        'Hips sagging or piking',
        'Elbows flaring out',
        'Not going low enough',
    ],
    type: 'reps',
    difficulty: 'intermediate',
    cameraPosition: 'side',
    requiredLandmarks: ['leftShoulder', 'rightShoulder', 'leftElbow', 'rightElbow', 'leftWrist', 'rightWrist', 'leftHip', 'rightHip', 'leftAnkle', 'rightAnkle'],
    phases: [
        {
            name: 'up',
            description: 'Arms extended, plank position',
            angleChecks: [
                {
                    joint: 'leftElbow',
                    connectedTo: ['leftShoulder', 'leftWrist'],
                    minAngle: 160,
                    maxAngle: 180,
                    phase: 'up',
                    feedbackIfWrong: 'Fully extend your arms',
                },
            ],
        },
        {
            name: 'down',
            description: 'Chest near ground',
            angleChecks: [
                {
                    joint: 'leftElbow',
                    connectedTo: ['leftShoulder', 'leftWrist'],
                    minAngle: 70,
                    maxAngle: 100,
                    phase: 'down',
                    feedbackIfWrong: 'Go lower',
                },
            ],
        },
    ],
    defaultReps: 10,
    defaultSets: 3,
    restSeconds: 60,
    caloriesPerRep: 0.4,
    easierVariant: 'knee-push-ups',
    harderVariant: 'pike-push-ups',
};

const KNEE_PUSH_UPS: Exercise = {
    id: 'knee-push-ups',
    name: 'Knee Push-Ups',
    bodyParts: ['chest', 'triceps', 'shoulders'],
    description: 'Modified push-up for beginners',
    instructions: [
        'Start on hands and knees',
        'Walk hands forward until body is at an angle',
        'Keep core engaged, back straight',
        'Lower chest toward the ground',
        'Push back up to starting position',
    ],
    tips: [
        'Keep a straight line from head to knees',
        'Don\'t let hips sag',
        'Control the movement',
    ],
    commonMistakes: [
        'Hips piking up',
        'Not going low enough',
        'Rushing the movement',
    ],
    type: 'reps',
    difficulty: 'beginner',
    cameraPosition: 'side',
    requiredLandmarks: ['leftShoulder', 'rightShoulder', 'leftElbow', 'rightElbow', 'leftWrist', 'rightWrist', 'leftKnee', 'rightKnee'],
    phases: [
        {
            name: 'up',
            description: 'Arms extended',
            angleChecks: [],
        },
        {
            name: 'down',
            description: 'Chest near ground',
            angleChecks: [],
        },
    ],
    defaultReps: 12,
    defaultSets: 3,
    restSeconds: 45,
    caloriesPerRep: 0.3,
    harderVariant: 'push-ups',
};

const INCLINE_PUSH_UPS: Exercise = {
    id: 'incline-push-ups',
    name: 'Incline Push-Ups',
    bodyParts: ['chest', 'triceps'],
    description: 'Push-up with hands elevated on chair or bench',
    instructions: [
        'Place hands on a sturdy elevated surface',
        'Walk feet back to form a straight line',
        'Keep core engaged throughout',
        'Lower chest toward the surface',
        'Push back up to starting position',
    ],
    tips: [
        'Keep body in straight line',
        'Use a stable surface',
        'Don\'t let elbows flare out',
    ],
    commonMistakes: [
        'Sagging hips',
        'Using an unstable surface',
        'Not controlling the descent',
    ],
    type: 'reps',
    difficulty: 'beginner',
    cameraPosition: 'side',
    requiredLandmarks: ['leftShoulder', 'rightShoulder', 'leftElbow', 'rightElbow', 'leftWrist', 'rightWrist', 'leftHip', 'rightHip'],
    phases: [
        {
            name: 'up',
            description: 'Arms extended',
            angleChecks: [],
        },
        {
            name: 'down',
            description: 'Chest near surface',
            angleChecks: [],
        },
    ],
    defaultReps: 12,
    defaultSets: 3,
    restSeconds: 45,
    caloriesPerRep: 0.25,
    harderVariant: 'push-ups',
};

const CHAIR_DIPS: Exercise = {
    id: 'chair-dips',
    name: 'Chair Dips',
    bodyParts: ['triceps', 'shoulders'],
    description: 'Tricep-focused exercise using a chair or bench',
    instructions: [
        'Sit on edge of a sturdy chair',
        'Place hands beside hips, fingers forward',
        'Slide forward off the chair, supporting weight with arms',
        'Lower body by bending elbows to 90 degrees',
        'Push back up to straight arms',
    ],
    tips: [
        'Keep elbows pointing back, not out',
        'Stay close to the chair',
        'Don\'t shrug shoulders',
    ],
    commonMistakes: [
        'Elbows flaring outward',
        'Going too low and straining shoulders',
        'Using unstable surface',
    ],
    type: 'reps',
    difficulty: 'intermediate',
    cameraPosition: 'side',
    requiredLandmarks: ['leftShoulder', 'rightShoulder', 'leftElbow', 'rightElbow', 'leftWrist', 'rightWrist', 'leftHip', 'rightHip'],
    phases: [
        {
            name: 'up',
            description: 'Arms extended',
            angleChecks: [
                {
                    joint: 'leftElbow',
                    connectedTo: ['leftShoulder', 'leftWrist'],
                    minAngle: 160,
                    maxAngle: 180,
                    phase: 'up',
                    feedbackIfWrong: 'Extend arms fully',
                },
            ],
        },
        {
            name: 'down',
            description: 'Elbows bent to 90 degrees',
            angleChecks: [
                {
                    joint: 'leftElbow',
                    connectedTo: ['leftShoulder', 'leftWrist'],
                    minAngle: 80,
                    maxAngle: 100,
                    phase: 'down',
                    feedbackIfWrong: 'Lower until elbows are at 90 degrees',
                },
            ],
        },
    ],
    defaultReps: 10,
    defaultSets: 3,
    restSeconds: 60,
    caloriesPerRep: 0.35,
};

const PIKE_PUSH_UPS: Exercise = {
    id: 'pike-push-ups',
    name: 'Pike Push-Ups',
    bodyParts: ['shoulders', 'triceps'],
    description: 'Inverted push-up targeting shoulders',
    instructions: [
        'Start in downward dog position',
        'Hands shoulder-width apart, hips high',
        'Form an upside-down V shape',
        'Lower head toward the ground by bending elbows',
        'Push back up to starting position',
    ],
    tips: [
        'Keep hips high throughout',
        'Look back toward feet',
        'Go as low as comfortable',
    ],
    commonMistakes: [
        'Hips dropping down',
        'Not going low enough',
        'Elbows flaring out',
    ],
    type: 'reps',
    difficulty: 'advanced',
    cameraPosition: 'side',
    requiredLandmarks: ['leftShoulder', 'rightShoulder', 'leftElbow', 'rightElbow', 'leftWrist', 'rightWrist', 'leftHip', 'rightHip', 'nose'],
    phases: [
        {
            name: 'up',
            description: 'Pike position, arms extended',
            angleChecks: [],
        },
        {
            name: 'down',
            description: 'Head lowered toward ground',
            angleChecks: [],
        },
    ],
    defaultReps: 8,
    defaultSets: 3,
    restSeconds: 60,
    caloriesPerRep: 0.45,
    easierVariant: 'push-ups',
};

const ARM_CIRCLES: Exercise = {
    id: 'arm-circles',
    name: 'Arm Circles',
    bodyParts: ['shoulders'],
    description: 'Dynamic shoulder warmup and mobility',
    instructions: [
        'Stand with feet shoulder-width apart',
        'Extend arms out to sides at shoulder height',
        'Make small circles forward',
        'Gradually increase circle size',
        'Reverse direction',
    ],
    tips: [
        'Keep arms straight',
        'Maintain good posture',
        'Control the movement',
    ],
    commonMistakes: [
        'Circles too small',
        'Dropping arms',
        'Moving too fast',
    ],
    type: 'timed',
    difficulty: 'beginner',
    cameraPosition: 'front',
    requiredLandmarks: ['leftShoulder', 'rightShoulder', 'leftWrist', 'rightWrist', 'leftElbow', 'rightElbow'],
    phases: [
        {
            name: 'transition',
            description: 'Continuous circular motion',
            angleChecks: [],
        },
    ],
    defaultReps: 1,
    defaultSets: 2,
    defaultHoldSeconds: 30,
    restSeconds: 30,
    caloriesPerMinute: 3,
};

const WALL_ANGELS: Exercise = {
    id: 'wall-angels',
    name: 'Wall Angels',
    bodyParts: ['upper-back', 'shoulders'],
    description: 'Posture and shoulder mobility exercise',
    instructions: [
        'Stand with back against wall',
        'Press head, upper back, and hips to wall',
        'Raise arms to "goal post" position against wall',
        'Slide arms up and down while keeping contact with wall',
        'Move slowly and controlled',
    ],
    tips: [
        'Keep entire back pressed to wall',
        'Don\'t arch lower back',
        'Move arms as far as comfortable',
    ],
    commonMistakes: [
        'Lower back coming off wall',
        'Arms losing wall contact',
        'Moving too fast',
    ],
    type: 'reps',
    difficulty: 'beginner',
    cameraPosition: 'side',
    requiredLandmarks: ['leftShoulder', 'rightShoulder', 'leftWrist', 'rightWrist', 'leftElbow', 'rightElbow'],
    phases: [
        {
            name: 'start',
            description: 'Goal post position',
            angleChecks: [],
        },
        {
            name: 'up',
            description: 'Arms extended overhead',
            angleChecks: [],
        },
    ],
    defaultReps: 10,
    defaultSets: 3,
    restSeconds: 45,
    caloriesPerRep: 0.15,
};

// =============================================
// BALANCE & FLEXIBILITY EXERCISES
// =============================================

const SINGLE_LEG_STAND: Exercise = {
    id: 'single-leg-stand',
    name: 'Single-Leg Stand',
    bodyParts: ['balance'],
    description: 'Basic balance exercise for stability',
    instructions: [
        'Stand on one leg',
        'Lift other foot off the ground',
        'Keep arms out for balance if needed',
        'Hold position as long as possible',
        'Switch legs and repeat',
    ],
    tips: [
        'Focus on a fixed point',
        'Keep core engaged',
        'Start near a wall for safety',
    ],
    commonMistakes: [
        'Looking down',
        'Tensing up too much',
        'Giving up too quickly',
    ],
    type: 'hold',
    difficulty: 'beginner',
    cameraPosition: 'front',
    requiredLandmarks: ['leftHip', 'rightHip', 'leftKnee', 'rightKnee', 'leftAnkle', 'rightAnkle'],
    phases: [
        {
            name: 'hold',
            description: 'Balanced on one leg',
            angleChecks: [],
        },
    ],
    defaultReps: 1,
    defaultSets: 4,
    defaultHoldSeconds: 30,
    restSeconds: 15,
    caloriesPerMinute: 2,
};

const FORWARD_FOLD: Exercise = {
    id: 'forward-fold',
    name: 'Forward Fold',
    bodyParts: ['flexibility', 'hamstrings'],
    description: 'Hamstring and lower back stretch',
    instructions: [
        'Stand with feet hip-width apart',
        'Hinge at the hips and fold forward',
        'Let arms hang or hold opposite elbows',
        'Keep knees slightly bent if needed',
        'Relax head and neck',
    ],
    tips: [
        'Fold from the hips, not waist',
        'Don\'t force the stretch',
        'Breathe deeply',
    ],
    commonMistakes: [
        'Rounding the back too much',
        'Locking the knees',
        'Holding breath',
    ],
    type: 'hold',
    difficulty: 'beginner',
    cameraPosition: 'side',
    requiredLandmarks: ['leftShoulder', 'rightShoulder', 'leftHip', 'rightHip', 'leftKnee', 'rightKnee'],
    phases: [
        {
            name: 'hold',
            description: 'Folded forward position',
            angleChecks: [],
        },
    ],
    defaultReps: 1,
    defaultSets: 2,
    defaultHoldSeconds: 30,
    restSeconds: 15,
    caloriesPerMinute: 1,
};

const HIP_FLEXOR_STRETCH: Exercise = {
    id: 'hip-flexor-stretch',
    name: 'Hip Flexor Stretch',
    bodyParts: ['flexibility', 'thighs'],
    description: 'Stretch for tight hip flexors and quads',
    instructions: [
        'Kneel on one knee, other foot flat in front',
        'Keep torso upright',
        'Push hips gently forward',
        'Feel stretch in front of back leg hip',
        'Hold and breathe, then switch sides',
    ],
    tips: [
        'Keep back straight',
        'Squeeze glute of back leg',
        'Don\'t lean forward',
    ],
    commonMistakes: [
        'Leaning forward',
        'Arching lower back',
        'Not engaging glutes',
    ],
    type: 'hold',
    difficulty: 'beginner',
    cameraPosition: 'side',
    requiredLandmarks: ['leftHip', 'rightHip', 'leftKnee', 'rightKnee', 'leftAnkle', 'rightAnkle', 'leftShoulder', 'rightShoulder'],
    phases: [
        {
            name: 'hold',
            description: 'Stretched position',
            angleChecks: [],
        },
    ],
    defaultReps: 1,
    defaultSets: 2,
    defaultHoldSeconds: 30,
    restSeconds: 15,
    caloriesPerMinute: 1,
};

// =============================================
// EXPORT ALL EXERCISES
// =============================================

export const EXERCISES: Exercise[] = [
    // Lower Body
    SQUATS,
    WALL_SIT,
    GLUTE_BRIDGES,
    LUNGES,
    CALF_RAISES,
    SUMO_SQUATS,

    // Core
    CRUNCHES,
    LEG_RAISES,
    SIDE_PLANK,
    RUSSIAN_TWISTS,
    SUPERMAN,
    BIRD_DOGS,

    // Upper Body
    PUSH_UPS,
    KNEE_PUSH_UPS,
    INCLINE_PUSH_UPS,
    CHAIR_DIPS,
    PIKE_PUSH_UPS,
    ARM_CIRCLES,
    WALL_ANGELS,

    // Balance & Flexibility
    SINGLE_LEG_STAND,
    FORWARD_FOLD,
    HIP_FLEXOR_STRETCH,
];

// Helper functions
export function getExerciseById(id: string): Exercise | undefined {
    return EXERCISES.find((e) => e.id === id);
}

export function getExercisesByBodyPart(bodyPartId: string): Exercise[] {
    return EXERCISES.filter((e) => e.bodyParts.includes(bodyPartId));
}

export function getExercisesByDifficulty(difficulty: DifficultyLevel): Exercise[] {
    return EXERCISES.filter((e) => e.difficulty === difficulty);
}

export function getExercisesByType(type: ExerciseType): Exercise[] {
    return EXERCISES.filter((e) => e.type === type);
}

// Get all exercises organized by body part
export function getExercisesGroupedByBodyPart(): Record<string, Exercise[]> {
    const grouped: Record<string, Exercise[]> = {};

    EXERCISES.forEach((exercise) => {
        exercise.bodyParts.forEach((bodyPartId) => {
            if (!grouped[bodyPartId]) {
                grouped[bodyPartId] = [];
            }
            if (!grouped[bodyPartId].includes(exercise)) {
                grouped[bodyPartId].push(exercise);
            }
        });
    });

    return grouped;
}
