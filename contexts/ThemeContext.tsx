import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { Colors, ThemeMode } from '@/constants/theme';
import { storage } from '@/utils/storage';

interface ThemeContextType {
  theme: ThemeMode;
  colors: typeof Colors.light;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<ThemeMode>('light');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const prefs = await storage.getUserPreferences();
        if (prefs.darkMode !== undefined) {
          setThemeState(prefs.darkMode ? 'dark' : 'light');
        } else if (systemColorScheme) {
          setThemeState(systemColorScheme);
        }
      } catch {
        if (systemColorScheme) {
          setThemeState(systemColorScheme);
        }
      }
      setIsLoaded(true);
    };

    loadTheme();
  }, [systemColorScheme]);

  const setTheme = async (mode: ThemeMode) => {
    setThemeState(mode);
    await storage.saveUserPreferences({ darkMode: mode === 'dark' });
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const colors = theme === 'dark' ? Colors.dark : Colors.light;

  if (!isLoaded) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
