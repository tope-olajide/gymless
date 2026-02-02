import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { Camera, Eye, Grid, Volume2, Vibrate } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Card } from '@/components/ui/Card';
import { storage } from '@/utils/storage';
import { MotionCaptureSettings as MCSettings } from '@/types/motion-capture';
import { Spacing, FontSizes, FontWeights, BorderRadius } from '@/constants/theme';

export function MotionCaptureSettings() {
  const { colors } = useTheme();
  const [settings, setSettings] = useState<MCSettings>({
    enabled: true,
    showSkeleton: true,
    showAlignmentGuides: true,
    audioCoaching: false,
    hapticFeedback: true,
    cameraPosition: 'side',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const savedSettings = await storage.getMotionCaptureSettings();
    setSettings(savedSettings);
  };

  const updateSetting = async (key: keyof MCSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await storage.saveMotionCaptureSettings({ [key]: value });
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Motion Capture
      </Text>

      <Card style={styles.card}>
        <View style={styles.setting}>
          <View style={styles.settingLeft}>
            <Camera size={20} color={colors.primary} />
            <View style={styles.settingText}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                AI Form Coach
              </Text>
              <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>
                Enable real-time pose detection
              </Text>
            </View>
          </View>
          <Switch
            value={settings.enabled}
            onValueChange={(value) => updateSetting('enabled', value)}
            trackColor={{ false: colors.border, true: colors.primaryLight }}
            thumbColor={settings.enabled ? colors.primary : colors.textSecondary}
          />
        </View>

        {settings.enabled && (
          <>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.setting}>
              <View style={styles.settingLeft}>
                <Eye size={20} color={colors.textSecondary} />
                <View style={styles.settingText}>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>
                    Show Skeleton
                  </Text>
                  <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>
                    Display pose overlay
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.showSkeleton}
                onValueChange={(value) => updateSetting('showSkeleton', value)}
                trackColor={{ false: colors.border, true: colors.primaryLight }}
                thumbColor={settings.showSkeleton ? colors.primary : colors.textSecondary}
              />
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.setting}>
              <View style={styles.settingLeft}>
                <Grid size={20} color={colors.textSecondary} />
                <View style={styles.settingText}>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>
                    Alignment Guides
                  </Text>
                  <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>
                    Show form check lines
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.showAlignmentGuides}
                onValueChange={(value) => updateSetting('showAlignmentGuides', value)}
                trackColor={{ false: colors.border, true: colors.primaryLight }}
                thumbColor={
                  settings.showAlignmentGuides ? colors.primary : colors.textSecondary
                }
              />
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.setting}>
              <View style={styles.settingLeft}>
                <Vibrate size={20} color={colors.textSecondary} />
                <View style={styles.settingText}>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>
                    Haptic Feedback
                  </Text>
                  <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>
                    Vibrate on reps & alerts
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.hapticFeedback}
                onValueChange={(value) => updateSetting('hapticFeedback', value)}
                trackColor={{ false: colors.border, true: colors.primaryLight }}
                thumbColor={settings.hapticFeedback ? colors.primary : colors.textSecondary}
              />
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.setting}>
              <View style={styles.settingLeft}>
                <Volume2 size={20} color={colors.textSecondary} />
                <View style={styles.settingText}>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>
                    Audio Coaching
                  </Text>
                  <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>
                    Spoken feedback (coming soon)
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.audioCoaching}
                onValueChange={(value) => updateSetting('audioCoaching', value)}
                disabled={true}
                trackColor={{ false: colors.border, true: colors.primaryLight }}
                thumbColor={colors.textTertiary}
              />
            </View>
          </>
        )}
      </Card>

      <Text style={[styles.infoText, { color: colors.textSecondary }]}>
        Motion capture requires camera access and works best with good lighting and a clear view
        of your full body.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  card: {
    marginHorizontal: Spacing.lg,
    padding: 0,
  },
  setting: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Spacing.md,
  },
  settingText: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  settingLabel: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.medium,
    marginBottom: 2,
  },
  settingDesc: {
    fontSize: FontSizes.sm,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    marginLeft: Spacing.md + 20 + Spacing.md,
  },
  infoText: {
    fontSize: FontSizes.sm,
    lineHeight: 20,
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.md,
  },
});
