const STORAGE_KEY = 'feria_pending_voice_job_id';

export function getPendingVoiceJobId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY)?.trim() || null;
  } catch {
    return null;
  }
}

export function setPendingVoiceJobId(jobId: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, jobId);
  } catch {
    /* ignore quota / private mode */
  }
}

export function clearPendingVoiceJobId(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore quota / private mode */
  }
}