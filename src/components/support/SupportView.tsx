"use client";

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Copy, ExternalLink, Mail } from 'lucide-react';
import { SupportNav } from '@/components/SupportNav';

type Intent = 'client' | 'community' | 'companionship';

type Metadata = {
  forWho?: string;
  helpType?: string;
  urgency?: string;
  contactMethod?: string;
  frequency?: string;
  projectGoal?: string;
  issueType?: string;
  priority?: string;
};

type Errors = {
  name?: string;
  email?: string;
  message?: string;
};

const SUBMISSION_RATE_LIMIT_MS = 30_000;
const MIN_SUBMISSION_TIME_MS = 2_000;
const LAST_SUBMISSION_KEY = 'contact-last-submission';

const intentLabels: Record<Intent, string> = {
  client: 'Project request',
  community: 'Simple tech help',
  companionship: 'Regular check-ins',
};

const intentIntro: Record<Intent, string> = {
  client: 'Share the goal, the issue, or the workflow. If you are not sure, choose the closest options.',
  community: 'This form is short. You can request help for yourself or someone else.',
  companionship: 'No video calls. These check-ins are by email, SMS, WhatsApp, or another simple message option.',
};

const messagePrefill: Record<Intent, string> = {
  client: '',
  community: '',
  companionship: '',
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function isLowQualityText(value: string) {
  const text = value.trim();
  return text.length < 10 || /^(.)\1{4,}$/.test(text) || /^[^a-zA-Z]*$/.test(text);
}

function validate(name: string, email: string, message: string): Errors {
  const errors: Errors = {};

  if (!name.trim()) errors.name = 'Please enter your name.';
  if (!email.trim()) errors.email = 'Please enter your email address.';
  else if (!isValidEmail(email)) errors.email = 'Please enter a valid email address.';
  if (!message.trim()) errors.message = 'Please add a message.';
  else if (isLowQualityText(message)) errors.message = 'Please write a short sentence so I have enough context.';

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

function ButtonGroup({
  label,
  hint,
  options,
  value,
  onChange,
  large = false,
}: {
  label: string;
  hint?: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  large?: boolean;
}) {
  return (
    <div>
      <p className={`${large ? 'text-xl' : 'text-base'} mb-2 font-semibold text-[var(--text-primary)]`}>
        {label}
      </p>
      {hint ? <p className="mb-3 text-base leading-relaxed text-[var(--text-secondary)]">{hint}</p> : null}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2" role="group" aria-label={label}>
        {options.map((option) => {
          const selected = value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(selected ? '' : option.value)}
              className={`min-h-[56px] border px-5 py-4 text-left text-base focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[var(--text-primary)] ${
                selected
                  ? 'border-[var(--text-primary)] bg-[var(--text-primary)] font-semibold text-[var(--bg-base)]'
                  : 'border-[var(--border-strong)] bg-[var(--ui-surface)] text-[var(--text-primary)] hover:bg-[var(--hover-bg)]'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface SupportViewProps {
  initialIntent?: string;
}

export function SupportView({ initialIntent }: SupportViewProps) {
  const resolvedIntent = ['client', 'community', 'companionship'].includes(initialIntent ?? '')
    ? (initialIntent as Intent)
    : 'client';
  const [intent] = useState<Intent>(resolvedIntent);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(messagePrefill[resolvedIntent]);
  const [company, setCompany] = useState('');
  const [meta, setMeta] = useState<Metadata>({});
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
  const isCommunity = intent !== 'client';

  function showError(field: keyof Errors) {
    return submitAttempted || Boolean(touched[field]);
  }

  function setMetaField(key: keyof Metadata, value: string) {
    setMeta((current) => ({ ...current, [key]: value }));
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
          intent,
          name,
          email,
          message,
          company,
          formElapsedMs: String(Date.now() - formStartTime),
          metadata: JSON.stringify(meta),
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
      <SupportNav active={intent === 'client' ? 'client' : 'community'} />

      <header className="border-b border-[var(--border-subtle)] px-4 py-10 md:px-8 md:py-14 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <p className="mb-4 text-base font-semibold text-[var(--text-secondary)]">
            {intentLabels[intent]}
          </p>
          <h1 className="font-display text-4xl font-bold leading-tight text-[var(--text-primary)] md:text-5xl lg:text-6xl">
            {intent === 'client' ? 'Tell me what you need' : 'Request support'}
          </h1>
          <p className={`${isCommunity ? 'text-xl md:text-2xl' : 'text-lg md:text-xl'} mt-4 max-w-3xl leading-relaxed text-[var(--text-secondary)]`}>
            {intentIntro[intent]}
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
                  Thanks. I&apos;ll take a look and get back to you soon.
                </p>
                <Link href="/reception" className="ui-button mt-8 min-h-[48px] px-6 py-4 text-base font-semibold focus:outline focus:outline-2 focus:outline-offset-4 focus:outline-[var(--text-primary)]">
                  Back to reception
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-8">
                <label className="sr-only" htmlFor="support-company">
                  Company
                </label>
                <input
                  id="support-company"
                  name="company"
                  type="text"
                  value={company}
                  onChange={(event) => setCompany(event.target.value)}
                  className="hidden"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                />

                <div className="border border-[var(--border-subtle)] bg-[var(--bg-base)] p-5">
                  <p className="text-base font-semibold text-[var(--text-primary)]">Request type</p>
                  <p className="mt-2 text-base leading-relaxed text-[var(--text-secondary)]">
                    {intentLabels[intent]}
                  </p>
                  <Link href="/reception" className="mt-4 inline-flex min-h-[48px] items-center text-base font-semibold text-[var(--text-primary)] underline underline-offset-4 focus:outline focus:outline-2 focus:outline-offset-4 focus:outline-[var(--text-primary)]">
                    Choose a different route
                  </Link>
                </div>

                <div className="flex flex-col gap-7">
                  {intent === 'client' ? (
                    <>
                      <ButtonGroup
                        label="What are you trying to do?"
                        hint="Choose Not sure if the work is still fuzzy."
                        options={[
                          { value: 'fix', label: 'Fix something' },
                          { value: 'build', label: 'Build something new' },
                          { value: 'improve', label: 'Improve performance' },
                          { value: 'not-sure', label: 'Not sure' },
                        ]}
                        value={meta.projectGoal ?? ''}
                        onChange={(value) => setMetaField('projectGoal', value)}
                      />
                      <ButtonGroup
                        label="What area is it in?"
                        options={[
                          { value: 'website', label: 'Website' },
                          { value: 'app', label: 'App' },
                          { value: 'automation', label: 'Automation' },
                          { value: 'not-sure', label: 'Not sure' },
                        ]}
                        value={meta.issueType ?? ''}
                        onChange={(value) => setMetaField('issueType', value)}
                      />
                      <ButtonGroup
                        label="Priority"
                        options={[
                          { value: 'normal', label: 'Normal' },
                          { value: 'soon', label: 'Soon' },
                          { value: 'not-sure', label: 'Not sure' },
                        ]}
                        value={meta.priority ?? ''}
                        onChange={(value) => setMetaField('priority', value)}
                      />
                    </>
                  ) : null}

                  {intent === 'community' ? (
                    <>
                      <ButtonGroup
                        label="Who is this for?"
                        options={[
                          { value: 'myself', label: 'Myself' },
                          { value: 'someone-else', label: 'Someone else' },
                        ]}
                        value={meta.forWho ?? ''}
                        onChange={(value) => setMetaField('forWho', value)}
                        large
                      />
                      <ButtonGroup
                        label="What kind of help is needed?"
                        options={[
                          { value: 'phone', label: 'Phone or tablet' },
                          { value: 'computer', label: 'Laptop or computer' },
                          { value: 'internet', label: 'Email or internet' },
                          { value: 'not-sure', label: 'Not sure' },
                        ]}
                        value={meta.helpType ?? ''}
                        onChange={(value) => setMetaField('helpType', value)}
                        large
                      />
                    </>
                  ) : null}

                  {intent === 'companionship' ? (
                    <>
                      <ButtonGroup
                        label="Who is this for?"
                        options={[
                          { value: 'myself', label: 'Myself' },
                          { value: 'someone-else', label: 'Someone else' },
                        ]}
                        value={meta.forWho ?? ''}
                        onChange={(value) => setMetaField('forWho', value)}
                        large
                      />
                      <ButtonGroup
                        label="Preferred message method"
                        options={[
                          { value: 'email', label: 'Email' },
                          { value: 'sms', label: 'SMS' },
                          { value: 'whatsapp', label: 'WhatsApp' },
                          { value: 'not-sure', label: 'Not sure' },
                        ]}
                        value={meta.contactMethod ?? ''}
                        onChange={(value) => setMetaField('contactMethod', value)}
                        large
                      />
                      <ButtonGroup
                        label="How often?"
                        options={[
                          { value: 'occasional', label: 'Occasional' },
                          { value: 'weekly', label: 'Weekly' },
                          { value: 'not-sure', label: 'Not sure' },
                        ]}
                        value={meta.frequency ?? ''}
                        onChange={(value) => setMetaField('frequency', value)}
                        large
                      />
                    </>
                  ) : null}
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label htmlFor="support-name" className="mb-2 block text-base font-semibold text-[var(--text-primary)]">
                      Name
                    </label>
                    <input
                      id="support-name"
                      type="text"
                      autoComplete="name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      onBlur={() => setTouched((current) => ({ ...current, name: true }))}
                      aria-describedby="support-name-error"
                      className={inputClassName(showError('name') && Boolean(errors.name))}
                    />
                    <FieldError id="support-name-error" message={showError('name') ? errors.name : ''} />
                  </div>

                  <div>
                    <label htmlFor="support-email" className="mb-2 block text-base font-semibold text-[var(--text-primary)]">
                      Email
                    </label>
                    <input
                      id="support-email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      onBlur={() => setTouched((current) => ({ ...current, email: true }))}
                      aria-describedby="support-email-error"
                      className={inputClassName(showError('email') && Boolean(errors.email))}
                    />
                    <FieldError id="support-email-error" message={showError('email') ? errors.email : ''} />
                  </div>
                </div>

                <div>
                  <label htmlFor="support-message" className={`${isCommunity ? 'text-xl' : 'text-base'} mb-2 block font-semibold text-[var(--text-primary)]`}>
                    Message
                  </label>
                  <textarea
                    id="support-message"
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    onBlur={() => setTouched((current) => ({ ...current, message: true }))}
                    rows={6}
                    minLength={10}
                    aria-describedby="support-message-error"
                    className={`${inputClassName(showError('message') && Boolean(errors.message))} min-h-[180px] resize-y`}
                  />
                  <FieldError id="support-message-error" message={showError('message') ? errors.message : ''} />
                </div>

                <div className="flex flex-col gap-4 border-t border-[var(--border-subtle)] pt-6 md:flex-row md:items-center md:justify-between">
                  <div className="max-w-xl">
                    <p className="text-base leading-relaxed text-[var(--text-secondary)]">
                      I&apos;ll only use these details to respond to your request.
                    </p>
                    <FieldError id="support-submit-error" message={submitError} />
                  </div>
                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className={`${isCommunity ? 'min-h-[56px]' : 'min-h-[48px]'} ui-button w-full px-8 py-4 text-base font-semibold focus:outline focus:outline-2 focus:outline-offset-4 focus:outline-[var(--text-primary)] md:w-auto`}
                  >
                    {isSubmitting ? 'Sending...' : 'Send request'}
                  </button>
                </div>
              </form>
            )}
          </div>

          <aside className="flex flex-col gap-4">
            <div className="border border-[var(--border-subtle)] p-5 md:p-6">
              <h2 className="font-display text-2xl font-semibold text-[var(--text-primary)]">
                What happens next
              </h2>
              <ol className="mt-4 flex flex-col gap-3 text-base leading-relaxed text-[var(--text-secondary)]">
                <li>I take a look at your message.</li>
                <li>I reply with a clear next step.</li>
                <li>There is no pressure to commit.</li>
              </ol>
            </div>

            {(directEmail || linkedInUrl || githubUrl) ? (
              <div className="border border-[var(--border-subtle)] p-5 md:p-6">
                <h2 className="font-display text-2xl font-semibold text-[var(--text-primary)]">
                  Direct contact
                </h2>
                <p className="mt-3 text-base leading-relaxed text-[var(--text-secondary)]">
                  You can also email directly.
                </p>

                {directEmail ? (
                  <div className="mt-5 flex flex-col gap-3">
                    <a href={`mailto:${directEmail}`} className="inline-flex min-h-[48px] items-center gap-3 break-all text-base text-[var(--text-primary)] underline underline-offset-4 focus:outline focus:outline-2 focus:outline-offset-4 focus:outline-[var(--text-primary)]">
                      <Mail className="h-5 w-5 shrink-0" />
                      <span>{directEmail}</span>
                    </a>
                    <button type="button" onClick={handleCopyEmail} className="ui-button min-h-[48px] w-full px-5 py-3 text-base font-semibold focus:outline focus:outline-2 focus:outline-offset-4 focus:outline-[var(--text-primary)]">
                      <Copy className="h-5 w-5" />
                      {copyState === 'copied' ? 'Copied' : copyState === 'error' ? 'Use email link' : 'Copy email'}
                    </button>
                  </div>
                ) : null}

                {(linkedInUrl || githubUrl) ? (
                  <div className="mt-5 grid gap-3">
                    {linkedInUrl ? (
                      <a href={linkedInUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-[48px] items-center gap-3 border border-[var(--border-subtle)] px-4 py-3 text-base text-[var(--text-primary)] hover:bg-[var(--hover-bg)] focus:outline focus:outline-2 focus:outline-offset-4 focus:outline-[var(--text-primary)]">
                        <ExternalLink className="h-5 w-5" />
                        LinkedIn
                      </a>
                    ) : null}
                    {githubUrl ? (
                      <a href={githubUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-[48px] items-center gap-3 border border-[var(--border-subtle)] px-4 py-3 text-base text-[var(--text-primary)] hover:bg-[var(--hover-bg)] focus:outline focus:outline-2 focus:outline-offset-4 focus:outline-[var(--text-primary)]">
                        <ExternalLink className="h-5 w-5" />
                        GitHub
                      </a>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : null}
          </aside>
        </div>
      </section>
    </main>
  );
}
