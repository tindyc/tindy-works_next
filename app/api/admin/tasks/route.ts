import { getAdminUser } from '@/lib/admin-auth';
import {
  VALID_PERSONAL_TICKET_CATEGORIES,
  VALID_PERSONAL_TICKET_PRIORITIES,
  isPersonalTicketCategory,
  isPersonalTicketPriority,
  isPersonalTicketStatus,
  normalizeOptionalDate,
} from '@/lib/personal-ticket-validation';
import { supabase } from '@/lib/supabase';

function parsePage(value: string | null) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 1 ? Math.floor(parsed) : 1;
}

function parseLimit(value: string | null) {
  const parsed = Number(value);
  const requested = Number.isFinite(parsed) && parsed >= 1 ? Math.floor(parsed) : 25;
  return Math.min(requested, 50);
}

function escapeSearch(value: string) {
  return value.replace(/[\\%_,]/g, '\\$&');
}

export async function GET(request: Request) {
  const user = await getAdminUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const rawStatus = searchParams.get('status') ?? 'open';
  const rawCategory = searchParams.get('category');
  const rawPriority = searchParams.get('priority');
  const search = searchParams.get('q')?.trim();
  const page = parsePage(searchParams.get('page'));
  const limit = parseLimit(searchParams.get('limit'));
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  if (!isPersonalTicketStatus(rawStatus)) {
    return Response.json({ error: 'Invalid status' }, { status: 400 });
  }

  if (rawCategory && !isPersonalTicketCategory(rawCategory)) {
    return Response.json(
      { error: 'Invalid category', allowed: VALID_PERSONAL_TICKET_CATEGORIES },
      { status: 400 }
    );
  }

  if (rawPriority && !isPersonalTicketPriority(rawPriority)) {
    return Response.json(
      { error: 'Invalid priority', allowed: VALID_PERSONAL_TICKET_PRIORITIES },
      { status: 400 }
    );
  }

  let query = supabase
    .from('personal_tickets')
    .select('*', { count: 'exact' })
    .eq('status', rawStatus)
    .order('last_activity_at', { ascending: false, nullsFirst: false })
    .order('due_at', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (rawCategory) query = query.eq('category', rawCategory);
  if (rawPriority) query = query.eq('priority', rawPriority);

  if (search) {
    const escaped = escapeSearch(search);
    query = query.or(`title.ilike.%${escaped}%,description.ilike.%${escaped}%`);
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    console.error('ADMIN_PERSONAL_TICKETS_QUERY_ERROR', error);
    return Response.json({ error: 'Failed to fetch personal tickets' }, { status: 500 });
  }

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return Response.json({
    tickets: data ?? [],
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
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const title = typeof b.title === 'string' ? b.title.trim() : '';

  if (title.length < 1 || title.length > 160) {
    return Response.json(
      { error: 'title must be between 1 and 160 characters' },
      { status: 400 }
    );
  }

  if (
    b.description !== undefined &&
    b.description !== null &&
    typeof b.description !== 'string'
  ) {
    return Response.json(
      { error: 'description must be a string or null' },
      { status: 400 }
    );
  }

  const description =
    typeof b.description === 'string' && b.description.trim() !== ''
      ? b.description
      : null;

  if (description && description.length > 10000) {
    return Response.json(
      { error: 'description must be 10000 characters or fewer' },
      { status: 400 }
    );
  }

  const category = b.category ?? 'general';
  if (!isPersonalTicketCategory(category)) {
    return Response.json(
      { error: 'Invalid category', allowed: VALID_PERSONAL_TICKET_CATEGORIES },
      { status: 400 }
    );
  }

  const priority = b.priority ?? 'normal';
  if (!isPersonalTicketPriority(priority)) {
    return Response.json(
      { error: 'Invalid priority', allowed: VALID_PERSONAL_TICKET_PRIORITIES },
      { status: 400 }
    );
  }

  let dueAt: string | null;
  try {
    dueAt = normalizeOptionalDate(b.due_at);
  } catch {
    return Response.json({ error: 'Invalid date value' }, { status: 400 });
  }

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('personal_tickets')
    .insert({
      title,
      description,
      category,
      priority,
      status: 'open',
      due_at: dueAt,
      created_by: user.id,
      created_by_email: user.email ?? null,
      last_activity_at: now,
    })
    .select()
    .single();

  if (error || !data) {
    console.error('ADMIN_PERSONAL_TICKET_CREATE_ERROR', error);
    return Response.json({ error: 'Failed to create personal ticket' }, { status: 500 });
  }

  return Response.json({ ticket: data }, { status: 201 });
}
