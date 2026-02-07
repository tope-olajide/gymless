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
