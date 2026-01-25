import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Play } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/Button';
import { CategoryCard } from '@/components/ui/CategoryCard';
import { BorderRadius, FontSizes, FontWeights, Spacing } from '@/constants/theme';
import { bodyParts, getMuscleGroupsByBodyPart } from '@/data/bodyParts';
import { BodyRegion } from '@/types/exercise';

export default function BodyPartScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const { bodyPartHistory, preferences } = useApp();

  const bodyPart = bodyParts[id as BodyRegion];
  const muscleGroups = getMuscleGroupsByBodyPart(id as BodyRegion);

  if (!bodyPart) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>
          Body part not found
        </Text>
      </SafeAreaView>
    );
  }

  const handleMuscleGroupPress = (muscleGroupId: string) => {
    router.push({
      pathname: '/category/[id]',
      params: { id: muscleGroupId },
    });
  };

  const handleStartFullWorkout = () => {
    const allMuscleGroupIds = muscleGroups.map(g => g.id).join(',');
    router.push({
      pathname: '/workout/configure',
      params: {
        muscleGroups: allMuscleGroupIds,
        duration: preferences.preferredDuration.toString(),
      },
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: colors.surface }]}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleSection}>
          <Text style={[styles.title, { color: colors.text }]}>{bodyPart.name}</Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {bodyPart.description}
          </Text>
        </View>

        <View style={styles.grid}>
          {muscleGroups.map(group => {
            const history = bodyPartHistory[group.id];
            return (
              <CategoryCard
                key={group.id}
                id={group.id}
                name={group.name}
                exerciseCount={group.exercises.length}
                gradientColors={group.gradientColors}
                icon={group.icon}
                lastTrained={history?.lastTrained}
                onPress={() => handleMuscleGroupPress(group.id)}
                size="large"
              />
            );
          })}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.background }]}>
        <Button
          title={`Full ${bodyPart.name} Workout`}
          onPress={handleStartFullWorkout}
          size="large"
          icon={<Play size={18} color="#FFFFFF" fill="#FFFFFF" />}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 120,
  },
  titleSection: {
    paddingTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSizes.xxxl,
    fontWeight: FontWeights.bold,
  },
  description: {
    fontSize: FontSizes.md,
    marginTop: Spacing.xs,
  },
  grid: {
    gap: Spacing.md,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  errorText: {
    fontSize: FontSizes.lg,
    textAlign: 'center',
    marginTop: 100,
  },
  bottomPadding: {
    height: Spacing.xxl,
  },
});
