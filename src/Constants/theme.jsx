import { useColorScheme } from 'react-native';
import { useState, useEffect } from 'react';
import { AppColors } from 'res/colors';

// Define your theme colors
export const LightTheme = {
  mode: 'light',
  background: AppColors.white,
  text: AppColors.black,
  primary: AppColors.themeColor,
};

export const DarkTheme = {
  mode: 'dark',
  background: AppColors.black,
  text: AppColors.white,
  primary: AppColors.themeColor,
};

// Theme manager hook
export const useAppTheme = (mode = 'device') => {
  const deviceScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState(mode);

  const [theme, setTheme] = useState(
    themeMode === 'light'
      ? LightTheme
      : themeMode === 'dark'
      ? DarkTheme
      : deviceScheme === 'dark'
      ? DarkTheme
      : LightTheme,
  );

  useEffect(() => {
    if (themeMode === 'device') {
      setTheme(deviceScheme === 'dark' ? DarkTheme : LightTheme);
    } else if (themeMode === 'light') {
      setTheme(LightTheme);
    } else if (themeMode === 'dark') {
      setTheme(DarkTheme);
    }
  }, [themeMode, deviceScheme]);

  const toggleTheme = () => {
    setThemeMode(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return { theme, themeMode, setThemeMode, toggleTheme };
};