import { supabase } from '@/lib/supabase';
import { getAdminUser } from '@/lib/admin-auth';
import { sendSubmissionEmail, type SubmissionEmail } from '@/lib/email';
import {
  formatContactEmail,
  formatSupportEmail,
  formatUserConfirmationEmail,
} from '@/lib/email-templates';
import {
  createPreview,
  createRequestId,
  extractContact,
  getNormalizedContent,
  getSupportMetadata,
  sanitizePayload,
  validateContactPayload,
  validateSupportFormPayload,
} from '@/lib/api-utils';
import {
  ADMIN_SUBMISSION_REQUEST_DETAILS,
  ADMIN_SUBMISSION_REQUEST_MAPPING,
  VALID_ADMIN_SUBMISSION_REQUEST_TYPES,
  VALID_CONTACT_METHODS,
  shouldShowAdminSubmissionField,
  type AdminSubmissionField,
  type AdminSubmissionRequestType,
  type ContactMethod,
  type AdminSubmissionFieldKey,
  isAdminSubmissionRequestType,
  isContactMethod,
  isValidEmail,
  normalizeOptionalDate,
  normalizeSendConfirmationEmail,
} from '@/lib/admin-submission-validation';

type ManualSubmissionBody = {
  request_type: AdminSubmissionRequestType;
  name: string;
  email: string;
  phone: string;
  contact_method: ContactMethod;
  message: string;
  due_at: string | null;
  send_confirmation_email: boolean;
  metadata: Partial<Record<AdminSubmissionFieldKey, string>>;
  payload: Record<string, string>;
  content: string;
  preview?: string;
};

type ManualSubmissionValidation =
  | { ok: true; value: ManualSubmissionBody }
  | { ok: false; response: Response };

function badRequest(error: string, extra?: Record<string, unknown>) {
  return {
    ok: false as const,
    response: Response.json({ error, ...extra }, { status: 400 }),
  };
}

