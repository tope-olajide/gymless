import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import { CoachingCue } from '@/types/motion-capture';
import { AlertTriangle, CheckCircle, Zap } from 'lucide-react-native';

interface CoachingCueCardProps {
  cue: CoachingCue | null;
}

export function CoachingCueCard({ cue }: CoachingCueCardProps) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (cue) {
      scale.value = withSequence(withSpring(1.1), withSpring(1));
      opacity.value = withSpring(1);

      const timeout = setTimeout(() => {
        opacity.value = withSpring(0);
        scale.value = withSpring(0);
      }, cue.duration);

      return () => clearTimeout(timeout);
    } else {
      opacity.value = withSpring(0);
      scale.value = withSpring(0);
    }
  }, [cue]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  if (!cue) return null;

  const getColors = (): [string, string] => {
    switch (cue.urgency) {
      case 'critical':
        return ['#FF6B6B', '#FF4757'];
      case 'high':
        return ['#FFA500', '#FF8C00'];
      default:
        return ['#4ECDC4', '#44A08D'];
    }
  };

  const getIcon = () => {
    switch (cue.type) {
      case 'safety':
        return <AlertTriangle size={20} color="#FFFFFF" />;
      case 'form':
        return <Zap size={20} color="#FFFFFF" />;
      case 'motivation':
        return <CheckCircle size={20} color="#FFFFFF" />;
    }
  };

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <LinearGradient colors={getColors()} style={styles.gradient}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>{getIcon()}</View>
          <Text style={styles.message}>{cue.message}</Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 120,
    left: 20,
    right: 20,
    zIndex: 100,
  },
  gradient: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 12,
  },
  message: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    lineHeight: 22,
  },
});
