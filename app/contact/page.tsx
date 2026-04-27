import type { Metadata } from 'next';
import { ContactView } from "@/components/contact/ContactView";

export const metadata: Metadata = {
  title: 'Contact | TINDY_WORKS',
  description: 'Get in touch for opportunities, recruitment, or general questions.',
};

export default function Page() {
  return <ContactView />;
}
