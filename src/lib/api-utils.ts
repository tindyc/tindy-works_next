import { createHash, randomUUID } from 'crypto';
import { isIP } from 'node:net';
import { getIntentConfig, isIntent } from '@/features/support/types/intent';

type RateLimitRecord = {
  lastTimestamp: number;
};

type IpRequestRecord = {
  count: number;
  windowStart: number;
};

type SanitizedPayload = Readonly<Record<string, string>>;
type ContactDetails = {
  email: string;
  contactValue: string;
  contactMethod: string;
  normalizedContactValue: string;
};
const RATE_LIMIT_WINDOW_MS = 30_000;
const RATE_LIMIT_TTL_MS = 5 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5;
const CLEANUP_PROBABILITY = 0.05;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_REGEX = /^\+?[0-9\s\-()]{7,}$/;

const rateLimitStore = new Map<string, RateLimitRecord>();
const ipRequestCounts = new Map<string, IpRequestRecord>();

export function createRequestId() {
  return `REQ-${randomUUID().slice(0, 8)}`;
}

function normalizeValue(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

export function getNormalizedContent(payload: SanitizedPayload) {
  return normalizeValue(payload.message ?? payload.description ?? '');
}

function createShortHash(value: string) {
  return createHash('sha256').update(value).digest('hex').slice(0, 8);
}

function normalizeIpCandidate(value: string) {
  const candidate = value.trim();

  if (candidate.startsWith('[')) {
    const bracketEnd = candidate.indexOf(']');
    return bracketEnd > 0 ? candidate.slice(1, bracketEnd) : candidate;
  }

  if (/^\d{1,3}(?:\.\d{1,3}){3}:\d+$/.test(candidate)) {
    return candidate.split(':')[0];
  }

  return candidate;
}

function isValidIp(value: string) {
  const candidate = normalizeIpCandidate(value);

  return isIP(candidate) !== 0;
}

export function getClientIp(request: Request) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const forwardedIps = forwarded.split(',');
    const clientIp = forwardedIps.find(isValidIp);
    if (clientIp) {
      return normalizeIpCandidate(clientIp);
    }
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp && isValidIp(realIp)) {
    return normalizeIpCandidate(realIp);
  }

  return 'unknown';
}

