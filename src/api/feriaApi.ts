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

async function authTokens(forceRefresh: boolean): Promise<SessionTokens> {
  const session = await fetchAuthSession(forceRefresh ? { forceRefresh: true } : {});
  const access = session.tokens?.accessToken;
  const id = session.tokens?.idToken;
  return {
    accessToken: access ? access.toString() : null,
    idToken: id ? id.toString() : null,
  };
}

/** Prefer id token first — API Gateway Cognito authorizer expects the same pool; MVP uses ID token. */
function tokenCandidates(tokens: SessionTokens): string[] {
  return [tokens.idToken, tokens.accessToken].filter(
    (value, idx, arr): value is string => Boolean(value) && arr.indexOf(value) === idx
  );
}

function withBearer(headers: HeadersInit | undefined, token: string): Headers {
  const h = new Headers(headers);
  h.set('Authorization', `Bearer ${token}`);
  return h;
}

/**
 * Calls the Feria API with Cognito tokens. Tries ID token before access token, then refreshes
 * the session once if API Gateway returns 401/403 (expired session).
 */
async function authorizedFetch(input: RequestInfo | URL, init: RequestInit): Promise<Response> {
  const run = async (forceRefresh: boolean): Promise<Response | null> => {
    const tokens = await authTokens(forceRefresh);
    const candidates = tokenCandidates(tokens);
    if (candidates.length === 0) {
      return null;
    }
    let last: Response | null = null;
    for (const token of candidates) {
      const res = await fetch(input, {
        ...init,
        headers: withBearer(init.headers, token),
      });
      if (res.status !== 401 && res.status !== 403) {
        return res;
      }
      last = res;
    }
    return last;
  };

  const first = await run(false);
  if (first === null) {
    throw new Error('Not authenticated');
  }
  if (first.status !== 401 && first.status !== 403) {
    return first;
  }

  const second = await run(true);
  return second ?? first;
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
  const res = await authorizedFetch(`${base}/voice-jobs`, {
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
  const res = await authorizedFetch(`${base}/voice-jobs/${encodeURIComponent(jobId)}`, {
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
  const res = await authorizedFetch(`${base}/movements`, {
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
    const hint = res.status === 401 || res.status === 403
      ? ' (check presigned URL expiry or Content-Type match with API)'
      : '';
    const detail = await res.text().catch(() => '');
    const trimmed = detail.replace(/\s+/g, ' ').slice(0, 200);
    throw new Error(
      `S3 upload failed: HTTP ${res.status}${hint}${trimmed ? ` — ${trimmed}` : ''}`
    );
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
