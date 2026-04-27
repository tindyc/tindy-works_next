type ContactPayload = Record<string, unknown>;

type RateLimitRecord = {
  count: number;
  windowStart: number;
  lastFingerprint: string;
  lastTimestamp: number;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 5;
const DUPLICATE_GUARD_MS = 8_000;
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

function sanitizePayload(payload: ContactPayload) {
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
  if (payload.company) {
    return 'Spam detected.';
  }

  if (!payload.name) {
    return 'Name is required.';
  }

  if (!payload.email) {
    return 'Email is required.';
  }

  if (!EMAIL_REGEX.test(payload.email)) {
    return 'Email is invalid.';
  }

  if (!payload.message || payload.message.length < 10) {
    return 'Message must be at least 10 characters.';
  }

  return null;
}

export async function POST(request: Request) {
  let rawPayload: ContactPayload;

  try {
    rawPayload = (await request.json()) as ContactPayload;
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
    [payload.email, payload.name, payload.message].join('|'),
  );
  if (rateLimitError) {
    return Response.json({ error: rateLimitError }, { status: 429 });
  }

  return Response.json(
    {
      ok: true,
      requestId: `contact_${Math.random().toString(36).slice(2, 10)}`,
      message: 'Contact message received.',
    },
    { status: 200 },
  );
}
