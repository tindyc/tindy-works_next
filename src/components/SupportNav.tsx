"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

function linkClassName(isActive: boolean) {
  return isActive
    ? 'text-[var(--text-primary)] border-b border-[var(--text-primary)] pb-1'
    : 'hover:text-[var(--text-primary)] transition-colors';
}

export function SupportNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-4 p-6 border-b border-[var(--border-subtle)] font-mono text-[10px] uppercase text-[var(--text-secondary)] md:flex-row md:items-center md:justify-between">
      <Link
        href="/reception"
        className="text-[var(--text-primary)] font-bold tracking-widest hover:text-[var(--text-secondary)] transition-colors"
      >
        STUDIO_RECEPTION
      </Link>

      <div className="flex gap-6 md:gap-8">
        <Link href="/reception" className={linkClassName(pathname === '/reception')}>
          SUPPORT
        </Link>
        <Link href="/contact" className={linkClassName(pathname === '/contact')}>
          CONTACT
        </Link>
      </div>

      <Link href="/" className="hover:text-[var(--text-primary)] transition-colors md:text-right">
        BACK TO STUDIO
      </Link>
    </nav>
  );
}
