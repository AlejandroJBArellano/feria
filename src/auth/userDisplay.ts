/**
 * Display names: prefer Cognito / ID token name, then humanized email local-part (works without profile scope).
 */

export type UserDisplayInput = {
  name?: string;
  email?: string;
  username: string;
  provider: string;
};

/** Lambda fallback email — never use as a person's name */
export function isSyntheticFeriaEmail(email: string): boolean {
  return email.trim().toLowerCase().endsWith('@users.local');
}

/** Cognito sub or UUID-shaped local-part — not a display name */
export function isUuidLikeLocalPart(local: string): boolean {
  const s = local.trim();
  if (!s) {
    return false;
  }
  const compact = s.replace(/-/g, '').toLowerCase();
  if (/^[0-9a-f]{32}$/.test(compact)) {
    return true;
  }
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}

export function isSyntheticOrUuidEmail(email: string): boolean {
  const e = email.trim();
  if (!e.includes('@')) {
    return false;
  }
  if (isSyntheticFeriaEmail(e)) {
    return true;
  }
  const local = e.split('@')[0] ?? '';
  return isUuidLikeLocalPart(local);
}

/** Humanized UUID split into "words" (legacy bad data in Dynamo) */
export function looksLikeUuidAsDisplayName(s: string): boolean {
  const hex = s.replace(/[^0-9a-f]/gi, '');
  return hex.length === 32 && /^[0-9a-f]+$/i.test(hex);
}

/** Match backend placeholder detection so UI never shows generic labels */
export function isPlaceholderDisplayName(s: string | undefined | null): boolean {
  if (s == null || !String(s).trim()) {
    return true;
  }
  const t = String(s).trim().toLowerCase();
  const bad = new Set([
    'usuario',
    'usuario feria',
    'nombre feria',
    'usuario de google',
    'user',
    'guest',
    'test',
  ]);
  if (bad.has(t)) {
    return true;
  }
  if (/^(google_|facebook_|signinwithapple_)/i.test(t)) {
    return true;
  }
  if (looksLikeUuidAsDisplayName(s)) {
    return true;
  }
  return false;
}

export function humanizeEmailLocalPart(email: string): string {
  if (!email?.trim() || isSyntheticOrUuidEmail(email)) {
    return '';
  }
  const local = email.split('@')[0]?.trim() ?? '';
  if (!local) {
    return '';
  }
  const noPlus = local.replace(/\+.*$/, '');
  const parts = noPlus.replace(/[._-]/g, ' ').split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return noPlus.charAt(0).toUpperCase() + noPlus.slice(1).toLowerCase();
  }
  return parts
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join(' ');
}

export function getUserDisplayLabel(user: UserDisplayInput | null | undefined): string {
  if (!user) {
    return 'Usuario';
  }

  const rawName = user.name?.trim();
  if (rawName && !isPlaceholderDisplayName(rawName)) {
    return rawName;
  }

  const email = user.email?.trim();
  if (email) {
    if (isSyntheticOrUuidEmail(email)) {
      return 'Usuario';
    }
    const fromHuman = humanizeEmailLocalPart(email);
    if (fromHuman) {
      return fromHuman;
    }
    const at = email.indexOf('@');
    if (at > 0) {
      return email.slice(0, at);
    }
    return email;
  }

  return 'Usuario';
}

/** Prefer Dynamo Users.name (GET /profile) when present and non-placeholder */
export function resolveDisplayNameForUi(
  user: UserDisplayInput | null | undefined,
  serverName: string | null | undefined
): string {
  const s = serverName?.trim();
  if (s && !isPlaceholderDisplayName(s)) {
    return s;
  }
  return getUserDisplayLabel(user);
}
