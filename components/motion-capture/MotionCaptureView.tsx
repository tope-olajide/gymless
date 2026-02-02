import React, { useRef, useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { PoseFrame } from '@/types/motion-capture';
import { PoseDetector, CameraFrame } from '@/motion-capture/core/PoseDetector';

interface MotionCaptureViewProps {
  onPoseDetected?: (pose: PoseFrame) => void;
  showSkeleton?: boolean;
  facing?: CameraType;
  style?: any;
  enabled?: boolean;
}

export function MotionCaptureView({
  onPoseDetected,
  showSkeleton = true,
  facing = 'front',
  style,
  enabled = true,
}: MotionCaptureViewProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const detectorRef = useRef<PoseDetector | null>(null);
  const [isDetectorReady, setIsDetectorReady] = useState(false);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  useEffect(() => {
    if (enabled && Platform.OS !== 'web') {
      initializeDetector();
    }

    return () => {
      cleanupDetector();
    };
  }, [enabled]);

  const initializeDetector = async () => {
    if (detectorRef.current) return;

    const detector = new PoseDetector();
    const success = await detector.initialize();

    if (success) {
      detectorRef.current = detector;
      setIsDetectorReady(true);
    }
  };

  const cleanupDetector = async () => {
    if (detectorRef.current) {
      await detectorRef.current.dispose();
      detectorRef.current = null;
      setIsDetectorReady(false);
    }
  };

  const handleFrame = useCallback(async (frame: any) => {
    if (!enabled || !isDetectorReady || !detectorRef.current || !onPoseDetected) {
      return;
    }

    try {
      const cameraFrame: CameraFrame = {
        width: frame.width || 640,
        height: frame.height || 480,
        data: frame,
        timestamp: Date.now(),
      };

      const pose = await detectorRef.current.detectPose(cameraFrame);

      if (pose) {
        onPoseDetected(pose);
      }
    } catch (error) {
      console.error('Error processing frame:', error);
    }
  }, [enabled, isDetectorReady, onPoseDetected]);

  if (!permission?.granted) {
    return <View style={[styles.container, style]} />;
  }

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.webPlaceholder} />
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <CameraView
        style={styles.camera}
        facing={facing}
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
  webPlaceholder: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
});
