import { ContactEmail } from '@/emails/ContactEmail';
import { SupportEmail } from '@/emails/SupportEmail';
import { PlantRequestEmail } from '@/emails/PlantRequestEmail';
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

export type PlantRequestEmailInput = {
  requestId: string;
  payload: TemplatePayload;
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

export function formatPlantRequestEmail(input: PlantRequestEmailInput): SubmissionEmail {
  return {
    subject: `[Tindy Works] Plant request ${input.requestId}`,
    react: <PlantRequestEmail {...input} />,
    replyTo: input.payload.senderEmail || undefined,
  };
}
