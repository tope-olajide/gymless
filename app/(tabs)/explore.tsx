/**
 * Explore Screen - Body Part Browser
 * 
 * Grid of body part categories with icons and exercise counts.
 * Tap to see exercises in that category.
 */

import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BODY_PART_IMAGES } from '../../constants/assets';
import {
  BODY_PARTS,
  BODY_PART_GROUPS,
  BodyPart,
  BodyPartGroup
} from '../../data/bodyParts';
import { getExercisesByBodyPart } from '../../data/exercises';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 52) / 2;

interface BodyPartWithCount extends BodyPart {
  exerciseCount: number;
}

export default function ExploreScreen() {
  const [bodyPartsWithCounts, setBodyPartsWithCounts] = useState<BodyPartWithCount[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<BodyPartGroup | 'all'>('all');

  useEffect(() => {
    // Calculate exercise counts for each body part
    const withCounts = BODY_PARTS.map((bp) => ({
      ...bp,
      exerciseCount: getExercisesByBodyPart(bp.id).length,
    }));
    setBodyPartsWithCounts(withCounts);
  }, []);

  const filteredBodyParts = selectedGroup === 'all'
    ? bodyPartsWithCounts
    : bodyPartsWithCounts.filter((bp) => bp.group === selectedGroup);

  const handleBodyPartPress = (bodyPart: BodyPartWithCount) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/bodypart/${bodyPart.id}`);
  };

  const handleGroupPress = (group: BodyPartGroup | 'all') => {
    Haptics.selectionAsync();
    setSelectedGroup(group);
  };

  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={['#0F0F1A', '#1A1A2E', '#16213E']}
      style={styles.container}
    >
      <View style={[styles.safeArea, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Explore</Text>
          <Text style={styles.headerSubtitle}>
            22+ exercises across 15 body parts
          </Text>
        </View>

        {/* Group Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContent}
        >
          <Pressable
            style={[
              styles.filterChip,
              selectedGroup === 'all' && styles.filterChipActive,
            ]}
            onPress={() => handleGroupPress('all')}
          >
            <Text style={[
              styles.filterChipText,
              selectedGroup === 'all' && styles.filterChipTextActive,
            ]}>All</Text>
          </Pressable>

          {Object.entries(BODY_PART_GROUPS).map(([key, group]) => (
            <Pressable
              key={key}
              style={[
                styles.filterChip,
                selectedGroup === key && styles.filterChipActive,
              ]}
              onPress={() => handleGroupPress(key as BodyPartGroup)}
            >
              <Text style={styles.filterIcon}>{group.icon}</Text>
              <Text style={[
                styles.filterChipText,
                selectedGroup === key && styles.filterChipTextActive,
              ]}>{group.name}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Body Parts Grid */}
        <ScrollView
          style={styles.gridScroll}
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.grid}>
            {filteredBodyParts.map((bodyPart, index) => (
              <Animated.View
                key={bodyPart.id}
                entering={FadeInDown.delay(index * 50).springify()}
              >
                <Pressable
                  style={({ pressed }) => [
                    styles.bodyPartCard,
                    pressed && styles.cardPressed,
                    // Remove border color as image defines the look
                    { borderColor: 'rgba(255,255,255,0.1)' }
                  ]}
                  onPress={() => handleBodyPartPress(bodyPart)}
                >
                  <ImageBackground
                    source={BODY_PART_IMAGES[bodyPart.id] || BODY_PART_IMAGES['full-body']}
                    style={styles.cardBackground}
                    imageStyle={styles.cardImage}
                  >
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.95)']}
                      style={styles.cardOverlay}
                    >
                      <View style={styles.cardContent}>
                        <Text style={styles.bodyPartName}>{bodyPart.name}</Text>
                        <Text style={styles.bodyPartDescription} numberOfLines={1}>
                          {bodyPart.description}
                        </Text>

                        <View style={styles.exerciseCountContainer}>
                          <Text style={[styles.exerciseCount, { color: '#FFF' }]}>
                            {bodyPart.exerciseCount}
                          </Text>
                          <Text style={styles.exerciseLabel}>
                            {bodyPart.exerciseCount === 1 ? 'exercise' : 'exercises'}
                          </Text>
                        </View>
                      </View>
                    </LinearGradient>
                  </ImageBackground>
                </Pressable>
              </Animated.View>
            ))}
          </View>

          {/* Bottom padding */}
          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
  },
  filterScroll: {
    flexGrow: 0,
    marginBottom: 16,
  },
  filterContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    gap: 6,
  },
  filterChipActive: {
    backgroundColor: '#8B5CF6',
  },
  filterIcon: {
    fontSize: 16,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 20,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  gridScroll: {
    flex: 1,
  },
  gridContent: {
    paddingHorizontal: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  bodyPartCard: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.2, // Taller aspect ratio
    backgroundColor: '#1E1E2E',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  cardBackground: {
    width: '100%',
    height: '100%',
  },
  cardImage: {
    borderRadius: 20,
  },
  cardOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 12,
  },
  cardContent: {
    gap: 4,
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  // Removed legacy icon styles containing "iconContainer", "bodyPartIcon", "benefitsRow"
  bodyPartName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  bodyPartDescription: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  exerciseCountContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  exerciseCount: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFF',
  },
  exerciseLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
  },
});
