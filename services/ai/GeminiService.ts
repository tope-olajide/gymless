/**
 * GeminiService
 * 
 * AI-powered tips, coaching, and session summaries using the Gemini API.
 */

import Constants from 'expo-constants';
import { Exercise, getExerciseById } from '../../data/exercises';
import { UserPreferences } from '../storage/StorageService';

// Get Gemini API key from env
const GEMINI_KEY = Constants.expoConfig?.extra?.geminiApiKey as string | undefined;

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

interface GeminiResponse {
    candidates?: {
        content: {
            parts: { text: string }[];
        };
    }[];
    error?: {
        message: string;
    };
}

/**
 * Generate content using Gemini API
 */
async function generateContent(prompt: string): Promise<string | null> {
    if (!GEMINI_KEY) {
        console.warn('Gemini API key not configured');
        return null;
    }

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }],
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 256,
                    topP: 0.8,
                },
            }),
        });

        const data: GeminiResponse = await response.json();

        if (data.error) {
            console.error('Gemini API error:', data.error.message);
            return null;
        }

        return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
    } catch (error) {
        console.error('Gemini request failed:', error);
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
    if (!exercise) {
        return getDefaultTip();
    }

    const prompt = buildExerciseTipPrompt(exercise, preferences);
    const tip = await generateContent(prompt);

    return tip || getDefaultTipForExercise(exercise);
}

function buildExerciseTipPrompt(exercise: Exercise, preferences?: UserPreferences | null): string {
    const level = preferences?.experienceLevel || 'beginner';
    const limitations = preferences?.limitations?.filter(l => l !== 'none').join(', ') || 'none';

    return `You are a friendly fitness coach. Give ONE short, motivating tip (max 15 words) for someone about to do ${exercise.name}.

User level: ${level}
Limitations: ${limitations}

Focus on form, motivation, or breathing. Be encouraging! No emojis, just text.`;
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
    const tips: Record<string, string[]> = {
        'push-up': ['Keep your body in a straight line', 'Lower your chest to the floor', 'Engage your core throughout'],
        'squat': ['Keep your knees over your toes', 'Push through your heels', 'Keep your chest up'],
        'plank': ['Keep your hips level', 'Breathe steadily', 'Engage your whole core'],
        'lunge': ['Take a big step forward', 'Keep your front knee stable', 'Stand tall'],
        'glute-bridge': ['Squeeze your glutes at the top', 'Keep your core tight', 'Press through your heels'],
    };

    const exerciseTips = tips[exercise.id] || [exercise.tips[0] || getDefaultTip()];
    return exerciseTips[Math.floor(Math.random() * exerciseTips.length)];
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
    if (!exercise) {
        return 'Keep going!';
    }

    const prompt = `You are a supportive fitness coach. The user is doing ${exercise.name} (rep ${repCount}).

Issue detected: ${formIssue}

Give ONE brief correction (max 10 words). Be encouraging, not critical. No emojis.`;

    const feedback = await generateContent(prompt);
    return feedback || 'Keep your form steady!';
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

    const defaults = [
        'Great set! Shake it off and breathe',
        'You\'re doing amazing!',
        'Nice work! Rest up for the next one',
        'That was solid! Keep this energy',
        `${totalSets - setCompleted} more sets, you\'ve got this!`,
    ];
    return defaults[Math.floor(Math.random() * defaults.length)];
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
  "summary": "Brief summary of what they accomplished (max 15 words)",
  "encouragement": "Motivating message about their effort (max 12 words)",
  "nextStep": "One suggested next action for their goal (max 15 words)"
}

Be encouraging and specific to their goal!`;

    try {
        const response = await generateContent(prompt);
        if (response) {
            const parsed = JSON.parse(response);
            return {
                summary: parsed.summary || `${totalReps} ${exerciseName} completed!`,
                encouragement: parsed.encouragement || 'Great work today!',
                nextStep: parsed.nextStep || 'Rest well and come back tomorrow!',
            };
        }
    } catch (error) {
        console.error('Failed to parse session summary:', error);
    }

    // Fallback
    return {
        summary: `${totalReps} ${exerciseName} completed in ${minutes} min!`,
        encouragement: 'You showed up and put in the work!',
        nextStep: goal === 'belly-fat'
            ? 'Add 10 min cardio tomorrow'
            : goal === 'glutes'
                ? 'Try hip thrusts next session'
                : 'Rest today, train again tomorrow!',
    };
}

/**
 * Get modification suggestion for exercise based on limitations
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
 * Check if Gemini is configured and available
 */
export function isGeminiAvailable(): boolean {
    return !!GEMINI_KEY;
}

export const geminiService = {
    getExerciseTip,
    getFormFeedback,
    getRestEncouragement,
    generateSessionSummary,
    getModificationSuggestion,
    isGeminiAvailable,
};
