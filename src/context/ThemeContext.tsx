"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore } from 'react';

type Theme = 'light' | 'dark';

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  brightness: number;
  setBrightness: (value: number) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_CHANGE_EVENT = 'tindy-theme-change';
const BRIGHTNESS_CHANGE_EVENT = 'tindy-brightness-change';

const getServerThemeSnapshot = (): Theme => 'dark';

const getThemeSnapshot = (): Theme => {
  const theme = document.documentElement.dataset.theme;
  return theme === 'light' || theme === 'dark' ? theme : 'dark';
};

const subscribeTheme = (onStoreChange: () => void) => {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === 'theme') {
      onStoreChange();
    }
  };

  window.addEventListener(THEME_CHANGE_EVENT, onStoreChange);
  window.addEventListener('storage', handleStorage);

  return () => {
    window.removeEventListener(THEME_CHANGE_EVENT, onStoreChange);
    window.removeEventListener('storage', handleStorage);
  };
};

const getServerBrightnessSnapshot = () => 1;

const getBrightnessSnapshot = () => {
  const savedBrightness = window.localStorage.getItem('app-brightness');
  const parsedBrightness = savedBrightness === null ? Number.NaN : Number.parseFloat(savedBrightness);
  return Number.isFinite(parsedBrightness) ? parsedBrightness : 1;
};

const subscribeBrightness = (onStoreChange: () => void) => {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === 'app-brightness') {
      onStoreChange();
    }
  };

  window.addEventListener(BRIGHTNESS_CHANGE_EVENT, onStoreChange);
  window.addEventListener('storage', handleStorage);

  return () => {
    window.removeEventListener(BRIGHTNESS_CHANGE_EVENT, onStoreChange);
    window.removeEventListener('storage', handleStorage);
  };
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useSyncExternalStore(subscribeTheme, getThemeSnapshot, getServerThemeSnapshot);
  const brightness = useSyncExternalStore(subscribeBrightness, getBrightnessSnapshot, getServerBrightnessSnapshot);

  const setTheme = useCallback((nextTheme: Theme) => {
    localStorage.setItem('theme', nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  }, []);

  const setBrightness = useCallback((nextBrightness: number) => {
    localStorage.setItem('app-brightness', nextBrightness.toString());
    window.dispatchEvent(new Event(BRIGHTNESS_CHANGE_EVENT));
  }, []);

  // Keep the pre-hydration theme source of truth in sync.
  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  // Handle brightness as a pure visual filter layer
  useEffect(() => {
    localStorage.setItem('app-brightness', brightness.toString());

    const isDarkened = brightness < 1;
    
    // Apply visual filters (Brightness is purely enhancement layer now)
    const brightnessFilter = `brightness(${brightness})`;
    const contrastFilter =
      theme === 'light'
        ? 'contrast(1)' // keep stable
        : brightness < 1
        ? 'contrast(1.3)'
        : 'contrast(1)';
    
    document.documentElement.style.setProperty('--visual-filter', `${brightnessFilter} ${contrastFilter}`);
    
    // Ambient elements tuning
    const blurIntensity = brightness * 120;
    const glowOpacity = isDarkened ? 0.08 : 0.2 + ((brightness - 1) * 0.5);
    document.documentElement.style.setProperty('--ambient-blur', `${blurIntensity}px`);
    document.documentElement.style.setProperty('--ambient-glow-opacity', glowOpacity.toString());

    // Subtle feedback "breathe"
    document.body.style.transform = 'scale(0.99)';
    const t = setTimeout(() => {
      document.body.style.transform = 'scale(1)';
    }, 150);
    return () => clearTimeout(t);
  }, [brightness, theme]);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [setTheme, theme]);

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme, brightness, setBrightness }),
    [brightness, setBrightness, setTheme, theme, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
