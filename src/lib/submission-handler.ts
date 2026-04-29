import { sendSubmissionEmail, type SubmissionEmail } from './email';
import { formatUserConfirmationEmail } from './email-templates';
import { supabase } from './supabase';

export async function handleSubmission({
  requestId,
  type,
  ownerEmail,
  userEmail,
  userName,
  confirmationType,
  preview,
  payload,
  content,
  contact,
  metadata,
  fingerprint,
  ip,
  intent,
  category,
}: {
  requestId: string;
  type: string;
  ownerEmail: SubmissionEmail;
  userEmail?: string | null;
  userName?: string;
  confirmationType: 'contact' | 'support';
  preview?: string;
  payload: Record<string, string>;
  content: string;
  contact: {
    email: string;
    contactValue: string;
    contactMethod: string;
  };
  metadata?: Record<string, string>;
  fingerprint: string;
  ip: string;
  intent?: string;
  category?: string | null;
}) {
  const normalizedUserEmail = userEmail?.trim() || null;

  console.log('HANDLE_SUBMISSION_USER_EMAIL', {
    requestId,
    type,
    userEmail,
    normalizedUserEmail,
    hasUserEmail: Boolean(normalizedUserEmail),
  });

  const { data: record, error } = await supabase
    .from('submissions')
    .insert({
      request_id: requestId,
      type,
      intent,
      category,
      name: userName,
      email: contact.contactMethod === 'email' ? contact.contactValue : contact.email || null,
      phone: contact.contactMethod !== 'email' ? contact.contactValue : null,
      contact_method: contact.contactMethod,
      content,
      preview,
      metadata: metadata ?? null,
      payload,
      fingerprint,
      ip_address: ip,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    console.error('DB INSERT FAILED', error);
    throw new Error('Failed to store submission');
  }

  if (!record) {
    console.error('DB INSERT RETURNED NO RECORD', { requestId });
    throw new Error('Failed to store submission');
  }

  try {
    console.log('BEFORE_SEND_SUBMISSION_EMAIL', {
      requestId,
      type,
      emailType: 'owner',
      to: ownerEmail.to,
      subject: ownerEmail.subject,
    });
    const result = await sendSubmissionEmail(ownerEmail);
    const { error: updateError } = await supabase
      .from('submissions')
      .update({ status: 'sent' })
      .eq('id', record.id);

    if (updateError) {
      console.error('DB STATUS UPDATE FAILED', updateError);
    }

    console.log('AFTER_SEND_SUBMISSION_EMAIL', {
      requestId,
      type,
      emailType: 'owner',
      to: ownerEmail.to,
      subject: ownerEmail.subject,
      result,
    });
    console.log('EMAIL_RESULT', { requestId, emailType: 'owner', result });
  } catch (error) {
    console.error('AFTER_SEND_SUBMISSION_EMAIL', {
      requestId,
      type,
      emailType: 'owner',
      to: ownerEmail.to,
      subject: ownerEmail.subject,
      error: error instanceof Error ? error.message : error,
    });
    const { error: updateError } = await supabase
      .from('submissions')
      .update({ status: 'failed' })
      .eq('id', record.id);

    if (updateError) {
      console.error('DB STATUS UPDATE FAILED', updateError);
    }

    console.error('EMAIL_DELIVERY_FAILED', {
      requestId,
      type,
      error: error instanceof Error ? error.message : error,
    });
  }

  if (normalizedUserEmail) {
    const confirmationEmail = formatUserConfirmationEmail({
      requestId,
      email: normalizedUserEmail,
      name: userName,
      type: confirmationType,
      preview,
    });

    console.log('USER_CONFIRMATION_EMAIL_TARGET', {
      requestId,
      userEmail: normalizedUserEmail,
      to: confirmationEmail.to,
    });

    try {
      console.log('BEFORE_SEND_SUBMISSION_EMAIL', {
        requestId,
        type,
        emailType: 'user-confirmation',
        to: confirmationEmail.to,
        subject: confirmationEmail.subject,
      });
      const result = await sendSubmissionEmail(confirmationEmail);
      console.log('AFTER_SEND_SUBMISSION_EMAIL', {
        requestId,
        type,
        emailType: 'user-confirmation',
        to: confirmationEmail.to,
        subject: confirmationEmail.subject,
        result,
      });
      console.log('EMAIL_RESULT', { requestId, emailType: 'user-confirmation', result });
    } catch (error) {
      console.error('AFTER_SEND_SUBMISSION_EMAIL', {
        requestId,
        type,
        emailType: 'user-confirmation',
        to: confirmationEmail.to,
        subject: confirmationEmail.subject,
        error: error instanceof Error ? error.message : error,
      });
      console.error('USER_CONFIRMATION_EMAIL_FAILED', {
        requestId,
        to: confirmationEmail.to,
        error: error instanceof Error ? error.message : error,
      });
    }
  } else {
    console.warn('USER_CONFIRMATION_EMAIL_SKIPPED', {
      requestId,
      type,
      reason: 'No userEmail was provided.',
      userEmail,
    });
  }
}
