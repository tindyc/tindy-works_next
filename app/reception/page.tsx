"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, Monitor, PenTool, Phone, ShieldCheck, UserRound } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { SupportNav } from '@/components/SupportNav';

type Step = 'device' | 'details' | 'confirmation';
type DeviceOption = 'phone-tablet' | 'computer-laptop' | 'something-else';
type ContactMethod = 'phone' | 'email';
type RelationshipOption = 'Parent' | 'Grandparent' | 'Friend' | 'Client' | 'Other';
type ContactTarget = 'self' | 'other';

type OtherPersonState = {
  name: string;
  relationship: string;
  contactTarget: ContactTarget;
  contactMethod?: ContactMethod;
  contactValue?: string;
  note?: string;
};

type RequestSummary = {
  id: string;
  device: string;
  contactMethod: string;
  name: string;
  isOnBehalf: boolean;
  otherPersonName?: string;
  relationship?: string;
};

type ValidationErrors = {
  description?: string;
  contactMethod?: string;
  contactValue?: string;
  name?: string;
  otherPersonName?: string;
  relationship?: string;
  otherContactMethod?: string;
  otherContactValue?: string;
  submit?: string;
};

type TouchedFields = Record<string, boolean>;

const SUBMISSION_RATE_LIMIT_MS = 30_000;
const MIN_SUBMISSION_TIME_MS = 2_000;
const LAST_SUBMISSION_KEY = 'reception-last-submission';

const deviceOptions: Array<{
  value: DeviceOption;
  title: string;
  description: string;
  icon: typeof Phone;
}> = [
  {
    value: 'phone-tablet',
    title: "My phone or tablet isn't working",
    description: 'Help with calls, apps, messages, charging, or anything else on your device.',
    icon: Phone,
  },
  {
    value: 'computer-laptop',
    title: "My computer or laptop isn't working",
    description: 'Help with logging in, internet problems, slow performance, or missing files.',
    icon: Monitor,
  },
  {
    value: 'something-else',
    title: 'Something else',
    description: 'Choose this if you are not sure what fits, or the problem is something different.',
    icon: PenTool,
  },
];

const contactOptions: Array<{
  value: ContactMethod;
  title: string;
  description: string;
  icon: typeof Phone;
}> = [
  {
    value: 'phone',
    title: 'Phone call',
    description: 'I will call you so we can talk it through together.',
    icon: Phone,
  },
  {
    value: 'email',
    title: 'Email',
    description: 'I will reply by email with help and next steps.',
    icon: Mail,
  },
];

const relationshipOptions: RelationshipOption[] = ['Parent', 'Grandparent', 'Friend', 'Client', 'Other'];

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
const isValidPhone = (value: string) => value.replace(/[^\d]/g, '').length >= 7;
const generateRequestId = () => `REQ-${Math.floor(1000 + Math.random() * 9000)}`;

const getInputClassName = (hasError: boolean) =>
  `w-full border bg-[var(--bg-base)] px-5 py-4 text-base text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none transition-colors ${
    hasError
      ? 'border-red-500 focus:border-red-500'
      : 'border-[var(--border-strong)] focus:border-[var(--text-primary)]'
  }`;

const getTextAreaClassName = (hasError: boolean) =>
  `${getInputClassName(hasError)} resize-y min-h-[180px]`;

const getOptionCardClassName = (isSelected: boolean) =>
  `w-full border p-6 text-left transition-all duration-300 min-h-[150px] flex gap-4 items-start ${
    isSelected
      ? 'border-[var(--text-primary)] bg-[var(--hover-bg)] text-[var(--text-primary)]'
      : 'border-[var(--border-strong)] bg-[var(--bg-base)] hover:border-[var(--text-primary)]'
  }`;

function getDescriptionError(value: string) {
  const trimmed = value.trim();
  const simplified = trimmed.toLowerCase().replace(/[^a-z0-9]/g, '');

  if (!trimmed) return 'Please describe what is happening.';
  if (trimmed.length < 10) return 'Please add a little more detail so I can understand the problem.';
  if (['test', 'asdf', 'qwerty', 'hello'].includes(simplified)) return 'Please describe the real issue you need help with.';
  if (/^(.)\1{4,}$/u.test(simplified) || new Set(simplified).size <= 1) return 'Please use a few words that explain what is going wrong.';

  return '';
}

