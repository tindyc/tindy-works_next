import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  primaryCtaInline,
  primaryCtaInlineStrong,
  secondaryCtaInline,
} from '@/styles/ui';

type CTAButtonVariant = 'primary' | 'primaryStrong' | 'secondary';

const ctaButtonClassName: Record<CTAButtonVariant, string> = {
  primary: primaryCtaInline,
  primaryStrong: primaryCtaInlineStrong,
  secondary: secondaryCtaInline,
};

export function CTARow({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-stretch md:gap-4 ${className}`}>
      {children}
    </div>
  );
}

export function CTAButton({
  href,
  variant,
  children,
}: {
  href: string;
  variant: CTAButtonVariant;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={`${ctaButtonClassName[variant]} w-full sm:w-auto`}>
      {children}
    </Link>
  );
}
