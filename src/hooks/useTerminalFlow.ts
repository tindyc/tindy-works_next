import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { isValidEmail, isValidPhone, validateRequiredEmail, validateRequiredPhone } from '@/utils/contactValidation';

export type TerminalFormData = Record<string, string>;

type ValidationContext<TContext> = {
  value: string;
  data: TerminalFormData;
  context?: TContext;
};

export type TerminalCustomValidation<TContext = Record<string, unknown>> = (
  args: ValidationContext<TContext>,
) => string | null;

export type TerminalValidationRule<TContext = Record<string, unknown>> =
  | 'required'
  | 'email'
  | 'phone'
  | 'emailRequired'
  | 'phoneRequired'
  | TerminalCustomValidation<TContext>;

export type TerminalHistoryEntry = {
  id: number;
  text: string;
  type: 'system' | 'input' | 'error' | 'success';
};

export type TerminalFlowStep<TContext = Record<string, unknown>> = {
  id: string;
  question: string;
  field: string;
  validation?: TerminalValidationRule<TContext> | Array<TerminalValidationRule<TContext>>;
  condition?: (data: TerminalFormData, context?: TContext) => boolean;
  normalize?: (value: string, data: TerminalFormData, context?: TContext) => string;
};

type UseTerminalFlowOptions<TContext> = {
  flow: Array<TerminalFlowStep<TContext>>;
  context?: TContext;
  onComplete: (data: TerminalFormData) => void | Promise<void>;
  onExit?: () => void;
  bootMessages?: string[];
  introMessages?: string[];
  confirmationQuestion?: string;
  confirmYesValues?: string[];
  confirmNoValues?: string[];
  summaryBuilder?: (data: TerminalFormData, context?: TContext) => string[];
  resetKey?: string | number;
};

export const terminalValidators = {
  required: ({ value }: ValidationContext<unknown>) =>
    value.trim() ? null : 'This field is required.',
  email: ({ value }: ValidationContext<unknown>) =>
    !value.trim() || isValidEmail(value) ? null : 'Please enter a valid email address.',
  phone: ({ value }: ValidationContext<unknown>) =>
    !value.trim() || isValidPhone(value) ? null : 'Please enter a valid phone number.',
  emailRequired: ({ value }: ValidationContext<unknown>) => validateRequiredEmail(value),
  phoneRequired: ({ value }: ValidationContext<unknown>) => validateRequiredPhone(value),
};

function resolveValidationRule<TContext>(
  rule: TerminalValidationRule<TContext>,
  args: ValidationContext<TContext>,
): string | null {
  if (rule === 'required') return terminalValidators.required(args);
  if (rule === 'email') return terminalValidators.email(args);
  if (rule === 'phone') return terminalValidators.phone(args);
  if (rule === 'emailRequired') return terminalValidators.emailRequired(args);
  if (rule === 'phoneRequired') return terminalValidators.phoneRequired(args);
  return rule(args);
}

function runValidations<TContext>(
  value: string,
  data: TerminalFormData,
  context: TContext | undefined,
  rules?: TerminalValidationRule<TContext> | Array<TerminalValidationRule<TContext>>,
): string | null {
  if (!rules) {
    return null;
  }

  const normalizedRules = Array.isArray(rules) ? rules : [rules];
  for (const rule of normalizedRules) {
    const result = resolveValidationRule(rule, { value, data, context });
    if (result) {
      return result;
    }
  }

  return null;
}

function buildDefaultSummary(data: TerminalFormData) {
  const lines = Object.entries(data)
    .filter(([, value]) => value.trim().length > 0)
    .map(([key, value]) => `${key}: ${value}`);

  if (lines.length === 0) {
    return ['No values were provided.'];
  }

  return lines;
}

function getNextStep<TContext>(
  flow: Array<TerminalFlowStep<TContext>>,
  data: TerminalFormData,
  context: TContext | undefined,
) {
  const eligibleFlow = flow.filter((step) => (step.condition ? step.condition(data, context) : true));
  return eligibleFlow.find((step) => data[step.field] === undefined);
}

const EXIT_COMMANDS = ['q', 'quit', 'exit'];

