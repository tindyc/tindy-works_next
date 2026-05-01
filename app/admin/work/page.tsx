import { redirect } from 'next/navigation';
import { getAdminUser } from '@/lib/admin-auth';
import { supabase } from '@/lib/supabase';
import { AdminDashboard } from '@/features/admin/AdminDashboard';

export default async function AdminWorkPage() {
  const user = await getAdminUser();
  if (!user) redirect('/login');

  const pageSize = 25;
  const { data: submissions, count } = await supabase
    .from('submissions')
    .select('*', { count: 'exact' })
    .eq('ticket_status', 'open')
    .order('last_activity_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .range(0, pageSize - 1);

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <AdminDashboard
      initialSubmissions={submissions ?? []}
      initialPagination={{
        page: 1,
        limit: pageSize,
        total,
        totalPages,
        hasNextPage: 1 < totalPages,
        hasPreviousPage: false,
      }}
    />
  );
}
