import { useState, useEffect, useRef, useCallback } from 'react';
import { Platform } from 'react-native';
import { MotionCaptureEngine } from '@/motion-capture/core/MotionCaptureEngine';
import { getExerciseDefinition } from '@/motion-capture/definitions/exerciseDefinitions';
import {
  CoachingCue,
  FormMetrics,
  ExerciseMotionCapture,
  FormAnalytics,
  PoseFrame,
} from '@/types/motion-capture';
import { storage } from '@/utils/storage';
import * as Haptics from 'expo-haptics';

interface UseMotionCaptureOptions {
  onRepComplete?: (count: number) => void;
  onCoachingCue?: (cue: CoachingCue) => void;
  onFormUpdate?: (metrics: FormMetrics) => void;
}

export function useMotionCapture(exerciseId: string, options: UseMotionCaptureOptions = {}) {
  const { onRepComplete, onCoachingCue, onFormUpdate } = options;

  const [cameraReady, setCameraReady] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [definition, setDefinition] = useState<ExerciseMotionCapture | null>(null);

  const engineRef = useRef<MotionCaptureEngine | null>(null);
  const pendingStartRef = useRef(false);

  useEffect(() => {
    if (!exerciseId) return;

    // Platform check
    const isPlatformSupported = Platform.OS === 'web' || Platform.OS === 'android';
    if (!isPlatformSupported) {
      setError('Motion capture is only supported on Web and Android');
      return;
    }

    const exerciseDef = getExerciseDefinition(exerciseId);

    if (!exerciseDef || !exerciseDef.supported) {
      console.log(`Motion capture not supported for exercise: ${exerciseId}`);
      setError(`Motion capture not supported for ${exerciseId}`);
      setDefinition(null);
      setIsInitialized(false);
      return;
    }

    setDefinition(exerciseDef);
    setError(null);
    setIsInitialized(false);
    initializeEngine(exerciseDef);

    return () => {
      pendingStartRef.current = false;
      engineRef.current?.stop();
      engineRef.current?.dispose();
      engineRef.current = null;
      setIsInitialized(false);
    };
  }, [exerciseId]);

  const initializeEngine = async (exerciseDef: ExerciseMotionCapture) => {
    try {
      const settings = await storage.getMotionCaptureSettings();

      if (!settings.enabled) {
        return;
      }

      const geminiApiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

      if (!geminiApiKey) {
        console.warn('Gemini API key not found');
      }

      const engine = new MotionCaptureEngine({
        exerciseDefinition: exerciseDef,
        geminiApiKey,
        onRepComplete: (count) => {
          handleHapticFeedback('rep');
          onRepComplete?.(count);
        },
        onCoachingCue: (cue) => {
          handleHapticFeedback(cue.urgency);
          onCoachingCue?.(cue);
        },
        onFormUpdate: (metrics) => {
          onFormUpdate?.(metrics);
        },
      });

      engineRef.current = engine;
      setIsInitialized(true);
      console.log('Motion capture engine initialized');

      if (pendingStartRef.current) {
        pendingStartRef.current = false;
        engine.start();
        setIsActive(true);
      }
    } catch (error) {
      console.error('Failed to initialize motion capture:', error);
      setError(error instanceof Error ? error.message : 'Failed to initialize motion capture');
      setIsInitialized(false);
    }
  };

  const handleHapticFeedback = async (type: 'rep' | 'critical' | 'high' | 'normal') => {
    if (Platform.OS === 'web') return;

    try {
      const settings = await storage.getMotionCaptureSettings();
      if (!settings.hapticFeedback) return;

      switch (type) {
        case 'rep':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'critical':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
        case 'high':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
      }
    } catch (error) {
      console.error('Haptic feedback error:', error);
    }
  };

  const handleCameraReady = useCallback(() => {
    setCameraReady(true);
  }, []);

  const start = useCallback(() => {
    if (!engineRef.current) {
      pendingStartRef.current = true;
      return;
    }

    engineRef.current.start();
    setIsActive(true);
  }, []);

  const stop = useCallback(() => {
    pendingStartRef.current = false;
    if (!engineRef.current) return;

    engineRef.current.stop();
    setIsActive(false);
  }, []);

  const processPose = useCallback(async (pose: PoseFrame) => {
    if (!engineRef.current || !isActive) return;

    await engineRef.current.processPoseFrame(pose);
  }, [isActive]);

  return {
    cameraReady,
    isActive,
    isInitialized,
    isSupported: definition?.supported || false,
    error,
    definition,
    start,
    stop,
    processPose,
    onCameraReady: handleCameraReady,
  };
}
