import Link from 'next/link';

type SupportNavSection = 'reception' | 'client' | 'community' | 'contact';

interface SupportNavProps {
  active?: SupportNavSection;
}

function linkClassName(isActive: boolean) {
  return isActive
    ? 'border-b-2 border-[var(--text-primary)] pb-1 text-[var(--text-primary)]'
    : 'hover:text-[var(--text-primary)]';
}

export function SupportNav({ active }: SupportNavProps) {
  return (
    <nav className="flex flex-col gap-4 border-b border-[var(--border-subtle)] p-4 text-base text-[var(--text-secondary)] md:flex-row md:items-center md:justify-between md:p-8">
      <Link
        href="/reception"
        className="font-semibold text-[var(--text-primary)] hover:text-[var(--text-secondary)] focus:outline focus:outline-2 focus:outline-offset-4 focus:outline-[var(--text-primary)]"
      >
        Reception
      </Link>

      <div className="flex flex-wrap gap-5 md:gap-8">
        <Link href="/reception" className={`${linkClassName(active === 'reception')} focus:outline focus:outline-2 focus:outline-offset-4 focus:outline-[var(--text-primary)]`}>
          Reception
        </Link>
        <Link href="/tech-support-services" className={`${linkClassName(active === 'client')} focus:outline focus:outline-2 focus:outline-offset-4 focus:outline-[var(--text-primary)]`}>
          Client
        </Link>
        <Link href="/help-with-tech" className={`${linkClassName(active === 'community')} focus:outline focus:outline-2 focus:outline-offset-4 focus:outline-[var(--text-primary)]`}>
          Community
        </Link>
        <Link href="/contact" className={`${linkClassName(active === 'contact')} focus:outline focus:outline-2 focus:outline-offset-4 focus:outline-[var(--text-primary)]`}>
          Contact
        </Link>
      </div>
    </nav>
  );
}
