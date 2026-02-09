/**
 * GlassCard - Premium Glassmorphism Card Component
 * 
 * A reusable glass-effect card with:
 * - Translucent background with subtle blur
 * - Neon glow border option
 * - Touch feedback with ripple glow
 */

import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    Platform,
    Pressable,
    StyleSheet,
    View,
    ViewStyle
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';

import { colors, glassStyles, hexToRgba } from '../../constants/theme';

interface GlassCardProps {
    children: React.ReactNode;
    variant?: 'default' | 'hero' | 'subtle';
    glowColor?: string;          // Neon accent color for border glow
    onPress?: () => void;
    disabled?: boolean;
    style?: ViewStyle;
    contentStyle?: ViewStyle;
    intensity?: number;          // Blur intensity (0-100), default 20
    animated?: boolean;          // Enable press animation
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function GlassCard({
    children,
    variant = 'default',
    glowColor,
    onPress,
    disabled = false,
    style,
    contentStyle,
    intensity = 20,
    animated = true,
}: GlassCardProps) {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);

    const handlePressIn = () => {
        if (animated && onPress) {
            scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
            opacity.value = withTiming(0.8, { duration: 100 });
        }
    };

    const handlePressOut = () => {
        if (animated) {
            scale.value = withSpring(1, { damping: 15, stiffness: 300 });
            opacity.value = withTiming(1, { duration: 150 });
        }
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    // Get base style from variant
    const baseStyle = variant === 'hero'
        ? glassStyles.hero
        : variant === 'subtle'
            ? { ...glassStyles.card, backgroundColor: colors.glass.light }
            : glassStyles.card;

    // Build border style with optional glow
    const borderStyle: ViewStyle = glowColor
        ? {
            borderColor: hexToRgba(glowColor, 0.4),
            // Shadow for glow effect
            shadowColor: glowColor,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.4,
            shadowRadius: 12,
            elevation: 6,
        }
        : {};

    const cardContent = (
        <View style={[styles.content, contentStyle]}>
            {children}
        </View>
    );

    // iOS: Use BlurView for true glass effect
    // Android: Use gradient overlay for similar appearance
    const renderCardInner = () => {
        if (Platform.OS === 'ios') {
            return (
                <BlurView
                    intensity={intensity}
                    tint="dark"
                    style={[
                        styles.blurContainer,
                        baseStyle,
                        borderStyle,
                        style,
                    ]}
                >
                    {cardContent}
                </BlurView>
            );
        }

        // Android fallback with gradient
        return (
            <View style={[
                styles.androidContainer,
                baseStyle,
                borderStyle,
                style,
            ]}>
                <LinearGradient
                    colors={[
                        'rgba(255, 255, 255, 0.08)',
                        'rgba(255, 255, 255, 0.02)',
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                />
                {cardContent}
            </View>
        );
    };

    if (onPress) {
        return (
            <AnimatedPressable
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={disabled}
                style={[animatedStyle, disabled && styles.disabled]}
            >
                {renderCardInner()}
            </AnimatedPressable>
        );
    }

    return renderCardInner();
}

const styles = StyleSheet.create({
    blurContainer: {
        overflow: 'hidden',
    },
    androidContainer: {
        overflow: 'hidden',
    },
    content: {
        padding: 16,
    },
    disabled: {
        opacity: 0.5,
    },
});

export default GlassCard;
