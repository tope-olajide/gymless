import { format, addDays, parseISO } from 'date-fns';
import { muscleGroups } from '@/data/bodyParts';
import { ChallengePlan, DailyChallengePlan } from './storage';

type ChallengeType = 'strength' | 'consistency' | 'balanced';
type Difficulty = 'beginner' | 'intermediate';

const WORKOUT_TYPES = ['strength', 'cardio', 'flexibility', 'full-body'] as const;

const STRENGTH_MUSCLE_GROUPS = ['legs', 'thighs', 'hamstrings', 'glutes', 'chest', 'triceps', 'shoulders', 'upperBack', 'abs', 'obliques', 'lowerBack'];
const CARDIO_EXERCISES = ['mountainClimbers', 'jumpingJacks', 'highKnees', 'burpees'];
const FLEXIBILITY_GROUPS = ['flexibility', 'balance'];

const getExercisesForMuscleGroup = (muscleGroupId: string): string[] => {
  const group = muscleGroups[muscleGroupId];
  return group ? group.exercises : [];
};

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const selectRandomItems = <T,>(array: T[], count: number): T[] => {
  return shuffleArray(array).slice(0, count);
};

const getDurationForDifficulty = (
  difficulty: Difficulty,
  baselineDuration: number,
  weekNumber: number
): number => {
  const difficultyMultiplier = difficulty === 'beginner' ? 1 : 1.3;
  const progressionMultiplier = 1 + (weekNumber * 0.1);
  return Math.round(baselineDuration * difficultyMultiplier * progressionMultiplier);
};

const generateStrengthFocusedPlan = (
  startDate: string,
  difficulty: Difficulty
): DailyChallengePlan[] => {
  const plans: DailyChallengePlan[] = [];
  const muscleGroupRotation = shuffleArray(STRENGTH_MUSCLE_GROUPS);

  for (let day = 1; day <= 30; day++) {
    const date = format(addDays(parseISO(startDate), day - 1), 'yyyy-MM-dd');
    const weekNumber = Math.floor((day - 1) / 7);

    const isRestDay = day % 7 === 0;

    if (isRestDay) {
      plans.push({
        day,
        date,
        workoutType: 'rest',
        bodyParts: ['flexibility'],
        exercises: selectRandomItems(getExercisesForMuscleGroup('flexibility'), 3),
        duration: 5,
        difficulty,
        isRestDay: true,
      });
    } else {
      const muscleGroupIndex = (day - 1) % muscleGroupRotation.length;
      const primaryMuscleGroup = muscleGroupRotation[muscleGroupIndex];
      const secondaryMuscleGroup = muscleGroupRotation[(muscleGroupIndex + 1) % muscleGroupRotation.length];

      const primaryExercises = selectRandomItems(getExercisesForMuscleGroup(primaryMuscleGroup), 3);
      const secondaryExercises = selectRandomItems(getExercisesForMuscleGroup(secondaryMuscleGroup), 2);

      plans.push({
        day,
        date,
        workoutType: 'strength',
        bodyParts: [primaryMuscleGroup, secondaryMuscleGroup],
        exercises: [...primaryExercises, ...secondaryExercises],
        duration: getDurationForDifficulty(difficulty, 15, weekNumber),
        difficulty,
        isRestDay: false,
      });
    }
  }

  return plans;
};

const generateConsistencyPlan = (
  startDate: string,
  difficulty: Difficulty
): DailyChallengePlan[] => {
  const plans: DailyChallengePlan[] = [];

  for (let day = 1; day <= 30; day++) {
    const date = format(addDays(parseISO(startDate), day - 1), 'yyyy-MM-dd');
    const weekNumber = Math.floor((day - 1) / 7);

    const isRestDay = day % 7 === 0;

    if (isRestDay) {
      plans.push({
        day,
        date,
        workoutType: 'rest',
        bodyParts: ['flexibility'],
        exercises: selectRandomItems(getExercisesForMuscleGroup('flexibility'), 2),
        duration: 5,
        difficulty,
        isRestDay: true,
      });
    } else {
      const muscleGroup = selectRandomItems(STRENGTH_MUSCLE_GROUPS, 1)[0];
      const exercises = selectRandomItems(getExercisesForMuscleGroup(muscleGroup), 3);

      plans.push({
        day,
        date,
        workoutType: 'full-body',
        bodyParts: [muscleGroup],
        exercises,
        duration: getDurationForDifficulty(difficulty, 10, weekNumber),
        difficulty,
        isRestDay: false,
      });
    }
  }

  return plans;
};

