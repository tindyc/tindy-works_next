import { EmailLayout } from './components/EmailLayout';
import { MetaStrip } from './components/MetaStrip';
import { DetailTable } from './components/DetailTable';
import { MessageBlock } from './components/MessageBlock';
import { SectionTitle } from './components/SectionTitle';

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
  metadata?: Record<string, string>;
  timestamp?: string;
};

function labelize(key: string) {
  return key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

export function ContactEmail({
  requestId,
  payload,
  contact,
  content,
  metadata,
  timestamp,
}: Props) {
  const showEmailRow = contact.contactMethod !== 'email' || contact.contactValue !== contact.email;
  const rows: Array<[string, string | undefined]> = [
    ['Name', payload.name],
    ['Contact Method', contact.contactMethod],
    ['Contact', contact.contactValue],
    ...(showEmailRow ? [['Email', contact.email] as [string, string]] : []),
  ];
  const detailRows = Object.entries(metadata ?? {})
    .filter(([, v]) => Boolean(v))
    .map(([k, v]): [string, string] => [labelize(k), v]);

  return (
    <EmailLayout title="New Contact Submission" timestamp={timestamp}>
      <MetaStrip id={requestId} type="Contact" priority={payload.priority} />
      <DetailTable rows={rows} />
      {detailRows.length > 0 && (
        <>
          <SectionTitle>Details</SectionTitle>
          <DetailTable rows={detailRows} />
        </>
      )}
      {content && <MessageBlock message={content} />}
    </EmailLayout>
  );
}
