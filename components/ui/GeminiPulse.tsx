/**
 * GeminiPulse - AI Ready Indicator
 * 
 * A floating pulsing indicator that shows when Gemini AI is ready.
 * Appears near the AI Coach card with animated glow effect.
 */

import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';

import { colors } from '../../constants/theme';

interface GeminiPulseProps {
    isReady?: boolean;     // AI is ready to use
    isLoading?: boolean;   // API is being called
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
}

export function GeminiPulse({
    isReady = true,
    isLoading = false,
    size = 'md',
    showLabel = false,
}: GeminiPulseProps) {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(0.6);

    useEffect(() => {
        if (isReady) {
            // Gentle pulse animation
            scale.value = withRepeat(
                withSequence(
                    withTiming(1.2, { duration: 1000 }),
                    withTiming(1, { duration: 1000 })
                ),
                -1,
                false
            );
            opacity.value = withRepeat(
                withSequence(
                    withTiming(1, { duration: 1000 }),
                    withTiming(0.5, { duration: 1000 })
                ),
                -1,
                false
            );
        } else if (isLoading) {
            // Fast spin animation for loading
            scale.value = withRepeat(
                withSequence(
                    withTiming(0.9, { duration: 300 }),
                    withTiming(1.1, { duration: 300 })
                ),
                -1,
                false
            );
        } else {
            scale.value = 1;
            opacity.value = 0.3;
        }
    }, [isReady, isLoading]);

    const pulseStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    const sizeConfig = {
        sm: { dot: 8, glow: 16 },
        md: { dot: 12, glow: 24 },
        lg: { dot: 16, glow: 32 },
    }[size];

    const color = isReady
        ? colors.neon.green
        : isLoading
            ? colors.neon.yellow
            : colors.text.muted;

    return (
        <View style={styles.container}>
            <View style={styles.pulseContainer}>
                {/* Glow ring */}
                <Animated.View
                    style={[
                        styles.glow,
                        pulseStyle,
                        {
                            width: sizeConfig.glow,
                            height: sizeConfig.glow,
                            borderRadius: sizeConfig.glow / 2,
                            backgroundColor: color,
                        },
                    ]}
                />
                {/* Core dot */}
                <View
                    style={[
                        styles.dot,
                        {
                            width: sizeConfig.dot,
                            height: sizeConfig.dot,
                            borderRadius: sizeConfig.dot / 2,
                            backgroundColor: color,
                        },
                    ]}
                />
            </View>
            {showLabel && (
                <Text style={[styles.label, { color }]}>
                    {isLoading ? 'Thinking...' : isReady ? 'AI Ready' : 'Offline'}
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    pulseContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    glow: {
        position: 'absolute',
        opacity: 0.3,
    },
    dot: {
        shadowColor: '#22FF22',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
        elevation: 4,
    },
    label: {
        fontSize: 10,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
});

export default GeminiPulse;
