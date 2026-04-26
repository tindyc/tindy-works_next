"use client";

import { NavLink } from 'react-router-dom';

export function Cats() {
  return (
    <main className="flex-grow w-full max-w-[1440px] mx-auto border-x border-[var(--border-subtle)] flex flex-col bg-[var(--bg-base)] min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-88px)] mt-[64px] md:mt-[88px]">
      <header className="p-8 md:p-16 border-b border-[var(--border-subtle)]">
        <p className="font-mono text-[10px] md:text-xs uppercase tracking-[0.16em] text-[var(--text-secondary)] mb-4">
          TINDY_WORKS // CATS
        </p>
        <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tighter uppercase text-[var(--text-primary)] mb-4">
          Cat Gallery
        </h1>
        <p className="text-sm md:text-base text-[var(--text-secondary)] max-w-2xl leading-relaxed">
          A dedicated cat corner in the studio. For now, jump to the Garden to explore cat-friendly plants and growth updates.
        </p>
      </header>

      <section className="p-8 md:p-16 flex-grow flex items-center justify-center">
        <div className="w-full max-w-xl border border-[var(--border-strong)] p-8 md:p-10 bg-[var(--hover-bg)]">
          <p className="font-mono text-[10px] md:text-xs uppercase tracking-[0.14em] text-[var(--text-muted)] mb-4">
            Quick Actions
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <NavLink
              to="/garden"
              className="w-full sm:w-auto text-center px-6 py-3 border border-[var(--text-primary)] bg-[var(--text-primary)] text-[var(--bg-base)] font-mono text-[10px] md:text-xs uppercase tracking-[0.14em] hover:bg-[var(--bg-base)] hover:text-[var(--text-primary)] transition-colors"
            >
              Open Garden
            </NavLink>
            <NavLink
              to="/"
              className="w-full sm:w-auto text-center px-6 py-3 border border-[var(--border-strong)] text-[var(--text-primary)] font-mono text-[10px] md:text-xs uppercase tracking-[0.14em] hover:bg-[var(--hover-bg)] transition-colors"
            >
              Back to Studio
            </NavLink>
          </div>
        </div>
      </section>
    </main>
  );
}