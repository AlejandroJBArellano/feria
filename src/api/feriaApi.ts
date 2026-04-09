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
  purpose?: 'movement' | 'onboarding';
  onboardingStep?: number;
};

export type CreateVoiceJobOptions = {
  contentType?: string;
  purpose?: 'movement' | 'onboarding';
  onboardingStep?: number;
};

export async function createVoiceJob(
  contentTypeOrOpts?: string | CreateVoiceJobOptions
): Promise<VoiceJobCreateResponse> {
  const base = apiBase();
  if (!base) throw new Error('VITE_FERIA_API_URL is not set');
  const opts: CreateVoiceJobOptions =
    typeof contentTypeOrOpts === 'string' || contentTypeOrOpts === undefined
      ? { contentType: contentTypeOrOpts }
      : contentTypeOrOpts;
  const body: Record<string, unknown> = {};
  if (opts.contentType) {
    body.contentType = opts.contentType;
  }
  if (opts.purpose === 'onboarding' && opts.onboardingStep !== undefined) {
    body.purpose = 'onboarding';
    body.onboardingStep = opts.onboardingStep;
  }
  const res = await authorizedFetch(`${base}/voice-jobs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
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
  purpose?: 'movement' | 'onboarding';
  movementId: string | null;
  movementIds?: string[];
  movementCount?: number;
  onboardingStep?: number;
  onboardingSummary?: string | null;
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

export type ManualMovementInput = {
  kind: 'ingreso' | 'gasto';
  amount: number;
  concept: string;
  movementDate?: string | null;
};

export type ChatConversationSummary = {
  conversationId: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function listChatConversations(): Promise<ChatConversationSummary[]> {
  const base = apiBase();
  if (!base) throw new Error('VITE_FERIA_API_URL is not set');
  const res = await authorizedFetch(`${base}/chat/conversations`, {
    method: 'GET',
    headers: {},
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `listChatConversations failed: ${res.status}`);
  }
  const data = (await res.json()) as { conversations?: ChatConversationSummary[] };
  return data.conversations ?? [];
}

export type ChatMessageRow = {
  messageId: string;
  role: string;
  content: string;
  createdAt: string;
};

export async function listChatMessages(
  conversationId: string,
  options?: { limit?: number; cursor?: string | null }
): Promise<{ messages: ChatMessageRow[]; nextCursor: string | null }> {
  const base = apiBase();
  if (!base) throw new Error('VITE_FERIA_API_URL is not set');
  const params = new URLSearchParams();
  if (options?.limit != null) {
    params.set('limit', String(options.limit));
  }
  if (options?.cursor) {
    params.set('cursor', options.cursor);
  }
  const q = params.toString();
  const path = `${base}/chat/conversations/${encodeURIComponent(conversationId)}/messages`;
  const res = await authorizedFetch(q ? `${path}?${q}` : path, {
    method: 'GET',
    headers: {},
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `listChatMessages failed: ${res.status}`);
  }
  return res.json() as Promise<{ messages: ChatMessageRow[]; nextCursor: string | null }>;
}

export type SendChatMessageResponse = {
  conversationId: string;
  reply: string;
};

/**
 * POST /chat/messages — one Bedrock turn (non-streaming). Requires Cognito Bearer token.
 */
export async function sendChatMessage(
  message: string,
  options?: { conversationId?: string | null; maxTokens?: number; temperature?: number }
): Promise<SendChatMessageResponse> {
  const base = apiBase();
  if (!base) throw new Error('VITE_FERIA_API_URL is not set');
  const body: Record<string, unknown> = { message };
  if (options?.conversationId) {
    body.conversationId = options.conversationId;
  }
  if (options?.maxTokens != null) {
    body.maxTokens = options.maxTokens;
  }
  if (options?.temperature != null) {
    body.temperature = options.temperature;
  }
  const res = await authorizedFetch(`${base}/chat/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `sendChatMessage failed: ${res.status}`);
  }
  return res.json() as Promise<SendChatMessageResponse>;
}

export type EngagementAchievementRow = {
  id: string;
  title: string;
  description: string;
  axis: 'clarity' | 'control';
  unlocked: boolean;
  unlockedAt: string | null;
  eligible: boolean;
};

