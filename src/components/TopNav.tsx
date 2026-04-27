"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { label: 'STUDIO', path: '/' },
  { label: 'OFFICE', path: '/office' },
  { label: 'GARDEN', path: '/garden' },
  { label: 'RECEPTION', path: '/reception' },
];

function navItemClass(isActive: boolean) {
  return isActive
    ? 'text-[var(--text-primary)] border-b border-[var(--text-primary)] pb-1 transition-colors duration-300 px-2'
    : 'text-[var(--text-secondary)] border-b border-transparent pb-1 hover:text-[var(--text-primary)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-base)] transition-colors duration-300 px-2';
}

function mobileNavItemClass(isActive: boolean) {
  return isActive
    ? 'text-[var(--text-primary)] border border-[var(--text-primary)] bg-[var(--hover-bg)] px-4 py-3 uppercase tracking-[0.16em] text-xs'
    : 'text-[var(--text-secondary)] border border-transparent px-4 py-3 uppercase tracking-[0.16em] text-xs hover:text-[var(--text-primary)] hover:border-[var(--border-strong)]';
}

export function TopNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 md:px-12 py-4 md:py-6 bg-[var(--bg-base)] border-b border-[var(--border-subtle)] font-['Space_Grotesk'] tracking-tight text-sm uppercase transition-all duration-500 ease-out">
        <Link href="/" className="text-lg md:text-xl font-bold tracking-tighter text-[var(--text-primary)] uppercase hover:opacity-80 transition-opacity whitespace-nowrap">
          TINDY_WORKS
        </Link>

        <div className="hidden lg:flex gap-6 items-center">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={navItemClass(item.path === '/' ? pathname === '/' : pathname === item.path)}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            aria-label="Toggle navigation menu"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="lg:hidden text-[var(--text-primary)] flex items-center justify-center p-2 border border-[var(--border-strong)] hover:bg-[var(--hover-bg)] transition-colors"
          >
            <span className="material-symbols-outlined">{mobileOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </nav>

      <div
        className={`lg:hidden fixed top-[64px] md:top-[88px] left-0 right-0 z-40 border-b border-[var(--border-subtle)] bg-[var(--bg-base)] transition-all duration-300 origin-top ${
          mobileOpen ? 'opacity-100 scale-y-100 pointer-events-auto' : 'opacity-0 scale-y-95 pointer-events-none'
        }`}
      >
        <div className="px-4 py-4 flex flex-col gap-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--text-primary)] px-1">TINDY_WORKS</p>

          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className={mobileNavItemClass(pathname === '/')}
          >
            STUDIO
          </Link>

          <div className="border-t border-[var(--border-subtle)] pt-4" />

          <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)] px-1">SPACES</p>
          <div className="flex flex-col gap-1">
            {NAV_ITEMS.filter((item) => ['/office', '/garden', '/reception'].includes(item.path)).map((item) => (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setMobileOpen(false)}
                className={mobileNavItemClass(pathname === item.path)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
