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
  intentLabel?: string;
  category?: string;
  timestamp?: string;
};

function labelize(key: string) {
  return key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

export function SupportEmail({ requestId, payload, contact, content, metadata, intentLabel, category, timestamp }: Props) {
  const type = intentLabel ?? payload.intent ?? 'Support';

  const userRows: Array<[string, string | undefined]> = [
    ['Name', payload.name],
    ['Contact Method', contact.contactMethod],
    ['Contact', contact.contactValue],
    ['Email', contact.email],
    ['Phone', payload.phone],
  ];

  const issueRows: Array<[string, string | undefined]> = [
    ['Category', category],
    ...Object.entries(metadata ?? {})
      .filter(([, v]) => Boolean(v))
      .map(([k, v]): [string, string] => [labelize(k), v]),
  ];

  const deviceRows: Array<[string, string | undefined]> = [
    ['Device', payload.device],
  ];

  const hasDevice = Boolean(payload.device);

  return (
    <EmailLayout title="New Support Submission" timestamp={timestamp}>
      <MetaStrip id={requestId} type={type} priority={payload.priority} />
      <SectionTitle>User Info</SectionTitle>
      <DetailTable rows={userRows} />
      <SectionTitle>Issue Details</SectionTitle>
      <DetailTable rows={issueRows} />
      {hasDevice && (
        <>
          <SectionTitle>Device Context</SectionTitle>
          <DetailTable rows={deviceRows} />
        </>
      )}
      {content && <MessageBlock message={content} />}
    </EmailLayout>
  );
}
