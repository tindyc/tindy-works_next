import { getIntentConfig, type Intent } from '@/features/support/types/intent';

export const VALID_ADMIN_SUBMISSION_REQUEST_TYPES = [
  'contact',
  'project',
  'community',
  'companionship',
] as const;

export const VALID_CONTACT_METHODS = [
  'email',
  'sms',
  'whatsapp',
  'not-sure',
] as const;

export const VALID_PERSON_CONTACT_METHODS = ['no', 'phone', 'email'] as const;

export type AdminSubmissionRequestType =
  (typeof VALID_ADMIN_SUBMISSION_REQUEST_TYPES)[number];
export type ContactMethod = (typeof VALID_CONTACT_METHODS)[number];
export type PersonContactMethod = (typeof VALID_PERSON_CONTACT_METHODS)[number];

export type AdminSubmissionFieldKey =
  | 'forWho'
  | 'helpType'
  | 'frequency'
  | 'projectGoal'
  | 'issueType'
  | 'priority'
  | 'personName'
  | 'relationship'
  | 'personContactMethod'
  | 'personPhone'
  | 'personEmail'
  | 'notes';

export type AdminSubmissionField = {
  key: AdminSubmissionFieldKey;
  label: string;
  kind: 'text' | 'textarea' | 'select';
  required?: boolean;
  options?: readonly { value: string; label: string }[];
  maxLength?: number;
  showWhen?: Partial<Record<AdminSubmissionFieldKey, string>>;
};

export type AdminSubmissionMapping = {
  type: 'contact' | ReturnType<typeof getIntentConfig>['backend']['logType'];
  intent: 'general' | Intent;
  category: ReturnType<typeof getIntentConfig>['backend']['category'] | null;
  label: string;
  confirmationType: 'contact' | 'support';
};

const contactMethods = [
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'not-sure', label: 'Not sure' },
] as const satisfies readonly { value: ContactMethod; label: string }[];

const forWhoOptions = [
  { value: 'myself', label: 'Myself' },
  { value: 'someone-else', label: 'Someone else' },
] as const;

const personContactOptions = [
  { value: 'no', label: 'No, contact me only' },
  { value: 'phone', label: 'Yes, via phone' },
  { value: 'email', label: 'Yes, via email' },
] as const;

export const ADMIN_SUBMISSION_CONTACT_METHOD_OPTIONS = contactMethods;

export const ADMIN_SUBMISSION_REQUEST_DETAILS = {
  contact: {
    label: 'General contact',
    intent: 'general',
    type: 'contact',
    category: null,
    confirmationType: 'contact',
    fields: [],
  },
  project: {
    label: 'Project enquiry/client support',
    type: getIntentConfig('client').backend.logType,
    category: getIntentConfig('client').backend.category,
    intent: 'client',
    confirmationType: 'support',
    fields: [
      {
        key: 'projectGoal',
        label: 'What are they trying to do?',
        kind: 'select',
        required: true,
        options: [
          { value: 'fix', label: 'Fix something' },
          { value: 'build', label: 'Build something new' },
          { value: 'improve', label: 'Improve performance' },
          { value: 'not-sure', label: 'Not sure' },
        ],
      },
      {
        key: 'issueType',
        label: 'What area is it in?',
        kind: 'select',
        required: true,
        options: [
          { value: 'website', label: 'Website' },
          { value: 'app', label: 'App' },
          { value: 'automation', label: 'Automation' },
          { value: 'not-sure', label: 'Not sure' },
        ],
      },
      {
        key: 'priority',
        label: 'Priority',
        kind: 'select',
        options: [
          { value: 'normal', label: 'Normal' },
          { value: 'soon', label: 'Soon' },
          { value: 'not-sure', label: 'Not sure' },
        ],
      },
    ],
  },
  community: {
    label: 'Community support',
    type: getIntentConfig('community').backend.logType,
    category: getIntentConfig('community').backend.category,
    intent: 'community',
    confirmationType: 'support',
    fields: [
      {
        key: 'forWho',
        label: 'Who needs help?',
        kind: 'select',
        options: forWhoOptions,
      },
      {
        key: 'helpType',
        label: 'What kind of help is needed?',
        kind: 'select',
        options: [
          { value: 'phone', label: 'Phone or tablet' },
          { value: 'computer', label: 'Laptop or computer' },
          { value: 'internet', label: 'Email or internet' },
          { value: 'not-sure', label: 'Not sure' },
        ],
      },
      {
        key: 'personName',
        label: 'Their name',
        kind: 'text',
        required: true,
        showWhen: { forWho: 'someone-else' },
      },
      {
        key: 'relationship',
        label: 'Your relationship',
        kind: 'select',
        required: true,
        showWhen: { forWho: 'someone-else' },
        options: [
          { value: 'family', label: 'Family member' },
          { value: 'friend', label: 'Friend' },
          { value: 'client', label: 'Client' },
          { value: 'other', label: 'Other' },
        ],
      },
      {
        key: 'personContactMethod',
        label: 'Can they be contacted directly?',
        kind: 'select',
        showWhen: { forWho: 'someone-else' },
        options: personContactOptions,
      },
      {
        key: 'personPhone',
        label: 'Their phone number',
        kind: 'text',
        required: true,
        showWhen: { forWho: 'someone-else', personContactMethod: 'phone' },
      },
      {
        key: 'personEmail',
        label: 'Their email address',
        kind: 'text',
        required: true,
        showWhen: { forWho: 'someone-else', personContactMethod: 'email' },
      },
      {
        key: 'notes',
        label: 'Notes',
        kind: 'textarea',
        maxLength: 1000,
        showWhen: { forWho: 'someone-else' },
      },
    ],
  },
  companionship: {
    label: 'Companionship/check-in',
    type: getIntentConfig('companionship').backend.logType,
    category: getIntentConfig('companionship').backend.category,
    intent: 'companionship',
    confirmationType: 'support',
    fields: [
      {
        key: 'forWho',
        label: 'Who needs check-ins?',
        kind: 'select',
        options: forWhoOptions,
      },
      {
        key: 'frequency',
        label: 'How often?',
        kind: 'select',
        required: true,
        options: [
          { value: 'occasional', label: 'Occasional' },
          { value: 'weekly', label: 'Weekly' },
          { value: 'not-sure', label: 'Not sure' },
        ],
      },
      {
        key: 'personName',
        label: 'Their name',
        kind: 'text',
        required: true,
        showWhen: { forWho: 'someone-else' },
      },
      {
        key: 'relationship',
        label: 'Your relationship',
        kind: 'select',
        required: true,
        showWhen: { forWho: 'someone-else' },
        options: [
          { value: 'family', label: 'Family member' },
          { value: 'friend', label: 'Friend' },
          { value: 'client', label: 'Client' },
          { value: 'other', label: 'Other' },
        ],
      },
      {
        key: 'personContactMethod',
        label: 'Can they be contacted directly?',
        kind: 'select',
        showWhen: { forWho: 'someone-else' },
        options: personContactOptions,
      },
      {
        key: 'personPhone',
        label: 'Their phone number',
        kind: 'text',
        required: true,
        showWhen: { forWho: 'someone-else', personContactMethod: 'phone' },
      },
      {
        key: 'personEmail',
        label: 'Their email address',
        kind: 'text',
        required: true,
        showWhen: { forWho: 'someone-else', personContactMethod: 'email' },
      },
      {
        key: 'notes',
        label: 'Check-in notes',
        kind: 'textarea',
        maxLength: 1000,
        showWhen: { forWho: 'someone-else' },
      },
    ],
  },
} as const satisfies Record<
  AdminSubmissionRequestType,
  {
    label: string;
    type: string;
    intent: string;
    category: string | null;
    confirmationType: 'contact' | 'support';
    fields: readonly AdminSubmissionField[];
  }
