import { supabase } from '@/lib/supabase';
import { getAdminUser } from '@/lib/admin-auth';

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
  if (typeof body === 'object' && body !== null) {
    const b = body as Record<string, unknown>;
    if ('ticket_status' in b && typeof b.ticket_status === 'string') {
      updates.ticket_status = b.ticket_status;
    }
    if ('internal_notes' in b && typeof b.internal_notes === 'string') {
      updates.internal_notes = b.internal_notes;
    }
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
