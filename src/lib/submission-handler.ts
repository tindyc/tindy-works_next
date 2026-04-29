import { sendSubmissionEmail, type SubmissionEmail } from './email';
import { formatUserConfirmationEmail } from './email-templates';

export async function handleSubmission({
  requestId,
  type,
  ownerEmail,
  userEmail,
  userName,
  confirmationType,
  preview,
}: {
  requestId: string;
  type: string;
  ownerEmail: SubmissionEmail;
  userEmail?: string | null;
  userName?: string;
  confirmationType: 'contact' | 'support';
  preview?: string;
}) {
  const normalizedUserEmail = userEmail?.trim() || null;

  console.log('HANDLE_SUBMISSION_USER_EMAIL', {
    requestId,
    type,
    userEmail,
    normalizedUserEmail,
    hasUserEmail: Boolean(normalizedUserEmail),
  });

  try {
    console.log('BEFORE_SEND_SUBMISSION_EMAIL', {
      requestId,
      type,
      emailType: 'owner',
      to: ownerEmail.to,
      subject: ownerEmail.subject,
    });
    const result = await sendSubmissionEmail(ownerEmail);
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
