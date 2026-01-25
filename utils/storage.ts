import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  USER_PREFERENCES: 'gymless_user_preferences',
  WORKOUT_HISTORY: 'gymless_workout_history',
  STREAK_DATA: 'gymless_streak_data',
  CHALLENGE_DATA: 'gymless_challenge_data',
  ONBOARDING_COMPLETE: 'gymless_onboarding_complete',
  BODY_PART_HISTORY: 'gymless_body_part_history',
};

export interface UserPreferences {
  difficulty: 'beginner' | 'intermediate';
  preferredDuration: 5 | 10 | 15 | 20;
  goal: 'consistency' | 'strength' | 'mobility' | null;
  darkMode: boolean;
  reminderEnabled: boolean;
  reminderTime: string | null;
}

export interface WorkoutRecord {
  id: string;
  date: string;
  bodyParts: string[];
  exercises: string[];
  duration: number;
  completedAt: string;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastWorkoutDate: string | null;
  streakStartDate: string | null;
}

export interface ChallengeData {
  isActive: boolean;
  startDate: string | null;
  currentDay: number;
  completedDays: string[];
  targetDays: number;
}

export interface BodyPartHistory {
  [bodyPartId: string]: {
    lastTrained: string | null;
    totalWorkouts: number;
  };
}

const defaultPreferences: UserPreferences = {
  difficulty: 'beginner',
  preferredDuration: 10,
  goal: null,
  darkMode: false,
  reminderEnabled: false,
  reminderTime: null,
};

const defaultStreakData: StreakData = {
  currentStreak: 0,
  longestStreak: 0,
  lastWorkoutDate: null,
  streakStartDate: null,
};

const defaultChallengeData: ChallengeData = {
  isActive: false,
  startDate: null,
  currentDay: 0,
  completedDays: [],
  targetDays: 30,
};

export const storage = {
  async getUserPreferences(): Promise<UserPreferences> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
      return data ? { ...defaultPreferences, ...JSON.parse(data) } : defaultPreferences;
    } catch {
      return defaultPreferences;
    }
  },

  async saveUserPreferences(preferences: Partial<UserPreferences>): Promise<void> {
    try {
      const current = await this.getUserPreferences();
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_PREFERENCES,
        JSON.stringify({ ...current, ...preferences })
      );
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  },

  async getWorkoutHistory(): Promise<WorkoutRecord[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.WORKOUT_HISTORY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async addWorkoutRecord(record: WorkoutRecord): Promise<void> {
    try {
      const history = await this.getWorkoutHistory();
      history.unshift(record);
      await AsyncStorage.setItem(STORAGE_KEYS.WORKOUT_HISTORY, JSON.stringify(history));
    } catch (error) {
      console.error('Error saving workout:', error);
    }
  },

  async getStreakData(): Promise<StreakData> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.STREAK_DATA);
      return data ? { ...defaultStreakData, ...JSON.parse(data) } : defaultStreakData;
    } catch {
      return defaultStreakData;
    }
  },

  async updateStreakData(data: Partial<StreakData>): Promise<void> {
    try {
      const current = await this.getStreakData();
      await AsyncStorage.setItem(
        STORAGE_KEYS.STREAK_DATA,
        JSON.stringify({ ...current, ...data })
      );
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  },

  async getChallengeData(): Promise<ChallengeData> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CHALLENGE_DATA);
      return data ? { ...defaultChallengeData, ...JSON.parse(data) } : defaultChallengeData;
    } catch {
      return defaultChallengeData;
    }
  },

  async updateChallengeData(data: Partial<ChallengeData>): Promise<void> {
    try {
      const current = await this.getChallengeData();
      await AsyncStorage.setItem(
        STORAGE_KEYS.CHALLENGE_DATA,
        JSON.stringify({ ...current, ...data })
      );
    } catch (error) {
      console.error('Error updating challenge:', error);
    }
  },

  async isOnboardingComplete(): Promise<boolean> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE);
      return data === 'true';
    } catch {
      return false;
    }
  },

  async setOnboardingComplete(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, 'true');
    } catch (error) {
      console.error('Error setting onboarding:', error);
    }
  },

  async getBodyPartHistory(): Promise<BodyPartHistory> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.BODY_PART_HISTORY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },

  async updateBodyPartHistory(bodyPartId: string, date: string): Promise<void> {
    try {
      const history = await this.getBodyPartHistory();
      const current = history[bodyPartId] || { lastTrained: null, totalWorkouts: 0 };
      history[bodyPartId] = {
        lastTrained: date,
        totalWorkouts: current.totalWorkouts + 1,
      };
      await AsyncStorage.setItem(STORAGE_KEYS.BODY_PART_HISTORY, JSON.stringify(history));
    } catch (error) {
      console.error('Error updating body part history:', error);
    }
  },

  async resetAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
    } catch (error) {
      console.error('Error resetting data:', error);
    }
  },
};
