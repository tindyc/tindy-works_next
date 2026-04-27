"use client";

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Copy, ExternalLink, Mail } from 'lucide-react';
import { SupportNav } from '@/components/layout/SupportNav';

type Errors = {
  name?: string;
  email?: string;
  message?: string;
};

const SUBMISSION_RATE_LIMIT_MS = 30_000;
const MIN_SUBMISSION_TIME_MS = 2_000;
const LAST_SUBMISSION_KEY = 'contact-last-submission';

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function validate(name: string, email: string, message: string): Errors {
  const errors: Errors = {};

  if (!name.trim()) errors.name = 'Please enter your name.';
  if (!email.trim()) errors.email = 'Please enter your email address.';
  else if (!isValidEmail(email)) errors.email = 'Please enter a valid email address.';
  if (!message.trim()) errors.message = 'Please add a message.';
  else if (message.trim().length < 10 || /^(.)\1{4,}$/.test(message.trim()) || /^[^a-zA-Z]*$/.test(message.trim())) {
    errors.message = 'Please write a short sentence so I have enough context.';
  }

  return errors;
}

function inputClassName(hasError: boolean) {
  return `min-h-[56px] w-full border bg-[var(--bg-base)] px-4 py-4 text-base text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[var(--text-primary)] ${
    hasError ? 'border-[var(--status-danger)]' : 'border-[var(--border-strong)]'
  }`;
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;

  return (
    <p id={id} className="mt-3 text-base text-[var(--status-danger)]" role="alert">
      {message}
    </p>
  );
}

