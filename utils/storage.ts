import AsyncStorage from '@react-native-async-storage/async-storage';
import { FormAnalytics, MotionCaptureSettings } from '@/types/motion-capture';

const STORAGE_KEYS = {
  USER_PREFERENCES: 'gymless_user_preferences',
  WORKOUT_HISTORY: 'gymless_workout_history',
  STREAK_DATA: 'gymless_streak_data',
  CHALLENGE_DATA: 'gymless_challenge_data',
  ONBOARDING_COMPLETE: 'gymless_onboarding_complete',
  BODY_PART_HISTORY: 'gymless_body_part_history',
  CHALLENGE_PLAN: 'gymless_challenge_plan',
  CHALLENGE_ACHIEVEMENTS: 'gymless_challenge_achievements',
  CHALLENGE_NOTES: 'gymless_challenge_notes',
  CHALLENGE_HISTORY: 'gymless_challenge_history',
  FORM_ANALYTICS: 'gymless_form_analytics',
  MOTION_CAPTURE_SETTINGS: 'gymless_motion_capture_settings',
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
  challengeType: 'strength' | 'consistency' | 'balanced' | null;
  pausedDays: number;
  maxPauseDays: number;
  isPaused: boolean;
  completedAt: string | null;
  abandonedAt: string | null;
}

export interface DailyChallengePlan {
  day: number;
  date: string;
  workoutType: 'strength' | 'cardio' | 'flexibility' | 'full-body' | 'rest';
  bodyParts: string[];
  exercises: string[];
  duration: number;
  difficulty: 'beginner' | 'intermediate';
  isRestDay: boolean;
}

export interface ChallengePlan {
  id: string;
  createdAt: string;
  challengeType: 'strength' | 'consistency' | 'balanced';
  difficulty: 'beginner' | 'intermediate';
  dailyPlans: DailyChallengePlan[];
}

export interface ChallengeAchievement {
  id: string;
  type: 'milestone' | 'streak' | 'completion' | 'perfect-week';
  name: string;
  description: string;
  unlockedAt: string;
  day: number;
  iconName: string;
}

export interface ChallengeNote {
  date: string;
  note: string;
  mood: 'great' | 'good' | 'okay' | 'tired' | null;
}

export interface ChallengeHistoryEntry {
  id: string;
  startDate: string;
  endDate: string | null;
  status: 'completed' | 'abandoned' | 'active';
  daysCompleted: number;
  totalDays: number;
  challengeType: 'strength' | 'consistency' | 'balanced';
  achievements: ChallengeAchievement[];
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
  challengeType: null,
  pausedDays: 0,
  maxPauseDays: 3,
  isPaused: false,
  completedAt: null,
  abandonedAt: null,
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

  async getChallengePlan(): Promise<ChallengePlan | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CHALLENGE_PLAN);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  async saveChallengePlan(plan: ChallengePlan): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CHALLENGE_PLAN, JSON.stringify(plan));
    } catch (error) {
      console.error('Error saving challenge plan:', error);
    }
  },

  async clearChallengePlan(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.CHALLENGE_PLAN);
    } catch (error) {
      console.error('Error clearing challenge plan:', error);
    }
  },

  async getChallengeAchievements(): Promise<ChallengeAchievement[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CHALLENGE_ACHIEVEMENTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async addChallengeAchievement(achievement: ChallengeAchievement): Promise<void> {
    try {
      const achievements = await this.getChallengeAchievements();
      const exists = achievements.some(a => a.id === achievement.id);
      if (!exists) {
        achievements.push(achievement);
        await AsyncStorage.setItem(
          STORAGE_KEYS.CHALLENGE_ACHIEVEMENTS,
          JSON.stringify(achievements)
        );
      }
    } catch (error) {
      console.error('Error adding achievement:', error);
    }
  },

  async clearChallengeAchievements(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.CHALLENGE_ACHIEVEMENTS);
    } catch (error) {
      console.error('Error clearing achievements:', error);
    }
  },

  async getChallengeNotes(): Promise<ChallengeNote[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CHALLENGE_NOTES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async saveChallengeNote(note: ChallengeNote): Promise<void> {
    try {
      const notes = await this.getChallengeNotes();
      const existingIndex = notes.findIndex(n => n.date === note.date);
      if (existingIndex >= 0) {
        notes[existingIndex] = note;
      } else {
        notes.push(note);
      }
      await AsyncStorage.setItem(STORAGE_KEYS.CHALLENGE_NOTES, JSON.stringify(notes));
    } catch (error) {
      console.error('Error saving note:', error);
    }
  },

  async clearChallengeNotes(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.CHALLENGE_NOTES);
    } catch (error) {
      console.error('Error clearing notes:', error);
    }
  },

  async getChallengeHistory(): Promise<ChallengeHistoryEntry[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CHALLENGE_HISTORY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async addChallengeToHistory(entry: ChallengeHistoryEntry): Promise<void> {
    try {
      const history = await this.getChallengeHistory();
      history.unshift(entry);
      await AsyncStorage.setItem(STORAGE_KEYS.CHALLENGE_HISTORY, JSON.stringify(history));
    } catch (error) {
      console.error('Error adding to challenge history:', error);
    }
  },

  async resetAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
    } catch (error) {
      console.error('Error resetting data:', error);
    }
  },

  async getFormAnalytics(): Promise<FormAnalytics[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.FORM_ANALYTICS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async addFormAnalytics(analytics: FormAnalytics): Promise<void> {
    try {
      const history = await this.getFormAnalytics();
      history.unshift(analytics);

      if (history.length > 100) {
        history.length = 100;
      }

      await AsyncStorage.setItem(STORAGE_KEYS.FORM_ANALYTICS, JSON.stringify(history));
    } catch (error) {
      console.error('Error saving form analytics:', error);
    }
  },

  async getFormProgressForExercise(
    exerciseId: string,
    limit: number = 30
  ): Promise<FormAnalytics[]> {
    const analytics = await this.getFormAnalytics();
    return analytics.filter((a) => a.exerciseId === exerciseId).slice(0, limit);
  },

  async getMotionCaptureSettings(): Promise<MotionCaptureSettings> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.MOTION_CAPTURE_SETTINGS);
      return data
        ? JSON.parse(data)
        : {
            enabled: true,
            showSkeleton: true,
            showAlignmentGuides: true,
            audioCoaching: false,
            hapticFeedback: true,
            cameraPosition: 'side',
          };
    } catch {
      return {
        enabled: true,
        showSkeleton: true,
        showAlignmentGuides: true,
        audioCoaching: false,
        hapticFeedback: true,
        cameraPosition: 'side',
      };
    }
  },

  async saveMotionCaptureSettings(settings: Partial<MotionCaptureSettings>): Promise<void> {
    try {
      const current = await this.getMotionCaptureSettings();
      await AsyncStorage.setItem(
        STORAGE_KEYS.MOTION_CAPTURE_SETTINGS,
        JSON.stringify({ ...current, ...settings })
      );
    } catch (error) {
      console.error('Error saving motion capture settings:', error);
    }
  },
};
