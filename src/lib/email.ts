import { Resend } from 'resend';

let resend: Resend | null = null;

function requireEnv(name: 'RESEND_API_KEY' | 'EMAIL_FROM' | 'EMAIL_TO') {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is not configured.`);
  }

  return value;
}

function getResendClient() {
  resend ??= new Resend(requireEnv('RESEND_API_KEY'));
  return resend;
}

export type SubmissionEmail = {
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
};

export async function sendSubmissionEmail(email: SubmissionEmail) {
  return getResendClient().emails.send({
    ...email,
    from: requireEnv('EMAIL_FROM'),
    to: [requireEnv('EMAIL_TO')],
  });
}
