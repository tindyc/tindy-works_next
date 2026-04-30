import { sendSubmissionEmail } from './email';
import { formatContactEmail, formatSupportEmail } from './email-templates';
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
  email_status: 'pending' | 'sent' | 'failed';
  ticket_status: 'open' | 'in-progress' | 'waiting' | 'resolved';
  internal_notes?: string | null;
  created_at: string;
  last_activity_at?: string | null;
};

export async function sendSubmissionEmailsFromRecord(record: SubmissionRecord) {
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

  const ownerEmail = isSupport
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
      });

  return sendSubmissionEmail(ownerEmail);
}
