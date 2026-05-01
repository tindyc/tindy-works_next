import { sendSubmissionEmail, type SubmissionEmail } from './email';
import {
  formatContactEmail,
  formatSupportEmail,
  formatUserConfirmationEmail,
} from './email-templates';
import type { TicketStatus } from './admin-validation';
import type { SubmissionEmailStatus } from './submission-status';
import { getIntentConfig, isIntent } from '@/features/support/types/intent';

export type SubmissionRecord = {
  id: string;
  request_id: string;
  type: string;
  intent?: string | null;
  category?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  contact_method: string;
  content: string;
  preview?: string | null;
  metadata?: Record<string, string> | null;
  payload?: Record<string, string> | null;
  email_status: SubmissionEmailStatus;
  ticket_status: TicketStatus;
  source?: 'public_form' | 'admin_manual';
  created_by?: string | null;
  created_by_email?: string | null;
  due_at?: string | null;
  internal_notes?: string | null;
  created_at: string;
  last_activity_at?: string | null;
};

function buildSubmissionOwnerEmail(record: SubmissionRecord) {
  const contact = {
    email: record.email ?? '',
    contactValue:
      record.contact_method === 'email'
        ? (record.email ?? '')
        : (record.phone ?? ''),
    contactMethod: record.contact_method,
  };

  const payload = record.payload ?? {};
  const intentLabel =
    record.intent && isIntent(record.intent)
      ? getIntentConfig(record.intent).ui.label
      : undefined;

  const isSupport =
    record.type === 'support' ||
    (record.intent !== null &&
      record.intent !== undefined &&
      record.intent !== 'general');

  return isSupport
    ? formatSupportEmail({
        requestId: record.request_id,
        payload,
        contact,
        content: record.content,
        metadata: record.metadata ?? undefined,
        intentLabel,
        category: record.category ?? undefined,
      })
    : formatContactEmail({
        requestId: record.request_id,
        payload,
        contact,
        content: record.content,
        metadata: record.metadata ?? undefined,
      });
}

async function sendAndAssert(email: SubmissionEmail) {
  const result = await sendSubmissionEmail(email);
  if (result?.error) {
    throw new Error(
      typeof result.error === 'string'
        ? result.error
        : JSON.stringify(result.error)
    );
  }

  return result;
}

export async function sendSubmissionEmailsFromRecord(record: SubmissionRecord) {
  return sendSubmissionEmail(buildSubmissionOwnerEmail(record));
}

export async function sendSubmissionRetryEmailsFromRecord(
  record: SubmissionRecord
) {
  await sendAndAssert(buildSubmissionOwnerEmail(record));

  if (record.payload?.sendConfirmationEmail !== 'true') return;

  const email = record.email?.trim();
  if (!email) {
    throw new Error(
      'Client email is required to retry confirmation email for this ticket'
    );
  }

  const isContact =
    record.type === 'contact' ||
    record.intent === 'general' ||
    record.category === null;

  return sendAndAssert(
    formatUserConfirmationEmail({
      requestId: record.request_id,
      email,
      name: record.name ?? undefined,
      type: isContact ? 'contact' : 'support',
      preview: record.preview ?? undefined,
    })
  );
}
