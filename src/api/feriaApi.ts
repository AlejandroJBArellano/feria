import { fetchAuthSession } from 'aws-amplify/auth';

function apiBase(): string {
  const raw = import.meta.env.VITE_FERIA_API_URL?.trim() ?? '';
  return raw.replace(/\/$/, '');
}

export function isFeriaApiConfigured(): boolean {
  return apiBase().length > 0;
}

async function idToken(): Promise<string | null> {
  const session = await fetchAuthSession();
  const t = session.tokens?.idToken;
  return t ? t.toString() : null;
}

async function authHeaders(): Promise<HeadersInit> {
  const token = await idToken();
  if (!token) {
    throw new Error('Not authenticated');
  }
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

export type VoiceJobCreateResponse = {
  jobId: string;
  uploadUrl: string;
  s3Key: string;
  expiresInSeconds: number;
  contentType: string;
  mediaFormat: string;
};

export async function createVoiceJob(contentType?: string): Promise<VoiceJobCreateResponse> {
  const base = apiBase();
  if (!base) throw new Error('VITE_FERIA_API_URL is not set');
  const res = await fetch(`${base}/voice-jobs`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ contentType }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `createVoiceJob failed: ${res.status}`);
  }
  return res.json() as Promise<VoiceJobCreateResponse>;
}

export type VoiceJobStatusResponse = {
  jobId: string;
  status: string;
  movementId: string | null;
  movementIds?: string[];
  movementCount?: number;
  error: string | null;
  updatedAt: string;
};

export async function getVoiceJob(jobId: string): Promise<VoiceJobStatusResponse> {
  const base = apiBase();
  if (!base) throw new Error('VITE_FERIA_API_URL is not set');
  const res = await fetch(`${base}/voice-jobs/${encodeURIComponent(jobId)}`, {
    method: 'GET',
    headers: await authHeaders(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `getVoiceJob failed: ${res.status}`);
  }
  return res.json() as Promise<VoiceJobStatusResponse>;
}

export type ApiMovement = {
  id: string;
  kind: 'ingreso' | 'gasto';
  concept: string;
  category: string;
  amount: number;
  currency: string;
  movementDate: string | null;
  createdAt: string;
  source: string;
};

export async function listMovements(): Promise<ApiMovement[]> {
  const base = apiBase();
  if (!base) throw new Error('VITE_FERIA_API_URL is not set');
  const res = await fetch(`${base}/movements`, {
    method: 'GET',
    headers: await authHeaders(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `listMovements failed: ${res.status}`);
  }
  const data = (await res.json()) as { movements: ApiMovement[] };
  return data.movements ?? [];
}

export async function uploadAudioToPresignedUrl(
  uploadUrl: string,
  blob: Blob,
  contentType: string
): Promise<void> {
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': contentType,
    },
    body: blob,
  });
  if (!res.ok) {
    throw new Error(`Upload failed: ${res.status}`);
  }
}

export async function pollVoiceJobUntilDone(
  jobId: string,
  options: { intervalMs?: number; maxAttempts?: number } = {}
): Promise<VoiceJobStatusResponse> {
  const intervalMs = options.intervalMs ?? 2000;
  const maxAttempts = options.maxAttempts ?? 90;
  for (let i = 0; i < maxAttempts; i++) {
    const status = await getVoiceJob(jobId);
    if (status.status === 'completed' || status.status === 'failed') {
      return status;
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error('Processing timed out');
}
