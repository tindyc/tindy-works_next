'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import {
  VALID_PERSONAL_TICKET_CATEGORIES,
  VALID_PERSONAL_TICKET_PRIORITIES,
  type PersonalTicketCategory,
  type PersonalTicketPriority,
} from '@/lib/personal-ticket-validation';
import { formatTicketCategory, formatTicketPriority } from './PersonalTicketFilters';

const inputClass =
  'w-full rounded-md border border-[var(--border-subtle)] bg-[var(--ui-surface)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none';

export function PersonalTicketForm() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<PersonalTicketCategory>('general');
  const [priority, setPriority] = useState<PersonalTicketPriority>('normal');
  const [dueAt, setDueAt] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description: description.trim() ? description : null,
          category,
          priority,
          due_at: dueAt || null,
        }),
      });
      const data = (await res.json()) as { error?: string };

      if (!res.ok) {
        setMessage({ text: data.error ?? 'Failed to create task.', type: 'error' });
        return;
      }

      router.push('/admin/personal');
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-subtle)] px-4 py-3">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Link href="/admin/personal" className="ui-button min-h-9 px-3 py-1.5">
            <ArrowLeft size={16} />
            Back to Personal
          </Link>
          <Link href="/admin/work" className="ui-button min-h-9 px-3 py-1.5">
            Work
          </Link>
        </div>
      </div>

      <main className="mx-auto w-full max-w-2xl px-4 py-8">
        <div className="mb-6">
          <p className="mb-2 text-[0.7rem] uppercase tracking-[0.1em] text-[var(--text-muted)]">
            Personal
          </p>
          <h1 className="font-['Space_Grotesk'] text-2xl font-semibold text-[var(--text-primary)]">
            New Task
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block">
            <span className="mb-2 block text-sm text-[var(--text-secondary)]">Title</span>
            <input
              required
              maxLength={160}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClass}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-[var(--text-secondary)]">Description</span>
            <textarea
              maxLength={10000}
              rows={8}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`${inputClass} resize-y`}
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm text-[var(--text-secondary)]">Category</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as PersonalTicketCategory)}
                className={inputClass}
              >
                {VALID_PERSONAL_TICKET_CATEGORIES.map((value) => (
                  <option key={value} value={value}>
                    {formatTicketCategory(value)}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-[var(--text-secondary)]">Priority</span>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PersonalTicketPriority)}
                className={inputClass}
              >
                {VALID_PERSONAL_TICKET_PRIORITIES.map((value) => (
                  <option key={value} value={value}>
                    {formatTicketPriority(value)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm text-[var(--text-secondary)]">Due date</span>
            <input
              type="datetime-local"
              value={dueAt}
              onChange={(e) => setDueAt(e.target.value)}
              className={inputClass}
            />
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="ui-button ui-button-strong min-h-10 px-4"
            >
              <Save size={16} />
              {submitting ? 'Creating...' : 'Create Task'}
            </button>
            {message && (
              <span
                className="text-sm"
                style={{
                  color:
                    message.type === 'error'
                      ? 'var(--status-danger)'
                      : 'var(--status-success)',
                }}
              >
                {message.text}
              </span>
            )}
          </div>
        </form>
      </main>
    </div>
  );
}
