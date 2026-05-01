import { getAdminUser } from '@/lib/admin-auth';
import {
  VALID_PERSONAL_TICKET_CATEGORIES,
  VALID_PERSONAL_TICKET_PRIORITIES,
  VALID_PERSONAL_TICKET_STATUSES,
  isNullableString,
  isPersonalTicketCategory,
  isPersonalTicketPriority,
  isPersonalTicketStatus,
  normalizeOptionalDate,
} from '@/lib/personal-ticket-validation';
import { supabase } from '@/lib/supabase';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAdminUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const { data, error } = await supabase
    .from('personal_tickets')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }

  return Response.json({ ticket: data });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAdminUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

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
  const blockedFields = [
    'id',
    'created_by',
    'created_by_email',
    'created_at',
    'updated_at',
    'last_activity_at',
  ];

  for (const field of blockedFields) {
    if (field in b) {
      return Response.json({ error: `${field} cannot be updated` }, { status: 400 });
    }
  }

  const updates: Record<string, unknown> = {};

  if ('title' in b) {
    const title = typeof b.title === 'string' ? b.title.trim() : '';
    if (title.length < 1 || title.length > 160) {
      return Response.json(
        { error: 'title must be between 1 and 160 characters' },
        { status: 400 }
      );
    }

    updates.title = title;
  }

  if ('description' in b) {
    if (!isNullableString(b.description)) {
      return Response.json(
        { error: 'description must be a string or null' },
        { status: 400 }
      );
    }

    if (typeof b.description === 'string' && b.description.length > 10000) {
      return Response.json(
        { error: 'description must be 10000 characters or fewer' },
        { status: 400 }
      );
    }

    updates.description = b.description;
  }

  if ('internal_notes' in b) {
    if (!isNullableString(b.internal_notes)) {
      return Response.json(
        { error: 'internal_notes must be a string or null' },
        { status: 400 }
      );
    }

    if (typeof b.internal_notes === 'string' && b.internal_notes.length > 10000) {
      return Response.json(
        { error: 'internal_notes must be 10000 characters or fewer' },
        { status: 400 }
      );
    }

    updates.internal_notes = b.internal_notes;
  }

  if ('category' in b) {
    if (!isPersonalTicketCategory(b.category)) {
      return Response.json(
        { error: 'Invalid category', allowed: VALID_PERSONAL_TICKET_CATEGORIES },
        { status: 400 }
      );
    }

    updates.category = b.category;
  }

  if ('priority' in b) {
    if (!isPersonalTicketPriority(b.priority)) {
      return Response.json(
        { error: 'Invalid priority', allowed: VALID_PERSONAL_TICKET_PRIORITIES },
        { status: 400 }
      );
    }

    updates.priority = b.priority;
  }

  if ('status' in b) {
    if (!isPersonalTicketStatus(b.status)) {
      return Response.json(
        { error: 'Invalid status', allowed: VALID_PERSONAL_TICKET_STATUSES },
        { status: 400 }
      );
    }

    updates.status = b.status;
  }

  if ('due_at' in b) {
    try {
      updates.due_at = normalizeOptionalDate(b.due_at);
    } catch {
      return Response.json({ error: 'Invalid date value' }, { status: 400 });
    }
  }

  if (Object.keys(updates).length === 0) {
    return Response.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  updates.last_activity_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('personal_tickets')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error || !data) {
    console.error('ADMIN_PERSONAL_TICKET_UPDATE_ERROR', error);
    return Response.json({ error: 'Failed to update personal ticket' }, { status: 500 });
  }

  return Response.json({ ticket: data });
}
