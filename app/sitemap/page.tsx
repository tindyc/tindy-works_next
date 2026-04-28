import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sitemap — TINDY_WORKS',
  description: 'All pages on tindyc.com',
};

const sections = [
  {
    heading: 'Main',
    links: [
      { href: '/', label: 'Home' },
      { href: '/office', label: 'Office' },
      { href: '/garden', label: 'Garden' },
      { href: '/reception', label: 'Reception' },
    ],
  },
];

export default function SitemapPage() {
  return (
    <main className="min-h-screen px-8 py-24 lg:pl-32">
      <h1 className="font-headline-lg text-headline-lg text-[var(--text-primary)] mb-12 tracking-widest uppercase">
        Sitemap
      </h1>
      <nav aria-label="Sitemap">
        {sections.map((section) => (
          <section key={section.heading} className="mb-12" aria-labelledby={`section-${section.heading}`}>
            <h2
              id={`section-${section.heading}`}
              className="font-label-sm text-label-sm text-[var(--text-secondary)] tracking-widest uppercase mb-6"
            >
              {section.heading}
            </h2>
            <ul className="flex flex-col gap-4">
              {section.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-headline-lg text-[var(--text-primary)] hover:text-primary transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </nav>
    </main>
  );
}
