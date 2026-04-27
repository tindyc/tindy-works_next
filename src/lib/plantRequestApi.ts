import { type TerminalFormData } from '@/hooks/useTerminalFlow';

export async function submitPlantRequest(payload: TerminalFormData) {
  const response = await fetch('/api/plant-request', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const contentType = response.headers.get('content-type') ?? '';
  const body = contentType.includes('application/json')
    ? await response.json()
    : { error: 'Unexpected server response.' };

  if (!response.ok) {
    const errorText =
      typeof body?.error === 'string' ? body.error : 'Unable to submit request right now.';
    throw new Error(errorText);
  }

  return body as {
    ok: boolean;
    requestId: string;
    message: string;
  };
}
