import { redirect } from 'next/navigation';
import { getAdminUser } from '@/lib/admin-auth';
import { PersonalTicketForm } from '@/features/admin/personal/PersonalTicketForm';

export default async function NewPersonalTaskPage() {
  const user = await getAdminUser();
  if (!user) redirect('/login');

  return <PersonalTicketForm />;
}
