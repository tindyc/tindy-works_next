'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (authError) {
        setError(authError.message);
      } else {
        router.push('/admin');
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm p-8"
        style={{ border: '1px solid var(--border-subtle)', borderRadius: '0.5rem' }}
      >
        <h1
          className="text-lg font-semibold mb-6 tracking-tight"
          style={{ color: 'var(--text-primary)' }}
        >
          Admin
        </h1>

        {error && (
          <p
            className="text-sm mb-4"
            style={{ color: 'var(--status-danger)' }}
          >
            {error}
          </p>
        )}

        <label className="block mb-4">
          <span
            className="block text-xs mb-1"
            style={{ color: 'var(--text-secondary)' }}
          >
            Email
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full px-3 py-2 text-sm rounded"
            style={{
              background: 'var(--ui-surface)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
            }}
          />
        </label>

        <label className="block mb-6">
          <span
            className="block text-xs mb-1"
            style={{ color: 'var(--text-secondary)' }}
          >
            Password
          </span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="w-full px-3 py-2 text-sm rounded"
            style={{
              background: 'var(--ui-surface)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
            }}
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 text-sm font-medium rounded"
          style={{
            background: 'var(--text-primary)',
            color: 'var(--bg-base)',
            opacity: loading ? 0.6 : 1,
            cursor: loading ? 'not-allowed' : 'pointer',
            border: 'none',
          }}
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
