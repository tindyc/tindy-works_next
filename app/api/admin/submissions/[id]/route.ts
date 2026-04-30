import { supabase } from '@/lib/supabase';
import { getAdminUser } from '@/lib/admin-auth';
import {
  VALID_TICKET_STATUSES,
  isNullableString,
  isTicketStatus,
} from '@/lib/admin-validation';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAdminUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }

  return Response.json({ submission: data });
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

  const updates: Record<string, unknown> = {};

  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const b = body as Record<string, unknown>;

  // Only allow explicit admin-editable fields here.
  // Add new fields carefully with validation.
  if ('ticket_status' in b) {
    if (!isTicketStatus(b.ticket_status)) {
      return Response.json(
        {
          error: 'Invalid ticket_status',
          allowed: VALID_TICKET_STATUSES,
        },
        { status: 400 }
      );
    }

    updates.ticket_status = b.ticket_status;
  }

  if ('internal_notes' in b) {
    if (!isNullableString(b.internal_notes)) {
      return Response.json(
        { error: 'internal_notes must be a string or null' },
        { status: 400 }
      );
    }

    updates.internal_notes = b.internal_notes;
  }

  if (Object.keys(updates).length === 0) {
    return Response.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  updates.last_activity_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('submissions')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error || !data) {
    return Response.json({ error: 'Failed to update submission' }, { status: 500 });
  }

  return Response.json({ submission: data });
}
