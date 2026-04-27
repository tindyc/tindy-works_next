"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

function linkClassName(isActive: boolean) {
  return isActive
    ? 'border-b border-[var(--text-primary)] pb-1 text-[var(--text-primary)]'
    : 'transition-colors hover:text-[var(--text-primary)]';
}

export function SupportNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-4 border-b border-[var(--border-subtle)] p-6 font-mono text-[10px] uppercase text-[var(--text-secondary)] md:flex-row md:items-center md:justify-between">
      <Link
        href="/reception"
        className="font-bold tracking-widest text-[var(--text-primary)] transition-colors hover:text-[var(--text-secondary)]"
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

      <Link href="/" className="transition-colors hover:text-[var(--text-primary)] md:text-right">
        BACK TO STUDIO
      </Link>
    </nav>
  );
}
