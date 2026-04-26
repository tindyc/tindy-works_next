"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { Copy, ExternalLink, Mail } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { SupportNav } from '../components/SupportNav';

type TopicOption = 'Work opportunity' | 'Collaboration' | 'General question';

type ContactErrors = {
  name?: string;
  email?: string;
  message?: string;
  submit?: string;
};

type ContactTouched = Record<string, boolean>;

const SUBMISSION_RATE_LIMIT_MS = 30_000;
const MIN_SUBMISSION_TIME_MS = 2_000;
const LAST_SUBMISSION_KEY = 'contact-last-submission';
const TOPIC_OPTIONS: TopicOption[] = ['Work opportunity', 'Collaboration', 'General question'];

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

const getInputClassName = (hasError: boolean) =>
  `w-full border bg-[var(--bg-base)] px-5 py-4 text-base text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none transition-colors ${
    hasError
      ? 'border-red-500 focus:border-red-500'
      : 'border-[var(--border-strong)] focus:border-[var(--text-primary)]'
  }`;

const getTextAreaClassName = (hasError: boolean) =>
  `${getInputClassName(hasError)} resize-y min-h-[180px]`;

function getValidationErrors({
  name,
  email,
  message,
}: {
  name: string;
  email: string;
  message: string;
}): ContactErrors {
  const errors: ContactErrors = {};

  if (!name.trim()) {
    errors.name = 'Please enter your name.';
  }

  if (!email.trim()) {
    errors.email = 'Please enter your email address.';
  } else if (!isValidEmail(email)) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!message.trim()) {
    errors.message = 'Please add a message.';
  } else if (message.trim().length < 10) {
    errors.message = 'Please write at least 10 characters so I have enough context.';
  }

  return errors;
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p id={id} className="mt-3 text-sm text-red-500" role="alert">
      {message}
    </p>
  );
}

