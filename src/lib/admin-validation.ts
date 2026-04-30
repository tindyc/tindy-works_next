export const VALID_TICKET_STATUSES = [
  'open',
  'in-progress',
  'waiting',
  'resolved',
] as const;

export type TicketStatus = (typeof VALID_TICKET_STATUSES)[number];

export function isTicketStatus(value: unknown): value is TicketStatus {
  return (
    typeof value === 'string' &&
    VALID_TICKET_STATUSES.includes(value as TicketStatus)
  );
}

export function isNullableString(value: unknown): value is string | null {
  return typeof value === 'string' || value === null;
}