import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  storage,
  UserPreferences,
  StreakData,
  ChallengeData,
  WorkoutRecord,
  BodyPartHistory,
  ChallengePlan,
  ChallengeAchievement,
} from '@/utils/storage';
import { format, isToday, isYesterday, differenceInDays, parseISO } from 'date-fns';
import { generateChallengePlan, getTodaysPlan } from '@/utils/challengeGenerator';
import {
  checkForMilestoneAchievement,
  checkForStreakAchievement,
  calculateConsecutiveDays,
} from '@/utils/challengeAchievements';

interface AppContextType {
  preferences: UserPreferences;
  streakData: StreakData;
  challengeData: ChallengeData;
  workoutHistory: WorkoutRecord[];
  bodyPartHistory: BodyPartHistory;
  isOnboardingComplete: boolean;
  isLoading: boolean;
  challengePlan: ChallengePlan | null;
  challengeAchievements: ChallengeAchievement[];
  updatePreferences: (prefs: Partial<UserPreferences>) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  recordWorkout: (workout: Omit<WorkoutRecord, 'id' | 'completedAt'>) => Promise<void>;
  startChallenge: (challengeType: 'strength' | 'consistency' | 'balanced', startDate?: string) => Promise<void>;
  pauseChallenge: () => Promise<void>;
  resumeChallenge: () => Promise<void>;
  abandonChallenge: () => Promise<void>;
  completeChallenge: () => Promise<void>;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [preferences, setPreferences] = useState<UserPreferences>({
    difficulty: 'beginner',
    preferredDuration: 10,
    goal: null,
    darkMode: false,
    reminderEnabled: false,
    reminderTime: null,
  });
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastWorkoutDate: null,
    streakStartDate: null,
  });
  const [challengeData, setChallengeData] = useState<ChallengeData>({
    isActive: false,
    startDate: null,
    currentDay: 0,
    completedDays: [],
    targetDays: 30,
    challengeType: null,
    pausedDays: 0,
    maxPauseDays: 3,
    isPaused: false,
    completedAt: null,
    abandonedAt: null,
  });
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutRecord[]>([]);
  const [bodyPartHistory, setBodyPartHistory] = useState<BodyPartHistory>({});
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [challengePlan, setChallengePlan] = useState<ChallengePlan | null>(null);
  const [challengeAchievements, setChallengeAchievements] = useState<ChallengeAchievement[]>([]);

  const loadData = async () => {
    try {
      const [prefs, streak, challenge, history, bodyParts, onboarding, plan, achievements] = await Promise.all([
        storage.getUserPreferences(),
        storage.getStreakData(),
        storage.getChallengeData(),
        storage.getWorkoutHistory(),
        storage.getBodyPartHistory(),
        storage.isOnboardingComplete(),
        storage.getChallengePlan(),
        storage.getChallengeAchievements(),
      ]);

      setPreferences(prefs);
      setStreakData(streak);
      setChallengeData(challenge);
      setWorkoutHistory(history);
      setBodyPartHistory(bodyParts);
      setIsOnboardingComplete(onboarding);
      setChallengePlan(plan);
      setChallengeAchievements(achievements);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const updatePreferences = async (prefs: Partial<UserPreferences>) => {
    await storage.saveUserPreferences(prefs);
    setPreferences(prev => ({ ...prev, ...prefs }));
  };

  const completeOnboarding = async () => {
    await storage.setOnboardingComplete();
    setIsOnboardingComplete(true);
  };

  const updateStreak = async (workoutDate: string) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const currentData = await storage.getStreakData();

    let newStreak = currentData.currentStreak;
    let newStreakStart = currentData.streakStartDate;

    if (currentData.lastWorkoutDate) {
      const lastDate = parseISO(currentData.lastWorkoutDate);

      if (isToday(lastDate)) {
        return;
      }

      if (isYesterday(lastDate)) {
        newStreak += 1;
      } else {
        newStreak = 1;
        newStreakStart = today;
      }
    } else {
      newStreak = 1;
      newStreakStart = today;
    }

    const newLongestStreak = Math.max(newStreak, currentData.longestStreak);

    const newStreakData: StreakData = {
      currentStreak: newStreak,
      longestStreak: newLongestStreak,
      lastWorkoutDate: today,
      streakStartDate: newStreakStart,
    };

    await storage.updateStreakData(newStreakData);
    setStreakData(newStreakData);
  };

  const updateChallenge = async (workoutDate: string) => {
    const currentData = await storage.getChallengeData();

    if (!currentData.isActive || currentData.isPaused) {
      return;
    }

    const today = format(new Date(), 'yyyy-MM-dd');

    if (currentData.completedDays.includes(today)) {
      return;
    }

    const newCompletedDays = [...currentData.completedDays, today];
    const newCurrentDay = newCompletedDays.length;

    const newChallengeData: ChallengeData = {
      ...currentData,
      completedDays: newCompletedDays,
      currentDay: newCurrentDay,
    };

    await storage.updateChallengeData(newChallengeData);
    setChallengeData(newChallengeData);

    const milestoneAchievement = checkForMilestoneAchievement(newCompletedDays, newCurrentDay);
    if (milestoneAchievement) {
      await storage.addChallengeAchievement(milestoneAchievement);
      setChallengeAchievements(prev => [...prev, milestoneAchievement]);
    }

    const consecutiveDays = calculateConsecutiveDays(newCompletedDays);
    const existingAchievements = await storage.getChallengeAchievements();
    const streakAchievement = checkForStreakAchievement(consecutiveDays, existingAchievements);
    if (streakAchievement) {
      await storage.addChallengeAchievement(streakAchievement);
      setChallengeAchievements(prev => [...prev, streakAchievement]);
    }

    if (newCurrentDay === 30) {
      await completeChallenge();
    }
  };

  const recordWorkout = async (workout: Omit<WorkoutRecord, 'id' | 'completedAt'>) => {
    const now = new Date();
    const record: WorkoutRecord = {
      ...workout,
      id: `workout_${Date.now()}`,
      completedAt: now.toISOString(),
    };

    await storage.addWorkoutRecord(record);
    setWorkoutHistory(prev => [record, ...prev]);

    for (const bodyPartId of workout.bodyParts) {
      await storage.updateBodyPartHistory(bodyPartId, format(now, 'yyyy-MM-dd'));
    }

    const updatedBodyParts = await storage.getBodyPartHistory();
    setBodyPartHistory(updatedBodyParts);

    await updateStreak(format(now, 'yyyy-MM-dd'));
    await updateChallenge(format(now, 'yyyy-MM-dd'));
  };

  const startChallenge = async (
    challengeType: 'strength' | 'consistency' | 'balanced',
    startDate?: string
  ) => {
    const start = startDate || format(new Date(), 'yyyy-MM-dd');

    const plan = generateChallengePlan(challengeType, preferences.difficulty, start);
    await storage.saveChallengePlan(plan);
    setChallengePlan(plan);

    const newChallengeData: ChallengeData = {
      isActive: true,
      startDate: start,
      currentDay: 0,
      completedDays: [],
      targetDays: 30,
      challengeType,
      pausedDays: 0,
      maxPauseDays: 3,
      isPaused: false,
      completedAt: null,
      abandonedAt: null,
    };

    await storage.updateChallengeData(newChallengeData);
    setChallengeData(newChallengeData);

    await storage.clearChallengeAchievements();
    setChallengeAchievements([]);
  };

  const pauseChallenge = async () => {
    const currentData = await storage.getChallengeData();

    if (currentData.pausedDays >= currentData.maxPauseDays) {
      return;
    }

    const newChallengeData: ChallengeData = {
      ...currentData,
      isPaused: true,
      pausedDays: currentData.pausedDays + 1,
    };

    await storage.updateChallengeData(newChallengeData);
    setChallengeData(newChallengeData);
  };

  const resumeChallenge = async () => {
    const currentData = await storage.getChallengeData();

    const newChallengeData: ChallengeData = {
      ...currentData,
      isPaused: false,
    };

    await storage.updateChallengeData(newChallengeData);
    setChallengeData(newChallengeData);
  };

  const abandonChallenge = async () => {
    const currentData = await storage.getChallengeData();
    const achievements = await storage.getChallengeAchievements();

    await storage.addChallengeToHistory({
      id: `challenge_${Date.now()}`,
      startDate: currentData.startDate || format(new Date(), 'yyyy-MM-dd'),
      endDate: format(new Date(), 'yyyy-MM-dd'),
      status: 'abandoned',
      daysCompleted: currentData.completedDays.length,
      totalDays: currentData.targetDays,
      challengeType: currentData.challengeType || 'balanced',
      achievements,
    });

    await storage.updateChallengeData({
      isActive: false,
      isPaused: false,
      abandonedAt: new Date().toISOString(),
    });

    await storage.clearChallengePlan();
    await storage.clearChallengeAchievements();

    setChallengeData(prev => ({
      ...prev,
      isActive: false,
      isPaused: false,
      abandonedAt: new Date().toISOString(),
    }));
    setChallengePlan(null);
    setChallengeAchievements([]);
  };

  const completeChallenge = async () => {
    const currentData = await storage.getChallengeData();
    const achievements = await storage.getChallengeAchievements();

    await storage.addChallengeToHistory({
      id: `challenge_${Date.now()}`,
      startDate: currentData.startDate || format(new Date(), 'yyyy-MM-dd'),
      endDate: format(new Date(), 'yyyy-MM-dd'),
      status: 'completed',
      daysCompleted: currentData.completedDays.length,
      totalDays: currentData.targetDays,
      challengeType: currentData.challengeType || 'balanced',
      achievements,
    });

    await storage.updateChallengeData({
      isActive: false,
      isPaused: false,
      completedAt: new Date().toISOString(),
    });

    setChallengeData(prev => ({
      ...prev,
      isActive: false,
      isPaused: false,
      completedAt: new Date().toISOString(),
    }));
  };

  const refreshData = async () => {
    setIsLoading(true);
    await loadData();
  };

  return (
    <AppContext.Provider
      value={{
        preferences,
        streakData,
        challengeData,
        workoutHistory,
        bodyPartHistory,
        isOnboardingComplete,
        isLoading,
        challengePlan,
        challengeAchievements,
        updatePreferences,
        completeOnboarding,
        recordWorkout,
        startChallenge,
        pauseChallenge,
        resumeChallenge,
        abandonChallenge,
        completeChallenge,
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
