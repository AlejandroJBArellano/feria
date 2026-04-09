const STORAGE_KEY = 'feria_onboarding_complete';

/**
 * Whether the user finished the onboarding flow (stub or full profile later).
 */
export function isOnboardingComplete(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

/**
 * Mark onboarding as done and persist for future app versions that collect profile data.
 */
export function markOnboardingComplete(): void {
  try {
    localStorage.setItem(STORAGE_KEY, '1');
  } catch {
    /* ignore quota / private mode */
  }
}

/**
 * Align local stub with server `isOnboardingComplete` (Users table) so routing matches DynamoDB.
 */
export function syncOnboardingFlagFromServer(serverComplete: boolean): void {
  try {
    if (serverComplete) {
      localStorage.setItem(STORAGE_KEY, '1');
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    /* ignore */
  }
}
