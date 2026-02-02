import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import { CoachingCue } from '@/types/motion-capture';
import { useTheme } from '@/contexts/ThemeContext';

interface CoachingCueToastProps {
  cue: CoachingCue;
  onDismiss: () => void;
}

export function CoachingCueToast({ cue, onDismiss }: CoachingCueToastProps) {
  const { theme } = useTheme();
  const translateY = useSharedValue(100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateY.value = withSpring(0, {
      damping: 15,
      stiffness: 100,
    });
    opacity.value = withSpring(1);

    const dismissTimer = setTimeout(() => {
      translateY.value = withSpring(100);
      opacity.value = withSpring(0);

      setTimeout(onDismiss, 300);
    }, cue.duration);

    return () => {
      clearTimeout(dismissTimer);
    };
  }, [cue]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      opacity: opacity.value,
    };
  });

  const getBackgroundColor = () => {
    switch (cue.urgency) {
      case 'critical':
        return '#ef4444';
      case 'high':
        return '#f97316';
      case 'normal':
      default:
        return theme.colors.primary;
    }
  };

  const getIcon = () => {
    switch (cue.type) {
      case 'safety':
        return '⚠️';
      case 'form':
        return '💪';
      case 'motivation':
        return '🎯';
      default:
        return '💬';
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        animatedStyle,
        { backgroundColor: getBackgroundColor() },
      ]}
    >
      <Text style={styles.icon}>{getIcon()}</Text>
      <Text style={styles.message}>{cue.message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  icon: {
    fontSize: 24,
  },
  message: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
});
