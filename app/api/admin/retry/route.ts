import { supabase } from '@/lib/supabase';
import { getAdminUser } from '@/lib/admin-auth';
import { sendSubmissionEmailsFromRecord } from '@/lib/submission-emails';

export async function POST(request: Request) {
  const user = await getAdminUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const id = (body as Record<string, unknown>)?.id;
  if (typeof id !== 'string') {
    return Response.json({ error: 'id is required' }, { status: 400 });
  }

  const { data: submission, error: fetchError } = await supabase
    .from('submissions')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !submission) {
    return Response.json({ error: 'Submission not found' }, { status: 404 });
  }

  try {
    await sendSubmissionEmailsFromRecord(submission);

    await supabase
      .from('submissions')
      .update({ email_status: 'sent', last_activity_at: new Date().toISOString() })
      .eq('id', id);

    return Response.json({ ok: true });
  } catch (error) {
    await supabase
      .from('submissions')
      .update({ email_status: 'failed', last_activity_at: new Date().toISOString() })
      .eq('id', id);

    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to send email' },
      { status: 500 }
    );
  }
}
