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
  const [definition, setDefinition] = useState<ExerciseMotionCapture | null>(null);

  const engineRef = useRef<MotionCaptureEngine | null>(null);

  useEffect(() => {
    if (!exerciseId) return;

    const exerciseDef = getExerciseDefinition(exerciseId);

    if (!exerciseDef || !exerciseDef.supported) {
      console.log(`Motion capture not supported for exercise: ${exerciseId}`);
      setDefinition(null);
      return;
    }

    setDefinition(exerciseDef);
    initializeEngine(exerciseDef);

    return () => {
      stop();
      engineRef.current?.dispose();
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
      console.log('Motion capture engine initialized');
    } catch (error) {
      console.error('Failed to initialize motion capture:', error);
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
      console.warn('Engine not initialized');
      return;
    }

    engineRef.current.start();
    setIsActive(true);
  }, []);

  const stop = useCallback(() => {
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
    isSupported: definition?.supported || false,
    definition,
    start,
    stop,
    processPose,
    onCameraReady: handleCameraReady,
  };
}
