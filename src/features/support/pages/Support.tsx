import { SupportForm } from '@/features/support/forms/SupportForm';

interface SupportProps {
  intent?: string;
}

export function Support({ intent }: SupportProps) {
  return <SupportForm initialIntent={intent} />;
}
