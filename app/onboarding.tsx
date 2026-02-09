/**
 * Onboarding Quiz Screen
 * 
 * 4-question quick quiz (60-90 seconds):
 * 1. Primary Goal
 * 2. Experience Level  
 * 3. Weekly Availability
 * 4. Limitations (optional)
 */

import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { storageService, UserPreferences } from '../services/storage/StorageService';

const { width, height } = Dimensions.get('window');

// Quiz data
const GOALS = [
    { id: 'belly-fat', label: 'Lose Belly Fat', icon: '🔥', color: '#F97316' },
    { id: 'glutes', label: 'Build Bigger Glutes', icon: '🍑', color: '#EC4899' },
    { id: 'upper-body', label: 'Upper Body Strength', icon: '💪', color: '#22C55E' },
    { id: 'core', label: 'Core Power', icon: '🎯', color: '#F59E0B' },
    { id: 'all-rounder', label: 'All-Rounder', icon: '⚡', color: '#8B5CF6' },
];

const EXPERIENCE_LEVELS = [
    { id: 'beginner', label: 'Beginner', description: 'New to exercise or getting back into it', icon: '🌱' },
    { id: 'intermediate', label: 'Intermediate', description: 'Exercise 2-3 times per week', icon: '💫' },
    { id: 'advanced', label: 'Advanced', description: 'Consistent training, looking for challenges', icon: '🚀' },
];

const WEEKLY_AVAILABILITY = [
    { id: '1-3', label: '1-3 days', description: 'Light commitment', icon: '📅' },
    { id: '4-5', label: '4-5 days', description: 'Solid routine', icon: '🗓️' },
    { id: '6-7', label: '6-7 days', description: 'Maximum gains', icon: '📆' },
];

const LIMITATIONS = [
    { id: 'knee', label: 'Knee Issues', icon: '🦵' },
    { id: 'lower-back', label: 'Lower Back Sensitivity', icon: '🔙' },
    { id: 'shoulder', label: 'Shoulder Problems', icon: '💪' },
    { id: 'none', label: 'No Limitations', icon: '✅' },
];

interface QuizState {
    primaryGoals: string[];
    experienceLevel: string;
    weeklyAvailability: string;
    limitations: string[];
}

