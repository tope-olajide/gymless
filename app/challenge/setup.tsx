import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Target, Zap, Scale, Calendar, Trophy, X } from 'lucide-react-native';
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
    color: '#EF4444',
    benefits: ['Muscle growth', 'Increased strength', 'Progressive difficulty'],
  },
  {
    type: 'consistency' as ChallengeType,
    name: 'Consistency Challenge',
    description: 'Build a daily habit with short, manageable workouts',
    icon: Zap,
    color: '#F59E0B',
    benefits: ['Daily routine', 'Quick workouts', 'Habit building'],
  },
  {
    type: 'balanced' as ChallengeType,
    name: 'Balanced Program',
    description: 'Mix of strength, cardio, and flexibility for complete fitness',
    icon: Scale,
    color: '#10B981',
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
    <View style={styles.container}>
      <LinearGradient
        colors={[selectedOption.color + '20', 'transparent']}
        style={styles.headerGradient}
      />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <X size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>30-Day Challenge</Text>
        <Text style={styles.subtitle}>Choose your path to transformation</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
                <View style={[
                  styles.optionCard,
                  isSelected && { borderColor: option.color, borderWidth: 2 }
                ]}>
                  <View style={[styles.iconContainer, { backgroundColor: option.color + '20' }]}>
                    <Icon size={32} color={option.color} />
                  </View>

                  <View style={styles.optionContent}>
                    <Text style={styles.optionName}>{option.name}</Text>
                    <Text style={styles.optionDescription}>{option.description}</Text>

                    <View style={styles.benefitsContainer}>
                      {option.benefits.map((benefit, index) => (
                        <View key={index} style={styles.benefitTag}>
                          <Text style={styles.benefitText}>{benefit}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {isSelected && (
                    <View style={[styles.selectedIndicator, { backgroundColor: option.color }]}>
                      <Trophy size={16} color="white" />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Calendar size={24} color={colors.primary} />
            <Text style={styles.infoTitle}>30-Day Journey</Text>
            <Text style={styles.infoText}>
              Complete daily workouts for 30 days with strategic rest days every week
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Trophy size={24} color={colors.primary} />
            <Text style={styles.infoTitle}>Earn Achievements</Text>
            <Text style={styles.infoText}>
              Unlock badges and celebrate milestones at days 7, 14, 21, and 30
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Zap size={24} color={colors.primary} />
            <Text style={styles.infoTitle}>Build Momentum</Text>
            <Text style={styles.infoText}>
              Track your streak and watch your consistency improve day by day
            </Text>
          </View>
        </View>

        <View style={styles.commitmentSection}>
          <Text style={styles.commitmentTitle}>Your Commitment</Text>
          <Text style={styles.commitmentText}>
            By starting this challenge, you commit to:
          </Text>
          <View style={styles.commitmentList}>
            <Text style={styles.commitmentItem}>• Complete daily assigned workouts</Text>
            <Text style={styles.commitmentItem}>• Honor rest days for recovery</Text>
            <Text style={styles.commitmentItem}>• Track progress consistently</Text>
            <Text style={styles.commitmentItem}>• Stay motivated through ups and downs</Text>
          </View>
          <Text style={styles.commitmentNote}>
            You can pause up to 3 days if needed, but consistency is key to success!
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={isLoading ? 'Starting...' : 'Start 30-Day Challenge'}
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
    height: 300,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  closeButton: {
    alignSelf: 'flex-start',
    padding: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  optionsContainer: {
    gap: 16,
    marginBottom: 32,
  },
  optionCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    position: 'relative',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
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
  },
  selectedIndicator: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoSection: {
    gap: 16,
    marginBottom: 32,
  },
  infoCard: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  commitmentSection: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 100,
    borderWidth: 1,
  },
  commitmentTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  commitmentText: {
    fontSize: 14,
    marginBottom: 12,
  },
  commitmentList: {
    gap: 8,
    marginBottom: 16,
  },
  commitmentItem: {
    fontSize: 14,
    lineHeight: 20,
  },
  commitmentNote: {
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    borderTopWidth: 1,
  },
  startButton: {
    width: '100%',
  },
});
