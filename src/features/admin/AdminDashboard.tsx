'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import type { SubmissionRecord } from '@/lib/submission-emails';

const QUEUES = [
  { label: 'Open', value: 'open' },
  { label: 'In Progress', value: 'in-progress' },
  { label: 'Waiting', value: 'waiting' },
  { label: 'Resolved', value: 'resolved' },
] as const;

type QueueValue = (typeof QUEUES)[number]['value'];
const PAGE_SIZE = 25;

const REQUEST_FILTERS = [
  { label: 'All requests', value: 'all' },
  { label: 'General contact', value: 'contact' },
  { label: 'Project enquiries', value: 'project' },
  { label: 'Community support', value: 'community' },
] as const;

type PaginationState = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

type RequestFilter = (typeof REQUEST_FILTERS)[number]['value'];

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function StatusBadge({ status }: { status: string }) {
  const color =
    status === 'resolved'
      ? 'var(--status-success)'
      : status === 'failed'
      ? 'var(--status-danger)'
      : 'var(--text-secondary)';
  return (
    <span
      style={{
        fontSize: '0.65rem',
        padding: '0.125rem 0.5rem',
        borderRadius: '9999px',
        border: `1px solid ${color}`,
        color,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
      }}
    >
      {status}
    </span>
  );
}

type ActionMsg = { text: string; type: 'success' | 'error' };

function QueueButton({
  label,
  active,
  compact,
  onClick,
}: {
  label: string;
  active: boolean;
  compact?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: compact ? '0.375rem 0.75rem' : '0.5rem 0.625rem',
        borderRadius: '0.375rem',
        background: active ? 'var(--hover-bg)' : 'transparent',
        color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
        border: active ? '1px solid var(--border-strong)' : '1px solid transparent',
        cursor: 'pointer',
        fontSize: '0.875rem',
        whiteSpace: 'nowrap',
        display: 'block',
        width: compact ? undefined : '100%',
        textAlign: compact ? undefined : 'left',
      }}
    >
      {label}
    </button>
  );
}

