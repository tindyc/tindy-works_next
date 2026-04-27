type SupportPayload = Record<string, unknown>;

type RateLimitRecord = {
  count: number;
  windowStart: number;
  lastFingerprint: string;
  lastTimestamp: number;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RATE_LIMIT_WINDOW_MS = 30_000;
const RATE_LIMIT_MAX = 1;
const MIN_SUBMISSION_TIME_MS = 2_000;
const rateLimitStore = new Map<string, RateLimitRecord>();

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

function sanitizePayload(payload: SupportPayload) {
  const sanitized: Record<string, string> = {};

  for (const [key, value] of Object.entries(payload)) {
    sanitized[key] = sanitizeValue(value);
  }

  return sanitized;
}

function enforceRateLimit(clientIp: string, fingerprint: string) {
  const now = Date.now();
  const existing = rateLimitStore.get(clientIp);

  if (!existing || now - existing.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(clientIp, {
      count: 1,
      windowStart: now,
      lastFingerprint: fingerprint,
      lastTimestamp: now,
    });
    return null;
  }

  if (now - existing.lastTimestamp < RATE_LIMIT_WINDOW_MS && existing.lastFingerprint === fingerprint) {
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
  if (payload.company) {
    return 'Spam detected.';
  }

  const formElapsedMs = Number(payload.formElapsedMs);
  if (!Number.isFinite(formElapsedMs) || formElapsedMs < MIN_SUBMISSION_TIME_MS) {
    return 'Please take a moment to review your message before sending it.';
  }

  if (!payload.device) {
    return 'Device is required.';
  }

  if (!payload.description || payload.description.length < 10) {
    return 'Description must be at least 10 characters.';
  }

  if (/^(.)\1{4,}$/.test(payload.description) || /^[^a-zA-Z]*$/.test(payload.description)) {
    return 'Please write a short description with enough context.';
  }

  if (!payload.name) {
    return 'Name is required.';
  }

  if (!payload.contactMethod || !payload.contactValue) {
    return 'Preferred contact details are required.';
  }

  if (payload.contactMethod === 'email' && !EMAIL_REGEX.test(payload.contactValue)) {
    return 'Email is invalid.';
  }

  return null;
}

export async function POST(request: Request) {
  let rawPayload: SupportPayload;

  try {
    rawPayload = (await request.json()) as SupportPayload;
  } catch {
    return Response.json({ error: 'Invalid JSON payload.' }, { status: 400 });
  }

  const payload = sanitizePayload(rawPayload);
  const validationError = validatePayload(payload);
  if (validationError) {
    return Response.json({ error: validationError }, { status: 400 });
  }

  const rateLimitError = enforceRateLimit(
    getClientIp(request),
    [payload.contactValue, payload.name, payload.device, payload.description].join('|'),
  );
  if (rateLimitError) {
    return Response.json({ error: rateLimitError }, { status: 429 });
  }

  return Response.json(
    {
      ok: true,
      requestId: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
      message: 'Support request received.',
    },
    { status: 200 },
  );
}
