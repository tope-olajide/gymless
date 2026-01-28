import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated } from 'react-native';
import { Trophy, X, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';
import { ChallengeAchievement } from '@/utils/storage';

interface AchievementModalProps {
  visible: boolean;
  achievement: ChallengeAchievement | null;
  onClose: () => void;
}

export function AchievementModal({ visible, achievement, onClose }: AchievementModalProps) {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
      rotateAnim.setValue(0);
    }
  }, [visible]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (!achievement) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />

        <Animated.View
          style={[
            styles.container,
            {
              backgroundColor: colors.surface,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: colors.surfaceSecondary }]}
            onPress={onClose}
          >
            <X size={20} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.sparklesContainer}>
            <Animated.View style={{ transform: [{ rotate: rotation }] }}>
              <Sparkles size={32} color={colors.secondary} style={styles.sparkle1} />
            </Animated.View>
            <Animated.View style={{ transform: [{ rotate: rotation }] }}>
              <Sparkles size={24} color={colors.secondary} style={styles.sparkle2} />
            </Animated.View>
          </View>

          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconContainer}
          >
            <Trophy size={64} color="white" />
          </LinearGradient>

          <Text style={[styles.title, { color: colors.text }]}>
            Achievement Unlocked!
          </Text>

          <View style={[styles.badgeContainer, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.achievementName, { color: colors.primary }]}>
              {achievement.name}
            </Text>
          </View>

          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {achievement.description}
          </Text>

          <View style={[styles.dayBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.dayText}>Day {achievement.day}</Text>
          </View>

          <TouchableOpacity
            style={[styles.celebrateButton, { backgroundColor: colors.primary }]}
            onPress={onClose}
          >
            <Text style={styles.celebrateText}>Celebrate!</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    maxWidth: 340,
    width: '100%',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  sparklesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  sparkle1: {
    position: 'absolute',
    top: 30,
    right: 30,
  },
  sparkle2: {
    position: 'absolute',
    bottom: 50,
    left: 30,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  badgeContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  achievementName: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  dayBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 24,
  },
  dayText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'white',
  },
  celebrateButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  celebrateText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
