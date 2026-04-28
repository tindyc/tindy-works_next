import type { Metadata } from 'next';
import { Support } from '@/features/support/pages/Support';

export const metadata: Metadata = {
  title: 'Get Support | TINDY_WORKS',
  description: 'Request technical help, community support, or regular check-ins. Patient, jargon-free assistance for you or someone you know.',
  robots: {
    index: false,
    follow: true,
  },
};

interface PageProps {
  searchParams: { intent?: string } | Promise<{ intent?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const resolved = await Promise.resolve(searchParams);

  return <Support intent={resolved.intent} />;
}
