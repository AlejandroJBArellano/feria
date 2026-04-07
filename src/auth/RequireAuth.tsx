import { Redirect } from 'react-router-dom';
import { IonContent, IonPage, IonSpinner } from '@ionic/react';
import { useAuth } from './AuthContext';

export default function RequireAuth({ children }: { children: React.ReactNode }): React.ReactElement {
  const { isLoading, isAuthenticated } = useAuth();

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
    return <Redirect to="/login" />;
  }

  return <>{children}</>;
}