import { SupportForm } from '@/features/support/forms/SupportForm';

type Intent = 'client' | 'community' | 'companionship';

const validIntents = new Set(['client', 'community', 'companionship']);

function isIntent(value: unknown): value is Intent {
  return typeof value === 'string' && validIntents.has(value);
}

interface SupportProps {
  intent?: string;
}

export function Support({ intent }: SupportProps) {
  const resolvedIntent: Intent = isIntent(intent) ? intent : 'client';

  if (intent && intent !== resolvedIntent && process.env.NODE_ENV === 'development') {
    console.warn('Invalid intent:', intent);
  }

  return <SupportForm key={resolvedIntent} initialIntent={resolvedIntent} />;
}
