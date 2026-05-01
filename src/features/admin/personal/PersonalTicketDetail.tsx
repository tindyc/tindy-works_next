'use client';

import { ArrowLeft, CheckCircle, Clock, RotateCcw, Save, TimerReset } from 'lucide-react';
import type { PersonalTicketRecord } from '@/lib/personal-ticket-types';
import {
  VALID_PERSONAL_TICKET_PRIORITIES,
  type PersonalTicketPriority,
  type PersonalTicketStatus,
} from '@/lib/personal-ticket-validation';
import { formatTicketCategory, formatTicketPriority } from './PersonalTicketFilters';

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="mb-0.5 text-[0.7rem] uppercase tracking-[0.06em] text-[var(--text-muted)]">
        {label}
      </dt>
      <dd className="break-words text-sm text-[var(--text-primary)]">{value}</dd>
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  disabled,
  strong,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
  strong?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`ui-button min-h-10 px-3 text-sm ${strong ? 'ui-button-strong' : ''}`}
    >
      {children}
    </button>
  );
}

export function PersonalTicketDetail({
  ticket,
  notes,
  notesChanged,
  actionLoading,
  actionMessage,
  onBack,
  onNotesChange,
  onSaveNotes,
  onStatusChange,
  onPriorityChange,
}: {
  ticket: PersonalTicketRecord | null;
  notes: string;
  notesChanged: boolean;
  actionLoading: boolean;
  actionMessage: { text: string; type: 'success' | 'error' } | null;
  onBack: () => void;
  onNotesChange: (value: string) => void;
  onSaveNotes: () => void;
  onStatusChange: (status: PersonalTicketStatus) => void;
  onPriorityChange: (priority: PersonalTicketPriority) => void;
}) {
  if (!ticket) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-[var(--text-muted)]">
        Select a task
      </div>
    );
  }

  const dueDate = ticket.due_at ? new Date(ticket.due_at).toLocaleString() : 'None';

  return (
    <div className="p-5 md:p-6">
      <div className="mb-5 flex items-center gap-3 md:hidden">
        <button onClick={onBack} className="ui-button min-h-9 px-3 py-1.5 text-sm">
          <ArrowLeft size={16} />
          Back
        </button>
        <span className="text-[0.7rem] font-mono text-[var(--text-muted)]">
          {ticket.id.slice(0, 8)}
        </span>
      </div>

      <div className="max-w-3xl">
        <div className="mb-6">
          <div className="hidden text-[0.7rem] font-mono text-[var(--text-muted)] md:block">
            {ticket.id}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-[var(--status-success)] px-2 py-0.5 text-[0.65rem] uppercase tracking-[0.04em] text-[var(--status-success)]">
              {ticket.status}
            </span>
            <span className="rounded-full border border-[var(--border-subtle)] px-2 py-0.5 text-[0.65rem] uppercase tracking-[0.04em] text-[var(--text-secondary)]">
              {formatTicketPriority(ticket.priority)}
            </span>
            <span className="rounded-full border border-[var(--border-subtle)] px-2 py-0.5 text-[0.65rem] uppercase tracking-[0.04em] text-[var(--text-secondary)]">
              {formatTicketCategory(ticket.category)}
            </span>
          </div>
          <h1 className="mt-3 text-xl font-semibold text-[var(--text-primary)]">
            {ticket.title}
          </h1>
        </div>

        <dl className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Priority" value={formatTicketPriority(ticket.priority)} />
          <Field label="Category" value={formatTicketCategory(ticket.category)} />
          <Field label="Due" value={dueDate} />
          <Field label="Created" value={new Date(ticket.created_at).toLocaleString()} />
          <Field label="Created By" value={ticket.created_by_email ?? 'Unknown'} />
          <Field
            label="Updated"
            value={new Date(ticket.updated_at ?? ticket.created_at).toLocaleString()}
          />
        </dl>

        <section className="mb-6">
          <h2 className="mb-2 text-[0.65rem] uppercase tracking-[0.1em] text-[var(--text-muted)]">
            Description
          </h2>
          <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--ui-surface)] p-4 text-sm leading-6 text-[var(--text-primary)]">
            <div className="whitespace-pre-wrap break-words">
              {ticket.description || 'No description'}
            </div>
          </div>
        </section>

        <section className="mb-6">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-[0.65rem] uppercase tracking-[0.1em] text-[var(--text-muted)]">
              Internal Notes
            </h2>
            {notesChanged && (
              <button
                onClick={onSaveNotes}
                disabled={actionLoading}
                className="ui-button min-h-8 px-2 py-1 text-xs"
              >
                <Save size={14} />
                Save
              </button>
            )}
          </div>
          <textarea
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            rows={5}
            placeholder="Add internal notes..."
            className="w-full rounded-md border border-[var(--border-subtle)] bg-[var(--ui-surface)] p-3 text-sm text-[var(--text-primary)] outline-none"
          />
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-[0.65rem] uppercase tracking-[0.1em] text-[var(--text-muted)]">
            Priority
          </h2>
          <select
            value={ticket.priority}
            disabled={actionLoading}
            onChange={(e) => onPriorityChange(e.target.value as PersonalTicketPriority)}
            className="min-h-10 rounded-md border border-[var(--border-subtle)] bg-[var(--ui-surface)] px-3 text-sm text-[var(--text-primary)] outline-none"
          >
            {VALID_PERSONAL_TICKET_PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {formatTicketPriority(priority)}
              </option>
            ))}
          </select>
        </section>

        <div className="flex flex-wrap items-center gap-2">
          {ticket.status !== 'in-progress' && (
            <ActionButton
              onClick={() => onStatusChange('in-progress')}
              disabled={actionLoading}
            >
              <TimerReset size={16} />
              Mark In Progress
            </ActionButton>
          )}

          {ticket.status !== 'waiting' && (
            <ActionButton onClick={() => onStatusChange('waiting')} disabled={actionLoading}>
              <Clock size={16} />
              Mark Waiting
            </ActionButton>
          )}

          {ticket.status === 'resolved' ? (
            <ActionButton onClick={() => onStatusChange('open')} disabled={actionLoading}>
              <RotateCcw size={16} />
              Reopen
            </ActionButton>
          ) : (
            <ActionButton
              onClick={() => onStatusChange('resolved')}
              disabled={actionLoading}
              strong
            >
              <CheckCircle size={16} />
              Resolve
            </ActionButton>
          )}

          {actionMessage && (
            <span
              className="text-sm"
              style={{
                color:
                  actionMessage.type === 'error'
                    ? 'var(--status-danger)'
                    : 'var(--status-success)',
              }}
            >
              {actionMessage.text}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
