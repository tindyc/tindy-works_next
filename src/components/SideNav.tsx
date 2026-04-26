"use client";

import React from 'react';
import { NavLink } from 'react-router-dom';

export function SideNav() {
  return (
    <aside className="fixed left-0 top-0 h-full z-40 hidden lg:flex flex-col pt-24 pb-12 w-24 border-r border-[var(--border-subtle)] bg-[var(--bg-base)] items-center justify-between">
      <div className="flex flex-col gap-8 items-center pt-8">
        <NavLink to="/office" className={({ isActive }) => `flex flex-col items-center gap-2 group cursor-pointer ${isActive ? '*:text-primary *:text-[var(--text-primary)]' : ''}`}>
          <span className="material-symbols-outlined text-[var(--text-secondary)] text-2xl group-hover:text-primary transition-colors duration-300" style={{ fontVariationSettings: "'FILL' 1" }}>desktop_windows</span>
          <span className="font-label-sm text-label-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] [writing-mode:vertical-rl] transform rotate-180 tracking-widest mt-4">OFFICE</span>
        </NavLink>
        <NavLink to="/garden" className={({ isActive }) => `flex flex-col items-center gap-2 group cursor-pointer ${isActive ? '*:text-primary *:text-[var(--text-primary)]' : ''}`}>
          <span className="material-symbols-outlined text-[var(--text-secondary)] text-2xl group-hover:text-primary transition-colors duration-300" style={{ fontVariationSettings: "'FILL' 1" }}>nature_people</span>
          <span className="font-label-sm text-label-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] [writing-mode:vertical-rl] transform rotate-180 tracking-widest mt-4">GARDEN</span>
        </NavLink>
        <NavLink to="/reception" className={({ isActive }) => `flex flex-col items-center gap-2 group cursor-pointer ${isActive ? '*:text-primary *:text-[var(--text-primary)]' : ''}`}>
          <span className="material-symbols-outlined text-[var(--text-secondary)] text-2xl group-hover:text-primary transition-colors duration-300" style={{ fontVariationSettings: "'FILL' 1" }}>groups</span>
          <span className="font-label-sm text-label-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] [writing-mode:vertical-rl] transform rotate-180 tracking-widest mt-4">RECEPTION</span>
        </NavLink>
      </div>
      <div className="flex flex-col items-center gap-6 pb-8">
        <div className="text-center">
          <span className="font-headline-lg text-headline-lg text-[var(--text-primary)] block leading-none">N</span>
          <span className="material-symbols-outlined text-[var(--text-secondary)] mt-2 block">explore</span>
        </div>
        <div className="w-px h-12 bg-[var(--border-subtle)]"></div>
        <div className="text-center font-label-sm text-label-sm text-[var(--text-secondary)] [writing-mode:vertical-rl] transform rotate-180 tracking-widest">
          SCALE 1:100
        </div>
      </div>
    </aside>
  );
}
