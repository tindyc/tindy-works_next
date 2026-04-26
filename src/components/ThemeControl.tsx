"use client";

import React from 'react';
import { useTheme } from '../context/ThemeContext';

export const ThemeControl: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="fixed bottom-6 right-6 lg:bottom-8 lg:right-12 z-50 flex items-center gap-2 bg-[var(--overlay-bg)] backdrop-blur-md px-3 py-2.5 rounded-full border border-[var(--border-strong)] shadow-[0_8px_24px_var(--shadow-base)] font-mono text-xs text-[var(--text-primary)] transition-all duration-400">
      
      <button 
        onClick={toggleTheme}
        className="flex items-center justify-center w-8 h-8 rounded-full border border-transparent hover:border-[var(--border-strong)] hover:bg-[var(--hover-bg)] transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        aria-label="Toggle Theme"
      >
        <span className="material-symbols-outlined text-[16px]">
          {theme === 'dark' ? 'dark_mode' : 'light_mode'}
        </span>
      </button>
    </div>
  );
};
