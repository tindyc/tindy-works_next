"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type HistoryEntry = {
  id: number;
  text: string;
  type: 'input' | 'output' | 'error';
};

const ROUTES = {
  home: '/',
  office: '/office',
  garden: '/garden',
  reception: '/reception',
  contact: '/contact',
  cats: '/cats',
} as const;

const COMMAND_KEYS = Object.keys(ROUTES) as Array<keyof typeof ROUTES>;

export function NotFound() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<HistoryEntry[]>([
    { id: 1, text: 'ERROR 404: Requested route was not found.', type: 'error' },
    { id: 2, text: `Available: ${COMMAND_KEYS.join(', ')}`, type: 'output' },
    { id: 3, text: 'Hint: Type a command or tap one below.', type: 'output' },
  ]);
  const [isLeaving, setIsLeaving] = useState(false);

  const routeMap = useMemo(() => ROUTES, []);

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  const navigateWithTransition = useCallback(
    (path: string) => {
      if (isLeaving) {
        return;
      }

      setIsLeaving(true);
      window.setTimeout(() => {
        navigate(path);
      }, 180);
    },
    [isLeaving, navigate],
  );

  const findSuggestion = useCallback((rawInput: string) => {
    const normalized = rawInput.trim().toLowerCase();

    if (!normalized) {
      return null;
    }

    const startsWithMatch = COMMAND_KEYS.find((key) => key.startsWith(normalized));
    if (startsWithMatch) {
      return startsWithMatch;
    }

    const containsMatch = COMMAND_KEYS.find((key) => key.includes(normalized));
    return containsMatch ?? null;
  }, []);

  const runCommand = useCallback(
    (rawInput: string) => {
      const normalized = rawInput.trim().toLowerCase();

      if (!normalized) {
        setHistory((prev) => [
          ...prev,
          { id: Date.now(), text: '> (empty)', type: 'input' },
          { id: Date.now() + 1, text: `Available: ${COMMAND_KEYS.join(', ')}`, type: 'output' },
        ]);
        return;
      }

      setHistory((prev) => [...prev, { id: Date.now(), text: `> ${normalized}`, type: 'input' }]);

      if (normalized in routeMap) {
        navigateWithTransition(routeMap[normalized as keyof typeof routeMap]);
        return;
      }

      const suggestion = findSuggestion(normalized);
      setHistory((prev) => [
        ...prev,
        { id: Date.now() + 1, text: `Command not found: ${normalized}`, type: 'error' },
        {
          id: Date.now() + 2,
          text: suggestion ? `Did you mean: ${suggestion}?` : `Available: ${COMMAND_KEYS.join(', ')}`,
          type: 'output',
        },
      ]);
    },
    [findSuggestion, navigateWithTransition, routeMap],
  );

  useEffect(() => {
    focusInput();
  }, [focusInput]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        navigateWithTransition('/');
        return;
      }

      if (
        event.key.toLowerCase() === 'h' &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey
      ) {
        navigateWithTransition('/');
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [navigateWithTransition]);

  useEffect(() => {
    let timeoutId = window.setTimeout(() => {
      navigateWithTransition('/');
    }, 15000);

    const resetInactivityTimer = () => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        navigateWithTransition('/');
      }, 15000);
    };

    const events: Array<keyof WindowEventMap> = ['keydown', 'mousemove', 'mousedown', 'touchstart'];
    events.forEach((eventName) => {
      window.addEventListener(eventName, resetInactivityTimer, { passive: true });
    });

    return () => {
      window.clearTimeout(timeoutId);
      events.forEach((eventName) => {
        window.removeEventListener(eventName, resetInactivityTimer);
      });
    };
  }, [navigateWithTransition]);

  return (
    <main
      className={`flex-1 mt-[64px] md:mt-[88px] px-4 sm:px-6 md:px-10 py-6 sm:py-8 md:py-12 floor-plan-grid transition-opacity duration-200 ${
        isLeaving ? 'opacity-0' : 'opacity-100 terminal-fade-in'
      }`}
      onClick={focusInput}
    >
      <section className="relative mx-auto w-full max-w-5xl min-h-[calc(100vh-120px)] md:min-h-[calc(100vh-148px)] border border-[var(--border-strong)] bg-[var(--bg-base)]/90 backdrop-blur-sm overflow-hidden shadow-[0_20px_60px_var(--shadow-base)]">
        <div className="absolute inset-0 pointer-events-none">
          <p className="absolute right-3 sm:right-8 top-2 sm:top-4 text-[6rem] sm:text-[9rem] md:text-[13rem] leading-none font-bold tracking-[-0.06em] text-[var(--text-primary)]/8 select-none">
            404
          </p>
        </div>

        <header className="relative z-10 border-b border-[var(--border-subtle)] px-4 sm:px-6 md:px-8 py-4 sm:py-5 flex items-center justify-between gap-4">
          <h1 className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">
            TINDY_WORKS // NAVIGATION TERMINAL
          </h1>
          <span className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">
            STATUS: ACTIVE
          </span>
        </header>

        <div className="relative z-10 p-4 sm:p-6 md:p-8 flex flex-col gap-6 sm:gap-8">
          <div className="font-mono text-[11px] sm:text-xs uppercase tracking-[0.14em] text-[var(--text-secondary)] space-y-2">
            <p>&gt; route lookup failed</p>
            <p>&gt; recovery commands available below</p>
            <p className="text-[var(--text-muted)]">&gt; shortcut: ESC or H returns home</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 sm:gap-3">
            {COMMAND_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => navigateWithTransition(routeMap[key])}
                className="min-h-11 sm:min-h-12 px-3 sm:px-4 border border-[var(--border-strong)] bg-[var(--bg-base)] text-[var(--text-primary)] font-mono text-[11px] sm:text-xs uppercase tracking-[0.16em] text-left sm:text-center hover:bg-[var(--text-primary)] hover:text-[var(--bg-base)] hover:shadow-[0_0_24px_rgba(255,255,255,0.22)] active:scale-[0.99] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--text-primary)]"
              >
                {key}
              </button>
            ))}
          </div>

          <div className="border border-[var(--border-subtle)] bg-[var(--hover-bg)]/40 p-3 sm:p-4 h-[180px] sm:h-[220px] overflow-y-auto">
            <div className="space-y-2 font-mono text-[11px] sm:text-xs tracking-[0.06em]">
              {history.map((entry) => (
                <p
                  key={entry.id}
                  className={
                    entry.type === 'error'
                      ? 'text-red-400'
                      : entry.type === 'input'
                        ? 'text-[var(--text-primary)]'
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
              runCommand(input);
              setInput('');
            }}
            className="border border-[var(--border-strong)] bg-[var(--bg-base)] px-3 sm:px-4 py-3 sm:py-4"
          >
            <label htmlFor="terminal-input" className="sr-only">
              Terminal command input
            </label>
            <input
              id="terminal-input"
              ref={inputRef}
              autoFocus
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onBlur={() => {
                window.requestAnimationFrame(focusInput);
              }}
              className="absolute opacity-0 pointer-events-none"
              autoComplete="off"
              spellCheck={false}
            />
            <div className="font-mono text-[11px] sm:text-xs uppercase tracking-[0.14em] text-[var(--text-primary)] flex items-center gap-2">
              <span className="text-[var(--text-secondary)]">&gt;</span>
              <span className="break-all">{input || 'type command...'}</span>
              <span aria-hidden="true" className="terminal-caret" />
            </div>
          </form>

          <p className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.12em] text-[var(--text-muted)]">
            No dead ends here. Tap a command, type one, or wait for auto-return to home.
          </p>
        </div>
      </section>
    </main>
  );
}
