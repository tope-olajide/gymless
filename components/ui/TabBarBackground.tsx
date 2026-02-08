// This is a reusable component for the tab bar background with glassmorphism
import { colors } from '@/constants/theme';
import { BlurView } from 'expo-blur';
import { Platform, StyleSheet, View } from 'react-native';

export default function TabBarBackground() {
    return (
        <View style={styles.container}>
            {Platform.OS === 'ios' ? (
                <BlurView
                    tint="systemChromeMaterialDark"
                    intensity={80}
                    style={StyleSheet.absoluteFill}
                />
            ) : (
                <View style={[styles.androidBackground]} />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        overflow: 'hidden',
        backgroundColor: Platform.select({
            ios: 'transparent',
            default: colors.glass.medium, // Fallback for Android
        }),
        borderTopWidth: 1,
        borderTopColor: colors.glass.border,
    },
    androidBackground: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: colors.background.elevated,
        opacity: 0.9,
    },
});
