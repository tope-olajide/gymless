import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import { CategoryCard } from '@/components/ui/CategoryCard';
import { BorderRadius, FontSizes, FontWeights, Spacing } from '@/constants/theme';
import { bodyParts, muscleGroups, getMuscleGroupsByBodyPart } from '@/data/bodyParts';
import { BodyRegion } from '@/types/exercise';

export default function WorkoutsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { bodyPartHistory } = useApp();

  const handleCategoryPress = (muscleGroupId: string) => {
    router.push({
      pathname: '/category/[id]',
      params: { id: muscleGroupId },
    });
  };

  const handleBodyPartPress = (bodyPartId: BodyRegion) => {
    const groups = getMuscleGroupsByBodyPart(bodyPartId);
    if (groups.length === 1) {
      handleCategoryPress(groups[0].id);
    } else {
      router.push({
        pathname: '/bodypart/[id]',
        params: { id: bodyPartId },
      });
    }
  };

  const bodyPartOrder: BodyRegion[] = ['lower-body', 'core', 'upper-body', 'balance-mobility'];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Workouts</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Choose a body part to start your workout
          </Text>
        </View>

        {bodyPartOrder.map(bodyPartId => {
          const bodyPart = bodyParts[bodyPartId];
          const bodyPartGroups = getMuscleGroupsByBodyPart(bodyPartId);

          return (
            <View key={bodyPartId} style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {bodyPart.name}
              </Text>
              <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                {bodyPart.description}
              </Text>

              <View style={styles.grid}>
                {bodyPartGroups.map(group => {
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
                      onPress={() => handleCategoryPress(group.id)}
                    />
                  );
                })}
              </View>
            </View>
          );
        })}

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
    paddingBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSizes.xxxl,
    fontWeight: FontWeights.bold,
  },
  subtitle: {
    fontSize: FontSizes.md,
    marginTop: Spacing.xs,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.semibold,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: FontSizes.sm,
    marginBottom: Spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  bottomPadding: {
    height: Spacing.xxl,
  },
});
