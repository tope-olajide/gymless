import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface WebPoseComponentProps {
  onPoseDetected?: (pose: any) => void;
  onCameraReady?: () => void;
  onError?: (error: string) => void;
  showSkeleton?: boolean;
  cameraType?: 'front' | 'back';
  style?: any;
}

export function WebPoseComponent(_props: WebPoseComponentProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Web pose detection is not available on native platforms
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  text: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
});
