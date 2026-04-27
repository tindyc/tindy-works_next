import type { Metadata } from 'next';
import { SupportView } from '@/components/support/SupportView';

export const metadata: Metadata = {
  title: 'Get Support | TINDY_WORKS',
  description: 'Request technical help, community support, or regular check-ins. Patient, jargon-free assistance for you or someone you know.',
};

interface PageProps {
  searchParams: Promise<{ intent?: string }>;
}

export default async function SupportPage({ searchParams }: PageProps) {
  const { intent } = await searchParams;
  return <SupportView initialIntent={intent} />;
}