export function AdminDashboard({
  initialSubmissions,
  initialPagination,
}: {
  initialSubmissions: SubmissionRecord[];
  initialPagination: PaginationState;
}) {
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>(initialSubmissions);
  const [selected, setSelected] = useState<SubmissionRecord | null>(null);
  const [queue, setQueue] = useState<QueueValue>('open');
  const [page, setPage] = useState(initialPagination.page);
  const [pagination, setPagination] = useState<PaginationState>(initialPagination);
  const [search, setSearch] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [requestFilter, setRequestFilter] = useState<RequestFilter>('all');
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState<ActionMsg | null>(null);
  const [notes, setNotes] = useState('');
  const [notesChanged, setNotesChanged] = useState(false);

  // Plain async function — called only from event handlers, never from an effect.
  // Initial data comes from the initialSubmissions prop (server-seeded).
  async function fetchQueue(
    status: QueueValue,
    nextPage = 1,
    options?: {
      q?: string;
      request?: RequestFilter;
    }
  ) {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        status,
        page: String(nextPage),
        limit: String(PAGE_SIZE),
      });
      const q = options?.q ?? activeSearch;
      const request = options?.request ?? requestFilter;

      if (q.trim()) params.set('q', q.trim());
      if (request !== 'all') params.set('request', request);

      const res = await fetch(`/api/admin/submissions?${params}`);
      const data = await res.json();

      if (!res.ok) {
        setActionMsg({
          text: data.error ?? 'Failed to load tickets.',
          type: 'error',
        });
        return;
      }

      setSubmissions(data.submissions ?? []);
      setPagination(data.pagination);
      setPage(nextPage);
    } finally {
      setLoading(false);
    }
  }

  function changeQueue(next: QueueValue) {
    setSelected(null);
    setView('list');
    setQueue(next);
    fetchQueue(next, 1);
  }

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    const q = search.trim();
    setActiveSearch(q);
    setSelected(null);
    setView('list');
    fetchQueue(queue, 1, { q });
  }

  function clearSearch() {
    setSearch('');
    setActiveSearch('');
    setSelected(null);
    setView('list');
    fetchQueue(queue, 1, { q: '' });
  }

  function changeRequestFilter(next: RequestFilter) {
    setRequestFilter(next);
    setSelected(null);
    setView('list');
    fetchQueue(queue, 1, { request: next });
  }

  function changePage(nextPage: number) {
    setSelected(null);
    setView('list');
    fetchQueue(queue, nextPage);
  }

  async function handleSelect(s: SubmissionRecord) {
    const res = await fetch(`/api/admin/submissions/${s.id}`);
    const data = await res.json();
    const record: SubmissionRecord = data.submission;
    setSelected(record);
    setNotes(record?.internal_notes ?? '');
    setNotesChanged(false);
    setActionMsg(null);
    setView('detail'); // mobile: switch to detail panel
  }

  async function patchSelected(body: Record<string, unknown>) {
    if (!selected) return { ok: false, data: null };
    const res = await fetch(`/api/admin/submissions/${selected.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (res.ok) {
      setSelected(data.submission);
      fetchQueue(queue, page);
    }
    return { ok: res.ok, data };
  }

  async function updateTicketStatus(ticket_status: SubmissionRecord['ticket_status']) {
    setActionLoading(true);
    setActionMsg(null);
    try {
      const { ok, data } = await patchSelected({ ticket_status });
      setActionMsg(
        ok
          ? { text: 'Status updated.', type: 'success' }
          : { text: (data as Record<string, string>)?.error ?? 'Update failed.', type: 'error' }
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function saveNotes() {
    setActionLoading(true);
    try {
      const { ok, data } = await patchSelected({ internal_notes: notes });
      if (ok) {
        setNotesChanged(false);
        setActionMsg({ text: 'Notes saved.', type: 'success' });
      } else {
        setActionMsg({ text: (data as Record<string, string>)?.error ?? 'Save failed.', type: 'error' });
      }
    } finally {
      setActionLoading(false);
    }
  }

  async function retryEmail() {
    if (!selected) return;
    setActionLoading(true);
    setActionMsg(null);
    const snapshot = selected; // stable ref across awaits
    try {
      const res = await fetch('/api/admin/retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: snapshot.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionMsg({ text: 'Email sent.', type: 'success' });
        await handleSelect(snapshot); // refreshes record, keeps detail view open
        fetchQueue(queue, page);
      } else {
        setActionMsg({ text: `Failed: ${data.error ?? 'unknown error'}`, type: 'error' });
      }
    } finally {
      setActionLoading(false);
    }
  }

  const border = '1px solid var(--border-subtle)';
  const surface = 'var(--ui-surface)';
  const requester = selected?.email ?? selected?.phone ?? '—';
  const controlStyle = {
    background: surface,
    color: 'var(--text-primary)',
    border,
    borderRadius: '0.375rem',
    padding: '0.5rem 0.625rem',
    fontSize: '0.8rem',
    outline: 'none',
  };
  const activeFilterSummary = [
    activeSearch ? `Search: "${activeSearch}"` : null,
    requestFilter !== 'all' ? `Request: ${requestFilter}` : null,
  ]
    .filter(Boolean)
    .join(' • ');

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">

      {/* ── Mobile / tablet: horizontal queue tab bar (hidden lg+) ────────── */}
      <div
        className="flex lg:hidden overflow-x-auto gap-1 px-3 py-2 shrink-0"
        style={{ borderBottom: border }}
      >
        {QUEUES.map((q) => (
          <QueueButton
            key={q.value}
            label={q.label}
            active={queue === q.value}
            compact
            onClick={() => changeQueue(q.value)}
          />
        ))}
      </div>

      {/* ── 3-col content area ───────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* Sidebar — desktop only */}
        <aside
          className="hidden lg:flex flex-col shrink-0 w-[180px] overflow-y-auto gap-1 px-3 py-5"
          style={{ borderRight: border }}
        >
          <p
            style={{
              fontSize: '0.65rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              padding: '0 0.5rem',
              marginBottom: '0.5rem',
            }}
          >
            Queues
          </p>
          {QUEUES.map((q) => (
            <QueueButton
              key={q.value}
              label={q.label}
              active={queue === q.value}
              onClick={() => changeQueue(q.value)}
            />
          ))}
        </aside>

        {/* ── Ticket list ─────────────────────────────────────────────────── */}
        {/*
          Mobile:  full-width; hidden when view='detail'
          Tablet:  320px, always visible alongside detail
          Desktop: 320px, always visible alongside sidebar + detail
        */}
        <div
          className={[
            'flex flex-col shrink-0 overflow-hidden',
            'w-full md:w-[320px]',
            view === 'detail' ? 'hidden md:flex' : 'flex',
          ].join(' ')}
          style={{ borderRight: border }}
        >
          <div
            className="shrink-0"
            style={{
              padding: '1rem',
              borderBottom: border,
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
            }}
          >
            {QUEUES.find((q) => q.value === queue)?.label} — {pagination.total}
            {activeFilterSummary && (
              <div style={{ marginTop: '0.25rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {activeFilterSummary}
              </div>
            )}
          </div>

          <div className="shrink-0 space-y-2 p-3" style={{ borderBottom: border }}>
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tickets…"
                className="min-w-0 flex-1"
                style={controlStyle}
              />
              <button
                type="submit"
                disabled={loading}
                style={{
                  ...controlStyle,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                }}
              >
                Search
              </button>
              {activeSearch && (
                <button
                  type="button"
                  onClick={clearSearch}
                  disabled={loading}
                  style={{
                    ...controlStyle,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.6 : 1,
                  }}
                >
                  Clear
                </button>
              )}
            </form>

            <div className="flex gap-2">
              <select
                value={requestFilter}
                onChange={(e) => changeRequestFilter(e.target.value as RequestFilter)}
                disabled={loading}
                className="min-w-0 flex-1"
                style={{
                  ...controlStyle,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {REQUEST_FILTERS.map((filter) => (
                  <option key={filter.value} value={filter.value}>
                    {filter.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto">
            {loading ? (
              <div
                className="p-8 text-center"
                style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}
              >
                Loading…
              </div>
            ) : submissions.length === 0 ? (
              <div
                className="p-8 text-center"
                style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}
              >
                No tickets
              </div>
            ) : (
              submissions.map((s) => (
                <div
                  key={s.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleSelect(s)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSelect(s)}
                  className="admin-row cursor-pointer shrink-0"
                  style={{
                    padding: '1rem',
                    borderBottom: border,
                    background: selected?.id === s.id ? surface : undefined,
                    transition: 'background 0.1s',
                  }}
                >
                  <div className="flex justify-between mb-1">
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontFamily: 'var(--font-geist-mono, monospace)',
                        color: 'var(--text-muted)',
                      }}
                    >
                      #{s.request_id}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {relativeTime(s.created_at)}
                    </span>
                  </div>

                  <h3
                    className="mb-1 truncate"
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: 'var(--text-primary)',
                    }}
                  >
                    {s.preview ?? s.content.slice(0, 60)}
                  </h3>

                  <p
                    className="truncate mb-2"
                    style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}
                  >
                    {s.name ? `From ${s.name}` : s.email ?? 'Anonymous'}
                  </p>

                  <div className="flex gap-1.5 flex-wrap">
                    <StatusBadge status={s.ticket_status} />
                    <span style={{ opacity: 0.75 }}>
                      <StatusBadge status={s.email_status} />
                    </span>
                    <span
                      style={{
                        fontSize: '0.65rem',
                        padding: '0.125rem 0.5rem',
                        borderRadius: '9999px',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-muted)',
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                      }}
                    >
                      {s.type}
                    </span>
                    {s.intent && (
                      <span
                        style={{
                          fontSize: '0.65rem',
                          padding: '0.125rem 0.5rem',
                          borderRadius: '9999px',
                          border: '1px solid var(--border-subtle)',
                          color: 'var(--text-muted)',
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase',
                        }}
                      >
                        {s.intent}
                      </span>
                    )}
                    {s.category && (
                      <span
                        style={{
                          fontSize: '0.65rem',
                          padding: '0.125rem 0.5rem',
                          borderRadius: '9999px',
                          border: '1px solid var(--border-subtle)',
                          color: 'var(--text-muted)',
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase',
                        }}
                      >
                        {s.category}
                      </span>
                    )}
                    {s.contact_method && (
                      <span
                        style={{
                          fontSize: '0.65rem',
                          padding: '0.125rem 0.5rem',
                          borderRadius: '9999px',
                          border: '1px solid var(--border-subtle)',
                          color: 'var(--text-muted)',
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase',
                        }}
                      >
                        {s.contact_method}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div
            className="shrink-0 flex items-center justify-between gap-2 px-3 py-2"
            style={{
              borderTop: border,
              background: 'var(--bg-base)',
              color: 'var(--text-secondary)',
              fontSize: '0.75rem',
            }}
          >
            <button
              disabled={!pagination.hasPreviousPage || loading}
              onClick={() => changePage(page - 1)}
              style={{
                padding: '0.375rem 0.625rem',
                border,
                borderRadius: '0.375rem',
                background: 'transparent',
                color: 'var(--text-primary)',
                cursor: !pagination.hasPreviousPage || loading ? 'not-allowed' : 'pointer',
                opacity: !pagination.hasPreviousPage || loading ? 0.5 : 1,
                fontSize: '0.75rem',
              }}
            >
              Previous
            </button>
            <span style={{ whiteSpace: 'nowrap' }}>
              Page {pagination.page} of {Math.max(1, pagination.totalPages)}
            </span>
            <button
              disabled={!pagination.hasNextPage || loading}
              onClick={() => changePage(page + 1)}
              style={{
                padding: '0.375rem 0.625rem',
                border,
                borderRadius: '0.375rem',
                background: 'transparent',
                color: 'var(--text-primary)',
                cursor: !pagination.hasNextPage || loading ? 'not-allowed' : 'pointer',
                opacity: !pagination.hasNextPage || loading ? 0.5 : 1,
                fontSize: '0.75rem',
              }}
            >
              Next
            </button>
          </div>
        </div>

        {/* ── Ticket detail ────────────────────────────────────────────────── */}
        {/*
          Mobile:  full-width; hidden when view='list'
          Tablet+: flex-1, always visible
        */}
        <div
          className={[
            'flex flex-col flex-1 min-w-0 overflow-y-auto',
            view === 'list' ? 'hidden md:flex' : 'flex',
          ].join(' ')}
        >
          {!selected ? (
            <div
              className="flex flex-1 items-center justify-center"
              style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}
            >
              Select a ticket
            </div>
          ) : (
            <div className="p-6">
              {/* Mobile back button */}
              <div className="flex items-center gap-3 mb-5 md:hidden">
                <button
                  onClick={() => setView('list')}
                  style={{
                    padding: '0.375rem 0.75rem',
                    fontSize: '0.875rem',
                    border,
                    borderRadius: '0.375rem',
                    background: 'transparent',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                  }}
                >
                  ← Back
                </button>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontFamily: 'var(--font-geist-mono, monospace)',
                    color: 'var(--text-muted)',
                  }}
                >
                  #{selected.request_id}
                </span>
              </div>

              <div style={{ maxWidth: '640px' }}>
                {/* Header */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <span
                    className="hidden md:inline"
                    style={{
                      fontSize: '0.7rem',
                      fontFamily: 'var(--font-geist-mono, monospace)',
                      color: 'var(--text-muted)',
                    }}
                  >
                    #{selected.request_id}
                  </span>
                  <h2
                    style={{
                      fontSize: '1.125rem',
                      fontWeight: 600,
                      marginTop: '0.25rem',
                      marginBottom: '1rem',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {selected.preview ?? selected.content.slice(0, 80)}
                  </h2>

                  <dl
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '0.75rem',
                      fontSize: '0.875rem',
                    }}
                  >
                    {(
                      [
                        ['Requester', requester],
                        ['Ticket Status', selected.ticket_status],
                        ['Email Status', selected.email_status],
                        ['Type', selected.type],
                        ['Created', new Date(selected.created_at).toLocaleString()],
                      ] as [string, string][]
                    ).map(([label, value]) => (
                      <div key={label}>
                        <dt
                          style={{
                            fontSize: '0.7rem',
                            color: 'var(--text-muted)',
                            marginBottom: '0.125rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                          }}
                        >
                          {label}
                        </dt>
                        <dd style={{ color: 'var(--text-primary)' }}>{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>

                {/* Message */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3
                    style={{
                      fontSize: '0.65rem',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: 'var(--text-muted)',
                      marginBottom: '0.5rem',
                    }}
                  >
                    Message
                  </h3>
                  <div
                    style={{
                      background: surface,
                      border,
                      borderRadius: '0.5rem',
                      padding: '1rem',
                      fontSize: '0.875rem',
                      lineHeight: 1.6,
                      whiteSpace: 'pre-wrap',
                      overflowWrap: 'break-word',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {selected.content}
                  </div>
                </div>

                {/* Metadata */}
                {selected.metadata && Object.keys(selected.metadata).length > 0 && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h3
                      style={{
                        fontSize: '0.65rem',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: 'var(--text-muted)',
                        marginBottom: '0.5rem',
                      }}
                    >
                      Details
                    </h3>
                    <dl
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '0.5rem',
                        fontSize: '0.875rem',
                      }}
                    >
                      {Object.entries(selected.metadata).map(([k, v]) => (
                        <div key={k}>
                          <dt
                            style={{
                              fontSize: '0.7rem',
                              color: 'var(--text-muted)',
                              textTransform: 'uppercase',
                              letterSpacing: '0.06em',
                            }}
                          >
                            {k}
                          </dt>
                          <dd style={{ color: 'var(--text-primary)' }}>{v}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                )}

                {/* Internal notes */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3
                    style={{
                      fontSize: '0.65rem',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: 'var(--text-muted)',
                      marginBottom: '0.5rem',
                    }}
                  >
                    Internal Notes
                  </h3>
                  <textarea
                    value={notes}
                    onChange={(e) => {
                      setNotes(e.target.value);
                      setNotesChanged(true);
                    }}
                    rows={4}
                    placeholder="Add internal notes…"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '0.375rem',
                      border,
                      background: surface,
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem',
                      resize: 'vertical',
                      fontFamily: 'inherit',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                  {notesChanged && (
                    <button
                      onClick={saveNotes}
                      disabled={actionLoading}
                      style={{
                        marginTop: '0.5rem',
                        padding: '0.375rem 0.75rem',
                        fontSize: '0.8rem',
                        background: 'var(--text-primary)',
                        color: 'var(--bg-base)',
                        border: 'none',
                        borderRadius: '0.375rem',
                        cursor: actionLoading ? 'not-allowed' : 'pointer',
                        opacity: actionLoading ? 0.6 : 1,
                      }}
                    >
                      Save Notes
                    </button>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2.5 items-center">
                  <button
                    onClick={retryEmail}
                    disabled={actionLoading}
                    style={{
                      padding: '0.5rem 1rem',
                      fontSize: '0.875rem',
                      border,
                      borderRadius: '0.375rem',
                      cursor: actionLoading ? 'not-allowed' : 'pointer',
                      background: 'transparent',
                      color: 'var(--text-primary)',
                      opacity: actionLoading ? 0.6 : 1,
                    }}
                  >
                    Retry Email
                  </button>

                  {selected.ticket_status !== 'in-progress' && (
                    <button
                      onClick={() => updateTicketStatus('in-progress')}
                      disabled={actionLoading}
                      style={{
                        padding: '0.5rem 1rem',
                        fontSize: '0.875rem',
                        border: 'none',
                        borderRadius: '0.375rem',
                        cursor: actionLoading ? 'not-allowed' : 'pointer',
                        background: 'var(--hover-bg)',
                        color: 'var(--text-primary)',
                        opacity: actionLoading ? 0.6 : 1,
                      }}
                    >
                      Mark In Progress
                    </button>
                  )}

                  {selected.ticket_status !== 'waiting' && (
                    <button
                      onClick={() => updateTicketStatus('waiting')}
                      disabled={actionLoading}
                      style={{
                        padding: '0.5rem 1rem',
                        fontSize: '0.875rem',
                        border: 'none',
                        borderRadius: '0.375rem',
                        cursor: actionLoading ? 'not-allowed' : 'pointer',
                        background: 'var(--hover-bg)',
                        color: 'var(--text-primary)',
                        opacity: actionLoading ? 0.6 : 1,
                      }}
                    >
                      Mark Waiting
                    </button>
                  )}

                  <button
                    onClick={() => updateTicketStatus('resolved')}
                    disabled={actionLoading || selected.ticket_status === 'resolved'}
                    style={{
                      padding: '0.5rem 1rem',
                      fontSize: '0.875rem',
                      borderRadius: '0.375rem',
                      cursor:
                        actionLoading || selected.ticket_status === 'resolved'
                          ? 'not-allowed'
                          : 'pointer',
                      background:
                        selected.ticket_status === 'resolved'
                          ? 'transparent'
                          : 'var(--status-success)',
                      color:
                        selected.ticket_status === 'resolved'
                          ? 'var(--status-success)'
                          : '#000',
                      border:
                        selected.ticket_status === 'resolved'
                          ? '1px solid var(--status-success)'
                          : 'none',
                      opacity: actionLoading ? 0.6 : 1,
                    }}
                  >
                    {selected.ticket_status === 'resolved' ? 'Resolved' : 'Resolve Ticket'}
                  </button>

                  {actionMsg && (
                    <span
                      style={{
                        fontSize: '0.8rem',
                        color:
                          actionMsg.type === 'error'
                            ? 'var(--status-danger)'
                            : 'var(--status-success)',
                      }}
                    >
                      {actionMsg.text}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
