/**
 * GeminiService
 * 
 * AI-powered tips, coaching, and session summaries using the Gemini API.
 * Supports Gemini 2.5 Flash (stable) and Gemini 3 Flash Preview (agentic vision).
 */

import Constants from 'expo-constants';
import { Exercise, getExerciseById } from '../../data/exercises';
import { storageService, UserPreferences } from '../storage/StorageService';

// Get Gemini API key from env
const GEMINI_KEY = Constants.expoConfig?.extra?.geminiApiKey as string | undefined;
const BASE_URL = 'https://generativelanguage.googleapis.com';

// Supported models
export const AI_MODELS = {
    'gemini-2.5-flash': {
        id: 'gemini-2.5-flash',
        name: 'Gemini 2.5 Flash',
        description: 'Fast, reliable, and production-stable.',
        apiVersion: 'v1',
        available: true,
    },
    'gemini-3-flash-preview': {
        id: 'gemini-3-flash-preview',
        name: 'Gemini 3 Flash Preview',
        description: 'Next-gen reasoning and Agentic Vision for movement coaching.',
        apiVersion: 'v1beta',
        available: true,
    },
    // Coming Soon models
    'gpt-4o': {
        id: 'gpt-4o',
        name: 'GPT-4o',
        description: 'OpenAI multimodal reasoning.',
        apiVersion: '',
        available: false,
    },
    'claude-3.5-sonnet': {
        id: 'claude-3.5-sonnet',
        name: 'Claude 3.5 Sonnet',
        description: 'Anthropic agentic vision analysis.',
        apiVersion: '',
        available: false,
    },
    'gemini-2.5-pro': {
        id: 'gemini-2.5-pro',
        name: 'Gemini 2.5 Pro',
        description: 'Advanced reasoning (Tier-2 API key required).',
        apiVersion: 'v1',
        available: false,
    },
} as const;

export type AIModelId = keyof typeof AI_MODELS;

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

// ============================================================
// RATE LIMITING & QUEUE (Token Bucket-ish)
// ============================================================
const MIN_REQUEST_INTERVAL_MS = 4100; // 4.1s to be safe (15 RPM)
let lastRequestTime = 0;
let isProcessingQueue = false;

type RequestPriority = 'high' | 'normal' | 'low';

interface QueuedRequest {
    prompt: string;
    modelOverride?: string;
    priority: RequestPriority;
    resolve: (value: string | null) => void;
    reject: (reason?: any) => void;
    timestamp: number;
}

const requestQueue: QueuedRequest[] = [];

/**
 * Process the queue respecting the rate limit
 */
async function processQueue() {
    if (isProcessingQueue || requestQueue.length === 0) return;

    isProcessingQueue = true;

    try {
        while (requestQueue.length > 0) {
            const now = Date.now();
            const timeSinceLast = now - lastRequestTime;
            const waitTime = Math.max(0, MIN_REQUEST_INTERVAL_MS - timeSinceLast);

            if (waitTime > 0) {
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }

            // Get next request (High priority first)
            // Sort queue by priority each time? Or just use filter/find.
            // Simple approach: Find first 'high', then 'normal', then 'low'
            let nextIndex = requestQueue.findIndex(r => r.priority === 'high');
            if (nextIndex === -1) nextIndex = requestQueue.findIndex(r => r.priority === 'normal');
            if (nextIndex === -1) nextIndex = 0; // Take whatever is first (low)

            const [request] = requestQueue.splice(nextIndex, 1);

            lastRequestTime = Date.now();

            try {
                const result = await executeGeminiRequest(request.prompt, request.modelOverride);
                request.resolve(result);
            } catch (error) {
                request.resolve(null); // Resolve null on error to keep app moving
            }
        }
    } finally {
        isProcessingQueue = false;
    }
}

/**
 * Enqueue a request
 */
function enqueueRequest(
    prompt: string,
    priority: RequestPriority = 'normal',
    modelOverride?: string
): Promise<string | null> {
    return new Promise((resolve, reject) => {
        // Drop 'low' priority requests if queue is too full to prevent backlog
        if (priority === 'low' && requestQueue.length > 3) {
            console.log('[GeminiService] Dropping low priority request due to load');
            resolve(null);
            return;
        }

        requestQueue.push({
            prompt,
            modelOverride,
            priority,
            resolve,
            reject,
            timestamp: Date.now()
        });

        processQueue();
    });
}

