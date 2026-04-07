import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { fetchAuthSession, getCurrentUser, signInWithRedirect, signOut } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import { isCognitoConfigured } from './configureAmplify';

type AuthUser = {
  username: string;
  userId: string;
  email?: string;
};

type AuthContextValue = {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: AuthUser | null;
  signIn: () => Promise<void>;
  signOutUser: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  const refreshSession = useCallback(async () => {
    if (!isCognitoConfigured) {
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const [currentUser, session] = await Promise.all([getCurrentUser(), fetchAuthSession()]);
      const emailClaim = session.tokens?.idToken?.payload?.email;
      const email = typeof emailClaim === 'string' ? emailClaim : undefined;

      setUser({
        username: currentUser.username,
        userId: currentUser.userId,
        email
      });
      setIsAuthenticated(true);
    } catch {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signIn = useCallback(async () => {
    await signInWithRedirect();
  }, []);

  const signOutUser = useCallback(async () => {
    await signOut();
    await refreshSession();
  }, [refreshSession]);

  useEffect(() => {
    void refreshSession();

    const unsubscribe = Hub.listen('auth', ({ payload }) => {
      const authEvent = payload.event;
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