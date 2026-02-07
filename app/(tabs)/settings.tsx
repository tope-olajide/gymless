/**
 * Settings Screen
 * 
 * Allows users to configure their AI coach model preference.
 */

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AI_MODELS, AIModelId } from '@/services/ai/GeminiService';
import { storageService } from '@/services/storage/StorageService';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

export default function SettingsScreen() {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'dark'];
    const cardBg = colorScheme === 'dark' ? '#1e2022' : '#f5f5f5';

    const [selectedModel, setSelectedModel] = useState<string>('gemini-2.5-flash');
    const [loading, setLoading] = useState(true);

    // Load saved preference
    useEffect(() => {
        const loadPreference = async () => {
            const model = await storageService.getAIModelPreference();
            setSelectedModel(model);
            setLoading(false);
        };
        loadPreference();
    }, []);

    // Save preference when changed
    const handleModelSelect = useCallback(async (modelId: string) => {
        const model = AI_MODELS[modelId as AIModelId];
        if (!model?.available) return;

        setSelectedModel(modelId);
        await storageService.setAIModelPreference(modelId);
    }, []);

    const availableModels = Object.values(AI_MODELS).filter(m => m.available);
    const comingSoonModels = Object.values(AI_MODELS).filter(m => !m.available);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
                </View>

                {/* AI Model Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        AI Coach Model
                    </Text>
                    <Text style={[styles.sectionSubtitle, { color: colors.tabIconDefault }]}>
                        Choose your preferred AI for coaching and tips
                    </Text>

                    {/* Available Models */}
                    {availableModels.map((model) => (
                        <Pressable
                            key={model.id}
                            style={[
                                styles.modelCard,
                                {
                                    backgroundColor: cardBg,
                                    borderColor: selectedModel === model.id ? colors.tint : 'transparent',
                                    borderWidth: selectedModel === model.id ? 2 : 0,
                                },
                            ]}
                            onPress={() => handleModelSelect(model.id)}
                        >
                            <View style={styles.modelHeader}>
                                <View style={styles.modelInfo}>
                                    <Text style={[styles.modelName, { color: colors.text }]}>
                                        {model.name}
                                    </Text>
                                    {model.id === 'gemini-2.5-flash' && (
                                        <View style={[styles.badge, { backgroundColor: colors.tint }]}>
                                            <Text style={styles.badgeText}>Recommended</Text>
                                        </View>
                                    )}
                                    {model.id === 'gemini-3-flash-preview' && (
                                        <View style={[styles.badge, { backgroundColor: '#9333ea' }]}>
                                            <Text style={styles.badgeText}>Preview</Text>
                                        </View>
                                    )}
                                </View>
                                {selectedModel === model.id ? (
                                    <Ionicons name="checkmark-circle" size={24} color={colors.tint} />
                                ) : (
                                    <View style={[styles.radioOuter, { borderColor: colors.tabIconDefault }]}>
                                        <View style={styles.radioInner} />
                                    </View>
                                )}
                            </View>
                            <Text style={[styles.modelDescription, { color: colors.tabIconDefault }]}>
                                {model.description}
                            </Text>
                        </Pressable>
                    ))}
                </View>

                {/* Coming Soon Section */}
                <View style={styles.section}>
                    <View style={styles.comingSoonHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>
                            Coming Soon
                        </Text>
                        <View style={[styles.tierBadge, { backgroundColor: colors.tabIconDefault }]}>
                            <Ionicons name="information-circle-outline" size={14} color="#fff" />
                            <Text style={styles.tierBadgeText}>Tier-2 API Key Required</Text>
                        </View>
                    </View>

                    {comingSoonModels.map((model) => (
                        <View
                            key={model.id}
                            style={[
                                styles.modelCard,
                                styles.disabledCard,
                                { backgroundColor: cardBg },
                            ]}
                        >
                            <View style={styles.modelHeader}>
                                <View style={styles.modelInfo}>
                                    <Text style={[styles.modelName, { color: colors.tabIconDefault }]}>
                                        {model.name}
                                    </Text>
                                    <Ionicons name="lock-closed" size={16} color={colors.tabIconDefault} />
                                </View>
                            </View>
                            <Text style={[styles.modelDescription, { color: colors.tabIconDefault, opacity: 0.6 }]}>
                                {model.description}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Info Footer */}
                <View style={[styles.infoBox, { backgroundColor: cardBg }]}>
                    <Ionicons name="sparkles" size={20} color={colors.tint} />
                    <Text style={[styles.infoText, { color: colors.tabIconDefault }]}>
                        Gemini 3 Flash Preview uses Agentic Vision for advanced movement coaching analysis.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingTop: 60,
    },
    header: {
        marginBottom: 30,
    },
    title: {
        fontSize: 34,
        fontWeight: '700',
    },
    section: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
    },
    sectionSubtitle: {
        fontSize: 14,
        marginBottom: 16,
    },
    modelCard: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    disabledCard: {
        opacity: 0.6,
    },
    modelHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    modelInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    modelName: {
        fontSize: 16,
        fontWeight: '600',
    },
    modelDescription: {
        fontSize: 14,
        lineHeight: 20,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    badgeText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '600',
    },
    radioOuter: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    comingSoonHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    tierBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    tierBadgeText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '500',
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        padding: 16,
        borderRadius: 12,
        marginTop: 10,
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        lineHeight: 20,
    },
});
