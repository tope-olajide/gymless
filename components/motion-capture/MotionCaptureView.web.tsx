import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { PoseFrame } from '@/types/motion-capture';
import { WebPoseComponent } from './WebPoseComponent.web';

interface MotionCaptureViewProps {
  onPoseDetected?: (pose: PoseFrame) => void;
  onCameraReady?: () => void;
  onError?: (error: string) => void;
  showSkeleton?: boolean;
  facing?: 'front' | 'back';
  style?: any;
  enabled?: boolean;
}

export function MotionCaptureView({
  onPoseDetected,
  onCameraReady,
  onError,
  showSkeleton = true,
  facing = 'front',
  style,
  enabled = true,
}: MotionCaptureViewProps) {
  const [, setCameraReady] = useState(false);

  const handlePoseDetected = useCallback(
    (pose: PoseFrame) => {
      if (!enabled || !onPoseDetected) return;
      onPoseDetected(pose);
    },
    [enabled, onPoseDetected]
  );

  const handleCameraReady = useCallback(() => {
    setCameraReady(true);
    onCameraReady?.();
  }, [onCameraReady]);

  const handleError = useCallback(
    (error: string) => {
      console.error('Motion capture error:', error);
      onError?.(error);
    },
    [onError]
  );

  return (
    <View style={[styles.container, style]}>
      <WebPoseComponent
        onPoseDetected={handlePoseDetected}
        onCameraReady={handleCameraReady}
        onError={handleError}
        showSkeleton={showSkeleton}
        cameraType={facing}
        style={styles.camera}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
});
