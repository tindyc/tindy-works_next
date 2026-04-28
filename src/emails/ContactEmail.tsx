import { EmailLayout } from './components/EmailLayout';
import { MetaStrip } from './components/MetaStrip';
import { DetailTable } from './components/DetailTable';
import { MessageBlock } from './components/MessageBlock';

type ContactDetails = {
  contactMethod: string;
  contactValue: string;
  email: string;
};

type Props = {
  requestId: string;
  payload: Readonly<Record<string, string>>;
  contact: ContactDetails;
  content: string;
  timestamp?: string;
};

export function ContactEmail({ requestId, payload, contact, content, timestamp }: Props) {
  const showEmailRow = contact.contactMethod !== 'email' || contact.contactValue !== contact.email;
  const rows: Array<[string, string | undefined]> = [
    ['Name', payload.name],
    ['Contact Method', contact.contactMethod],
    ['Contact', contact.contactValue],
    ...(showEmailRow ? [['Email', contact.email] as [string, string]] : []),
  ];

  return (
    <EmailLayout title="New Contact Submission" timestamp={timestamp}>
      <MetaStrip id={requestId} type="Contact" priority={payload.priority} />
      <DetailTable rows={rows} />
      {content && <MessageBlock message={content} />}
    </EmailLayout>
  );
}
