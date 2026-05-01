'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { useState, type FormEvent, type ReactNode } from 'react';
import {
  ADMIN_SUBMISSION_CONTACT_METHOD_OPTIONS,
  ADMIN_SUBMISSION_REQUEST_DETAILS,
  ADMIN_SUBMISSION_REQUEST_OPTIONS,
  shouldShowAdminSubmissionField,
  type AdminSubmissionField,
  type AdminSubmissionFieldKey,
  type AdminSubmissionRequestType,
  type ContactMethod,
} from '@/lib/admin-submission-validation';

const inputClass =
  'w-full rounded-md border border-[var(--border-subtle)] bg-[var(--ui-surface)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--border-strong)]';

const sectionClass =
  'space-y-4 border border-[var(--border-subtle)] bg-[var(--ui-surface)] p-4';

type MetadataState = Partial<Record<AdminSubmissionFieldKey, string>>;

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className={sectionClass}>
      <h2 className="text-sm font-semibold uppercase tracking-[0.1em] text-[var(--text-secondary)]">
        {title}
      </h2>
      {children}
    </section>
  );
}

function FieldLabel({
  htmlFor,
  children,
  required,
}: {
  htmlFor: string;
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <label htmlFor={htmlFor} className="mb-2 block text-sm text-[var(--text-secondary)]">
      {children}
      {required ? <span className="ml-1 text-[var(--status-danger)]">*</span> : null}
    </label>
  );
}

