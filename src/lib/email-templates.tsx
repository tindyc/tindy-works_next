import { ContactEmail } from '@/emails/ContactEmail';
import { SupportEmail } from '@/emails/SupportEmail';
import { UserConfirmationEmail } from '@/emails/UserConfirmationEmail';
import type { SubmissionEmail } from './email';

type TemplatePayload = Readonly<Record<string, string>>;

type ContactDetails = {
  contactMethod: string;
  contactValue: string;
  email: string;
};

export type ContactEmailInput = {
  requestId: string;
  payload: TemplatePayload;
  contact: ContactDetails;
  content: string;
  timestamp?: string;
};

export type SupportEmailInput = {
  requestId: string;
  payload: TemplatePayload;
  contact: ContactDetails;
  content: string;
  metadata?: Record<string, string>;
  intentLabel?: string;
  category?: string;
  timestamp?: string;
};

function contactReplyTo(contact: ContactDetails): string | undefined {
  if (contact.contactMethod === 'email') return contact.contactValue;
  return contact.email || undefined;
}

export function formatContactEmail(input: ContactEmailInput): SubmissionEmail {
  return {
    subject: `[Tindy Works] Contact request ${input.requestId}`,
    react: <ContactEmail {...input} />,
    replyTo: contactReplyTo(input.contact),
  };
}

export function formatSupportEmail(input: SupportEmailInput): SubmissionEmail {
  return {
    subject: `[Tindy Works] Support request ${input.requestId}`,
    react: <SupportEmail {...input} />,
    replyTo: contactReplyTo(input.contact),
  };
}

export type UserConfirmationEmailInput = {
  requestId: string;
  email: string;
  name?: string;
  type: 'contact' | 'support';
  preview?: string;
};

const confirmationTypeLabel: Record<UserConfirmationEmailInput['type'], string> = {
  contact: 'contact request',
  support: 'support request',
};

export function formatUserConfirmationEmail(input: UserConfirmationEmailInput): SubmissionEmail {
  const typeLabel = confirmationTypeLabel[input.type];
  return {
    subject: `Tindy Works — Request received (${input.requestId})`,
    react: (
      <UserConfirmationEmail
        requestId={input.requestId}
        name={input.name}
        type={input.type}
        preview={input.preview}
      />
    ),
    to: [input.email],
    text: `Hi ${input.name ?? 'there'},\n\nYour ${typeLabel} (${input.requestId}) has been received. We'll get back to you shortly.\n\nTindy Works`,
  };
}
