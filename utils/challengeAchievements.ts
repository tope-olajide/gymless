import { ChallengeAchievement } from './storage';

export const MILESTONE_ACHIEVEMENTS = {
  DAY_7: {
    type: 'milestone' as const,
    name: '1 Week Strong',
    description: 'Completed 7 days of your challenge',
    iconName: 'trophy',
    day: 7,
  },
  DAY_14: {
    type: 'milestone' as const,
    name: 'Halfway Hero',
    description: 'Reached the 14-day milestone',
    iconName: 'star',
    day: 14,
  },
  DAY_21: {
    type: 'milestone' as const,
    name: '3 Week Warrior',
    description: 'Completed 21 days of consistency',
    iconName: 'flame',
    day: 21,
  },
  DAY_30: {
    type: 'completion' as const,
    name: 'Challenge Champion',
    description: 'Completed the entire 30-day challenge',
    iconName: 'award',
    day: 30,
  },
};

export const STREAK_ACHIEVEMENTS = {
  PERFECT_WEEK: {
    type: 'perfect-week' as const,
    name: 'Perfect Week',
    description: 'Completed 7 consecutive days without missing a workout',
    iconName: 'zap',
  },
  TEN_DAY_STREAK: {
    type: 'streak' as const,
    name: 'Unstoppable',
    description: 'Maintained a 10-day workout streak',
    iconName: 'flame',
  },
};

export const createAchievement = (
  type: 'milestone' | 'streak' | 'completion' | 'perfect-week',
  name: string,
  description: string,
  iconName: string,
  day: number
): ChallengeAchievement => {
  return {
    id: `achievement_${type}_${day}_${Date.now()}`,
    type,
    name,
    description,
    unlockedAt: new Date().toISOString(),
    day,
    iconName,
  };
};

export const checkForMilestoneAchievement = (
  completedDays: string[],
  currentDay: number
): ChallengeAchievement | null => {
  const daysCompleted = completedDays.length;

  if (daysCompleted === 7 && currentDay === 7) {
    return createAchievement(
      MILESTONE_ACHIEVEMENTS.DAY_7.type,
      MILESTONE_ACHIEVEMENTS.DAY_7.name,
      MILESTONE_ACHIEVEMENTS.DAY_7.description,
      MILESTONE_ACHIEVEMENTS.DAY_7.iconName,
      MILESTONE_ACHIEVEMENTS.DAY_7.day
    );
  }

  if (daysCompleted === 14 && currentDay === 14) {
    return createAchievement(
      MILESTONE_ACHIEVEMENTS.DAY_14.type,
      MILESTONE_ACHIEVEMENTS.DAY_14.name,
      MILESTONE_ACHIEVEMENTS.DAY_14.description,
      MILESTONE_ACHIEVEMENTS.DAY_14.iconName,
      MILESTONE_ACHIEVEMENTS.DAY_14.day
    );
  }

  if (daysCompleted === 21 && currentDay === 21) {
    return createAchievement(
      MILESTONE_ACHIEVEMENTS.DAY_21.type,
      MILESTONE_ACHIEVEMENTS.DAY_21.name,
      MILESTONE_ACHIEVEMENTS.DAY_21.description,
      MILESTONE_ACHIEVEMENTS.DAY_21.iconName,
      MILESTONE_ACHIEVEMENTS.DAY_21.day
    );
  }

  if (daysCompleted === 30 && currentDay === 30) {
    return createAchievement(
      MILESTONE_ACHIEVEMENTS.DAY_30.type,
      MILESTONE_ACHIEVEMENTS.DAY_30.name,
      MILESTONE_ACHIEVEMENTS.DAY_30.description,
      MILESTONE_ACHIEVEMENTS.DAY_30.iconName,
      MILESTONE_ACHIEVEMENTS.DAY_30.day
    );
  }

  return null;
};

export const checkForStreakAchievement = (
  consecutiveDays: number,
  existingAchievements: ChallengeAchievement[]
): ChallengeAchievement | null => {
  if (consecutiveDays === 7) {
    const hasAchievement = existingAchievements.some(
      a => a.type === 'perfect-week'
    );
    if (!hasAchievement) {
      return createAchievement(
        STREAK_ACHIEVEMENTS.PERFECT_WEEK.type,
        STREAK_ACHIEVEMENTS.PERFECT_WEEK.name,
        STREAK_ACHIEVEMENTS.PERFECT_WEEK.description,
        STREAK_ACHIEVEMENTS.PERFECT_WEEK.iconName,
        consecutiveDays
      );
    }
  }

  if (consecutiveDays === 10) {
    const hasAchievement = existingAchievements.some(
      a => a.type === 'streak' && a.day === 10
    );
    if (!hasAchievement) {
      return createAchievement(
        STREAK_ACHIEVEMENTS.TEN_DAY_STREAK.type,
        STREAK_ACHIEVEMENTS.TEN_DAY_STREAK.name,
        STREAK_ACHIEVEMENTS.TEN_DAY_STREAK.description,
        STREAK_ACHIEVEMENTS.TEN_DAY_STREAK.iconName,
        consecutiveDays
      );
    }
  }

  return null;
};

export const calculateConsecutiveDays = (completedDays: string[]): number => {
  if (completedDays.length === 0) return 0;

  const sortedDays = [...completedDays].sort();
  let consecutive = 1;
  let maxConsecutive = 1;

  for (let i = 1; i < sortedDays.length; i++) {
    const prevDate = new Date(sortedDays[i - 1]);
    const currDate = new Date(sortedDays[i]);
    const diffDays = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      consecutive++;
      maxConsecutive = Math.max(maxConsecutive, consecutive);
    } else {
      consecutive = 1;
    }
  }

  return maxConsecutive;
};

export const getNextMilestone = (currentDay: number): { day: number; name: string; daysRemaining: number } | null => {
  const milestones = [
    { day: 7, name: '1 Week Strong' },
    { day: 14, name: 'Halfway Hero' },
    { day: 21, name: '3 Week Warrior' },
    { day: 30, name: 'Challenge Champion' },
  ];

  const nextMilestone = milestones.find(m => m.day > currentDay);

  if (nextMilestone) {
    return {
      ...nextMilestone,
      daysRemaining: nextMilestone.day - currentDay,
    };
  }

  return null;
};
