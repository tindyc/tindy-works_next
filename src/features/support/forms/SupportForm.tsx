'use client';

import { useState, type FormEvent, type ReactNode } from 'react';
import Link from 'next/link';
import { Copy, ExternalLink, Mail } from 'lucide-react';
import { SupportNav } from '@/components/layout/SupportNav';
import { getIntentConfig, type Intent } from '@/features/support/types/intent';
import { inputClassName } from '@/styles/forms';
import { primaryCta, primaryCtaBlock, secondaryCta } from '@/styles/ui';

type Metadata = {
  forWho?: string;
  helpType?: string;
  urgency?: string;
  frequency?: string;
  projectGoal?: string;
  issueType?: string;
  priority?: string;
  personName?: string;
  relationship?: string;
  personContactMethod?: string;
  personPhone?: string;
  notes?: string;
};

type Errors = {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  contactMethod?: string;
  projectGoal?: string;
  issueType?: string;
  frequency?: string;
  personName?: string;
  relationship?: string;
  consentRequired?: string;
};

const SUBMISSION_RATE_LIMIT_MS = 30_000;
const LAST_SUBMISSION_KEY = 'support-last-submission';
const PHONE_REGEX = /^\+?[0-9\s\-() ]{7,}$/;
const ctaRowClassName =
  'flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center md:gap-4';

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function isValidPhone(value: string) {
  return PHONE_REGEX.test(value.trim());
}

function isLowQualityText(value: string) {
  const text = value.trim();
  return text.length < 10 || /^(.)\1{4,}$/.test(text) || /^[^a-zA-Z]*$/.test(text);
}

function validate(
  intent: Intent,
  name: string,
  email: string,
  phone: string,
  message: string,
  contactMethod: string,
  meta: Metadata,
  consentRequired: boolean,
): Errors {
  const errors: Errors = {};
  const intentConfig = getIntentConfig(intent);

  if (!name.trim()) errors.name = 'Please enter your name.';

  if (!contactMethod) {
    errors.contactMethod = 'Please choose how you would like to be contacted.';
  } else if (contactMethod === 'email') {
    if (!email.trim()) errors.email = 'Please enter your email address.';
    else if (!isValidEmail(email)) errors.email = 'Please enter a valid email address.';
  } else if (contactMethod === 'sms' || contactMethod === 'whatsapp') {
    if (!phone.trim()) errors.phone = 'Please enter your phone number.';
    else if (!isValidPhone(phone)) errors.phone = 'Please enter a valid phone number (e.g. +44 7700 000000).';
  } else if (contactMethod === 'not-sure') {
    const hasEmail = Boolean(email.trim()) && isValidEmail(email);
    const hasPhone = Boolean(phone.trim()) && isValidPhone(phone);
    if (!hasEmail && !hasPhone) {
      errors.email = 'Please provide at least an email or phone number.';
    } else {
      if (email.trim() && !isValidEmail(email)) errors.email = 'Please enter a valid email address.';
      if (phone.trim() && !isValidPhone(phone)) errors.phone = 'Please enter a valid phone number.';
    }
  }

  if (!message.trim()) errors.message = 'Please add a message.';
  else if (isLowQualityText(message)) errors.message = 'Please write a short sentence so I have enough context.';

  if (meta.forWho === 'someone-else') {
    if (!meta.personName?.trim()) errors.personName = 'Please enter their name.';
    if (!meta.relationship) errors.relationship = 'Please indicate your relationship.';
  }

  if (intentConfig.validation.requiresProjectMetadata) {
    if (!meta.projectGoal) errors.projectGoal = 'Please choose the closest project goal.';
    if (!meta.issueType) errors.issueType = 'Please choose the closest project area.';
  }

  if (intentConfig.validation.requiresCompanionshipMetadata && !meta.frequency) {
    errors.frequency = 'Please choose how often check-ins are needed.';
  }

  if (!consentRequired) errors.consentRequired = 'Please accept to continue.';

  return errors;
}

