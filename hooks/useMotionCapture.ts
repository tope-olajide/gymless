import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { MotionCaptureEngine } from '@/motion-capture/core/MotionCaptureEngine';
import { getExerciseDefinition } from '@/motion-capture/definitions/exerciseDefinitions';
import {
  CoachingCue,
  FormMetrics,
  ExerciseMotionCapture,
  FormAnalytics,
} from '@/types/motion-capture';
import { storage } from '@/utils/storage';
import * as Haptics from 'expo-haptics';

interface UseMotionCaptureOptions {
  exerciseId: string;
  exerciseName: string;
  enabled?: boolean;
  workoutId?: string;
  onRepComplete?: (count: number) => void;
}

export function useMotionCapture({
  exerciseId,
  exerciseName,
  enabled = true,
  workoutId = '',
  onRepComplete,
}: UseMotionCaptureOptions) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [repCount, setRepCount] = useState(0);
  const [formScore, setFormScore] = useState(100);
  const [currentCue, setCurrentCue] = useState<CoachingCue | null>(null);
  const [definition, setDefinition] = useState<ExerciseMotionCapture | null>(null);
  const [formMetrics, setFormMetrics] = useState<FormMetrics | null>(null);

  const engineRef = useRef<MotionCaptureEngine | null>(null);
  const videoElementRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const exerciseDef = getExerciseDefinition(exerciseId);

    if (!exerciseDef || !exerciseDef.supported) {
      console.log(`Motion capture not supported for exercise: ${exerciseId}`);
      return;
    }

    setDefinition(exerciseDef);
    initializeEngine(exerciseDef);

    return () => {
      stopCapture();
      engineRef.current?.dispose();
    };
  }, [exerciseId, enabled]);

  const initializeEngine = async (exerciseDef: ExerciseMotionCapture) => {
    try {
      const settings = await storage.getMotionCaptureSettings();

      if (!settings.enabled) {
        return;
      }

      const geminiApiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || 'your-api-key-here';

      const engine = new MotionCaptureEngine({
        exerciseDefinition: exerciseDef,
        geminiApiKey,
        onRepComplete: handleRepComplete,
        onCoachingCue: handleCoachingCue,
        onFormUpdate: handleFormUpdate,
      });

      const success = await engine.initialize();

      if (success) {
        engineRef.current = engine;
        setIsInitialized(true);
        console.log('Motion capture engine initialized');
      }
    } catch (error) {
      console.error('Failed to initialize motion capture:', error);
    }
  };

  const startCapture = (videoElement?: HTMLVideoElement) => {
    if (!engineRef.current || !isInitialized) {
      console.warn('Engine not initialized');
      return;
    }

    if (Platform.OS === 'web' && videoElement) {
      videoElementRef.current = videoElement;
    }

    const element =
      Platform.OS === 'web' && videoElementRef.current
        ? videoElementRef.current
        : document.createElement('video');

    engineRef.current.start(element);
    setIsActive(true);
  };

  const stopCapture = () => {
    if (!engineRef.current) return;

    engineRef.current.stop();
    setIsActive(false);

    saveAnalytics();
  };

  const handleRepComplete = async (count: number) => {
    setRepCount(count);

    const settings = await storage.getMotionCaptureSettings();

    if (settings.hapticFeedback && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (onRepComplete) {
      onRepComplete(count);
    }
  };

  const handleCoachingCue = async (cue: CoachingCue) => {
    setCurrentCue(cue);

    const settings = await storage.getMotionCaptureSettings();

    if (settings.hapticFeedback && Platform.OS !== 'web') {
      if (cue.urgency === 'critical') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } else if (cue.urgency === 'high') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
    }
  };

  const handleFormUpdate = (metrics: FormMetrics) => {
    setFormScore(metrics.score);
    setFormMetrics(metrics);
  };

  const saveAnalytics = async () => {
    if (!engineRef.current || repCount === 0) return;

    try {
      const analytics = engineRef.current.getAnalytics();

      const formAnalytics: FormAnalytics = {
        exerciseId,
        workoutId,
        date: new Date().toISOString(),
        totalReps: analytics.totalReps || 0,
        validReps: analytics.validReps || 0,
        avgFormScore: analytics.avgFormScore || 0,
        peakFormScore: analytics.peakFormScore || 0,
        fatigueOnset: null,
        repScores: analytics.repScores || [],
        rangeOfMotionAvg: 0,
        velocityAvg: 0,
        consistencyScore: 0,
        coachingCues: analytics.coachingCues || [],
      };

      await storage.addFormAnalytics(formAnalytics);
    } catch (error) {
      console.error('Failed to save analytics:', error);
    }
  };

  const reset = () => {
    if (engineRef.current) {
      engineRef.current.reset();
    }
    setRepCount(0);
    setFormScore(100);
    setCurrentCue(null);
    setFormMetrics(null);
  };

  return {
    isInitialized,
    isActive,
    isSupported: definition?.supported || false,
    repCount,
    formScore,
    currentCue,
    definition,
    formMetrics,
    startCapture,
    stopCapture,
    reset,
    videoElementRef,
  };
}
