"use client";

import React, { useCallback, useEffect, useRef } from 'react';
import {
  type TerminalFlowStep,
  type TerminalFormData,
  useTerminalFlow,
} from '@/hooks/useTerminalFlow';

type TerminalFormProps<TContext = Record<string, unknown>> = {
  flow: Array<TerminalFlowStep<TContext>>;
  onComplete: (data: TerminalFormData) => void | Promise<void>;
  onExit?: () => void;
  context?: TContext;
  className?: string;
  bootMessages?: string[];
  introMessages?: string[];
  confirmationQuestion?: string;
  summaryBuilder?: (data: TerminalFormData, context?: TContext) => string[];
  resetKey?: string | number;
  honeypotFieldName?: string;
};

export function TerminalForm<TContext = Record<string, unknown>>({
  flow,
  onComplete,
  onExit,
  context,
  className,
  bootMessages,
  introMessages,
  confirmationQuestion,
  summaryBuilder,
  resetKey,
  honeypotFieldName = 'company',
}: TerminalFormProps<TContext>) {
  const inputRef = useRef<HTMLInputElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);
  const hasAutoScrolledRef = useRef(false);

  const {
    history,
    input,
    setInput,
    submitInput,
    isSubmitting,
    isSubmitted,
    isExiting,
    isBooting,
    isSystemRendering,
  } = useTerminalFlow({
    flow,
    onComplete: (data) =>
      onComplete({
        ...data,
        [honeypotFieldName]: honeypotRef.current?.value?.trim() ?? '',
      }),
    onExit,
    context,
    bootMessages,
    introMessages,
    confirmationQuestion,
    summaryBuilder,
    resetKey,
  });

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  const isInputLocked = isBooting || isSystemRendering || isSubmitting || isSubmitted || isExiting;

  useEffect(() => {
    if (isInputLocked) {
      return;
    }

    const frame = window.requestAnimationFrame(focusInput);
    return () => window.cancelAnimationFrame(frame);
  }, [focusInput, history.length, isInputLocked]);

  useEffect(() => {
    if (isBooting || !historyRef.current) {
      return;
    }

    const el = historyRef.current;

    if (!hasAutoScrolledRef.current) {
      el.scrollTop = el.scrollHeight;
      hasAutoScrolledRef.current = true;
      return;
    }

    const threshold = 48;
    const isNearBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight < threshold;

    if (isNearBottom) {
      el.scrollTo({
        top: el.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [history, isBooting]);

  return (
    <section
      className={`flex h-full min-h-0 w-full flex-col overflow-hidden cursor-text border border-[var(--border-subtle,rgba(255,255,255,0.08))] bg-[var(--bg-base,#050505)]/95 shadow-[0_20px_60px_var(--shadow-base,rgba(0,0,0,0.8))] [touch-action:manipulation] ${className ?? ''}`}
      onClick={focusInput}
      aria-label="Terminal form"
    >
      <div className="shrink-0 border-b border-[var(--border-subtle,rgba(255,255,255,0.08))] px-3 sm:px-4 py-3 flex items-center justify-between gap-3">
        <p className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.15em] text-[var(--text-secondary,rgba(255,255,255,0.7))]">
          FORM TERMINAL
        </p>
        <p className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.12em] text-[var(--text-muted,rgba(255,255,255,0.4))]">
          {isExiting ? 'closed' : isSubmitted ? 'submitted' : isSubmitting ? 'submitting' : 'active'}
        </p>
      </div>

      <div
        ref={historyRef}
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-4 pt-3 pb-6 sm:pt-4 sm:pb-6 scroll-pb-6 bg-[var(--hover-bg,rgba(255,255,255,0.06))]/35"
      >
        <div className="mx-auto w-full max-w-[720px] font-mono text-[12px] sm:text-xs md:text-sm leading-relaxed tracking-[0.06em]">
          {isBooting ? (
            <div className="flex w-full items-center justify-center py-10 uppercase tracking-[0.14em] text-[var(--text-secondary,rgba(255,255,255,0.7))]">
              <span className="animate-pulse">INITIALIZING...</span>
            </div>
          ) : (
            <div className="w-full space-y-2">
              {history.map((entry) => (
                <p
                  key={entry.id}
                  className={
                    `terminal-line ${
                      entry.type === 'error'
                        ? 'text-[var(--status-danger,#f87171)]'
                        : entry.type === 'input'
                          ? 'text-[var(--text-primary,#ffffff)]'
                          : entry.type === 'success'
                            ? 'text-[var(--status-success,#34d399)]'
                            : 'text-[var(--text-secondary,rgba(255,255,255,0.7))]'
                    }`
                  }
                >
                  {entry.text}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (isInputLocked) {
            return;
          }

          void submitInput(input);
        }}
        className="shrink-0 border-t border-[var(--border-subtle,rgba(255,255,255,0.08))] px-3 sm:px-4 py-3 sm:py-4"
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
          disabled={isInputLocked}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              if (isInputLocked) {
                return;
              }

              void submitInput(input);
            }
          }}
          onBlur={() => {
            if (!isInputLocked) {
              window.requestAnimationFrame(focusInput);
            }
          }}
          className="absolute opacity-0 pointer-events-none"
          autoComplete="off"
          spellCheck={false}
          aria-describedby="terminal-form-help"
        />

        <button type="submit" className="sr-only" tabIndex={-1} aria-hidden="true">
          Submit terminal response
        </button>

        <div className="font-mono text-[12px] sm:text-xs md:text-sm tracking-[0.08em] text-[var(--text-primary,#ffffff)] flex min-h-[44px] items-center gap-2">
          <span className="shrink-0 text-[var(--text-secondary,rgba(255,255,255,0.7))]">user@tindy:~$</span>
          <span className="break-all">
            {input ||
              (isExiting
                ? 'closed'
                : isSubmitted
                  ? 'done'
                  : isBooting || isSystemRendering
                    ? 'system output...'
                    : 'type response...')}
          </span>
          {!isSubmitted && !isBooting && !isSystemRendering && !isExiting && (
            <span
              aria-hidden="true"
              className={`terminal-caret ${input ? 'opacity-100 terminal-caret-active' : 'opacity-60'}`}
            />
          )}
        </div>

        <p id="terminal-form-help" className="mt-2 font-mono text-[11px] sm:text-xs text-[var(--text-muted,rgba(255,255,255,0.4))]">
          Press Enter to continue. Keep typing to edit your response before submission.
        </p>
      </form>
    </section>
  );
}
