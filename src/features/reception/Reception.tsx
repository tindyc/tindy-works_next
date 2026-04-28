import { Mail, Monitor, Users } from 'lucide-react';
import { CardContent } from '@/components/ui/CardContent';
import { CardIcon } from '@/components/ui/CardIcon';
import { CTAButton, CTARow } from '@/components/ui/CTA';

const cardClassName = `
  flex h-full flex-col
  border border-[var(--border-subtle)]
  p-6 md:p-8
  lg:max-w-[720px]
`;
const cardBodyClassName = 'flex h-full flex-col gap-6 lg:gap-8';

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
          className={`${cardClassName} mx-auto border-2 border-[var(--border-strong)] bg-[var(--ui-surface)] lg:max-w-[840px]`}
        >
          <div className={cardBodyClassName}>
            <CardContent
              icon={
                <CardIcon size="md">
                  <Monitor />
                </CardIcon>
              }
            >
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

              <CTARow className="mt-5">
                <CTAButton href="/tech-support-services" variant="primaryStrong">
                  Explore client services
                </CTAButton>
              </CTARow>
            </CardContent>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr] lg:items-start">
          <section
            role="region"
            aria-labelledby="community-heading"
            className={`${cardClassName} w-full bg-[var(--ui-surface)] lg:justify-self-start`}
          >
            <div className={cardBodyClassName}>
              <CardContent
                icon={
                  <CardIcon>
                    <Users />
                  </CardIcon>
                }
              >
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

                <CTARow className="mt-5">
                  <CTAButton href="/help-with-tech" variant="primary">
                    Get help with technology
                  </CTAButton>
                  <CTAButton href="/digital-companionship-elderly" variant="secondary">
                    Digital companionship
                  </CTAButton>
                </CTARow>
              </CardContent>
            </div>
          </section>

          <section
            role="region"
            aria-labelledby="contact-heading"
            className={`${cardClassName} w-full lg:justify-self-end`}
          >
            <div className={cardBodyClassName}>
              <CardContent
                icon={
                  <CardIcon>
                    <Mail />
                  </CardIcon>
                }
              >
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

                <CTARow className="mt-5">
                  <CTAButton href="/contact" variant="primary">
                    Contact me
                  </CTAButton>
                </CTARow>
              </CardContent>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
