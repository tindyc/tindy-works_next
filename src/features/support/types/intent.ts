export const INTENTS = ['client', 'community', 'companionship'] as const;

export type Intent = (typeof INTENTS)[number];

export const DEFAULT_INTENT: Intent = INTENTS[0];

const intentSet: ReadonlySet<Intent> = new Set(INTENTS);

export function isIntent(value: unknown): value is Intent {
  return typeof value === 'string' && intentSet.has(value as Intent);
}

export function getSupportHref(intent: Intent) {
  return `/support?intent=${intent}`;
}
