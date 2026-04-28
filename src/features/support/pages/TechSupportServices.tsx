import Link from 'next/link';
import { SupportNav } from '@/components/layout/SupportNav';
import { INTENT_CONFIG } from '@/features/support/types/intent';
import { primaryCta } from '@/styles/ui';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Freelance Tech Support Services',
  description:
    'Professional technical support for websites, apps, and systems. Fast, reliable freelance help.',
  areaServed: 'UK',
};

const steps = [
  {
    step: '01',
    title: 'Share the goal',
    text: 'Tell me what you want to fix, build, automate, or improve.',
  },
  {
    step: '02',
    title: 'I review it',
    text: 'I will come back with a clear assessment, likely options, and sensible next steps.',
  },
  {
    step: '03',
    title: 'Agree the work',
    text: 'If it feels like a fit, I will confirm scope, timing, and cost before anything starts.',
  },
];

export function TechSupportServices() {
  return (
    <>
      <script
        id="tech-support-services-json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />

      <main className="mt-[64px] flex min-h-[calc(100vh-64px)] w-full flex-grow flex-col border-t border-[var(--border-subtle)] bg-[var(--bg-base)] md:mt-[88px] md:min-h-[calc(100vh-88px)]">
        <SupportNav active={INTENT_CONFIG.client.navigation.supportNavActive} />

        <header className="border-b border-[var(--border-subtle)] px-4 py-10 md:px-8 md:py-14 lg:px-16">
          <div className="mx-auto max-w-5xl">
            <p className="mb-4 text-base font-semibold text-[var(--text-secondary)]">
              Technical services
            </p>
            <h1 className="font-display text-4xl font-bold leading-tight text-[var(--text-primary)] md:text-5xl lg:text-6xl">
              Client work
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-relaxed text-[var(--text-secondary)] md:text-xl">
              Help with websites, apps, automation, and systems. Clear thinking, careful delivery, and no pressure to commit before the work makes sense.
            </p>
          </div>
        </header>

        <section className="flex-grow px-4 py-10 md:px-8 md:py-14 lg:px-16">
          <div className="mx-auto flex max-w-5xl flex-col gap-12 md:gap-16">

            <section
              role="region"
              aria-labelledby="tech-support-help-heading"
              className="flex flex-col gap-4"
            >
              <h2 id="tech-support-help-heading" className="font-display text-3xl font-semibold text-[var(--text-primary)] md:text-4xl">
                What I can help with
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {[
                  {
                    label: 'Websites',
                    items: ['Bug fixes', 'Performance improvements', 'Layout issues', 'CMS support'],
                  },
                  {
                    label: 'Apps',
                    items: ['Feature development', 'API integrations', 'Error investigation', 'Code review'],
                  },
                  {
                    label: 'Automation',
                    items: ['Workflow improvements', 'Manual task reduction', 'Data handling', 'Internal tools'],
                  },
                  {
                    label: 'Systems',
                    items: ['Deployment issues', 'Environment setup', 'Database queries', 'Server errors'],
                  },
                ].map((group) => (
                  <div key={group.label} className="border border-[var(--border-subtle)] p-6">
                    <p className="mb-4 text-lg font-semibold text-[var(--text-primary)]">
                      {group.label}
                    </p>
                    <ul className="flex flex-col gap-2">
                      {group.items.map((item) => (
                        <li key={item} className="flex gap-2 text-base text-[var(--text-secondary)]">
                          <span className="text-[var(--text-primary)]">·</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            <section
              role="region"
              aria-labelledby="tech-support-steps-heading"
              className="flex flex-col gap-4"
            >
              <h2 id="tech-support-steps-heading" className="font-display text-3xl font-semibold text-[var(--text-primary)] md:text-4xl">
                How it works
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {steps.map((item) => (
                  <div key={item.step} className="border border-[var(--border-subtle)] p-6">
                    <p className="mb-3 text-2xl font-bold text-[var(--text-primary)]">{item.step}</p>
                    <h3 className="mb-2 text-xl font-semibold text-[var(--text-primary)]">{item.title}</h3>
                    <p className="text-base leading-relaxed text-[var(--text-secondary)]">{item.text}</p>
                  </div>
                ))}
              </div>
            </section>

            <section
              role="region"
              aria-labelledby="tech-support-request-heading"
              className="border border-[var(--border-strong)] bg-[var(--ui-surface)] p-6 md:p-8"
            >
              <h2 id="tech-support-request-heading" className="mb-4 font-display text-3xl font-semibold text-[var(--text-primary)]">
                Start a project request
              </h2>
              <p className="mb-6 text-base leading-relaxed text-[var(--text-secondary)] md:text-lg">
                Tell me what you are trying to do and I will come back with a practical next step. There is no pressure and no commitment required to ask.
              </p>
              <p className="mb-6 text-base leading-relaxed text-[var(--text-secondary)] md:text-lg">
                Looking for patient everyday support instead? Visit{' '}
                <Link
                  href="/help-with-tech"
                  className="font-semibold text-[var(--text-primary)] underline underline-offset-4 focus:outline focus:outline-2 focus:outline-offset-4 focus:outline-[var(--text-primary)]"
                >
                  help with tech
                </Link>
                {' '}or{' '}
                <Link
                  href="/digital-companionship-elderly"
                  className="font-semibold text-[var(--text-primary)] underline underline-offset-4 focus:outline focus:outline-2 focus:outline-offset-4 focus:outline-[var(--text-primary)]"
                >
                  digital companionship
                </Link>
                .
              </p>
              <Link
                href={INTENT_CONFIG.client.navigation.href}
                className={primaryCta}
              >
                Start a project request
              </Link>
            </section>

          </div>
        </section>

      </main>
    </>
  );
}