function normalizeText(value: unknown) {
  if (value === null || value === undefined) return '';
  if (!['boolean', 'number', 'string'].includes(typeof value)) {
    throw new Error('Expected a string');
  }

  return String(value)
    .trim()
    .replace(/[<>`]/g, '')
    .replace(/\s+/g, ' ');
}

function normalizeMetadata(value: unknown) {
  if (value === null || value === undefined) return {};
  if (typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('metadata must be an object');
  }

  const metadata: Partial<Record<AdminSubmissionFieldKey, string>> = {};
  for (const [key, raw] of Object.entries(value)) {
    metadata[key as AdminSubmissionFieldKey] = normalizeText(raw);
  }

  return metadata;
}

function withFilledValues(values: Record<string, string | undefined>) {
  return Object.fromEntries(
    Object.entries(values).filter((entry): entry is [string, string] =>
      Boolean(entry[1]),
    ),
  );
}

function buildPublicShapedPayload(ticket: {
  request_type: AdminSubmissionRequestType;
  name: string;
  email: string;
  phone: string;
  contact_method: ContactMethod;
  message: string;
  metadata: Partial<Record<AdminSubmissionFieldKey, string>>;
  send_confirmation_email: boolean;
}) {
  if (ticket.request_type === 'contact') {
    return sanitizePayload({
      intent: 'general',
      name: ticket.name,
      email: ticket.email,
      message: ticket.message,
      company: '',
      metadata: '{}',
      sendConfirmationEmail: String(ticket.send_confirmation_email),
      adminEntered: 'true',
    });
  }

  const metadata = withFilledValues({
    forWho: ticket.metadata.forWho,
    helpType: ticket.metadata.helpType,
    frequency: ticket.metadata.frequency,
    projectGoal: ticket.metadata.projectGoal,
    issueType: ticket.metadata.issueType,
    priority: ticket.metadata.priority,
    ...(ticket.metadata.forWho === 'someone-else'
      ? {
          personName: ticket.metadata.personName,
          relationship: ticket.metadata.relationship,
          personContactMethod: ticket.metadata.personContactMethod,
          ...(ticket.metadata.personContactMethod === 'phone'
            ? { personPhone: ticket.metadata.personPhone }
            : {}),
          ...(ticket.metadata.personContactMethod === 'email'
            ? { personEmail: ticket.metadata.personEmail }
            : {}),
          notes: ticket.metadata.notes,
        }
      : {}),
    adminEntered: 'true',
  });

  return sanitizePayload({
    intent: ADMIN_SUBMISSION_REQUEST_MAPPING[ticket.request_type].intent,
    name: ticket.name,
    message: ticket.message,
    contactMethod: ticket.contact_method,
    company: '',
    consentRequired: 'true',
    metadata: JSON.stringify(metadata),
    sendConfirmationEmail: String(ticket.send_confirmation_email),
    ...(ticket.email ? { email: ticket.email } : {}),
    ...(ticket.phone ? { phone: ticket.phone } : {}),
    ...(ticket.metadata.priority ? { priority: ticket.metadata.priority } : {}),
    adminEntered: 'true',
  });
}

function validateManualSubmissionBody(body: unknown): ManualSubmissionValidation {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return badRequest('Invalid request body');
  }

  const b = body as Record<string, unknown>;

  if (!isAdminSubmissionRequestType(b.request_type)) {
    return badRequest('request_type is invalid', {
      allowed: VALID_ADMIN_SUBMISSION_REQUEST_TYPES,
    });
  }

  let sendConfirmationEmail: boolean;
  try {
    sendConfirmationEmail = normalizeSendConfirmationEmail(
      b.send_confirmation_email,
    );
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : 'Invalid email option');
  }

  let name: string;
  let email: string;
  let phone: string;
  let message: string;
  let metadata: Partial<Record<AdminSubmissionFieldKey, string>>;
  let contactMethod: ContactMethod;
  try {
    name = normalizeText(b.name);
    email = normalizeText(b.email);
    phone = normalizeText(b.phone);
    message = normalizeText(b.message ?? b.content);
    metadata = normalizeMetadata(b.metadata);
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : 'Invalid request body');
  }

  if (name.length > 160) {
    return badRequest('name must be 160 characters or fewer');
  }

  if (b.request_type === 'contact') {
    contactMethod = 'email';
  } else if (!isContactMethod(b.contact_method)) {
    return badRequest('contact_method is invalid', {
      allowed: VALID_CONTACT_METHODS,
    });
  } else {
    contactMethod = b.contact_method;
  }

  if (email && !isValidEmail(email)) {
    return badRequest('email must be a valid email address');
  }
  if (sendConfirmationEmail && (!email || !isValidEmail(email))) {
    return badRequest(
      'A valid client email is required to send confirmation email',
    );
  }

  if (message.length > 10000) {
    return badRequest('message must be 10000 characters or fewer');
  }

  let dueAt: string | null;
  try {
    dueAt = normalizeOptionalDate(b.due_at);
  } catch {
    return badRequest('Invalid date value');
  }

  const details = ADMIN_SUBMISSION_REQUEST_DETAILS[b.request_type];
  const fields = details.fields as readonly AdminSubmissionField[];
  for (const field of fields) {
    if (!shouldShowAdminSubmissionField(field, metadata)) continue;

    const value = metadata[field.key] ?? '';
    if (field.required && !value) return badRequest(`${field.label} is required`);
    if (
      field.options &&
      value &&
      !field.options.some((option) => option.value === value)
    ) {
      return badRequest(`${field.label} is invalid`);
    }
    if (field.maxLength && value.length > field.maxLength) {
      return badRequest(`${field.label} must be ${field.maxLength} characters or fewer`);
    }
  }

  const payload = buildPublicShapedPayload({
    request_type: b.request_type,
    name,
    email,
    phone,
    contact_method: contactMethod,
    message,
    metadata,
    send_confirmation_email: sendConfirmationEmail,
  });
  const contact = extractContact(payload);
  const content = getNormalizedContent(payload);
  const validationError =
    b.request_type === 'contact'
      ? validateContactPayload(payload, contact, content)
      : validateSupportFormPayload(payload, contact, content);

  if (validationError) return badRequest(validationError);

  return {
    ok: true,
    value: {
      request_type: b.request_type,
      name,
      email,
      phone,
      contact_method: contactMethod,
      message,
      due_at: dueAt,
      send_confirmation_email: sendConfirmationEmail,
      metadata,
      payload,
      content,
      preview: createPreview(content),
    },
  };
}

function buildManualContact(ticket: ManualSubmissionBody) {
  return extractContact(ticket.payload);
}

function buildOwnerEmail({
  requestId,
  ticket,
  metadata,
  timestamp,
}: {
  requestId: string;
  ticket: ManualSubmissionBody;
  metadata: Record<string, string>;
  timestamp: string;
}) {
  const contact = buildManualContact(ticket);

  if (ticket.request_type === 'contact') {
    return formatContactEmail({
      requestId,
      payload: ticket.payload,
      contact,
      content: ticket.content,
      metadata,
      timestamp,
    });
  }

  const mapping = ADMIN_SUBMISSION_REQUEST_MAPPING[ticket.request_type];
  return formatSupportEmail({
    requestId,
    payload: ticket.payload,
    contact,
    content: ticket.content,
    metadata,
    intentLabel: ADMIN_SUBMISSION_REQUEST_DETAILS[ticket.request_type].label,
    category: mapping.category ?? undefined,
    timestamp,
  });
}

async function sendAndAssert(email: SubmissionEmail) {
  const result = await sendSubmissionEmail(email);
  if (result?.error) {
    throw new Error(
      typeof result.error === 'string'
        ? result.error
        : JSON.stringify(result.error)
    );
  }
}

export async function GET(request: Request) {
  const user = await getAdminUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const ticketStatus = searchParams.get('status');
  const search = searchParams.get('q')?.trim();
  const rawRequestFilter = searchParams.get('request');
  const requestFilter =
    rawRequestFilter === 'contact' ||
    rawRequestFilter === 'project' ||
    rawRequestFilter === 'community'
      ? rawRequestFilter
      : 'all';
  const pageParam = Number(searchParams.get('page'));
  const limitParam = Number(searchParams.get('limit'));
  const page = Number.isFinite(pageParam) && pageParam >= 1 ? Math.floor(pageParam) : 1;
  const requestedLimit =
    Number.isFinite(limitParam) && limitParam >= 1 ? Math.floor(limitParam) : 25;
  const limit = Math.min(requestedLimit, 50);
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('submissions')
    .select('*', { count: 'exact' })
    .order('last_activity_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (ticketStatus) {
    query = query.eq('ticket_status', ticketStatus);
  }

  if (requestFilter === 'contact') {
    query = query.eq('type', 'contact');
  }

  if (requestFilter === 'project') {
    query = query.or(
      [
        'type.eq.project',
        'type.eq.support',
        'category.eq.PROJECT',
        'category.eq.project',
        'intent.eq.client',
        'intent.eq.project',
      ].join(',')
    );
  }

  if (requestFilter === 'community') {
    query = query.or(
      [
        'type.eq.community',
        'type.eq.companionship',
        'type.eq.support',
        'category.eq.HELP',
        'category.eq.CHECKIN',
        'category.eq.community',
        'category.eq.help',
        'category.eq.checkin',
        'intent.eq.community',
        'intent.eq.companionship',
        'intent.eq.tech-help',
        'intent.eq.digital-companionship',
        'intent.eq.help-with-tech',
      ].join(',')
    );
  }

  if (search) {
    const escaped = search.replace(/[\\%_,]/g, '\\$&');
    query = query.or(
      [
        `request_id.ilike.%${escaped}%`,
        `name.ilike.%${escaped}%`,
        `email.ilike.%${escaped}%`,
        `phone.ilike.%${escaped}%`,
        `content.ilike.%${escaped}%`,
        `preview.ilike.%${escaped}%`,
        `type.ilike.%${escaped}%`,
        `category.ilike.%${escaped}%`,
        `intent.ilike.%${escaped}%`,
        `source.ilike.%${escaped}%`,
        `created_by_email.ilike.%${escaped}%`,
      ].join(',')
    );
  }

  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error('ADMIN_SUBMISSIONS_QUERY_ERROR', error);
    return Response.json({ error: 'Failed to fetch submissions' }, { status: 500 });
  }

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return Response.json({
    submissions: data ?? [],
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  });
}

export async function POST(request: Request) {
  const user = await getAdminUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const validated = validateManualSubmissionBody(body);
  if (!validated.ok) return validated.response;

  const ticket = validated.value;
  const { type, intent, category } =
    ADMIN_SUBMISSION_REQUEST_MAPPING[ticket.request_type];
  const now = new Date().toISOString();
  const requestId = createRequestId();
  const preview = ticket.preview;
  const payload = ticket.payload;
  const metadata =
    ticket.request_type === 'contact' ? {} : getSupportMetadata(payload);
  const contact = extractContact(payload);

  const { data, error } = await supabase
    .from('submissions')
    .insert({
      request_id: requestId,
      type,
      intent,
      category,
      name: ticket.name,
      email: ticket.email || null,
      phone: ticket.phone || null,
      contact_method: contact.contactMethod,
      content: ticket.content,
      preview,
      metadata,
      payload,
      fingerprint: null,
      ip_address: null,
      user_agent: 'admin_manual',
      email_status: ticket.send_confirmation_email ? 'pending' : 'not_required',
      ticket_status: 'open',
      source: 'admin_manual',
      created_by: user.id,
      created_by_email: user.email ?? null,
      due_at: ticket.due_at,
      last_activity_at: now,
    })
    .select()
    .single();

  if (error || !data) {
    console.error('ADMIN_SUBMISSION_CREATE_ERROR', error);
    return Response.json({ error: 'Failed to create submission' }, { status: 500 });
  }

  if (ticket.send_confirmation_email) {
    try {
      const ownerEmail = buildOwnerEmail({
        requestId,
        ticket,
        metadata,
        timestamp: now,
      });
      await sendAndAssert(ownerEmail);
      await sendAndAssert(
        formatUserConfirmationEmail({
          requestId,
          email: ticket.email,
          name: ticket.name,
          type: ticket.request_type === 'contact' ? 'contact' : 'support',
          preview,
        })
      );

      const { data: updated, error: updateError } = await supabase
        .from('submissions')
        .update({ email_status: 'sent', last_activity_at: new Date().toISOString() })
        .eq('id', data.id)
        .select()
        .single();

      if (updateError || !updated) {
        console.error('ADMIN_SUBMISSION_EMAIL_STATUS_UPDATE_ERROR', updateError);
        return Response.json(
          { error: 'Ticket created, but email status could not be updated' },
          { status: 500 }
        );
      }

      return Response.json({ submission: updated }, { status: 201 });
    } catch (error) {
      console.error('ADMIN_SUBMISSION_EMAIL_SEND_ERROR', error);
      const { data: failed } = await supabase
        .from('submissions')
        .update({ email_status: 'failed', last_activity_at: new Date().toISOString() })
        .eq('id', data.id)
        .select()
        .single();

      return Response.json(
        {
          error: 'Ticket created, but email sending failed',
          submission: failed ?? data,
        },
        { status: 500 }
      );
    }
  }

  return Response.json({ submission: data }, { status: 201 });
}
