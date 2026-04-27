export function inputClassName(hasError: boolean) {
  return `min-h-[56px] w-full border bg-[var(--bg-base)] px-4 py-4 text-base text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[var(--text-primary)] ${
    hasError ? 'border-[var(--status-danger)]' : 'border-[var(--border-strong)]'
  }`;
}
