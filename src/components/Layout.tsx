import React from 'react';
import { TopNav } from './TopNav';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[var(--bg-base)] text-[var(--text-primary)] min-h-[100dvh] flex flex-col antialiased selection:bg-[var(--text-primary)] selection:text-[var(--bg-base)]">
      <TopNav />
      {children}
    </div>
  );
}
