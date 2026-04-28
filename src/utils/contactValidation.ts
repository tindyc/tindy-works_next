export type ContactMethod = 'email' | 'sms' | 'whatsapp' | 'not-sure' | '';
export type PersonContactMethod = 'phone' | 'email' | 'no' | '';

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isValidPhone(value: string) {
  return /^\+?[0-9\s\-()]{7,}$/.test(value.trim());
}

export function validateRequiredEmail(value: string): string | null {
  if (!value.trim()) return 'Please enter an email address.';
  if (!isValidEmail(value)) return 'Please enter a valid email address.';
  return null;
}

export function validateRequiredPhone(value: string): string | null {
  if (!value.trim()) return 'Please enter a phone number.';
  if (!isValidPhone(value)) return 'Please enter a valid phone number.';
  return null;
}

export function hasValidContact(email: string, phone: string): boolean {
  return (
    (Boolean(email.trim()) && isValidEmail(email)) ||
    (Boolean(phone.trim()) && isValidPhone(phone))
  );
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
    const err = validateRequiredEmail(email);
    if (err) errors.email = err;
  }

  if (method === 'sms' || method === 'whatsapp') {
    const err = validateRequiredPhone(phone);
    if (err) errors.phone = err;
  }

  if (method === 'not-sure') {
    if (!hasValidContact(email, phone)) {
      errors.email = 'Please provide at least an email or phone number.';
      errors.phone = 'Please provide at least an email or phone number.';
      return errors;
    }

    if (email.trim() && !isValidEmail(email)) errors.email = 'Please enter a valid email address.';
    if (phone.trim() && !isValidPhone(phone)) errors.phone = 'Please enter a valid phone number.';
  }

  return errors;
}

export function validatePersonContact(
  method: PersonContactMethod,
  email?: string,
  phone?: string,
) {
  const errors: { personEmail?: string; personPhone?: string } = {};

  if (method === 'phone') {
    const err = validateRequiredPhone(phone ?? '');
    if (err) errors.personPhone = err;
  }

  if (method === 'email') {
    const err = validateRequiredEmail(email ?? '');
    if (err) errors.personEmail = err;
  }

  return errors;
}
