/**
 * ModernExerciseCard - Premium Content-on-Image Card
 * 
 * Features:
 * - Full-bleed background image with modern framing
 * - Bottom-up black gradient for text contrast
 * - Glassmorphic badges for difficulty/duration
 * - Bold White Sans-Serif typography
 * - Press animation with Reanimated
 */

import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    ImageBackground,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

import { EXERCISE_IMAGES } from '../../constants/assets';
import { colors, spacing } from '../../constants/theme';

interface ExerciseItem {
    id: string;
    name: string;
    bodyPart?: string;
    reps?: number;
    sets?: number;
    duration?: number;
    level?: string;
    imageUri?: string;
    isLocked?: boolean;
}

interface ModernExerciseCardProps {
    exercise: ExerciseItem;
    index: number;
    onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ModernExerciseCard({
    exercise,
    index,
    onPress,
}: ModernExerciseCardProps) {
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

    // Use local asset if available, otherwise remote or Unsplash fallback
    const imageSource = EXERCISE_IMAGES[exercise.id]
        ? EXERCISE_IMAGES[exercise.id]
        : (exercise.imageUri ? { uri: exercise.imageUri } : { uri: `https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=800&sig=${exercise.id}` });

    return (
        <AnimatedPressable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={exercise.isLocked}
            style={[styles.container, animatedStyle]}
        >
            <ImageBackground
                source={imageSource}
                style={styles.background}
                imageStyle={styles.image}
                resizeMode="cover"
            >
                {/* Dark Gradient Overlay for readability - Transparent to rgba(0,0,0,0.8) */}
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.8)']}
                    style={styles.overlay}
                >
                    <View style={styles.topBadges}>
                        {/* Level Badge (Glassmorphic) */}
                        <View style={styles.glassBadge}>
                            <Text style={styles.badgeText}>
                                {exercise.level || 'Beginner'}
                            </Text>
                        </View>

                        {/* Duration badge if exists */}
                        {exercise.duration && (
                            <View style={[styles.glassBadge, { marginLeft: 6 }]}>
                                <Text style={styles.badgeText}>
                                    ⏱️ {exercise.duration}m
                                </Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.content}>
                        {/* Exercise Name - Bold White Sans-Serif */}
                        <Text style={styles.name}>
                            {exercise.name}
                        </Text>

                        {/* Sub-info */}
                        <Text style={styles.meta}>
                            {exercise.bodyPart || 'Full Body'} • {exercise.reps || 12} Reps
                        </Text>
                    </View>
                </LinearGradient>

                {/* Lock overlay if needed */}
                {exercise.isLocked && (
                    <View style={styles.lockOverlay}>
                        <Text style={styles.lockIcon}>🔒</Text>
                    </View>
                )}
            </ImageBackground>
        </AnimatedPressable>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 160,
        height: 220,
        borderRadius: 20, // Updated to 20
        overflow: 'hidden',
        backgroundColor: colors.background.tertiary,
        borderWidth: 1, // Subtle white border
        borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    background: {
        width: '100%',
        height: '100%',
    },
    image: {
        borderRadius: 20, // Updated to 20
    },
    overlay: {
        flex: 1,
        justifyContent: 'space-between',
        padding: spacing.md,
    },
    topBadges: {
        flexDirection: 'row',
    },
    glassBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#FFF',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    content: {
        marginBottom: 4,
    },
    name: {
        fontSize: 18,
        fontWeight: '800',
        color: '#FFF',
        lineHeight: 22,
    },
    meta: {
        fontSize: 11,
        color: 'rgba(255, 255, 255, 0.7)',
        marginTop: 2,
        fontWeight: '600',
    },
    lockOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20, // Updated to 20
    },
    lockIcon: {
        fontSize: 32,
    },
});

export default ModernExerciseCard;