function DetailField({
  field,
  value,
  onChange,
}: {
  field: AdminSubmissionField;
  value: string;
  onChange: (value: string) => void;
}) {
  const id = `manual-${field.key}`;

  if (field.kind === 'textarea') {
    return (
      <div className="sm:col-span-2">
        <FieldLabel htmlFor={id} required={field.required}>
          {field.label}
        </FieldLabel>
        <textarea
          id={id}
          rows={4}
          maxLength={field.maxLength}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`${inputClass} resize-y`}
        />
      </div>
    );
  }

  if (field.kind === 'select') {
    return (
      <div>
        <FieldLabel htmlFor={id} required={field.required}>
          {field.label}
        </FieldLabel>
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={inputClass}
        >
          <option value="">Choose...</option>
          {field.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div>
      <FieldLabel htmlFor={id} required={field.required}>
        {field.label}
      </FieldLabel>
      <input
        id={id}
        type={field.key === 'personEmail' ? 'email' : field.key === 'personPhone' ? 'tel' : 'text'}
        maxLength={field.maxLength}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={inputClass}
      />
    </div>
  );
}

export function ManualSubmissionTicketForm() {
  const router = useRouter();
  const [requestType, setRequestType] =
    useState<AdminSubmissionRequestType>('contact');
  const [name, setName] = useState('');
  const [contactMethod, setContactMethod] = useState<ContactMethod>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [messageText, setMessageText] = useState('');
  const [dueAt, setDueAt] = useState('');
  const [sendConfirmationEmail, setSendConfirmationEmail] = useState(false);
  const [metadata, setMetadata] = useState<MetadataState>({});
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: 'success' | 'error';
  } | null>(null);

  const details = ADMIN_SUBMISSION_REQUEST_DETAILS[requestType];
  const isContact = requestType === 'contact';
  const fields = details.fields as readonly AdminSubmissionField[];
  const visibleFields = fields.filter((field) =>
    shouldShowAdminSubmissionField(field, metadata),
  );
  const showEmail =
    isContact ||
    sendConfirmationEmail ||
    contactMethod === 'email' ||
    contactMethod === 'not-sure';
  const showPhone = !isContact && (
    contactMethod === 'sms' ||
    contactMethod === 'whatsapp' ||
    contactMethod === 'not-sure'
  );

  function updateMetadata(key: AdminSubmissionFieldKey, value: string) {
    setMetadata((current) => ({
      ...current,
      [key]: value,
      ...(key === 'forWho' && value !== 'someone-else'
        ? {
            personName: '',
            relationship: '',
            personContactMethod: '',
            personPhone: '',
            personEmail: '',
            notes: '',
          }
        : {}),
      ...(key === 'personContactMethod' && value !== 'phone' ? { personPhone: '' } : {}),
      ...(key === 'personContactMethod' && value !== 'email' ? { personEmail: '' } : {}),
    }));
  }

  function handleRequestTypeChange(value: AdminSubmissionRequestType) {
    setRequestType(value);
    setMetadata({});
    if (value === 'contact') {
      setContactMethod('email');
      setPhone('');
    }
  }

  function handleContactMethodChange(value: ContactMethod) {
    setContactMethod(value);
    if (value === 'email') setPhone('');
    if ((value === 'sms' || value === 'whatsapp') && !sendConfirmationEmail) {
      setEmail('');
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_type: requestType,
          name,
          email,
          phone,
          contact_method: isContact ? 'email' : contactMethod,
          message: messageText,
          due_at: dueAt || null,
          send_confirmation_email: sendConfirmationEmail,
          metadata,
        }),
      });
      const data = (await res.json()) as { error?: string };

      if (!res.ok) {
        setMessage({ text: data.error ?? 'Failed to create ticket.', type: 'error' });
        return;
      }

      router.push('/admin/work');
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-subtle)] px-4 py-3">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Link href="/admin/work" className="ui-button min-h-9 px-3 py-1.5">
            <ArrowLeft size={16} />
            Back to Work
          </Link>
          <Link href="/admin/personal" className="ui-button min-h-9 px-3 py-1.5">
            Personal
          </Link>
        </div>
      </div>

      <main className="mx-auto w-full max-w-3xl px-4 py-8">
        <div className="mb-6">
          <p className="mb-2 text-[0.7rem] uppercase tracking-[0.1em] text-[var(--text-muted)]">
            Work Tickets
          </p>
          <h1 className="font-['Space_Grotesk'] text-2xl font-semibold text-[var(--text-primary)]">
            Add Work Ticket
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Section title="Request type">
            <div>
              <FieldLabel htmlFor="manual-request-type">Request type</FieldLabel>
              <select
                id="manual-request-type"
                value={requestType}
                onChange={(event) =>
                  handleRequestTypeChange(event.target.value as AdminSubmissionRequestType)
                }
                className={inputClass}
              >
                {ADMIN_SUBMISSION_REQUEST_OPTIONS.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </Section>

          <Section title="Contact details">
            {!isContact ? (
              <fieldset className="space-y-2">
                <legend className="text-sm text-[var(--text-secondary)]">
                  Preferred contact method
                </legend>
                <div className="grid gap-2 sm:grid-cols-4">
                  {ADMIN_SUBMISSION_CONTACT_METHOD_OPTIONS.map((method) => (
                    <label
                      key={method.value}
                      className={[
                        'flex min-h-9 cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-sm',
                        contactMethod === method.value
                          ? 'border-[var(--border-strong)] bg-[var(--hover-bg)] text-[var(--text-primary)]'
                          : 'border-[var(--border-subtle)] text-[var(--text-secondary)]',
                      ].join(' ')}
                    >
                      <input
                        type="radio"
                        name="contact_method"
                        value={method.value}
                        checked={contactMethod === method.value}
                        onChange={() => handleContactMethodChange(method.value)}
                      />
                      {method.label}
                    </label>
                  ))}
                </div>
              </fieldset>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <FieldLabel htmlFor="manual-name" required>
                  Name
                </FieldLabel>
                <input
                  id="manual-name"
                  maxLength={160}
                  autoComplete="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className={inputClass}
                />
              </div>

              {showEmail ? (
                <div>
                  <FieldLabel
                    htmlFor="manual-email"
                    required={isContact || contactMethod === 'email' || sendConfirmationEmail}
                  >
                    Email
                  </FieldLabel>
                  <input
                    id="manual-email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className={inputClass}
                  />
                </div>
              ) : null}

              {showPhone ? (
                <div>
                  <FieldLabel
                    htmlFor="manual-phone"
                    required={contactMethod === 'sms' || contactMethod === 'whatsapp'}
                  >
                    Phone
                  </FieldLabel>
                  <input
                    id="manual-phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    className={inputClass}
                  />
                </div>
              ) : null}
            </div>
          </Section>

          {visibleFields.length > 0 ? (
            <Section title="Request details">
              <div className="grid gap-4 sm:grid-cols-2">
                {visibleFields.map((field) => (
                  <DetailField
                    key={field.key}
                    field={field}
                    value={metadata[field.key] ?? ''}
                    onChange={(value) => updateMetadata(field.key, value)}
                  />
                ))}
              </div>
            </Section>
          ) : null}

          <Section title="Message">
            <div>
              <FieldLabel htmlFor="manual-message" required>
                Message / content
              </FieldLabel>
              <textarea
                id="manual-message"
                required
                maxLength={10000}
                rows={9}
                value={messageText}
                onChange={(event) => setMessageText(event.target.value)}
                className={`${inputClass} resize-y`}
              />
            </div>
          </Section>

          <Section title="Due date">
            <div>
              <FieldLabel htmlFor="manual-due-at">Due date</FieldLabel>
              <input
                id="manual-due-at"
                type="datetime-local"
                value={dueAt}
                onChange={(event) => setDueAt(event.target.value)}
                className={inputClass}
              />
            </div>
          </Section>

          <Section title="Email options">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={sendConfirmationEmail}
                onChange={(event) => setSendConfirmationEmail(event.target.checked)}
                className="mt-1"
              />
              <span>
                <span className="block text-sm text-[var(--text-primary)]">
                  Send confirmation email
                </span>
                <span className="mt-1 block text-xs leading-5 text-[var(--text-muted)]">
                  Sends the owner notification and client confirmation email. Requires a valid client email.
                </span>
              </span>
            </label>
          </Section>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="ui-button ui-button-strong min-h-10 px-4"
            >
              <Save size={16} />
              {submitting ? 'Creating...' : 'Create Ticket'}
            </button>
            {message ? (
              <span
                className="text-sm"
                style={{
                  color:
                    message.type === 'error'
                      ? 'var(--status-danger)'
                      : 'var(--status-success)',
                }}
                role={message.type === 'error' ? 'alert' : undefined}
              >
                {message.text}
              </span>
            ) : null}
          </div>
        </form>
      </main>
    </div>
  );
}
