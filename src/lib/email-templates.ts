type TemplatePayload = Readonly<Record<string, string>>;

type ContactDetails = {
  contactMethod: string;
  contactValue: string;
  email: string;
};

type SupportEmailInput = {
  requestId: string;
  payload: TemplatePayload;
  contact: ContactDetails;
  content: string;
  metadata?: Record<string, string>;
  intentLabel?: string;
  category?: string;
};

type ContactEmailInput = {
  requestId: string;
  payload: TemplatePayload;
  contact: ContactDetails;
  content: string;
};

type PlantRequestEmailInput = {
  requestId: string;
  payload: TemplatePayload;
};

type EmailTemplate = {
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function labelize(key: string) {
  return key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatValue(value: string | undefined) {
  return value?.trim() || 'Not provided';
}

function buildText(title: string, rows: Array<[string, string | undefined]>, message?: string) {
  const lines = [
    title,
    '',
    ...rows.map(([label, value]) => `${label}: ${formatValue(value)}`),
  ];

  if (message) {
    lines.push('', 'Message:', message);
  }

  return lines.join('\n');
}

function buildHtml(title: string, rows: Array<[string, string | undefined]>, message?: string) {
  const rowsHtml = rows
    .map(([label, value]) => `
      <tr>
        <th align="left" style="padding:6px 0;color:#6b7280;font-size:13px;font-weight:600;line-height:1.4;width:180px;vertical-align:top;">${escapeHtml(label)}</th>
        <td style="padding:6px 0;color:#111827;font-size:14px;line-height:1.5;vertical-align:top;">${escapeHtml(formatValue(value))}</td>
      </tr>`)
    .join('');

  const messageHtml = message
    ? `<div style="margin-top:28px;">
        <h2 style="font-size:15px;margin:0 0 10px;color:#111827;">Message</h2>
        <div style="background:#f9fafb;border-radius:8px;padding:16px 18px;">
          <p style="white-space:pre-wrap;line-height:1.6;margin:0;color:#111827;font-size:14px;">${escapeHtml(message)}</p>
        </div>
      </div>`
    : '';

  return `
    <div style="background:#f3f4f6;padding:28px;">
      <div style="font-family:Arial,sans-serif;max-width:680px;margin:0 auto;background:#ffffff;border-radius:10px;padding:28px;color:#111827;">
      <h1 style="font-size:22px;line-height:1.3;margin:0 0 22px;color:#111827;">${escapeHtml(title)}</h1>
      <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%;">
        ${rowsHtml}
      </table>
      ${messageHtml}
      </div>
    </div>`;
}

function metadataRows(metadata: Record<string, string> = {}) {
  return Object.entries(metadata)
    .filter(([, value]) => Boolean(value))
    .map(([key, value]): [string, string] => [labelize(key), value]);
}

function contactReplyTo(contact: ContactDetails) {
  if (contact.contactMethod === 'email') {
    return contact.contactValue;
  }

  return contact.email || undefined;
}

export function formatContactEmail({
  requestId,
  payload,
  contact,
  content,
}: ContactEmailInput): EmailTemplate {
  const title = 'New Contact Submission';
  const showEmailRow = contact.contactMethod !== 'email' || contact.contactValue !== contact.email;
  const rows: Array<[string, string | undefined]> = [
    ['Request ID', requestId],
    ['Name', payload.name],
    ['Contact Method', contact.contactMethod],
    ['Contact', contact.contactValue],
    ...(showEmailRow ? [['Email', contact.email] satisfies [string, string | undefined]] : []),
    ['Priority', payload.priority],
  ];

  return {
    subject: `[Tindy Works] Contact request ${requestId}`,
    html: buildHtml(title, rows, content),
    text: buildText(title, rows, content),
    replyTo: contactReplyTo(contact),
  };
}

export function formatSupportEmail({
  requestId,
  payload,
  contact,
  content,
  metadata,
  intentLabel,
  category,
}: SupportEmailInput): EmailTemplate {
  const title = 'New Support Submission';
  const rows: Array<[string, string | undefined]> = [
    ['Request ID', requestId],
    ['Request Type', intentLabel ?? payload.intent ?? 'Support'],
    ['Category', category],
    ['Name', payload.name],
    ['Contact Method', contact.contactMethod],
    ['Contact', contact.contactValue],
    ['Email', contact.email],
    ['Phone', payload.phone],
    ['Device', payload.device],
    ['Priority', payload.priority],
    ...metadataRows(metadata),
  ];

  return {
    subject: `[Tindy Works] Support request ${requestId}`,
    html: buildHtml(title, rows, content),
    text: buildText(title, rows, content),
    replyTo: contactReplyTo(contact),
  };
}

export function formatPlantRequestEmail({
  requestId,
  payload,
}: PlantRequestEmailInput): EmailTemplate {
  const title = 'New Plant Request';
  const rows: Array<[string, string | undefined]> = [
    ['Request ID', requestId],
    ['Plant', payload.plantName],
    ['Plant ID', payload.plantId],
    ['For', payload.ownerType === 'other' ? 'Someone else' : 'Sender'],
    ['Sender Name', payload.senderName],
    ['Sender Email', payload.senderEmail],
    ['Sender Phone', payload.senderPhone],
    ['Recipient Name', payload.recipientName],
    ['Recipient Phone', payload.recipientPhone],
    ['Recipient Address', payload.recipientAddress],
    ['Gift Message', payload.giftMessage],
    ['Surprise', payload.surprise],
    ['Delivery Method', payload.deliveryMethod],
    ['Collection By', payload.collectionWho],
    ['Collection Date', payload.collectionDate],
    ['Collection Time Window', payload.collectionTimeWindow],
    ['Delivery Address', payload.deliveryAddress || payload.recipientAddress],
    ['Delivery Notes', payload.deliveryNotes],
    ['Hide Sender Info', payload.hideSenderInfoInRecipientConfirmation],
    ['Hide Pricing', payload.hidePricingInRecipientConfirmation],
  ];

  return {
    subject: `[Tindy Works] Plant request ${requestId}`,
    html: buildHtml(title, rows),
    text: buildText(title, rows),
    replyTo: payload.senderEmail || undefined,
  };
}
