'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import type { PersonalTicketRecord, PersonalTicketsPagination } from '@/lib/personal-ticket-types';
import {
  VALID_PERSONAL_TICKET_STATUSES,
  type PersonalTicketPriority,
  type PersonalTicketStatus,
} from '@/lib/personal-ticket-validation';
import {
  PersonalTicketFilters,
  type PersonalTicketCategoryFilter,
  type PersonalTicketPriorityFilter,
  formatTicketCategory,
  formatTicketPriority,
} from './PersonalTicketFilters';
import { PersonalTicketList } from './PersonalTicketList';
import { PersonalTicketDetail } from './PersonalTicketDetail';

const PAGE_SIZE = 25;

const QUEUE_LABELS: Record<PersonalTicketStatus, string> = {
  open: 'Open',
  'in-progress': 'In Progress',
  waiting: 'Waiting',
  resolved: 'Resolved',
};

type ActionMessage = { text: string; type: 'success' | 'error' };

function QueueButton({
  status,
  active,
  compact,
  onClick,
}: {
  status: PersonalTicketStatus;
  active: boolean;
  compact?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        'rounded-md border px-3 py-2 text-sm transition-colors',
        compact ? 'whitespace-nowrap' : 'w-full text-left',
        active
          ? 'border-[var(--border-strong)] bg-[var(--hover-bg)] text-[var(--text-primary)]'
          : 'border-transparent text-[var(--text-secondary)] hover:bg-[var(--hover-bg)]',
      ].join(' ')}
    >
      {QUEUE_LABELS[status]}
    </button>
  );
}

