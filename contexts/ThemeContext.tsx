/**
 * Theme Context
 * 
 * Provides app-wide theme control that:
 * - Reads saved preference from storage
 * - Overrides system useColorScheme when user selects specific theme
 * - Exposes theme setter for settings page
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import { storageService, ThemePreference } from '../services/storage/StorageService';

// Context type
interface ThemeContextType {
    theme: 'light' | 'dark';           // Resolved theme (never 'system')
    preference: ThemePreference;        // User's preference (can be 'system')
    setPreference: (pref: ThemePreference) => Promise<void>;
    isLoading: boolean;
}

// Create context with defaults
const ThemeContext = createContext<ThemeContextType>({
    theme: 'dark',
    preference: 'system',
    setPreference: async () => { },
    isLoading: true,
});

// Provider component
export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const systemColorScheme = useSystemColorScheme();
    const [preference, setPreferenceState] = useState<ThemePreference>('system');
    const [isLoading, setIsLoading] = useState(true);

    // Load saved preference on mount
    useEffect(() => {
        const loadPreference = async () => {
            const saved = await storageService.getThemePreference();
            setPreferenceState(saved);
            setIsLoading(false);
        };
        loadPreference();
    }, []);

    // Resolve the actual theme based on preference
    const resolvedTheme: 'light' | 'dark' =
        preference === 'system'
            ? (systemColorScheme ?? 'dark')
            : preference;

    // Set preference with storage persistence
    const setPreference = async (pref: ThemePreference) => {
        setPreferenceState(pref);
        await storageService.setThemePreference(pref);
    };

    return (
        <ThemeContext.Provider
            value={{
                theme: resolvedTheme,
                preference,
                setPreference,
                isLoading,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
}

// Hook to use theme
export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

// Drop-in replacement for useColorScheme that respects user preference
export function useColorScheme(): 'light' | 'dark' {
    const { theme } = useTheme();
    return theme;
}

export default ThemeContext;
