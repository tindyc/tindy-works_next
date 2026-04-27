import { SupportForm } from '@/features/support/forms/SupportForm';

interface SupportProps {
  searchParams: Promise<{ intent?: string }>;
}

export async function Support({ searchParams }: SupportProps) {
  const { intent } = await searchParams;

  return <SupportForm initialIntent={intent} />;
}
