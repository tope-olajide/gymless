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
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
    BODY_PARTS,
    BODY_PART_GROUPS,
    BodyPart,
    BodyPartGroup
} from '../data/bodyParts';
import { getExercisesByBodyPart } from '../data/exercises';

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

    return (
        <LinearGradient
            colors={['#0F0F1A', '#1A1A2E', '#16213E']}
            style={styles.container}
        >
            <SafeAreaView style={styles.safeArea}>
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
                                        { borderColor: bodyPart.color + '40' },
                                    ]}
                                    onPress={() => handleBodyPartPress(bodyPart)}
                                >
                                    <View style={[styles.iconContainer, { backgroundColor: bodyPart.color + '20' }]}>
                                        <Text style={styles.bodyPartIcon}>{bodyPart.icon}</Text>
                                    </View>
                                    <Text style={styles.bodyPartName}>{bodyPart.name}</Text>
                                    <Text style={styles.bodyPartDescription} numberOfLines={2}>
                                        {bodyPart.description}
                                    </Text>
                                    <View style={styles.exerciseCountContainer}>
                                        <Text style={[styles.exerciseCount, { color: bodyPart.color }]}>
                                            {bodyPart.exerciseCount}
                                        </Text>
                                        <Text style={styles.exerciseLabel}>
                                            {bodyPart.exerciseCount === 1 ? 'exercise' : 'exercises'}
                                        </Text>
                                    </View>

                                    {/* Benefits chips */}
                                    <View style={styles.benefitsRow}>
                                        {bodyPart.benefits.slice(0, 2).map((benefit, i) => (
                                            <View key={i} style={[styles.benefitChip, { backgroundColor: bodyPart.color + '15' }]}>
                                                <Text style={[styles.benefitText, { color: bodyPart.color }]}>
                                                    {benefit}
                                                </Text>
                                            </View>
                                        ))}
                                    </View>
                                </Pressable>
                            </Animated.View>
                        ))}
                    </View>

                    {/* Bottom padding */}
                    <View style={{ height: 40 }} />
                </ScrollView>
            </SafeAreaView>
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
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
    },
    cardPressed: {
        opacity: 0.7,
        transform: [{ scale: 0.98 }],
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    bodyPartIcon: {
        fontSize: 24,
    },
    bodyPartName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    bodyPartDescription: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.5)',
        lineHeight: 16,
        marginBottom: 12,
    },
    exerciseCountContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 4,
        marginBottom: 12,
    },
    exerciseCount: {
        fontSize: 24,
        fontWeight: '800',
    },
    exerciseLabel: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.4)',
    },
    benefitsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 4,
    },
    benefitChip: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    benefitText: {
        fontSize: 10,
        fontWeight: '600',
    },
});