export function sanitizeValue(rawValue: unknown) {
  if (!['boolean', 'number', 'string'].includes(typeof rawValue)) {
    return '';
  }

  const value = String(rawValue);

  return value
    .trim()
    .replace(/[<>`]/g, '')
    .replace(/\s+/g, ' ');
}

export function sanitizePayload(payload: unknown): SanitizedPayload {
  const sanitized: Record<string, string> = {};

  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return Object.freeze(sanitized);
  }

  for (const [key, value] of Object.entries(payload)) {
    sanitized[key] = sanitizeValue(value);
  }

  return Object.freeze(sanitized);
}

export function extractContact(payload: SanitizedPayload): ContactDetails {
  const contactMethod = payload.contactMethod ?? (payload.email ? 'email' : '');
  const isPhoneMethod = contactMethod === 'sms' || contactMethod === 'whatsapp';
  const contactValue = isPhoneMethod
    ? (payload.phone ?? payload.contactValue ?? payload.email ?? '')
    : (payload.contactValue ?? payload.email ?? '');

  return {
    email: payload.email ?? '',
    contactValue,
    contactMethod,
    normalizedContactValue: normalizeValue(contactValue).toLowerCase(),
  };
}

export function createPreview(content: string): string | undefined {
  return content ? content.slice(0, 50) : undefined;
}

export function isValidEmail(value: string) {
  return EMAIL_REGEX.test(value);
}

export function isValidPhone(value: string) {
  return PHONE_REGEX.test(value.trim());
}

export function getSupportMetadata(payload: SanitizedPayload): Record<string, string> {
  try {
    const metadata = JSON.parse(payload.metadata ?? '{}') as unknown;

    if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
      return {};
    }

    const sanitized: Record<string, string> = {};

    for (const [key, value] of Object.entries(metadata)) {
      sanitized[key] = sanitizeValue(value);
    }

    return sanitized;
  } catch {
    return {};
  }
}

export function validateContent(content: string) {
  if (content.length < 10) {
    return 'Content must be at least 10 characters.';
  }

  if (!/[a-zA-Z]/.test(content) || /^(.)\1{4,}$/.test(content)) {
    return 'Please write a short message with enough context.';
  }

  return null;
}

export function validateContactPayload(payload: SanitizedPayload, contact: ContactDetails, content: string) {
  if (payload.company) {
    return 'Spam detected.';
  }

  if (!payload.name) {
    return 'Name is required.';
  }

  if (!contact.contactValue) {
    return 'Contact details are required.';
  }

  if (contact.contactMethod === 'email' && !isValidEmail(contact.contactValue)) {
    return 'Email is invalid.';
  }

  const contentError = validateContent(content);
  if (contentError === 'Content must be at least 10 characters.') {
    return 'Message must be at least 10 characters.';
  }

  if (contentError) {
    return contentError;
  }

  return null;
}

export function validateSupportPayload(payload: SanitizedPayload, contact: ContactDetails, content: string) {
  if (payload.company) {
    return 'Spam detected.';
  }

  if (!payload.device) {
    return 'Device is required.';
  }

  const contentError = validateContent(content);
  if (contentError === 'Content must be at least 10 characters.') {
    return 'Description must be at least 10 characters.';
  }

  if (contentError) {
    return 'Please write a short description with enough context.';
  }

  if (!payload.name) {
    return 'Name is required.';
  }

  if (!contact.contactMethod || !contact.contactValue) {
    return 'Preferred contact details are required.';
  }

  if (contact.contactMethod === 'email' && !isValidEmail(contact.contactValue)) {
    return 'Email is invalid.';
  }

  return null;
}

export function validateSupportFormPayload(
  payload: SanitizedPayload,
  contact: ContactDetails,
  content: string,
): string | null {
  if (payload.company) return 'Spam detected.';
  if (!payload.intent) return 'Request type is required.';
  if (!isIntent(payload.intent)) return 'Request type is invalid.';
  const intentConfig = getIntentConfig(payload.intent);
  if (payload.consentRequired !== 'true') return 'Consent is required to submit this form.';
  if (!payload.name) return 'Name is required.';

  const method = contact.contactMethod;
  if (!method) return 'Contact method is required.';

  if (method === 'email') {
    if (!contact.contactValue) return 'Email is required.';
    if (!isValidEmail(contact.contactValue)) return 'Email is invalid.';
  } else if (method === 'sms' || method === 'whatsapp') {
    if (!contact.contactValue) return 'Phone number is required for your selected contact method.';
    if (!isValidPhone(contact.contactValue)) return 'Please enter a valid phone number.';
  } else if (method === 'not-sure') {
    const hasEmail = Boolean(payload.email) && isValidEmail(payload.email ?? '');
    const hasPhone = Boolean(payload.phone) && isValidPhone(payload.phone ?? '');
    if (!hasEmail && !hasPhone) return 'Please provide at least an email or phone number.';
    if (payload.email && !isValidEmail(payload.email)) return 'Email is invalid.';
    if (payload.phone && !isValidPhone(payload.phone)) return 'Phone number is invalid.';
  }

  const contentError = validateContent(content);
  if (contentError === 'Content must be at least 10 characters.') return 'Message must be at least 10 characters.';
  if (contentError) return contentError;

  const meta = getSupportMetadata(payload);

  if (meta.forWho === 'someone-else') {
    if (!meta.personName?.trim()) return 'Please provide the name of the person needing help.';
    if (!meta.relationship) return 'Please indicate your relationship to them.';
  }

  if (intentConfig.requiresProjectMetadata) {
    if (!meta.projectGoal) return 'Project goal is required.';
    if (!meta.issueType) return 'Project area is required.';
  }

  if (intentConfig.requiresCompanionshipMetadata) {
    const hasCompanionshipMetadata = Boolean(
      meta.frequency || meta.forWho || meta.personName || meta.notes,
    );

    if (!hasCompanionshipMetadata) {
      return 'Please choose how often check-ins are needed or add check-in details.';
    }
  }

  return null;
}

export function createSupportFingerprint(
  payload: SanitizedPayload,
  contact: ContactDetails,
  content: string,
  personName: string,
): string {
  const name = normalizeValue(payload.name ?? '').toLowerCase();
  const phone = normalizeValue(payload.phone ?? '').toLowerCase();
  const normalizedPersonName = normalizeValue(personName).toLowerCase();
  const message = content.toLowerCase().slice(0, 100);
  return `${contact.normalizedContactValue}|${phone}|${name}|${normalizedPersonName}|${message}`;
}

export function createFingerprint(payload: SanitizedPayload, contact: ContactDetails, content: string) {
  const name = normalizeValue(payload.name ?? '').toLowerCase();
  const device = normalizeValue(payload.device ?? '').toLowerCase();
  const message = content.toLowerCase().slice(0, 100);

  return `${contact.normalizedContactValue}|${name}|${device}|${message}`;
}

export function createUnknownIpKey(fingerprint: string, contact: ContactDetails) {
  const identityHash = createShortHash(contact.normalizedContactValue);

  return `unknown:${fingerprint.slice(0, 12)}:${identityHash}`;
}

function cleanupRateLimitStore() {
  const now = Date.now();

  for (const [key, record] of rateLimitStore.entries()) {
    if (now - record.lastTimestamp > RATE_LIMIT_TTL_MS) {
      rateLimitStore.delete(key);
    }
  }
}

function cleanupIpRequestCounts() {
  const now = Date.now();

  for (const [clientIp, record] of ipRequestCounts.entries()) {
    if (now - record.windowStart > RATE_LIMIT_TTL_MS) {
      ipRequestCounts.delete(clientIp);
    }
  }
}

export function enforceIpRateLimit(clientIp: string) {
  if (Math.random() < CLEANUP_PROBABILITY) {
    cleanupIpRequestCounts();
  }

  const now = Date.now();
  const record = ipRequestCounts.get(clientIp);

  if (!record || now - record.windowStart > RATE_LIMIT_WINDOW_MS) {
    ipRequestCounts.set(clientIp, { count: 1, windowStart: now });
    return null;
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return 'Too many requests. Please wait.';
  }

  record.count += 1;
  return null;
}

export function enforceRateLimit(clientIp: string, fingerprint: string) {
  if (Math.random() < CLEANUP_PROBABILITY) {
    cleanupRateLimitStore();
  }

  const now = Date.now();
  const key = `${clientIp}:${fingerprint}`;
  const existing = rateLimitStore.get(key);

  if (existing && now - existing.lastTimestamp < RATE_LIMIT_WINDOW_MS) {
    return 'Duplicate submission detected. Please wait before trying again.';
  }

  rateLimitStore.set(key, {
    lastTimestamp: now,
  });
  return null;
}