export function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [company, setCompany] = useState('');
  const [formStartTime] = useState(() => Date.now());
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle');

  const directEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() ?? '';
  const linkedInUrl = process.env.NEXT_PUBLIC_LINKEDIN_URL?.trim() ?? '';
  const githubUrl = process.env.NEXT_PUBLIC_GITHUB_URL?.trim() ?? '';
  const errors = validate(name, email, message);
  const canSubmit = Object.keys(errors).length === 0 && !isSubmitting;

  function showError(field: keyof Errors) {
    return submitAttempted || Boolean(touched[field]);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitAttempted(true);
    setSubmitError('');

    if (company.trim()) return;
    if (Object.keys(errors).length > 0 || isSubmitting) return;

    if (Date.now() - formStartTime < MIN_SUBMISSION_TIME_MS) {
      setSubmitError('Please take a moment to review your message before sending it.');
      return;
    }

    const lastSubmission = window.localStorage.getItem(LAST_SUBMISSION_KEY);
    if (lastSubmission && Date.now() - Number(lastSubmission) < SUBMISSION_RATE_LIMIT_MS) {
      setSubmitError('Please wait a short moment before sending another message.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intent: 'general',
          name,
          email,
          message,
          company,
          formElapsedMs: String(Date.now() - formStartTime),
          metadata: '{}',
        }),
      });
      const body = (await response.json()) as { error?: string };

      if (!response.ok) throw new Error(body.error ?? 'Unable to send your message right now.');

      window.localStorage.setItem(LAST_SUBMISSION_KEY, String(Date.now()));
      setIsSubmitted(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Unable to send your message right now.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCopyEmail() {
    if (!directEmail) return;

    try {
      await navigator.clipboard.writeText(directEmail);
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('error');
      window.setTimeout(() => setCopyState('idle'), 1800);
    }
  }

  return (
    <main className="mt-[64px] flex min-h-[calc(100vh-64px)] w-full flex-grow flex-col border-t border-[var(--border-subtle)] bg-[var(--bg-base)] md:mt-[88px] md:min-h-[calc(100vh-88px)]">
      <SupportNav active="contact" />

      <header className="border-b border-[var(--border-subtle)] px-4 py-10 md:px-8 md:py-14 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <p className="mb-4 text-base font-semibold text-[var(--text-secondary)]">Contact</p>
          <h1 className="font-display text-4xl font-bold leading-tight text-[var(--text-primary)] md:text-5xl lg:text-6xl">
            Get in touch
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-[var(--text-secondary)] md:text-xl">
            For opportunities, recruitment, or general questions.
          </p>
        </div>
      </header>

      <section className="flex-grow px-4 py-10 md:px-8 md:py-14 lg:px-16">
        <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="border border-[var(--border-subtle)] bg-[var(--ui-surface)] p-4 md:p-8 lg:p-10">
            {isSubmitted ? (
              <div>
                <h2 className="font-display text-3xl font-semibold text-[var(--text-primary)] md:text-4xl">
                  Message sent
                </h2>
                <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[var(--text-secondary)]">
                  Thanks. I&apos;ll get back to you soon.
                </p>
                <Link href="/reception" className="ui-button mt-8 min-h-[56px] px-6 py-4 text-base font-semibold focus:outline focus:outline-2 focus:outline-offset-4 focus:outline-[var(--text-primary)]">
                  Back to reception
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
                <label className="sr-only" htmlFor="contact-company">
                  Company
                </label>
                <input
                  id="contact-company"
                  name="company"
                  type="text"
                  value={company}
                  onChange={(event) => setCompany(event.target.value)}
                  className="hidden"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                />

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label htmlFor="contact-name" className="mb-2 block text-base font-semibold text-[var(--text-primary)]">
                      Name
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      autoComplete="name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      onBlur={() => setTouched((current) => ({ ...current, name: true }))}
                      aria-describedby="contact-name-error"
                      className={inputClassName(showError('name') && Boolean(errors.name))}
                    />
                    <FieldError id="contact-name-error" message={showError('name') ? errors.name : ''} />
                  </div>

                  <div>
                    <label htmlFor="contact-email" className="mb-2 block text-base font-semibold text-[var(--text-primary)]">
                      Email
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      onBlur={() => setTouched((current) => ({ ...current, email: true }))}
                      aria-describedby="contact-email-error"
                      className={inputClassName(showError('email') && Boolean(errors.email))}
                    />
                    <FieldError id="contact-email-error" message={showError('email') ? errors.email : ''} />
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-message" className="mb-2 block text-base font-semibold text-[var(--text-primary)]">
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    onBlur={() => setTouched((current) => ({ ...current, message: true }))}
                    rows={6}
                    minLength={10}
                    aria-describedby="contact-message-error"
                    className={`${inputClassName(showError('message') && Boolean(errors.message))} min-h-[180px] resize-y`}
                  />
                  <FieldError id="contact-message-error" message={showError('message') ? errors.message : ''} />
                </div>

                <div className="flex flex-col gap-4 border-t border-[var(--border-subtle)] pt-6 md:flex-row md:items-center md:justify-between">
                  <div className="max-w-xl">
                    <p className="text-base leading-relaxed text-[var(--text-secondary)]">
                      I&apos;ll only use these details to reply.
                    </p>
                    <FieldError id="contact-submit-error" message={submitError} />
                  </div>
                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className="ui-button min-h-[56px] w-full px-8 py-4 text-base font-semibold focus:outline focus:outline-2 focus:outline-offset-4 focus:outline-[var(--text-primary)] md:w-auto"
                  >
                    {isSubmitting ? 'Sending...' : 'Send message'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {(directEmail || linkedInUrl || githubUrl) ? (
            <aside className="border border-[var(--border-subtle)] p-5 md:p-6">
              <h2 className="font-display text-2xl font-semibold text-[var(--text-primary)]">
                Direct contact
              </h2>
              <p className="mt-3 text-base leading-relaxed text-[var(--text-secondary)]">
                You can also email directly or use the links below.
              </p>

              {directEmail ? (
                <div className="mt-5 flex flex-col gap-3">
                  <a href={`mailto:${directEmail}`} className="inline-flex min-h-[56px] items-center gap-3 break-all text-base text-[var(--text-primary)] underline underline-offset-4 focus:outline focus:outline-2 focus:outline-offset-4 focus:outline-[var(--text-primary)]">
                    <Mail className="h-5 w-5 shrink-0" />
                    <span>{directEmail}</span>
                  </a>
                  <button type="button" onClick={handleCopyEmail} className="ui-button min-h-[56px] w-full px-5 py-3 text-base font-semibold focus:outline focus:outline-2 focus:outline-offset-4 focus:outline-[var(--text-primary)]">
                    <Copy className="h-5 w-5" />
                    {copyState === 'copied' ? 'Copied' : copyState === 'error' ? 'Use email link' : 'Copy email'}
                  </button>
                </div>
              ) : null}

              {(linkedInUrl || githubUrl) ? (
                <div className="mt-5 grid gap-3">
                  {linkedInUrl ? (
                    <a href={linkedInUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-[56px] items-center gap-3 border border-[var(--border-subtle)] px-4 py-3 text-base text-[var(--text-primary)] hover:bg-[var(--hover-bg)] focus:outline focus:outline-2 focus:outline-offset-4 focus:outline-[var(--text-primary)]">
                      <ExternalLink className="h-5 w-5" />
                      LinkedIn
                    </a>
                  ) : null}
                  {githubUrl ? (
                    <a href={githubUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-[56px] items-center gap-3 border border-[var(--border-subtle)] px-4 py-3 text-base text-[var(--text-primary)] hover:bg-[var(--hover-bg)] focus:outline focus:outline-2 focus:outline-offset-4 focus:outline-[var(--text-primary)]">
                      <ExternalLink className="h-5 w-5" />
                      GitHub
                    </a>
                  ) : null}
                </div>
              ) : null}
            </aside>
          ) : null}
        </div>
      </section>
    </main>
  );
}
