"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // Preserve native anchor-link behavior for in-page hash navigation.
    if (window.location.hash) {
      return;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);

  return null;
}
