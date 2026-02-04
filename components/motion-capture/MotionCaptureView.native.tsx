import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, Platform } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { PoseFrame } from '@/types/motion-capture';
import { convertMediaPipeLandmarksToFrame } from '@/motion-capture/constants/landmarks';

let ReactNativeMediapipePoseView: any = null;

if (Platform.OS === 'ios') {
  try {
    const module = require('@gymbrosinc/react-native-mediapipe-pose');
    ReactNativeMediapipePoseView = module.ReactNativeMediapipePoseView;
  } catch (error) {
    console.warn('Native MediaPipe module not available');
  }
}

const CAMERA_READY_TIMEOUT_MS = 3000;

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
  const [cameraReady, setCameraReady] = useState(false);
  const cameraReadyCalledRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  useEffect(() => {
    if (!enabled) return;

    timeoutRef.current = setTimeout(() => {
      if (!cameraReadyCalledRef.current) {
        console.log('Camera ready timeout - forcing ready state');
        cameraReadyCalledRef.current = true;
        setCameraReady(true);
        onCameraReady?.();
      }
    }, CAMERA_READY_TIMEOUT_MS);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, onCameraReady]);

  const handlePoseDetected = useCallback(
    (event: any) => {
      if (!cameraReadyCalledRef.current) {
        cameraReadyCalledRef.current = true;
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        console.log('Camera ready inferred from pose detection');
        setCameraReady(true);
        onCameraReady?.();
      }

      if (!enabled || !onPoseDetected) return;

      try {
        const landmarks = event.nativeEvent?.landmarks;

        if (landmarks && landmarks.length >= 33) {
          const poseFrame = convertMediaPipeLandmarksToFrame(landmarks, Date.now());
          onPoseDetected(poseFrame);
        }
      } catch (error) {
        console.error('Error processing pose:', error);
      }
    },
    [enabled, onPoseDetected, onCameraReady]
  );

  const handleCameraReady = useCallback(() => {
    if (cameraReadyCalledRef.current) return;
    cameraReadyCalledRef.current = true;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    console.log('Camera ready callback received');
    setCameraReady(true);
    onCameraReady?.();
  }, [onCameraReady]);

  const handleError = useCallback(
    (error: any) => {
      const errorMessage =
        typeof error === 'string' ? error : error?.nativeEvent?.error || 'Camera error';
      console.error('Motion capture error:', errorMessage);
      onError?.(errorMessage);
    },
    [onError]
  );

  if (!permission) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Checking camera permissions...</Text>
        </View>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Camera permission required for motion capture</Text>
        </View>
      </View>
    );
  }

  if (Platform.OS === 'android') {
    return (
      <View style={[styles.container, style]}>
        <CameraView
          style={styles.camera}
          facing={facing}
          onCameraReady={handleCameraReady}
        />
        <View style={styles.androidOverlay}>
          <Text style={styles.androidOverlayText}>
            AI pose detection on Android coming soon
          </Text>
          <Text style={styles.androidOverlaySubtext}>Camera preview active</Text>
        </View>
      </View>
    );
  }

  if (!ReactNativeMediapipePoseView) {
    return (
      <View style={[styles.container, style]}>
        <CameraView style={styles.camera} facing={facing} onCameraReady={handleCameraReady} />
        <View style={styles.fallbackOverlay}>
          <Text style={styles.fallbackText}>Pose detection unavailable</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <ReactNativeMediapipePoseView
        key={`camera-${facing}`}
        style={styles.camera}
        cameraType={facing}
        enablePoseDetection={enabled}
        enablePoseDataStreaming={true}
        targetFPS={30}
        autoAdjustFPS={true}
        poseDataThrottleMs={33}
        fpsChangeThreshold={2.0}
        fpsReportThrottleMs={500}
        enableDetailedLogs={false}
        onCameraReady={handleCameraReady}
        onError={handleError}
        onPoseDetected={handlePoseDetected}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  loadingText: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    padding: 20,
  },
  androidOverlay: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  androidOverlayText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  androidOverlaySubtext: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  fallbackOverlay: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  fallbackText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
