"use client";

import Link from 'next/link';

export default function Page() {
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
        <div className="w-full max-w-xl border border-[var(--border-subtle)] p-8 md:p-10 bg-[var(--hover-bg)]">
          <p className="font-mono text-[10px] md:text-xs uppercase tracking-[0.14em] text-[var(--text-muted)] mb-4">
            Quick Actions
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/garden"
              className="ui-button min-h-11 w-full text-center font-mono text-[10px] uppercase tracking-[0.14em] md:text-xs sm:w-auto"
            >
              Open Garden
            </Link>
            <Link
              href="/"
              className="ui-button min-h-11 w-full text-center font-mono text-[10px] uppercase tracking-[0.14em] md:text-xs sm:w-auto"
            >
              Back to Studio
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
