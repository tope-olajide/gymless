import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { PoseFrame } from '@/types/motion-capture';

interface MotionCaptureViewProps {
  onPoseDetected?: (pose: PoseFrame) => void;
  showSkeleton?: boolean;
  facing?: CameraType;
  style?: any;
}

export function MotionCaptureView({
  onPoseDetected,
  showSkeleton = true,
  facing = 'front',
  style,
}: MotionCaptureViewProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  useEffect(() => {
    if (Platform.OS === 'web' && videoRef.current) {
      startWebcam();
    }
  }, []);

  const startWebcam = async () => {
    if (Platform.OS !== 'web') return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 640,
          height: 480,
          facingMode: facing === 'front' ? 'user' : 'environment',
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing webcam:', error);
    }
  };

  if (!permission?.granted) {
    return <View style={[styles.container, style]} />;
  }

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, style]}>
        <video
          ref={videoRef}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
          autoPlay
          playsInline
          muted
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <CameraView style={styles.camera} facing={facing} />
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
