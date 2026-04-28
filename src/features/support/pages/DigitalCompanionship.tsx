import Link from 'next/link';
import { SupportNav } from '@/components/layout/SupportNav';
import { INTENT_CONFIG } from '@/features/support/types/intent';
import { primaryCta } from '@/styles/ui';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Digital Companionship for Elderly',
  description:
    'Regular friendly check-ins via email, SMS, or messaging for elderly people. No video calls required.',
  areaServed: 'UK',
};

const steps = [
  {
    step: '01',
    title: 'Share the basics',
    text: 'Use a short form to tell me who needs check-ins and what contact method feels easiest.',
  },
  {
    step: '02',
    title: 'Choose a rhythm',
    text: 'I will suggest a simple schedule. It can be occasional, weekly, or more regular.',
  },
  {
    step: '03',
    title: 'Messages begin',
    text: 'The check-ins are calm and consistent. There are no video calls.',
  },
];

export function DigitalCompanionship() {
  return (
    <>
      <script
        id="digital-companionship-json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />

      <main className="mt-[64px] flex min-h-[calc(100vh-64px)] w-full flex-grow flex-col border-t border-[var(--border-subtle)] bg-[var(--bg-base)] md:mt-[88px] md:min-h-[calc(100vh-88px)]">
        <SupportNav active={INTENT_CONFIG.companionship.supportNavActive} />

        <header className="border-b border-[var(--border-subtle)] px-4 py-10 md:px-8 md:py-14 lg:px-16">
          <div className="mx-auto max-w-5xl">
            <p className="mb-4 text-lg font-semibold text-[var(--text-secondary)]">
              Companionship
            </p>
            <h1 className="font-display text-4xl font-bold leading-tight text-[var(--text-primary)] md:text-5xl lg:text-6xl">
              Digital companionship for elderly people
            </h1>
            <p className="mt-5 max-w-3xl text-xl leading-relaxed text-[var(--text-secondary)] md:text-2xl">
              Friendly, regular check-ins by message. No video calls. No fuss. Just calm contact.
            </p>
          </div>
        </header>

        <section className="flex-grow px-4 py-10 md:px-8 md:py-14 lg:px-16">
          <div className="mx-auto flex max-w-5xl flex-col gap-12 md:gap-14">

            <section
              role="region"
              aria-labelledby="digital-companionship-intro-heading"
              className="flex flex-col gap-5"
            >
              <h2 id="digital-companionship-intro-heading" className="font-display text-3xl font-semibold text-[var(--text-primary)] md:text-4xl">
                Gentle contact between visits
              </h2>
              <p className="text-xl text-[var(--text-secondary)] leading-relaxed">
                Some older adults go a long time without a friendly message. A small check-in can help someone feel remembered and less alone.
              </p>
              <p className="text-xl text-[var(--text-secondary)] leading-relaxed">
                I offer simple messaging support that fits into normal life. You can request it for yourself or someone else.
              </p>
            </section>

            <section
              role="region"
              aria-labelledby="digital-companionship-steps-heading"
              className="flex flex-col gap-5"
            >
              <h2 id="digital-companionship-steps-heading" className="font-display text-3xl font-semibold text-[var(--text-primary)] md:text-4xl">
                How it works
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {steps.map((s) => (
                  <div key={s.step} className="border border-[var(--border-subtle)] p-6 md:p-8">
                    <p className="font-mono text-2xl font-bold text-[var(--text-primary)] mb-4">{s.step}</p>
                    <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-3">{s.title}</h3>
                    <p className="text-lg text-[var(--text-secondary)] leading-relaxed">{s.text}</p>
                  </div>
                ))}
              </div>
            </section>

            <section
              role="region"
              aria-labelledby="digital-companionship-messaging-heading"
              className="flex flex-col gap-5"
            >
              <h2 id="digital-companionship-messaging-heading" className="font-display text-3xl font-semibold text-[var(--text-primary)] md:text-4xl">
                Messaging only
              </h2>
              <p className="text-xl text-[var(--text-secondary)] leading-relaxed">
                Video calls can feel too much. These check-ins are by email, SMS, WhatsApp, or another simple message option.
              </p>
              <p className="text-xl text-[var(--text-secondary)] leading-relaxed">
                There is nothing complicated to install. I will keep the process simple.
              </p>
            </section>

            <section
              role="region"
              aria-labelledby="digital-companionship-audience-heading"
              className="flex flex-col gap-5"
            >
              <h2 id="digital-companionship-audience-heading" className="font-display text-3xl font-semibold text-[var(--text-primary)] md:text-4xl">
                Who this is for
              </h2>
              <ul className="flex flex-col gap-3 text-xl text-[var(--text-secondary)] leading-relaxed list-none">
                <li className="flex gap-3">
                  <span className="mt-1 text-base font-semibold text-[var(--text-primary)]">01</span>
                  <span>Older adults who live alone and want regular friendly contact</span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 text-base font-semibold text-[var(--text-primary)]">02</span>
                  <span>Family members who want peace of mind for a loved one far away</span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 text-base font-semibold text-[var(--text-primary)]">03</span>
                  <span>Carers looking for extra support between visits</span>
                </li>
              </ul>
            </section>

            <section
              role="region"
              aria-labelledby="digital-companionship-request-heading"
              className="border border-[var(--border-strong)] bg-[var(--ui-surface)] p-6 md:p-10"
            >
              <h2 id="digital-companionship-request-heading" className="mb-4 font-display text-3xl font-semibold text-[var(--text-primary)]">
                Start regular check-ins
              </h2>
              <p className="text-xl text-[var(--text-secondary)] leading-relaxed mb-7">
                The form is short. There is no pressure, and no commitment. I can take a look and help from there.
              </p>
              <p className="mb-7 text-lg leading-relaxed text-[var(--text-secondary)]">
                For one-off help with phones, accounts, or everyday internet tasks, visit{' '}
                <Link
                  href="/help-with-tech"
                  className="font-semibold text-[var(--text-primary)] underline underline-offset-4 focus:outline focus:outline-2 focus:outline-offset-4 focus:outline-[var(--text-primary)]"
                >
                  help with tech
                </Link>
                . For professional website or systems work, see{' '}
                <Link
                  href="/tech-support-services"
                  className="font-semibold text-[var(--text-primary)] underline underline-offset-4 focus:outline focus:outline-2 focus:outline-offset-4 focus:outline-[var(--text-primary)]"
                >
                  tech support services
                </Link>
                .
              </p>
              <Link
                href={INTENT_CONFIG.companionship.href}
                className={primaryCta}
              >
                Request check-ins
              </Link>
            </section>

          </div>
        </section>

      </main>
    </>
  );
}
