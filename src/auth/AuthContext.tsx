import {
    fetchAuthSession,
    fetchUserAttributes,
    getCurrentUser,
    signInWithRedirect,
    signOut
} from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { isCognitoConfigured } from './configureAmplify';

const authDebugEnabled = import.meta.env.VITE_AUTH_DEBUG === 'true';

type LogMeta = Record<string, unknown>;

function authLog(message: string, meta?: LogMeta): void {
  if (!authDebugEnabled) {
    return;
  }

  const timestamp = new Date().toISOString();
  if (meta) {
    console.info(`[auth][${timestamp}] ${message}`, meta);
    return;
  }

  console.info(`[auth][${timestamp}] ${message}`);
}

function parseEpochClaim(value: unknown): number | undefined {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return undefined;
}

function parseStringClaim(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value : undefined;
}

function inferProvider(username: string, identitiesClaim: unknown): string {
  if (typeof identitiesClaim === 'string') {
    try {
      const parsed = JSON.parse(identitiesClaim) as Array<{ providerName?: unknown }>;
      const providerName = parsed[0]?.providerName;
      if (typeof providerName === 'string' && providerName.length > 0) {
        return providerName;
      }
    } catch {
      // Ignore malformed identities claim and fallback below.
    }
  }

  if (username.startsWith('google_')) {
    return 'Google';
  }

  if (username.startsWith('facebook_')) {
    return 'Facebook';
  }

  if (username.startsWith('signinwithapple_')) {
    return 'Apple';
  }

  return 'Cognito';
}

type AuthUser = {
  username: string;
  userId: string;
  name?: string;
  givenName?: string;
  familyName?: string;
  email?: string;
  picture?: string;
  provider: string;
};

type AuthContextValue = {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: AuthUser | null;
  signIn: (provider?: 'Google' | 'Amazon' | 'Apple' | 'Facebook') => Promise<void>;
  signOutUser: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  const refreshSession = useCallback(async () => {
    const queryParams = new URLSearchParams(window.location.search);
    const oauthError = queryParams.get('error');
    const oauthErrorDescription = queryParams.get('error_description');

    if (!isCognitoConfigured) {
      authLog('refreshSession skipped: Cognito not configured');
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      return;
    }

    authLog('refreshSession started', {
      path: window.location.pathname,
      hasAuthCode: window.location.search.includes('code='),
      oauthError,
      oauthErrorDescription
    });

    setIsLoading(true);

    try {
      const [currentUser, session, attributes] = await Promise.all([
        getCurrentUser(),
        fetchAuthSession(),
        fetchUserAttributes()
      ]);

      const idTokenPayload = session.tokens?.idToken?.payload;
      const email =
        attributes.email ??
        parseStringClaim(idTokenPayload?.email) ??
        parseStringClaim(idTokenPayload?.['cognito:email_alias']);
      const givenName =
        attributes.given_name ?? parseStringClaim(idTokenPayload?.given_name) ?? undefined;
      const familyName =
        attributes.family_name ?? parseStringClaim(idTokenPayload?.family_name) ?? undefined;
      const fullNameFromParts = [givenName, familyName].filter(Boolean).join(' ');
      const name =
        attributes.name ??
        parseStringClaim(idTokenPayload?.name) ??
        (fullNameFromParts || undefined);
      const picture = attributes.picture ?? parseStringClaim(idTokenPayload?.picture) ?? undefined;
      const provider = inferProvider(
        currentUser.username,
        idTokenPayload?.identities ?? idTokenPayload?.identities
      );
      const idTokenExp = parseEpochClaim(session.tokens?.idToken?.payload?.exp);
      const accessTokenExp = parseEpochClaim(session.tokens?.accessToken?.payload?.exp);

      setUser({
        username: currentUser.username,
        userId: currentUser.userId,
        name,
        givenName,
        familyName,
        email,
        picture,
        provider
      });
      setIsAuthenticated(true);

      authLog('session active', {
        userId: currentUser.userId,
        username: currentUser.username,
        name,
        email,
        provider,
        idTokenExpiresAt: idTokenExp ? new Date(idTokenExp * 1000).toISOString() : 'unknown',
        accessTokenExpiresAt: accessTokenExp ? new Date(accessTokenExp * 1000).toISOString() : 'unknown'
      });
    } catch {
      setUser(null);
      setIsAuthenticated(false);
      authLog('no active session found');
    } finally {
      setIsLoading(false);
      authLog('refreshSession finished');
    }
  }, []);

  const signIn = useCallback(async (provider?: 'Google' | 'Amazon' | 'Apple' | 'Facebook') => {
    authLog('signIn requested', {
      provider: provider ?? 'CognitoHostedUI',
      origin: window.location.origin
    });

    try {
      if (provider) {
        await signInWithRedirect({ provider });
        return;
      }

      await signInWithRedirect();
    } catch (error) {
      authLog('signIn failed', {
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }, []);

  const signOutUser = useCallback(async () => {
    authLog('signOut requested');
    await signOut();
    authLog('signOut completed');
    await refreshSession();
  }, [refreshSession]);

  useEffect(() => {
    authLog('AuthProvider mounted');
    void refreshSession();

    const unsubscribe = Hub.listen('auth', (capsule: { payload: { event: string } }) => {
      const authEvent = capsule.payload.event;
      authLog('auth hub event', {
        event: authEvent
      });

      if (authEvent === 'signedIn' || authEvent === 'signedOut' || authEvent === 'tokenRefresh') {
        void refreshSession();
      }
    });

    return unsubscribe;
  }, [refreshSession]);

  const value = useMemo(
    () => ({
      isLoading,
      isAuthenticated,
      user,
      signIn,
      signOutUser,
      refreshSession
    }),
    [isLoading, isAuthenticated, user, signIn, signOutUser, refreshSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}