"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  brightness: number;
  setBrightness: (value: number) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const initialTheme = typeof document !== 'undefined' ? document.documentElement.dataset.theme : null;
    return initialTheme === 'light' || initialTheme === 'dark' ? initialTheme : 'dark';
  });
  const [brightness, setBrightness] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const savedBrightness = window.localStorage.getItem('app-brightness');
      const parsedBrightness = savedBrightness === null ? Number.NaN : Number.parseFloat(savedBrightness);
      if (Number.isFinite(parsedBrightness)) {
        return parsedBrightness;
      }
    }
    return 1;
  });

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

  const toggleTheme = () => {
    setTheme(currentTheme => currentTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, brightness, setBrightness }}>
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
