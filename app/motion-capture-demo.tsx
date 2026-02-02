import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { X, Camera, Zap } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useMotionCapture } from '@/hooks/useMotionCapture';
import { MotionCaptureOverlay } from '@/components/motion-capture/MotionCaptureOverlay';
import { Button } from '@/components/ui/Button';
import { Spacing, FontSizes, FontWeights } from '@/constants/theme';

export default function MotionCaptureDemoScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [selectedExercise, setSelectedExercise] = useState<string>('squat');
  const [isActive, setIsActive] = useState(false);
  const [targetReps, setTargetReps] = useState(10);

  const exercises = [
    { id: 'squat', name: 'Squat', supported: true },
    { id: 'pushup', name: 'Push-up', supported: true },
    { id: 'plank', name: 'Plank', supported: true },
  ];

  const {
    isInitialized,
    isSupported,
    repCount,
    formScore,
    currentCue,
    definition,
    startCapture,
    stopCapture,
    reset,
  } = useMotionCapture({
    exerciseId: selectedExercise,
    exerciseName: exercises.find((e) => e.id === selectedExercise)?.name || '',
    enabled: true,
    workoutId: 'demo-' + Date.now(),
    onRepComplete: (count) => {
      console.log('Rep completed:', count);
      if (count >= targetReps) {
        handleComplete();
      }
    },
  });

  const handleStart = () => {
    if (!isSupported) {
      Alert.alert(
        'Not Supported',
        `Motion capture is not available for ${
          exercises.find((e) => e.id === selectedExercise)?.name
        } yet.`
      );
      return;
    }

    if (!isInitialized) {
      Alert.alert('Loading', 'Motion capture is still initializing. Please wait...');
      return;
    }

    setIsActive(true);
    setTimeout(() => {
      startCapture();
    }, 100);
  };

  const handleStop = () => {
    stopCapture();
    setIsActive(false);
  };

  const handleComplete = () => {
    Alert.alert(
      'Workout Complete!',
      `You completed ${repCount} reps with an average form score of ${Math.round(
        formScore
      )}%.`,
      [
        {
          text: 'Done',
          onPress: () => {
            handleStop();
            reset();
          },
        },
      ]
    );
  };

  if (isActive) {
    return (
      <SafeAreaView style={styles.fullScreen}>
        <MotionCaptureOverlay
          repCount={repCount}
          targetReps={targetReps}
          formScore={formScore}
          coachingCue={currentCue}
          onClose={handleStop}
          showCamera={true}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <X size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Motion Capture Demo
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.hero}>
          <View style={[styles.heroIcon, { backgroundColor: colors.primaryLight }]}>
            <Camera size={40} color={colors.primary} />
          </View>
          <Text style={[styles.heroTitle, { color: colors.text }]}>
            AI-Powered Form Coach
          </Text>
          <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
            Real-time pose detection with instant coaching feedback
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Select Exercise</Text>
          <View style={styles.exerciseGrid}>
            {exercises.map((exercise) => (
              <TouchableOpacity
                key={exercise.id}
                style={[
                  styles.exerciseCard,
                  {
                    backgroundColor:
                      selectedExercise === exercise.id ? colors.primary : colors.surface,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setSelectedExercise(exercise.id)}
              >
                <Text
                  style={[
                    styles.exerciseName,
                    {
                      color: selectedExercise === exercise.id ? '#FFFFFF' : colors.text,
                    },
                  ]}
                >
                  {exercise.name}
                </Text>
                {exercise.supported && (
                  <View style={styles.badge}>
                    <Zap size={12} color={colors.primary} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Target Reps</Text>
          <View style={styles.repsSelector}>
            {[5, 10, 15, 20].map((reps) => (
              <TouchableOpacity
                key={reps}
                style={[
                  styles.repsButton,
                  {
                    backgroundColor: targetReps === reps ? colors.primary : colors.surface,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setTargetReps(reps)}
              >
                <Text
                  style={[
                    styles.repsText,
                    { color: targetReps === reps ? '#FFFFFF' : colors.text },
                  ]}
                >
                  {reps}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.features}>
          <Text style={[styles.featuresTitle, { color: colors.text }]}>Features</Text>
          {[
            'Real-time rep counting',
            'Form quality scoring (0-100)',
            'AI-powered coaching cues',
            'Safety violation detection',
            'Progress tracking & analytics',
          ].map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <View style={[styles.featureDot, { backgroundColor: colors.primary }]} />
              <Text style={[styles.featureText, { color: colors.textSecondary }]}>
                {feature}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.info}>
          <Text style={[styles.infoTitle, { color: colors.text }]}>Setup Instructions</Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            1. Position camera 6 feet away{'\n'}
            2. Ensure full body is visible{'\n'}
            3. Side angle works best{'\n'}
            4. Good lighting recommended
          </Text>
        </View>

        {definition?.coaching.setupCues && (
          <View style={[styles.tipCard, { backgroundColor: colors.surfaceSecondary }]}>
            <Text style={[styles.tipTitle, { color: colors.text }]}>Setup Tips</Text>
            {definition.coaching.setupCues.map((cue, index) => (
              <Text key={index} style={[styles.tipText, { color: colors.textSecondary }]}>
                • {cue}
              </Text>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <Button
          title={`Start ${exercises.find((e) => e.id === selectedExercise)?.name} Demo`}
          onPress={handleStart}
          variant="primary"
          disabled={!isInitialized}
        />
        {!isInitialized && (
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Initializing pose detection...
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fullScreen: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  closeButton: {
    padding: Spacing.sm,
  },
  headerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.lg,
  },
  hero: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  heroTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  heroSubtitle: {
    fontSize: FontSizes.md,
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    marginBottom: Spacing.md,
  },
  exerciseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  exerciseCard: {
    flex: 1,
    minWidth: 100,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    position: 'relative',
  },
  exerciseName: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.medium,
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  repsSelector: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  repsButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  repsText: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
  },
  features: {
    marginBottom: Spacing.xl,
  },
  featuresTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    marginBottom: Spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  featureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: Spacing.sm,
  },
  featureText: {
    fontSize: FontSizes.md,
  },
  info: {
    marginBottom: Spacing.xl,
  },
  infoTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    marginBottom: Spacing.sm,
  },
  infoText: {
    fontSize: FontSizes.md,
    lineHeight: 24,
  },
  tipCard: {
    padding: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.xl,
  },
  tipTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    marginBottom: Spacing.sm,
  },
  tipText: {
    fontSize: FontSizes.sm,
    lineHeight: 20,
    marginBottom: 4,
  },
  footer: {
    padding: Spacing.lg,
    borderTopWidth: 1,
  },
  loadingText: {
    fontSize: FontSizes.sm,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
});
