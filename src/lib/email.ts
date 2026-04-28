import { Resend } from 'resend';
import type { ReactElement } from 'react';

let resend: Resend | null = null;

function requireEnv(name: 'RESEND_API_KEY' | 'EMAIL_FROM' | 'EMAIL_TO') {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is not configured.`);
  }

  return value;
}

function getOptionalEnv(name: string) {
  return process.env[name]?.trim() || undefined;
}

function getResendClient() {
  resend ??= new Resend(requireEnv('RESEND_API_KEY'));
  return resend;
}

export type SubmissionEmail = {
  subject: string;
  react: ReactElement;
  replyTo?: string;
  to?: string[];
  text?: string;
};

export async function sendSubmissionEmail(email: SubmissionEmail) {
  const from = requireEnv('EMAIL_FROM');
  const defaultTo = requireEnv('EMAIL_TO');
  const to = email.to === undefined ? [defaultTo] : email.to;
  const payload = {
    from,
    to,
    subject: email.subject,
    react: email.react,
    ...(email.replyTo ? { reply_to: email.replyTo } : {}),
    ...(email.text ? { text: email.text } : {}),
    headers: {
      'X-Entity-Ref-ID': crypto.randomUUID(),
    },
  };

  console.log('SENDING_EMAIL', { to, subject: email.subject });
  console.log('RESEND_EMAIL_PAYLOAD', {
    ...payload,
    react: email.react.type,
  });

  if (getOptionalEnv('RESEND_SANDBOX_MODE') === 'true' || from.endsWith('@resend.dev')) {
    const verifiedRecipients = new Set([
      defaultTo.toLowerCase(),
      ...(getOptionalEnv('RESEND_VERIFIED_EMAILS') ?? '')
        .split(',')
        .map((value) => value.trim().toLowerCase())
        .filter(Boolean),
    ]);
    const unverifiedRecipients = to.filter((recipient) => !verifiedRecipients.has(recipient.toLowerCase()));

    if (unverifiedRecipients.length > 0) {
      console.warn('RESEND_SANDBOX_OR_VERIFICATION_WARNING', {
        from,
        to,
        unverifiedRecipients,
        reason: from.endsWith('@resend.dev')
          ? 'EMAIL_FROM uses resend.dev, which can be limited to verified recipients/domains.'
          : 'RESEND_SANDBOX_MODE=true.',
      });
    }
  }

  const result = await getResendClient().emails.send(payload);

  console.log('EMAIL_RESPONSE', result);
  console.log('EMAIL_RESPONSE_DETAILS', {
    data: result.data,
    error: result.error,
  });

  if (result.error) {
    console.error('EMAIL_RESPONSE_ERROR', {
      to,
      subject: email.subject,
      error: result.error,
    });
    throw new Error(`Resend email send failed: ${JSON.stringify(result.error)}`);
  }

  return result;
}
