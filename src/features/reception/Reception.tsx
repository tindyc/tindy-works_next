import Link from 'next/link';
import { Mail, Monitor, Users } from 'lucide-react';

const focusClassName =
  'focus:outline focus:outline-2 focus:outline-offset-4 focus:outline-[var(--text-primary)]';
const cardClassName = 'flex h-full flex-col border border-[var(--border-subtle)] p-6 md:p-8';
const ctaClassName = `ui-button min-h-[56px] w-full justify-center px-6 py-4 text-base font-semibold sm:w-auto ${focusClassName}`;

export function Reception() {
  return (
    <main className="mx-auto mt-[64px] flex min-h-[calc(100vh-64px)] w-full max-w-6xl flex-grow flex-col gap-8 border-t border-[var(--border-subtle)] bg-[var(--bg-base)] px-4 py-10 md:mt-[88px] md:min-h-[calc(100vh-88px)] md:px-8 md:py-14 lg:px-0">
      <header className="max-w-3xl">
        <h1 className="font-display text-4xl font-bold leading-tight text-[var(--text-primary)] md:text-5xl lg:text-6xl">
          How can I help?
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-[var(--text-secondary)] md:text-xl">
          Choose the starting point that best matches what you need. Each page explains the service before any form.
        </p>
      </header>

      <section
        aria-labelledby="client-heading"
        className={`${cardClassName} border-2 border-[var(--border-strong)] bg-[var(--ui-surface)]`}
      >
        <div className="grid items-center gap-6 lg:grid-cols-[1fr_auto]">
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

          <Link
            href="/tech-support-services"
            className={`${ctaClassName} ui-button-strong justify-self-start lg:justify-self-end`}
          >
            Explore client services
          </Link>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        <section
          aria-labelledby="community-heading"
          className={`${cardClassName} bg-[var(--ui-surface)]`}
        >
          <div className="flex h-full flex-col justify-between gap-6">
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

            <div className="flex flex-col items-start gap-5">
              <Link
                href="/help-with-tech"
                className={ctaClassName}
              >
                Get help with technology
              </Link>
              <p className="text-lg leading-relaxed text-[var(--text-secondary)]">
                Need ongoing support instead of one-off help?{' '}
                <Link
                  href="/digital-companionship-elderly"
                  className={`font-semibold text-[var(--text-primary)] underline underline-offset-4 ${focusClassName}`}
                >
                  Read about digital companionship.
                </Link>
              </p>
            </div>
          </div>
        </section>

        <section
          aria-labelledby="contact-heading"
          className={cardClassName}
        >
          <div className="flex h-full flex-col justify-between gap-6">
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
            <Link
              href="/contact"
              className={ctaClassName}
            >
              Contact me
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
