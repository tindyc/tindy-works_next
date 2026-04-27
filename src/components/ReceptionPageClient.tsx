import Link from 'next/link';
import { HeartHandshake, Mail, Monitor, Users } from 'lucide-react';
import { SupportNav } from '@/components/SupportNav';

const supportPaths = [
  {
    title: 'Client',
    description: 'Websites, apps, automation, bugs, and systems work for businesses or professional projects.',
    href: '/tech-support-services',
    cta: 'Client support',
    Icon: Monitor,
    primary: true,
  },
  {
    title: 'Community',
    description: 'Simple, patient help with everyday technology, plus regular message check-ins for older adults.',
    href: '/help-with-tech',
    cta: 'Community tech help',
    Icon: Users,
    secondaryHref: '/digital-companionship-elderly',
    secondaryCta: 'Regular check-ins',
  },
  {
    title: 'Contact',
    description: 'A simple route for general questions or anything that does not fit the other paths.',
    href: '/contact',
    cta: 'Contact me',
    Icon: Mail,
    compact: true,
  },
];

export default function ReceptionPageClient() {
  const [clientPath, ...secondaryPaths] = supportPaths;

  return (
    <main className="mt-[64px] flex min-h-[calc(100vh-64px)] w-full flex-grow flex-col border-t border-[var(--border-subtle)] bg-[var(--bg-base)] md:mt-[88px] md:min-h-[calc(100vh-88px)]">
      <SupportNav active="reception" />

      <section className="flex-grow px-4 py-10 md:px-8 md:py-14 lg:px-16">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
          <header className="max-w-3xl">
            <h1 className="font-display text-4xl font-bold leading-tight text-[var(--text-primary)] md:text-5xl lg:text-6xl">
              How can I help?
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-[var(--text-secondary)] md:text-xl">
              Choose the clearest starting point. Each page explains the support before you fill in a form.
            </p>
          </header>

          <section aria-labelledby="client-heading" className="border border-[var(--border-strong)] bg-[var(--ui-surface)] p-6 md:p-8 lg:p-12">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex max-w-3xl flex-col gap-4 sm:flex-row">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center border border-[var(--border-strong)] bg-[var(--bg-base)] text-[var(--text-primary)]" aria-hidden="true">
                  <clientPath.Icon className="h-7 w-7" />
                </span>
                <div>
                  <h2 id="client-heading" className="font-display text-3xl font-semibold leading-tight text-[var(--text-primary)] md:text-4xl">
                    {clientPath.title}
                  </h2>
                  <p className="mt-3 text-lg leading-relaxed text-[var(--text-secondary)]">
                    {clientPath.description}
                  </p>
                </div>
              </div>
              <Link href={clientPath.href} className="ui-button min-h-[56px] w-full px-6 py-4 text-base font-semibold focus:outline focus:outline-2 focus:outline-offset-4 focus:outline-[var(--text-primary)] sm:w-auto">
                {clientPath.cta}
              </Link>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {secondaryPaths.map(({ title, description, href, cta, Icon, compact, secondaryHref, secondaryCta }) => (
              <section key={href} aria-labelledby={`${title.toLowerCase()}-heading`} className="border border-[var(--border-subtle)] p-6 md:p-8">
                <div className="flex h-full flex-col gap-5">
                  <span className="flex h-12 w-12 items-center justify-center border border-[var(--border-subtle)] bg-[var(--ui-surface)] text-[var(--text-primary)]" aria-hidden="true">
                    <Icon className="h-6 w-6" />
                  </span>
                  <div className="flex-grow">
                    <h2 id={`${title.toLowerCase()}-heading`} className="font-display text-2xl font-semibold text-[var(--text-primary)] md:text-3xl">
                      {title}
                    </h2>
                    <p className={`${compact ? 'mt-3 text-base' : 'mt-3 text-lg'} leading-relaxed text-[var(--text-secondary)]`}>
                      {description}
                    </p>
                  </div>
                  <Link href={href} className="ui-button min-h-[56px] w-full px-6 py-4 text-base font-semibold focus:outline focus:outline-2 focus:outline-offset-4 focus:outline-[var(--text-primary)]">
                    {cta}
                  </Link>
                  {secondaryHref && secondaryCta ? (
                    <Link href={secondaryHref} className="inline-flex min-h-[56px] w-full items-center justify-center gap-2 border border-[var(--border-strong)] px-6 py-4 text-base font-semibold text-[var(--text-primary)] hover:bg-[var(--hover-bg)] focus:outline focus:outline-2 focus:outline-offset-4 focus:outline-[var(--text-primary)]">
                      <HeartHandshake className="h-5 w-5" aria-hidden="true" />
                      {secondaryCta}
                    </Link>
                  ) : null}
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
