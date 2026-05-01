import { redirect } from 'next/navigation';
import { getAdminUser } from '@/lib/admin-auth';
import { ManualSubmissionTicketForm } from '@/features/admin/submissions/ManualSubmissionTicketForm';

export default async function NewWorkTicketPage() {
  const user = await getAdminUser();
  if (!user) redirect('/login');

  return <ManualSubmissionTicketForm />;
}
