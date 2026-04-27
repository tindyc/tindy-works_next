import type { Metadata } from 'next';
import { ContactForm } from '@/features/contact/ContactForm';

export const metadata: Metadata = {
  title: 'Contact | TINDY_WORKS',
  description: 'Get in touch for opportunities, recruitment, or general questions.',
};

export default function Page() {
  return <ContactForm />;
}
