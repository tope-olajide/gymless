/**
 * MuscleGroupGrid - 2-Column Muscle Group Tiles
 * 
 * A grid of muscle group tiles with glass styling and touch glow effects.
 */

import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ImageBackground, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import Animated, {
    FadeInUp,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

import { BODY_PART_IMAGES } from '../../constants/assets';
import { borderRadius, colors, spacing } from '../../constants/theme';

interface MuscleGroup {
    id: string;
    name: string;
    workoutCount?: number;
    color?: string;
}

interface MuscleGroupGridProps {
    title?: string;
    muscleGroups: MuscleGroup[];
    onGroupPress: (group: MuscleGroup) => void;
    style?: ViewStyle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function MuscleGroupTile({
    group,
    index,
    onPress
}: {
    group: MuscleGroup;
    index: number;
    onPress: () => void;
}) {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
        scale.value = withSpring(0.96, { damping: 15 });
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, { damping: 15 });
    };

    // Map generic IDs to specific assets if needed
    const getImage = (id: string) => {
        if (BODY_PART_IMAGES[id]) return BODY_PART_IMAGES[id];
        if (id === 'back') return BODY_PART_IMAGES['upper-back'];
        if (id === 'arms') return BODY_PART_IMAGES['biceps'];
        return BODY_PART_IMAGES['full-body']; // Fallback
    };

    return (
        <AnimatedPressable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={styles.tileWrapper}
        >
            <Animated.View
                entering={FadeInUp.delay(index * 50).springify()}
                style={[styles.tile, animatedStyle]}
            >
                <ImageBackground
                    source={getImage(group.id)}
                    style={styles.imageBackground}
                    imageStyle={styles.imageStyle}
                >
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.9)']}
                        style={styles.gradient}
                    >
                        {/* Name */}
                        <Text style={styles.tileName}>{group.name}</Text>

                        {/* Workout count badge */}
                        {group.workoutCount !== undefined && group.workoutCount > 0 && (
                            <View style={styles.countBadge}>
                                <Text style={styles.countText}>{group.workoutCount}</Text>
                            </View>
                        )}
                    </LinearGradient>
                </ImageBackground>
            </Animated.View>
        </AnimatedPressable>
    );
}

export function MuscleGroupGrid({
    title,
    muscleGroups,
    onGroupPress,
    style,
}: MuscleGroupGridProps) {
    return (
        <View style={[styles.container, style]}>
            {/* Header */}
            {title && <Text style={styles.title}>{title}</Text>}

            {/* Grid */}
            <View style={styles.grid}>
                {muscleGroups.map((group, index) => (
                    <MuscleGroupTile
                        key={group.id}
                        group={group}
                        index={index}
                        onPress={() => onGroupPress(group)}
                    />
                ))}
            </View>
        </View>
    );
}

// Default muscle groups
export const defaultMuscleGroups: MuscleGroup[] = [
    { id: 'chest', name: 'Chest' },
    { id: 'back', name: 'Back' },
    { id: 'legs', name: 'Legs' },
    { id: 'glutes', name: 'Glutes' },
    { id: 'abs', name: 'Core' },
    { id: 'shoulders', name: 'Shoulders' },
    { id: 'arms', name: 'Arms' },
    { id: 'full-body', name: 'Full Body' },
];

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.xl,
        paddingHorizontal: spacing.screenPadding,
    },
    title: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.text.tertiary,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
        marginBottom: spacing.md,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
    },
    tileWrapper: {
        width: '48%', // Approx 2 columns
    },
    tile: {
        height: 120,
        borderRadius: borderRadius.xl,
        overflow: 'hidden',
        backgroundColor: colors.background.elevated,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    imageBackground: {
        width: '100%',
        height: '100%',
    },
    imageStyle: {
        borderRadius: borderRadius.xl,
    },
    gradient: {
        flex: 1,
        padding: spacing.md,
        justifyContent: 'flex-end',
    },
    tileName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
    countBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: colors.neon.cyan,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
        minWidth: 20,
        alignItems: 'center',
    },
    countText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#000',
    },
});

export default MuscleGroupGrid;
