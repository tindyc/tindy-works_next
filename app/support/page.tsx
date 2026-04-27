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
  searchParams?: { intent?: string };
}

export default function Page({ searchParams }: PageProps) {
  return <Support intent={searchParams?.intent} />;
}
