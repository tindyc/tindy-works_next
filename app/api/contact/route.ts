import {
  createFingerprint,
  createPreview,
  createRequestId,
  createSupportFingerprint,
  createUnknownIpKey,
  enforceIpRateLimit,
  enforceRateLimit,
  extractContact,
  getSupportMetadata,
  getNormalizedContent,
  getClientIp,
  sanitizePayload,
  validateContactPayload,
  validateSupportFormPayload,
} from '@/lib/api-utils';
import { handleSubmission } from '@/lib/submission-handler';
import { formatContactEmail, formatSupportEmail } from '@/lib/email-templates';
import { getIntentConfig, isIntent, type Intent } from '@/features/support/types/intent';

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

  if (!payload.intent) {
    return Response.json({ error: 'Request type is required.' }, { status: 400 });
  }

  const contact = extractContact(payload);
  const content = getNormalizedContent(payload);
  const supportIntent: Intent | null = isIntent(payload.intent) ? payload.intent : null;
  const supportIntentConfig = supportIntent ? getIntentConfig(supportIntent) : null;
  const isSupport = supportIntent !== null;
  const meta = isSupport ? getSupportMetadata(payload) : {};

  let validationError: string | null;
  let fingerprint: string;

  if (isSupport) {
    validationError = validateSupportFormPayload(payload, contact, content);
    const personName = meta.forWho === 'someone-else' ? (meta.personName ?? '') : '';
    fingerprint = createSupportFingerprint(payload, contact, content, personName);
  } else if (payload.intent === 'general') {
    validationError = validateContactPayload(payload, contact, content);
    fingerprint = createFingerprint(payload, contact, content);
  } else {
    return Response.json({ error: 'Request type is invalid.' }, { status: 400 });
  }

  if (validationError) {
    return Response.json({ error: validationError }, { status: 400 });
  }

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
    type: supportIntentConfig ? supportIntentConfig.backend.logType : 'contact',
    intent: payload.intent,
    category: supportIntentConfig ? supportIntentConfig.backend.category : 'CONTACT',
    priority: payload.priority,
    forWho: meta.forWho,
    contact: contact.contactValue,
    ipType: clientIp === 'unknown' ? 'unknown' : 'real',
    preview,
    timestamp,
  });

  const ownerEmail = supportIntentConfig
    ? formatSupportEmail({
        requestId,
        payload,
        contact,
        content,
        metadata: meta,
        intentLabel: supportIntentConfig.ui.label,
        category: supportIntentConfig.backend.category,
        timestamp,
      })
    : formatContactEmail({
        requestId,
        payload,
        contact,
        content,
        timestamp,
      });

  const userEmail = contact.contactMethod === 'email' ? contact.contactValue : contact.email || null;

  console.log('COMPUTED_USER_EMAIL_BEFORE_HANDLE_SUBMISSION', {
    requestId,
    type: supportIntentConfig ? supportIntentConfig.backend.logType : 'contact',
    contactMethod: contact.contactMethod,
    contactValue: contact.contactValue,
    contactEmail: contact.email,
    userEmail,
    hasUserEmail: Boolean(userEmail?.trim()),
  });

  await handleSubmission({
    requestId,
    type: supportIntentConfig ? supportIntentConfig.backend.logType : 'contact',
    ownerEmail,
    userEmail,
    userName: payload.name,
    confirmationType: isSupport ? 'support' : 'contact',
    preview: preview ?? undefined,
    payload,
    content,
    contact,
    metadata: meta,
    fingerprint,
    ip: safeIp,
    intent: payload.intent,
    category: supportIntentConfig?.backend.category ?? null,
  });

  return Response.json({
    ok: true,
    requestId,
  });
}
