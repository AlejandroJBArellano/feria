import { IonContent, IonPage, IonSpinner } from '@ionic/react';
import { Redirect } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  getUserProfile,
  isFeriaApiConfigured,
  syncUserProfile,
} from '../api/feriaApi';
import { useAuth } from '../auth/AuthContext';
import {
  isOnboardingComplete,
  syncOnboardingFlagFromServer,
} from '../onboarding/onboardingStorage';

type RouteTarget = 'loading' | 'onboarding' | 'home';

/**
 * Resolves `/` to login first, then onboarding or home using Users table when API is configured.
 */
const BootstrapRedirect: React.FC = () => {
  const { isLoading, isAuthenticated } = useAuth();
  const [target, setTarget] = useState<RouteTarget>('loading');

  useEffect(() => {
    if (isLoading) {
      return;
    }
    if (!isAuthenticated) {
      setTarget('loading');
      return;
    }
    if (!isFeriaApiConfigured()) {
      setTarget(isOnboardingComplete() ? 'home' : 'onboarding');
      return;
    }

    let cancelled = false;
    setTarget('loading');
    void (async () => {
      try {
        await syncUserProfile();
        const p = await getUserProfile();
        if (cancelled) {
          return;
        }
        syncOnboardingFlagFromServer(p.isOnboardingComplete);
        setTarget(p.isOnboardingComplete ? 'home' : 'onboarding');
      } catch {
        if (!cancelled) {
          setTarget(isOnboardingComplete() ? 'home' : 'onboarding');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isLoading, isAuthenticated]);

  if (isLoading || (isAuthenticated && target === 'loading')) {
    return (
      <IonPage className="bootstrap-redirect-page">
        <IonContent className="ion-padding ion-text-center bootstrap-redirect-content">
          <IonSpinner name="crescent" />
        </IonContent>
      </IonPage>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  if (target === 'onboarding') {
    return <Redirect to="/onboarding" />;
  }

  return <Redirect to="/home" />;
};

export default BootstrapRedirect;
