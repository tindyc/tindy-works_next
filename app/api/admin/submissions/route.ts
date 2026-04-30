import { supabase } from '@/lib/supabase';
import { getAdminUser } from '@/lib/admin-auth';

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