export type EngagementActiveReminder = {
  ruleId: string;
  message: string;
  ctaLabel: string;
  ctaPath: string;
};

export type EngagementDashboard = {
  streakDays: number;
  hasMovementToday: boolean;
  movementCountLast7d: number;
  movementCountPrev7d: number;
  registrationWeekTrend: 'up' | 'down' | 'same';
  hasUsedTutor: boolean;
  impulseIndex: number;
  dailyInsight?: string;
};

export type EngagementSummary = {
  achievements: EngagementAchievementRow[];
  axes: { clarityScore: number; controlScore: number };
  /** Gamified pulse: streak, week-over-week activity, impulse index. Omitted if API is older. */
  dashboard?: EngagementDashboard;
  activeReminder: EngagementActiveReminder | null;
};

/** GET /engagement/summary — achievements, scores, optional in-app reminder. */
export async function getEngagementSummary(): Promise<EngagementSummary> {
  const base = apiBase();
  if (!base) throw new Error('VITE_FERIA_API_URL is not set');
  const res = await authorizedFetch(`${base}/engagement/summary`, {
    method: 'GET',
    headers: {},
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `getEngagementSummary failed: ${res.status}`);
  }
  return res.json() as Promise<EngagementSummary>;
}

/** POST /engagement/reminders/dismiss — 24h cooldown per ruleId; sets tutor nudge timestamp when rule is remind_try_tutor. */
export async function dismissEngagementReminder(ruleId: string): Promise<void> {
  const base = apiBase();
  if (!base) throw new Error('VITE_FERIA_API_URL is not set');
  const res = await authorizedFetch(`${base}/engagement/reminders/dismiss`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ruleId }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `dismissEngagementReminder failed: ${res.status}`);
  }
}

export async function createManualMovement(input: ManualMovementInput): Promise<{ movementId: string }> {
  const base = apiBase();
  if (!base) throw new Error('VITE_FERIA_API_URL is not set');
  const res = await authorizedFetch(`${base}/ingest`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `createManualMovement failed: ${res.status}`);
  }
  return res.json() as Promise<{ movementId: string }>;
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

/**
 * POST /profile/sync — creates DynamoDB Users row for Cognito sub if missing (signup alone does not).
 * Call after login so `context` and tutor profile have a stable row.
 */
export type UserProfileResponse = {
  userId: string;
  email: string | null;
  name: string | null;
  picture: string | null;
  context: string | null;
  isOnboardingComplete: boolean;
  hasUserRow: boolean;
};

/** GET /profile — Users row: context + isOnboardingComplete (Cognito JWT). */
export async function getUserProfile(): Promise<UserProfileResponse> {
  const base = apiBase();
  if (!base) throw new Error('VITE_FERIA_API_URL is not set');
  const res = await authorizedFetch(`${base}/profile`, {
    method: 'GET',
    headers: {},
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `getUserProfile failed: ${res.status}`);
  }
  return res.json() as Promise<UserProfileResponse>;
}

export async function syncUserProfile(): Promise<{ ok: boolean; created: boolean }> {
  const base = apiBase();
  if (!base) throw new Error('VITE_FERIA_API_URL is not set');
  const res = await authorizedFetch(`${base}/profile/sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `syncUserProfile failed: ${res.status}`);
  }
  return res.json() as Promise<{ ok: boolean; created: boolean }>;
}

/** Ensures Cognito user has a Users row (call after auth, before onboarding voice). */
export async function ensureUserProfileSynced(): Promise<{ ok: boolean; created: boolean }> {
  return syncUserProfile();
}

/** POST /onboarding/complete — Bedrock fuses voice answers into Users.context */
export async function completeOnboarding(): Promise<{ ok: boolean; contextLength: number }> {
  const base = apiBase();
  if (!base) throw new Error('VITE_FERIA_API_URL is not set');
  const res = await authorizedFetch(`${base}/onboarding/complete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `completeOnboarding failed: ${res.status}`);
  }
  return res.json() as Promise<{ ok: boolean; contextLength: number }>;
}