function getContactValueError(method: ContactMethod | undefined, value: string) {
  if (!method) return 'Please choose how you would like me to contact you.';
  if (!value.trim()) return method === 'phone' ? 'Please enter a phone number.' : 'Please enter an email address.';
  if (method === 'phone' && !isValidPhone(value)) return 'Please enter a phone number with at least 7 digits.';
  if (method === 'email' && !isValidEmail(value)) return 'Please enter a valid email address.';
  return '';
}

function getValidationErrors({
  description,
  contactMethod,
  contactValue,
  name,
  isOnBehalf,
  otherPerson,
}: {
  description: string;
  contactMethod?: ContactMethod;
  contactValue: string;
  name: string;
  isOnBehalf: boolean;
  otherPerson: OtherPersonState;
}): ValidationErrors {
  const errors: ValidationErrors = {};

  const descriptionError = getDescriptionError(description);
  if (descriptionError) errors.description = descriptionError;
  if (!contactMethod) errors.contactMethod = 'Please choose phone call or email.';

  const contactValueError = getContactValueError(contactMethod, contactValue);
  if (contactValueError) errors.contactValue = contactValueError;
  if (!name.trim()) errors.name = 'Please enter your name.';

  if (isOnBehalf) {
    if (!otherPerson.name.trim()) errors.otherPersonName = 'Please enter the name of the person who needs help.';
    if (!otherPerson.relationship.trim()) errors.relationship = 'Please choose your relationship to them.';

    if (otherPerson.contactTarget === 'other') {
      if (!otherPerson.contactMethod) errors.otherContactMethod = 'Please choose how I should contact them.';
      const otherContactValueError = getContactValueError(otherPerson.contactMethod, otherPerson.contactValue ?? '');
      if (otherContactValueError) errors.otherContactValue = otherContactValueError;
    }
  }

  return errors;
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-3 text-sm text-red-500" role="alert">
      {message}
    </p>
  );
}

