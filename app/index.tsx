import React from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
    FadeInDown,
    FadeInUp,
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withRepeat,
    withSequence
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function LandingScreen() {
    const router = useRouter();

    // Animated pulse for the hero text
    const scale = useSharedValue(1);

    React.useEffect(() => {
        scale.value = withRepeat(
            withSequence(
                withSpring(1.02, { damping: 2 }),
                withSpring(1, { damping: 2 })
            ),
            -1,
            false
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }]
    }));

    return (
        <View style={styles.container}>
            {/* Hero Section */}
            <Animated.View
                entering={FadeInUp.delay(200).springify()}
                style={[styles.heroSection, animatedStyle]}
            >
                <Text style={styles.heroTitle}>Master Your</Text>
                <Text style={styles.heroTitleAccent}>Push-Up</Text>
                <Text style={styles.heroSubtitle}>
                    AI-powered form coaching{'\n'}with real-time feedback
                </Text>
            </Animated.View>

            {/* Mode Selection Cards */}
            <View style={styles.modesContainer}>
                <Animated.View entering={FadeInDown.delay(400).springify()}>
                    <Pressable
                        style={({ pressed }) => [
                            styles.modeCard,
                            styles.timerCard,
                            pressed && styles.cardPressed
                        ]}
                        onPress={() => router.push('/timer')}
                    >
                        <View style={styles.cardIcon}>
                            <Text style={styles.iconText}>⏱️</Text>
                        </View>
                        <Text style={styles.cardTitle}>Quick Timer</Text>
                        <Text style={styles.cardDescription}>
                            Simple rep counter with rest periods. Tap to count your push-ups.
                        </Text>
                        <View style={styles.featureList}>
                            <Text style={styles.feature}>• 60fps countdown</Text>
                            <Text style={styles.feature}>• Set tracking</Text>
                            <Text style={styles.feature}>• Rest timer</Text>
                        </View>
                    </Pressable>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(600).springify()}>
                    <Pressable
                        style={({ pressed }) => [
                            styles.modeCard,
                            styles.coachCard,
                            pressed && styles.cardPressed
                        ]}
                        onPress={() => router.push('/coach')}
                    >
                        <View style={[styles.cardIcon, styles.coachIcon]}>
                            <Text style={styles.iconText}>🤖</Text>
                        </View>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>AI POWERED</Text>
                        </View>
                        <Text style={styles.cardTitle}>AI Coach</Text>
                        <Text style={styles.cardDescription}>
                            Real-time form analysis with voice coaching from Gemini AI.
                        </Text>
                        <View style={styles.featureList}>
                            <Text style={styles.feature}>• Pose detection</Text>
                            <Text style={styles.feature}>• Form validation</Text>
                            <Text style={styles.feature}>• Voice feedback</Text>
                        </View>
                    </Pressable>
                </Animated.View>
            </View>

            {/* Footer */}
            <Animated.View
                entering={FadeInUp.delay(800).springify()}
                style={styles.footer}
            >
                <Text style={styles.footerText}>
                    Start with 10 reps, 3 sets
                </Text>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 40,
    },
    heroSection: {
        alignItems: 'center',
        marginBottom: 40,
    },
    heroTitle: {
        fontSize: 42,
        fontWeight: '300',
        color: '#fff',
        letterSpacing: 1,
    },
    heroTitleAccent: {
        fontSize: 56,
        fontWeight: '900',
        color: '#fff',
        letterSpacing: -1,
        marginBottom: 16,
        textShadowColor: '#00ff88',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 20,
    },
    heroSubtitle: {
        fontSize: 16,
        color: '#888',
        textAlign: 'center',
        lineHeight: 24,
    },
    modesContainer: {
        flex: 1,
        gap: 20,
    },
    modeCard: {
        backgroundColor: '#111',
        borderRadius: 24,
        padding: 24,
        borderWidth: 2,
        borderColor: '#222',
    },
    timerCard: {
        borderColor: '#00aaff',
    },
    coachCard: {
        borderColor: '#00ff88',
        position: 'relative',
    },
    cardPressed: {
        opacity: 0.7,
        transform: [{ scale: 0.98 }],
    },
    cardIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#1a1a1a',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    coachIcon: {
        backgroundColor: '#001a0f',
    },
    iconText: {
        fontSize: 32,
    },
    badge: {
        position: 'absolute',
        top: 16,
        right: 16,
        backgroundColor: '#00ff88',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '900',
        color: '#000',
        letterSpacing: 1,
    },
    cardTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#fff',
        marginBottom: 8,
    },
    cardDescription: {
        fontSize: 14,
        color: '#888',
        lineHeight: 20,
        marginBottom: 16,
    },
    featureList: {
        gap: 6,
    },
    feature: {
        fontSize: 13,
        color: '#aaa',
    },
    footer: {
        alignItems: 'center',
        marginTop: 20,
    },
    footerText: {
        fontSize: 14,
        color: '#555',
        fontWeight: '600',
    },
});
