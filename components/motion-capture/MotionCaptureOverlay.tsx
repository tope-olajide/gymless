import React from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { RepCounter } from './RepCounter';
import { FormMeter } from './FormMeter';
import { CoachingCueCard } from './CoachingCueCard';
import { MotionCaptureView } from './MotionCaptureView';
import { CoachingCue } from '@/types/motion-capture';
import { X } from 'lucide-react-native';

interface MotionCaptureOverlayProps {
  repCount: number;
  targetReps?: number;
  formScore: number;
  coachingCue: CoachingCue | null;
  phase?: 'idle' | 'descending' | 'bottom' | 'ascending';
  onClose?: () => void;
  showCamera?: boolean;
}

export function MotionCaptureOverlay({
  repCount,
  targetReps,
  formScore,
  coachingCue,
  phase = 'idle',
  onClose,
  showCamera = true,
}: MotionCaptureOverlayProps) {
  return (
    <View style={styles.container}>
      {showCamera && (
        <View style={styles.cameraContainer}>
          <MotionCaptureView style={styles.camera} />
        </View>
      )}

      <CoachingCueCard cue={coachingCue} />

      <View style={styles.topMetrics}>
        <RepCounter count={repCount} target={targetReps} phase={phase} />
        <FormMeter score={formScore} />
      </View>

      {onClose && (
        <Pressable style={styles.closeButton} onPress={onClose}>
          <View style={styles.closeButtonInner}>
            <X size={24} color="#FFFFFF" />
          </View>
        </Pressable>
      )}

      <View style={styles.bottomInfo}>
        <Text style={styles.infoText}>Position yourself in frame</Text>
        <Text style={styles.infoSubtext}>Stand 6 feet from camera, full body visible</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  cameraContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  camera: {
    flex: 1,
  },
  topMetrics: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 100,
  },
  closeButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomInfo: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 10,
  },
  infoText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  infoSubtext: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
