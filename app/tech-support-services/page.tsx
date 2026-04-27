import type { Metadata } from 'next';
import { TechSupportServices } from '@/features/support/pages/TechSupportServices';

export const metadata: Metadata = {
  title: 'Freelance Tech Support | Websites, Apps & Bugs',
  description:
    'Professional technical support for websites, apps, and systems. Fast, reliable help.',
};

export default function Page() {
  return <TechSupportServices />;
}
