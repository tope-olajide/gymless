import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Target, Zap, Scale, Calendar, Trophy, X, CheckCircle, Sparkles } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/Button';

type ChallengeType = 'strength' | 'consistency' | 'balanced';

const challengeOptions = [
  {
    type: 'strength' as ChallengeType,
    name: 'Strength Focus',
    description: 'Build muscle and increase strength with progressive resistance training',
    icon: Target,
    gradient: ['#EF4444', '#DC2626'],
    benefits: ['Muscle growth', 'Increased strength', 'Progressive overload'],
  },
  {
    type: 'consistency' as ChallengeType,
    name: 'Consistency Challenge',
    description: 'Build a daily habit with short, manageable workouts',
    icon: Zap,
    gradient: ['#F59E0B', '#D97706'],
    benefits: ['Daily routine', 'Quick workouts', 'Habit building'],
  },
  {
    type: 'balanced' as ChallengeType,
    name: 'Balanced Program',
    description: 'Mix of strength, cardio, and flexibility for complete fitness',
    icon: Scale,
    gradient: ['#10B981', '#059669'],
    benefits: ['Varied workouts', 'Complete fitness', 'Sustainable approach'],
  },
];

export default function ChallengeSetupScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { startChallenge } = useApp();
  const [selectedType, setSelectedType] = useState<ChallengeType>('balanced');
  const [isLoading, setIsLoading] = useState(false);

  const handleStartChallenge = async () => {
    setIsLoading(true);
    try {
      await startChallenge(selectedType);
      router.replace('/challenge/dashboard');
    } catch (error) {
      console.error('Error starting challenge:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedOption = challengeOptions.find(opt => opt.type === selectedType)!;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.primary + '15', colors.background]}
        style={styles.headerGradient}
      />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.closeButton, { backgroundColor: colors.surface }]}
        >
          <X size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleSection}>
          <View style={[styles.iconBadge, { backgroundColor: colors.primary + '20' }]}>
            <Trophy size={32} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>30-Day Challenge</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Choose your transformation path
          </Text>
        </View>

        <View style={styles.optionsContainer}>
          {challengeOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = selectedType === option.type;

            return (
              <TouchableOpacity
                key={option.type}
                onPress={() => setSelectedType(option.type)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.optionCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: isSelected ? option.gradient[0] : colors.border,
                      borderWidth: isSelected ? 2 : 1,
                    },
                  ]}
                >
                  <LinearGradient
                    colors={option.gradient as any}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.optionHeader}
                  >
                    <Icon size={28} color="white" />
                    {isSelected && (
                      <View style={styles.selectedBadge}>
                        <CheckCircle size={20} color="white" />
                      </View>
                    )}
                  </LinearGradient>

                  <View style={styles.optionContent}>
                    <Text style={[styles.optionName, { color: colors.text }]}>
                      {option.name}
                    </Text>
                    <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
                      {option.description}
                    </Text>

                    <View style={styles.benefitsContainer}>
                      {option.benefits.map((benefit, index) => (
                        <View
                          key={index}
                          style={[styles.benefitTag, { backgroundColor: colors.surfaceSecondary }]}
                        >
                          <Text style={[styles.benefitText, { color: colors.textSecondary }]}>
                            {benefit}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.infoHeader}>
            <Sparkles size={20} color={colors.primary} />
            <Text style={[styles.infoHeaderText, { color: colors.text }]}>What's Included</Text>
          </View>

          <View style={styles.infoList}>
            {[
              { icon: Calendar, text: '30 days of structured workouts' },
              { icon: Trophy, text: 'Achievement badges & milestones' },
              { icon: Target, text: 'Progress tracking & analytics' },
              { icon: Zap, text: '3 pause days for flexibility' },
            ].map((item, index) => (
              <View key={index} style={styles.infoItem}>
                <View style={[styles.infoIcon, { backgroundColor: colors.primaryLight }]}>
                  <item.icon size={16} color={colors.primary} />
                </View>
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                  {item.text}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.commitmentCard, { backgroundColor: colors.surfaceSecondary }]}>
          <Text style={[styles.commitmentTitle, { color: colors.text }]}>
            Your Commitment
          </Text>
          <Text style={[styles.commitmentText, { color: colors.textSecondary }]}>
            Complete daily workouts, honor rest days, and track your progress consistently.
            You can pause up to 3 days if needed, but consistency is key!
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <Button
          title={isLoading ? 'Starting Challenge...' : 'Start My 30-Day Challenge'}
          onPress={handleStartChallenge}
          disabled={isLoading}
          variant="primary"
          style={styles.startButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 250,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  titleSection: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 32,
  },
  iconBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  optionsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  optionCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  optionHeader: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 20,
    padding: 4,
  },
  optionContent: {
    padding: 20,
  },
  optionName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  benefitsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  benefitTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  benefitText: {
    fontSize: 12,
    fontWeight: '500',
  },
  infoCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  infoHeaderText: {
    fontSize: 16,
    fontWeight: '600',
  },
  infoList: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  commitmentCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  commitmentTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  commitmentText: {
    fontSize: 14,
    lineHeight: 22,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: 32,
    borderTopWidth: 1,
  },
  startButton: {
    width: '100%',
  },
});
