import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  storage,
  UserPreferences,
  StreakData,
  ChallengeData,
  WorkoutRecord,
  BodyPartHistory,
} from '@/utils/storage';
import { format, isToday, isYesterday, differenceInDays, parseISO } from 'date-fns';

interface AppContextType {
  preferences: UserPreferences;
  streakData: StreakData;
  challengeData: ChallengeData;
  workoutHistory: WorkoutRecord[];
  bodyPartHistory: BodyPartHistory;
  isOnboardingComplete: boolean;
  isLoading: boolean;
  updatePreferences: (prefs: Partial<UserPreferences>) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  recordWorkout: (workout: Omit<WorkoutRecord, 'id' | 'completedAt'>) => Promise<void>;
  startChallenge: () => Promise<void>;
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
  });
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutRecord[]>([]);
  const [bodyPartHistory, setBodyPartHistory] = useState<BodyPartHistory>({});
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      const [prefs, streak, challenge, history, bodyParts, onboarding] = await Promise.all([
        storage.getUserPreferences(),
        storage.getStreakData(),
        storage.getChallengeData(),
        storage.getWorkoutHistory(),
        storage.getBodyPartHistory(),
        storage.isOnboardingComplete(),
      ]);

      setPreferences(prefs);
      setStreakData(streak);
      setChallengeData(challenge);
      setWorkoutHistory(history);
      setBodyPartHistory(bodyParts);
      setIsOnboardingComplete(onboarding);
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

    if (!currentData.isActive) {
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

  const startChallenge = async () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const newChallengeData: ChallengeData = {
      isActive: true,
      startDate: today,
      currentDay: 0,
      completedDays: [],
      targetDays: 30,
    };

    await storage.updateChallengeData(newChallengeData);
    setChallengeData(newChallengeData);
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
        updatePreferences,
        completeOnboarding,
        recordWorkout,
        startChallenge,
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
