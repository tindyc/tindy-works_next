import { sendSubmissionEmail } from '@/lib/email';
import { formatPlantRequestEmail } from '@/lib/email-templates';

type RequestPayload = Record<string, unknown>;

type RateLimitRecord = {
  count: number;
  windowStart: number;
  lastFingerprint: string;
  lastTimestamp: number;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+]?[(]?[0-9\s\-().]{7,}$/;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 6;
const DUPLICATE_GUARD_MS = 8_000;
const rateLimitStore = new Map<string, RateLimitRecord>();
const CHALLENGE_WORDS = new Set(['monstera', 'philodendron', 'calathea', 'maranta', 'pothos']);

function getClientIp(request: Request) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || 'unknown';
  }

  return request.headers.get('x-real-ip') ?? 'unknown';
}

function sanitizeValue(rawValue: unknown) {
  if (typeof rawValue !== 'string') {
    return '';
  }

  return rawValue
    .trim()
    .replace(/[<>`]/g, '')
    .replace(/\s+/g, ' ');
}

function sanitizePayload(payload: RequestPayload) {
  const sanitized: Record<string, string> = {};

  for (const [key, value] of Object.entries(payload)) {
    sanitized[key] = sanitizeValue(value);
  }

  return sanitized;
}

function requireField(fieldName: string, value: string, errors: string[]) {
  if (!value) {
    errors.push(`${fieldName} is required.`);
  }
}

function validatePhone(fieldName: string, value: string, errors: string[]) {
  if (!value || PHONE_REGEX.test(value)) {
    return;
  }

  errors.push(`${fieldName} is invalid.`);
}

function enforceRateLimit(clientIp: string, fingerprint: string) {
  const now = Date.now();
  const existing = rateLimitStore.get(clientIp);

  if (!existing) {
    rateLimitStore.set(clientIp, {
      count: 1,
      windowStart: now,
      lastFingerprint: fingerprint,
      lastTimestamp: now,
    });
    return null;
  }

  if (now - existing.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(clientIp, {
      count: 1,
      windowStart: now,
      lastFingerprint: fingerprint,
      lastTimestamp: now,
    });
    return null;
  }

  if (now - existing.lastTimestamp < DUPLICATE_GUARD_MS && existing.lastFingerprint === fingerprint) {
    return 'Duplicate submission detected. Please wait before trying again.';
  }

  if (existing.count >= RATE_LIMIT_MAX) {
    return 'Too many requests. Please wait and try again.';
  }

  existing.count += 1;
  existing.lastFingerprint = fingerprint;
  existing.lastTimestamp = now;
  rateLimitStore.set(clientIp, existing);
  return null;
}

function validatePayload(payload: Record<string, string>) {
  const errors: string[] = [];

  if (payload.company) {
    errors.push('Spam detected.');
    return errors;
  }

  requireField('senderName', payload.senderName, errors);
  requireField('senderEmail', payload.senderEmail, errors);
  requireField('senderPhone', payload.senderPhone, errors);
  requireField('ownerType', payload.ownerType, errors);
  requireField('deliveryMethod', payload.deliveryMethod, errors);

  if (payload.senderEmail && !EMAIL_REGEX.test(payload.senderEmail)) {
    errors.push('senderEmail is invalid.');
  }

  validatePhone('senderPhone', payload.senderPhone, errors);

  if (payload.ownerType === 'other') {
    requireField('recipientName', payload.recipientName, errors);
    requireField('recipientAddress', payload.recipientAddress, errors);
    validatePhone('recipientPhone', payload.recipientPhone, errors);
  }

  if (payload.deliveryMethod === 'collection') {
    requireField('collectionWho', payload.collectionWho, errors);
    requireField('collectionDate', payload.collectionDate, errors);
    requireField('collectionTimeWindow', payload.collectionTimeWindow, errors);
  }

  if (payload.deliveryMethod === 'post') {
    const effectiveAddress = payload.deliveryAddress || payload.recipientAddress;
    requireField('deliveryAddress', effectiveAddress, errors);
  }

  const challengeWord = payload.challengeWord?.toLowerCase();
  const challengeAnswer = payload.humanChallengeAnswer?.toLowerCase();
  if (!challengeWord || !CHALLENGE_WORDS.has(challengeWord)) {
    errors.push('Challenge word is invalid.');
  } else {
    const expected = challengeWord.slice(-3);
    if (challengeAnswer !== expected) {
      errors.push('Challenge answer is incorrect.');
    }
  }

  return errors;
}

export async function POST(request: Request) {
  let rawPayload: RequestPayload;

  try {
    rawPayload = (await request.json()) as RequestPayload;
  } catch {
    return Response.json({ error: 'Invalid JSON payload.' }, { status: 400 });
  }

  const payload = sanitizePayload(rawPayload);
  const clientIp = getClientIp(request);
  const fingerprint = [
    payload.senderEmail,
    payload.senderPhone,
    payload.recipientName,
    payload.deliveryMethod,
    payload.plantId,
  ].join('|');

  const rateLimitError = enforceRateLimit(clientIp, fingerprint);
  if (rateLimitError) {
    return Response.json({ error: rateLimitError }, { status: 429 });
  }

  const validationErrors = validatePayload(payload);
  if (validationErrors.length > 0) {
    return Response.json({ error: validationErrors[0] }, { status: 400 });
  }

  const requestId = `req_${Math.random().toString(36).slice(2, 10)}`;

  try {
    const result = await sendSubmissionEmail(formatPlantRequestEmail({
      requestId,
      payload,
    }));
    console.log('EMAIL_RESULT', { requestId, result });
  } catch (error) {
    console.error('EMAIL_DELIVERY_FAILED', {
      requestId,
      type: 'plant-request',
      error: error instanceof Error ? error.message : error,
    });
  }

  return Response.json(
    {
      ok: true,
      requestId,
    },
    { status: 200 },
  );
}