function FieldError({
  id,
  message,
  assertive = false,
}: {
  id: string;
  message?: string;
  assertive?: boolean;
}) {
  if (!message) return null;

  return (
    <p
      id={id}
      className="mt-3 text-base text-[var(--status-danger)]"
      role="alert"
      aria-live={assertive ? 'assertive' : undefined}
    >
      {message}
    </p>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="border-b border-[var(--border-subtle)] pb-2 text-sm font-semibold uppercase tracking-widest text-[var(--text-secondary)]">
      {children}
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

interface SupportFormProps {
  initialIntent: Intent;
}

export function SupportForm({ initialIntent }: SupportFormProps) {
  const intent = initialIntent;
  const intentConfig = getIntentConfig(intent);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [contactMethod, setContactMethod] = useState('');
  const [message, setMessage] = useState('');
  const [company, setCompany] = useState('');
  const [meta, setMeta] = useState<Metadata>({});
  const [consentRequired, setConsentRequired] = useState(false);
  const [consentOptional, setConsentOptional] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle');

  const directEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() ?? '';
  const linkedInUrl = process.env.NEXT_PUBLIC_LINKEDIN_URL?.trim() ?? '';
  const githubUrl = process.env.NEXT_PUBLIC_GITHUB_URL?.trim() ?? '';

  const errors = validate(intent, name, email, phone, message, contactMethod, meta, consentRequired);
  const canSubmit = Object.keys(errors).length === 0 && !isSubmitting;
  const isCommunity = intentConfig.behaviour.useCommunitySizing;
  const showEmailField = contactMethod === '' || contactMethod === 'email' || contactMethod === 'not-sure';
  const showPhoneField = contactMethod === 'sms' || contactMethod === 'whatsapp' || contactMethod === 'not-sure';

  function showError(field: keyof Errors) {
    return submitAttempted || Boolean(touched[field]);
  }

  function setMetaField(key: keyof Metadata, value: string) {
    setMeta((current) => ({ ...current, [key]: value }));
  }

  function touch(field: string) {
    setTouched((current) => ({ ...current, [field]: true }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitAttempted(true);
    setSubmitError('');

    if (company.trim()) return;

    if (Object.keys(errors).length > 0) {
      const firstErrorField = Object.keys(errors)[0];
      const el = document.getElementById(`support-${firstErrorField}`);
      el?.focus();
      return;
    }

    if (isSubmitting) return;

    const lastSubmission = window.localStorage.getItem(LAST_SUBMISSION_KEY);
    if (lastSubmission && Date.now() - Number(lastSubmission) < SUBMISSION_RATE_LIMIT_MS) {
      setSubmitError('Please wait a short moment before sending another message.');
      return;
    }

    setIsSubmitting(true);

    try {
      const metaToSend: Metadata = {
        ...(meta.forWho ? { forWho: meta.forWho } : {}),
        ...(meta.helpType ? { helpType: meta.helpType } : {}),
        ...(meta.frequency ? { frequency: meta.frequency } : {}),
        ...(meta.projectGoal ? { projectGoal: meta.projectGoal } : {}),
        ...(meta.issueType ? { issueType: meta.issueType } : {}),
        ...(meta.priority ? { priority: meta.priority } : {}),
        ...(meta.forWho === 'someone-else'
          ? {
              personName: meta.personName,
              relationship: meta.relationship,
              ...(meta.personContactMethod ? { personContactMethod: meta.personContactMethod } : {}),
              ...(meta.personContactMethod === 'phone' && meta.personPhone
                ? { personPhone: meta.personPhone }
                : {}),
              ...(meta.notes ? { notes: meta.notes } : {}),
            }
          : {}),
      };

      const body: Record<string, unknown> = {
        intent,
        name,
        message,
        contactMethod,
        company,
        consentRequired: true,
        metadata: JSON.stringify(metaToSend),
      };

      if (email.trim()) body.email = email.trim();
      if (phone.trim()) body.phone = phone.trim();
      if (meta.priority) body.priority = meta.priority;
      if (consentOptional) body.consentOptional = true;

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const responseBody = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(responseBody.error ?? 'Unable to send your message right now.');

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
      <SupportNav active={intentConfig.navigation.supportNavActive} />

      <header className="border-b border-[var(--border-subtle)] px-4 py-10 md:px-8 md:py-14 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <p className="mb-4 text-base font-semibold text-[var(--text-secondary)]">
            {intentConfig.ui.label}
          </p>
          <h1 className="font-display text-4xl font-bold leading-tight text-[var(--text-primary)] md:text-5xl lg:text-6xl">
            {intentConfig.ui.heading}
          </h1>
          <p className={`${isCommunity ? 'text-xl md:text-2xl' : 'text-lg md:text-xl'} mt-4 max-w-3xl leading-relaxed text-[var(--text-secondary)]`}>
            {intentConfig.ui.intro}
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
                <Link href="/reception" className={primaryCtaBlock}>
                  Back to reception
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-10">
                {/* Honeypot */}
                <label className="sr-only" htmlFor="support-company">Company</label>
                <input
                  name="intent"
                  type="hidden"
                  value={intent}
                />

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

                {/* Request type */}
                <div className="border border-[var(--border-subtle)] bg-[var(--bg-base)] p-5">
                  <p className="text-base font-semibold text-[var(--text-primary)]">Request type</p>
                  <p className="mt-2 text-base leading-relaxed text-[var(--text-secondary)]">
                    {intentConfig.ui.label}
                  </p>
                  <Link
                    href="/reception"
                    className="mt-4 inline-flex min-h-[56px] items-center text-base font-semibold text-[var(--text-primary)] underline underline-offset-4 focus:outline focus:outline-2 focus:outline-offset-4 focus:outline-[var(--text-primary)]"
                  >
                    Choose a different route
                  </Link>
                </div>

                {/* Section 1: Who is this for? (community / companionship only) */}
                {intentConfig.behaviour.showWhoSection ? (
                  <div className="flex flex-col gap-5">
                    <SectionLabel>Who is this for?</SectionLabel>
                    <ButtonGroup
                      label="Who needs help?"
                      options={[
                        { value: 'myself', label: 'Myself' },
                        { value: 'someone-else', label: 'Someone else' },
                      ]}
                      value={meta.forWho ?? ''}
                      onChange={(value) => setMetaField('forWho', value)}
                      large
                    />
                    {intentConfig.behaviour.showHelpType ? (
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
                    ) : null}
                    {intentConfig.behaviour.showFrequency ? (
                      <>
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
                        <FieldError
                          id="support-frequency-error"
                          message={showError('frequency') ? errors.frequency : ''}
                        />
                      </>
                    ) : null}
                  </div>
                ) : null}

                {/* Section 2: How should I reply? */}
                <div className="flex flex-col gap-5">
                  <SectionLabel>How should I reply?</SectionLabel>
                  <ButtonGroup
                    label="Contact method"
                    options={[
                      { value: 'email', label: 'Email' },
                      { value: 'sms', label: 'SMS' },
                      { value: 'whatsapp', label: 'WhatsApp' },
                      { value: 'not-sure', label: 'Not sure' },
                    ]}
                    value={contactMethod}
                    onChange={setContactMethod}
                  />
                  <FieldError
                    id="support-contactMethod-error"
                    message={showError('contactMethod') ? errors.contactMethod : ''}
                  />

                  {showEmailField ? (
                    <div>
                      <label
                        htmlFor="support-email"
                        className="mb-2 block text-base font-semibold text-[var(--text-primary)]"
                      >
                        Email
                        {contactMethod === 'not-sure' ? (
                          <span className="ml-1 font-normal text-[var(--text-secondary)]">(optional)</span>
                        ) : null}
                      </label>
                      <input
                        id="support-email"
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        onBlur={() => touch('email')}
                        aria-describedby={showError('email') && errors.email ? 'support-email-error' : undefined}
                        aria-invalid={errors.email ? true : undefined}
                        className={inputClassName(showError('email') && Boolean(errors.email))}
                      />
                      <FieldError id="support-email-error" message={showError('email') ? errors.email : ''} />
                    </div>
                  ) : null}

                  {showPhoneField ? (
                    <div>
                      <label
                        htmlFor="support-phone"
                        className="mb-2 block text-base font-semibold text-[var(--text-primary)]"
                      >
                        Phone number
                        {contactMethod === 'not-sure' ? (
                          <span className="ml-1 font-normal text-[var(--text-secondary)]">(optional)</span>
                        ) : null}
                      </label>
                      <input
                        id="support-phone"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        value={phone}
                        onChange={(event) => setPhone(event.target.value)}
                        onBlur={() => touch('phone')}
                        aria-describedby={showError('phone') && errors.phone ? 'support-phone-error' : undefined}
                        aria-invalid={errors.phone ? true : undefined}
                        className={inputClassName(showError('phone') && Boolean(errors.phone))}
                      />
                      <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                        Only used for the contact method you selected. I won&apos;t call unexpectedly.
                      </p>
                      <FieldError id="support-phone-error" message={showError('phone') ? errors.phone : ''} />
                    </div>
                  ) : null}
                </div>

                {/* Section 3: Your details */}
                <div className="flex flex-col gap-5">
                  <SectionLabel>Your details</SectionLabel>
                  <div>
                    <label
                      htmlFor="support-name"
                      className="mb-2 block text-base font-semibold text-[var(--text-primary)]"
                    >
                      Your name
                    </label>
                    <input
                      id="support-name"
                      type="text"
                      autoComplete="name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      onBlur={() => touch('name')}
                      aria-describedby={showError('name') && errors.name ? 'support-name-error' : undefined}
                      aria-invalid={errors.name ? true : undefined}
                      className={inputClassName(showError('name') && Boolean(errors.name))}
                    />
                    <FieldError id="support-name-error" message={showError('name') ? errors.name : ''} />
                  </div>
                </div>

                {/* Section 4: About the request */}
                <div className="flex flex-col gap-5">
                  <SectionLabel>About the request</SectionLabel>

                  {intentConfig.behaviour.showProjectDetails ? (
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
                      <FieldError
                        id="support-projectGoal-error"
                        message={showError('projectGoal') ? errors.projectGoal : ''}
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
                      <FieldError
                        id="support-issueType-error"
                        message={showError('issueType') ? errors.issueType : ''}
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

                  <div>
                    <label
                      htmlFor="support-message"
                      className={`${isCommunity ? 'text-xl' : 'text-base'} mb-2 block font-semibold text-[var(--text-primary)]`}
                    >
                      Message
                    </label>
                    <textarea
                      id="support-message"
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      onBlur={() => touch('message')}
                      rows={6}
                      minLength={10}
                      aria-describedby={showError('message') && errors.message ? 'support-message-error' : undefined}
                      aria-invalid={errors.message ? true : undefined}
                      className={`${inputClassName(showError('message') && Boolean(errors.message))} min-h-[180px] resize-y`}
                    />
                    <FieldError id="support-message-error" message={showError('message') ? errors.message : ''} />
                  </div>
                </div>

                {/* Section 5: Person needing help (conditional) */}
                {meta.forWho === 'someone-else' ? (
                  <div className="flex flex-col gap-5">
                    <SectionLabel>Person needing help</SectionLabel>
                    <p className="text-base leading-relaxed text-[var(--text-secondary)]">
                      Basic details only. Please do not share medical or sensitive information.
                    </p>

                    <div>
                      <label
                        htmlFor="support-personName"
                        className="mb-2 block text-base font-semibold text-[var(--text-primary)]"
                      >
                        Their name
                      </label>
                      <input
                        id="support-personName"
                        type="text"
                        value={meta.personName ?? ''}
                        onChange={(event) => setMetaField('personName', event.target.value)}
                        onBlur={() => touch('personName')}
                        aria-describedby={showError('personName') && errors.personName ? 'support-personName-error' : undefined}
                        aria-invalid={errors.personName ? true : undefined}
                        className={inputClassName(showError('personName') && Boolean(errors.personName))}
                      />
                      <FieldError id="support-personName-error" message={showError('personName') ? errors.personName : ''} />
                    </div>

                    <div>
                      <ButtonGroup
                        label="Your relationship"
                        options={[
                          { value: 'family', label: 'Family member' },
                          { value: 'friend', label: 'Friend' },
                          { value: 'client', label: 'Client' },
                          { value: 'other', label: 'Other' },
                        ]}
                        value={meta.relationship ?? ''}
                        onChange={(value) => setMetaField('relationship', value)}
                      />
                      <FieldError
                        id="support-relationship-error"
                        message={showError('relationship') ? errors.relationship : ''}
                      />
                    </div>

                    <ButtonGroup
                      label="Can they be contacted directly?"
                      options={[
                        { value: 'no', label: 'No, contact me only' },
                        { value: 'phone', label: 'Yes, via phone' },
                        { value: 'email', label: 'Yes, via email' },
                      ]}
                      value={meta.personContactMethod ?? ''}
                      onChange={(value) => setMetaField('personContactMethod', value)}
                    />

                    {meta.personContactMethod === 'phone' ? (
                      <div>
                        <label
                          htmlFor="support-personPhone"
                          className="mb-2 block text-base font-semibold text-[var(--text-primary)]"
                        >
                          Their phone number
                        </label>
                        <input
                          id="support-personPhone"
                          type="tel"
                          inputMode="tel"
                          value={meta.personPhone ?? ''}
                          onChange={(event) => setMetaField('personPhone', event.target.value)}
                          className={inputClassName(false)}
                        />
                      </div>
                    ) : null}

                    <div>
                      <label
                        htmlFor="support-notes"
                        className="mb-2 block text-base font-semibold text-[var(--text-primary)]"
                      >
                        Anything important I should know?{' '}
                        <span className="font-normal text-[var(--text-secondary)]">(optional)</span>
                      </label>
                      <textarea
                        id="support-notes"
                        value={meta.notes ?? ''}
                        onChange={(event) => setMetaField('notes', event.target.value)}
                        rows={3}
                        placeholder="e.g. accessibility needs, urgency, preferences"
                        className={`${inputClassName(false)} resize-y`}
                      />
                    </div>
                  </div>
                ) : null}

                {/* Section 6: Consent */}
                <div className="flex flex-col gap-4">
                  <SectionLabel>Consent</SectionLabel>

                  <div className="flex items-start gap-4">
                    <input
                      id="support-consentRequired"
                      type="checkbox"
                      checked={consentRequired}
                      onChange={(event) => setConsentRequired(event.target.checked)}
                      onBlur={() => touch('consentRequired')}
                      className="mt-[3px] h-5 w-5 shrink-0 cursor-pointer accent-[var(--text-primary)]"
                      aria-describedby={showError('consentRequired') && errors.consentRequired ? 'support-consentRequired-error' : undefined}
                      aria-invalid={errors.consentRequired ? true : undefined}
                    />
                    <label
                      htmlFor="support-consentRequired"
                      className="cursor-pointer text-base text-[var(--text-primary)]"
                    >
                      I agree to be contacted about this request and understand my data will only be used for this purpose.{' '}
                      <span className="text-[var(--status-danger)]" aria-hidden="true">*</span>
                    </label>
                  </div>
                  <FieldError
                    id="support-consentRequired-error"
                    message={showError('consentRequired') ? errors.consentRequired : ''}
                    assertive
                  />

                  <div className="flex items-start gap-4">
                    <input
                      id="support-consentOptional"
                      type="checkbox"
                      checked={consentOptional}
                      onChange={(event) => setConsentOptional(event.target.checked)}
                      className="mt-[3px] h-5 w-5 shrink-0 cursor-pointer accent-[var(--text-primary)]"
                    />
                    <label
                      htmlFor="support-consentOptional"
                      className="cursor-pointer text-base text-[var(--text-secondary)]"
                    >
                      I&apos;m happy to be contacted about related updates or services.
                    </label>
                  </div>
                </div>

                {/* Submit */}
                <div className={`${ctaRowClassName} border-t border-[var(--border-subtle)] pt-6`}>
                  <div className="max-w-xl">
                    <p className="text-base leading-relaxed text-[var(--text-secondary)]">
                      I&apos;ll only use these details to respond to your request.
                    </p>
                    <FieldError id="support-submit-error" message={submitError} assertive />
                  </div>
                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className={primaryCta}
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
                    <a
                      href={`mailto:${directEmail}`}
                      className="inline-flex min-h-[56px] items-center gap-3 break-all text-base text-[var(--text-primary)] underline underline-offset-4 focus:outline focus:outline-2 focus:outline-offset-4 focus:outline-[var(--text-primary)]"
                    >
                      <Mail className="h-5 w-5 shrink-0" />
                      <span>{directEmail}</span>
                    </a>
                    <button type="button" onClick={handleCopyEmail} className={secondaryCta}>
                      <Copy className="h-5 w-5" />
                      {copyState === 'copied' ? 'Copied' : copyState === 'error' ? 'Use email link' : 'Copy email'}
                    </button>
                  </div>
                ) : null}

                {(linkedInUrl || githubUrl) ? (
                  <div className="mt-5 grid gap-3">
                    {linkedInUrl ? (
                      <a href={linkedInUrl} target="_blank" rel="noreferrer" className={secondaryCta}>
                        <ExternalLink className="h-5 w-5" />
                        LinkedIn
                      </a>
                    ) : null}
                    {githubUrl ? (
                      <a href={githubUrl} target="_blank" rel="noreferrer" className={secondaryCta}>
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
