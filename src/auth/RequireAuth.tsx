import { useLayoutEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { IonContent, IonPage, IonSpinner } from '@ionic/react';
import { useAuth } from './AuthContext';

/**
 * Avoid <Redirect /> here: Ionic Router's Lifecycle + Redirect can cause an infinite replace loop.
 */
export default function RequireAuth({ children }: { children: React.ReactNode }): React.ReactElement {
  const history = useHistory();
  const location = useLocation();
  const { isLoading, isAuthenticated } = useAuth();

  useLayoutEffect(() => {
    if (isLoading || isAuthenticated) {
      return;
    }
    if (location.pathname === '/login') {
      return;
    }
    history.replace({ pathname: '/login', state: { from: location } });
  }, [isLoading, isAuthenticated, history, location]);

  if (isLoading) {
    return (
      <IonPage>
        <IonContent className="ion-padding ion-text-center feria-route-loading">
          <IonSpinner name="crescent" />
        </IonContent>
      </IonPage>
    );
  }

  if (!isAuthenticated) {
    return (
      <IonPage>
        <IonContent className="ion-padding ion-text-center feria-route-loading">
          <IonSpinner name="crescent" />
        </IonContent>
      </IonPage>
    );
  }

  return <>{children}</>;
}