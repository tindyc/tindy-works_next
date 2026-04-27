"use client";

import React, { useCallback, useEffect, useRef } from 'react';
import {
  type TerminalFlowStep,
  type TerminalFormData,
  useTerminalFlow,
} from '../hooks/useTerminalFlow';

type TerminalFormProps<TContext = Record<string, unknown>> = {
  flow: Array<TerminalFlowStep<TContext>>;
  onComplete: (data: TerminalFormData) => void | Promise<void>;
  context?: TContext;
  className?: string;
  introMessages?: string[];
  confirmationQuestion?: string;
  summaryBuilder?: (data: TerminalFormData, context?: TContext) => string[];
  resetKey?: string | number;
  honeypotFieldName?: string;
};

export function TerminalForm<TContext = Record<string, unknown>>({
  flow,
  onComplete,
  context,
  className,
  introMessages,
  confirmationQuestion,
  summaryBuilder,
  resetKey,
  honeypotFieldName = 'company',
}: TerminalFormProps<TContext>) {
  const inputRef = useRef<HTMLInputElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);

  const { history, input, setInput, submitInput, isSubmitting, isSubmitted } = useTerminalFlow({
    flow,
    onComplete: (data) =>
      onComplete({
        ...data,
        [honeypotFieldName]: honeypotRef.current?.value?.trim() ?? '',
      }),
    context,
    introMessages,
    confirmationQuestion,
    summaryBuilder,
    resetKey,
  });

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    focusInput();
  }, [focusInput]);

  useEffect(() => {
    if (!historyRef.current) {
      return;
    }

    historyRef.current.scrollTop = historyRef.current.scrollHeight;
  }, [history]);

  return (
    <section
      className={`w-full border border-[var(--border-subtle)] bg-[var(--bg-base)]/95 shadow-[0_20px_60px_var(--shadow-base)] ${className ?? ''}`}
      onClick={focusInput}
      aria-label="Terminal form"
    >
      <div className="border-b border-[var(--border-subtle)] px-3 sm:px-4 py-3 flex items-center justify-between gap-3">
        <p className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.15em] text-[var(--text-secondary)]">
          FORM TERMINAL
        </p>
        <p className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.12em] text-[var(--text-muted)]">
          {isSubmitted ? 'submitted' : isSubmitting ? 'submitting' : 'active'}
        </p>
      </div>

      <div
        ref={historyRef}
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        className="h-[230px] sm:h-[270px] md:h-[320px] overflow-y-auto px-3 sm:px-4 py-3 sm:py-4 bg-[var(--hover-bg)]/35"
      >
        <div className="space-y-2 font-mono text-[11px] sm:text-xs tracking-[0.06em]">
          {history.map((entry) => (
            <p
              key={entry.id}
              className={
                entry.type === 'error'
                  ? 'text-[var(--status-danger)]'
                  : entry.type === 'input'
                    ? 'text-[var(--text-primary)]'
                    : entry.type === 'success'
                      ? 'text-[var(--status-success)]'
                      : 'text-[var(--text-secondary)]'
              }
            >
              {entry.text}
            </p>
          ))}
        </div>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void submitInput(input);
        }}
        className="border-t border-[var(--border-subtle)] px-3 sm:px-4 py-3 sm:py-4"
      >
        <input
          ref={honeypotRef}
          name={honeypotFieldName}
          type="text"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="absolute -left-[9999px] top-auto w-px h-px overflow-hidden"
          defaultValue=""
        />

        <label htmlFor="terminal-form-input" className="sr-only">
          Terminal form input
        </label>
        <input
          id="terminal-form-input"
          ref={inputRef}
          autoFocus
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              void submitInput(input);
            }
          }}
          onBlur={() => {
            window.requestAnimationFrame(focusInput);
          }}
          className="absolute opacity-0 pointer-events-none"
          autoComplete="off"
          spellCheck={false}
          aria-describedby="terminal-form-help"
        />

        <button type="submit" className="sr-only" tabIndex={-1} aria-hidden="true">
          Submit terminal response
        </button>

        <div className="font-mono text-[11px] sm:text-xs uppercase tracking-[0.14em] text-[var(--text-primary)] min-h-6 flex items-center gap-2">
          <span className="text-[var(--text-secondary)]">&gt;</span>
          <span className="break-all">{input || (isSubmitted ? 'done' : 'type response...')}</span>
          {!isSubmitted && <span aria-hidden="true" className="terminal-caret" />}
        </div>

        <p id="terminal-form-help" className="mt-2 font-mono text-[10px] sm:text-xs text-[var(--text-muted)]">
          Press Enter to continue. Keep typing to edit your response before submission.
        </p>
      </form>
    </section>
  );
}
