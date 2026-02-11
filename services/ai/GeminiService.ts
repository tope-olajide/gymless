/**
 * GeminiService
 * 
 * AI-powered tips, coaching, and session summaries using the Google AI SDK.
 * Powered by Gemini 3 Flash.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { Exercise, getExerciseById } from '../../data/exercises';
import { UserPreferences, storageService } from '../storage/StorageService';

// Default Model Configuration
const DEFAULT_MODEL = 'gemini-3-flash-preview';

/**
 * Get the Generative Model instance
 * Prioritizes:
 * 1. Custom Key from Settings
 * 2. EXPO_PUBLIC_GEMINI_API_KEY from .env
 */
async function getModel() {
    let apiKey = await storageService.getCustomGeminiKey();

    if (!apiKey) {
        apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
    }

    if (!apiKey) {
        console.warn('⚠️ No Gemini API Key found. AI features will not work.');
        return null;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = await storageService.getAIModelPreference() || DEFAULT_MODEL;

    return genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
            temperature: 0.7,
            topP: 0.8,
        },
    });
}

/**
 * Generate content helper
 */
async function generateContent(prompt: string): Promise<string | null> {
    try {
        const model = await getModel();
        if (!model) return null;

        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error('Gemini SDK request failed:', error);
        return null;
    }
}

/**
 * Get a quick tip for an exercise before starting
 */
export async function getExerciseTip(
    exerciseId: string,
    preferences?: UserPreferences | null
): Promise<string> {
    const exercise = getExerciseById(exerciseId);
    if (!exercise) return getDefaultTip();

    const level = preferences?.experienceLevel || 'beginner';
    const limitations = preferences?.limitations?.filter(l => l !== 'none').join(', ') || 'none';

    const prompt = `You are a friendly fitness coach. Give ONE short, motivating tip (max 15 words) for someone about to do ${exercise.name}.
    
    User level: ${level}
    Limitations: ${limitations}
    
    Focus on form, motivation, or breathing. Be encouraging! No emojis, just text.`;

    const tip = await generateContent(prompt);
    return tip || getDefaultTipForExercise(exercise);
}

function getDefaultTip(): string {
    const tips = [
        'Focus on controlled movements',
        'Breathe steadily throughout',
        'Quality over quantity!',
        'Keep your core engaged',
        'You\'ve got this!',
    ];
    return tips[Math.floor(Math.random() * tips.length)];
}

function getDefaultTipForExercise(exercise: Exercise): string {
    // Basic fallback tips if AI fails
    return exercise.tips[0] || getDefaultTip();
}

/**
 * Get real-time form feedback during exercise
 */
export async function getFormFeedback(
    exerciseId: string,
    formIssue: string,
    repCount: number
): Promise<string> {
    const exercise = getExerciseById(exerciseId);
    if (!exercise) return 'Keep going!';

    const prompt = `You are a supportive fitness coach. The user is doing ${exercise.name} (rep ${repCount}).
    Issue detected: ${formIssue}
    Give ONE brief correction (max 10 words). Be encouraging, not critical. No emojis.`;

    const feedback = await generateContent(prompt);
    return feedback || 'Keep your form steady!';
}

/**
 * Enhanced Coaching: Analyze a batch of movement data
 */
export async function analyzeMovementBatch(
    exerciseId: string,
    batchData: { repNumber: number; formScore: number; feedback: string[] }[],
    preferences?: UserPreferences | null
): Promise<string | null> {
    const exercise = getExerciseById(exerciseId);
    if (!exercise || batchData.length === 0) return null;

    const avgScore = batchData.reduce((acc, curr) => acc + curr.formScore, 0) / batchData.length;
    const commonIssues = Array.from(new Set(batchData.flatMap(r => r.feedback).filter(f => f.length > 0)));

    const prompt = `You are a Pro-Level Movement Coach. Analyze this batch of ${batchData.length} ${exercise.name} reps:
    - Average Form Score: ${Math.round(avgScore)}%
    - Detected Issues: ${commonIssues.length > 0 ? commonIssues.join(', ') : 'None, great form!'}
    
    Provide ONE specialized, high-impact coaching cue (max 15 words) that will help the user reach the next level. Be technical but encouraging. No emojis.`;

    return await generateContent(prompt);
}

/**
 * Get encouragement during rest period
 */
export async function getRestEncouragement(
    exerciseId: string,
    setCompleted: number,
    totalSets: number
): Promise<string> {
    const exercise = getExerciseById(exerciseId);
    const prompt = `You are an upbeat fitness coach. User just finished set ${setCompleted} of ${totalSets} doing ${exercise?.name || 'exercise'}.
    Give ONE short encouragement for their rest break (max 12 words). Be motivating! No emojis.`;

    const encouragement = await generateContent(prompt);
    if (encouragement) return encouragement;

    return 'Great set! Shake it off and breathe.';
}

