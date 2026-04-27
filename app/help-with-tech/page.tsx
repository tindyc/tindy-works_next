import type { Metadata } from 'next';
import { HelpWithTech } from '@/features/support/pages/HelpWithTech';

export const metadata: Metadata = {
  title: 'Help with Tech | Simple Support for Older Adults',
  description:
    'Simple, patient help with phones, laptops, email, and the internet. Request support for yourself or someone else.',
};

export default function Page() {
  return <HelpWithTech />;
}
