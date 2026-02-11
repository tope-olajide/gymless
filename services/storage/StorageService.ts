/**
 * Storage Service for Gymless
 * 
 * Handles all AsyncStorage operations for:
 * - User preferences (onboarding, goals)
 * - Workout history
 * - Progress tracking
 * - Achievements
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage Keys
const KEYS = {
    ONBOARDING_COMPLETED: '@gymless/onboarding_completed',
    USER_PREFERENCES: '@gymless/user_preferences',
    WORKOUT_HISTORY: '@gymless/workout_history',
    ACHIEVEMENTS: '@gymless/achievements',
    STREAK_DATA: '@gymless/streak_data',
    LAST_WORKOUT_DATE: '@gymless/last_workout_date',
    AI_MODEL_PREFERENCE: '@gymless/ai_model_preference',
    CHALLENGE_PROGRESS: '@gymless/challenge_progress',
    THEME_PREFERENCE: '@gymless/theme_preference',
    CUSTOM_GEMINI_KEY: '@gymless/custom_gemini_key',
    AI_INTERVAL: '@gymless/ai_interval',
};

// Types
export interface UserPreferences {
    primaryGoals: string[]; // 'belly-fat', 'glutes', 'upper-body', 'core', 'all-rounder'
    experienceLevel: 'beginner' | 'intermediate' | 'advanced';
    weeklyAvailability: '1-3' | '4-5' | '6-7';
    limitations: string[]; // 'knee', 'lower-back', 'shoulder', 'none'
    onboardingCompletedAt: string;
}

export interface WorkoutSession {
    id: string;
    date: string;
    exerciseId: string;
    exerciseName: string;
    bodyParts: string[];
    mode: 'timer' | 'ai-coach';
    repsCompleted: number;
    setsCompleted: number;
    formScore?: number; // 0-100
    durationSeconds: number;
    caloriesBurned?: number;
    geminiFeedback?: string;
}

export interface StreakData {
    currentStreak: number;
    longestStreak: number;
    lastWorkoutDate: string | null;
    totalWorkouts: number;
    consistencyScore: number; // 0-100 based on last 30 days
}

export interface Achievement {
    id: string;
    unlockedAt: string;
    progress?: number; // For progressive achievements
}

export interface GoalProgress {
    goalId: string;
    targetCount: number;
    currentCount: number;
    startDate: string;
    endDate?: string;
}

export interface ChallengeProgress {
    challengeId: string;         // e.g., 'build-30-feb-2026'
    startDate: string;
    currentDay: number;          // 1-30
    completedDays: number[];     // Array of completed day numbers
    unlockedMilestones: number[]; // Days with unlocked milestones (7, 14, 21, 30)
    isActive: boolean;
    completedAt?: string;        // When challenge was finished
}

export type ThemePreference = 'dark' | 'light' | 'system';

// Storage Service Class
class StorageService {
    // ==========================================
    // ONBOARDING
    // ==========================================

    async isOnboardingCompleted(): Promise<boolean> {
        try {
            const value = await AsyncStorage.getItem(KEYS.ONBOARDING_COMPLETED);
            return value === 'true';
        } catch {
            return false;
        }
    }

    async setOnboardingCompleted(): Promise<void> {
        await AsyncStorage.setItem(KEYS.ONBOARDING_COMPLETED, 'true');
    }

    // ==========================================
    // USER PREFERENCES
    // ==========================================

    async getUserPreferences(): Promise<UserPreferences | null> {
        try {
            const json = await AsyncStorage.getItem(KEYS.USER_PREFERENCES);
            return json ? JSON.parse(json) : null;
        } catch {
            return null;
        }
    }

    async saveUserPreferences(preferences: UserPreferences): Promise<void> {
        await AsyncStorage.setItem(KEYS.USER_PREFERENCES, JSON.stringify(preferences));
    }

    async getPrimaryGoals(): Promise<string[] | null> {
        const prefs = await this.getUserPreferences();
        return prefs?.primaryGoals ?? null;
    }

    async getExperienceLevel(): Promise<string | null> {
        const prefs = await this.getUserPreferences();
        return prefs?.experienceLevel ?? null;
    }

    // ==========================================
    // WORKOUT HISTORY
    // ==========================================

    async getWorkoutHistory(): Promise<WorkoutSession[]> {
        try {
            const json = await AsyncStorage.getItem(KEYS.WORKOUT_HISTORY);
            return json ? JSON.parse(json) : [];
        } catch {
            return [];
        }
    }

    async saveWorkoutSession(session: WorkoutSession): Promise<void> {
        const history = await this.getWorkoutHistory();
        history.unshift(session); // Add to beginning (most recent first)

        // Keep only last 500 workouts
        const trimmed = history.slice(0, 500);

        await AsyncStorage.setItem(KEYS.WORKOUT_HISTORY, JSON.stringify(trimmed));
        await this.updateStreakData(session.date);
    }

    async getWorkoutsByDate(date: string): Promise<WorkoutSession[]> {
        const history = await this.getWorkoutHistory();
        return history.filter((w) => w.date.startsWith(date));
    }

    async getWorkoutsByBodyPart(bodyPartId: string): Promise<WorkoutSession[]> {
        const history = await this.getWorkoutHistory();
        return history.filter((w) => w.bodyParts.includes(bodyPartId));
    }

    async getRecentWorkouts(count: number = 10): Promise<WorkoutSession[]> {
        const history = await this.getWorkoutHistory();
        return history.slice(0, count);
    }

    // Get workouts for last N days (for calendar view)
    async getWorkoutsForMonth(year: number, month: number): Promise<WorkoutSession[]> {
        const history = await this.getWorkoutHistory();
        const monthStr = `${year}-${String(month).padStart(2, '0')}`;
        return history.filter((w) => w.date.startsWith(monthStr));
    }

    // ==========================================
    // STREAK & CONSISTENCY
    // ==========================================

    async getStreakData(): Promise<StreakData> {
        try {
            const json = await AsyncStorage.getItem(KEYS.STREAK_DATA);
            if (json) {
                return JSON.parse(json);
            }
        } catch {
            // Fall through to default
        }

        return {
            currentStreak: 0,
            longestStreak: 0,
            lastWorkoutDate: null,
            totalWorkouts: 0,
            consistencyScore: 0,
        };
    }

    async updateStreakData(workoutDate: string): Promise<StreakData> {
        const current = await this.getStreakData();
        const today = new Date().toISOString().split('T')[0];
        const workoutDay = workoutDate.split('T')[0];

        let newStreak = current.currentStreak;

        if (current.lastWorkoutDate) {
            const lastDate = new Date(current.lastWorkoutDate);
            const thisDate = new Date(workoutDay);
            const daysDiff = Math.floor((thisDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

            if (daysDiff === 0) {
                // Same day, no streak change
            } else if (daysDiff === 1) {
                // Consecutive day, increment streak
                newStreak += 1;
            } else {
                // Streak broken, reset to 1
                newStreak = 1;
            }
        } else {
            // First workout ever
            newStreak = 1;
        }

        const newData: StreakData = {
            currentStreak: newStreak,
            longestStreak: Math.max(current.longestStreak, newStreak),
            lastWorkoutDate: workoutDay,
            totalWorkouts: current.totalWorkouts + 1,
            consistencyScore: await this.calculateConsistencyScore(),
        };

        await AsyncStorage.setItem(KEYS.STREAK_DATA, JSON.stringify(newData));
        return newData;
    }

    private async calculateConsistencyScore(): Promise<number> {
        const history = await this.getWorkoutHistory();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentWorkouts = history.filter((w) => new Date(w.date) >= thirtyDaysAgo);

        // Get unique workout days
        const uniqueDays = new Set(recentWorkouts.map((w) => w.date.split('T')[0]));

        // Score out of 100: (unique workout days / 30) * 100
        return Math.round((uniqueDays.size / 30) * 100);
    }

    // ==========================================
    // ACHIEVEMENTS
    // ==========================================

    async getAchievements(): Promise<Achievement[]> {
        try {
            const json = await AsyncStorage.getItem(KEYS.ACHIEVEMENTS);
            return json ? JSON.parse(json) : [];
        } catch {
            return [];
        }
    }

    async unlockAchievement(achievementId: string): Promise<void> {
        const achievements = await this.getAchievements();

        if (!achievements.find((a) => a.id === achievementId)) {
            achievements.push({
                id: achievementId,
                unlockedAt: new Date().toISOString(),
            });
            await AsyncStorage.setItem(KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
        }
    }

    async hasAchievement(achievementId: string): Promise<boolean> {
        const achievements = await this.getAchievements();
        return achievements.some((a) => a.id === achievementId);
    }

    // ==========================================
    // STATS & ANALYSIS
    // ==========================================

    async getTotalRepsForExercise(exerciseId: string): Promise<number> {
        const history = await this.getWorkoutHistory();
        return history
            .filter((w) => w.exerciseId === exerciseId)
            .reduce((sum, w) => sum + w.repsCompleted, 0);
    }

    async getTotalRepsForBodyPart(bodyPartId: string): Promise<number> {
        const history = await this.getWorkoutHistory();
        return history
            .filter((w) => w.bodyParts.includes(bodyPartId))
            .reduce((sum, w) => sum + w.repsCompleted, 0);
    }

    async getAverageFormScore(): Promise<number | null> {
        const history = await this.getWorkoutHistory();
        const withScores = history.filter((w) => w.formScore !== undefined);

        if (withScores.length === 0) return null;

        const sum = withScores.reduce((acc, w) => acc + (w.formScore ?? 0), 0);
        return Math.round(sum / withScores.length);
    }

    async getBodyPartStats(): Promise<Record<string, { count: number; totalReps: number }>> {
        const history = await this.getWorkoutHistory();
        const stats: Record<string, { count: number; totalReps: number }> = {};

        history.forEach((w) => {
            w.bodyParts.forEach((bp) => {
                if (!stats[bp]) {
                    stats[bp] = { count: 0, totalReps: 0 };
                }
                stats[bp].count += 1;
                stats[bp].totalReps += w.repsCompleted;
            });
        });

        return stats;
    }

    // ==========================================
    // AI MODEL PREFERENCE
    // ==========================================

    async getAIModelPreference(): Promise<string> {
        try {
            const value = await AsyncStorage.getItem(KEYS.AI_MODEL_PREFERENCE);
            return value || 'gemini-3-flash-preview'; // Default to beta model
        } catch {
            return 'gemini-3-flash-preview';
        }
    }

    async setAIModelPreference(model: string): Promise<void> {
        await AsyncStorage.setItem(KEYS.AI_MODEL_PREFERENCE, model);
    }

    // ==========================================
    // ADVANCED AI SETTINGS
    // ==========================================

    async getCustomGeminiKey(): Promise<string | null> {
        try {
            return await AsyncStorage.getItem(KEYS.CUSTOM_GEMINI_KEY);
        } catch {
            return null;
        }
    }

    async setCustomGeminiKey(key: string | null): Promise<void> {
        if (key) {
            await AsyncStorage.setItem(KEYS.CUSTOM_GEMINI_KEY, key);
        } else {
            await AsyncStorage.removeItem(KEYS.CUSTOM_GEMINI_KEY);
        }
    }

    async getAIInterval(): Promise<number> {
        try {
            const value = await AsyncStorage.getItem(KEYS.AI_INTERVAL);
            return value ? parseFloat(value) : 1.5; // Default 1.5s
        } catch {
            return 1.5;
        }
    }

    async setAIInterval(seconds: number): Promise<void> {
        await AsyncStorage.setItem(KEYS.AI_INTERVAL, seconds.toString());
    }

    // ==========================================
    // 30-DAY CHALLENGE
    // ==========================================

    async getChallengeProgress(): Promise<ChallengeProgress | null> {
        try {
            const json = await AsyncStorage.getItem(KEYS.CHALLENGE_PROGRESS);
            return json ? JSON.parse(json) : null;
        } catch {
            return null;
        }
    }

    async startChallenge(challengeId?: string): Promise<ChallengeProgress> {
        const id = challengeId || `build-30-${new Date().toISOString().slice(0, 10)}`;
        const progress: ChallengeProgress = {
            challengeId: id,
            startDate: new Date().toISOString(),
            currentDay: 1,
            completedDays: [],
            unlockedMilestones: [],
            isActive: true,
        };
        await AsyncStorage.setItem(KEYS.CHALLENGE_PROGRESS, JSON.stringify(progress));
        return progress;
    }

    async markChallengeDayComplete(day: number): Promise<ChallengeProgress | null> {
        const progress = await this.getChallengeProgress();
        if (!progress || !progress.isActive) return null;

        if (!progress.completedDays.includes(day)) {
            progress.completedDays.push(day);
        }
        progress.currentDay = Math.min(30, day + 1);

        // Check milestone unlocks
        const milestones = [7, 14, 21, 30];
        for (const m of milestones) {
            if (day >= m && !progress.unlockedMilestones.includes(m)) {
                progress.unlockedMilestones.push(m);
            }
        }

        // Check if challenge completed
        if (day === 30) {
            progress.isActive = false;
            progress.completedAt = new Date().toISOString();
        }

        await AsyncStorage.setItem(KEYS.CHALLENGE_PROGRESS, JSON.stringify(progress));
        return progress;
    }

    async resetChallenge(): Promise<void> {
        await AsyncStorage.removeItem(KEYS.CHALLENGE_PROGRESS);
    }

    // ==========================================
    // THEME PREFERENCE
    // ==========================================

    async getThemePreference(): Promise<ThemePreference> {
        try {
            const value = await AsyncStorage.getItem(KEYS.THEME_PREFERENCE);
            return (value as ThemePreference) || 'system';
        } catch {
            return 'system';
        }
    }

    async setThemePreference(theme: ThemePreference): Promise<void> {
        await AsyncStorage.setItem(KEYS.THEME_PREFERENCE, theme);
    }

    // ==========================================
    // UTILITIES
    // ==========================================

    async clearAllData(): Promise<void> {
        const allKeys = Object.values(KEYS);
        await AsyncStorage.multiRemove(allKeys);
    }

    async exportData(): Promise<object> {
        return {
            preferences: await this.getUserPreferences(),
            workoutHistory: await this.getWorkoutHistory(),
            streakData: await this.getStreakData(),
            achievements: await this.getAchievements(),
            exportedAt: new Date().toISOString(),
        };
    }
}

// Export singleton instance
export const storageService = new StorageService();
export default storageService;