export function Contact() {
  const [topic, setTopic] = useState<TopicOption | ''>('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [company, setCompany] = useState('');
  const [formStartTime, setFormStartTime] = useState(() => Date.now());
  const [touchedFields, setTouchedFields] = useState<ContactTouched>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle');

  const directEmail = import.meta.env.VITE_CONTACT_EMAIL?.trim() ?? '';
  const linkedInUrl = import.meta.env.VITE_LINKEDIN_URL?.trim() ?? '';
  const githubUrl = import.meta.env.VITE_GITHUB_URL?.trim() ?? '';

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const validationErrors = useMemo(
    () =>
      getValidationErrors({
        name,
        email,
        message,
      }),
    [email, message, name]
  );

  const canSubmit = Object.keys(validationErrors).length === 0 && !isSubmitting;

  const shouldShowError = (field: keyof ContactErrors) => submitAttempted || touchedFields[field];

  const markTouched = (field: string) => {
    setTouchedFields((current) => ({ ...current, [field]: true }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitAttempted(true);

    if (Object.keys(validationErrors).length > 0 || isSubmitting) {
      return;
    }

    if (company.trim()) {
      return;
    }

    if (Date.now() - formStartTime < MIN_SUBMISSION_TIME_MS) {
      setTouchedFields((current) => ({ ...current, submit: true }));
      return;
    }

    const lastSubmission = window.localStorage.getItem(LAST_SUBMISSION_KEY);
    if (lastSubmission && Date.now() - Number(lastSubmission) < SUBMISSION_RATE_LIMIT_MS) {
      setTouchedFields((current) => ({ ...current, submit: true }));
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => window.setTimeout(resolve, 500));
    window.localStorage.setItem(LAST_SUBMISSION_KEY, String(Date.now()));
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const submitErrorMessage = useMemo(() => {
    if (!shouldShowError('submit')) {
      return '';
    }

    if (Date.now() - formStartTime < MIN_SUBMISSION_TIME_MS) {
      return 'Please take a moment to review your message before sending it.';
    }

    const lastSubmission = window.localStorage.getItem(LAST_SUBMISSION_KEY);
    if (lastSubmission && Date.now() - Number(lastSubmission) < SUBMISSION_RATE_LIMIT_MS) {
      return 'Please wait a short moment before sending another message.';
    }

    return '';
  }, [formStartTime, submitAttempted, touchedFields]);

  const handleCopyEmail = async () => {
    if (!directEmail) {
      return;
    }

    try {
      await navigator.clipboard.writeText(directEmail);
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('error');
      window.setTimeout(() => setCopyState('idle'), 1800);
    }
  };

  return (
    <main className="flex-grow w-full border-t border-[var(--border-subtle)] flex flex-col relative bg-[var(--bg-base)] max-w-[1440px] mx-auto border-x min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-88px)] mt-[64px] md:mt-[88px]">
      <SupportNav />

      <header className="p-8 md:p-16 border-b border-[var(--border-subtle)]">
        <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tighter uppercase mb-3 text-[var(--text-primary)] drop-shadow-md">
          Contact
        </h1>
        <p className="font-mono text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-6">
          SYS.NODE: CONTACT_INTERFACE
        </p>
        <p className="font-sans text-base md:text-lg text-[var(--text-secondary)] max-w-2xl leading-relaxed">
          For anything else - projects, collaboration, or general enquiries.
        </p>
      </header>

      <section className="p-4 md:p-16 flex-grow">
        <div className="w-full max-w-6xl mx-auto grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
          <div className="border border-[var(--border-subtle)] p-8 md:p-12 tech-panel bg-[var(--bg-base)]">
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-8">
                <input
                  type="text"
                  name="company"
                  value={company}
                  onChange={(event) => setCompany(event.target.value)}
                  className="hidden"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                />

                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-secondary)] mb-4">
                    CONTACT FORM
                  </p>
                  <h2 className="font-display text-4xl uppercase tracking-wider mb-3">Send a message</h2>
                  <p className="text-[var(--text-secondary)] font-sans text-base leading-relaxed max-w-2xl">
                    Use this for project enquiries, collaborations, or anything that does not belong in support.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="block font-mono text-[10px] uppercase tracking-widest text-[var(--text-secondary)] mb-3"
                    >
                      Name
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      autoComplete="name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      onBlur={() => markTouched('name')}
                      placeholder="Your name"
                      aria-invalid={shouldShowError('name') && Boolean(validationErrors.name)}
                      aria-describedby="contact-name-error"
                      className={getInputClassName(shouldShowError('name') && Boolean(validationErrors.name))}
                    />
                    <FieldError id="contact-name-error" message={shouldShowError('name') ? validationErrors.name : ''} />
                  </div>

                  <div>
                    <label
                      htmlFor="contact-email"
                      className="block font-mono text-[10px] uppercase tracking-widest text-[var(--text-secondary)] mb-3"
                    >
                      Email
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      onBlur={() => markTouched('email')}
                      placeholder="you@example.com"
                      aria-invalid={shouldShowError('email') && Boolean(validationErrors.email)}
                      aria-describedby="contact-email-error"
                      className={getInputClassName(shouldShowError('email') && Boolean(validationErrors.email))}
                    />
                    <FieldError id="contact-email-error" message={shouldShowError('email') ? validationErrors.email : ''} />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="contact-topic"
                    className="block font-mono text-[10px] uppercase tracking-widest text-[var(--text-secondary)] mb-3"
                  >
                    Topic
                  </label>
                  <select
                    id="contact-topic"
                    value={topic}
                    onChange={(event) => setTopic(event.target.value as TopicOption | '')}
                    className={getInputClassName(false)}
                  >
                    <option value="">Choose a topic</option>
                    {TOPIC_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="contact-message"
                    className="block font-mono text-[10px] uppercase tracking-widest text-[var(--text-secondary)] mb-3"
                  >
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    onBlur={() => markTouched('message')}
                    placeholder="Tell me a little about what you need."
                    rows={7}
                    minLength={10}
                    aria-invalid={shouldShowError('message') && Boolean(validationErrors.message)}
                    aria-describedby="contact-message-help contact-message-error"
                    className={getTextAreaClassName(shouldShowError('message') && Boolean(validationErrors.message))}
                  />
                  <p id="contact-message-help" className="mt-3 text-sm text-[var(--text-secondary)] leading-relaxed">
                    For technical help, please use the Support page.
                  </p>
                  <FieldError
                    id="contact-message-error"
                    message={shouldShowError('message') ? validationErrors.message : ''}
                  />
                </div>

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-t border-[var(--border-subtle)] pt-6">
                  <div className="max-w-xl">
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                      I&apos;ll only use these details to respond to your message.
                    </p>
                    <FieldError id="contact-submit-error" message={submitErrorMessage} />
                  </div>
                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className="bg-[var(--text-primary)] text-[var(--bg-base)] px-8 py-4 font-mono text-[10px] uppercase font-bold tracking-widest hover:bg-neutral-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed min-w-[220px]"
                  >
                    {isSubmitting ? 'Sending...' : 'Send message'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-secondary)] mb-4">
                  SYS.RECEIVED
                </p>
                <h2 className="font-display text-4xl uppercase tracking-wider mb-4">Message sent</h2>
                <p className="text-[var(--text-secondary)] font-sans text-base md:text-lg leading-relaxed max-w-2xl">
                  Thanks - I&apos;ll get back to you soon.
                </p>
                <div className="mt-10">
                  <NavLink
                    to="/"
                    className="inline-flex items-center justify-center bg-[var(--text-primary)] text-[var(--bg-base)] px-8 py-4 font-mono text-[10px] uppercase font-bold tracking-widest hover:bg-neutral-300 transition-colors"
                  >
                    Return to Studio
                  </NavLink>
                </div>
              </div>
            )}
          </div>

          <aside className="flex flex-col gap-6">
            <div className="border border-[var(--border-subtle)] p-8 tech-panel bg-[var(--bg-base)]">
              <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-secondary)] mb-4">
                DIRECT CONTACT
              </p>
              <h2 className="font-display text-3xl uppercase tracking-wide mb-4">Reach me directly</h2>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-6">
                If you already know what you need, you can email directly or use the links below.
              </p>

              {directEmail ? (
                <div className="border border-[var(--border-strong)] p-5 bg-[var(--bg-base)]">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-secondary)] mb-3">Email</p>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <a
                      href={`mailto:${directEmail}`}
                      className="inline-flex items-center gap-3 text-[var(--text-primary)] hover:text-[var(--text-secondary)] transition-colors break-all"
                    >
                      <Mail className="w-4 h-4" />
                      <span>{directEmail}</span>
                    </a>
                    <button
                      type="button"
                      onClick={handleCopyEmail}
                      className="inline-flex items-center justify-center gap-2 border border-[var(--border-strong)] px-4 py-2 font-mono text-[10px] uppercase tracking-widest hover:border-[var(--text-primary)] hover:text-[var(--text-primary)] transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {copyState === 'copied' ? 'Copied' : copyState === 'error' ? 'Try mailto' : 'Copy'}
                    </button>
                  </div>
                </div>
              ) : null}

              {(linkedInUrl || githubUrl) && (
                <div className="mt-4 grid gap-3">
                  {linkedInUrl ? (
                    <a
                      href={linkedInUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between border border-[var(--border-strong)] p-4 hover:border-[var(--text-primary)] hover:bg-[var(--hover-bg)] transition-colors"
                    >
                      <span className="inline-flex items-center gap-3">
                        <ExternalLink className="w-4 h-4" />
                        <span>LinkedIn</span>
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-secondary)]">Open</span>
                    </a>
                  ) : null}

                  {githubUrl ? (
                    <a
                      href={githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between border border-[var(--border-strong)] p-4 hover:border-[var(--text-primary)] hover:bg-[var(--hover-bg)] transition-colors"
                    >
                      <span className="inline-flex items-center gap-3">
                        <ExternalLink className="w-4 h-4" />
                        <span>GitHub</span>
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-secondary)]">Open</span>
                    </a>
                  ) : null}
                </div>
              )}
            </div>
          </aside>
        </div>
      </section>

      <footer className="p-8 flex justify-between items-center font-mono text-[10px] uppercase text-[var(--text-secondary)] tracking-widest border-t border-[var(--border-subtle)] mt-auto bg-[var(--bg-base)]">
        <div>LOCAL PORT: 3000</div>
        <div className="hidden sm:block">NODE: CONTACT_ACTIVE</div>
        <div>SYS.STATUS: NOMINAL</div>
      </footer>
    </main>
  );
}
