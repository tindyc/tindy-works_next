type IntentKey = 'client' | 'community' | 'companionship';

type IntentCategory = 'PROJECT' | 'HELP' | 'CHECKIN';
type IntentLogType = 'project' | 'community' | 'companionship';

export type IntentConfig = {
  ui: {
    label: string;
    heading: string;
    intro: string;
  };
  navigation: {
    href: string;
    supportNavActive: 'client' | 'community';
  };
  behaviour: {
    showWhoSection: boolean;
    showHelpType: boolean;
    showFrequency: boolean;
    showProjectDetails: boolean;
    useCommunitySizing: boolean;
  };
  validation: {
    requiresProjectMetadata: boolean;
    requiresCompanionshipMetadata: boolean;
  };
  backend: {
    category: IntentCategory;
    logType: IntentLogType;
  };
};

export const INTENT_CONFIG = {
  client: {
    ui: {
      label: 'Project request',
      heading: 'Tell me what you need',
      intro: 'Share the goal, the issue, or the workflow. If you are not sure, choose the closest options.',
    },
    navigation: {
      href: '/support?intent=client',
      supportNavActive: 'client',
    },
    behaviour: {
      showWhoSection: false,
      showHelpType: false,
      showFrequency: false,
      showProjectDetails: true,
      useCommunitySizing: false,
    },
    validation: {
      requiresProjectMetadata: true,
      requiresCompanionshipMetadata: false,
    },
    backend: {
      category: 'PROJECT',
      logType: 'project',
    },
  },
  community: {
    ui: {
      label: 'Simple tech help',
      heading: 'Request support',
      intro: 'This form is short. You can request help for yourself or someone else.',
    },
    navigation: {
      href: '/support?intent=community',
      supportNavActive: 'community',
    },
    behaviour: {
      showWhoSection: true,
      showHelpType: true,
      showFrequency: false,
      showProjectDetails: false,
      useCommunitySizing: true,
    },
    validation: {
      requiresProjectMetadata: false,
      requiresCompanionshipMetadata: false,
    },
    backend: {
      category: 'HELP',
      logType: 'community',
    },
  },
  companionship: {
    ui: {
      label: 'Regular check-ins',
      heading: 'Request support',
      intro: 'No video calls. These check-ins are by email, SMS, WhatsApp, or another simple message option.',
    },
    navigation: {
      href: '/support?intent=companionship',
      supportNavActive: 'community',
    },
    behaviour: {
      showWhoSection: true,
      showHelpType: false,
      showFrequency: true,
      showProjectDetails: false,
      useCommunitySizing: true,
    },
    validation: {
      requiresProjectMetadata: false,
      requiresCompanionshipMetadata: true,
    },
    backend: {
      category: 'CHECKIN',
      logType: 'companionship',
    },
  },
} as const satisfies Record<IntentKey, IntentConfig>;

export type Intent = keyof typeof INTENT_CONFIG;

export const DEFAULT_INTENT: Intent = 'client';

export const INTENTS = Object.keys(INTENT_CONFIG) as Intent[];

export function isIntent(value: unknown): value is Intent {
  return typeof value === 'string' && Object.hasOwn(INTENT_CONFIG, value);
}

export function getIntentConfig<TIntent extends Intent>(
  intent: TIntent
): (typeof INTENT_CONFIG)[TIntent] {
  return INTENT_CONFIG[intent];
}

export function getIntentMeta(intent: Intent) {
  const config = getIntentConfig(intent);

  return {
    label: config.ui.label,
    href: config.navigation.href,
    category: config.backend.category,
  };
}
