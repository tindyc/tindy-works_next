"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/office', icon: 'desktop_windows', label: 'OFFICE' },
  { href: '/garden', icon: 'nature_people', label: 'GARDEN' },
  { href: '/reception', icon: 'groups', label: 'RECEPTION' },
];

function itemClassName(isActive: boolean) {
  return `flex flex-col items-center gap-2 group cursor-pointer ${
    isActive ? '*:text-[var(--text-primary)]' : ''
  }`;
}

export function SideNav() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full z-40 hidden lg:flex flex-col pt-24 pb-12 w-24 border-r border-[var(--border-subtle)] bg-[var(--bg-base)] items-center justify-between">
      <div className="flex flex-col gap-8 items-center pt-8">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} className={itemClassName(pathname === item.href)}>
            <span className="material-symbols-outlined text-[var(--text-secondary)] text-2xl group-hover:text-[var(--text-primary)] transition-colors duration-300" style={{ fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
            <span className="font-label-sm text-label-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] [writing-mode:vertical-rl] transform rotate-180 tracking-widest mt-4">{item.label}</span>
          </Link>
        ))}
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