export default function OnboardingScreen() {
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState<QuizState>({
        primaryGoals: [],
        experienceLevel: '',
        weeklyAvailability: '',
        limitations: [],
    });

    const fadeAnim = useRef(new Animated.Value(1)).current;
    const slideAnim = useRef(new Animated.Value(0)).current;

    const totalSteps = 5; // Welcome + 4 questions
    const progress = (step + 1) / totalSteps;

    const animateTransition = (toStep: number) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: -50,
                duration: 150,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setStep(toStep);
            slideAnim.setValue(50);
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        });
    };

    const handleNext = () => {
        if (step < totalSteps - 1) {
            animateTransition(step + 1);
        } else {
            completeOnboarding();
        }
    };

    const handleBack = () => {
        if (step > 0) {
            animateTransition(step - 1);
        }
    };

    const toggleGoal = (goalId: string) => {
        Haptics.selectionAsync();
        setAnswers(prev => ({
            ...prev,
            primaryGoals: prev.primaryGoals.includes(goalId)
                ? prev.primaryGoals.filter(g => g !== goalId)
                : [...prev.primaryGoals, goalId],
        }));
    };

    const toggleLimitation = (limitId: string) => {
        Haptics.selectionAsync();
        if (limitId === 'none') {
            setAnswers(prev => ({ ...prev, limitations: ['none'] }));
        } else {
            setAnswers(prev => ({
                ...prev,
                limitations: prev.limitations.includes(limitId)
                    ? prev.limitations.filter(l => l !== limitId)
                    : [...prev.limitations.filter(l => l !== 'none'), limitId],
            }));
        }
    };

    const selectExperience = (level: string) => {
        Haptics.selectionAsync();
        setAnswers(prev => ({ ...prev, experienceLevel: level }));
    };

    const selectAvailability = (availability: string) => {
        Haptics.selectionAsync();
        setAnswers(prev => ({ ...prev, weeklyAvailability: availability }));
    };

    const completeOnboarding = async () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        const preferences: UserPreferences = {
            primaryGoals: answers.primaryGoals.length > 0 ? answers.primaryGoals : ['all-rounder'],
            experienceLevel: (answers.experienceLevel || 'beginner') as 'beginner' | 'intermediate' | 'advanced',
            weeklyAvailability: (answers.weeklyAvailability || '4-5') as '1-3' | '4-5' | '6-7',
            limitations: answers.limitations.length > 0 ? answers.limitations : ['none'],
            onboardingCompletedAt: new Date().toISOString(),
        };

        await storageService.saveUserPreferences(preferences);
        await storageService.setOnboardingCompleted();

        router.replace('/');
    };

    const canProceed = () => {
        switch (step) {
            case 0: return true; // Welcome
            case 1: return answers.primaryGoals.length > 0;
            case 2: return answers.experienceLevel !== '';
            case 3: return answers.weeklyAvailability !== '';
            case 4: return true; // Limitations are optional
            default: return false;
        }
    };

    const getMotivationalText = () => {
        if (answers.primaryGoals.includes('glutes')) {
            return 'Great choice! Glute training also improves posture and lower back strength 💪';
        }
        if (answers.primaryGoals.includes('belly-fat')) {
            return 'Perfect! Core-focused workouts combined with full-body moves work best 🔥';
        }
        return '';
    };

    const renderStep = () => {
        switch (step) {
            case 0:
                return renderWelcome();
            case 1:
                return renderGoals();
            case 2:
                return renderExperience();
            case 3:
                return renderAvailability();
            case 4:
                return renderLimitations();
            default:
                return null;
        }
    };

    const renderWelcome = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.welcomeEmoji}>🏋️‍♀️</Text>
            <Text style={styles.welcomeTitle}>Welcome to Gymless</Text>
            <Text style={styles.welcomeSubtitle}>
                Your AI-powered fitness coach for home workouts
            </Text>
            <View style={styles.welcomeFeatures}>
                <Text style={styles.featureItem}>✨ Real-time form feedback</Text>
                <Text style={styles.featureItem}>🎯 Personalized recommendations</Text>
                <Text style={styles.featureItem}>📊 Track your progress</Text>
            </View>
            <Text style={styles.welcomePrompt}>
                Let's personalize your experience
            </Text>
        </View>
    );

    const renderGoals = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>What's your main goal?</Text>
            <Text style={styles.stepSubtitle}>Select one or more</Text>

            <View style={styles.optionsGrid}>
                {GOALS.map(goal => (
                    <Pressable
                        key={goal.id}
                        style={[
                            styles.goalCard,
                            answers.primaryGoals.includes(goal.id) && styles.goalCardSelected,
                            { borderColor: answers.primaryGoals.includes(goal.id) ? goal.color : 'rgba(255,255,255,0.1)' },
                        ]}
                        onPress={() => toggleGoal(goal.id)}
                    >
                        <Text style={styles.goalIcon}>{goal.icon}</Text>
                        <Text style={styles.goalLabel}>{goal.label}</Text>
                    </Pressable>
                ))}
            </View>

            {getMotivationalText() && (
                <View style={styles.motivationalBox}>
                    <Text style={styles.motivationalText}>{getMotivationalText()}</Text>
                </View>
            )}
        </View>
    );

    const renderExperience = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Your experience level?</Text>
            <Text style={styles.stepSubtitle}>We'll adjust intensity accordingly</Text>

            <View style={styles.optionsList}>
                {EXPERIENCE_LEVELS.map(level => (
                    <Pressable
                        key={level.id}
                        style={[
                            styles.levelCard,
                            answers.experienceLevel === level.id && styles.levelCardSelected,
                        ]}
                        onPress={() => selectExperience(level.id)}
                    >
                        <Text style={styles.levelIcon}>{level.icon}</Text>
                        <View style={styles.levelTextContainer}>
                            <Text style={styles.levelLabel}>{level.label}</Text>
                            <Text style={styles.levelDescription}>{level.description}</Text>
                        </View>
                        {answers.experienceLevel === level.id && (
                            <Text style={styles.checkmark}>✓</Text>
                        )}
                    </Pressable>
                ))}
            </View>
        </View>
    );

    const renderAvailability = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>How often can you train?</Text>
            <Text style={styles.stepSubtitle}>We'll build your schedule around this</Text>

            <View style={styles.optionsList}>
                {WEEKLY_AVAILABILITY.map(option => (
                    <Pressable
                        key={option.id}
                        style={[
                            styles.levelCard,
                            answers.weeklyAvailability === option.id && styles.levelCardSelected,
                        ]}
                        onPress={() => selectAvailability(option.id)}
                    >
                        <Text style={styles.levelIcon}>{option.icon}</Text>
                        <View style={styles.levelTextContainer}>
                            <Text style={styles.levelLabel}>{option.label}</Text>
                            <Text style={styles.levelDescription}>{option.description}</Text>
                        </View>
                        {answers.weeklyAvailability === option.id && (
                            <Text style={styles.checkmark}>✓</Text>
                        )}
                    </Pressable>
                ))}
            </View>
        </View>
    );

    const renderLimitations = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Any limitations?</Text>
            <Text style={styles.stepSubtitle}>We'll suggest safe modifications</Text>

            <View style={styles.optionsGrid}>
                {LIMITATIONS.map(limit => (
                    <Pressable
                        key={limit.id}
                        style={[
                            styles.limitCard,
                            answers.limitations.includes(limit.id) && styles.limitCardSelected,
                        ]}
                        onPress={() => toggleLimitation(limit.id)}
                    >
                        <Text style={styles.limitIcon}>{limit.icon}</Text>
                        <Text style={styles.limitLabel}>{limit.label}</Text>
                    </Pressable>
                ))}
            </View>

            <View style={styles.finalPrompt}>
                <Text style={styles.finalPromptText}>
                    🎉 You're all set! Let's start your first workout
                </Text>
            </View>
        </View>
    );

    const insets = useSafeAreaInsets();

    return (
        <LinearGradient
            colors={['#0F0F1A', '#1A1A2E', '#16213E']}
            style={styles.container}
        >
            <View style={[
                styles.safeArea,
                { paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 16) }
            ]}>
                {/* Progress bar */}
                <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                        <Animated.View
                            style={[
                                styles.progressFill,
                                { width: `${progress * 100}%` }
                            ]}
                        />
                    </View>
                    <Text style={styles.progressText}>{step + 1} of {totalSteps}</Text>
                </View>

                {/* Step content */}
                <Animated.View
                    style={[
                        styles.contentContainer,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateX: slideAnim }],
                        },
                    ]}
                >
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {renderStep()}
                    </ScrollView>
                </Animated.View>

                {/* Navigation buttons */}
                <View style={styles.buttonContainer}>
                    {step > 0 && (
                        <Pressable style={styles.backButton} onPress={handleBack}>
                            <Text style={styles.backButtonText}>← Back</Text>
                        </Pressable>
                    )}

                    <Pressable
                        style={[
                            styles.nextButton,
                            !canProceed() && styles.nextButtonDisabled,
                            step === 0 && styles.nextButtonFull,
                        ]}
                        onPress={handleNext}
                        disabled={!canProceed()}
                    >
                        <LinearGradient
                            colors={canProceed() ? ['#8B5CF6', '#6366F1'] : ['#374151', '#374151']}
                            style={styles.nextButtonGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <Text style={styles.nextButtonText}>
                                {step === 0 ? "Let's Go!" : step === totalSteps - 1 ? 'Start Training' : 'Continue'}
                            </Text>
                        </LinearGradient>
                    </Pressable>
                </View>
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
    progressContainer: {
        paddingHorizontal: 24,
        paddingTop: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    progressBar: {
        flex: 1,
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#8B5CF6',
        borderRadius: 2,
    },
    progressText: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12,
        fontWeight: '600',
    },
    contentContainer: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 32,
    },
    stepContainer: {
        flex: 1,
    },

    // Welcome screen
    welcomeEmoji: {
        fontSize: 64,
        textAlign: 'center',
        marginBottom: 24,
    },
    welcomeTitle: {
        fontSize: 32,
        fontWeight: '700',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 12,
    },
    welcomeSubtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.6)',
        textAlign: 'center',
        marginBottom: 32,
    },
    welcomeFeatures: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        padding: 20,
        marginBottom: 32,
    },
    featureItem: {
        fontSize: 16,
        color: '#FFFFFF',
        marginBottom: 12,
    },
    welcomePrompt: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.5)',
        textAlign: 'center',
    },

    // Steps
    stepTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    stepSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.5)',
        marginBottom: 24,
    },

    // Goals grid
    optionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    goalCard: {
        width: (width - 60) / 2,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    goalCardSelected: {
        backgroundColor: 'rgba(139,92,246,0.15)',
    },
    goalIcon: {
        fontSize: 32,
        marginBottom: 8,
    },
    goalLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
        textAlign: 'center',
    },

    // Experience/Availability cards
    optionsList: {
        gap: 12,
    },
    levelCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        padding: 16,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    levelCardSelected: {
        backgroundColor: 'rgba(139,92,246,0.15)',
        borderColor: '#8B5CF6',
    },
    levelIcon: {
        fontSize: 28,
        marginRight: 16,
    },
    levelTextContainer: {
        flex: 1,
    },
    levelLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    levelDescription: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.5)',
    },
    checkmark: {
        fontSize: 20,
        color: '#8B5CF6',
        fontWeight: '700',
    },

    // Limitations
    limitCard: {
        width: (width - 60) / 2,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    limitCardSelected: {
        backgroundColor: 'rgba(139,92,246,0.15)',
        borderColor: '#8B5CF6',
    },
    limitIcon: {
        fontSize: 28,
        marginBottom: 8,
    },
    limitLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#FFFFFF',
        textAlign: 'center',
    },

    // Motivational box
    motivationalBox: {
        marginTop: 24,
        backgroundColor: 'rgba(139,92,246,0.1)',
        borderRadius: 12,
        padding: 16,
        borderLeftWidth: 3,
        borderLeftColor: '#8B5CF6',
    },
    motivationalText: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        lineHeight: 20,
    },

    // Final prompt
    finalPrompt: {
        marginTop: 32,
        alignItems: 'center',
    },
    finalPromptText: {
        fontSize: 16,
        color: '#FFFFFF',
        textAlign: 'center',
    },

    // Buttons
    buttonContainer: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        paddingBottom: 32,
        paddingTop: 16,
        gap: 12,
    },
    backButton: {
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    backButtonText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 16,
        fontWeight: '600',
    },
    nextButton: {
        flex: 1,
        borderRadius: 16,
        overflow: 'hidden',
    },
    nextButtonFull: {
        flex: 1,
    },
    nextButtonDisabled: {
        opacity: 0.5,
    },
    nextButtonGradient: {
        paddingVertical: 16,
        paddingHorizontal: 32,
        alignItems: 'center',
    },
    nextButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
});
