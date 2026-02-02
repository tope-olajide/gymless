import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/contexts/ThemeContext';

interface AICoachToggleProps {
  exerciseId: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  isSupported: boolean;
  isInitializing?: boolean;
}

export function AICoachToggle({
  exerciseId,
  enabled,
  onToggle,
  isSupported,
  isInitializing = false,
}: AICoachToggleProps) {
  const { theme } = useTheme();

  const handleToggle = () => {
    if (!isSupported || isInitializing) {
      return;
    }

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    onToggle(!enabled);
  };

  const getStatusIndicator = () => {
    if (isInitializing) {
      return (
        <View style={styles.statusContainer}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
        </View>
      );
    }

    if (enabled) {
      return (
        <View style={[styles.statusIndicator, { backgroundColor: '#4ade80' }]}>
          <Text style={styles.statusText}>On</Text>
        </View>
      );
    }

    return (
      <View
        style={[
          styles.statusIndicator,
          { backgroundColor: theme.colors.textSecondary },
        ]}
      >
        <Text style={styles.statusText}>Off</Text>
      </View>
    );
  };

  const isDisabled = !isSupported || isInitializing;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderColor: enabled ? theme.colors.primary : theme.colors.border,
        },
        isDisabled && styles.disabled,
      ]}
      onPress={handleToggle}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <Text style={styles.icon}>🤖</Text>
        <Text
          style={[
            styles.label,
            { color: theme.colors.text },
            isDisabled && { color: theme.colors.textSecondary },
          ]}
        >
          AI Coach
        </Text>
      </View>
      {getStatusIndicator()}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    minWidth: 140,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  icon: {
    fontSize: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusContainer: {
    width: 40,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusIndicator: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 40,
    alignItems: 'center',
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.5,
  },
});