/**
 * Generate session summary after workout
 */
export async function generateSessionSummary(
    exerciseId: string,
    setsCompleted: number,
    repsPerSet: number,
    totalTimeSeconds: number,
    preferences?: UserPreferences | null
): Promise<{
    summary: string;
    encouragement: string;
    nextStep: string;
}> {
    const exercise = getExerciseById(exerciseId);
    const exerciseName = exercise?.name || 'workout';
    const totalReps = setsCompleted * repsPerSet;
    const minutes = Math.floor(totalTimeSeconds / 60);
    const goal = preferences?.primaryGoals?.[0] || 'fitness';

    const prompt = `You are a supportive fitness coach. User just completed:
    - Exercise: ${exerciseName}
    - Sets: ${setsCompleted}
    - Reps: ${totalReps} total
    - Time: ${minutes} minutes
    - Goal: ${goal}
    
    Respond in this exact JSON format:
    {
      "summary": "Brief summary (max 15 words)",
      "encouragement": "Motivating message (max 12 words)",
      "nextStep": "One suggested next action (max 15 words)"
    }`;

    try {
        const response = await generateContent(prompt);
        if (response) {
            // Clean markdown code blocks if present
            const cleanResponse = response.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleanResponse);
            return {
                summary: parsed.summary || `${totalReps} ${exerciseName} completed!`,
                encouragement: parsed.encouragement || 'Great work today!',
                nextStep: parsed.nextStep || 'Rest well and come back tomorrow!',
            };
        }
    } catch (error) {
        console.error('Failed to parse session summary:', error);
    }

    return {
        summary: `${totalReps} ${exerciseName} completed in ${minutes} min!`,
        encouragement: 'You showed up and put in the work!',
        nextStep: 'Rest today, train again tomorrow!',
    };
}

/**
 * Get modification suggestion for exercise
 */
export async function getModificationSuggestion(
    exerciseId: string,
    limitation: string
): Promise<string | null> {
    const exercise = getExerciseById(exerciseId);
    if (!exercise) return null;

    const prompt = `User wants to do ${exercise.name} but has ${limitation}.
    Suggest ONE brief modification (max 15 words) to make it safer. If no modification needed, say "You're good to go!"`;

    return await generateContent(prompt);
}

/**
 * Check if Gemini is configured
 */
export async function isGeminiAvailable(): Promise<boolean> {
    const customKey = await storageService.getCustomGeminiKey();
    if (customKey) return true;
    return !!process.env.EXPO_PUBLIC_GEMINI_API_KEY;
}

/**
 * Get accountability nudge for progress screen
 */
export async function getAccountabilityNudge(
    streakData: { currentStreak: number; longestStreak: number; totalWorkouts: number } | null,
    recentWorkouts: { exerciseName: string; date: string }[],
    preferences?: UserPreferences | null
): Promise<string> {
    const streak = streakData?.currentStreak || 0;
    const goal = preferences?.primaryGoals?.[0] || 'fitness';

    const prompt = `You are a supportive AI fitness coach. User stats:
    - Current streak: ${streak} days
    - Primary goal: ${goal}
    
    Write ONE personalized motivational message (max 25 words). Be encouraging. No emojis at start.`;

    const nudge = await generateContent(prompt);
    return nudge || "Consistency is key. Great job showing up!";
}

/**
 * Analyze form from an image
 */
export async function analyzeForm(
    imageUri: string, // Base64 or URI
    exercise: Exercise,
    repCount: number
): Promise<string | null> {
    try {
        const model = await getModel();
        if (!model) return null;

        // Prepare image part
        const imageBase64 = imageUri.split(',')[1] || imageUri;

        const prompt = `Analyze this user doing ${exercise.name} (Rep ${repCount}).
        Identify ANY form errors.
        If form is good, say "Form looks good!".
        If there is an error, give ONE short correction (max 10 words).
        Be strict but helpful.`;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: imageBase64,
                    mimeType: 'image/jpeg'
                }
            }
        ]);

        return result.response.text();
    } catch (error) {
        console.error('Gemini Vision analysis failed:', error);
        return null;
    }
}

export const geminiService = {
    getExerciseTip,
    getFormFeedback,
    getRestEncouragement,
    generateSessionSummary,
    analyzeMovementBatch,
    getModificationSuggestion,
    isGeminiAvailable,
    getAccountabilityNudge,
    analyzeForm
};
