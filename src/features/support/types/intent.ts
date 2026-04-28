export const INTENT_CONFIG = {
  client: {
    label: 'Project request',
    category: 'PROJECT',
    logType: 'project',
    href: '/support?intent=client',
    heading: 'Tell me what you need',
    intro: 'Share the goal, the issue, or the workflow. If you are not sure, choose the closest options.',
    supportNavActive: 'client',
    showWhoSection: false,
    showHelpType: false,
    showFrequency: false,
    showProjectDetails: true,
    useCommunitySizing: false,
    requiresProjectMetadata: true,
    requiresCompanionshipMetadata: false,
  },
  community: {
    label: 'Simple tech help',
    category: 'HELP',
    logType: 'community',
    href: '/support?intent=community',
    heading: 'Request support',
    intro: 'This form is short. You can request help for yourself or someone else.',
    supportNavActive: 'community',
    showWhoSection: true,
    showHelpType: true,
    showFrequency: false,
    showProjectDetails: false,
    useCommunitySizing: true,
    requiresProjectMetadata: false,
    requiresCompanionshipMetadata: false,
  },
  companionship: {
    label: 'Regular check-ins',
    category: 'CHECKIN',
    logType: 'companionship',
    href: '/support?intent=companionship',
    heading: 'Request support',
    intro: 'No video calls. These check-ins are by email, SMS, WhatsApp, or another simple message option.',
    supportNavActive: 'community',
    showWhoSection: true,
    showHelpType: false,
    showFrequency: true,
    showProjectDetails: false,
    useCommunitySizing: true,
    requiresProjectMetadata: false,
    requiresCompanionshipMetadata: true,
  },
} as const;

export type Intent = keyof typeof INTENT_CONFIG;

export const CLIENT_INTENT: Intent = 'client';
export const COMMUNITY_INTENT: Intent = 'community';
export const COMPANIONSHIP_INTENT: Intent = 'companionship';

export const INTENTS = Object.keys(INTENT_CONFIG) as Intent[];

export const DEFAULT_INTENT: Intent = CLIENT_INTENT;

const intentSet: ReadonlySet<Intent> = new Set(INTENTS);

export function isIntent(value: unknown): value is Intent {
  return typeof value === 'string' && intentSet.has(value as Intent);
}

export function getIntentConfig(intent: Intent) {
  return INTENT_CONFIG[intent];
}
