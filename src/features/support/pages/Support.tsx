import { SupportForm } from '@/features/support/forms/SupportForm';
import { DEFAULT_INTENT, isIntent, type Intent } from '@/features/support/types/intent';

interface SupportProps {
  intent?: string;
}

export function Support({ intent }: SupportProps) {
  const resolvedIntent: Intent = isIntent(intent) ? intent : DEFAULT_INTENT;

  if (intent && intent !== resolvedIntent && process.env.NODE_ENV === 'development') {
    console.warn('Invalid intent:', intent);
  }

  return <SupportForm key={resolvedIntent} initialIntent={resolvedIntent} />;
}
