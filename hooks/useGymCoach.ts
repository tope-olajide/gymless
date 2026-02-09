import { Exercise } from '@/data/exercises';
import { storageService } from '@/services/storage/StorageService';
import { GoogleGenerativeAI, GenerativeModel as JSModel } from '@google/generative-ai';
import { GenerativeModel as FirebaseModel, getAI } from '@react-native-firebase/ai';
import * as Speech from 'expo-speech';
import { useCallback, useEffect, useRef, useState } from 'react';

// Constants
const GEMINI_MODEL = 'gemini-3-flash-preview';

/**
 * Helper to get cues for exercise
 */
function getSystemPromptForExercise(exercise: Exercise): string {
    const tips = exercise.tips.slice(0, 3).join('. ');
    const mistakes = exercise.commonMistakes.slice(0, 3).join('. ');
    return `Focus on: ${tips}. Avoid: ${mistakes}.`;
}

export function useGymCoach() {
    const [isThinking, setIsThinking] = useState(false);
    const [aiInterval, setAiInterval] = useState(1500); // Default 1.5s
    const [aiRateDisplay, setAiRateDisplay] = useState("1.5s");

    const lastAnalysisTime = useRef<number>(0);
    const modelRef = useRef<FirebaseModel | JSModel | null>(null);

    // Load Configuration on Mount
    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        // 1. Throttle Config
        const interval = await storageService.getAIInterval();
        const intervalMs = interval * 1000;
        setAiInterval(intervalMs);
        setAiRateDisplay(`${interval.toFixed(1)}s`);

        // 2. Model Initialization (Custom Key Check)
        const customKey = await storageService.getCustomGeminiKey();

        if (customKey) {
            console.log('Coach: using Custom API Key');
            const genAI = new GoogleGenerativeAI(customKey);
            modelRef.current = genAI.getGenerativeModel({
                model: GEMINI_MODEL,
                generationConfig: {
                    temperature: 0.1,
                    topP: 0.8,
                }
            }) as JSModel;
        } else {
            console.log('Coach: using Firebase SDK');
            const ai = getAI();
            modelRef.current = ai.getGenerativeModel({
                model: GEMINI_MODEL,
                generationConfig: {
                    temperature: 0.1,
                    mediaResolution: 'low',
                },
            }) as FirebaseModel;
        }
    };

    const analyzeForm = useCallback(async (base64Frame: string, exercise: Exercise, currentRepCount: number) => {
        const now = Date.now();
        if (now - lastAnalysisTime.current < aiInterval) {
            return null;
        }

        if (isThinking || !modelRef.current) return null;

        setIsThinking(true);
        lastAnalysisTime.current = now;

        try {
            const exerciseCues = getSystemPromptForExercise(exercise);
            const prompt = `
            You are a high-speed fitness coach. Analyze this frame of a user doing ${exercise.name}.
            
            CRITICAL RULES:
            1. Response must be extremely short (max 10 words).
            2. If form is good, say "Good!" or "Nice!".
            3. If form is bad, give ONE specific correction keying on: ${exerciseCues}
            4. Current Rep: ${currentRepCount}
            
            Respond with ONLY the actionable feedback cue.
            `;

            let feedback = '';

            // Handle different SDKs
            // Firebase SDK uses contents: [{ role: 'user', parts: [...] }]
            // JS SDK uses generateContent([ ... ]) or object

            // Both generally support the object format with contents array, but safest is to check or try/catch if unsure.
            // However, Firebase SDK 'generateContent' takes { contents: [] }
            // JS SDK 'generateContent' takes ( [ part, part ] ) OR { contents: [] } (in newer versions)

            // Using a unified approach if possible, or branching logic if strictly typed differently

            // Construct parts
            const parts = [
                { text: prompt },
                { inlineData: { mimeType: 'image/jpeg', data: base64Frame } }
            ];

            const result = await modelRef.current.generateContent({
                contents: [{ role: 'user', parts }]
            });

            feedback = result.response.text().trim();

            if (feedback && feedback.length > 0) {
                const isSpeaking = await Speech.isSpeakingAsync();
                if (!isSpeaking) {
                    Speech.speak(feedback, {
                        rate: 1.1,
                        pitch: 1.0
                    });
                }
            }

            return feedback;

        } catch (error) {
            console.error('AI Analysis failed:', error);
            return null;
        } finally {
            setIsThinking(false);
        }
    }, [isThinking, aiInterval]);

    const generateSessionSummary = async (exercise: Exercise, stats: any, logs: any[]) => {
        if (!modelRef.current) return { grade: 'B', tip: 'Good job!' };

        try {
            // Basic implementation reusing the model
            const prompt = `
             Session Summary for ${exercise.name}.
             Rep Logs: ${JSON.stringify(logs.slice(0, 30))} 
             Stats: ${JSON.stringify(stats)}
             
             Return JSON: { "grade": "A/B/C/D/F", "tip": "One Sentence Tip" }
             `;

            const result = await modelRef.current.generateContent({
                contents: [{ role: 'user', parts: [{ text: prompt }] }]
            });

            const text = result.response.text().replace(/```json/g, '').replace(/```/g, '');
            return JSON.parse(text);
        } catch (e) {
            console.error("Summary failed", e);
            return { grade: 'A-', tip: 'Great effort, keep it up!' };
        }
    };

    const getExerciseTip = async (exercise: Exercise): Promise<string> => {
        if (!modelRef.current) return `Ready for ${exercise.name}?`;
        try {
            const result = await modelRef.current.generateContent({
                contents: [{ role: 'user', parts: [{ text: `Give one short tip for ${exercise.name}` }] }]
            });
            return result.response.text();
        } catch {
            return `Focus on your form for ${exercise.name}`;
        }
    };

    return {
        analyzeForm,
        generateSessionSummary,
        getExerciseTip,
        isThinking,
        aiRateDisplay
    };
}
