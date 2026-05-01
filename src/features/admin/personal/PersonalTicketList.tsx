'use client';

import { CalendarClock } from 'lucide-react';
import type { PersonalTicketRecord, PersonalTicketsPagination } from '@/lib/personal-ticket-types';
import { formatTicketCategory, formatTicketPriority } from './PersonalTicketFilters';

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.max(0, Math.floor(diff / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function Badge({
  label,
  tone = 'muted',
}: {
  label: string;
  tone?: 'muted' | 'priority' | 'status';
}) {
  const color =
    tone === 'priority'
      ? 'var(--status-danger)'
      : tone === 'status'
        ? 'var(--status-success)'
        : 'var(--text-muted)';

  return (
    <span
      className="rounded-full border px-2 py-0.5 text-[0.65rem] uppercase tracking-[0.04em]"
      style={{ borderColor: color, color }}
    >
      {label}
    </span>
  );
}

export function PersonalTicketList({
  tickets,
  selectedId,
  pagination,
  loading,
  queueLabel,
  activeFilterSummary,
  onSelect,
  onPageChange,
}: {
  tickets: PersonalTicketRecord[];
  selectedId?: string;
  pagination: PersonalTicketsPagination;
  loading: boolean;
  queueLabel: string;
  activeFilterSummary: string;
  onSelect: (ticket: PersonalTicketRecord) => void;
  onPageChange: (page: number) => void;
}) {
  return (
    <>
      <div className="shrink-0 border-b border-[var(--border-subtle)] p-4 text-xs text-[var(--text-secondary)]">
        {queueLabel} - {pagination.total}
        {activeFilterSummary && (
          <div className="mt-1 text-[0.7rem] text-[var(--text-muted)]">
            {activeFilterSummary}
          </div>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center text-sm text-[var(--text-muted)]">Loading...</div>
        ) : tickets.length === 0 ? (
          <div className="p-8 text-center text-sm text-[var(--text-muted)]">No tasks</div>
        ) : (
          tickets.map((ticket) => (
            <button
              key={ticket.id}
              type="button"
              onClick={() => onSelect(ticket)}
              className="admin-row block w-full border-b border-[var(--border-subtle)] p-4 text-left transition-colors"
              style={{
                background:
                  selectedId === ticket.id ? 'var(--ui-surface)' : undefined,
              }}
            >
              <div className="mb-1 flex items-center justify-between gap-3">
                <span className="min-w-0 truncate text-[0.7rem] font-mono text-[var(--text-muted)]">
                  {ticket.id.slice(0, 8)}
                </span>
                <span className="shrink-0 text-[0.7rem] text-[var(--text-muted)]">
                  {relativeTime(ticket.created_at)}
                </span>
              </div>

              <h3 className="mb-1 truncate text-sm font-medium text-[var(--text-primary)]">
                {ticket.title}
              </h3>

              <p className="mb-2 line-clamp-2 text-xs leading-5 text-[var(--text-secondary)]">
                {ticket.description || 'No description'}
              </p>

              <div className="flex flex-wrap gap-1.5">
                <Badge label={ticket.status} tone="status" />
                <Badge
                  label={formatTicketPriority(ticket.priority)}
                  tone={ticket.priority === 'high' || ticket.priority === 'urgent' ? 'priority' : 'muted'}
                />
                <Badge label={formatTicketCategory(ticket.category)} />
                {ticket.due_at && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-[var(--border-subtle)] px-2 py-0.5 text-[0.65rem] uppercase tracking-[0.04em] text-[var(--text-muted)]">
                    <CalendarClock size={12} />
                    {new Date(ticket.due_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            </button>
          ))
        )}
      </div>

      <div className="flex shrink-0 items-center justify-between gap-2 border-t border-[var(--border-subtle)] bg-[var(--bg-base)] px-3 py-2 text-xs text-[var(--text-secondary)]">
        <button
          disabled={!pagination.hasPreviousPage || loading}
          onClick={() => onPageChange(pagination.page - 1)}
          className="ui-button min-h-9 px-3 py-1 text-xs"
        >
          Previous
        </button>
        <span className="whitespace-nowrap">
          Page {pagination.page} of {Math.max(1, pagination.totalPages)}
        </span>
        <button
          disabled={!pagination.hasNextPage || loading}
          onClick={() => onPageChange(pagination.page + 1)}
          className="ui-button min-h-9 px-3 py-1 text-xs"
        >
          Next
        </button>
      </div>
    </>
  );
}