export function PersonalTicketsDashboard({
  initialTickets,
  initialPagination,
}: {
  initialTickets: PersonalTicketRecord[];
  initialPagination: PersonalTicketsPagination;
}) {
  const [tickets, setTickets] = useState<PersonalTicketRecord[]>(initialTickets);
  const [selected, setSelected] = useState<PersonalTicketRecord | null>(null);
  const [queue, setQueue] = useState<PersonalTicketStatus>('open');
  const [pagination, setPagination] = useState<PersonalTicketsPagination>(initialPagination);
  const [search, setSearch] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [category, setCategory] = useState<PersonalTicketCategoryFilter>('all');
  const [priority, setPriority] = useState<PersonalTicketPriorityFilter>('all');
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<ActionMessage | null>(null);
  const [notes, setNotes] = useState('');
  const [notesChanged, setNotesChanged] = useState(false);

  async function fetchTickets(
    status: PersonalTicketStatus,
    nextPage = 1,
    options?: {
      q?: string;
      category?: PersonalTicketCategoryFilter;
      priority?: PersonalTicketPriorityFilter;
    }
  ) {
    setLoading(true);
    try {
      const nextSearch = options?.q ?? activeSearch;
      const nextCategory = options?.category ?? category;
      const nextPriority = options?.priority ?? priority;
      const params = new URLSearchParams({
        status,
        page: String(nextPage),
        limit: String(PAGE_SIZE),
      });

      if (nextSearch.trim()) params.set('q', nextSearch.trim());
      if (nextCategory !== 'all') params.set('category', nextCategory);
      if (nextPriority !== 'all') params.set('priority', nextPriority);

      const res = await fetch(`/api/admin/tasks?${params}`);
      const data = (await res.json()) as {
        tickets?: PersonalTicketRecord[];
        pagination?: PersonalTicketsPagination;
        error?: string;
      };

      if (!res.ok || !data.pagination) {
        setActionMessage({
          text: data.error ?? 'Failed to load personal tasks.',
          type: 'error',
        });
        return;
      }

      setTickets(data.tickets ?? []);
      setPagination(data.pagination);
    } finally {
      setLoading(false);
    }
  }

  function changeQueue(next: PersonalTicketStatus) {
    setSelected(null);
    setView('list');
    setQueue(next);
    fetchTickets(next, 1);
  }

  function submitSearch() {
    const q = search.trim();
    setActiveSearch(q);
    setSelected(null);
    setView('list');
    fetchTickets(queue, 1, { q });
  }

  function clearSearch() {
    setSearch('');
    setActiveSearch('');
    setSelected(null);
    setView('list');
    fetchTickets(queue, 1, { q: '' });
  }

  function changeCategory(next: PersonalTicketCategoryFilter) {
    setCategory(next);
    setSelected(null);
    setView('list');
    fetchTickets(queue, 1, { category: next });
  }

  function changePriority(next: PersonalTicketPriorityFilter) {
    setPriority(next);
    setSelected(null);
    setView('list');
    fetchTickets(queue, 1, { priority: next });
  }

  function changePage(nextPage: number) {
    setSelected(null);
    setView('list');
    fetchTickets(queue, nextPage);
  }

  async function handleSelect(ticket: PersonalTicketRecord) {
    const res = await fetch(`/api/admin/tasks/${ticket.id}`);
    const data = (await res.json()) as {
      ticket?: PersonalTicketRecord;
      error?: string;
    };

    if (!res.ok || !data.ticket) {
      setActionMessage({
        text: data.error ?? 'Failed to load task.',
        type: 'error',
      });
      return;
    }

    setSelected(data.ticket);
    setNotes(data.ticket.internal_notes ?? '');
    setNotesChanged(false);
    setActionMessage(null);
    setView('detail');
  }

  async function patchSelected(body: Record<string, unknown>) {
    if (!selected) return { ok: false, data: { error: 'No task selected' } };

    const res = await fetch(`/api/admin/tasks/${selected.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = (await res.json()) as {
      ticket?: PersonalTicketRecord;
      error?: string;
    };

    if (res.ok && data.ticket) {
      setSelected(data.ticket);
      await fetchTickets(queue, pagination.page);
    }

    return { ok: res.ok, data };
  }

  async function updateStatus(status: PersonalTicketStatus) {
    setActionLoading(true);
    setActionMessage(null);
    try {
      const { ok, data } = await patchSelected({ status });
      setActionMessage(
        ok
          ? { text: 'Status updated.', type: 'success' }
          : { text: data.error ?? 'Update failed.', type: 'error' }
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function updatePriority(nextPriority: PersonalTicketPriority) {
    setActionLoading(true);
    setActionMessage(null);
    try {
      const { ok, data } = await patchSelected({ priority: nextPriority });
      setActionMessage(
        ok
          ? { text: 'Priority updated.', type: 'success' }
          : { text: data.error ?? 'Update failed.', type: 'error' }
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function saveNotes() {
    setActionLoading(true);
    setActionMessage(null);
    try {
      const { ok, data } = await patchSelected({ internal_notes: notes });
      if (ok) {
        setNotesChanged(false);
        setActionMessage({ text: 'Notes saved.', type: 'success' });
      } else {
        setActionMessage({ text: data.error ?? 'Save failed.', type: 'error' });
      }
    } finally {
      setActionLoading(false);
    }
  }

  const activeFilterSummary = [
    activeSearch ? `Search: "${activeSearch}"` : null,
    category !== 'all' ? `Category: ${formatTicketCategory(category)}` : null,
    priority !== 'all' ? `Priority: ${formatTicketPriority(priority)}` : null,
  ]
    .filter(Boolean)
    .join(' - ');

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-[var(--border-subtle)] px-4 py-3">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Link href="/admin/work" className="ui-button min-h-9 px-3 py-1.5">
            Work
          </Link>
          <span className="ui-nav-item ui-nav-item-active min-h-9 px-3 py-1.5">
            Personal
          </span>
        </div>
        <Link href="/admin/personal/new" className="ui-button ui-button-strong min-h-9 px-3 py-1.5 text-sm">
          <Plus size={16} />
          Add Task
        </Link>
      </div>

      <div className="flex shrink-0 gap-1 overflow-x-auto border-b border-[var(--border-subtle)] px-3 py-2 lg:hidden">
        {VALID_PERSONAL_TICKET_STATUSES.map((status) => (
          <QueueButton
            key={status}
            status={status}
            active={queue === status}
            compact
            onClick={() => changeQueue(status)}
          />
        ))}
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <aside className="hidden w-[180px] shrink-0 flex-col gap-1 overflow-y-auto border-r border-[var(--border-subtle)] px-3 py-5 lg:flex">
          <p className="mb-2 px-2 text-[0.65rem] uppercase tracking-[0.1em] text-[var(--text-muted)]">
            Queues
          </p>
          {VALID_PERSONAL_TICKET_STATUSES.map((status) => (
            <QueueButton
              key={status}
              status={status}
              active={queue === status}
              onClick={() => changeQueue(status)}
            />
          ))}
        </aside>

        <div
          className={[
            'shrink-0 flex-col overflow-hidden border-r border-[var(--border-subtle)]',
            'w-full md:w-[340px]',
            view === 'detail' ? 'hidden md:flex' : 'flex',
          ].join(' ')}
        >
          <PersonalTicketFilters
            search={search}
            activeSearch={activeSearch}
            category={category}
            priority={priority}
            loading={loading}
            onSearchChange={setSearch}
            onSearchSubmit={submitSearch}
            onClearSearch={clearSearch}
            onCategoryChange={changeCategory}
            onPriorityChange={changePriority}
          />
          <PersonalTicketList
            tickets={tickets}
            selectedId={selected?.id}
            pagination={pagination}
            loading={loading}
            queueLabel={QUEUE_LABELS[queue]}
            activeFilterSummary={activeFilterSummary}
            onSelect={handleSelect}
            onPageChange={changePage}
          />
        </div>

        <div
          className={[
            'min-w-0 flex-1 flex-col overflow-y-auto',
            view === 'list' ? 'hidden md:flex' : 'flex',
          ].join(' ')}
        >
          <PersonalTicketDetail
            ticket={selected}
            notes={notes}
            notesChanged={notesChanged}
            actionLoading={actionLoading}
            actionMessage={actionMessage}
            onBack={() => setView('list')}
            onNotesChange={(value) => {
              setNotes(value);
              setNotesChanged(true);
            }}
            onSaveNotes={saveNotes}
            onStatusChange={updateStatus}
            onPriorityChange={updatePriority}
          />
        </div>
      </div>
    </div>
  );
}
