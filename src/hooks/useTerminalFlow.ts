import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { isValidEmail, isValidPhone } from '@/utils/contactValidation';

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
};

function resolveValidationRule<TContext>(
  rule: TerminalValidationRule<TContext>,
  args: ValidationContext<TContext>,
): string | null {
  if (rule === 'required') {
    return terminalValidators.required(args);
  }
  if (rule === 'email') {
    return terminalValidators.email(args);
  }
  if (rule === 'phone') {
    return terminalValidators.phone(args);
  }
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

export function useTerminalFlow<TContext = Record<string, unknown>>({
  flow,
  context,
  onComplete,
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
  const prevResetKeyRef = useRef<string | number | undefined>(resetKey);
  const resetTimeoutRef = useRef<number | null>(null);
  const pendingResetRef = useRef(false);
  const mountedRef = useRef(false);
  const flowRef = useRef(flow);
  const contextRef = useRef(context);
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

  const resetConversation = useCallback(() => {
    setData({});
    setInputState('');
    setIsSubmitting(false);
    setIsSubmitted(false);
    pendingResetRef.current = false;

    const initialData: TerminalFormData = {};
    const firstStep = getNextStep(flowRef.current, initialData, contextRef.current);
    const nextHistory: TerminalHistoryEntry[] = [
      ...introMessagesRef.current.map((message) => createEntry(message, 'system')),
      ...(firstStep
        ? [createEntry(firstStep.question, 'system')]
        : [createEntry('No terminal flow steps are available.', 'error')]),
    ];

    setHistory(nextHistory);
  }, [createEntry]);

  useEffect(() => {
    mountedRef.current = true;
    const timeout = window.setTimeout(() => resetConversation(), 0);

    return () => {
      mountedRef.current = false;
      window.clearTimeout(timeout);
      if (resetTimeoutRef.current !== null) {
        window.clearTimeout(resetTimeoutRef.current);
      }
    };
  }, [resetConversation]);

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
      if (isSubmitting) {
        return;
      }

      const typedValue = rawInput.trim();

      if (!currentStep && awaitingConfirmation) {
        appendEntries([{ text: `> ${typedValue || '(empty)'}`, type: 'input' }]);
        const normalized = typedValue.toLowerCase();

        if (confirmYesValues.includes(normalized)) {
          appendEntries([{ text: 'Submitting request...', type: 'system' }]);
          setIsSubmitting(true);
          try {
            await onComplete(data);
            setIsSubmitted(true);
            appendEntries([{ text: 'Submission complete.', type: 'success' }]);
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to submit right now.';
            appendEntries([{ text: message, type: 'error' }]);
          } finally {
            setIsSubmitting(false);
          }
          setInputState('');
          return;
        }

        if (confirmNoValues.includes(normalized)) {
          appendEntries([
            { text: 'Submission cancelled. Restarting flow...', type: 'system' },
          ]);
          resetConversation();
          return;
        }

        appendEntries([
          { text: 'Please answer with yes or no.', type: 'error' },
          { text: confirmationQuestion, type: 'system' },
        ]);
        setInputState('');
        return;
      }

      if (!currentStep) {
        appendEntries([{ text: 'No active terminal step.', type: 'error' }]);
        setInputState('');
        return;
      }

      appendEntries([{ text: `> ${typedValue || '(empty)'}`, type: 'input' }]);

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
        appendEntries([
          { text: validationError, type: 'error' },
          { text: currentStep.question, type: 'system' },
        ]);
        setInputState('');
        return;
      }

      const updatedData = {
        ...data,
        [currentStep.field]: normalizedValue,
      };
      setData(updatedData);

      const nextStep = getNextStep(flow, updatedData, context);
      if (nextStep) {
        appendEntries([{ text: nextStep.question, type: 'system' }]);
        setInputState('');
        return;
      }

      const summaryLines = summaryBuilder
        ? summaryBuilder(updatedData, context)
        : buildDefaultSummary(updatedData);

      appendEntries([
        { text: 'Review your responses:', type: 'system' },
        ...summaryLines.map((line) => ({ text: line, type: 'system' as const })),
        { text: confirmationQuestion, type: 'system' },
      ]);
      setInputState('');
    },
    [
      appendEntries,
      awaitingConfirmation,
      confirmNoValues,
      confirmYesValues,
      confirmationQuestion,
      context,
      currentStep,
      data,
      isSubmitting,
      onComplete,
      resetConversation,
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
    data,
  };
}
