/**
 * Settings Screen
 * 
 * Allows users to configure theme and AI coach model preference.
 */

import { Colors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
// AI_MODELS removed as we now use hardcoded Gemini 3 Flash via Firebase
import { storageService, ThemePreference } from '@/services/storage/StorageService';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

const THEME_OPTIONS: { id: ThemePreference; name: string; icon: keyof typeof Ionicons.glyphMap; description: string }[] = [
    { id: 'dark', name: 'Dark Mode', icon: 'moon-outline', description: 'Obsidian glass aesthetic' },
    { id: 'light', name: 'Light Mode', icon: 'sunny-outline', description: 'Arctic frosted blue' },
    { id: 'system', name: 'System', icon: 'settings-outline', description: 'Follow device settings' },
];

export default function SettingsScreen() {
    // Use theme context for theme preference
    const { theme, preference: selectedTheme, setPreference: handleThemeSelect } = useTheme();
    const colors = Colors[theme];
    const cardBg = theme === 'dark' ? '#1e2022' : '#f5f5f5';

    // Advanced AI Settings
    const [customKey, setCustomKey] = useState<string>('');
    const [aiInterval, setAiInterval] = useState<number>(1.5);
    const [showKeyInput, setShowKeyInput] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        const key = await storageService.getCustomGeminiKey();
        const interval = await storageService.getAIInterval();
        setCustomKey(key || '');
        setAiInterval(interval);
    };

    const handleSaveKey = async () => {
        await storageService.setCustomGeminiKey(customKey.trim() || null);
        setShowKeyInput(false);
    };

    const handleIntervalChange = async (value: number) => {
        setAiInterval(value);
        await storageService.setAIInterval(value);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
                </View>

                {/* ============================================================ */}
                {/* THEME SECTION */}
                {/* ============================================================ */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        Appearance
                    </Text>
                    <Text style={[styles.sectionSubtitle, { color: colors.tabIconDefault }]}>
                        Choose your visual theme
                    </Text>

                    {THEME_OPTIONS.map((option) => (
                        <Pressable
                            key={option.id}
                            style={[
                                styles.modelCard,
                                {
                                    backgroundColor: cardBg,
                                    borderColor: selectedTheme === option.id ? '#00FFCC' : 'transparent',
                                    borderWidth: selectedTheme === option.id ? 2 : 0,
                                },
                            ]}
                            onPress={() => handleThemeSelect(option.id)}
                        >
                            <View style={styles.modelHeader}>
                                <View style={styles.modelInfo}>
                                    <View style={styles.themeIconContainer}>
                                        <Ionicons name={option.icon} size={20} color={colors.text} />
                                    </View>
                                    <Text style={[styles.modelName, { color: colors.text }]}>
                                        {option.name}
                                    </Text>
                                </View>
                                {selectedTheme === option.id ? (
                                    <Ionicons name="checkmark-circle" size={24} color="#00FFCC" />
                                ) : (
                                    <View style={[styles.radioOuter, { borderColor: colors.tabIconDefault }]}>
                                        <View style={styles.radioInner} />
                                    </View>
                                )}
                            </View>
                            <Text style={[styles.modelDescription, { color: colors.tabIconDefault }]}>
                                {option.description}
                            </Text>
                        </Pressable>
                    ))}
                </View>

                {/* ============================================================ */}
                {/* AI ENGINE INFO */}
                {/* ============================================================ */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        AI Engine
                    </Text>
                    <View style={[styles.infoBox, { backgroundColor: cardBg, marginTop: 10 }]}>
                        <Ionicons name="flash" size={20} color={colors.tint} />
                        <Text style={[styles.infoText, { color: colors.tabIconDefault }]}>
                            {customKey ? 'Using Custom API Key' : 'Powered by Gemini 3 Flash Preview'}
                        </Text>
                    </View>
                </View>

                {/* ============================================================ */}
                {/* ADVANCED AI CONFIG */}
                {/* ============================================================ */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        Advanced Configuration
                    </Text>

                    {/* Frequency Picker */}
                    <View style={[styles.configCard, { backgroundColor: cardBg }]}>
                        <View style={styles.configHeader}>
                            <Text style={[styles.configLabel, { color: colors.text }]}>Analysis Speed</Text>
                            <Text style={[styles.configValue, { color: colors.tint }]}>{aiInterval.toFixed(1)}s</Text>
                        </View>
                        <Text style={[styles.configDesc, { color: colors.tabIconDefault }]}>
                            Lower is faster but uses more quota.
                        </Text>
                        <View style={styles.pickerRow}>
                            {[1.0, 1.5, 2.0, 3.0, 5.0].map((val) => (
                                <Pressable
                                    key={val}
                                    onPress={() => handleIntervalChange(val)}
                                    style={[
                                        styles.pickerOption,
                                        aiInterval === val && { backgroundColor: colors.tint }
                                    ]}
                                >
                                    <Text style={[
                                        styles.pickerText,
                                        { color: aiInterval === val ? '#000' : colors.text }
                                    ]}>{val}s</Text>
                                </Pressable>
                            ))}
                        </View>
                    </View>

                    {/* API Key Input */}
                    <View style={[styles.configCard, { backgroundColor: cardBg }]}>
                        <Pressable
                            style={styles.configHeader}
                            onPress={() => setShowKeyInput(!showKeyInput)}
                        >
                            <View>
                                <Text style={[styles.configLabel, { color: colors.text }]}>Custom Gemini API Key</Text>
                                <Text style={[styles.configDesc, { color: colors.tabIconDefault }]}>
                                    Override the default app key
                                </Text>
                            </View>
                            <Ionicons name={showKeyInput ? "chevron-up" : "chevron-down"} size={20} color={colors.tabIconDefault} />
                        </Pressable>

                        {showKeyInput && (
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={[styles.input, { color: colors.text, borderColor: colors.tabIconDefault }]}
                                    placeholder="Enter API Key"
                                    placeholderTextColor="gray"
                                    value={customKey}
                                    onChangeText={setCustomKey}
                                    secureTextEntry
                                    autoCapitalize="none"
                                />
                                <Pressable style={[styles.saveBtn, { backgroundColor: colors.tint }]} onPress={handleSaveKey}>
                                    <Text style={styles.saveBtnText}>Save</Text>
                                </Pressable>
                            </View>
                        )}
                    </View>
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
    themeIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 4,
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
    // Config Styles
    configCard: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    configHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    configLabel: {
        fontSize: 16,
        fontWeight: '600',
    },
    configValue: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    configDesc: {
        fontSize: 12,
        marginBottom: 16,
    },
    pickerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
    },
    pickerOption: {
        flex: 1,
        paddingVertical: 8,
        borderRadius: 8,
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    pickerText: {
        fontSize: 14,
        fontWeight: '600',
    },
    inputContainer: {
        marginTop: 10,
        gap: 10,
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
    },
    saveBtn: {
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    saveBtnText: {
        color: '#000',
        fontWeight: 'bold',
    },
});
