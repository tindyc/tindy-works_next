import { redirect } from 'next/navigation';

export default function OldAdminTasksPage() {
  // Legacy redirect: /admin/tasks -> /admin/personal.
  redirect('/admin/personal');
}
