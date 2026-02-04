import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Platform } from 'react-native';
import { Camera } from 'expo-camera';
import { PoseFrame } from '@/types/motion-capture';
import { convertMediaPipeLandmarksToFrame } from '@/motion-capture/constants/landmarks';

let ReactNativeMediapipePoseView: any = null;

try {
  const module = require('@gymbrosinc/react-native-mediapipe-pose');
  ReactNativeMediapipePoseView = module.ReactNativeMediapipePoseView;
  console.log('Native MediaPipe module loaded successfully');
} catch (error) {
  console.warn('Native MediaPipe module not available:', error);
}

const CAMERA_READY_TIMEOUT_MS = 5000;

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
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [permissionRequested, setPermissionRequested] = useState(false);
  const cameraReadyCalledRef = useRef(false);
  const timeoutRef = useRef<any>(null);

  // Request camera permissions on mount
  useEffect(() => {
    if (!ReactNativeMediapipePoseView || !enabled) return;

    const checkPermissions = async () => {
      try {
        const { status } = await Camera.getCameraPermissionsAsync();
        if (status === 'granted') {
          setHasPermission(true);
        } else {
          setHasPermission(false);
          if (status === 'undetermined') {
            requestPermission();
          }
        }
      } catch (error) {
        console.error('Error checking camera permissions:', error);
        setHasPermission(false);
      }
    };

    checkPermissions();
  }, [enabled]);

  const requestPermission = async () => {
    try {
      setPermissionRequested(true);
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    } catch (error) {
      console.error('Error requesting camera permissions:', error);
      setHasPermission(false);
    }
  };

  useEffect(() => {
    if (!hasPermission) return;

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
  }, [enabled, onCameraReady, hasPermission]);

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
          const poseFrame = convertMediaPipeLandmarksToFrame(
            landmarks,
            Date.now()
          );
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
      const errorMessage = typeof error === 'string' ? error : error?.nativeEvent?.error || 'Camera error';
      console.error('Motion capture error:', errorMessage);
      onError?.(errorMessage);
    },
    [onError]
  );

  if (!ReactNativeMediapipePoseView) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Native MediaPipe module not available
          </Text>
        </View>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Camera permission is required for motion capture
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={requestPermission}
          >
            <Text style={styles.buttonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (hasPermission === null) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.errorContainer}>
          <Text style={styles.text}>Checking permissions...</Text>
        </View>
      </View>
    );
  }

  const [layoutReady, setLayoutReady] = useState(false);

  return (
    <View
      style={[styles.container, style]}
      onLayout={(e) => {
        if (e.nativeEvent.layout.width > 0 && e.nativeEvent.layout.height > 0) {
          setLayoutReady(true);
        }
      }}
    >
      {layoutReady && (
        <ReactNativeMediapipePoseView
          key={`camera-${facing}-${hasPermission}`}
          style={styles.camera}
          cameraType={facing}
          enablePoseDetection={enabled}
          enablePoseDataStreaming={true}
          targetFPS={30}
          autoAdjustFPS={true}
          poseDataThrottleMs={33}
          fpsChangeThreshold={2.0}
          fpsReportThrottleMs={500}
          enableDetailedLogs={true}
          onCameraReady={handleCameraReady}
          onError={handleError}
          onPoseDetected={handlePoseDetected}
        />
      )}
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 20,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  text: {
    color: '#fff',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
