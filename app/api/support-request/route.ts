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

  console.log('NEW_SUBMISSION', {
    requestId,
    type: 'support',
    contact: contact.contactValue,
    ipType: clientIp === 'unknown' ? 'unknown' : 'real',
    preview,
    timestamp: new Date().toISOString(),
  });

  return Response.json({
    ok: true,
    requestId,
  });
}