const generateBalancedPlan = (
  startDate: string,
  difficulty: Difficulty
): DailyChallengePlan[] => {
  const plans: DailyChallengePlan[] = [];
  const workoutTypePattern = ['strength', 'full-body', 'flexibility', 'strength', 'cardio', 'full-body'];

  for (let day = 1; day <= 30; day++) {
    const date = format(addDays(parseISO(startDate), day - 1), 'yyyy-MM-dd');
    const weekNumber = Math.floor((day - 1) / 7);

    const isRestDay = day % 7 === 0;

    if (isRestDay) {
      plans.push({
        day,
        date,
        workoutType: 'rest',
        bodyParts: ['flexibility', 'balance'],
        exercises: [
          ...selectRandomItems(getExercisesForMuscleGroup('flexibility'), 2),
          ...selectRandomItems(getExercisesForMuscleGroup('balance'), 1),
        ],
        duration: 5,
        difficulty,
        isRestDay: true,
      });
    } else {
      const workoutType = workoutTypePattern[(day - 1) % workoutTypePattern.length] as typeof WORKOUT_TYPES[number];

      let bodyParts: string[];
      let exercises: string[];
      let duration: number;

      if (workoutType === 'strength') {
        const selectedGroups = selectRandomItems(STRENGTH_MUSCLE_GROUPS, 2);
        bodyParts = selectedGroups;
        exercises = [
          ...selectRandomItems(getExercisesForMuscleGroup(selectedGroups[0]), 3),
          ...selectRandomItems(getExercisesForMuscleGroup(selectedGroups[1]), 2),
        ];
        duration = getDurationForDifficulty(difficulty, 15, weekNumber);
      } else if (workoutType === 'cardio') {
        bodyParts = ['legs', 'abs'];
        exercises = [...selectRandomItems(CARDIO_EXERCISES, 2), ...selectRandomItems(getExercisesForMuscleGroup('abs'), 2)];
        duration = getDurationForDifficulty(difficulty, 12, weekNumber);
      } else if (workoutType === 'flexibility') {
        bodyParts = ['flexibility', 'balance'];
        exercises = [
          ...selectRandomItems(getExercisesForMuscleGroup('flexibility'), 3),
          ...selectRandomItems(getExercisesForMuscleGroup('balance'), 1),
        ];
        duration = getDurationForDifficulty(difficulty, 10, weekNumber);
      } else {
        const selectedGroups = selectRandomItems(STRENGTH_MUSCLE_GROUPS, 3);
        bodyParts = selectedGroups;
        exercises = selectedGroups.flatMap(g => selectRandomItems(getExercisesForMuscleGroup(g), 2));
        duration = getDurationForDifficulty(difficulty, 15, weekNumber);
      }

      plans.push({
        day,
        date,
        workoutType: workoutType as 'strength' | 'cardio' | 'flexibility' | 'full-body',
        bodyParts,
        exercises: exercises.filter((ex, index, self) => self.indexOf(ex) === index),
        duration,
        difficulty,
        isRestDay: false,
      });
    }
  }

  return plans;
};

export const generateChallengePlan = (
  challengeType: ChallengeType,
  difficulty: Difficulty,
  startDate: string
): ChallengePlan => {
  let dailyPlans: DailyChallengePlan[];

  switch (challengeType) {
    case 'strength':
      dailyPlans = generateStrengthFocusedPlan(startDate, difficulty);
      break;
    case 'consistency':
      dailyPlans = generateConsistencyPlan(startDate, difficulty);
      break;
    case 'balanced':
      dailyPlans = generateBalancedPlan(startDate, difficulty);
      break;
  }

  return {
    id: `challenge_${Date.now()}`,
    createdAt: new Date().toISOString(),
    challengeType,
    difficulty,
    dailyPlans,
  };
};

export const getTodaysPlan = (plan: ChallengePlan): DailyChallengePlan | null => {
  const today = format(new Date(), 'yyyy-MM-dd');
  return plan.dailyPlans.find(p => p.date === today) || null;
};

export const getNextWorkoutPlan = (plan: ChallengePlan, currentDate: string): DailyChallengePlan | null => {
  const currentIndex = plan.dailyPlans.findIndex(p => p.date === currentDate);
  if (currentIndex >= 0 && currentIndex < plan.dailyPlans.length - 1) {
    return plan.dailyPlans[currentIndex + 1];
  }
  return null;
};

export const calculateChallengeProgress = (completedDays: string[], totalDays: number): number => {
  return Math.round((completedDays.length / totalDays) * 100);
};
