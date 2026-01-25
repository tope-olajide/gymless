import { WorkoutRecord } from './storage';
import { muscleGroups } from '@/data/bodyParts';

export interface AIWorkoutSuggestion {
  muscleGroupIds: string[];
  reason: string;
  duration: 5 | 10 | 15 | 20;
  priority: 'high' | 'medium' | 'low';
}

export const generateAISuggestion = async (
  recentWorkouts: WorkoutRecord[],
  bodyPartHistory: Record<string, { lastTrained: string | null; totalWorkouts: number }>,
  preferences: { goal: string | null; difficulty: string; preferredDuration: number }
): Promise<AIWorkoutSuggestion> => {
  const allMuscleGroupIds = Object.keys(muscleGroups);

  const daysSinceTraining: { id: string; days: number; totalWorkouts: number }[] = [];

  for (const id of allMuscleGroupIds) {
    const history = bodyPartHistory[id];
    if (!history?.lastTrained) {
      daysSinceTraining.push({ id, days: 999, totalWorkouts: 0 });
    } else {
      const days = Math.floor(
        (Date.now() - new Date(history.lastTrained).getTime()) / (1000 * 60 * 60 * 24)
      );
      daysSinceTraining.push({ id, days, totalWorkouts: history.totalWorkouts });
    }
  }

  daysSinceTraining.sort((a, b) => b.days - a.days);

  const lastWorkout = recentWorkouts[0];
  const lastWorkoutBodyParts = lastWorkout?.bodyParts || [];

  let selectedIds: string[] = [];
  let reason = '';
  let priority: 'high' | 'medium' | 'low' = 'medium';

  const neverTrained = daysSinceTraining.filter(d => d.days === 999);
  if (neverTrained.length > 0) {
    selectedIds = neverTrained.slice(0, 2).map(d => d.id);
    const names = selectedIds.map(id => muscleGroups[id]?.name).filter(Boolean);
    reason = `${names.join(' and ')} ${names.length === 1 ? "hasn't" : "haven't"} been trained yet`;
    priority = 'high';
  } else {
    const neglected = daysSinceTraining.filter(d => d.days >= 3 && !lastWorkoutBodyParts.includes(d.id));
    if (neglected.length > 0) {
      selectedIds = neglected.slice(0, 2).map(d => d.id);
      const topNeglected = neglected[0];
      const name = muscleGroups[topNeglected.id]?.name;
      reason = `${name} hasn't been trained in ${topNeglected.days} days`;
      priority = 'high';
    } else {
      const available = daysSinceTraining.filter(d => !lastWorkoutBodyParts.includes(d.id));
      if (available.length >= 2) {
        selectedIds = available.slice(0, 2).map(d => d.id);
        reason = 'Great choice for a balanced workout';
        priority = 'medium';
      } else {
        selectedIds = daysSinceTraining.slice(0, 2).map(d => d.id);
        reason = 'Mix it up with a varied routine';
        priority = 'low';
      }
    }
  }

  if (preferences.goal === 'mobility') {
    const hasBalance = selectedIds.includes('balance') || selectedIds.includes('flexibility');
    if (!hasBalance && selectedIds.length >= 2) {
      const balanceIdx = daysSinceTraining.findIndex(d => d.id === 'balance' || d.id === 'flexibility');
      if (balanceIdx !== -1) {
        selectedIds[1] = daysSinceTraining[balanceIdx].id;
        reason = 'Focused on mobility for your goals';
      }
    }
  }

  if (preferences.goal === 'strength') {
    const strengthMuscles = ['chest', 'legs', 'glutes', 'shoulders'];
    const hasStrength = selectedIds.some(id => strengthMuscles.includes(id));
    if (!hasStrength && selectedIds.length >= 1) {
      const strengthIdx = daysSinceTraining.findIndex(d => strengthMuscles.includes(d.id));
      if (strengthIdx !== -1) {
        selectedIds[0] = daysSinceTraining[strengthIdx].id;
        reason = 'Building strength for your goals';
      }
    }
  }

  return {
    muscleGroupIds: selectedIds,
    reason,
    duration: preferences.preferredDuration as 5 | 10 | 15 | 20,
    priority,
  };
};

export const getMotivationalMessage = (
  streakDays: number,
  todayCompleted: boolean,
  goal: string | null
): string => {
  if (todayCompleted) {
    const messages = [
      "You've already crushed it today!",
      'Great job completing your workout!',
      'Rest up - you earned it today!',
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  if (streakDays >= 7) {
    return "You're on fire! Keep the streak alive!";
  }

  if (streakDays >= 3) {
    return 'Momentum is building - stay consistent!';
  }

  if (streakDays >= 1) {
    return 'Come back today to build your streak!';
  }

  if (goal === 'consistency') {
    return 'Start your consistency journey today!';
  }

  if (goal === 'strength') {
    return 'Ready to get stronger?';
  }

  if (goal === 'mobility') {
    return 'Time to move and feel better!';
  }

  return "Let's get moving!";
};

export const getRecoveryRecommendation = (
  muscleGroupId: string,
  lastTrainedDate: string | null,
  lastWorkoutBodyParts: string[]
): { shouldRecover: boolean; alternativeIds: string[]; message: string } => {
  if (!lastTrainedDate) {
    return { shouldRecover: false, alternativeIds: [], message: '' };
  }

  const daysSince = Math.floor(
    (Date.now() - new Date(lastTrainedDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSince === 0) {
    const alternatives = Object.keys(muscleGroups)
      .filter(id => id !== muscleGroupId && !lastWorkoutBodyParts.includes(id))
      .slice(0, 3);

    return {
      shouldRecover: true,
      alternativeIds: alternatives,
      message: 'You trained this today. Try a different area for better recovery.',
    };
  }

  if (daysSince === 1) {
    const alternatives = Object.keys(muscleGroups)
      .filter(id => id !== muscleGroupId && !lastWorkoutBodyParts.includes(id))
      .slice(0, 3);

    return {
      shouldRecover: true,
      alternativeIds: alternatives,
      message: 'Trained yesterday. Consider an alternative for muscle recovery.',
    };
  }

  return { shouldRecover: false, alternativeIds: [], message: '' };
};
