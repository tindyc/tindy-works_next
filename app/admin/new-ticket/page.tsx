import { redirect } from 'next/navigation';

export default function OldNewTicketPage() {
  // Legacy redirect: /admin/new-ticket -> /admin/work/new.
  redirect('/admin/work/new');
}
