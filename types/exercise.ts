export type Difficulty = 'beginner' | 'intermediate';

export type BodyRegion = 'lower-body' | 'core' | 'upper-body' | 'balance-mobility';

export interface Exercise {
  id: string;
  name: string;
  description: string;
  instructions: string[];
  difficulty: Difficulty;
  targetMuscles: string[];
  benefits: string[];
  defaultDuration: number;
  defaultReps: number | null;
  isTimeBased: boolean;
  safetyFlags: {
    isExplosive: boolean;
    requiresSpace: boolean;
    spineLoaded: boolean;
    highImpact: boolean;
  };
  poseDetection: {
    supported: boolean;
    config: null;
    requiredLandmarks: string[];
    movementPattern: null;
    repCountingLogic: null;
    formValidationRules: null;
  };
  fallbackMode: 'timer' | 'reps';
  imageUrl: string | null;
}

export interface MuscleGroup {
  id: string;
  name: string;
  bodyRegion: BodyRegion;
  description: string;
  benefits: string[];
  exercises: string[];
  icon: string;
  color: string;
  gradientColors: [string, string];
}

export interface BodyPart {
  id: BodyRegion;
  name: string;
  description: string;
  muscleGroups: string[];
  icon: string;
  color: string;
}

export interface GeneratedWorkout {
  id: string;
  name: string;
  bodyParts: string[];
  exercises: WorkoutExercise[];
  totalDuration: number;
  difficulty: Difficulty;
  warmupIncluded: boolean;
  cooldownIncluded: boolean;
}

export interface WorkoutExercise {
  exerciseId: string;
  duration: number;
  reps: number | null;
  restAfter: number;
  order: number;
}
