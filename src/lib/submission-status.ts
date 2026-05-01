export const VALID_SUBMISSION_EMAIL_STATUSES = [
  'pending',
  'sent',
  'failed',
  'not_required',
] as const;

export type SubmissionEmailStatus =
  (typeof VALID_SUBMISSION_EMAIL_STATUSES)[number];

export function formatSubmissionEmailStatus(status: SubmissionEmailStatus | string) {
  return status === 'not_required' ? 'not required' : status;
}

