import { fetchAuthSession } from 'aws-amplify/auth';

function apiBase(): string {
  const raw = import.meta.env.VITE_FERIA_API_URL?.trim() ?? '';
  return raw.replace(/\/$/, '');
}

export function isFeriaApiConfigured(): boolean {
  return apiBase().length > 0;
}

type SessionTokens = {
  accessToken: string | null;
  idToken: string | null;
};

async function authTokens(): Promise<SessionTokens> {
  const session = await fetchAuthSession();
  const access = session.tokens?.accessToken;
  const id = session.tokens?.idToken;
  return {
    accessToken: access ? access.toString() : null,
    idToken: id ? id.toString() : null,
  };
}

function withBearer(headers: HeadersInit | undefined, token: string): Headers {
  const h = new Headers(headers);
  h.set('Authorization', `Bearer ${token}`);
  return h;
}

async function fetchWithAuthRetry(input: RequestInfo | URL, init: RequestInit): Promise<Response> {
  const { accessToken, idToken } = await authTokens();
  const candidates = [accessToken, idToken].filter(
    (value, idx, arr): value is string => Boolean(value) && arr.indexOf(value) === idx
  );

  if (candidates.length === 0) {
    throw new Error('Not authenticated');
  }

  let lastResponse: Response | null = null;

  for (const token of candidates) {
    const res = await fetch(input, {
      ...init,
      headers: withBearer(init.headers, token),
    });

    if (res.status !== 401) {
      return res;
    }

    lastResponse = res;
  };

  return lastResponse as Response;
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
  const res = await fetchWithAuthRetry(`${base}/voice-jobs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
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
  const res = await fetchWithAuthRetry(`${base}/voice-jobs/${encodeURIComponent(jobId)}`, {
    method: 'GET',
    headers: {},
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
  const res = await fetchWithAuthRetry(`${base}/movements`, {
    method: 'GET',
    headers: {},
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
