import Link from 'next/link';
import { SupportNav } from '@/components/layout/SupportNav';
import { INTENT_CONFIG } from '@/features/support/types/intent';
import { primaryCta } from '@/styles/ui';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Help with Tech',
  description:
    'Simple, patient tech support for older adults. Help with phones, laptops, email, and the internet.',
  areaServed: 'UK',
};

const steps = [
  {
    step: '01',
    title: 'Tell me what is hard',
    text: 'Use a short form. You can write only the basics.',
  },
  {
    step: '02',
    title: 'I reply calmly',
    text: 'I will look at the request and suggest the next step.',
  },
  {
    step: '03',
    title: 'I help from there',
    text: 'There is no pressure. I can explain things in plain words.',
  },
];

export function HelpWithTech() {
  return (
    <>
      <script
        id="help-with-tech-json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />

      <main className="mt-[64px] flex min-h-[calc(100vh-64px)] w-full flex-grow flex-col border-t border-[var(--border-subtle)] bg-[var(--bg-base)] md:mt-[88px] md:min-h-[calc(100vh-88px)]">
        <SupportNav active={INTENT_CONFIG.community.navigation.supportNavActive} />

        <header className="border-b border-[var(--border-subtle)] px-4 py-10 md:px-8 md:py-14 lg:px-16">
          <div className="mx-auto max-w-5xl">
            <p className="mb-4 text-lg font-semibold text-[var(--text-secondary)]">
              Community support
            </p>
            <h1 className="font-display text-4xl font-bold leading-tight text-[var(--text-primary)] md:text-5xl lg:text-6xl">
              Help with tech
            </h1>
            <p className="mt-5 max-w-3xl text-xl leading-relaxed text-[var(--text-secondary)] md:text-2xl">
              Simple, friendly help with phones, laptops, email, and the internet.
            </p>
          </div>
        </header>

        <section className="flex-grow px-4 py-10 md:px-8 md:py-14 lg:px-16">
          <div className="mx-auto flex max-w-5xl flex-col gap-12 md:gap-14">
            <section
              role="region"
              aria-labelledby="help-with-tech-intro-heading"
              className="flex flex-col gap-5"
            >
              <h2 id="help-with-tech-intro-heading" className="font-display text-3xl font-semibold text-[var(--text-primary)] md:text-4xl">
                Calm help, in plain language
              </h2>
              <p className="text-xl text-[var(--text-secondary)] leading-relaxed">
                This is for older adults who want patient help with everyday technology. You can request help for yourself, a family member, or someone you care for.
              </p>
              <p className="text-xl text-[var(--text-secondary)] leading-relaxed">
                I can help when something feels confusing, stuck, or unsafe. You do not need to know the right technical words.
              </p>
            </section>

            <section
              role="region"
              aria-label="Technology support areas"
              className="grid grid-cols-1 gap-4 sm:grid-cols-3"
            >
              {['Phone or tablet', 'Laptop or computer', 'Email or internet'].map((item) => (
                <div key={item} className="border border-[var(--border-subtle)] bg-[var(--ui-surface)] p-6 md:p-8">
                  <p className="text-xl font-semibold text-[var(--text-primary)]">{item}</p>
                </div>
              ))}
            </section>

            <section
              role="region"
              aria-labelledby="help-with-tech-steps-heading"
              className="flex flex-col gap-5"
            >
              <h2 id="help-with-tech-steps-heading" className="font-display text-3xl font-semibold text-[var(--text-primary)] md:text-4xl">
                How it works
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {steps.map((item) => (
                  <div key={item.step} className="border border-[var(--border-subtle)] p-6 md:p-8">
                    <p className="font-mono text-2xl font-bold text-[var(--text-primary)] mb-4">{item.step}</p>
                    <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-3">{item.title}</h3>
                    <p className="text-lg text-[var(--text-secondary)] leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
            </section>

            <section
              role="region"
              aria-labelledby="help-with-tech-request-heading"
              className="border border-[var(--border-strong)] bg-[var(--ui-surface)] p-6 md:p-10"
            >
              <h2 id="help-with-tech-request-heading" className="mb-4 font-display text-3xl font-semibold text-[var(--text-primary)]">
                Request simple tech help
              </h2>
              <p className="text-xl text-[var(--text-secondary)] leading-relaxed mb-7">
                The form is short. There is no pressure, and no commitment. I can take a look and help from there.
              </p>
              <p className="mb-7 text-lg leading-relaxed text-[var(--text-secondary)]">
                Need ongoing message-based check-ins? Read about{' '}
                <Link
                  href="/digital-companionship-elderly"
                  className="font-semibold text-[var(--text-primary)] underline underline-offset-4 focus:outline focus:outline-2 focus:outline-offset-4 focus:outline-[var(--text-primary)]"
                >
                  digital companionship
                </Link>
                . For websites, systems, or project work, see{' '}
                <Link
                  href="/tech-support-services"
                  className="font-semibold text-[var(--text-primary)] underline underline-offset-4 focus:outline focus:outline-2 focus:outline-offset-4 focus:outline-[var(--text-primary)]"
                >
                  client tech support
                </Link>
                .
              </p>
              <Link
                href={INTENT_CONFIG.community.navigation.href}
                className={primaryCta}
              >
                Request support
              </Link>
            </section>
          </div>
        </section>

      </main>
    </>
  );
}
