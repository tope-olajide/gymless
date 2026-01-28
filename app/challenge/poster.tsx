import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Trophy, Zap, Target, Calendar } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/Button';
import { BorderRadius, FontSizes, FontWeights, Spacing } from '@/constants/theme';

const { width } = Dimensions.get('window');

export default function ChallengePosterScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const benefits = [
    { icon: Zap, title: 'Build Strength', description: 'Progressive workouts' },
    { icon: Target, title: 'Stay Consistent', description: 'Daily commitment' },
    { icon: Trophy, title: 'Achieve Goals', description: 'Transform in 30 days' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity
        style={[styles.closeButton, { backgroundColor: colors.surface }]}
        onPress={() => router.back()}
      >
        <X size={24} color={colors.text} />
      </TouchableOpacity>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroSection}
        >
          <View style={styles.heroContent}>
            <View style={styles.badge}>
              <Calendar size={14} color="#FFFFFF" />
              <Text style={styles.badgeText}>30 DAYS</Text>
            </View>

            <Text style={styles.heroTitle}>Transform{'\n'}Your Body</Text>
            <Text style={styles.heroSubtitle}>
              Join the ultimate fitness challenge
            </Text>
          </View>

          <View style={styles.imageContainer}>
            <Image
              source={require('@/assets/images/gemini_generated_image_5u79fm5u79fm5u79.png')}
              style={styles.heroImage}
              resizeMode="contain"
            />
          </View>

          <View style={styles.highlightBar}>
            <View style={styles.highlightItem}>
              <Text style={styles.highlightNumber}>30</Text>
              <Text style={styles.highlightLabel}>Days</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.highlightItem}>
              <Text style={styles.highlightNumber}>∞</Text>
              <Text style={styles.highlightLabel}>Potential</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.highlightItem}>
              <Text style={styles.highlightNumber}>100%</Text>
              <Text style={styles.highlightLabel}>Effort</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              What You'll Get
            </Text>

            <View style={styles.benefitsGrid}>
              {benefits.map((benefit, index) => (
                <View
                  key={index}
                  style={[
                    styles.benefitCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.benefitIcon,
                      { backgroundColor: colors.primaryLight },
                    ]}
                  >
                    <benefit.icon size={24} color={colors.primary} />
                  </View>
                  <Text style={[styles.benefitTitle, { color: colors.text }]}>
                    {benefit.title}
                  </Text>
                  <Text
                    style={[
                      styles.benefitDescription,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {benefit.description}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              How It Works
            </Text>

            {[
              {
                step: '1',
                title: 'Start Your Journey',
                description: 'Accept the challenge and set your commitment',
              },
              {
                step: '2',
                title: 'Train Daily',
                description: 'Complete workouts tailored to your fitness level',
              },
              {
                step: '3',
                title: 'Track Progress',
                description: 'Watch your streak grow and body transform',
              },
              {
                step: '4',
                title: 'Achieve Victory',
                description: 'Complete all 30 days and celebrate your success',
              },
            ].map((item, index) => (
              <View
                key={index}
                style={[
                  styles.stepCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.stepNumber,
                    { backgroundColor: colors.primary },
                  ]}
                >
                  <Text style={styles.stepNumberText}>{item.step}</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={[styles.stepTitle, { color: colors.text }]}>
                    {item.title}
                  </Text>
                  <Text
                    style={[
                      styles.stepDescription,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {item.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.ctaSection}>
            <View
              style={[
                styles.ctaCard,
                { backgroundColor: colors.surfaceSecondary },
              ]}
            >
              <Text style={[styles.ctaTitle, { color: colors.text }]}>
                Ready to Transform?
              </Text>
              <Text style={[styles.ctaSubtitle, { color: colors.textSecondary }]}>
                Start your 30-day journey today and unlock your full potential
              </Text>
              <Button
                title="Accept Challenge"
                onPress={() => router.push('/(tabs)')}
                size="large"
                style={styles.ctaButton}
                icon={<Trophy size={20} color="#FFFFFF" />}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    top: 48,
    right: Spacing.lg,
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  heroSection: {
    paddingTop: 60,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  heroContent: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.md,
  },
  badgeText: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.bold,
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 48,
    fontWeight: FontWeights.bold,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 56,
    marginBottom: Spacing.sm,
  },
  heroSubtitle: {
    fontSize: FontSizes.lg,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  heroImage: {
    width: width * 0.7,
    height: width * 0.7,
    maxWidth: 320,
    maxHeight: 320,
  },
  highlightBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginTop: Spacing.md,
  },
  highlightItem: {
    alignItems: 'center',
    flex: 1,
  },
  highlightNumber: {
    fontSize: FontSizes.xxxl,
    fontWeight: FontWeights.bold,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  highlightLabel: {
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.8)',
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  section: {
    marginTop: Spacing.xl,
  },
  sectionTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    marginBottom: Spacing.lg,
  },
  benefitsGrid: {
    gap: Spacing.md,
  },
  benefitCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  benefitIcon: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  benefitTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    marginBottom: Spacing.xs,
  },
  benefitDescription: {
    fontSize: FontSizes.sm,
    textAlign: 'center',
  },
  stepCard: {
    flexDirection: 'row',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  stepNumberText: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: '#FFFFFF',
  },
  stepContent: {
    flex: 1,
    paddingTop: 4,
  },
  stepTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: FontSizes.sm,
    lineHeight: 20,
  },
  ctaSection: {
    marginTop: Spacing.xl,
  },
  ctaCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  ctaSubtitle: {
    fontSize: FontSizes.md,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: 22,
  },
  ctaButton: {
    width: '100%',
  },
});
