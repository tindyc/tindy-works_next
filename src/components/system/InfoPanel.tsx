"use client";

import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import { SystemStatus } from './SystemStatus';

const systemStatuses = [
  { label: 'SYSTEM_STATUS', value: 'ONLINE' },
  { label: 'ACTIVE_ZONES', value: '3' },
  { label: 'ATMOSPHERE', value: 'CONTROLLED', divider: false },
] as const;

export function InfoPanel() {
  const { theme, toggleTheme } = useTheme();

  return (
    <aside className="order-2 lg:order-none w-full lg:w-[360px] xl:w-[420px] shrink-0 border-t lg:border-t-0 lg:border-l border-[var(--border-subtle)] bg-[var(--bg-base)] p-4 md:p-6 lg:p-8 flex flex-col z-30">
      <h3 className="font-mono text-[10px] text-[var(--text-secondary)] mb-4 border-b border-[var(--border-subtle)] pb-4 tracking-widest uppercase">FLOOR_PLAN_V1</h3>
      <h1 className="font-display text-3xl text-[var(--text-primary)] mt-2 tracking-tighter uppercase font-bold">Explore the Studio</h1>
      <p className="font-sans text-[var(--text-secondary)] mt-4 text-sm leading-relaxed max-w-prose">
        Navigate through the interactive floor plan to discover different zones within the digital studio. Each area represents a distinct discipline and set of ongoing projects.
      </p>

      <div className="mt-6 lg:mt-12 flex flex-col gap-4 border border-[var(--border-subtle)] p-4 md:p-6 bg-[var(--hover-bg)] font-mono">
        {systemStatuses.map((status) => (
          <SystemStatus key={status.label} label={status.label} value={status.value} divider={('divider' in status ? status.divider : true) !== false} />
        ))}
      </div>

      <div className="mt-6 lg:mt-auto pt-6 lg:pt-8">
        <button onClick={toggleTheme} className="flex items-center gap-3 border border-[var(--border-strong)] px-4 py-3 hover:bg-[var(--text-primary)] hover:text-[var(--bg-base)] transition-colors w-full justify-between group">
          <span className="font-mono text-[10px] uppercase tracking-widest group-hover:text-[var(--bg-base)] text-[var(--text-secondary)] transition-colors">LIGHTING: CONTRAST</span>
          <span className="material-symbols-outlined text-[var(--text-primary)] text-sm group-hover:text-[var(--bg-base)] transition-colors">
            {theme === 'dark' ? 'light_mode' : 'dark_mode'}
          </span>
        </button>
      </div>
    </aside>
  );
}