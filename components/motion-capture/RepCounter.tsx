import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface RepCounterProps {
  count: number;
  target?: number;
  phase?: 'idle' | 'descending' | 'bottom' | 'ascending';
}

export function RepCounter({ count, target, phase = 'idle' }: RepCounterProps) {
  const getPhaseColor = () => {
    switch (phase) {
      case 'descending':
        return '#FFA500';
      case 'bottom':
        return '#FF6B6B';
      case 'ascending':
        return '#4ECDC4';
      default:
        return '#95A5A6';
    }
  };

  return (
    <LinearGradient
      colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.5)']}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.countLabel}>REPS</Text>
        <View style={styles.countRow}>
          <Text style={styles.count}>{count}</Text>
          {target && (
            <>
              <Text style={styles.separator}>/</Text>
              <Text style={styles.target}>{target}</Text>
            </>
          )}
        </View>
        <View style={[styles.phaseIndicator, { backgroundColor: getPhaseColor() }]} />
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
  countLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    opacity: 0.7,
    letterSpacing: 1,
    marginBottom: 4,
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  count: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  separator: {
    fontSize: 32,
    fontWeight: '300',
    color: '#FFFFFF',
    opacity: 0.5,
    marginHorizontal: 4,
  },
  target: {
    fontSize: 28,
    fontWeight: '300',
    color: '#FFFFFF',
    opacity: 0.7,
  },
  phaseIndicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
});
