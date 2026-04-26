import React from 'react';

export function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 w-full z-50 flex justify-between items-center px-6 md:px-12 py-4 bg-[var(--bg-base)] docked full-width border-t border-[var(--border-subtle)] flat no shadows font-['Space_Grotesk'] text-[10px] uppercase tracking-widest transition-opacity duration-500 hidden lg:flex">
      <div className="text-[var(--text-primary)] font-black whitespace-nowrap">
          ©2024_TINDY_WORKS_ALL_RIGHTS_RESERVED
      </div>
      <div className="flex gap-6">
        <a className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-300" href="#">LEGAL</a>
        <a className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-300" href="#">INDEX</a>
        <a className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-300" href="#">MANIFESTO</a>
      </div>
    </footer>
  );
}
