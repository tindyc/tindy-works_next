import { useState } from 'react';
import {
  type ContactMethod,
  getContactFieldVisibility,
  validateContact,
  isValidEmail,
  isValidPhone,
} from '@/utils/contactValidation';

export type { ContactMethod };

export function useContactFields() {
  const [contactMethod, setContactMethod] = useState<ContactMethod>('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const { showEmail, showPhone } = getContactFieldVisibility(contactMethod);

  function handleContactMethodChange(method: string) {
    const next = method as ContactMethod;
    setContactMethod(next);
    if (next === 'email') setPhone('');
    if (next === 'sms' || next === 'whatsapp') setEmail('');
  }

  function validate() {
    return validateContact(contactMethod, email, phone);
  }

  function hasValidContact() {
    return (
      (contactMethod === 'email' && isValidEmail(email)) ||
      ((contactMethod === 'sms' || contactMethod === 'whatsapp') && isValidPhone(phone)) ||
      (contactMethod === 'not-sure' && Boolean(email || phone))
    );
  }

  return {
    contactMethod,
    email,
    phone,
    setEmail,
    setPhone,
    handleContactMethodChange,
    showEmail,
    showPhone,
    validate,
    hasValidContact,
  };
}
