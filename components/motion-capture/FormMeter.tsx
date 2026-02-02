import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';

interface FormMeterProps {
  score: number;
}

export function FormMeter({ score }: FormMeterProps) {
  const getFormLabel = (): string => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Great';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Improve';
  };

  const getColor = (): string => {
    if (score >= 85) return '#4ECDC4';
    if (score >= 70) return '#FFA500';
    return '#FF6B6B';
  };

  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <LinearGradient
      colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.5)']}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.label}>FORM</Text>
        <View style={styles.circleContainer}>
          <Svg width={80} height={80}>
            <Circle
              cx={40}
              cy={40}
              r={radius}
              stroke="rgba(255,255,255,0.2)"
              strokeWidth={6}
              fill="none"
            />
            <Circle
              cx={40}
              cy={40}
              r={radius}
              stroke={getColor()}
              strokeWidth={6}
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform={`rotate(-90 40 40)`}
            />
          </Svg>
          <View style={styles.scoreContainer}>
            <Text style={styles.score}>{Math.round(score)}</Text>
          </View>
        </View>
        <Text style={[styles.formLabel, { color: getColor() }]}>{getFormLabel()}</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    minWidth: 120,
  },
  content: {
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    opacity: 0.7,
    letterSpacing: 1,
    marginBottom: 8,
  },
  circleContainer: {
    position: 'relative',
    width: 80,
    height: 80,
    marginBottom: 8,
  },
  scoreContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  score: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
