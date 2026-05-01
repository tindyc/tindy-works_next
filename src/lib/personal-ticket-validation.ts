export const VALID_PERSONAL_TICKET_STATUSES = [
  'open',
  'in-progress',
  'waiting',
  'resolved',
] as const;

export const VALID_PERSONAL_TICKET_PRIORITIES = [
  'low',
  'normal',
  'high',
  'urgent',
] as const;

export const VALID_PERSONAL_TICKET_CATEGORIES = [
  'general',
  'website',
  'job-hunt',
  'learning',
  'life-admin',
  'follow-up',
  'content',
  'bug',
] as const;

export type PersonalTicketStatus =
  (typeof VALID_PERSONAL_TICKET_STATUSES)[number];

export type PersonalTicketPriority =
  (typeof VALID_PERSONAL_TICKET_PRIORITIES)[number];

export type PersonalTicketCategory =
  (typeof VALID_PERSONAL_TICKET_CATEGORIES)[number];

export function isPersonalTicketStatus(
  value: unknown
): value is PersonalTicketStatus {
  return (
    typeof value === 'string' &&
    VALID_PERSONAL_TICKET_STATUSES.includes(value as PersonalTicketStatus)
  );
}

export function isPersonalTicketPriority(
  value: unknown
): value is PersonalTicketPriority {
  return (
    typeof value === 'string' &&
    VALID_PERSONAL_TICKET_PRIORITIES.includes(value as PersonalTicketPriority)
  );
}

export function isPersonalTicketCategory(
  value: unknown
): value is PersonalTicketCategory {
  return (
    typeof value === 'string' &&
    VALID_PERSONAL_TICKET_CATEGORIES.includes(value as PersonalTicketCategory)
  );
}

export function isNullableString(value: unknown): value is string | null {
  return typeof value === 'string' || value === null;
}

export function normalizeOptionalDate(value: unknown): string | null {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value !== 'string') {
    throw new Error('Invalid date value');
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error('Invalid date value');
  }

  return date.toISOString();
}
