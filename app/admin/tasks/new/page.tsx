import { redirect } from 'next/navigation';

export default function OldNewAdminTaskPage() {
  // Legacy redirect: /admin/tasks/new -> /admin/personal/new.
  redirect('/admin/personal/new');
}
