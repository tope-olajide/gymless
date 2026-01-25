import { exercises, getExerciseById, getBeginnerSafeExercises } from '@/data/exercises';
import { muscleGroups, getMuscleGroupById } from '@/data/bodyParts';
import { Exercise, GeneratedWorkout, WorkoutExercise, Difficulty } from '@/types/exercise';

interface WorkoutConfig {
  muscleGroupIds: string[];
  duration: 5 | 10 | 15 | 20;
  difficulty: Difficulty;
}

const WARMUP_EXERCISES = ['jumpingJacks', 'armCircles', 'highKnees'];
const COOLDOWN_EXERCISES = ['forwardFolds', 'shoulderStretches', 'hipFlexorStretches'];

const REST_TIMES = {
  beginner: { between: 20, afterWarmup: 15 },
  intermediate: { between: 15, afterWarmup: 10 },
};

const generateId = (): string => {
  return `workout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const getExercisesForMuscleGroup = (muscleGroupId: string, difficulty: Difficulty): Exercise[] => {
  const group = getMuscleGroupById(muscleGroupId);
  if (!group) return [];

  const groupExercises = group.exercises
    .map(id => getExerciseById(id))
    .filter((e): e is Exercise => e !== undefined);

  if (difficulty === 'beginner') {
    return groupExercises.filter(e =>
      e.difficulty === 'beginner' ||
      (!e.safetyFlags.isExplosive && !e.safetyFlags.highImpact)
    );
  }

  return groupExercises;
};

const selectWarmupExercises = (difficulty: Difficulty): Exercise[] => {
  const warmups = WARMUP_EXERCISES
    .map(id => getExerciseById(id))
    .filter((e): e is Exercise => e !== undefined);

  if (difficulty === 'beginner') {
    return warmups.filter(e => !e.safetyFlags.isExplosive);
  }

  return warmups.slice(0, 2);
};

const selectCooldownExercises = (): Exercise[] => {
  return COOLDOWN_EXERCISES
    .map(id => getExerciseById(id))
    .filter((e): e is Exercise => e !== undefined)
    .slice(0, 2);
};

const preventConsecutiveSpineExercises = (exerciseList: Exercise[]): Exercise[] => {
  const result: Exercise[] = [];

  for (const exercise of exerciseList) {
    const lastExercise = result[result.length - 1];

    if (lastExercise?.safetyFlags.spineLoaded && exercise.safetyFlags.spineLoaded) {
      const nonSpineIndex = exerciseList.findIndex(
        e => !e.safetyFlags.spineLoaded && !result.includes(e)
      );

      if (nonSpineIndex !== -1) {
        result.push(exerciseList[nonSpineIndex]);
        result.push(exercise);
        continue;
      }
    }

    result.push(exercise);
  }

  return result;
};

const calculateExerciseDuration = (
  exercise: Exercise,
  difficulty: Difficulty,
  targetTimePerExercise: number
): { duration: number; reps: number | null } => {
  if (exercise.isTimeBased) {
    const baseDuration = exercise.defaultDuration;
    const adjustedDuration = difficulty === 'beginner'
      ? Math.min(baseDuration, targetTimePerExercise * 0.8)
      : Math.min(baseDuration * 1.2, targetTimePerExercise);

    return { duration: Math.round(adjustedDuration), reps: null };
  }

  const baseReps = exercise.defaultReps || 10;
  const adjustedReps = difficulty === 'beginner'
    ? Math.max(Math.floor(baseReps * 0.7), 5)
    : baseReps;

  const estimatedDuration = adjustedReps * 3;

  return { duration: estimatedDuration, reps: adjustedReps };
};

export const generateWorkout = (config: WorkoutConfig): GeneratedWorkout => {
  const { muscleGroupIds, duration, difficulty } = config;
  const totalSeconds = duration * 60;
  const restTime = REST_TIMES[difficulty];

  const warmupExercises = selectWarmupExercises(difficulty);
  const cooldownExercises = selectCooldownExercises();

  const warmupTime = warmupExercises.length * 25;
  const cooldownTime = cooldownExercises.length * 30;
  const mainWorkoutTime = totalSeconds - warmupTime - cooldownTime - 30;

  let availableExercises: Exercise[] = [];

  for (const groupId of muscleGroupIds) {
    const groupExercises = getExercisesForMuscleGroup(groupId, difficulty);
    availableExercises.push(...groupExercises);
  }

  availableExercises = [...new Map(availableExercises.map(e => [e.id, e])).values()];

  if (difficulty === 'beginner') {
    availableExercises = availableExercises.filter(
      e => !e.safetyFlags.isExplosive || Math.random() > 0.7
    );
  }

  availableExercises = shuffleArray(availableExercises);
  availableExercises = preventConsecutiveSpineExercises(availableExercises);

  const targetExerciseCount = Math.max(3, Math.floor(mainWorkoutTime / 50));
  const selectedExercises = availableExercises.slice(0, targetExerciseCount);

  const targetTimePerExercise = mainWorkoutTime / selectedExercises.length;

  const workoutExercises: WorkoutExercise[] = [];
  let order = 0;

  for (const exercise of warmupExercises) {
    workoutExercises.push({
      exerciseId: exercise.id,
      duration: 25,
      reps: null,
      restAfter: restTime.afterWarmup,
      order: order++,
    });
  }

  for (let i = 0; i < selectedExercises.length; i++) {
    const exercise = selectedExercises[i];
    const { duration: exerciseDuration, reps } = calculateExerciseDuration(
      exercise,
      difficulty,
      targetTimePerExercise
    );

    workoutExercises.push({
      exerciseId: exercise.id,
      duration: exerciseDuration,
      reps,
      restAfter: i < selectedExercises.length - 1 ? restTime.between : 10,
      order: order++,
    });
  }

  for (const exercise of cooldownExercises) {
    workoutExercises.push({
      exerciseId: exercise.id,
      duration: 30,
      reps: null,
      restAfter: 5,
      order: order++,
    });
  }

  const actualDuration = workoutExercises.reduce(
    (sum, e) => sum + e.duration + e.restAfter,
    0
  );

  const muscleGroupNames = muscleGroupIds
    .map(id => getMuscleGroupById(id)?.name)
    .filter(Boolean)
    .join(' & ');

  return {
    id: generateId(),
    name: `${muscleGroupNames} Workout`,
    bodyParts: muscleGroupIds,
    exercises: workoutExercises,
    totalDuration: Math.round(actualDuration / 60),
    difficulty,
    warmupIncluded: true,
    cooldownIncluded: true,
  };
};

export const generateQuickWorkout = (
  duration: 5 | 10 | 15 | 20,
  difficulty: Difficulty
): GeneratedWorkout => {
  const allMuscleGroupIds = Object.keys(muscleGroups);
  const shuffled = shuffleArray(allMuscleGroupIds);
  const selectedGroups = shuffled.slice(0, 3);

  return generateWorkout({
    muscleGroupIds: selectedGroups,
    duration,
    difficulty,
  });
};

export const getWorkoutSuggestionReason = (
  muscleGroupIds: string[],
  lastTrainedDates: Record<string, string | null>,
  lastWorkoutBodyParts: string[]
): string => {
  const daysSinceTraining: { id: string; days: number }[] = [];

  for (const id of muscleGroupIds) {
    const lastTrained = lastTrainedDates[id];
    if (!lastTrained) {
      daysSinceTraining.push({ id, days: 999 });
    } else {
      const days = Math.floor(
        (Date.now() - new Date(lastTrained).getTime()) / (1000 * 60 * 60 * 24)
      );
      daysSinceTraining.push({ id, days });
    }
  }

  daysSinceTraining.sort((a, b) => b.days - a.days);
  const mostNeglected = daysSinceTraining[0];

  if (mostNeglected && mostNeglected.days >= 3) {
    const name = getMuscleGroupById(mostNeglected.id)?.name || 'This area';
    if (mostNeglected.days === 999) {
      return `${name} hasn't been trained yet`;
    }
    return `${name} hasn't been trained in ${mostNeglected.days} days`;
  }

  if (lastWorkoutBodyParts.length > 0) {
    const lastGroupNames = lastWorkoutBodyParts
      .map(id => getMuscleGroupById(id)?.name)
      .filter(Boolean)
      .slice(0, 2)
      .join(' and ');
    return `You trained ${lastGroupNames} recently - try something different`;
  }

  return 'Great choice for a balanced workout';
};

export const shouldSuggestRecovery = (
  muscleGroupId: string,
  lastTrainedDate: string | null
): { suggest: boolean; message: string } => {
  if (!lastTrainedDate) {
    return { suggest: false, message: '' };
  }

  const daysSince = Math.floor(
    (Date.now() - new Date(lastTrainedDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSince === 0) {
    return {
      suggest: true,
      message: 'You already trained this today. Consider Balance & Mobility instead?',
    };
  }

  if (daysSince === 1) {
    return {
      suggest: true,
      message: 'You trained this yesterday. A different body part might be better for recovery.',
    };
  }

  return { suggest: false, message: '' };
};
