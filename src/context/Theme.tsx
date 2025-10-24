import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors, ThemeColors } from '@/theme/theme';

type Mode = 'light' | 'dark' | 'system';

type ThemeContextType = {
  mode: Mode;
  colors: ThemeColors;
  isDark: boolean;
  setMode: (m: Mode) => void;
  toggleTheme: () => void; // alterna só entre light/dark
};

const STORAGE_KEY = '@mottu_theme_mode';

const ThemeContext = createContext<ThemeContextType>({
  mode: 'system',
  colors: darkColors,
  isDark: true,
  setMode: () => {},
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<Mode>('system');
  const [system, setSystem] = useState<ColorSchemeName>(Appearance.getColorScheme());

  // carrega preferência salva
  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        setModeState(saved);
      }
    })();
  }, []);

  // escuta mudanças do sistema quando em 'system'
  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => setSystem(colorScheme));
    return () => sub.remove();
  }, []);

  const effective = mode === 'system' ? (system ?? 'light') : mode;
  const isDark = effective === 'dark';
  const colors = useMemo<ThemeColors>(() => (isDark ? darkColors : lightColors), [isDark]);

  const setMode = async (m: Mode) => {
    setModeState(m);
    await AsyncStorage.setItem(STORAGE_KEY, m);
  };

  const toggleTheme = () => setMode(effective === 'dark' ? 'light' : 'dark');

  const value = useMemo(() => ({ mode, colors, isDark, setMode, toggleTheme }), [mode, colors, isDark]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
