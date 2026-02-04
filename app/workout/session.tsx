import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  Alert,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  X,
  Play,
  Pause,
  SkipForward,
  ChevronRight,
  AlertTriangle,
  Info,
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { Button } from '@/components/ui/Button';
import { BorderRadius, FontSizes, FontWeights, Spacing } from '@/constants/theme';
import { getExerciseById } from '@/data/exercises';
import { GeneratedWorkout, WorkoutExercise, Exercise } from '@/types/exercise';
import { AICoachToggle } from '@/components/workout/AICoachToggle';
import { CoachingCueToast } from '@/components/workout/CoachingCueToast';
import { MotionCaptureView } from '@/components/motion-capture/MotionCaptureView';
import { useMotionCapture } from '@/hooks/useMotionCapture';
import { CoachingCue, PoseFrame } from '@/types/motion-capture';

type SessionPhase = 'exercise' | 'rest' | 'complete';

interface CurrentExerciseData {
  workoutExercise: WorkoutExercise;
  exercise: Exercise;
}

export default function WorkoutSessionScreen() {
  const { workoutData, fromChallenge } = useLocalSearchParams<{
    workoutData: string;
    fromChallenge?: string;
  }>();
  const router = useRouter();
  const { colors } = useTheme();

  const workout: GeneratedWorkout = JSON.parse(workoutData || '{}');
  const exercises = workout.exercises || [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<SessionPhase>('exercise');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [aiCoachEnabled, setAiCoachEnabled] = useState(false);
  const [currentCoachingCue, setCurrentCoachingCue] = useState<CoachingCue | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;

  const currentWorkoutExercise = exercises[currentIndex];
  const currentExercise = currentWorkoutExercise
    ? getExerciseById(currentWorkoutExercise.exerciseId)
    : null;

  const nextWorkoutExercise = exercises[currentIndex + 1];
  const nextExercise = nextWorkoutExercise
    ? getExerciseById(nextWorkoutExercise.exerciseId)
    : null;

  const totalExercises = exercises.length;
  const completedExercises = currentIndex;
  const overallProgress = (completedExercises / totalExercises) * 100;


  const { start, stop, processPose, cameraReady, onCameraReady, isSupported, isInitialized } = useMotionCapture(
    currentExercise?.id || '',
    {
      onRepComplete: (count) => {
        console.log('Rep completed:', count);
      },
      onCoachingCue: (cue) => {
        setCurrentCoachingCue(cue);
      },
      onFormUpdate: (metrics) => {
        console.log('Form metrics:', metrics);
      },
    }
  );

  const isMotionCaptureAvailable = isSupported && phase === 'exercise';

  const handlePoseDetected = useCallback(
    (pose: PoseFrame) => {
      if (aiCoachEnabled && phase === 'exercise') {
        processPose(pose);
      }
    },
    [aiCoachEnabled, phase, processPose]
  );

  const handleAICoachToggle = useCallback(
    (enabled: boolean) => {
      setAiCoachEnabled(enabled);

      if (enabled) {
        start();
      } else {
        stop();
      }
    },
    [start, stop]
  );

  const dismissCoachingCue = useCallback(() => {
    setCurrentCoachingCue(null);
  }, []);

  useEffect(() => {
    if (currentWorkoutExercise) {
      setTimeRemaining(currentWorkoutExercise.duration);
      setPhase('exercise');
    }
  }, [currentIndex]);

  useEffect(() => {
    if (phase === 'rest' || phase === 'complete') {
      setAiCoachEnabled(false);
      stop();
    }
  }, [phase, stop]);

  useEffect(() => {
    if (isPaused || phase === 'complete') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handlePhaseComplete();
          return 0;
        }
        return prev - 1;
      });
      setTotalElapsed(prev => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, phase, currentIndex]);

  const handlePhaseComplete = useCallback(() => {
    if (phase === 'exercise') {
      const restTime = currentWorkoutExercise?.restAfter || 0;
      if (restTime > 0 && currentIndex < totalExercises - 1) {
        setPhase('rest');
        setTimeRemaining(restTime);
      } else {
        moveToNextExercise();
      }
    } else if (phase === 'rest') {
      moveToNextExercise();
    }
  }, [phase, currentIndex, currentWorkoutExercise]);

  const moveToNextExercise = () => {
    if (currentIndex < totalExercises - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setPhase('complete');
      completeWorkout();
    }
  };

  const completeWorkout = () => {
    router.replace({
      pathname: '/workout/complete',
      params: {
        workoutData: workoutData,
        duration: Math.ceil(totalElapsed / 60).toString(),
        fromChallenge: fromChallenge || 'false',
      },
    });
  };

  const handleSkip = () => {
    moveToNextExercise();
  };

  const handlePause = () => {
    setIsPaused(prev => !prev);
  };

  const handleQuit = () => {
    Alert.alert(
      'Quit Workout?',
      'Your progress will be lost.',
      [
        { text: 'Continue', style: 'cancel' },
        {
          text: 'Quit',
          style: 'destructive',
          onPress: () => router.back(),
        },
      ]
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentExercise || !currentWorkoutExercise) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>
          Error loading workout
        </Text>
      </SafeAreaView>
    );
  }

  const phaseDuration =
    phase === 'exercise'
      ? currentWorkoutExercise.duration
      : currentWorkoutExercise.restAfter;
  const progress = ((phaseDuration - timeRemaining) / phaseDuration) * 100;

  const needsSpaceWarning =
    phase === 'exercise' &&
    (currentExercise.safetyFlags.requiresSpace || currentExercise.safetyFlags.highImpact);

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor:
            phase === 'rest' ? colors.surfaceSecondary : colors.background,
        },
      ]}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={handleQuit} style={styles.closeButton}>
          <X size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: colors.primary,
                  width: `${overallProgress}%`,
                },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: colors.textSecondary }]}>
            {completedExercises + 1} / {totalExercises}
          </Text>
        </View>
        {isMotionCaptureAvailable && (
          <AICoachToggle
            exerciseId={currentExercise?.id || ''}
            enabled={aiCoachEnabled}
            onToggle={handleAICoachToggle}
            isSupported={isMotionCaptureAvailable}
            isInitializing={aiCoachEnabled && !cameraReady}
          />
        )}
      </View>

      <View style={styles.content}>
        {aiCoachEnabled && phase === 'exercise' && (
          <View style={styles.cameraOverlay}>
            <MotionCaptureView
              onPoseDetected={handlePoseDetected}
              onCameraReady={onCameraReady}
              showSkeleton={true}
              facing="front"
              enabled={aiCoachEnabled}
              style={styles.camera}
            />
          </View>
        )}
        {phase === 'rest' ? (
          <View style={styles.restContainer}>
            <Text style={[styles.restLabel, { color: colors.textSecondary }]}>
              Rest
            </Text>
            <Text style={[styles.restTimer, { color: colors.text }]}>
              {formatTime(timeRemaining)}
            </Text>
            {nextExercise && (
              <View style={styles.upNext}>
                <Text style={[styles.upNextLabel, { color: colors.textSecondary }]}>
                  Up next
                </Text>
                <Text style={[styles.upNextName, { color: colors.text }]}>
                  {nextExercise.name}
                </Text>
              </View>
            )}
          </View>
        ) : (
          <>
            <View style={styles.exerciseInfo}>
              <Text style={[styles.exerciseName, { color: colors.text }]}>
                {currentExercise.name}
              </Text>

              {needsSpaceWarning && (
                <View
                  style={[
                    styles.warningBadge,
                    { backgroundColor: colors.secondaryLight },
                  ]}
                >
                  <AlertTriangle size={14} color={colors.secondary} />
                  <Text style={[styles.warningText, { color: colors.secondary }]}>
                    Clear space
                  </Text>
                </View>
              )}

              {!isMotionCaptureAvailable && phase === 'exercise' && (
                <View
                  style={[
                    styles.infoBadge,
                    { backgroundColor: colors.surfaceSecondary },
                  ]}
                >
                  <Info size={14} color={colors.textTertiary} />
                  <Text style={[styles.infoText, { color: colors.textTertiary }]}>
                    AI Coach not available for this exercise
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.timerSection}>
              <ProgressRing
                progress={progress}
                size={200}
                strokeWidth={12}
                color={colors.primary}
                backgroundColor={colors.border}
              >
                <Text style={[styles.timerText, { color: colors.text }]}>
                  {formatTime(timeRemaining)}
                </Text>
                {currentWorkoutExercise.reps && (
                  <Text style={[styles.repsText, { color: colors.textSecondary }]}>
                    {currentWorkoutExercise.reps} reps
                  </Text>
                )}
              </ProgressRing>
            </View>

            <View style={styles.instructions}>
              {currentExercise.instructions.slice(0, 3).map((instruction, index) => (
                <Text
                  key={index}
                  style={[styles.instructionText, { color: colors.textSecondary }]}
                  numberOfLines={2}
                >
                  {index + 1}. {instruction}
                </Text>
              ))}
            </View>
          </>
        )}
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          onPress={handleSkip}
          style={[styles.controlButton, { backgroundColor: colors.surfaceSecondary }]}
        >
          <SkipForward size={24} color={colors.text} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handlePause}
          style={[
            styles.mainButton,
            { backgroundColor: isPaused ? colors.primary : colors.surfaceSecondary },
          ]}
        >
          {isPaused ? (
            <Play size={32} color="#FFFFFF" fill="#FFFFFF" />
          ) : (
            <Pause size={32} color={colors.text} />
          )}
        </TouchableOpacity>

        <View style={styles.controlButtonPlaceholder} />
      </View>

      {nextExercise && phase === 'exercise' && (
        <View style={[styles.nextUp, { backgroundColor: colors.surface }]}>
          <Text style={[styles.nextUpLabel, { color: colors.textTertiary }]}>
            Next:
          </Text>
          <Text style={[styles.nextUpName, { color: colors.textSecondary }]}>
            {nextExercise.name}
          </Text>
          <ChevronRight size={16} color={colors.textTertiary} />
        </View>
      )}

      {currentCoachingCue && (
        <CoachingCueToast cue={currentCoachingCue} onDismiss={dismissCoachingCue} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    gap: Spacing.md,
    zIndex: 10,
  },
  closeButton: {
    padding: Spacing.sm,
  },
  progressContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    zIndex: 10,
  },
  restContainer: {
    alignItems: 'center',
  },
  restLabel: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.medium,
    marginBottom: Spacing.sm,
  },
  restTimer: {
    fontSize: 72,
    fontWeight: FontWeights.bold,
  },
  upNext: {
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  upNextLabel: {
    fontSize: FontSizes.sm,
    marginBottom: 4,
  },
  upNextName: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.semibold,
  },
  exerciseInfo: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  exerciseName: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    textAlign: 'center',
  },
  warningBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.sm,
  },
  warningText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.sm,
  },
  infoText: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.medium,
  },
  timerSection: {
    marginBottom: Spacing.xl,
  },
  timerText: {
    fontSize: FontSizes.display,
    fontWeight: FontWeights.bold,
  },
  repsText: {
    fontSize: FontSizes.md,
    marginTop: 4,
  },
  instructions: {
    width: '100%',
    maxWidth: 320,
    gap: Spacing.xs,
  },
  instructionText: {
    fontSize: FontSizes.sm,
    lineHeight: 20,
    textAlign: 'center',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.lg,
    paddingVertical: Spacing.xl,
    zIndex: 10,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButtonPlaceholder: {
    width: 56,
    height: 56,
  },
  mainButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextUp: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.md,
    zIndex: 10,
  },
  nextUpLabel: {
    fontSize: FontSizes.sm,
  },
  nextUpName: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
    flex: 1,
  },
  errorText: {
    fontSize: FontSizes.lg,
    textAlign: 'center',
    marginTop: 100,
  },
  cameraOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
    ...Platform.select({
      android: {
        opacity: 1,
      },
      default: {
        opacity: 0.4,
      },
    }),
  },
  camera: {
    flex: 1,
  },
  uiLayer: {
    flex: 1,
    zIndex: 2,
  },
});
