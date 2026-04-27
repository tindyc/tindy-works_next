import React from 'react';

type SystemStatusProps = {
  label: string;
  value: React.ReactNode;
  divider?: boolean;
};

export function SystemStatus({ label, value, divider = true }: SystemStatusProps) {
  return (
    <div
      className={
        divider
          ? 'flex justify-between items-center border-b border-[var(--border-subtle)] pb-2 flex-wrap gap-2'
          : 'flex justify-between items-center flex-wrap gap-2'
      }
    >
      <span className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)]">{label}</span>
      <span className="text-xs text-[var(--text-primary)] text-right">{value}</span>
    </div>
  );
}