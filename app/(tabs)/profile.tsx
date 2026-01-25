import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import {
  User,
  Moon,
  Bell,
  Clock,
  Target,
  Trash2,
  ChevronRight,
  Dumbbell,
  Flame,
  Calendar,
  Award,
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import { Card } from '@/components/ui/Card';
import { DurationPicker } from '@/components/ui/DurationPicker';
import { DifficultyToggle } from '@/components/ui/DifficultyToggle';
import { BorderRadius, FontSizes, FontWeights, Spacing } from '@/constants/theme';
import { storage } from '@/utils/storage';

export default function ProfileScreen() {
  const { colors, theme, toggleTheme } = useTheme();
  const { preferences, streakData, workoutHistory, updatePreferences, refreshData } = useApp();

  const totalMinutes = workoutHistory.reduce((sum, w) => sum + w.duration, 0);

  const handleResetProgress = () => {
    Alert.alert(
      'Reset Progress',
      'This will delete all your workout history, streaks, and progress. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await storage.resetAllData();
            await refreshData();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Profile</Text>
        </View>

        <Card style={styles.statsCard}>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Dumbbell size={20} color={colors.primary} />
              <Text style={[styles.statValue, { color: colors.text }]}>
                {workoutHistory.length}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Workouts
              </Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Flame size={20} color={colors.streak} />
              <Text style={[styles.statValue, { color: colors.text }]}>
                {streakData.longestStreak}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Best Streak
              </Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Clock size={20} color={colors.accent} />
              <Text style={[styles.statValue, { color: colors.text }]}>
                {totalMinutes}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Minutes
              </Text>
            </View>
          </View>
        </Card>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Preferences
          </Text>

          <Card style={styles.settingsCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Target size={20} color={colors.primary} />
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  Default Difficulty
                </Text>
              </View>
            </View>
            <View style={styles.settingControl}>
              <DifficultyToggle
                value={preferences.difficulty}
                onChange={(difficulty) => updatePreferences({ difficulty })}
              />
            </View>
          </Card>

          <Card style={styles.settingsCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Clock size={20} color={colors.secondary} />
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  Preferred Duration
                </Text>
              </View>
            </View>
            <View style={styles.settingControl}>
              <DurationPicker
                value={preferences.preferredDuration}
                onChange={(duration) => updatePreferences({ preferredDuration: duration })}
              />
            </View>
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Appearance
          </Text>

          <Card>
            <TouchableOpacity
              style={styles.settingRowTouchable}
              onPress={toggleTheme}
              activeOpacity={0.7}
            >
              <View style={styles.settingInfo}>
                <Moon size={20} color={colors.accent} />
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  Dark Mode
                </Text>
              </View>
              <Switch
                value={theme === 'dark'}
                onValueChange={toggleTheme}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </TouchableOpacity>
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Data
          </Text>

          <Card>
            <TouchableOpacity
              style={styles.settingRowTouchable}
              onPress={handleResetProgress}
              activeOpacity={0.7}
            >
              <View style={styles.settingInfo}>
                <Trash2 size={20} color={colors.error} />
                <Text style={[styles.settingLabel, { color: colors.error }]}>
                  Reset All Progress
                </Text>
              </View>
              <ChevronRight size={20} color={colors.error} />
            </TouchableOpacity>
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            About
          </Text>

          <Card style={styles.aboutCard}>
            <View style={[styles.appIcon, { backgroundColor: colors.primaryLight }]}>
              <Award size={32} color={colors.primary} />
            </View>
            <Text style={[styles.appName, { color: colors.text }]}>Gymless</Text>
            <Text style={[styles.appVersion, { color: colors.textSecondary }]}>
              Version 1.0.0
            </Text>
            <Text style={[styles.appDescription, { color: colors.textTertiary }]}>
              No gym? No problem. Work out anywhere, anytime with zero equipment.
            </Text>
          </Card>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
  },
  header: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  title: {
    fontSize: FontSizes.xxxl,
    fontWeight: FontWeights.bold,
  },
  statsCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
  },
  statValue: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    marginTop: Spacing.xs,
  },
  statLabel: {
    fontSize: FontSizes.xs,
    marginTop: 2,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    marginBottom: Spacing.sm,
  },
  settingsCard: {
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  settingRowTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  settingLabel: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.medium,
  },
  settingControl: {
    marginTop: Spacing.xs,
  },
  aboutCard: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  appIcon: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  appName: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
  },
  appVersion: {
    fontSize: FontSizes.sm,
    marginTop: 4,
  },
  appDescription: {
    fontSize: FontSizes.sm,
    textAlign: 'center',
    marginTop: Spacing.md,
    lineHeight: 20,
  },
  bottomPadding: {
    height: Spacing.xxl,
  },
});