export default function ReceptionPage() {
  const [step, setStep] = useState<Step>('device');
  const [selectedDevice, setSelectedDevice] = useState<DeviceOption | null>(null);
  const [description, setDescription] = useState('');
  const [contactMethod, setContactMethod] = useState<ContactMethod | undefined>(undefined);
  const [contactValue, setContactValue] = useState('');
  const [name, setName] = useState('');
  const [isOnBehalf, setIsOnBehalf] = useState(false);
  const [otherPerson, setOtherPerson] = useState<OtherPersonState>({
    name: '',
    relationship: '',
    contactTarget: 'self',
    contactMethod: undefined,
    contactValue: '',
    note: '',
  });
  const [formStartTime, setFormStartTime] = useState(() => Date.now());
  const [company, setCompany] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [touchedFields, setTouchedFields] = useState<TouchedFields>({});
  const [requestSummary, setRequestSummary] = useState<RequestSummary | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const selectedDeviceLabel = useMemo(
    () => deviceOptions.find((option) => option.value === selectedDevice)?.title ?? '',
    [selectedDevice]
  );

  const validationErrors = useMemo(
    () => getValidationErrors({ description, contactMethod, contactValue, name, isOnBehalf, otherPerson }),
    [contactMethod, contactValue, description, isOnBehalf, name, otherPerson]
  );

  const effectiveContactMethodLabel = useMemo(() => {
    if (isOnBehalf && otherPerson.contactTarget === 'other' && otherPerson.contactMethod) {
      return otherPerson.contactMethod === 'phone' ? 'Phone call with them directly' : 'Email to them directly';
    }
    if (contactMethod === 'phone') return 'Phone call';
    if (contactMethod === 'email') return 'Email';
    return '';
  }, [contactMethod, isOnBehalf, otherPerson.contactMethod, otherPerson.contactTarget]);

  const canSubmit = Boolean(selectedDevice) && Object.keys(validationErrors).length === 0 && !isSubmitting;

  const shouldShowError = (field: keyof ValidationErrors) => submitAttempted || touchedFields[field];

  const handleDeviceSelect = (device: DeviceOption) => {
    setSelectedDevice(device);
    setFormStartTime(Date.now());
    setStep('details');
  };

  const markTouched = (field: string) => {
    setTouchedFields((current) => ({ ...current, [field]: true }));
  };

  const handleContactMethodChange = (method: ContactMethod) => {
    setContactMethod(method);
    setContactValue('');
    markTouched('contactMethod');
  };

  const handleOtherContactMethodChange = (method: ContactMethod) => {
    setOtherPerson((current) => ({ ...current, contactMethod: method, contactValue: '' }));
    markTouched('otherContactMethod');
  };

  const handleOnBehalfChange = (checked: boolean) => {
    setIsOnBehalf(checked);
    if (!checked) {
      setOtherPerson({ name: '', relationship: '', contactTarget: 'self', contactMethod: undefined, contactValue: '', note: '' });
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitAttempted(true);

    if (!selectedDevice || Object.keys(validationErrors).length > 0 || isSubmitting) return;
    if (company.trim()) return;

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

    setRequestSummary({
      id: generateRequestId(),
      device: selectedDeviceLabel,
      contactMethod: effectiveContactMethodLabel,
      name: name.trim(),
      isOnBehalf,
      otherPersonName: isOnBehalf ? otherPerson.name.trim() : undefined,
      relationship: isOnBehalf ? otherPerson.relationship : undefined,
    });
    setIsSubmitting(false);
    setStep('confirmation');
  };

  const submitErrorMessage = useMemo(() => {
    if (!shouldShowError('submit')) return '';
    if (Date.now() - formStartTime < MIN_SUBMISSION_TIME_MS) return 'Please take a moment to review your request before sending it.';
    const lastSubmission = window.localStorage.getItem(LAST_SUBMISSION_KEY);
    if (lastSubmission && Date.now() - Number(lastSubmission) < SUBMISSION_RATE_LIMIT_MS) return 'Please wait a short moment before sending another request.';
    return '';
  }, [formStartTime, submitAttempted, touchedFields]);

  return (
    <Layout>
      <main className="flex-grow w-full border-t border-[var(--border-subtle)] flex flex-col relative bg-[var(--bg-base)] max-w-[1440px] mx-auto border-x min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-88px)] mt-[64px] md:mt-[88px]">
        <SupportNav />

        <header className="p-8 md:p-16 border-b border-[var(--border-subtle)]">
          <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tighter uppercase mb-3 text-[var(--text-primary)] drop-shadow-md">
            Reception
          </h1>
          <p className="font-mono text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-6">
            SYS.NODE: SUPPORT
          </p>
          <p className="font-sans text-base md:text-lg text-[var(--text-secondary)] max-w-2xl leading-relaxed">
            Tell me what is going wrong, and I&apos;ll help you take the next step in a calm, simple way.
          </p>
        </header>

        <section className="p-4 md:p-16 flex-grow flex justify-center items-start">
          {step === 'device' && (
            <div className="w-full max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col lg:flex-row gap-12 border border-[var(--border-subtle)] p-8 md:p-12 tech-panel bg-[var(--bg-base)]">
                <div className="w-full lg:w-1/3">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-secondary)] mb-4">
                    SUPPORT REQUEST
                  </p>
                  <h2 className="font-display text-4xl uppercase tracking-wider mb-4">What do you need help with?</h2>
                  <p className="text-[var(--text-secondary)] font-sans text-base leading-relaxed max-w-md">
                    Pick the option that feels closest. You do not need to know the technical name for the problem.
                  </p>
                </div>

                <div className="w-full lg:w-2/3 grid grid-cols-1 gap-4">
                  {deviceOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleDeviceSelect(option.value)}
                        className="group w-full border border-[var(--border-strong)] bg-[var(--bg-base)] p-6 md:p-8 text-left hover:border-[var(--text-primary)] hover:bg-[var(--hover-bg)] transition-all duration-300 min-h-[140px] md:min-h-[160px] flex gap-5 items-start"
                      >
                        <span className="mt-1 rounded-full border border-[var(--border-strong)] p-3 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] group-hover:border-[var(--text-primary)] transition-colors">
                          <Icon className="w-6 h-6" />
                        </span>
                        <span className="flex-1">
                          <span className="block font-display text-2xl md:text-3xl uppercase tracking-wide leading-tight text-[var(--text-primary)]">
                            {option.title}
                          </span>
                          <span className="block mt-3 text-sm md:text-base leading-relaxed text-[var(--text-secondary)] max-w-2xl">
                            {option.description}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {step === 'details' && (
            <div className="w-full max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <button
                type="button"
                onClick={() => setStep('device')}
                className="flex items-center space-x-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-8 transition-colors font-mono text-[10px] uppercase tracking-widest border border-[var(--border-strong)] px-4 py-2 bg-[var(--bg-base)]"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <form
                onSubmit={handleSubmit}
                className="border border-[var(--border-subtle)] p-8 md:p-12 tech-panel bg-[var(--bg-base)]"
                noValidate
              >
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

                <div className="flex flex-col gap-10">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-secondary)] mb-4">HELP WITH</p>
                    <h2 className="font-display text-4xl uppercase tracking-wider mb-3">Tell me a little about the problem</h2>
                    <p className="text-[var(--text-secondary)] font-sans text-base leading-relaxed max-w-2xl">
                      Selected: <span className="text-[var(--text-primary)]">{selectedDeviceLabel}</span>
                    </p>
                  </div>

                  <div className="border border-[var(--border-subtle)] p-6 md:p-8 bg-[var(--bg-base)]">
                    <label htmlFor="support-description" className="block font-mono text-[10px] uppercase tracking-widest text-[var(--text-secondary)] mb-3">
                      What is going wrong?
                    </label>
                    <textarea
                      id="support-description"
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      onBlur={() => markTouched('description')}
                      placeholder="Briefly describe what's wrong..."
                      rows={6}
                      aria-invalid={shouldShowError('description') && Boolean(validationErrors.description)}
                      aria-describedby="support-description-help support-description-error"
                      className={getTextAreaClassName(shouldShowError('description') && Boolean(validationErrors.description))}
                    />
                    <p id="support-description-help" className="mt-3 text-sm text-[var(--text-secondary)] leading-relaxed">
                      No technical knowledge needed - just describe what&apos;s happening.
                    </p>
                    <FieldError id="support-description-error" message={shouldShowError('description') ? validationErrors.description : ''} />
                  </div>

                  <div className="border border-[var(--border-subtle)] p-6 md:p-8 bg-[var(--bg-base)]">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-secondary)] mb-4">How should I contact you?</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4" role="radiogroup" aria-label="Preferred contact method">
                      {contactOptions.map((option) => {
                        const Icon = option.icon;
                        const isSelected = contactMethod === option.value;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => handleContactMethodChange(option.value)}
                            aria-pressed={isSelected}
                            className={getOptionCardClassName(isSelected)}
                          >
                            <span className="mt-1 rounded-full border border-current p-3">
                              <Icon className="w-6 h-6" />
                            </span>
                            <span className="flex-1">
                              <span className="block font-display text-2xl uppercase tracking-wide">{option.title}</span>
                              <span className="block mt-3 text-sm md:text-base leading-relaxed text-[var(--text-secondary)]">{option.description}</span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <FieldError id="contact-method-error" message={shouldShowError('contactMethod') ? validationErrors.contactMethod : ''} />

                    {contactMethod && (
                      <div className="mt-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <label htmlFor="contact-value" className="block font-mono text-[10px] uppercase tracking-widest text-[var(--text-secondary)] mb-3">
                          {contactMethod === 'phone' ? 'Phone number' : 'Email address'}
                        </label>
                        <input
                          id="contact-value"
                          type={contactMethod === 'phone' ? 'tel' : 'email'}
                          inputMode={contactMethod === 'phone' ? 'tel' : 'email'}
                          autoComplete={contactMethod === 'phone' ? 'tel' : 'email'}
                          value={contactValue}
                          onChange={(event) => setContactValue(event.target.value)}
                          onBlur={() => markTouched('contactValue')}
                          placeholder={contactMethod === 'phone' ? 'Best number to reach you' : 'Best email to reach you'}
                          aria-invalid={shouldShowError('contactValue') && Boolean(validationErrors.contactValue)}
                          aria-describedby="contact-value-error"
                          className={getInputClassName(shouldShowError('contactValue') && Boolean(validationErrors.contactValue))}
                        />
                        <FieldError id="contact-value-error" message={shouldShowError('contactValue') ? validationErrors.contactValue : ''} />
                      </div>
                    )}
                  </div>

                  <div className="border border-[var(--border-subtle)] p-6 md:p-8 bg-[var(--bg-base)]">
                    <label htmlFor="support-name" className="block font-mono text-[10px] uppercase tracking-widest text-[var(--text-secondary)] mb-3">
                      Your name
                    </label>
                    <input
                      id="support-name"
                      type="text"
                      autoComplete="name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      onBlur={() => markTouched('name')}
                      placeholder="Your name"
                      aria-invalid={shouldShowError('name') && Boolean(validationErrors.name)}
                      aria-describedby="support-name-error"
                      className={getInputClassName(shouldShowError('name') && Boolean(validationErrors.name))}
                    />
                    <FieldError id="support-name-error" message={shouldShowError('name') ? validationErrors.name : ''} />
                  </div>

                  <div className="border border-[var(--border-subtle)] p-6 md:p-8 bg-[var(--bg-base)]">
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        id="onBehalf"
                        checked={isOnBehalf}
                        onChange={(event) => handleOnBehalfChange(event.target.checked)}
                        className="mt-1 w-5 h-5 bg-[var(--bg-base)] border-[var(--border-strong)] accent-[var(--text-primary)]"
                      />
                      <div>
                        <label htmlFor="onBehalf" className="text-base text-[var(--text-primary)] leading-relaxed">
                          I&apos;m asking for someone else
                        </label>
                        <p className="mt-2 text-sm text-[var(--text-secondary)] leading-relaxed">
                          Use this if you are helping a family member, friend, or client.
                        </p>
                      </div>
                    </div>
                  </div>

                  {isOnBehalf && (
                    <div className="border border-[var(--border-subtle)] p-6 md:p-8 bg-[var(--bg-base)] animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="flex items-center gap-3 mb-6">
                        <UserRound className="w-5 h-5 text-[var(--text-secondary)]" />
                        <h3 className="font-display text-2xl uppercase tracking-wide">Who needs help?</h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="other-person-name" className="block font-mono text-[10px] uppercase tracking-widest text-[var(--text-secondary)] mb-3">
                            Their name
                          </label>
                          <input
                            id="other-person-name"
                            type="text"
                            value={otherPerson.name}
                            onChange={(event) => setOtherPerson((current) => ({ ...current, name: event.target.value }))}
                            onBlur={() => markTouched('otherPersonName')}
                            placeholder="Their name"
                            aria-invalid={shouldShowError('otherPersonName') && Boolean(validationErrors.otherPersonName)}
                            aria-describedby="other-person-name-error"
                            className={getInputClassName(shouldShowError('otherPersonName') && Boolean(validationErrors.otherPersonName))}
                          />
                          <FieldError id="other-person-name-error" message={shouldShowError('otherPersonName') ? validationErrors.otherPersonName : ''} />
                        </div>

                        <div>
                          <label htmlFor="relationship" className="block font-mono text-[10px] uppercase tracking-widest text-[var(--text-secondary)] mb-3">
                            Relationship
                          </label>
                          <select
                            id="relationship"
                            value={otherPerson.relationship}
                            onChange={(event) => setOtherPerson((current) => ({ ...current, relationship: event.target.value }))}
                            onBlur={() => markTouched('relationship')}
                            aria-invalid={shouldShowError('relationship') && Boolean(validationErrors.relationship)}
                            aria-describedby="relationship-error"
                            className={getInputClassName(shouldShowError('relationship') && Boolean(validationErrors.relationship))}
                          >
                            <option value="">Choose one</option>
                            {relationshipOptions.map((option) => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                          <FieldError id="relationship-error" message={shouldShowError('relationship') ? validationErrors.relationship : ''} />
                        </div>
                      </div>

                      <div className="mt-8">
                        <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-secondary)] mb-4">Who should I contact?</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" role="radiogroup" aria-label="Who should be contacted">
                          <button
                            type="button"
                            onClick={() => setOtherPerson((current) => ({ ...current, contactTarget: 'self', contactMethod: undefined, contactValue: '', note: '' }))}
                            aria-pressed={otherPerson.contactTarget === 'self'}
                            className={getOptionCardClassName(otherPerson.contactTarget === 'self')}
                          >
                            <span className="mt-1 rounded-full border border-current p-3">
                              <ShieldCheck className="w-6 h-6" />
                            </span>
                            <span className="flex-1">
                              <span className="block font-display text-2xl uppercase tracking-wide">Contact me</span>
                              <span className="block mt-3 text-sm md:text-base leading-relaxed text-[var(--text-secondary)]">
                                Reach out to me first, and I&apos;ll help coordinate.
                              </span>
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setOtherPerson((current) => ({ ...current, contactTarget: 'other' }))}
                            aria-pressed={otherPerson.contactTarget === 'other'}
                            className={getOptionCardClassName(otherPerson.contactTarget === 'other')}
                          >
                            <span className="mt-1 rounded-full border border-current p-3">
                              <UserRound className="w-6 h-6" />
                            </span>
                            <span className="flex-1">
                              <span className="block font-display text-2xl uppercase tracking-wide">Contact them directly</span>
                              <span className="block mt-3 text-sm md:text-base leading-relaxed text-[var(--text-secondary)]">
                                Reach out to the person who needs help yourself.
                              </span>
                            </span>
                          </button>
                        </div>
                      </div>

                      {otherPerson.contactTarget === 'other' && (
                        <div className="mt-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                          <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-secondary)] mb-4">How should I contact them?</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {contactOptions.map((option) => {
                              const Icon = option.icon;
                              const isSelected = otherPerson.contactMethod === option.value;
                              return (
                                <button
                                  key={`other-${option.value}`}
                                  type="button"
                                  onClick={() => handleOtherContactMethodChange(option.value)}
                                  aria-pressed={isSelected}
                                  className={getOptionCardClassName(isSelected)}
                                >
                                  <span className="mt-1 rounded-full border border-current p-3">
                                    <Icon className="w-6 h-6" />
                                  </span>
                                  <span className="flex-1">
                                    <span className="block font-display text-2xl uppercase tracking-wide">{option.title}</span>
                                    <span className="block mt-3 text-sm md:text-base leading-relaxed text-[var(--text-secondary)]">{option.description}</span>
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                          <FieldError id="other-contact-method-error" message={shouldShowError('otherContactMethod') ? validationErrors.otherContactMethod : ''} />

                          {otherPerson.contactMethod && (
                            <div className="mt-6">
                              <label htmlFor="other-contact-value" className="block font-mono text-[10px] uppercase tracking-widest text-[var(--text-secondary)] mb-3">
                                {otherPerson.contactMethod === 'phone' ? 'Their phone number' : 'Their email address'}
                              </label>
                              <input
                                id="other-contact-value"
                                type={otherPerson.contactMethod === 'phone' ? 'tel' : 'email'}
                                inputMode={otherPerson.contactMethod === 'phone' ? 'tel' : 'email'}
                                value={otherPerson.contactValue ?? ''}
                                onChange={(event) => setOtherPerson((current) => ({ ...current, contactValue: event.target.value }))}
                                onBlur={() => markTouched('otherContactValue')}
                                placeholder={otherPerson.contactMethod === 'phone' ? 'Best number to reach them' : 'Best email to reach them'}
                                aria-invalid={shouldShowError('otherContactValue') && Boolean(validationErrors.otherContactValue)}
                                aria-describedby="other-contact-value-error"
                                className={getInputClassName(shouldShowError('otherContactValue') && Boolean(validationErrors.otherContactValue))}
                              />
                              <FieldError id="other-contact-value-error" message={shouldShowError('otherContactValue') ? validationErrors.otherContactValue : ''} />
                            </div>
                          )}

                          <div className="mt-6">
                            <label htmlFor="other-person-note" className="block font-mono text-[10px] uppercase tracking-widest text-[var(--text-secondary)] mb-3">
                              Anything I should know before contacting them?
                            </label>
                            <textarea
                              id="other-person-note"
                              value={otherPerson.note ?? ''}
                              onChange={(event) => setOtherPerson((current) => ({ ...current, note: event.target.value }))}
                              placeholder="Anything helpful to know before I reach out"
                              rows={4}
                              className={getTextAreaClassName(false)}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-t border-[var(--border-subtle)] pt-6">
                    <div className="max-w-xl">
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">I&apos;ll only use this information to help with your request.</p>
                      <FieldError id="submit-error" message={submitErrorMessage} />
                    </div>
                    <button
                      type="submit"
                      disabled={!canSubmit}
                      className="bg-[var(--text-primary)] text-[var(--bg-base)] px-8 py-4 font-mono text-[10px] uppercase font-bold tracking-widest hover:bg-neutral-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed min-w-[220px]"
                    >
                      {isSubmitting ? 'Sending request...' : 'Send request'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {step === 'confirmation' && requestSummary && (
            <div className="w-full max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="border border-[var(--border-subtle)] p-8 md:p-12 lg:p-16 tech-panel bg-[var(--bg-base)]">
                <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-secondary)] mb-4">SYS.RECEIVED</p>
                <h2 className="font-display text-4xl uppercase tracking-wider mb-4">Request received</h2>
                <p className="text-[var(--text-secondary)] font-sans text-base md:text-lg leading-relaxed max-w-2xl">
                  Thanks, I&apos;ve got your request. I&apos;ll reach out shortly using your preferred contact method.
                </p>

                <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-[var(--border-strong)] p-5 bg-[var(--bg-base)]">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-secondary)] mb-2">Contact method</p>
                    <p className="text-lg text-[var(--text-primary)]">{requestSummary.contactMethod}</p>
                  </div>
                  <div className="border border-[var(--border-strong)] p-5 bg-[var(--bg-base)]">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-secondary)] mb-2">Request ID</p>
                    <p className="text-lg text-[var(--text-primary)]">{requestSummary.id}</p>
                  </div>
                </div>

                <div className="mt-4 border border-[var(--border-strong)] p-5 bg-[var(--bg-base)]">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-secondary)] mb-2">Help topic</p>
                  <p className="text-lg text-[var(--text-primary)]">{requestSummary.device}</p>
                </div>

                <div className="mt-4 text-sm text-[var(--text-secondary)] leading-relaxed space-y-1">
                  <p>Name: {requestSummary.name}</p>
                  {requestSummary.isOnBehalf && <p>Submitted for someone else.</p>}
                  {requestSummary.otherPersonName && (
                    <p>
                      Person needing help: {requestSummary.otherPersonName}
                      {requestSummary.relationship ? ` (${requestSummary.relationship})` : ''}
                    </p>
                  )}
                </div>

                <div className="mt-10">
                  <Link
                    href="/"
                    className="inline-flex items-center justify-center bg-[var(--text-primary)] text-[var(--bg-base)] px-8 py-4 font-mono text-[10px] uppercase font-bold tracking-widest hover:bg-neutral-300 transition-colors"
                  >
                    Return to Studio
                  </Link>
                </div>
              </div>
            </div>
          )}
        </section>

        <footer className="p-8 flex justify-between items-center font-mono text-[10px] uppercase text-[var(--text-secondary)] tracking-widest border-t border-[var(--border-subtle)] mt-auto bg-[var(--bg-base)]">
          <div>LOCAL PORT: 3000</div>
          <div className="hidden sm:block">NODE: RECEPTION_ACTIVE</div>
          <div>SYS.STATUS: NOMINAL</div>
        </footer>
      </main>
    </Layout>
  );
}
