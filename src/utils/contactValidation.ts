export type ContactMethod = 'email' | 'sms' | 'whatsapp' | 'not-sure' | '';

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isValidPhone(value: string) {
  return /^\+?[0-9\s\-()]{7,}$/.test(value.trim());
}

export function getContactFieldVisibility(method: ContactMethod) {
  return {
    showEmail: method === 'email' || method === 'not-sure',
    showPhone: method === 'sms' || method === 'whatsapp' || method === 'not-sure',
  };
}

export function validateContact(method: ContactMethod, email: string, phone: string) {
  const errors: { email?: string; phone?: string; contactMethod?: string } = {};

  if (!method) {
    errors.contactMethod = 'Please choose how you would like to be contacted.';
    return errors;
  }

  if (method === 'email') {
    if (!email.trim()) errors.email = 'Please enter your email address.';
    else if (!isValidEmail(email)) errors.email = 'Please enter a valid email address.';
  }

  if (method === 'sms' || method === 'whatsapp') {
    if (!phone.trim()) errors.phone = 'Please enter your phone number.';
    else if (!isValidPhone(phone)) errors.phone = 'Please enter a valid phone number (e.g. +44 7700 000000).';
  }

  if (method === 'not-sure') {
    const hasEmail = Boolean(email.trim()) && isValidEmail(email);
    const hasPhone = Boolean(phone.trim()) && isValidPhone(phone);
    if (!hasEmail && !hasPhone) {
      errors.email = 'Please provide at least an email or phone number.';
    } else {
      if (email.trim() && !isValidEmail(email)) errors.email = 'Please enter a valid email address.';
      if (phone.trim() && !isValidPhone(phone)) errors.phone = 'Please enter a valid phone number.';
    }
  }

  return errors;
}
