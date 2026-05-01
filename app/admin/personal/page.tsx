import { redirect } from 'next/navigation';
import { getAdminUser } from '@/lib/admin-auth';
import type { PersonalTicketRecord } from '@/lib/personal-ticket-types';
import { supabase } from '@/lib/supabase';
import { PersonalTicketsDashboard } from '@/features/admin/personal/PersonalTicketsDashboard';

export default async function AdminPersonalPage() {
  const user = await getAdminUser();
  if (!user) redirect('/login');

  const pageSize = 25;
  const { data: tickets, count } = await supabase
    .from('personal_tickets')
    .select('*', { count: 'exact' })
    .eq('status', 'open')
    .order('last_activity_at', { ascending: false, nullsFirst: false })
    .order('due_at', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false })
    .range(0, pageSize - 1);

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <PersonalTicketsDashboard
      initialTickets={(tickets ?? []) as PersonalTicketRecord[]}
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
