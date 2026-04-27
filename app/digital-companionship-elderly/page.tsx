import type { Metadata } from 'next';
import { DigitalCompanionship } from '@/features/support/pages/DigitalCompanionship';

export const metadata: Metadata = {
  title: 'Digital Companionship for Elderly | Regular Check-ins',
  description:
    'Friendly, consistent check-ins via email, SMS, or messaging. No video calls required.',
};

export default function Page() {
  return <DigitalCompanionship />;
}
