import {
  createFingerprint,
  createPreview,
  createRequestId,
  createUnknownIpKey,
  enforceIpRateLimit,
  enforceRateLimit,
  extractContact,
  getNormalizedContent,
  getClientIp,
  sanitizePayload,
  validateSupportPayload,
} from '@/lib/api-utils';
import { handleSubmission } from '@/lib/submission-handler';
import { formatSupportEmail } from '@/lib/email-templates';

export async function POST(request: Request) {
  let rawPayload: unknown = null;

  try {
    rawPayload = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON payload.' }, { status: 400 });
  }

  const payload = sanitizePayload(rawPayload);
  if (!Object.values(payload).some(Boolean)) {
    return Response.json({ error: 'Invalid submission.' }, { status: 400 });
  }

  const contact = extractContact(payload);
  const content = getNormalizedContent(payload);
  const validationError = validateSupportPayload(payload, contact, content);
  if (validationError) {
    return Response.json({ error: validationError }, { status: 400 });
  }

  const fingerprint = createFingerprint(payload, contact, content);
  const clientIp = getClientIp(request);
  const safeIp = clientIp === 'unknown'
    ? createUnknownIpKey(fingerprint, contact)
    : clientIp;

  const ipError = enforceIpRateLimit(safeIp);
  if (ipError) {
    return Response.json({ error: ipError }, { status: 429 });
  }

  const rateLimitError = enforceRateLimit(safeIp, fingerprint);
  if (rateLimitError) {
    return Response.json({ error: rateLimitError }, { status: 429 });
  }

  const requestId = createRequestId();
  const preview = createPreview(content);
  const timestamp = new Date().toISOString();

  console.log('NEW_SUBMISSION', {
    requestId,
    type: 'support',
    contact: contact.contactValue,
    ipType: clientIp === 'unknown' ? 'unknown' : 'real',
    preview,
    timestamp,
  });

  const userEmail = contact.contactMethod === 'email' ? contact.contactValue : contact.email || null;

  console.log('COMPUTED_USER_EMAIL_BEFORE_HANDLE_SUBMISSION', {
    requestId,
    type: 'support',
    contactMethod: contact.contactMethod,
    contactValue: contact.contactValue,
    contactEmail: contact.email,
    userEmail,
    hasUserEmail: Boolean(userEmail?.trim()),
  });

  await handleSubmission({
    requestId,
    type: 'support',
    ownerEmail: formatSupportEmail({
      requestId,
      payload,
      contact,
      content,
      timestamp,
    }),
    userEmail,
    userName: payload.name,
    confirmationType: 'support',
    preview: preview ?? undefined,
    payload,
    content,
    contact,
    metadata: undefined,
    fingerprint,
    ip: safeIp,
    intent: payload.intent,
    category: null,
  });

  return Response.json({
    ok: true,
    requestId,
  });
}