export function useTerminalFlow<TContext = Record<string, unknown>>({
  flow,
  context,
  onComplete,
  onExit,
  bootMessages = [],
  introMessages = [],
  confirmationQuestion = 'Confirm submission? (yes/no)',
  confirmYesValues = ['yes', 'y'],
  confirmNoValues = ['no', 'n'],
  summaryBuilder,
  resetKey,
}: UseTerminalFlowOptions<TContext>) {
  const entryIdRef = useRef(0);
  const [history, setHistory] = useState<TerminalHistoryEntry[]>([]);
  const [input, setInputState] = useState('');
  const [data, setData] = useState<TerminalFormData>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isBooting, setIsBooting] = useState(true);
  const [isSystemRendering, setIsSystemRendering] = useState(false);
  const prevResetKeyRef = useRef<string | number | undefined>(resetKey);
  const resetTimeoutRef = useRef<number | null>(null);
  const messageTimeoutsRef = useRef<number[]>([]);
  const sequenceRef = useRef(0);
  const pendingResetRef = useRef(false);
  const mountedRef = useRef(false);
  const flowRef = useRef(flow);
  const contextRef = useRef(context);
  const bootMessagesRef = useRef(bootMessages);
  const introMessagesRef = useRef(introMessages);
  const inputValueRef = useRef(input);
  const isSubmittingRef = useRef(isSubmitting);

  const createEntry = useCallback((text: string, type: TerminalHistoryEntry['type']) => {
    entryIdRef.current += 1;
    return {
      id: entryIdRef.current,
      text,
      type,
    };
  }, []);

  useEffect(() => {
    flowRef.current = flow;
  }, [flow]);

  useEffect(() => {
    contextRef.current = context;
  }, [context]);

  useEffect(() => {
    bootMessagesRef.current = bootMessages;
  }, [bootMessages]);

  useEffect(() => {
    introMessagesRef.current = introMessages;
  }, [introMessages]);

  useEffect(() => {
    inputValueRef.current = input;
  }, [input]);

  useEffect(() => {
    isSubmittingRef.current = isSubmitting;
  }, [isSubmitting]);

  const currentStep = useMemo(() => getNextStep(flow, data, context), [flow, data, context]);
  const awaitingConfirmation = !currentStep && flow.length > 0 && !isSubmitted;

  const appendEntries = useCallback(
    (entries: Array<{ text: string; type: TerminalHistoryEntry['type'] }>) => {
      setHistory((prev) => [...prev, ...entries.map((entry) => createEntry(entry.text, entry.type))]);
    },
    [createEntry],
  );

  const clearMessageTimeouts = useCallback(() => {
    for (const timeout of messageTimeoutsRef.current) {
      window.clearTimeout(timeout);
    }
    messageTimeoutsRef.current = [];
  }, []);

  const waitForMessageDelay = useCallback((delay: number) => {
    return new Promise<void>((resolve) => {
      const timeout = window.setTimeout(() => {
        messageTimeoutsRef.current = messageTimeoutsRef.current.filter((item) => item !== timeout);
        resolve();
      }, delay);

      messageTimeoutsRef.current.push(timeout);
    });
  }, []);

  const appendEntriesWithTiming = useCallback(
    async (
      entries: Array<{ text: string; type: TerminalHistoryEntry['type'] }>,
      options: { initialDelay?: number; lineDelay?: number } = {},
    ) => {
      if (entries.length === 0) {
        return;
      }

      const sequenceId = sequenceRef.current;
      setIsSystemRendering(true);

      try {
        if (options.initialDelay) {
          await waitForMessageDelay(options.initialDelay);
        }

        for (const [index, entry] of entries.entries()) {
          if (!mountedRef.current || sequenceId !== sequenceRef.current) {
            return;
          }

          appendEntries([entry]);

          if (index < entries.length - 1) {
            await waitForMessageDelay(options.lineDelay ?? 140);
          }
        }
      } finally {
        if (mountedRef.current && sequenceId === sequenceRef.current) {
          setIsSystemRendering(false);
        }
      }
    },
    [appendEntries, waitForMessageDelay],
  );

  const resetConversation = useCallback(() => {
    sequenceRef.current += 1;
    clearMessageTimeouts();
    setData({});
    setInputState('');
    setIsSubmitting(false);
    setIsSubmitted(false);
    setIsExiting(false);
    setIsBooting(true);
    setIsSystemRendering(true);
    pendingResetRef.current = false;
    const bootEntries = bootMessagesRef.current.map((message) => createEntry(message, 'system'));
    setHistory(bootEntries);

    const initialData: TerminalFormData = {};
    const firstStep = getNextStep(flowRef.current, initialData, contextRef.current);
    const nextEntries = [
      ...introMessagesRef.current.map((message) => ({ text: message, type: 'system' as const })),
      ...(firstStep
        ? [{ text: firstStep.question, type: 'system' as const }]
        : [{ text: 'No terminal flow steps are available.', type: 'error' as const }]),
    ];

    const sequenceId = sequenceRef.current;
    void (async () => {
      await appendEntriesWithTiming(nextEntries, { initialDelay: 100, lineDelay: 140 });

      if (mountedRef.current && sequenceId === sequenceRef.current) {
        setIsBooting(false);
      }
    })();
  }, [appendEntriesWithTiming, clearMessageTimeouts, createEntry]);

  useEffect(() => {
    mountedRef.current = true;
    const timeout = window.setTimeout(() => resetConversation(), 0);

    return () => {
      mountedRef.current = false;
      sequenceRef.current += 1;
      window.clearTimeout(timeout);
      clearMessageTimeouts();
      if (resetTimeoutRef.current !== null) {
        window.clearTimeout(resetTimeoutRef.current);
      }
    };
  }, [clearMessageTimeouts, resetConversation]);

  useEffect(() => {
    const previousResetKey = prevResetKeyRef.current;
    if (Object.is(previousResetKey, resetKey)) {
      return;
    }

    prevResetKeyRef.current = resetKey;

    if (!mountedRef.current) {
      return;
    }

    if (isSubmittingRef.current || inputValueRef.current.trim().length > 0) {
      pendingResetRef.current = true;
      return;
    }

    if (resetTimeoutRef.current !== null) {
      window.clearTimeout(resetTimeoutRef.current);
    }

    resetTimeoutRef.current = window.setTimeout(() => {
      if (!isSubmittingRef.current && inputValueRef.current.trim().length === 0) {
        resetConversation();
      } else {
        pendingResetRef.current = true;
      }
    }, 120);

    return () => {
      if (resetTimeoutRef.current !== null) {
        window.clearTimeout(resetTimeoutRef.current);
      }
    };
  }, [resetConversation, resetKey]);

  useEffect(() => {
    if (!pendingResetRef.current) {
      return;
    }

    if (isSubmitting || input.trim().length > 0) {
      return;
    }

    const timeout = window.setTimeout(() => resetConversation(), 0);
    return () => window.clearTimeout(timeout);
  }, [input, isSubmitting, resetConversation]);

  const setInput = useCallback((value: string) => {
    setInputState(value);
  }, []);

  const submitInput = useCallback(
    async (rawInput: string) => {
      if (isSubmitting || isSystemRendering || isExiting) {
        return;
      }

      const typedValue = rawInput.trim();
      const normalizedCommand = typedValue.toLowerCase();

      if (EXIT_COMMANDS.includes(normalizedCommand)) {
        appendEntries([{ text: `> ${typedValue}`, type: 'input' }]);
        setInputState('');
        setIsExiting(true);

        await appendEntriesWithTiming([
          { text: 'Session terminated.', type: 'system' },
          { text: 'Closing channel...', type: 'system' },
        ], { initialDelay: 100, lineDelay: 140 });

        await waitForMessageDelay(260);
        onExit?.();
        return;
      }

      if (!currentStep && awaitingConfirmation) {
        appendEntries([{ text: `> ${typedValue || '(empty)'}`, type: 'input' }]);
        setInputState('');
        const normalized = typedValue.toLowerCase();

        if (confirmYesValues.includes(normalized)) {
          await appendEntriesWithTiming([{ text: 'Submitting request...', type: 'system' }], {
            initialDelay: 100,
          });
          setIsSubmitting(true);
          try {
            await onComplete(data);
            setIsSubmitted(true);
            await appendEntriesWithTiming([{ text: 'Submission complete.', type: 'success' }], {
              initialDelay: 120,
            });
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to submit right now.';
            await appendEntriesWithTiming([{ text: message, type: 'error' }], {
              initialDelay: 120,
            });
          } finally {
            setIsSubmitting(false);
          }
          return;
        }

        if (confirmNoValues.includes(normalized)) {
          await appendEntriesWithTiming([
            { text: 'Submission cancelled. Restarting flow...', type: 'system' },
          ], { initialDelay: 100 });
          resetConversation();
          return;
        }

        await appendEntriesWithTiming([
          { text: 'Please answer with yes or no.', type: 'error' },
          { text: confirmationQuestion, type: 'system' },
        ], { initialDelay: 100 });
        return;
      }

      if (!currentStep) {
        await appendEntriesWithTiming([{ text: 'No active terminal step.', type: 'error' }], {
          initialDelay: 100,
        });
        return;
      }

      appendEntries([{ text: `> ${typedValue || '(empty)'}`, type: 'input' }]);
      setInputState('');

      const normalizedValue = currentStep.normalize
        ? currentStep.normalize(typedValue, data, context)
        : typedValue;

      const validationError = runValidations(
        normalizedValue,
        data,
        context,
        currentStep.validation,
      );

      if (validationError) {
        await appendEntriesWithTiming([
          { text: validationError, type: 'error' },
          { text: currentStep.question, type: 'system' },
        ], { initialDelay: 100 });
        return;
      }

      const updatedData = {
        ...data,
        [currentStep.field]: normalizedValue,
      };
      setData(updatedData);

      const nextStep = getNextStep(flow, updatedData, context);
      if (nextStep) {
        await appendEntriesWithTiming([{ text: nextStep.question, type: 'system' }], {
          initialDelay: 120,
        });
        return;
      }

      const summaryLines = summaryBuilder
        ? summaryBuilder(updatedData, context)
        : buildDefaultSummary(updatedData);

      await appendEntriesWithTiming([
        { text: 'Review your responses:', type: 'system' },
        ...summaryLines.map((line) => ({ text: line, type: 'system' as const })),
        { text: confirmationQuestion, type: 'system' },
      ], { initialDelay: 120 });
    },
    [
      appendEntries,
      appendEntriesWithTiming,
      awaitingConfirmation,
      confirmNoValues,
      confirmYesValues,
      confirmationQuestion,
      context,
      currentStep,
      data,
      isExiting,
      isSubmitting,
      isSystemRendering,
      onComplete,
      onExit,
      resetConversation,
      waitForMessageDelay,
      flow,
      summaryBuilder,
    ],
  );

  return {
    history,
    input,
    setInput,
    submitInput,
    currentStep,
    awaitingConfirmation,
    isSubmitting,
    isSubmitted,
    isExiting,
    isBooting,
    isSystemRendering,
    data,
  };
}
