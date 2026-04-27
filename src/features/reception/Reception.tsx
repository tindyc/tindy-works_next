import Link from 'next/link';
import { Mail, Monitor, Users } from 'lucide-react';
import { primaryCtaInline, primaryCtaInlineStrong, secondaryCta } from '@/styles/ui';

const cardClassName = 'flex h-full flex-col border border-[var(--border-subtle)] p-6 md:p-8';
const cardBodyClassName = 'flex h-full flex-col justify-between gap-6';
const ctaRowClassName = 'flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center md:gap-4';

export function Reception() {
  return (
    <main className="mt-[64px] flex min-h-[calc(100vh-64px)] w-full flex-grow flex-col border-t border-[var(--border-subtle)] bg-[var(--bg-base)] md:mt-[88px] md:min-h-[calc(100vh-88px)]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 md:px-8 md:py-14 lg:px-0">
        <header className="max-w-3xl">
          <h1 className="font-display text-4xl font-bold leading-tight text-[var(--text-primary)] md:text-5xl lg:text-6xl">
            How can I help?
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-[var(--text-secondary)] md:text-xl">
            Choose the starting point that best matches what you need. Each page explains the service before any form.
          </p>
        </header>

        <section
          role="region"
          aria-labelledby="client-heading"
          className={`${cardClassName} border-2 border-[var(--border-strong)] bg-[var(--ui-surface)]`}
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
            <div className="grid gap-5 sm:grid-cols-[3.5rem_1fr]">
              <span
                className="flex h-14 w-14 items-center justify-center border border-[var(--border-strong)] bg-[var(--bg-base)] text-[var(--text-primary)]"
                aria-hidden="true"
              >
                <Monitor className="h-7 w-7" />
              </span>
              <div>
                <p className="mb-3 text-base font-semibold text-[var(--text-primary)]">
                  Client
                </p>
                <h2
                  id="client-heading"
                  className="font-display text-3xl font-semibold leading-tight text-[var(--text-primary)] md:text-4xl"
                >
                  Support for websites, systems, and professional projects
                </h2>
                <p className="mt-4 max-w-3xl text-lg leading-relaxed text-[var(--text-secondary)]">
                  Get help with technical planning, build work, automation, bugs, or improving an existing digital product.
                </p>
              </div>
            </div>

            <div className={ctaRowClassName}>
              <Link
                href="/tech-support-services"
                className={primaryCtaInlineStrong}
              >
                Explore client services
              </Link>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
          <section
            role="region"
            aria-labelledby="community-heading"
            className={`${cardClassName} bg-[var(--ui-surface)]`}
          >
            <div className={cardBodyClassName}>
              <div className="grid gap-5 sm:grid-cols-[3rem_1fr]">
                <span
                  className="flex h-12 w-12 items-center justify-center border border-[var(--border-strong)] bg-[var(--bg-base)] text-[var(--text-primary)]"
                  aria-hidden="true"
                >
                  <Users className="h-6 w-6" />
                </span>
                <div>
                  <p className="mb-3 text-base font-semibold text-[var(--text-primary)]">
                    Community
                  </p>
                  <h2
                    id="community-heading"
                    className="font-display text-3xl font-semibold leading-tight text-[var(--text-primary)] md:text-4xl"
                  >
                    Patient help with everyday technology
                  </h2>
                  <p className="mt-4 text-lg leading-relaxed text-[var(--text-secondary)]">
                    Clear, calm support for phones, tablets, accounts, video calls, online forms, and other day-to-day technology.
                  </p>
                </div>
              </div>

              <div className={ctaRowClassName}>
                <Link
                  href="/help-with-tech"
                  className={primaryCtaInline}
                >
                  Get help with technology
                </Link>
                <Link
                  href="/digital-companionship-elderly"
                  className={secondaryCta}
                >
                  Digital companionship
                </Link>
              </div>
            </div>
          </section>

          <section
            role="region"
            aria-labelledby="contact-heading"
            className={cardClassName}
          >
            <div className={cardBodyClassName}>
              <span
                className="flex h-12 w-12 items-center justify-center border border-[var(--border-subtle)] bg-[var(--ui-surface)] text-[var(--text-primary)]"
                aria-hidden="true"
              >
                <Mail className="h-6 w-6" />
              </span>
              <div>
                <p className="mb-3 text-base font-semibold text-[var(--text-primary)]">
                  Contact
                </p>
                <h2
                  id="contact-heading"
                  className="font-display text-2xl font-semibold leading-tight text-[var(--text-primary)] md:text-3xl"
                >
                  General enquiries
                </h2>
                <p className="mt-4 text-base leading-relaxed text-[var(--text-secondary)]">
                  Use this route for questions, introductions, or anything that does not fit the other paths.
                </p>
                <p className="mt-4 text-base leading-relaxed text-[var(--text-secondary)]">
                  If you are not sure where to start, send a message and I will point you in the right direction.
                </p>
              </div>
              <div className={ctaRowClassName}>
                <Link
                  href="/contact"
                  className={primaryCtaInline}
                >
                  Contact me
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