/**
 * Validates and executes the actual API call
 */
async function executeGeminiRequest(prompt: string, modelOverride?: string): Promise<string | null> {
    if (!GEMINI_KEY) {
        console.warn('Gemini API key not configured');
        return null;
    }

    // Get user's preferred model or use override
    const model = modelOverride || await storageService.getAIModelPreference();
    const isG3 = model.includes('gemini-3');
    const apiVersion = isG3 ? 'v1beta' : 'v1';
    const url = `${BASE_URL}/${apiVersion}/models/${model}:generateContent?key=${GEMINI_KEY}`;

    const body: Record<string, unknown> = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
            temperature: 1.0,
            maxOutputTokens: 256,
            topP: 0.8,
            ...(isG3 && { mediaResolution: 'high' }),
        },
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        const data: GeminiResponse = await response.json();

        if (data.error) {
            console.error('Gemini API error:', data.error.message);
            // If we hit a 429 despite our local limiter, wait longer next time
            if (data.error.message.includes('Resource has been exhausted')) {
                lastRequestTime = Date.now() + 5000; // Add penalty
            }
            return null;
        }

        return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
    } catch (error) {
        console.error('Gemini request failed:', error);
        return null;
    }
}

/**
 * Generate content using Gemini API (via Queue)
 */
async function generateContent(
    prompt: string,
    priority: RequestPriority = 'normal',
    modelOverride?: string
): Promise<string | null> {
    return enqueueRequest(prompt, priority, modelOverride);
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
    // Tips are High priority as they block the user from starting (or are valid immediately)
    const tip = await generateContent(prompt, 'high');

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

    const feedback = await generateContent(prompt, 'high');
    return feedback || 'Keep your form steady!';
}

/**
 * Enhanced Coaching: Analyze a batch of movement data (e.g., every 5 reps)
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

    // Rest encouragement is 'low' priority
    const encouragement = await generateContent(prompt, 'low');

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
        // Session summary is 'normal' priority
        const response = await generateContent(prompt, 'normal');
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

/**
 * Get accountability nudge for progress screen
 */
export async function getAccountabilityNudge(
    streakData: { currentStreak: number; longestStreak: number; totalWorkouts: number } | null,
    recentWorkouts: { exerciseName: string; date: string }[],
    preferences?: UserPreferences | null
): Promise<string> {
    const streak = streakData?.currentStreak || 0;
    const total = streakData?.totalWorkouts || 0;
    const goal = preferences?.primaryGoals?.[0] || 'general fitness';
    const lastWorkout = recentWorkouts[0];
    const daysSinceWorkout = lastWorkout
        ? Math.floor((Date.now() - new Date(lastWorkout.date).getTime()) / (1000 * 60 * 60 * 24))
        : 999;

    const prompt = `You are a supportive AI fitness coach. User stats:
- Current streak: ${streak} days
- Total workouts: ${total}
- Days since last workout: ${daysSinceWorkout}
- Primary goal: ${goal}
- Last exercise: ${lastWorkout?.exerciseName || 'none yet'}

Write ONE personalized motivational message (max 25 words). Be encouraging, specific to their situation. 
If they haven't worked out recently, gently encourage return.
If they're on a streak, celebrate it!
If they're new, welcome them warmly.
No emojis at the start.`;

    const nudge = await generateContent(prompt, 'low');

    if (nudge) return nudge;

    // Fallbacks based on situation
    if (streak === 0 && total === 0) {
        return "Welcome! Every journey starts with a single step. Ready to begin yours?";
    } else if (daysSinceWorkout > 3) {
        return `It's been ${daysSinceWorkout} days. Your body is ready—even a quick session counts!`;
    } else if (streak >= 7) {
        return `${streak}-day streak! You're building a powerful habit. Keep this momentum going!`;
    } else if (streak >= 3) {
        return `${streak} days strong! Consistency is your superpower. One more day?`;
    } else {
        return "You showed up before, and you can do it again. Let's make today count!";
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
    AI_MODELS,
};