>;

export const ADMIN_SUBMISSION_REQUEST_OPTIONS =
  VALID_ADMIN_SUBMISSION_REQUEST_TYPES.map((value) => ({
    value,
    label: ADMIN_SUBMISSION_REQUEST_DETAILS[value].label,
  }));

export const ADMIN_SUBMISSION_REQUEST_MAPPING = Object.fromEntries(
  VALID_ADMIN_SUBMISSION_REQUEST_TYPES.map((value) => {
    const details = ADMIN_SUBMISSION_REQUEST_DETAILS[value];
    return [
      value,
      {
        type: details.type,
        intent: details.intent,
        category: details.category,
        label: details.label,
        confirmationType: details.confirmationType,
      },
    ];
  }),
) as Record<AdminSubmissionRequestType, AdminSubmissionMapping>;

export function isAdminSubmissionRequestType(
  value: unknown,
): value is AdminSubmissionRequestType {
  return (
    typeof value === 'string' &&
    VALID_ADMIN_SUBMISSION_REQUEST_TYPES.includes(
      value as AdminSubmissionRequestType,
    )
  );
}

export function isContactMethod(value: unknown): value is ContactMethod {
  return (
    typeof value === 'string' &&
    VALID_CONTACT_METHODS.includes(value as ContactMethod)
  );
}

export function isNullableString(value: unknown): value is string | null {
  return typeof value === 'string' || value === null;
}

export function normalizeNullableString(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string') {
    throw new Error('Expected a string or null');
  }

  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

export function validateMaxStringLength(
  value: string | null,
  maxLength: number,
) {
  return value === null || value.length <= maxLength;
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

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isValidPhone(value: string) {
  return /^\+?[0-9\s\-()]{7,}$/.test(value.trim());
}

export function normalizeSendConfirmationEmail(value: unknown) {
  if (value === undefined) return false;
  if (typeof value !== 'boolean') {
    throw new Error('send_confirmation_email must be a boolean');
  }

  return value;
}

export function shouldShowAdminSubmissionField(
  field: { showWhen?: Partial<Record<AdminSubmissionFieldKey, string>> },
  metadata: Partial<Record<AdminSubmissionFieldKey, string | null>>,
) {
  if (!field.showWhen) return true;

  return Object.entries(field.showWhen).every(
    ([key, value]) => metadata[key as AdminSubmissionFieldKey] === value,
  );
}
