'use client';

import { Search, X } from 'lucide-react';
import type { FormEvent } from 'react';
import {
  VALID_PERSONAL_TICKET_CATEGORIES,
  VALID_PERSONAL_TICKET_PRIORITIES,
} from '@/lib/personal-ticket-validation';
import type {
  PersonalTicketCategory,
  PersonalTicketPriority,
} from '@/lib/personal-ticket-validation';

export type PersonalTicketCategoryFilter = PersonalTicketCategory | 'all';
export type PersonalTicketPriorityFilter = PersonalTicketPriority | 'all';

const CATEGORY_LABELS: Record<PersonalTicketCategoryFilter, string> = {
  all: 'All categories',
  general: 'General',
  website: 'Website',
  'job-hunt': 'Job hunt',
  learning: 'Learning',
  'life-admin': 'Life admin',
  'follow-up': 'Follow-up',
  content: 'Content',
  bug: 'Bug',
};

const PRIORITY_LABELS: Record<PersonalTicketPriorityFilter, string> = {
  all: 'All priorities',
  low: 'Low',
  normal: 'Normal',
  high: 'High',
  urgent: 'Urgent',
};

const controlClass =
  'min-h-10 rounded-md border border-[var(--border-subtle)] bg-[var(--ui-surface)] px-3 text-sm text-[var(--text-primary)] outline-none';

export function formatTicketCategory(value: PersonalTicketCategory) {
  return CATEGORY_LABELS[value];
}

export function formatTicketPriority(value: PersonalTicketPriority) {
  return PRIORITY_LABELS[value];
}

export function PersonalTicketFilters({
  search,
  activeSearch,
  category,
  priority,
  loading,
  onSearchChange,
  onSearchSubmit,
  onClearSearch,
  onCategoryChange,
  onPriorityChange,
}: {
  search: string;
  activeSearch: string;
  category: PersonalTicketCategoryFilter;
  priority: PersonalTicketPriorityFilter;
  loading: boolean;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onClearSearch: () => void;
  onCategoryChange: (value: PersonalTicketCategoryFilter) => void;
  onPriorityChange: (value: PersonalTicketPriorityFilter) => void;
}) {
  function submit(e: FormEvent) {
    e.preventDefault();
    onSearchSubmit();
  }

  return (
    <div className="shrink-0 space-y-2 border-b border-[var(--border-subtle)] p-3">
      <form onSubmit={submit} className="flex gap-2">
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search tasks..."
          className={`${controlClass} min-w-0 flex-1`}
        />
        <button
          type="submit"
          disabled={loading}
          title="Search"
          className="ui-button min-h-10 w-10 p-0"
        >
          <Search size={16} />
        </button>
        {activeSearch && (
          <button
            type="button"
            onClick={onClearSearch}
            disabled={loading}
            title="Clear search"
            className="ui-button min-h-10 w-10 p-0"
          >
            <X size={16} />
          </button>
        )}
      </form>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-1">
        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value as PersonalTicketCategoryFilter)}
          disabled={loading}
          className={controlClass}
        >
          <option value="all">{CATEGORY_LABELS.all}</option>
          {VALID_PERSONAL_TICKET_CATEGORIES.map((value) => (
            <option key={value} value={value}>
              {CATEGORY_LABELS[value]}
            </option>
          ))}
        </select>

        <select
          value={priority}
          onChange={(e) => onPriorityChange(e.target.value as PersonalTicketPriorityFilter)}
          disabled={loading}
          className={controlClass}
        >
          <option value="all">{PRIORITY_LABELS.all}</option>
          {VALID_PERSONAL_TICKET_PRIORITIES.map((value) => (
            <option key={value} value={value}>
              {PRIORITY_LABELS[value]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
